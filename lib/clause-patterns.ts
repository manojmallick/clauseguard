// Typed re-export of the curated clause library so server routes can import it.
// Source of truth is db/clause-patterns.mjs (also used by the node seed script).
import { CLAUSE_PATTERNS as RAW } from '@/db/clause-patterns.mjs';

export interface ClausePattern {
  pattern_name: string;
  clause_type: string;
  risk_level: 'low' | 'medium' | 'high';
  example_text: string;
  explanation: string;
  safer_version: string;
}

export const CLAUSE_PATTERNS = RAW as ClausePattern[];
