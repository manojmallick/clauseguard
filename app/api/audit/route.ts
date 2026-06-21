import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getTenantContext } from '@/lib/context';
import type { AuditEntry } from '@/lib/data';

export const runtime = 'nodejs';

// GET -> AuditEntry[] (newest first) for the dashboard compliance log.
export async function GET() {
  try {
    const { orgId } = await getTenantContext();
    const rows = await query<{
      id: string;
      user_name: string | null;
      action: string;
      detail: string | null;
      resource_id: string | null;
      timestamp: string;
    }>(
      `SELECT a.id, COALESCE(u.name, 'System') AS user_name, a.action, a.detail, a.resource_id,
              a.timestamp,
              ct.filename AS resource_filename
       FROM audit_log a
       LEFT JOIN users u ON u.id = a.user_id
       LEFT JOIN contracts ct ON ct.id = a.resource_id
       WHERE a.org_id = $1
       ORDER BY a.timestamp DESC
       LIMIT 50`,
      [orgId]
    );

    const entries: AuditEntry[] = rows.rows.map((r: Record<string, unknown>) => ({
      id: r.id as string,
      user: (r.user_name as string) ?? 'System',
      action: (r.action as AuditEntry['action']) ?? 'uploaded',
      filename: (r.resource_filename as string) ?? (r.detail as string) ?? '—',
      timestamp: new Date(r.timestamp as string).toISOString(),
    }));

    return NextResponse.json({ entries });
  } catch (err) {
    console.error('[audit]', err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
