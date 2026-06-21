// ─────────────────────────────────────────────────────────────
// Server-side data access shared by API routes AND server components.
// Each fetcher falls back to mock data (lib/data.ts) when Aurora/Bedrock
// aren't configured yet, so the UI always renders during early dev/demo.
// ─────────────────────────────────────────────────────────────
import { query } from './db';
import { getTenantContext } from './context';
import { assembleReport } from './scoring';
import {
  contracts as mockContracts,
  auditLog as mockAudit,
  mockReport,
  type ContractRow,
  type AuditEntry,
  type ContractReport,
} from './data';

const fmtDate = (d: string | Date) =>
  new Date(d).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });

/** All contracts for the active org (dashboard + recent list). */
export async function listContracts(): Promise<ContractRow[]> {
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
  return rows.rows.map((r) => ({
    id: r.id,
    filename: r.filename,
    contractType: r.contract_type ?? 'other',
    overallRisk: (r.overall_risk as ContractRow['overallRisk']) ?? null,
    counts: { high: Number(r.high), medium: Number(r.medium), low: Number(r.low) },
    uploadedBy: r.uploaded_by ?? '—',
    uploadedAt: fmtDate(r.uploaded_at),
    status: (r.status as ContractRow['status']) ?? 'pending',
  }));
}

/** Compliance audit entries (newest first). */
export async function listAuditEntries(): Promise<AuditEntry[]> {
  const { orgId } = await getTenantContext();
  const rows = await query<{
    id: string;
    user_name: string;
    action: string;
    detail: string | null;
    resource_filename: string | null;
    timestamp: string;
  }>(
    `SELECT a.id, COALESCE(u.name, 'System') AS user_name, a.action, a.detail,
            ct.filename AS resource_filename, a.timestamp
     FROM audit_log a
     LEFT JOIN users u ON u.id = a.user_id
     LEFT JOIN contracts ct ON ct.id = a.resource_id
     WHERE a.org_id = $1
     ORDER BY a.timestamp DESC
     LIMIT 50`,
    [orgId]
  );
  return rows.rows.map((r) => ({
    id: r.id,
    user: r.user_name ?? 'System',
    action: (r.action as AuditEntry['action']) ?? 'uploaded',
    filename: r.resource_filename ?? r.detail ?? '—',
    timestamp: new Date(r.timestamp).toISOString(),
  }));
}

// ── Safe variants for server components: never throw, fall back to mock ──

export async function getContractsOrMock(): Promise<{ data: ContractRow[]; live: boolean }> {
  try {
    const data = await listContracts();
    return { data, live: true };
  } catch {
    return { data: mockContracts, live: false };
  }
}

export async function getAuditOrMock(): Promise<{ data: AuditEntry[]; live: boolean }> {
  try {
    const data = await listAuditEntries();
    return { data, live: true };
  } catch {
    return { data: mockAudit, live: false };
  }
}

export async function getReportOrMock(
  contractId: string
): Promise<{ data: ContractReport | null; live: boolean }> {
  try {
    const data = await assembleReport(contractId);
    if (data) return { data, live: true };
    return { data: mockReport, live: false }; // not found -> show mock so the demo route renders
  } catch {
    return { data: mockReport, live: false };
  }
}
