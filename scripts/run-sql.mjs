// Run a .sql file against DATABASE_URL. Usage: node --env-file=.env.local scripts/run-sql.mjs db/schema.sql
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import pg from 'pg';

const file = process.argv[2];
if (!file) {
  console.error('Usage: node scripts/run-sql.mjs <path-to.sql>');
  process.exit(1);
}
if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL not set. Copy .env.example to .env.local and fill it in.');
  process.exit(1);
}

const sql = readFileSync(resolve(file), 'utf8');
const ssl = process.env.PGSSLMODE === 'disable' ? undefined : { rejectUnauthorized: false };
const client = new pg.Client({ connectionString: process.env.DATABASE_URL, ssl });

try {
  await client.connect();
  await client.query(sql);
  console.log(`✓ Applied ${file}`);
} catch (err) {
  console.error(`✗ Failed applying ${file}:`, err.message);
  process.exit(1);
} finally {
  await client.end();
}
