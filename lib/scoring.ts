// ─────────────────────────────────────────────────────────────
// Risk aggregation + report assembly. Reads clauses + findings from Aurora
// and produces the exact ContractReport shape the UI consumes (lib/data.ts).
// ─────────────────────────────────────────────────────────────
import { query } from './db';
import type { Finding, ContractReport } from './data';

export interface RiskCounts {
  high: number;
  medium: number;
  low: number;
  abstained: number;
}

export function computeCounts(findings: Finding[]): RiskCounts {
  const counts: RiskCounts = { high: 0, medium: 0, low: 0, abstained: 0 };
  for (const f of findings) {
    if (f.abstained) counts.abstained++;
    else if (f.riskLevel === 'high') counts.high++;
    else if (f.riskLevel === 'medium') counts.medium++;
    else if (f.riskLevel === 'low') counts.low++;
  }
  return counts;
}

/** Overall contract risk: any HIGH -> high, any MEDIUM -> medium, else low. */
export function computeOverallRisk(counts: RiskCounts): 'low' | 'medium' | 'high' {
  if (counts.high > 0) return 'high';
  if (counts.medium > 0) return 'medium';
  return 'low';
}

interface JoinedRow {
  clause_id: string;
  clause_number: number;
  clause_text: string;
  clause_type: string;
  risk_level: string | null;
  explanation: string | null;
  redline_suggestion: string | null;
  grounded_on: string | null;
  confidence: string | null;
  abstained: boolean | null;
  note: string | null;
  prior_exposure: Finding['priorExposure'] | null;
}

/** Assemble a full ContractReport for the UI from stored clauses + findings. */
export async function assembleReport(contractId: string): Promise<ContractReport | null> {
  const meta = await query<{ filename: string; contract_type: string; overall_risk: string | null }>(
    `SELECT filename, contract_type, overall_risk FROM contracts WHERE id = $1`,
    [contractId]
  );
  if (meta.rowCount === 0) return null;

  const rows = await query<JoinedRow>(
    `SELECT c.id AS clause_id, c.clause_number, c.clause_text, c.clause_type,
            f.risk_level, f.explanation, f.redline_suggestion, f.grounded_on,
            f.confidence, f.abstained, f.note, f.prior_exposure
     FROM clauses c
     LEFT JOIN findings f ON f.clause_id = c.id
     WHERE c.contract_id = $1
     ORDER BY c.clause_number`,
    [contractId]
  );

  const findings: Finding[] = rows.rows.map((r) => ({
    clauseId: r.clause_id,
    clauseNumber: r.clause_number,
    clauseType: (r.clause_type as Finding['clauseType']) ?? 'other',
    clauseText: r.clause_text,
    isRisk: !r.abstained && r.risk_level != null,
    abstained: r.abstained ?? undefined,
    note: r.note ?? undefined,
    riskLevel: (r.risk_level as Finding['riskLevel']) ?? undefined,
    explanation: r.explanation ?? undefined,
    redline: r.redline_suggestion ?? undefined,
    groundedOnPattern: r.grounded_on ?? undefined,
    confidence: r.confidence != null ? Number(r.confidence) : undefined,
    priorExposure: r.prior_exposure ?? undefined,
  }));

  const counts = computeCounts(findings);
  const m = meta.rows[0];

  return {
    contractId,
    filename: m.filename,
    contractType: (m.contract_type as ContractReport['contractType']) ?? 'other',
    overallRisk: (m.overall_risk as ContractReport['overallRisk']) ?? computeOverallRisk(counts),
    counts,
    findings,
  };
}
