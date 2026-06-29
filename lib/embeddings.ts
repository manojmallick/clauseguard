// ─────────────────────────────────────────────────────────────
// Clause embeddings. Bedrock-first (Amazon Titan Text Embeddings V2); a fallback
// provider (OpenAI) is used when AI_PROVIDER=openai — e.g. while a new AWS account
// waits on Bedrock quota. Output dim must match db schema vector(N).
// Flip AI_PROVIDER back to 'bedrock' (default) once Bedrock quota is granted.
// ─────────────────────────────────────────────────────────────
import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from '@aws-sdk/client-bedrock-runtime';

const AI_PROVIDER = process.env.AI_PROVIDER ?? 'bedrock';
const EMBED_DIM = Number(process.env.EMBED_DIM ?? 1024);

// Bedrock region can differ from the Aurora region (AWS_REGION). Use BEDROCK_REGION
// when set (e.g. an EU region where model access is granted).
const bedrock = new BedrockRuntimeClient({
  region: process.env.BEDROCK_REGION ?? process.env.AWS_REGION,
});
const EMBED_MODEL_ID = process.env.BEDROCK_EMBED_MODEL_ID ?? 'amazon.titan-embed-text-v2:0';
const OPENAI_EMBED_MODEL = process.env.OPENAI_EMBED_MODEL ?? 'text-embedding-3-small';

/** Embed a single piece of text into a vector of length EMBED_DIM. */
export async function generateEmbedding(text: string): Promise<number[]> {
  const vec = AI_PROVIDER === 'openai' ? await openaiEmbed(text) : await bedrockEmbed(text);
  if (vec.length !== EMBED_DIM) {
    throw new Error(`Embedding dim mismatch: got ${vec.length}, expected ${EMBED_DIM}`);
  }
  return vec;
}

async function bedrockEmbed(text: string): Promise<number[]> {
  const res = await bedrock.send(
    new InvokeModelCommand({
      modelId: EMBED_MODEL_ID,
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify({ inputText: text.slice(0, 8000), dimensions: EMBED_DIM, normalize: true }),
    })
  );
  const parsed = JSON.parse(new TextDecoder().decode(res.body)) as { embedding: number[] };
  return parsed.embedding ?? [];
}

// OpenAI supports `dimensions` to project text-embedding-3-* down to EMBED_DIM (1024),
// so vectors stay compatible with the pgvector(1024) schema.
async function openaiEmbed(text: string): Promise<number[]> {
  const res = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: OPENAI_EMBED_MODEL,
      input: text.slice(0, 8000),
      dimensions: EMBED_DIM,
    }),
  });
  if (!res.ok) throw new Error(`OpenAI embeddings ${res.status}: ${await res.text()}`);
  const json = (await res.json()) as { data: { embedding: number[] }[] };
  return json.data[0].embedding;
}
