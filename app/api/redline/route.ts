import { NextRequest, NextResponse } from 'next/server';
import { analyzeClause } from '@/lib/rag';
import { getTenantContext } from '@/lib/context';

export const runtime = 'nodejs';
export const maxDuration = 60;

// POST { clauseText } -> on-demand safer-language redline for a single clause.
export async function POST(req: NextRequest) {
  try {
    const { orgId } = await getTenantContext();
    const { clauseText } = (await req.json()) as { clauseText?: string };
    if (!clauseText?.trim()) {
      return NextResponse.json({ error: 'clauseText is required.' }, { status: 400 });
    }
    const a = await analyzeClause(clauseText, orgId);
    return NextResponse.json({
      abstained: a.abstained ?? false,
      riskLevel: a.riskLevel,
      explanation: a.explanation,
      redline: a.redline,
      groundedOnPattern: a.groundedOnPattern,
      confidence: a.confidence,
    });
  } catch (err) {
    console.error('[redline]', err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
