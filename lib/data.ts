// ────────────────────────────────────────────────
// Canonical TypeScript interfaces — mirrors /api/analyze response shapes.
// Components are purely presentational; pass these in from server data.
// ────────────────────────────────────────────────

// One analyzed clause finding — the shape /api/analyze returns per clause
export interface Finding {
  clauseId: string
  clauseNumber: number
  clauseType: 'liability' | 'termination' | 'ip' | 'payment' | 'renewal' | 'other'
  clauseText: string
  isRisk: boolean
  abstained?: boolean // true => render the "needs human review" variant
  note?: string // shown on abstained cards
  riskLevel?: 'low' | 'medium' | 'high'
  explanation?: string // AI-generated, specific to this clause's wording
  redline?: string // safer rewrite (for the diff "after" side)
  groundedOnPattern?: string // e.g. "Unlimited liability"
  confidence?: number // 0..1  -> render as %
  priorExposure?: Array<{ contractId: string; filename: string; date: string }>
  retrievalDistance?: number // cosine distance to nearest pattern (calibration insight)
}

export interface ContractReport {
  contractId: string
  filename: string
  contractType: 'nda' | 'lease' | 'sow' | 'vendor' | 'saas' | 'other'
  overallRisk: 'low' | 'medium' | 'high'
  counts: { high: number; medium: number; low: number; abstained: number }
  findings: Finding[]
}

export interface ContractRow {
  id: string
  filename: string
  contractType: string
  overallRisk: 'low' | 'medium' | 'high' | null
  counts: { high: number; medium: number; low: number }
  uploadedBy: string
  uploadedAt: string
  status: 'pending' | 'analyzing' | 'complete'
}

export interface AuditEntry {
  id: string
  user: string
  action: 'uploaded' | 'analyzed' | 'exported'
  filename: string
  timestamp: string
}

// ────────────────────────────────────────────────
// Mock contracts (ContractRow[])
// ────────────────────────────────────────────────
export const contracts: ContractRow[] = [
  {
    id: 'c1',
    filename: 'vendor-agreement-2024.pdf',
    contractType: 'Vendor Agreement',
    overallRisk: 'high',
    uploadedAt: 'Oct 12, 2024',
    status: 'complete',
    uploadedBy: 'Maya Chen',
    counts: { high: 2, medium: 1, low: 2 },
  },
  {
    id: 'c2',
    filename: 'office-lease-v3.docx',
    contractType: 'Lease',
    overallRisk: 'medium',
    uploadedAt: 'Oct 11, 2024',
    status: 'complete',
    uploadedBy: 'Jordan Smith',
    counts: { high: 0, medium: 3, low: 2 },
  },
  {
    id: 'c3',
    filename: 'employment-offer-dev.pdf',
    contractType: 'Employment',
    overallRisk: 'low',
    uploadedAt: 'Oct 10, 2024',
    status: 'complete',
    uploadedBy: 'Alex Rivera',
    counts: { high: 0, medium: 0, low: 1 },
  },
  {
    id: 'c4',
    filename: 'Northside_Master_Services_v2.docx',
    contractType: 'SaaS',
    overallRisk: null,
    uploadedAt: 'Oct 24, 2024',
    status: 'analyzing',
    uploadedBy: 'Maya Chen',
    counts: { high: 0, medium: 0, low: 0 },
  },
  {
    id: 'c5',
    filename: 'Mutual_NDA_Standard.pdf',
    contractType: 'NDA',
    overallRisk: 'low',
    uploadedAt: 'Oct 22, 2024',
    status: 'complete',
    uploadedBy: 'Jordan Smith',
    counts: { high: 0, medium: 1, low: 3 },
  },
  {
    id: 'c6',
    filename: 'Office_Lease_Agreement_Final.docx',
    contractType: 'Lease',
    overallRisk: 'high',
    uploadedAt: 'Oct 19, 2024',
    status: 'complete',
    uploadedBy: 'Alex Rivera',
    counts: { high: 3, medium: 2, low: 1 },
  },
  {
    id: 'c7',
    filename: 'Vendor_Agreement_CloudTech.docx',
    contractType: 'Vendor',
    overallRisk: 'medium',
    uploadedAt: 'Oct 15, 2024',
    status: 'pending',
    uploadedBy: 'Maya Chen',
    counts: { high: 0, medium: 2, low: 4 },
  },
]

