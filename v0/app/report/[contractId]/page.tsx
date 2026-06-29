import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Download, RefreshCw, ChevronLeft, Flag, FileText } from 'lucide-react'
import { TopNav } from '@/components/top-nav'
import { Footer } from '@/components/footer'
import { ClauseCard } from '@/components/clause-card'
import { contracts, mockReport } from '@/lib/data'

interface Props {
  params: Promise<{ contractId: string }>
}

export async function generateMetadata({ params }: Props) {
  const { contractId } = await params
  const contract = contracts.find((c) => c.id === contractId)
  return {
    title: contract
      ? `Risk Report: ${contract.filename} | ClauseGuard`
      : 'Risk Report | ClauseGuard',
  }
}

const overallBannerConfig = {
  high: { label: 'HIGH RISK', classes: 'bg-[#DC2626] text-white' },
  medium: { label: 'MODERATE RISK', classes: 'bg-[#D97706] text-white' },
  low: { label: 'LOW RISK', classes: 'bg-[#16A34A] text-white' },
  abstained: { label: 'NEEDS REVIEW', classes: 'bg-[#64748B] text-white' },
}

export default async function ReportPage({ params }: Props) {
  const { contractId } = await params
  const contract = contracts.find((c) => c.id === contractId)
  if (!contract) notFound()

  // In production, swap mockReport for a real fetch: GET /api/report?contractId=…
  const report = mockReport
  const overall = contract.overallRisk
  const banner = overall ? overallBannerConfig[overall] : null
  const { high, medium, low, abstained: abstainedCount } = report.counts
  // Sort: high → medium → low → abstained
  const sortOrder: Record<string, number> = { high: 0, medium: 1, low: 2 }
  const sortedFindings = [...report.findings].sort((a, b) => {
    const aKey = a.abstained ? 3 : (sortOrder[a.riskLevel ?? ''] ?? 3)
    const bKey = b.abstained ? 3 : (sortOrder[b.riskLevel ?? ''] ?? 3)
    return aKey - bKey
  })

  return (
    <>
      <TopNav />
      <main className="flex-1 w-full max-w-[1280px] mx-auto px-5 md:px-10 py-10">
        {/* Back link */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-[#44474D] hover:text-[#0B1F3A] mb-6 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        {/* Overall Risk Banner */}
        <section className="mb-10">
          <div className="bg-white border border-[#E0E3E6] rounded-2xl overflow-hidden shadow-sm">
            {/* Color accent strip */}
            {banner && (
              <div className={`h-1.5 w-full ${banner.classes}`} />
            )}
            <div className="p-6 md:p-8">
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                {/* Left: title + meta */}
                <div className="space-y-4 min-w-0">
                  <div className="flex flex-wrap items-center gap-3">
                    {banner && (
                      <span
                        className={`text-xs font-bold uppercase tracking-widest px-3.5 py-1.5 rounded-full ${banner.classes}`}
                      >
                        {banner.label}
                      </span>
                    )}
                    <span className="flex items-center gap-1.5 bg-[#ECEEF1] text-[#44474D] text-xs font-semibold px-2.5 py-1 rounded-lg">
                      <FileText className="w-3.5 h-3.5" />
                      {contract.contractType}
                    </span>
                  </div>
                  <h1 className="font-serif text-2xl font-bold text-[#000615] leading-snug break-words">
                    {contract.filename}
                  </h1>
                  {/* Count pills */}
                  <div className="flex flex-wrap gap-2">
                    {high > 0 && (
                      <span className="bg-[#FEF2F2] text-[#DC2626] border border-[#DC2626]/20 text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full tabular-nums">
                        {high} HIGH
                      </span>
                    )}
                    {medium > 0 && (
                      <span className="bg-[#FFFBEB] text-[#D97706] border border-[#D97706]/20 text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full tabular-nums">
                        {medium} MEDIUM
                      </span>
                    )}
                    {low > 0 && (
                      <span className="bg-[#F0FDF4] text-[#16A34A] border border-[#16A34A]/20 text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full tabular-nums">
                        {low} LOW
                      </span>
                    )}
                    {abstainedCount > 0 && (
                      <span className="bg-[#F8FAFC] text-[#64748B] border border-[#CBD5E1] text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full flex items-center gap-1.5 tabular-nums">
                        <Flag className="w-3 h-3" />
                        {abstainedCount} flagged for review
                      </span>
                    )}
                  </div>
                </div>

                {/* Right: actions */}
                <div className="flex gap-3 shrink-0">
                  <button className="flex items-center gap-2 bg-[#F2F4F7] border border-[#C4C6CE] text-[#0B1F3A] px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#E0E3E6] transition-all active:scale-95">
                    <Download className="w-4 h-4" />
                    Download report
                  </button>
                  <button className="flex items-center gap-2 bg-[#0B1F3A] text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:brightness-125 transition-all active:scale-95 shadow-md">
                    <RefreshCw className="w-4 h-4" />
                    Re-analyze
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Findings stack — sorted HIGH → MEDIUM → LOW → ABSTAINED */}
        <div className="space-y-5">
          {sortedFindings.map((finding) => (
            <ClauseCard key={finding.clauseId} clause={finding} />
          ))}
        </div>
      </main>
      <Footer />
    </>
  )
}
