// ─────────────────────────────────────────────────────────────
// Tenant context. Real auth is out of scope for the demo; we resolve the
// seeded demo org + its admin user. ORG_ID can pin a specific tenant.
// Swap this for session-derived org/user when auth is added.
// ─────────────────────────────────────────────────────────────
import { query } from './db';

export interface TenantContext {
  orgId: string;
  userId: string;
  userName: string;
}

let cached: TenantContext | null = null;

export async function getTenantContext(): Promise<TenantContext> {
  if (cached) return cached;

  const pinned = process.env.ORG_ID;
  const org = await query<{ id: string }>(
    pinned
      ? `SELECT id FROM organizations WHERE id = $1`
      : `SELECT id FROM organizations ORDER BY created_at LIMIT 1`,
    pinned ? [pinned] : []
  );
  if (org.rowCount === 0) {
    throw new Error('No organization found. Run `pnpm db:seed` first.');
  }
  const orgId = org.rows[0].id;

  const user = await query<{ id: string; name: string }>(
    `SELECT id, name FROM users WHERE org_id = $1 ORDER BY role = 'admin' DESC, created_at LIMIT 1`,
    [orgId]
  );
  if (user.rowCount === 0) throw new Error('No user found for org. Run `pnpm db:seed` first.');

  cached = { orgId, userId: user.rows[0].id, userName: user.rows[0].name };
  return cached;
}