// ────────────────────────────────────────────────
// Mock ContractReport for /report/c1
// Seeded per spec: HIGH unlimited-liability w/ priorExposure, HIGH auto-renewal
// redline, MEDIUM unilateral IP, one abstained bespoke indemnity, LOW benign clauses.
// ────────────────────────────────────────────────
export const mockReport: ContractReport = {
  contractId: 'c1',
  filename: 'vendor-agreement-2024.pdf',
  contractType: 'vendor',
  overallRisk: 'high',
  counts: { high: 2, medium: 1, low: 2, abstained: 1 },
  findings: [
    {
      clauseId: 'cl1',
      clauseNumber: 14,
      clauseType: 'liability',
      isRisk: true,
      riskLevel: 'high',
      clauseText:
        "The Contractor's total liability under this Agreement shall be unlimited for any breach of confidentiality, intellectual property infringement, or gross negligence, and Client shall be entitled to seek any remedy available at law or in equity.",
      explanation:
        'This clause exposes your business to uncapped financial damages. In the event of a dispute, insurance coverage may not be sufficient to cover the potential judgment amount, creating a material risk to company solvency.',
      redline:
        "The Contractor's total liability <del>under this Agreement shall be unlimited</del> <ins>for all claims arising under this Agreement shall not exceed the total fees paid by Client to Contractor in the 12 months preceding the claim</ins>, and Client shall be entitled to seek any remedy available at law or in equity.",
      groundedOnPattern: 'Unlimited liability',
      confidence: 0.92,
      priorExposure: [
        { contractId: 'px1', filename: 'Vendor_Agreement_2023.pdf', date: 'Oct 12, 2023' },
        { contractId: 'px2', filename: 'Client_SOW_Phase1.pdf', date: 'Jan 04, 2024' },
        { contractId: 'px3', filename: 'Platform_TOS_Update.docx', date: 'May 22, 2024' },
      ],
    },
    {
      clauseId: 'cl2',
      clauseNumber: 9,
      clauseType: 'renewal',
      isRisk: true,
      riskLevel: 'high',
      clauseText:
        'This Agreement shall automatically renew for successive one-year terms unless either party provides written notice of non-renewal no fewer than 90 days prior to the expiration of the then-current term.',
      explanation:
        'The 90-day non-renewal window is an auto-renewal trap: missing it by even one day locks you into another full year. Most SaaS and vendor contracts use 30–60 days. The asymmetry here strongly favors the vendor.',
      redline:
        'This Agreement shall automatically renew for successive one-year terms unless either party provides written notice of non-renewal no fewer than <del>90 days</del> <ins>30 days</ins> prior to the expiration of the then-current term.',
      groundedOnPattern: 'Auto-renewal trap',
      confidence: 0.88,
    },
    {
      clauseId: 'cl3',
      clauseNumber: 6,
      clauseType: 'ip',
      isRisk: true,
      riskLevel: 'medium',
      clauseText:
        'All work product, inventions, and developments created by Contractor — including any pre-existing tools, frameworks, or methodologies used or incorporated into deliverables — shall be the sole and exclusive property of Client.',
      explanation:
        'This is a unilateral IP assignment that reaches beyond the scope of work. Signing this could strip you of reusable tools and code you built before this engagement, permanently assigning them to the client.',
      redline:
        'All work product and developments <del>created by Contractor — including any pre-existing tools, frameworks, or methodologies used or incorporated into deliverables — shall be the sole and exclusive property of Client.</del> <ins>specifically created for Client under this Agreement shall be owned by Client. Contractor retains all rights to pre-existing IP, tools, and frameworks, granting Client a non-exclusive, royalty-free license to use them solely in connection with the deliverables.</ins>',
      groundedOnPattern: 'Unilateral IP assignment',
      confidence: 0.97,
    },
    {
      clauseId: 'cl4',
      clauseNumber: 19,
      clauseType: 'other',
      isRisk: false,
      abstained: true,
      clauseText:
        'Notwithstanding anything to the contrary herein, each Party shall indemnify, defend, and hold harmless the other Party from any Claims arising from the indemnifying Party\'s acts or omissions in connection with any sub-processing arrangement entered into pursuant to Schedule 4, Annex II(b), as amended from time to time by mutual written consent.',
      note: 'Bespoke cross-indemnity tied to a sub-processing schedule (Annex II(b)) not included in this upload. We cannot assess risk without the full Schedule 4 context. A specialist should review this alongside the referenced annex.',
    },
    {
      clauseId: 'cl5',
      clauseNumber: 3,
      clauseType: 'payment',
      isRisk: true,
      riskLevel: 'low',
      clauseText: 'Client shall remit payment within 60 days of receipt of a valid invoice.',
      explanation:
        'Net-60 is longer than typical SMB terms (Net-30), which may create cash flow challenges. However, this is within negotiable industry norms and does not create material legal risk.',
      redline:
        'Client shall remit payment within <del>60 days</del> <ins>30 days</ins> of receipt of a valid invoice.',
      groundedOnPattern: 'Extended payment window',
      confidence: 0.78,
    },
    {
      clauseId: 'cl6',
      clauseNumber: 21,
      clauseType: 'other',
      isRisk: false,
      riskLevel: 'low',
      clauseText:
        'Either party may assign this Agreement to a successor entity in connection with a merger, acquisition, or sale of all or substantially all of its assets, provided that the assignee assumes all obligations herein.',
      explanation:
        'Standard assignment-on-acquisition language. Both parties retain the right to assign in M&A contexts, with the obligation carryover requirement protecting you as the non-assigning party.',
      groundedOnPattern: 'Standard assignment clause',
      confidence: 0.85,
    },
  ],
}

