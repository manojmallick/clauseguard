import { NextResponse } from 'next/server';
import { listAuditEntries } from '@/lib/queries';

export const runtime = 'nodejs';

// GET -> AuditEntry[] (newest first) for the dashboard compliance log.
export async function GET() {
  try {
    const entries = await listAuditEntries();
    return NextResponse.json({ entries });
  } catch (err) {
    console.error('[audit]', err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
