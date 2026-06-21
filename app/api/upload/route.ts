import { NextRequest, NextResponse } from 'next/server';
import { query, toVector } from '@/lib/db';
import { generateEmbedding } from '@/lib/embeddings';
import { extractText, splitClauses, detectContractType } from '@/lib/parse';
import { getTenantContext } from '@/lib/context';
import { logAction } from '@/lib/audit';

export const runtime = 'nodejs';
export const maxDuration = 60;

// POST multipart/form-data with `file`. Parses -> splits -> embeds -> stores clauses.
export async function POST(req: NextRequest) {
  try {
    const { orgId, userId } = await getTenantContext();

    const form = await req.formData();
    const file = form.get('file');
    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'No file uploaded.' }, { status: 400 });
    }
    const filename = file.name || 'contract';
    const buffer = Buffer.from(await file.arrayBuffer());

    const text = await extractText(buffer, filename);
    const clauses = splitClauses(text);
    if (clauses.length === 0) {
      return NextResponse.json({ error: 'No clauses could be extracted from this file.' }, { status: 422 });
    }
    const contractType = detectContractType(text);

    // Insert the contract (analyzing) then its clauses with embeddings.
    const contract = await query<{ id: string }>(
      `INSERT INTO contracts (org_id, uploaded_by, filename, contract_type, status)
       VALUES ($1, $2, $3, $4, 'analyzing') RETURNING id`,
      [orgId, userId, filename, contractType]
    );
    const contractId = contract.rows[0].id;

    for (const c of clauses) {
      const vec = toVector(await generateEmbedding(c.clauseText));
      await query(
        `INSERT INTO clauses (contract_id, clause_number, clause_text, clause_type, embedding)
         VALUES ($1, $2, $3, $4, $5::vector)`,
        [contractId, c.clauseNumber, c.clauseText, c.clauseType, vec]
      );
    }

    await logAction(orgId, userId, 'uploaded', contractId, filename);

    return NextResponse.json({ contractId, filename, contractType, clauseCount: clauses.length });
  } catch (err) {
    console.error('[upload]', err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
