import Link from 'next/link'
import { FileText, FileType, MoreVertical, ArrowRight } from 'lucide-react'
import { RiskBadge } from '@/components/risk-badge'
import { getContractsOrMock } from '@/lib/queries'

const statusConfig = {
  analyzing: {
    label: 'Analyzing…',
    classes: 'bg-[#1FB6A6]/10 text-[#1FB6A6] border border-[#1FB6A6]/30',
    dot: 'bg-[#1FB6A6] animate-ping',
  },
  complete: {
    label: 'Complete',
    classes: 'bg-[#E0E3E6] text-[#44474D]',
    dot: '',
  },
  pending: {
    label: 'Pending Review',
    classes: 'bg-[#F2F4F7] text-[#44474D] opacity-70',
    dot: '',
  },
}

export async function RecentContracts() {
  const { data } = await getContractsOrMock()
  const recent = data.slice(0, 4)
  return (
    <section>
      <div className="flex justify-between items-center mb-5">
        <h3 className="font-serif text-2xl font-semibold text-[#000615]">Recent contracts</h3>
        <Link
          href="/dashboard"
          className="flex items-center gap-1.5 text-sm font-semibold text-[#1FB6A6] hover:underline"
        >
          View all documents
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-[#C4C6CE]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F2F4F7] border-b border-[#C4C6CE]">
                <th className="py-3.5 px-5 text-xs font-bold text-[#44474D] uppercase tracking-wider">
                  Document Name
                </th>
                <th className="py-3.5 px-5 text-xs font-bold text-[#44474D] uppercase tracking-wider">
                  Type
                </th>
                <th className="py-3.5 px-5 text-xs font-bold text-[#44474D] uppercase tracking-wider">
                  Risk Level
                </th>
                <th className="py-3.5 px-5 text-xs font-bold text-[#44474D] uppercase tracking-wider">
                  Date Uploaded
                </th>
                <th className="py-3.5 px-5 text-xs font-bold text-[#44474D] uppercase tracking-wider">
                  Status
                </th>
                <th className="py-3.5 px-5" />
              </tr>
            </thead>
            <tbody>
              {recent.map((contract, i) => {
                const status = statusConfig[contract.status]
                const isAnalyzing = contract.status === 'analyzing'
                return (
                  <tr
                    key={contract.id}
                    className={`border-b border-[#ECEEF1] last:border-0 hover:bg-[#F7F9FC] transition-colors duration-150 ${isAnalyzing ? 'shimmer' : ''}`}
                  >
                    <td className="py-4 px-5">
                      <Link
                        href={`/report/${contract.id}`}
                        className="flex items-center gap-2.5 group"
                      >
                        {contract.filename.endsWith('.pdf') ? (
                          <FileType className="w-5 h-5 text-[#44474D] shrink-0" />
                        ) : (
                          <FileText className="w-5 h-5 text-[#1FB6A6] shrink-0" />
                        )}
                        <span className="text-sm font-semibold text-[#0B1F3A] group-hover:text-[#1FB6A6] transition-colors">
                          {contract.filename}
                        </span>
                      </Link>
                    </td>
                    <td className="py-4 px-5">
                      <span className="px-2.5 py-0.5 bg-[#ECEEF1] text-[#0B1F3A] rounded-full text-xs font-semibold">
                        {contract.contractType}
                      </span>
                    </td>
                    <td className="py-4 px-5">
                      {isAnalyzing ? (
                        <div className="flex items-center gap-2 text-[#44474D]">
                          <div className="w-2 h-2 rounded-full bg-[#C4C6CE] animate-pulse" />
                          <span className="text-xs italic">Calculating…</span>
                        </div>
                      ) : (
                        <RiskBadge level={contract.overallRisk ?? 'low'} />
                      )}
                    </td>
                    <td className="py-4 px-5 text-sm text-[#44474D]">{contract.uploadedAt}</td>
                    <td className="py-4 px-5">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold ${status.classes}`}
                      >
                        {status.dot && (
                          <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                        )}
                        {status.label}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-right">
                      <button
                        aria-label="More options"
                        className="text-[#C4C6CE] hover:text-[#0B1F3A] transition-colors"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
