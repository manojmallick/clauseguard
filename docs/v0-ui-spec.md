# ClauseGuard — v0 UI Spec (paste into v0.dev)

> Goal: generate the full frontend in v0, then I wire the real Aurora/pgvector + Bedrock RAG backend
> into it. **The component props below match the exact JSON the `/api/analyze` route returns**, so the
> UI drops onto the backend with zero rework.

---

## STEP 1 — Initial scaffold prompt (paste this first)

```
Build a Next.js 15 (App Router) + TypeScript + Tailwind B2B SaaS app called ClauseGuard —
an AI contract-risk scanner for small businesses. Use shadcn/ui components and lucide-react icons.

DESIGN SYSTEM (use throughout):
- Aesthetic: trustworthy legal/fintech. Calm, premium, "a tool you'd trust with a contract".
- Palette: deep navy (#0B1F3A) primary, white/#F7F9FC surfaces, single accent teal (#1FB6A6).
  Risk colors are reserved ONLY for risk badges: green #16A34A (LOW), amber #D97706 (MEDIUM),
  red #DC2626 (HIGH), slate/gray #64748B (ABSTAINED / "needs human review").
- Typography: serif headers (e.g. "Source Serif 4" / Georgia fallback) for gravitas; clean sans
  (Inter) for body and UI. Generous line-height.
- Components: rounded-xl cards, soft shadows, 1px slate borders. Accessible focus rings.

PAGES (App Router routes):
1. /            Landing — hero "Catch the risky clause before you sign.", subhead about SMBs not
   affording $400/hr lawyers, primary CTA "Scan a contract free". A 3-step "How it works"
   (Upload → AI flags risky clauses → Get plain-English fixes). Trust strip: "Grounded on a curated
   legal clause library — never hallucinated." Footer.
2. /upload      Drag-and-drop dropzone for PDF/DOCX. Below it, a "Recent contracts" list (filename,
   type chip, overall-risk badge, uploaded date, status: pending/analyzing/complete). An "Analyzing…"
   state with a progress shimmer over clause cards.
3. /report/[contractId]   The risk report (see DETAILED SPEC below). The most important screen.
4. /dashboard   Team view: a filterable table of all contracts (filter by risk level + type + search),
   plus an Audit Log table (who uploaded/analyzed what, when) for B2B compliance.
5. /pricing     3 tiers: Starter $29/user/mo, Team $99/mo (5 seats), Business $299/mo (20 seats, API,
   custom clause library, audit log). Mark Team as "Most popular".

Make a shared top nav (logo "ClauseGuard" with a shield icon, links: Upload, Dashboard, Pricing) and a
clean layout shell. Mobile responsive.
```

---

## STEP 2 — Report page detail (paste after scaffold)

```
Now refine the /report/[contractId] page. It renders the analysis of one contract.

TOP: an Overall Risk Banner — large overall risk badge (LOW/MEDIUM/HIGH) + the contract filename and
type, plus three count pills: "3 HIGH · 2 MEDIUM · 5 LOW". On the right a secondary count pill for
"2 flagged for human review". Add a subtle "Download report" and "Re-analyze" button.

BODY: a vertical list of ClauseCard components, one per analyzed clause, ordered HIGH → MEDIUM → LOW →
ABSTAINED. Each ClauseCard shows:
  - A left risk rail (colored vertical bar matching the risk level).
  - Clause number + detected clause type chip (liability / termination / ip / payment / renewal).
  - The clause text (collapsible if long, "Show full clause").
  - A risk badge (LOW green / MEDIUM amber / HIGH red).
  - A plain-English explanation paragraph (this is AI-generated, specific to THIS clause's wording).
  - A small muted "Grounded on: «Unlimited liability»" chip showing which library pattern grounded it.
  - A confidence meter: a thin bar 0–100% with the numeric value, labeled "Model confidence".
  - An expandable "Suggested safer language" section showing a REDLINE DIFF: the original wording with
    red strikethrough on the risky part, and the safer rewrite in green below. Include a "Copy redline"
    button.

ABSTENTION VARIANT of ClauseCard: when a clause was flagged for human review (no strong library match),
render it in slate/gray with an "i" icon, a "Needs human review" badge, and the note
"No strong match in our clause library — we won't guess on legal risk. A human should review this."
No confidence meter, no redline. This calibrated-uncertainty state must look intentional and trustworthy.

PRIOR-EXPOSURE CALLOUT: inside a HIGH ClauseCard, if the clause has prior exposure, show a highlighted
inset banner with a history icon: "⚠ You accepted similar language in 3 past contracts" and list them
(filename + date) as small links. This is the headline feature — make it visually prominent.
```

