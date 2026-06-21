// Seed the clause_library (with Bedrock embeddings) + a demo org/users.
// Usage: node --env-file=.env.local scripts/seed.mjs
import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from '@aws-sdk/client-bedrock-runtime';
import { CLAUSE_PATTERNS } from '../db/clause-patterns.mjs';
import { createPool } from './db.mjs';

const EMBED_MODEL_ID = process.env.BEDROCK_EMBED_MODEL_ID ?? 'amazon.titan-embed-text-v2:0';
const EMBED_DIM = Number(process.env.EMBED_DIM ?? 1024);

const bedrock = new BedrockRuntimeClient({
  region: process.env.BEDROCK_REGION ?? process.env.AWS_REGION,
});

async function embed(text) {
  const res = await bedrock.send(
    new InvokeModelCommand({
      modelId: EMBED_MODEL_ID,
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify({ inputText: text.slice(0, 8000), dimensions: EMBED_DIM, normalize: true }),
    })
  );
  const parsed = JSON.parse(new TextDecoder().decode(res.body));
  return parsed.embedding;
}

const toVector = (arr) => `[${arr.join(',')}]`;

const client = createPool();

try {
  // ── Demo org + users (matches the dashboard's people) ──
  const { rows: orgRows } = await client.query(
    `INSERT INTO organizations (name, plan, seats) VALUES ($1,'team',5) RETURNING id`,
    ['Acme SMB']
  );
  const orgId = orgRows[0].id;

  const people = [
    ['maya@acme.test', 'Maya Chen', 'admin'],
    ['jordan@acme.test', 'Jordan Smith', 'member'],
    ['alex@acme.test', 'Alex Rivera', 'member'],
  ];
  for (const [email, name, role] of people) {
    await client.query(
      `INSERT INTO users (org_id, email, name, role) VALUES ($1,$2,$3,$4)
       ON CONFLICT (email) DO NOTHING`,
      [orgId, email, name, role]
    );
  }
  console.log(`✓ Seeded org "Acme SMB" (${orgId}) + ${people.length} users`);

  // ── Clause library with embeddings ──
  console.log(`Embedding ${CLAUSE_PATTERNS.length} patterns via ${EMBED_MODEL_ID} (dim ${EMBED_DIM})…`);
  let n = 0;
  for (const p of CLAUSE_PATTERNS) {
    const vec = toVector(await embed(p.example_text));
    await client.query(
      `INSERT INTO clause_library
         (pattern_name, clause_type, risk_level, example_text, explanation, safer_version, embedding)
       VALUES ($1,$2,$3,$4,$5,$6,$7::vector)`,
      [p.pattern_name, p.clause_type, p.risk_level, p.example_text, p.explanation, p.safer_version, vec]
    );
    n++;
    process.stdout.write(`\r  ${n}/${CLAUSE_PATTERNS.length} patterns embedded`);
  }
  console.log(`\n✓ Seeded clause_library with ${n} patterns`);
  console.log(`\nDemo org id (use as ORG_ID for the app): ${orgId}`);
} catch (err) {
  console.error('\n✗ Seed failed:', err.message);
  process.exit(1);
} finally {
  await client.end();
}
