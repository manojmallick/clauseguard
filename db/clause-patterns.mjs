// ─────────────────────────────────────────────────────────────
// ClauseGuard curated clause library — 30 known-risky patterns.
// This is the RAG knowledge base. Each is embedded (example_text) at seed time
// and retrieved at analysis time to ground the LLM. clause_type ∈
// liability | termination | ip | payment | renewal | other (matches the UI).
// ─────────────────────────────────────────────────────────────

/** @type {Array<{pattern_name:string,clause_type:string,risk_level:'low'|'medium'|'high',example_text:string,explanation:string,safer_version:string}>} */
export const CLAUSE_PATTERNS = [
  {
    pattern_name: 'Unlimited liability',
    clause_type: 'liability',
    risk_level: 'high',
    example_text:
      'Customer shall indemnify and hold Provider harmless against any and all claims, damages, and losses without limitation.',
    explanation:
      'You take on unlimited financial responsibility. A single claim could exceed the contract value many times over and threaten company solvency.',
    safer_version:
      'Customer liability for all claims under this Agreement is capped at the total fees paid in the 12 months preceding the claim.',
  },
  {
    pattern_name: 'Auto-renewal trap',
    clause_type: 'renewal',
    risk_level: 'high',
    example_text:
      'This Agreement shall automatically renew for successive multi-year terms unless terminated at least 90 days prior to the renewal date.',
    explanation:
      'The contract auto-renews for a long term unless you cancel far in advance. The wide notice window is easy to miss and locks you in.',
    safer_version:
      'This Agreement renews month-to-month after the initial term, cancellable with 30 days written notice.',
  },
  {
    pattern_name: 'Unilateral IP assignment',
    clause_type: 'ip',
    risk_level: 'high',
    example_text:
      'All work product and any related intellectual property, including pre-existing materials, shall become the sole property of Company.',
    explanation:
      'You give up rights to everything you create — possibly including pre-existing IP and reusable tools you built before this engagement.',
    safer_version:
      'Customer retains ownership of pre-existing IP; only deliverables created specifically under this SOW transfer to Company, with a license back for your background IP.',
  },
  {
    pattern_name: 'One-sided indemnification',
    clause_type: 'liability',
    risk_level: 'high',
    example_text:
      'Customer shall defend, indemnify, and hold harmless Provider from any claims arising out of this Agreement, including Provider’s own negligence.',
    explanation:
      'You must cover the other party’s legal costs even when they are at fault. Indemnity flows only one direction.',
    safer_version:
      'Each party indemnifies the other only for claims arising from its own breach, negligence, or willful misconduct (mutual indemnification).',
  },
  {
    pattern_name: 'Overbroad non-compete',
    clause_type: 'other',
    risk_level: 'high',
    example_text:
      'For five (5) years following termination, Customer shall not engage in any business that competes with Provider anywhere in the world.',
    explanation:
      'A worldwide, multi-year non-compete is unusually broad, often unenforceable, and can block you from normal business activity.',
    safer_version:
      'Non-compete is limited to 12 months, the specific market segment, and the geography where the parties actually operate.',
  },
  {
    pattern_name: 'Vendor termination for convenience',
    clause_type: 'termination',
    risk_level: 'high',
    example_text:
      'Provider may terminate this Agreement at any time for any reason upon 10 days notice; Customer may not terminate prior to the end of the term.',
    explanation:
      'The vendor can walk away on short notice while you are locked in. The termination right is asymmetric and favors the vendor.',
    safer_version:
      'Either party may terminate for convenience on 30 days written notice, with a pro-rata refund of prepaid fees.',
  },
  {
    pattern_name: 'No customer termination right',
    clause_type: 'termination',
    risk_level: 'high',
    example_text:
      'Customer may not terminate this Agreement for any reason during the term, including for Provider’s breach, except as required by law.',
    explanation:
      'You cannot exit even if the vendor fails to perform. This removes your primary leverage and traps you in a bad deal.',
    safer_version:
      'Customer may terminate for material breach if uncured within 30 days of notice, and for convenience with 60 days notice.',
  },
  {
    pattern_name: 'Liquidated damages penalty',
    clause_type: 'payment',
    risk_level: 'high',
    example_text:
      'Upon any breach, Customer shall immediately pay liquidated damages equal to the full remaining contract value.',
    explanation:
      'A breach triggers payment of the entire remaining contract value regardless of actual harm — a penalty that may far exceed real damages.',
    safer_version:
      'Damages are limited to the actual, documented losses directly caused by the breach.',
  },
  {
    pattern_name: 'Personal guarantee',
    clause_type: 'liability',
    risk_level: 'high',
    example_text:
      'The undersigned personally and unconditionally guarantees all obligations of Customer under this Agreement.',
    explanation:
      'You are personally liable for the company’s obligations, piercing the limited-liability protection of your business entity.',
    safer_version:
      'Obligations are those of the company only; no personal guarantee is required.',
  },
  {
    pattern_name: 'Uncapped IP infringement indemnity',
    clause_type: 'liability',
    risk_level: 'high',
    example_text:
      'Customer shall indemnify Provider for all intellectual property infringement claims without any cap or limitation of liability.',
    explanation:
      'IP claims are carved out of the liability cap, exposing you to unlimited damages from a single infringement allegation.',
    safer_version:
      'IP indemnity is mutual and subject to the overall liability cap, with the indemnifying party controlling the defense.',
  },
  {
    pattern_name: 'Unilateral amendment',
    clause_type: 'other',
    risk_level: 'high',
    example_text:
      'Provider may modify the terms of this Agreement at any time by posting an updated version; continued use constitutes acceptance.',
    explanation:
      'The vendor can change the deal unilaterally at any time, so the terms you signed are not the terms you are bound by.',
    safer_version:
      'Amendments require mutual written agreement; material changes need 30 days notice and a right to terminate.',
  },
  {
    pattern_name: 'Vendor data ownership',
    clause_type: 'ip',
    risk_level: 'high',
    example_text:
      'All data uploaded, generated, or derived through the Service shall be the exclusive property of Provider.',
    explanation:
      'The vendor claims ownership of your business data, which can lock you in and prevent you from leaving with your own records.',
    safer_version:
      'Customer retains all ownership of its data; Provider receives only a limited license to operate the Service and must return/delete data on termination.',
  },
  {
    pattern_name: 'Broad license to customer data',
    clause_type: 'ip',
    risk_level: 'medium',
    example_text:
      'Customer grants Provider a perpetual, irrevocable, worldwide license to use Customer Data and feedback for any purpose.',
    explanation:
      'The vendor gets sweeping, permanent rights to use your data and ideas — including for purposes beyond delivering the service.',
    safer_version:
      'Provider may use Customer Data only as needed to provide the Service; any other use requires consent and is limited in scope and time.',
  },
  {
    pattern_name: 'Mandatory arbitration with class waiver',
    clause_type: 'other',
    risk_level: 'medium',
    example_text:
      'All disputes shall be resolved by binding arbitration, and the parties waive any right to a jury trial or to participate in a class action.',
    explanation:
      'You give up court and class-action rights. Arbitration can be costly and favors the party that drafted the clause.',
    safer_version:
      'Disputes may be brought in court; if arbitration is used it is mutual, in a neutral venue, with shared costs.',
  },
  {
    pattern_name: 'Uncapped price escalation',
    clause_type: 'payment',
    risk_level: 'medium',
    example_text:
      'Provider may increase fees at each renewal by any amount in its sole discretion.',
    explanation:
      'There is no ceiling on price increases at renewal, so costs can rise sharply with no recourse other than leaving.',
    safer_version:
      'Renewal price increases are capped at the lesser of 5% or CPI, with advance notice.',
  },
  {
    pattern_name: 'Extended payment window',
    clause_type: 'payment',
    risk_level: 'low',
    example_text:
      'Customer shall remit payment within sixty (60) days of receipt of a valid invoice.',
    explanation:
      'Net-60 is longer than typical Net-30 terms and can strain cash flow, though it is within negotiable industry norms.',
    safer_version:
      'Customer shall remit payment within thirty (30) days of receipt of a valid invoice.',
  },
  {
    pattern_name: 'Punitive late-payment interest',
    clause_type: 'payment',
    risk_level: 'medium',
    example_text:
      'Overdue amounts shall accrue interest at 5% per month until paid in full.',
    explanation:
      'A 5% monthly rate is roughly 60% annualized — far above commercial norms and potentially unenforceable as a penalty.',
    safer_version:
      'Overdue amounts accrue interest at 1% per month or the maximum permitted by law, whichever is lower.',
  },
  {
    pattern_name: 'Early termination fee',
    clause_type: 'termination',
    risk_level: 'medium',
    example_text:
      'If Customer terminates early, Customer shall pay an early termination fee equal to 100% of the remaining contract value.',
    explanation:
      'Leaving early costs you the full remaining value, which removes any practical ability to exit.',
    safer_version:
      'Early termination fee, if any, is limited to a reasonable, pre-agreed amount reflecting actual unrecovered costs.',
  },
  {
    pattern_name: 'Perpetual confidentiality',
    clause_type: 'other',
    risk_level: 'medium',
    example_text:
      'Customer’s confidentiality obligations shall survive in perpetuity, while Provider’s obligations terminate after one year.',
    explanation:
      'Your confidentiality duties never end while theirs expire quickly — an asymmetric, hard-to-manage obligation.',
    safer_version:
      'Confidentiality obligations are mutual and survive for a fixed period (e.g., 3–5 years) after termination, except for trade secrets.',
  },
  {
    pattern_name: 'Employee non-solicitation',
    clause_type: 'other',
    risk_level: 'medium',
    example_text:
      'Customer shall not, for three years, solicit or hire any current or former employee of Provider.',
    explanation:
      'A broad, multi-year ban — especially covering former employees — can unexpectedly restrict normal hiring.',
    safer_version:
      'Non-solicitation is limited to 12 months and to current employees directly involved in the engagement; general job postings are excluded.',
  },
  {
    pattern_name: 'Vendor assignment without consent',
    clause_type: 'other',
    risk_level: 'low',
    example_text:
      'Provider may assign this Agreement to any third party without Customer’s consent; Customer may not assign without Provider’s consent.',
    explanation:
      'The vendor can hand your contract to anyone (including a competitor) while you cannot, creating an imbalance.',
    safer_version:
      'Either party may assign in connection with a merger or sale of substantially all assets, with notice; other assignments need consent.',
  },
  {
    pattern_name: 'Vendor liability cap, customer uncapped',
    clause_type: 'liability',
    risk_level: 'high',
    example_text:
      'Provider’s total liability shall not exceed fees paid in the prior month; Customer’s liability shall be unlimited.',
    explanation:
      'Liability is capped very low for the vendor but unlimited for you — a one-sided allocation of risk.',
    safer_version:
      'Both parties’ liability is capped at fees paid in the prior 12 months, with standard mutual carve-outs.',
  },
  {
    pattern_name: 'As-is warranty disclaimer',
    clause_type: 'other',
    risk_level: 'medium',
    example_text:
      'The Service is provided “AS IS” without warranties of any kind, including fitness for a particular purpose.',
    explanation:
      'The vendor disclaims all warranties, so you have little recourse if the product does not work as expected.',
    safer_version:
      'Provider warrants the Service will materially conform to its documentation and will remedy non-conformities.',
  },
  {
    pattern_name: 'Most-favored-customer obligation',
    clause_type: 'other',
    risk_level: 'medium',
    example_text:
      'Customer shall ensure Provider always receives terms at least as favorable as those Customer offers any other vendor.',
    explanation:
      'This forces you to extend your best terms to this vendor forever, constraining future negotiations with others.',
    safer_version:
      'Remove the most-favored clause, or narrow it to a specific, defined category for a limited time.',
  },
  {
    pattern_name: 'Intrusive audit rights',
    clause_type: 'other',
    risk_level: 'medium',
    example_text:
      'Provider may audit Customer’s premises, books, and systems at any time without notice, at Customer’s expense.',
    explanation:
      'No-notice audits at your cost are disruptive and can expose sensitive information beyond what the deal requires.',
    safer_version:
      'Audits occur no more than once a year, on 30 days notice, during business hours, at the auditing party’s expense.',
  },
  {
    pattern_name: 'Foreign governing law and venue',
    clause_type: 'other',
    risk_level: 'medium',
    example_text:
      'This Agreement is governed by the laws of a foreign jurisdiction, and all disputes must be litigated exclusively there.',
    explanation:
      'Disputes must be fought in a distant, unfamiliar legal system, raising your cost and difficulty of enforcement.',
    safer_version:
      'Governing law and venue are in your home jurisdiction, or a mutually convenient neutral one.',
  },
  {
    pattern_name: 'One-sided force majeure',
    clause_type: 'other',
    risk_level: 'low',
    example_text:
      'Provider is excused from performance for any force majeure event; Customer’s payment obligations continue regardless.',
    explanation:
      'The vendor is excused during disruptions but you must keep paying even if you receive nothing.',
    safer_version:
      'Force majeure relief is mutual; payment obligations for undelivered services are suspended during the event.',
  },
  {
    pattern_name: 'SLA without remedies',
    clause_type: 'other',
    risk_level: 'low',
    example_text:
      'Provider targets 99.9% uptime; however, failure to meet this target entitles Customer to no credits or remedies.',
    explanation:
      'The uptime promise has no teeth — there is no compensation or exit right if the vendor misses it.',
    safer_version:
      'Missing the SLA entitles Customer to service credits, and chronic failure allows termination for cause.',
  },
  {
    pattern_name: 'Automatic scope/fee expansion',
    clause_type: 'payment',
    risk_level: 'medium',
    example_text:
      'Provider may add services it deems necessary and invoice Customer for them without prior approval.',
    explanation:
      'The vendor can unilaterally expand the work and bill you for it, defeating any agreed budget.',
    safer_version:
      'Any additional services and fees require a written change order signed by both parties before work begins.',
  },
  {
    pattern_name: 'Waiver of consequential-damages carve-out',
    clause_type: 'liability',
    risk_level: 'medium',
    example_text:
      'Customer waives the consequential-damages exclusion, accepting liability for all indirect and consequential losses.',
    explanation:
      'You accept responsibility for indirect losses (lost profits, downstream costs) that are normally excluded, widening your exposure.',
    safer_version:
      'Neither party is liable for indirect, incidental, or consequential damages, subject to standard mutual carve-outs.',
  },
];
