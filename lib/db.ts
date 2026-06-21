// ─────────────────────────────────────────────────────────────
// Aurora PostgreSQL connection (pgvector-enabled).
// A single pooled client is reused across hot Lambda/Function invocations.
// Works against Aurora Serverless v2 in prod; any Postgres+pgvector in dev.
// ─────────────────────────────────────────────────────────────
import { Pool, type QueryResult, type QueryResultRow } from 'pg';

declare global {
  // eslint-disable-next-line no-var
  var __clauseguardPool: Pool | undefined;
}

function makePool(): Pool {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL is not set. Copy .env.example to .env.local and fill it in.');
  }

  // Aurora terminates TLS with the AWS RDS CA. We require TLS but don't pin the
  // CA here (rejectUnauthorized:false) to keep local + serverless setup simple.
  // Set PGSSLMODE=disable for a plain local Postgres.
  const ssl =
    process.env.PGSSLMODE === 'disable' ? undefined : { rejectUnauthorized: false };

  return new Pool({
    connectionString,
    ssl,
    max: 5,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000,
  });
}

/**
 * Lazily create + reuse the pool. Importing this module must NOT throw when
 * DATABASE_URL is unset (so builds and mock-fallback paths work); the error is
 * raised only when a query actually runs.
 */
export function getPool(): Pool {
  if (!global.__clauseguardPool) global.__clauseguardPool = makePool();
  return global.__clauseguardPool;
}

/** Parameterized query helper. Always use $1, $2… placeholders — never string interpolation. */
export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params: unknown[] = []
): Promise<QueryResult<T>> {
  return getPool().query<T>(text, params as never[]);
}

/** Run a set of statements inside a single ACID transaction (compliance-critical writes). */
export async function withTransaction<T>(fn: (q: typeof query) => Promise<T>): Promise<T> {
  const client = await getPool().connect();
  const scopedQuery = ((text: string, params: unknown[] = []) =>
    client.query(text, params as never[])) as typeof query;
  try {
    await client.query('BEGIN');
    const result = await fn(scopedQuery);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

/** Format a JS number[] as a pgvector literal: [0.1,0.2,...] */
export function toVector(embedding: number[]): string {
  return `[${embedding.join(',')}]`;
}
