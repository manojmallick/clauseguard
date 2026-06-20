# ClauseGuard — Google Stitch Design Spec

> Stitch (stitch.withgoogle.com) is **design-first**: it generates high-fidelity visual mockups you can
> export to Figma or front-end code. Unlike v0, it responds best to **vivid visual/mood language, one
> screen at a time.** Set the global style once, then prompt each screen. Use **Experimental mode
> (Gemini 2.5 Pro)** for the report screen — it's the most complex.
>
> Workflow: paste the GLOBAL STYLE block, then generate each SCREEN prompt separately. Keep the same
> theme so Stitch stays consistent. Tweak with short follow-ups ("make the risk badge bolder",
> "tighten card spacing").

---

## GLOBAL STYLE (set this first — applies to every screen)

```
Design a web app for "ClauseGuard", an AI contract-risk scanner for small businesses. Desktop-first,
responsive. Mood: trustworthy, premium, calm legal-fintech — the feeling of a tool you'd trust with a
legal document. Think Stripe-meets-a-modern-law-firm.

Color theme:
- Primary: deep navy #0B1F3A (nav, headings, primary buttons)
- Surfaces: white cards on a soft #F7F9FC background
- Accent: teal #1FB6A6 (CTAs, links, active states) — used sparingly
- Risk semantic colors, reserved ONLY for risk badges and rails:
  green #16A34A = LOW, amber #D97706 = MEDIUM, red #DC2626 = HIGH, slate #64748B = "needs human review"

Typography: elegant serif headlines (Source Serif 4 feel) for gravitas; clean sans-serif (Inter) body.
Generous whitespace, 12–16px rounded corners, soft shadows, hairline slate borders.
Components: pill badges, chip tags, segmented filters, data tables with quiet zebra rows.
A persistent top navigation: shield logo + "ClauseGuard", links Upload / Dashboard / Pricing, and a
small avatar. Accessible contrast, clear focus states.
```

---

## SCREEN 1 — Landing
```
Landing page for ClauseGuard. A confident hero: serif headline "Catch the risky clause before you
sign.", a subhead "Small businesses sign contracts they can't afford a $400/hour lawyer to read.
ClauseGuard reads them in 30 seconds." Primary teal button "Scan a contract free", secondary
"See how it works". Below: a 3-step horizontal "How it works" with line icons — 1) Upload your PDF,
2) AI flags every risky clause, 3) Get plain-English fixes and safer wording. A trust strip:
"Grounded on a curated legal clause library — answers are retrieved and explained, never hallucinated."
A subtle product preview card showing a sample flagged clause with a red HIGH badge. Clean footer.
```

## SCREEN 2 — Upload
```
Contract upload page. A large central drag-and-drop dropzone (dashed teal border, document icon,
"Drop a PDF or DOCX contract here, or browse"). Supported-types caption. Below the dropzone, a "Recent
contracts" list: each row shows a file icon, filename, a contract-type chip (NDA / Lease / Vendor /
SaaS), an overall-risk pill (green/amber/red), uploaded date, and a status tag (Pending / Analyzing… /
Complete). Show one row in an active "Analyzing…" state with a subtle progress shimmer.
```

## SCREEN 3 — Risk Report (use Experimental mode — most important screen)
```
A contract risk report screen. At the top, an Overall Risk Banner: a large overall-risk pill (e.g. red
"HIGH RISK"), the contract filename and type, and three count pills "3 HIGH · 2 MEDIUM · 5 LOW", plus a
muted pill "2 flagged for human review". Buttons "Download report" and "Re-analyze".

Below it, a vertical stack of clause cards (ordered High → Medium → Low). Each clause card has:
- a thick colored vertical rail on the left matching its risk (red/amber/green),
- a clause number and a clause-type chip (Liability / Termination / IP / Payment / Renewal),
- the clause text in a quiet quoted block,
- a bold risk badge,
- a plain-English explanation paragraph,
- a small muted chip "Grounded on: Unlimited liability",
- a thin "Model confidence" meter showing 92%,
- an expandable "Suggested safer language" section showing a REDLINE DIFF: the risky original wording
  with red strikethrough, and the safer rewrite highlighted in green below, with a "Copy redline" button.

Show ONE special card variant in slate/gray for an abstained clause: an info icon, a "Needs human
review" badge, and the line "No strong match in our clause library — we won't guess on legal risk."
No confidence meter, no redline.

In the top HIGH card, show a prominent inset banner with a history icon:
"⚠ You accepted similar language in 3 past contracts", listing 3 filenames with dates as small links.
Make this banner stand out — it is the signature feature.
```

## SCREEN 4 — Team Dashboard
```
A B2B team dashboard. Header "Contracts" with a filter bar: a risk-level segmented control
(All / High / Medium / Low), a contract-type dropdown, and a search field. A data table with columns:
Filename, Type, Overall Risk (pill), Findings (small "2H 1M 4L" mini-counts), Uploaded by (avatar+name),
Date, Status. Quiet zebra rows, hover highlight. Below the table, an "Audit Log" card titled for
compliance: timestamped rows "Maya Chen uploaded vendor-agreement.pdf", "System analyzed
lease-2024.pdf", newest first, monospace timestamps, a small lock icon implying immutability.
```

## SCREEN 5 — Pricing
```
A pricing page with three cards: Starter $29/user per month (20 contracts/month, risk reports), Team
$99/month (5 seats, unlimited contracts, redline suggestions) marked "Most popular" with a teal ribbon
and a subtle elevated shadow, and Business $299/month (20 seats, API access, custom clause library,
compliance audit log). Each card: plan name, price, feature checklist with teal check icons, and a CTA
button (filled teal for the popular tier, outline for others). A reassurance line below: "Cancel
anytime. SOC2-ready audit trail on every plan."
```

---

## Tips for Stitch specifically
- Generate **one screen per prompt**; Stitch keeps the theme between generations in the same project.
- If a screen comes out too busy, follow up with: *"simplify — more whitespace, fewer borders."*
- To push the brand: *"make the headlines more serif and editorial; reduce accent color usage."*
- Export each screen to **Figma** (to refine) or to **code** — then hand the code to me, OR just use
  Stitch for the *visual direction* and let v0 produce the actual React/Tailwind (v0 code is cleaner to
  wire into the Next.js backend). Recommended combo: **Stitch for look, v0 for code.**
- The data your screens depict must match the backend shapes in `docs/v0-ui-spec.md` (Finding /
  ContractReport / ContractRow / AuditEntry) so the mockups stay truthful to what the app can render.
```
