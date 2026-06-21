import { NextRequest, NextResponse } from 'next/server';
import { assembleReport } from '@/lib/scoring';

export const runtime = 'nodejs';

// GET /api/report?contractId=… -> full ContractReport for the report page.
export async function GET(req: NextRequest) {
  try {
    const contractId = req.nextUrl.searchParams.get('contractId');
    if (!contractId) {
      return NextResponse.json({ error: 'contractId is required.' }, { status: 400 });
    }
    const report = await assembleReport(contractId);
    if (!report) {
      return NextResponse.json({ error: 'Contract not found.' }, { status: 404 });
    }
    return NextResponse.json(report);
  } catch (err) {
    console.error('[report]', err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