---

## STEP 3 — Dashboard refinement (optional paste)

```
On /dashboard, the contracts table columns: Filename, Type, Overall risk (badge), Findings
(HIGH/MED/LOW mini-counts), Uploaded by, Date, Status. Filter bar above: risk level multi-select,
type dropdown, text search. Below the table, an "Audit Log" card: timestamped rows of
"{user} {action} {filename}" (actions: uploaded, analyzed, exported), newest first. Compliance-grade,
monospace timestamps.
```

---

## DATA CONTRACT — make v0 mock these exact shapes (critical for backend wiring)

Tell v0: *"Type the mock data with these TypeScript interfaces and render from them."*

```typescript
// One analyzed clause finding — the shape /api/analyze returns per clause
export interface Finding {
  clauseId: string;
  clauseNumber: number;
  clauseType: 'liability' | 'termination' | 'ip' | 'payment' | 'renewal' | 'other';
  clauseText: string;
  isRisk: boolean;
  abstained?: boolean;            // true => render the "needs human review" variant
  note?: string;                  // shown on abstained cards
  riskLevel?: 'low' | 'medium' | 'high';
  explanation?: string;           // AI-generated, specific to this clause's wording
  redline?: string;               // safer rewrite (for the diff "after" side)
  groundedOnPattern?: string;     // e.g. "Unlimited liability"
  confidence?: number;            // 0..1  -> render as %
  priorExposure?: Array<{ contractId: string; filename: string; date: string }>;
}

export interface ContractReport {
  contractId: string;
  filename: string;
  contractType: 'nda' | 'lease' | 'sow' | 'vendor' | 'saas' | 'other';
  overallRisk: 'low' | 'medium' | 'high';
  counts: { high: number; medium: number; low: number; abstained: number };
  findings: Finding[];
}

export interface ContractRow {
  id: string;
  filename: string;
  contractType: string;
  overallRisk: 'low' | 'medium' | 'high' | null;
  counts: { high: number; medium: number; low: number };
  uploadedBy: string;
  uploadedAt: string;
  status: 'pending' | 'analyzing' | 'complete';
}

export interface AuditEntry {
  id: string;
  user: string;
  action: 'uploaded' | 'analyzed' | 'exported';
  filename: string;
  timestamp: string;
}
```

### Realistic mock content to seed v0 (so the demo looks real)
- A HIGH "Unlimited liability" finding **with** `priorExposure` of 3 contracts → triggers the moat banner.
- A HIGH "Auto-renewal trap" finding with a clear redline diff.
- A MEDIUM "Unilateral IP assignment" finding.
- One `abstained: true` clause (a weird bespoke indemnity) → triggers the human-review variant.
- A couple LOW/benign clauses.

---

## Integration notes (how this connects to the backend I'm building)
- Each page fetches from real routes later: `/upload` → `POST /api/upload`; report page →
  `GET /api/report?contractId=…`; "Re-analyze" → `POST /api/analyze`.
- Keep components **presentational** (take a `Finding`/`ContractReport` prop). Don't bake fetch logic
  into the cards — I'll pass server data in. This is the one rule that prevents a rewrite.
- Don't implement auth in v0; I'll add org/user context server-side.
```
