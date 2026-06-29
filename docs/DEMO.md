# ClauseGuard — Demo Script (3 minutes)

**Live app:** https://clauseguard-manojs-projects-39e96a05.vercel.app
**Repo:** https://github.com/manojmallick/clauseguard
**Track:** AWS × Vercel Hackathon · Track 2 (Monetizable B2B)

> Stack: Amazon **Aurora PostgreSQL + pgvector** (the required AWS database) powering a true RAG
> pipeline, deployed on **Vercel**. Generation currently runs on **Google Gemini** as a fallback while
> the AWS account's **Amazon Bedrock** quota is pending — the code is Bedrock-first and flips back with
> one env var (`AI_PROVIDER=bedrock`). Nothing else changes.

---

## Pre-seeded demo data (already loaded in Aurora)
Two contracts under the demo org **Acme SMB** (uploader: Maya Chen):
- **Northwind_Vendor_Agreement_2023** — the "prior" contract (establishes history for the moat).
- **CloudCRM_MSA_2024** — the contract you open in the demo. Its report shows everything.

**Open this report:**
`/report/d770eba5-2ce2-44bd-acfe-ffc2d44b082a`
(If you re-seed the DB, IDs change — grab the current one from `/dashboard`.)

---

## The run (what to click + say)

**0:00 – 0:25 · Problem**
> "A lawyer charges $400/hr; small businesses sign contracts blind and miss auto-renewal traps and
> unlimited-liability clauses. ClauseGuard reads any contract in ~30 seconds."

Open **/upload**, drag in a PDF/DOCX/TXT contract (or use the pre-seeded ones).

**0:25 – 1:10 · The report** — open **/report/.../** for CloudCRM_MSA_2024.
- Top banner: **HIGH RISK**, with the HIGH/MEDIUM/LOW counts and "1 flagged for review".
- Open the **HIGH "Unlimited liability"** card:
  - plain-English explanation tailored to *this clause's wording*,
  - the **"Grounded on: Unlimited liability"** chip (this is real RAG, grounded on the curated library),
  - the **redline diff** — risky text struck through in red, safer rewrite in green ("Copy redline").

**1:10 – 1:40 · The moat (the line that wins)**
> "And it remembers what *you've* signed before."

Point at the red banner inside the HIGH card:
> **"You accepted similar language in 1 past contract — Northwind_Vendor_Agreement_2023."**
> "That's a second pgvector search over the org's *own* contract history — relational data and vector
> search in **one Aurora query path**. That's why Aurora PostgreSQL is the right database, not a
> bolt-on vector store."

**1:40 – 2:10 · Calibrated uncertainty**
Scroll to the slate **"Needs human review"** card (the bespoke charity-committee clause):
> "No strong match in our clause library, so it won't guess on legal risk — it abstains and flags for a
> human. A legal tool that knows what it doesn't know is the one you can trust."

(Optional: note the **retrieval distance** — 0.41, beyond our 0.35 grounding floor — that's the
calibration deciding to abstain.)

**2:10 – 3:00 · Architecture + B2B**
Open **/dashboard**:
- the contracts table (live from Aurora) + the **compliance audit log** (every upload/analyze, immutable).
> "Amazon Aurora PostgreSQL with pgvector powers our RAG — retrieval over a curated clause library
> **and** the customer's own contract history — with full ACID for the compliance audit log. One
> database, both jobs. Generation is provider-portable (Bedrock-first; Gemini today)."

Close on **/pricing** (Starter $29 / Team $99 / Business $299) — "paying customers from day one."

---

## If you need to reset to a clean demo state
The setup endpoint is idempotent and guarded by `SETUP_SECRET` (in Vercel env). To wipe + reseed the
30-pattern library and reload the two demo contracts, re-run the documented setup + upload calls
(see the project owner's notes). Distances and IDs regenerate; update the report link from `/dashboard`.

## Submission checklist
- [x] Public repo (manojmallick/clauseguard) — all commits authored by Manoj Mallick.
- [x] Deployed on Vercel (public URL above).
- [x] Uses Amazon Aurora PostgreSQL (required AWS database) via the Vercel Marketplace integration.
- [ ] **Storage Configuration screenshot** — Vercel → clauseguard → Storage tab (Amazon Aurora PostgreSQL).
- [ ] Vercel Team ID in the submission form.
- [ ] Demo video (<3 min) following the script above.
