import { NextRequest, NextResponse } from 'next/server';
import { query, toVector } from '@/lib/db';
import { generateEmbedding } from '@/lib/embeddings';
import { SCHEMA_SQL } from '@/lib/schema-sql';
import { CLAUSE_PATTERNS } from '@/lib/clause-patterns';

export const runtime = 'nodejs';
export const maxDuration = 300;

// One-time DB setup, runs from inside Vercel (Aurora is private to Vercel's network).
// Guarded by a shared secret. Applies schema + seeds demo org/users + the clause library.
//   curl -X POST "$URL/api/admin/setup" -H "x-setup-secret: $SETUP_SECRET"
export async function POST(req: NextRequest) {
  const secret = process.env.SETUP_SECRET;
  if (!secret || req.headers.get('x-setup-secret') !== secret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // 1) Schema (drops + recreates; multi-statement simple query)
    await query(SCHEMA_SQL);

    // 2) Demo org + users
    const org = await query<{ id: string }>(
      `INSERT INTO organizations (name, plan, seats) VALUES ($1,'team',5) RETURNING id`,
      ['Acme SMB']
    );
    const orgId = org.rows[0].id;
    for (const [email, name, role] of [
      ['maya@acme.test', 'Maya Chen', 'admin'],
      ['jordan@acme.test', 'Jordan Smith', 'member'],
      ['alex@acme.test', 'Alex Rivera', 'member'],
    ]) {
      await query(
        `INSERT INTO users (org_id, email, name, role) VALUES ($1,$2,$3,$4)
         ON CONFLICT (email) DO NOTHING`,
        [orgId, email, name, role]
      );
    }

    // 3) Clause library with embeddings (throttle-resilient)
    let seeded = 0;
    for (const p of CLAUSE_PATTERNS) {
      const vec = toVector(await embedWithRetry(p.example_text));
      await query(
        `INSERT INTO clause_library
           (pattern_name, clause_type, risk_level, example_text, explanation, safer_version, embedding)
         VALUES ($1,$2,$3,$4,$5,$6,$7::vector)`,
        [p.pattern_name, p.clause_type, p.risk_level, p.example_text, p.explanation, p.safer_version, vec]
      );
      seeded++;
    }

    return NextResponse.json({ ok: true, orgId, patternsSeeded: seeded });
  } catch (err) {
    console.error('[setup]', err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

// Bedrock can throttle on bursts; back off and retry.
async function embedWithRetry(text: string, attempts = 5): Promise<number[]> {
  let delay = 800;
  for (let i = 0; i < attempts; i++) {
    try {
      return await generateEmbedding(text);
    } catch (e) {
      const name = (e as Error).name;
      if (i === attempts - 1 || !/Throttl|TooManyRequests/i.test(name + (e as Error).message)) throw e;
      await new Promise((r) => setTimeout(r, delay));
      delay *= 2;
    }
  }
  throw new Error('unreachable');
}
