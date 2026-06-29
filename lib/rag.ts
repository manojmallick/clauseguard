// ─────────────────────────────────────────────────────────────
// TRUE RAG core. For a clause:
//   1. RETRIEVE top-k known-risky patterns from the curated clause_library
//   2. RETRIEVE the org's OWN past clauses (the moat: "you accepted this before")
//   3. ABSTAIN when retrieval is too weak — never invent legal risk cold
//   4. GENERATE a finding tailored to THIS clause's wording, grounded on (1),
//      with a redline in inline <del>/<ins> markup the UI renders as a diff.
// Relational data + vector search in one Aurora query path = the architecture story.
// ─────────────────────────────────────────────────────────────
import { query, toVector } from './db';
import { generateEmbedding } from './embeddings';
import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from '@aws-sdk/client-bedrock-runtime';

const bedrock = new BedrockRuntimeClient({
  region: process.env.BEDROCK_REGION ?? process.env.AWS_REGION,
});
const LLM_MODEL_ID = process.env.BEDROCK_LLM_MODEL_ID ?? 'anthropic.claude-sonnet-4-6';
const DISTANCE_FLOOR = Number(process.env.RAG_DISTANCE_FLOOR ?? 0.55);
const PRIOR_EXPOSURE_MAX = Number(process.env.RAG_PRIOR_EXPOSURE_MAX ?? 0.45);

// Bedrock-first; fall back to OpenAI or Gemini (e.g. awaiting Bedrock quota).
const AI_PROVIDER = process.env.AI_PROVIDER ?? 'bedrock';
const OPENAI_LLM_MODEL = process.env.OPENAI_LLM_MODEL ?? 'gpt-4o-mini';
const GEMINI_LLM_MODEL = process.env.GEMINI_LLM_MODEL ?? 'gemini-2.5-flash';

export interface PriorExposure {
  contractId: string;
  filename: string;
  date: string;
}

export interface RagFinding {
  isRisk: boolean;
  abstained?: boolean;
  note?: string;
  riskLevel?: 'low' | 'medium' | 'high';
  explanation?: string;
  redline?: string; // inline <del>…</del> <ins>…</ins>
  groundedOnPattern?: string;
  matchedPatternId?: string;
  confidence?: number; // 0..1
  priorExposure?: PriorExposure[];
  retrievalDistance?: number;
}

interface LibRow {
  id: string;
  pattern_name: string;
  risk_level: string;
  explanation: string;
  safer_version: string;
  distance: number;
}

