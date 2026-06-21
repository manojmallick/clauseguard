import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getTenantContext } from '@/lib/context';
import type { ContractRow } from '@/lib/data';

export const runtime = 'nodejs';

// GET -> ContractRow[] for the dashboard + upload "recent contracts" list.
export async function GET() {
  try {
    const { orgId } = await getTenantContext();
    const rows = await query<{
      id: string;
      filename: string;
      contract_type: string;
      overall_risk: string | null;
      status: string;
      uploaded_at: string;
      uploaded_by: string | null;
      high: string;
      medium: string;
      low: string;
    }>(
      `SELECT ct.id, ct.filename, ct.contract_type, ct.overall_risk, ct.status, ct.uploaded_at,
              u.name AS uploaded_by,
              COUNT(*) FILTER (WHERE f.risk_level = 'high')   AS high,
              COUNT(*) FILTER (WHERE f.risk_level = 'medium') AS medium,
              COUNT(*) FILTER (WHERE f.risk_level = 'low')    AS low
       FROM contracts ct
       LEFT JOIN users u ON u.id = ct.uploaded_by
       LEFT JOIN findings f ON f.contract_id = ct.id
       WHERE ct.org_id = $1
       GROUP BY ct.id, u.name
       ORDER BY ct.uploaded_at DESC`,
      [orgId]
    );

    const contracts: ContractRow[] = rows.rows.map((r) => ({
      id: r.id,
      filename: r.filename,
      contractType: r.contract_type ?? 'other',
      overallRisk: (r.overall_risk as ContractRow['overallRisk']) ?? null,
      counts: { high: Number(r.high), medium: Number(r.medium), low: Number(r.low) },
      uploadedBy: r.uploaded_by ?? '—',
      uploadedAt: new Date(r.uploaded_at).toLocaleDateString('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
      }),
      status: (r.status as ContractRow['status']) ?? 'pending',
    }));

    return NextResponse.json({ contracts });
  } catch (err) {
    console.error('[contracts]', err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
