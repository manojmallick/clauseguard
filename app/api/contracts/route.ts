import { NextResponse } from 'next/server';
import { listContracts } from '@/lib/queries';

export const runtime = 'nodejs';

// GET -> ContractRow[] for the dashboard + upload "recent contracts" list.
export async function GET() {
  try {
    const contracts = await listContracts();
    return NextResponse.json({ contracts });
  } catch (err) {
    console.error('[contracts]', err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
