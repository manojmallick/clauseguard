# ClauseGuard

**The legal contract review small businesses can't afford.** Upload any contract and get every
risky clause flagged, explained in plain English, and rewritten with safer language — in ~30 seconds.

[![Live](https://img.shields.io/badge/▶_Live_Demo-clauseguard.vercel.app-1FB6A6?style=for-the-badge&logo=vercel&logoColor=white)](https://clauseguard.vercel.app)
&nbsp;[![Deck](https://img.shields.io/badge/Pitch-DECK.pdf-EF4444?style=for-the-badge&logo=adobeacrobatreader&logoColor=white)](./DECK.pdf)

![Next.js](https://img.shields.io/badge/Next.js_16-000000?style=flat-square&logo=nextdotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Aurora PostgreSQL](https://img.shields.io/badge/Aurora_PostgreSQL-527FFF?style=flat-square&logo=amazonrds&logoColor=white)
![pgvector](https://img.shields.io/badge/pgvector-4169E1?style=flat-square&logo=postgresql&logoColor=white)
![Amazon Bedrock](https://img.shields.io/badge/Amazon_Bedrock-232F3E?style=flat-square&logo=amazonaws&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=flat-square&logo=vercel&logoColor=white)

> AWS × Vercel Hackathon · **Track 2 (Monetizable B2B)** · Amazon Aurora PostgreSQL + pgvector RAG,
> grounded on Amazon Bedrock (Claude). Flagship submission — target: **Best Technical Implementation**.

> 🟢 **Live:** https://clauseguard.vercel.app &nbsp;·&nbsp; 📊 **Pitch deck:** [DECK.pdf](./DECK.pdf)

---

## Why this is real RAG (not a lookup)

Most "AI clause checkers" do a vector lookup and return canned text — they can't flag anything outside
their seed list. ClauseGuard does **true Retrieval-Augmented Generation**:

1. **Retrieve** the most similar known-risky patterns from a curated clause library (`pgvector`).
2. **Abstain** when the nearest pattern is too weak a match — it says *"needs human review"* instead of
   inventing legal risk. A legal tool that knows what it doesn't know is the one you can trust.
3. **Generate** a finding tailored to *this clause's exact wording*, grounded on the retrieved patterns,
   with a redline diff — so it generalizes to clauses never seen before.
4. **The moat:** a second `pgvector` search over the org's **own past contracts** surfaces
   *"you accepted similar language in 3 past contracts."* Relational data + vector search in **one
   Aurora query path** — which is precisely why Aurora PostgreSQL is the correct database.

---

## Architecture

```mermaid
flowchart TD
  U[User uploads PDF/DOCX] --> UP["/api/upload"]
  UP -->|parse + split| P[lib/parse.ts]
  UP -->|embed each clause| EMB[Bedrock Titan v2]
  UP -->|store clauses + embeddings| AUR[(Aurora PostgreSQL + pgvector)]
  UP --> AN["/api/analyze"]
  AN --> RAG[lib/rag.ts]
  RAG -->|retrieve top-3 patterns| AUR
  RAG -->|retrieve org priors moat| AUR
  RAG -->|abstain if weak match| FIND[(findings)]
  RAG -->|else ground + generate| LLM[Bedrock Claude Sonnet]
  LLM --> FIND
  FIND --> RPT["/api/report -> Report UI"]
  AUR --> DASH[Dashboard + Audit Log]
```

**Stack:** Next.js 16 (App Router) · TypeScript · Tailwind v4 / shadcn · Amazon Aurora PostgreSQL
(Serverless v2) + pgvector · Amazon Bedrock (Titan Text Embeddings V2 + Claude Sonnet) · deploys to
Vercel.

---

## Project structure

```
app/
  page.tsx                     Landing
  upload/                      Dropzone + recent contracts (real upload→analyze→report)
  report/[contractId]/         Risk report (banner, clause cards, redline diff, moat, abstention)
  dashboard/                   Contracts table + compliance audit log
  pricing/
  api/
    upload/   analyze/   report/   redline/   contracts/   audit/
lib/
  db.ts          Aurora pooled client (lazy), transactions, pgvector helpers
  embeddings.ts  Bedrock Titan v2 embeddings
  parse.ts       PDF/DOCX/TXT extraction + clause splitting + type heuristics
  rag.ts         TRUE RAG core: retrieve → abstain | generate, prior-exposure, <del>/<ins> redline
  scoring.ts     Risk aggregation + ContractReport assembly
  queries.ts     Shared data access (mock fallback so UI renders pre-Aurora)
  context.ts     Tenant (org/user) resolution
  audit.ts       Compliance audit trail
  data.ts        Canonical TS interfaces + demo mock data
db/
  schema.sql            Full schema (vector(1024))
  clause-patterns.mjs   30 curated risky-clause patterns (the RAG knowledge base)
scripts/
  run-sql.mjs   seed.mjs
docs/
  v0-ui-spec.md   stitch-ui-spec.md
```

---

## Setup

### 1. Prerequisites
- An **Amazon Aurora PostgreSQL (Serverless v2)** cluster with the `vector` extension available.
- **Amazon Bedrock** model access granted in your region for:
  `amazon.titan-embed-text-v2:0` and `anthropic.claude-sonnet-4-6`.

### 2. Environment
```bash
cp .env.example .env.local
# Fill in DATABASE_URL, AWS_REGION, AWS credentials, model IDs.
```

### 3. Database
```bash
pnpm install
pnpm db:schema   # applies db/schema.sql (creates tables + pgvector indexes)
pnpm db:seed     # embeds the 30 patterns via Bedrock + seeds a demo org/users
```
The seed prints a **demo org id** — optionally set it as `ORG_ID` in `.env.local` to pin the tenant.

### 4. Run
```bash
pnpm dev         # http://localhost:3000
```
Upload a contract on `/upload` → it parses, embeds, runs the RAG pipeline, and redirects to the report.

> **No Aurora/Bedrock yet?** The UI still renders with demo data (a "Demo data — connect Aurora to go
> live" badge appears). Everything switches to live data once `DATABASE_URL` + Bedrock are configured.

---

## Environment variables

Copy `.env.example` to `.env.local`.

| Variable | Description |
|---|---|
| `PGHOST`, `PGPORT`, `PGUSER`, `PGDATABASE`, `AWS_ROLE_ARN` | Aurora connection with password-less IAM auth through Vercel OIDC (preferred; injected by the Vercel Aurora integration, `vercel env pull .env.local` brings them down) |
| `DATABASE_URL`, `PGSSLMODE` | Fallback: a plain Postgres connection string; `PGSSLMODE=disable` for a local non-TLS database |
| `AI_PROVIDER` | `bedrock` (default), or `openai` / `gemini` as a fallback while waiting for Bedrock quota |
| `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_SESSION_TOKEN` | Bedrock access. On Vercel an OIDC role can replace the keys. `BEDROCK_REGION` overrides the region if model access is elsewhere |
| `BEDROCK_LLM_MODEL_ID`, `BEDROCK_EMBED_MODEL_ID` | Models used when `AI_PROVIDER=bedrock` (Claude Sonnet and Titan Text Embeddings v2) |
| `OPENAI_API_KEY`, `OPENAI_EMBED_MODEL`, `OPENAI_LLM_MODEL` | Used when `AI_PROVIDER=openai` |
| `GEMINI_API_KEY`, `GEMINI_EMBED_MODEL`, `GEMINI_LLM_MODEL` | Used when `AI_PROVIDER=gemini` |
| `EMBED_DIM` | Embedding size, `1024`. Must match `vector(N)` in `db/schema.sql`, for every provider |
| `RAG_DISTANCE_FLOOR` | Default `0.55`. Beyond this cosine distance to the clause library, the system abstains and flags the clause for human review |
| `RAG_PRIOR_EXPOSURE_MAX` | Default `0.45`. Closer than this to a clause in the organisation's history means "you accepted similar language before" |
| `ORG_ID` | Optional. Pins a tenant; `pnpm db:seed` prints the demo org id |
| `SETUP_SECRET` | Only for the admin setup route below (not listed in `.env.example`) |

## Scripts

| Command | What it does |
|---|---|
| `pnpm dev` | Dev server on `http://localhost:3000` |
| `pnpm build` / `pnpm start` | Production build and server |
| `pnpm lint` | ESLint |
| `pnpm db:schema` | Apply `db/schema.sql` (tables and pgvector indexes) |
| `pnpm db:seed` | Embed the 30 clause patterns and seed a demo org and users |
| `pnpm db:reset` | `db:schema` then `db:seed` |
| `node --env-file=.env.local scripts/preflight.mjs` | Check database connectivity, pgvector and a real embedding call before seeding |

## Setting up the database from Vercel

Aurora can be private to Vercel's network, so `/api/admin/setup` runs the setup from inside a deployment. It is guarded by the `SETUP_SECRET` environment variable and is safe to call repeatedly:

```bash
curl -X POST "$URL/api/admin/setup?reset=1" -H "x-setup-secret: $SETUP_SECRET"   # first run: drops and recreates the schema
curl -X POST "$URL/api/admin/setup"          -H "x-setup-secret: $SETUP_SECRET"   # continue seeding if the first call timed out or Bedrock throttled
```

`?reset=1` **drops the schema**, so use it only on a fresh or disposable database.

## Troubleshooting

| Symptom | Likely cause |
|---|---|
| "Demo data" badge in the UI | `DATABASE_URL` (or the Aurora variables) and the AI provider are not configured yet |
| Vector dimension errors | `EMBED_DIM` and `vector(N)` in `db/schema.sql` differ; re-run `pnpm db:schema` after changing it |
| Bedrock `AccessDenied` or throttling | Model access not granted in the region, or quota hit; set `AI_PROVIDER=openai` or `gemini`, or call the setup route again to resume |
| Many clauses show "needs human review" | They are farther than `RAG_DISTANCE_FLOOR` from the clause library; raise it to be more permissive |

More: [docs/DEMO.md](docs/DEMO.md) (demo script).

---

## API

| Route | Method | Purpose |
|---|---|---|
| `/api/upload` | POST (multipart) | Parse → split → embed → store clauses |
| `/api/analyze` | POST `{contractId}` | Run RAG over every clause, store findings, score overall risk |
| `/api/report?contractId=` | GET | Full `ContractReport` for the report UI |
| `/api/redline` | POST `{clauseText}` | On-demand safer-language rewrite for one clause |
| `/api/contracts` | GET | Contracts list (dashboard / recent) |
| `/api/audit` | GET | Compliance audit entries |

---

## Deploy (Vercel)

1. Import the repo into Vercel.
2. Set the same environment variables (`DATABASE_URL`, `AWS_REGION`, AWS credentials, model IDs) in the
   Vercel project settings. Prefer an IAM role / scoped keys with Bedrock + RDS access.
3. Deploy. The `/api/upload` and `/api/analyze` functions are configured for the Node.js runtime with
   extended `maxDuration` for the embedding + LLM calls.

Run `pnpm db:schema && pnpm db:seed` once against the production Aurora cluster before the first demo.

---

## The three things to show judges (90 seconds)
1. Open a **HIGH** finding → tailored plain-English explanation + **redline diff** against the actual wording.
2. The **moat shot:** *"you accepted similar language in 3 past contracts"* (cross-contract pgvector join).
3. An **abstention** card: *"needs human review."* Calibrated uncertainty = trust.

> *"Amazon Aurora PostgreSQL with pgvector powers our RAG — retrieval over a curated clause library AND
> the customer's own contract history, with full ACID for the compliance audit log. One database, both
> jobs. Generation runs on Amazon Bedrock."*
