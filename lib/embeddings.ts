// ─────────────────────────────────────────────────────────────
// Clause embeddings via Amazon Bedrock — Titan Text Embeddings V2.
// Output dimension is configurable (256/512/1024); must match db schema vector(N).
// ─────────────────────────────────────────────────────────────
import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from '@aws-sdk/client-bedrock-runtime';

// Bedrock region can differ from the Aurora region (AWS_REGION). Use BEDROCK_REGION
// when set (e.g. an EU region where model access is granted).
const bedrock = new BedrockRuntimeClient({
  region: process.env.BEDROCK_REGION ?? process.env.AWS_REGION,
});
const EMBED_MODEL_ID = process.env.BEDROCK_EMBED_MODEL_ID ?? 'amazon.titan-embed-text-v2:0';
const EMBED_DIM = Number(process.env.EMBED_DIM ?? 1024);

/** Embed a single piece of text into a normalized vector of length EMBED_DIM. */
export async function generateEmbedding(text: string): Promise<number[]> {
  const res = await bedrock.send(
    new InvokeModelCommand({
      modelId: EMBED_MODEL_ID,
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify({
        inputText: text.slice(0, 8000), // Titan input cap guard
        dimensions: EMBED_DIM,
        normalize: true,
      }),
    })
  );
  const parsed = JSON.parse(new TextDecoder().decode(res.body)) as { embedding: number[] };
  if (!parsed.embedding || parsed.embedding.length !== EMBED_DIM) {
    throw new Error(
      `Embedding dim mismatch: got ${parsed.embedding?.length}, expected ${EMBED_DIM}`
    );
  }
  return parsed.embedding;
}
