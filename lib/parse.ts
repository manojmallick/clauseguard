// ─────────────────────────────────────────────────────────────
// Contract parsing: file bytes -> raw text -> individual clauses.
// PDF via pdf-parse, DOCX via mammoth. Clause splitting is heuristic
// (numbered sections / articles / paragraphs) — good enough to demo and
// the RAG step refines type + risk per clause afterward.
// ─────────────────────────────────────────────────────────────

export type ClauseType = 'liability' | 'termination' | 'ip' | 'payment' | 'renewal' | 'other';
export type ContractType = 'nda' | 'lease' | 'sow' | 'vendor' | 'saas' | 'other';

export interface ExtractedClause {
  clauseNumber: number;
  clauseText: string;
  clauseType: ClauseType;
}

/** Pull raw text out of a PDF or DOCX buffer based on filename extension. */
export async function extractText(buffer: Buffer, filename: string): Promise<string> {
  const ext = filename.toLowerCase().split('.').pop();
  if (ext === 'pdf') {
    // Import the inner lib file to avoid pdf-parse's index.js demo-mode file read.
    const mod = (await import('pdf-parse/lib/pdf-parse.js')) as unknown as {
      default: (b: Buffer) => Promise<{ text: string }>;
    };
    const { text } = await mod.default(buffer);
    return text;
  }
  if (ext === 'docx') {
    const mammoth = (await import('mammoth')) as unknown as {
      extractRawText: (o: { buffer: Buffer }) => Promise<{ value: string }>;
    };
    const { value } = await mammoth.extractRawText({ buffer });
    return value;
  }
  if (ext === 'txt') return buffer.toString('utf8');
  throw new Error(`Unsupported file type: .${ext}. Upload a PDF, DOCX, or TXT.`);
}

// Matches the start of a numbered/labelled clause at line start:
//   "1.", "1.1", "12.3.4", "Section 5.", "ARTICLE IV", "(a)" style headers.
const CLAUSE_START =
  /^\s*(?:(?:section|article|clause)\s+)?(?:\d+(?:\.\d+)*\.?|[ivxlcdm]+\.|\([a-z0-9]+\))\s+/i;

/**
 * Split raw contract text into individual clauses.
 * Strategy: if the document is numbered, break on clause-start lines; otherwise
 * fall back to paragraph splitting. Tiny fragments are merged/skipped.
 */
export function splitClauses(raw: string): ExtractedClause[] {
  const text = raw.replace(/\r\n/g, '\n').replace(/ /g, ' ');
  const lines = text.split('\n');

  let blocks: string[] = [];
  let current = '';
  let sawNumbering = false;

  for (const line of lines) {
    if (CLAUSE_START.test(line)) {
      sawNumbering = true;
      if (current.trim()) blocks.push(current.trim());
      current = line;
    } else {
      current += (current ? ' ' : '') + line;
    }
  }
  if (current.trim()) blocks.push(current.trim());

  // When the doc is numbered, keep only blocks that actually start with a clause
  // number — this drops the title/preamble that precedes the first numbered clause.
  if (sawNumbering) blocks = blocks.filter((b) => CLAUSE_START.test(b));

  // Fallback: no numbering detected -> split on blank-line paragraphs.
  let candidates = sawNumbering
    ? blocks
    : text
        .split(/\n\s*\n/)
        .map((p) => p.replace(/\s+/g, ' ').trim())
        .filter(Boolean);

  // Keep clause-sized chunks; drop boilerplate fragments (headers, page numbers).
  candidates = candidates
    .map((c) => c.replace(/\s+/g, ' ').trim())
    .filter((c) => c.length >= 40);

  return candidates.map((clauseText, i) => ({
    clauseNumber: i + 1,
    clauseText,
    clauseType: detectClauseType(clauseText),
  }));
}

/** Lightweight keyword heuristic for clause category (RAG refines risk later). */
export function detectClauseType(text: string): ClauseType {
  const t = text.toLowerCase();
  if (/(indemnif|liabilit|hold harmless|damages|guarantee)/.test(t)) return 'liability';
  if (/(intellectual property|work product|inventions|ownership of|copyright|patent)/.test(t))
    return 'ip';
  if (/(auto(?:matic|matically)?\s*renew|renewal term|renew for)/.test(t)) return 'renewal';
  if (/(terminat|cancel|expire|notice of non-renewal)/.test(t)) return 'termination';
  if (/(payment|invoice|fees|interest|net[\s-]?\d+|price)/.test(t)) return 'payment';
  return 'other';
}

/** Guess contract type from the document text for display/labelling. */
export function detectContractType(text: string): ContractType {
  const t = text.toLowerCase();
  if (/non-?disclosure|confidentiality agreement|\bnda\b/.test(t)) return 'nda';
  if (/lease|landlord|tenant|premises/.test(t)) return 'lease';
  if (/statement of work|\bsow\b|deliverables/.test(t)) return 'sow';
  if (/software as a service|\bsaas\b|subscription service|uptime|service level/.test(t))
    return 'saas';
  if (/vendor|supplier|master services agreement|\bmsa\b/.test(t)) return 'vendor';
  return 'other';
}
