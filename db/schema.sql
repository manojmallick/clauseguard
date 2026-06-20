-- ─────────────────────────────────────────────────────────────
-- ClauseGuard schema — Amazon Aurora PostgreSQL + pgvector
-- Relational integrity (ACID) for compliance data AND vector search
-- for RAG, in one database. Re-runnable: drops then recreates.
-- vector(1024) matches Amazon Titan Text Embeddings V2 (EMBED_DIM).
-- ─────────────────────────────────────────────────────────────

CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS "pgcrypto";  -- gen_random_uuid()

DROP TABLE IF EXISTS audit_log     CASCADE;
DROP TABLE IF EXISTS findings       CASCADE;
DROP TABLE IF EXISTS clauses        CASCADE;
DROP TABLE IF EXISTS contracts      CASCADE;
DROP TABLE IF EXISTS clause_library CASCADE;
DROP TABLE IF EXISTS users          CASCADE;
DROP TABLE IF EXISTS organizations  CASCADE;

-- Organizations (B2B multi-tenant)
CREATE TABLE organizations (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name       TEXT NOT NULL,
    plan       TEXT DEFAULT 'starter' CHECK (plan IN ('starter','team','business')),
    seats      INT  DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE users (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id     UUID REFERENCES organizations(id) ON DELETE CASCADE,
    email      TEXT UNIQUE NOT NULL,
    name       TEXT,
    role       TEXT DEFAULT 'member' CHECK (role IN ('admin','member')),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Uploaded contracts
CREATE TABLE contracts (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id        UUID REFERENCES organizations(id) ON DELETE CASCADE,
    uploaded_by   UUID REFERENCES users(id),
    filename      TEXT,
    file_url      TEXT,
    contract_type TEXT,                                  -- nda, lease, sow, vendor, saas
    overall_risk  TEXT CHECK (overall_risk IN ('low','medium','high')),
    status        TEXT DEFAULT 'pending' CHECK (status IN ('pending','analyzing','complete')),
    uploaded_at   TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_contracts_org ON contracts(org_id);

-- Extracted clauses from each contract
CREATE TABLE clauses (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_id   UUID REFERENCES contracts(id) ON DELETE CASCADE,
    clause_number INT,
    clause_text   TEXT,
    clause_type   TEXT,                                  -- liability, termination, ip, payment, renewal, other
    embedding     vector(1024)
);
CREATE INDEX idx_clauses_contract ON clauses(contract_id);
CREATE INDEX idx_clauses_embedding ON clauses USING hnsw (embedding vector_cosine_ops);

-- The known-risky clause library (the curated RAG knowledge base)
CREATE TABLE clause_library (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pattern_name  TEXT,                                  -- "Auto-renewal trap", "Unlimited liability"
    clause_type   TEXT,
    risk_level    TEXT CHECK (risk_level IN ('low','medium','high')),
    example_text  TEXT,                                  -- example of the risky clause
    explanation   TEXT,                                  -- plain-English why it's risky
    safer_version TEXT,                                  -- suggested redline baseline
    embedding     vector(1024)
);
CREATE INDEX idx_library_embedding ON clause_library USING hnsw (embedding vector_cosine_ops);

-- Risk findings (one per flagged clause)
CREATE TABLE findings (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_id        UUID REFERENCES contracts(id) ON DELETE CASCADE,
    clause_id          UUID REFERENCES clauses(id) ON DELETE CASCADE,
    matched_pattern    UUID REFERENCES clause_library(id),
    risk_level         TEXT CHECK (risk_level IN ('low','medium','high')),
    explanation        TEXT,
    redline_suggestion TEXT,                             -- inline <del>/<ins> diff markup
    grounded_on        TEXT,                             -- pattern name the LLM relied on
    confidence         NUMERIC(3,2),
    abstained          BOOLEAN DEFAULT false,
    note               TEXT,                             -- shown on abstained findings
    created_at         TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_findings_contract ON findings(contract_id);

-- Audit log (B2B compliance trail)
CREATE TABLE audit_log (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id      UUID REFERENCES organizations(id) ON DELETE CASCADE,
    user_id     UUID REFERENCES users(id),
    action      TEXT,                                    -- uploaded, analyzed, exported
    resource_id UUID,
    detail      TEXT,
    timestamp   TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_audit_org ON audit_log(org_id);