/** Analyze one clause via retrieve -> (abstain | generate). */
export async function analyzeClause(
  clauseText: string,
  orgId: string,
  currentContractId?: string,
  precomputedVector?: string // pgvector literal, e.g. embedding::text from upload
): Promise<RagFinding> {
  const vec = precomputedVector ?? toVector(await generateEmbedding(clauseText));

  // RETRIEVE #1 — top-3 curated risky patterns (grounding knowledge base)
  const lib = await query<LibRow>(
    `SELECT id, pattern_name, risk_level, explanation, safer_version,
            embedding <=> $1::vector AS distance
     FROM clause_library
     ORDER BY embedding <=> $1::vector
     LIMIT 3`,
    [vec]
  );

  const nearest = lib.rows[0];

  // ABSTAIN — retrieval too weak to ground on; flag for human review.
  if (!nearest || Number(nearest.distance) > DISTANCE_FLOOR) {
    return {
      isRisk: false,
      abstained: true,
      note: 'No strong match in our clause library — we won’t guess on legal risk. A specialist should review this clause.',
      retrievalDistance: nearest ? Number(nearest.distance) : undefined,
    };
  }

  // RETRIEVE #2 — the moat: has THIS org accepted similar language before?
  const priors = await query<{ contract_id: string; filename: string; uploaded_at: string; distance: number }>(
    `SELECT c.contract_id, ct.filename, ct.uploaded_at,
            c.embedding <=> $1::vector AS distance
     FROM clauses c
     JOIN contracts ct ON ct.id = c.contract_id
     WHERE ct.org_id = $2
       AND ($3::uuid IS NULL OR c.contract_id <> $3::uuid)
     ORDER BY c.embedding <=> $1::vector
     LIMIT 5`,
    [vec, orgId, currentContractId ?? null]
  );

  const priorExposure: PriorExposure[] = priors.rows
    .filter((p) => Number(p.distance) < PRIOR_EXPOSURE_MAX)
    .slice(0, 3)
    .map((p) => ({
      contractId: p.contract_id,
      filename: p.filename,
      date: new Date(p.uploaded_at).toLocaleDateString('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
      }),
    }));

  // GENERATE — ground Claude on retrieved patterns + the ACTUAL wording.
  const grounding = lib.rows
    .map(
      (r, i) =>
        `[Pattern ${i + 1}] ${r.pattern_name} (risk: ${r.risk_level})\n` +
        `Why risky: ${r.explanation}\nSafer baseline: ${r.safer_version}`
    )
    .join('\n\n');

  const prompt = `You are a contract-risk analyst for small businesses. Use ONLY the retrieved patterns below as grounding. Do not invent risks not supported by them. If the clause is genuinely benign, say so with low risk.

RETRIEVED PATTERNS:
${grounding}

CLAUSE UNDER REVIEW:
"""${clauseText}"""

Return STRICT JSON only (no markdown), with this exact shape:
{
  "isRisk": boolean,
  "riskLevel": "low" | "medium" | "high",
  "explanation": "plain-English, specific to THIS clause's wording, 1-3 sentences",
  "redline": "the clause rewritten safer. Mark the risky text to remove with <del>...</del> and the safer replacement with <ins>...</ins>, inline, keeping the unchanged parts as-is",
  "groundedOnPattern": "the exact pattern_name you relied on",
  "confidence": number between 0 and 1
}`;

  const out = await invokeLLM(prompt);

  return {
    isRisk: out.isRisk ?? true,
    riskLevel: out.riskLevel,
    explanation: out.explanation,
    redline: out.redline,
    groundedOnPattern: out.groundedOnPattern ?? nearest.pattern_name,
    matchedPatternId: nearest.id,
    confidence: clamp01(out.confidence ?? 1 - Number(nearest.distance)),
    priorExposure: priorExposure.length ? priorExposure : undefined,
    retrievalDistance: Number(nearest.distance),
  };
}

interface ClaudeFinding {
  isRisk?: boolean;
  riskLevel?: 'low' | 'medium' | 'high';
  explanation?: string;
  redline?: string;
  groundedOnPattern?: string;
  confidence?: number;
}

/** Invoke the grounded LLM (Bedrock Claude, or OpenAI/Gemini fallback) and parse its JSON reply. */
async function invokeLLM(prompt: string): Promise<ClaudeFinding> {
  const text =
    AI_PROVIDER === 'openai'
      ? await invokeOpenAI(prompt)
      : AI_PROVIDER === 'gemini'
        ? await invokeGemini(prompt)
        : await invokeClaude(prompt);
  return parseJsonLoose(text);
}

async function invokeGemini(prompt: string): Promise<string> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_LLM_MODEL}:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0, responseMimeType: 'application/json' },
      }),
    }
  );
  if (!res.ok) throw new Error(`Gemini chat ${res.status}: ${await res.text()}`);
  const json = (await res.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };
  return json.candidates?.[0]?.content?.parts?.[0]?.text ?? '{}';
}

async function invokeClaude(prompt: string): Promise<string> {
  const res = await bedrock.send(
    new InvokeModelCommand({
      modelId: LLM_MODEL_ID,
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify({
        anthropic_version: 'bedrock-2023-05-31',
        max_tokens: 800,
        temperature: 0,
        messages: [{ role: 'user', content: prompt }],
      }),
    })
  );
  const envelope = JSON.parse(new TextDecoder().decode(res.body)) as { content: { text: string }[] };
  return envelope.content?.[0]?.text ?? '{}';
}

async function invokeOpenAI(prompt: string): Promise<string> {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: OPENAI_LLM_MODEL,
      temperature: 0,
      max_tokens: 800,
      response_format: { type: 'json_object' },
      messages: [{ role: 'user', content: prompt }],
    }),
  });
  if (!res.ok) throw new Error(`OpenAI chat ${res.status}: ${await res.text()}`);
  const json = (await res.json()) as { choices: { message: { content: string } }[] };
  return json.choices[0]?.message?.content ?? '{}';
}

function parseJsonLoose(text: string): ClaudeFinding {
  const cleaned = text.trim().replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch {
        /* fall through */
      }
    }
    return {};
  }
}

function clamp01(n: number): number {
  return Math.max(0, Math.min(1, Number(n)));
}
