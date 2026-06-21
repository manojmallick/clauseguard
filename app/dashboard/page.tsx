import { TopNav } from '@/components/top-nav'
import { Footer } from '@/components/footer'
import { ContractsTable } from './contracts-table'
import { AuditLog } from './audit-log'
import { getContractsOrMock, getAuditOrMock } from '@/lib/queries'

export const metadata = {
  title: 'Dashboard | ClauseGuard',
  description: 'Team view of all contracts with risk filters and compliance audit log.',
}

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const [{ data: contracts, live }, { data: audit }] = await Promise.all([
    getContractsOrMock(),
    getAuditOrMock(),
  ])

  return (
    <>
      <TopNav />
      <main className="flex-1 w-full max-w-[1280px] mx-auto px-5 md:px-10 py-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-serif text-[2rem] font-bold text-[#000615]">Contracts</h1>
          {!live && (
            <span className="text-xs font-semibold text-[#D97706] bg-[#FFFBEB] border border-[#D97706]/20 px-3 py-1 rounded-full">
              Demo data — connect Aurora to go live
            </span>
          )}
        </div>
        <ContractsTable contracts={contracts} />
        <AuditLog entries={audit} />
      </main>
      <Footer />
    </>
  )
}
