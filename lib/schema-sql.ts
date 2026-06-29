// Schema as an importable string so it bundles into the Vercel function (the
// Aurora cluster is reachable only from Vercel, so setup runs server-side).
// Mirror of db/schema.sql — keep them in sync.
export const SCHEMA_SQL = `
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DROP TABLE IF EXISTS audit_log     CASCADE;
DROP TABLE IF EXISTS findings       CASCADE;
DROP TABLE IF EXISTS clauses        CASCADE;
DROP TABLE IF EXISTS contracts      CASCADE;
DROP TABLE IF EXISTS clause_library CASCADE;
DROP TABLE IF EXISTS users          CASCADE;
DROP TABLE IF EXISTS organizations  CASCADE;

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

CREATE TABLE contracts (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id        UUID REFERENCES organizations(id) ON DELETE CASCADE,
    uploaded_by   UUID REFERENCES users(id),
    filename      TEXT,
    file_url      TEXT,
    contract_type TEXT,
    overall_risk  TEXT CHECK (overall_risk IN ('low','medium','high')),
    status        TEXT DEFAULT 'pending' CHECK (status IN ('pending','analyzing','complete')),
    uploaded_at   TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_contracts_org ON contracts(org_id);

CREATE TABLE clauses (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_id   UUID REFERENCES contracts(id) ON DELETE CASCADE,
    clause_number INT,
    clause_text   TEXT,
    clause_type   TEXT,
    embedding     vector(1024)
);
CREATE INDEX idx_clauses_contract ON clauses(contract_id);
CREATE INDEX idx_clauses_embedding ON clauses USING hnsw (embedding vector_cosine_ops);

CREATE TABLE clause_library (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pattern_name  TEXT,
    clause_type   TEXT,
    risk_level    TEXT CHECK (risk_level IN ('low','medium','high')),
    example_text  TEXT,
    explanation   TEXT,
    safer_version TEXT,
    embedding     vector(1024)
);
CREATE INDEX idx_library_embedding ON clause_library USING hnsw (embedding vector_cosine_ops);

CREATE TABLE findings (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_id        UUID REFERENCES contracts(id) ON DELETE CASCADE,
    clause_id          UUID REFERENCES clauses(id) ON DELETE CASCADE,
    matched_pattern    UUID REFERENCES clause_library(id),
    risk_level         TEXT CHECK (risk_level IN ('low','medium','high')),
    explanation        TEXT,
    redline_suggestion TEXT,
    grounded_on        TEXT,
    confidence         NUMERIC(3,2),
    abstained          BOOLEAN DEFAULT false,
    note               TEXT,
    prior_exposure     JSONB,
    retrieval_distance NUMERIC(6,4),
    created_at         TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_findings_contract ON findings(contract_id);

CREATE TABLE audit_log (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id      UUID REFERENCES organizations(id) ON DELETE CASCADE,
    user_id     UUID REFERENCES users(id),
    action      TEXT,
    resource_id UUID,
    detail      TEXT,
    timestamp   TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_audit_org ON audit_log(org_id);
`;
