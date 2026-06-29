// Preflight: verify DB connectivity (IAM auth), pgvector availability, and a real
// Titan embedding call. Usage: node --env-file=.env.local scripts/preflight.mjs
import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import { createPool } from './db.mjs';

const EMBED_MODEL_ID = process.env.BEDROCK_EMBED_MODEL_ID ?? 'amazon.titan-embed-text-v2:0';
const EMBED_DIM = Number(process.env.EMBED_DIM ?? 1024);

let ok = true;

// 1) Database
try {
  const pool = createPool();
  const v = await pool.query('SELECT version()');
  console.log('✓ DB connected:', v.rows[0].version.split(',')[0]);
  const ext = await pool.query(
    `SELECT installed_version FROM pg_available_extensions WHERE name = 'vector'`
  );
  if (ext.rowCount === 0) {
    console.log('✗ pgvector NOT available on this cluster');
    ok = false;
  } else {
    console.log(`✓ pgvector available (installed: ${ext.rows[0].installed_version ?? 'not yet'})`);
  }
  await pool.end();
} catch (e) {
  console.log('✗ DB check failed:', e.message);
  ok = false;
}

// 2) Bedrock Titan embedding (region = BEDROCK_REGION)
try {
  const bedrock = new BedrockRuntimeClient({
    region: process.env.BEDROCK_REGION ?? process.env.AWS_REGION,
  });
  const res = await bedrock.send(
    new InvokeModelCommand({
      modelId: EMBED_MODEL_ID,
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify({ inputText: 'hello world', dimensions: EMBED_DIM, normalize: true }),
    })
  );
  const parsed = JSON.parse(new TextDecoder().decode(res.body));
  console.log(`✓ Bedrock Titan embedding OK (dim ${parsed.embedding.length}) in ${process.env.BEDROCK_REGION}`);
} catch (e) {
  console.log('✗ Bedrock Titan check failed:', e.name, '-', e.message);
  ok = false;
}

console.log(ok ? '\nPREFLIGHT: PASS' : '\nPREFLIGHT: FAIL');
process.exit(ok ? 0 : 1);
