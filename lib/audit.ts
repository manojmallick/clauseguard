// Compliance audit trail helper. Every meaningful action gets an immutable row.
import { query } from './db';

export type AuditAction = 'uploaded' | 'analyzed' | 'exported';

export async function logAction(
  orgId: string,
  userId: string | null,
  action: AuditAction,
  resourceId?: string,
  detail?: string
): Promise<void> {
  await query(
    `INSERT INTO audit_log (org_id, user_id, action, resource_id, detail)
     VALUES ($1, $2, $3, $4, $5)`,
    [orgId, userId, action, resourceId ?? null, detail ?? null]
  );
}
