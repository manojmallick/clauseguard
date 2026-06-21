import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { analyzeClause } from '@/lib/rag';
import { computeOverallRisk, type RiskCounts } from '@/lib/scoring';
import { getTenantContext } from '@/lib/context';
import { logAction } from '@/lib/audit';

export const runtime = 'nodejs';
export const maxDuration = 120;

// POST { contractId } — run the RAG pipeline over every clause, store findings,
// compute overall risk. Reuses each clause's stored embedding (no re-embedding).
export async function POST(req: NextRequest) {
  try {
    const { orgId, userId } = await getTenantContext();
    const { contractId } = (await req.json()) as { contractId?: string };
    if (!contractId) {
      return NextResponse.json({ error: 'contractId is required.' }, { status: 400 });
    }

    await query(`UPDATE contracts SET status = 'analyzing' WHERE id = $1 AND org_id = $2`, [
      contractId,
      orgId,
    ]);

    // Fresh run: clear prior findings for this contract.
    await query(`DELETE FROM findings WHERE contract_id = $1`, [contractId]);

    const clauses = await query<{ id: string; clause_text: string; vec: string }>(
      `SELECT id, clause_text, embedding::text AS vec FROM clauses WHERE contract_id = $1 ORDER BY clause_number`,
      [contractId]
    );

    const counts: RiskCounts = { high: 0, medium: 0, low: 0, abstained: 0 };

    for (const clause of clauses.rows) {
      const a = await analyzeClause(clause.clause_text, orgId, contractId, clause.vec);

      await query(
        `INSERT INTO findings
           (contract_id, clause_id, matched_pattern, risk_level, explanation,
            redline_suggestion, grounded_on, confidence, abstained, note, prior_exposure)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
        [
          contractId,
          clause.id,
          a.matchedPatternId ?? null,
          a.abstained ? null : a.riskLevel ?? null,
          a.abstained ? null : a.explanation ?? null,
          a.abstained ? null : a.redline ?? null,
          a.abstained ? null : a.groundedOnPattern ?? null,
          a.abstained ? null : a.confidence ?? null,
          a.abstained ?? false,
          a.note ?? null,
          a.priorExposure ? JSON.stringify(a.priorExposure) : null,
        ]
      );

      if (a.abstained) counts.abstained++;
      else if (a.riskLevel === 'high') counts.high++;
      else if (a.riskLevel === 'medium') counts.medium++;
      else if (a.riskLevel === 'low') counts.low++;
    }

    const overallRisk = computeOverallRisk(counts);
    await query(`UPDATE contracts SET overall_risk = $1, status = 'complete' WHERE id = $2`, [
      overallRisk,
      contractId,
    ]);

    await logAction(orgId, userId, 'analyzed', contractId);

    return NextResponse.json({ contractId, overallRisk, counts });
  } catch (err) {
    console.error('[analyze]', err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