// ────────────────────────────────────────────────
// Mock audit log — newest first
// ────────────────────────────────────────────────
export const auditLog: AuditEntry[] = [
  {
    id: 'a10',
    timestamp: '2024-10-24T19:08:44Z',
    user: 'Maya Chen',
    action: 'uploaded',
    filename: 'Northside_Master_Services_v2.docx',
  },
  {
    id: 'a9',
    timestamp: '2024-10-22T13:55:07Z',
    user: 'System',
    action: 'analyzed',
    filename: 'Mutual_NDA_Standard.pdf',
  },
  {
    id: 'a8',
    timestamp: '2024-10-22T13:48:21Z',
    user: 'Jordan Smith',
    action: 'uploaded',
    filename: 'Mutual_NDA_Standard.pdf',
  },
  {
    id: 'a7',
    timestamp: '2024-10-19T10:20:55Z',
    user: 'Alex Rivera',
    action: 'exported',
    filename: 'Office_Lease_Agreement_Final.docx',
  },
  {
    id: 'a6',
    timestamp: '2024-10-19T09:05:33Z',
    user: 'System',
    action: 'analyzed',
    filename: 'Office_Lease_Agreement_Final.docx',
  },
  {
    id: 'a5',
    timestamp: '2024-10-15T16:44:10Z',
    user: 'Maya Chen',
    action: 'uploaded',
    filename: 'Vendor_Agreement_CloudTech.docx',
  },
  {
    id: 'a4',
    timestamp: '2024-10-12T14:33:22Z',
    user: 'System',
    action: 'analyzed',
    filename: 'vendor-agreement-2024.pdf',
  },
  {
    id: 'a3',
    timestamp: '2024-10-12T14:32:01Z',
    user: 'Maya Chen',
    action: 'uploaded',
    filename: 'vendor-agreement-2024.pdf',
  },
  {
    id: 'a2',
    timestamp: '2024-10-11T09:15:22Z',
    user: 'Jordan Smith',
    action: 'exported',
    filename: 'office-lease-v3.docx',
  },
  {
    id: 'a1',
    timestamp: '2024-10-10T11:02:55Z',
    user: 'Alex Rivera',
    action: 'uploaded',
    filename: 'employment-offer-dev.pdf',
  },
]
