import { NextRequest, NextResponse } from 'next/server';
import { query, toVector } from '@/lib/db';
import { generateEmbedding } from '@/lib/embeddings';
import { SCHEMA_SQL } from '@/lib/schema-sql';
import { CLAUSE_PATTERNS } from '@/lib/clause-patterns';

export const runtime = 'nodejs';
export const maxDuration = 300;

// Idempotent + resumable DB setup, run from inside Vercel (Aurora is private to
// Vercel's network). Guarded by a shared secret. Safe to call repeatedly:
//   - ?reset=1  -> drop & recreate schema (first run)
//   - each call ensures the demo org and seeds any clause-library patterns that
//     aren't present yet, within a time budget. Bedrock throttling just means
//     "call again to continue".
//   curl -X POST "$URL/api/admin/setup?reset=1" -H "x-setup-secret: $SETUP_SECRET"
const TIME_BUDGET_MS = 230_000;

export async function POST(req: NextRequest) {
  const secret = process.env.SETUP_SECRET;
  if (!secret || req.headers.get('x-setup-secret') !== secret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const started = Date.now();

  try {
    const reset = req.nextUrl.searchParams.get('reset') === '1';

    // 1) Schema: on reset, or if the table is missing.
    const exists = await query<{ reg: string | null }>(
      `SELECT to_regclass('public.clause_library') AS reg`
    );
    if (reset || !exists.rows[0].reg) {
      await query(SCHEMA_SQL);
    }

    // 2) Ensure demo org + users.
    let org = await query<{ id: string }>(`SELECT id FROM organizations ORDER BY created_at LIMIT 1`);
    if (org.rowCount === 0) {
      org = await query<{ id: string }>(
        `INSERT INTO organizations (name, plan, seats) VALUES ($1,'team',5) RETURNING id`,
        ['Acme SMB']
      );
      for (const [email, name, role] of [
        ['maya@acme.test', 'Maya Chen', 'admin'],
        ['jordan@acme.test', 'Jordan Smith', 'member'],
        ['alex@acme.test', 'Alex Rivera', 'member'],
      ]) {
        await query(
          `INSERT INTO users (org_id, email, name, role) VALUES ($1,$2,$3,$4)
           ON CONFLICT (email) DO NOTHING`,
          [org.rows[0].id, email, name, role]
        );
      }
    }
    const orgId = org.rows[0].id;

    // 3) Seed only patterns not already present (resumable across calls).
    const have = await query<{ pattern_name: string }>(`SELECT pattern_name FROM clause_library`);
    const present = new Set(have.rows.map((r) => r.pattern_name));
    const missing = CLAUSE_PATTERNS.filter((p) => !present.has(p.pattern_name));

    let seeded = 0;
    for (const p of missing) {
      if (Date.now() - started > TIME_BUDGET_MS) break; // return; caller re-invokes
      const vec = toVector(await embedWithRetry(p.example_text));
      await query(
        `INSERT INTO clause_library
           (pattern_name, clause_type, risk_level, example_text, explanation, safer_version, embedding)
         VALUES ($1,$2,$3,$4,$5,$6,$7::vector)`,
        [p.pattern_name, p.clause_type, p.risk_level, p.example_text, p.explanation, p.safer_version, vec]
      );
      seeded++;
    }

    const total = CLAUSE_PATTERNS.length;
    const nowPresent = present.size + seeded;
    return NextResponse.json({
      ok: true,
      orgId,
      total,
      present: nowPresent,
      seededThisCall: seeded,
      remaining: total - nowPresent,
      done: total - nowPresent === 0,
    });
  } catch (err) {
    console.error('[setup]', err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

// Bedrock throttles new accounts hard; back off patiently with jitter.
async function embedWithRetry(text: string, attempts = 8): Promise<number[]> {
  let delay = 1500;
  for (let i = 0; i < attempts; i++) {
    try {
      return await generateEmbedding(text);
    } catch (e) {
      const msg = `${(e as Error).name} ${(e as Error).message}`;
      const throttled = /throttl|too many requests|rate exceeded|429/i.test(msg);
      if (i === attempts - 1 || !throttled) throw e;
      await new Promise((r) => setTimeout(r, delay + Math.random() * 500));
      delay = Math.min(delay * 2, 20_000);
    }
  }
  throw new Error('unreachable');
}
