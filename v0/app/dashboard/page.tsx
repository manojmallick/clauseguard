import { TopNav } from '@/components/top-nav'
import { Footer } from '@/components/footer'
import { ContractsTable } from './contracts-table'
import { AuditLog } from './audit-log'

export const metadata = {
  title: 'Dashboard | ClauseGuard',
  description: 'Team view of all contracts with risk filters and compliance audit log.',
}

export default function DashboardPage() {
  return (
    <>
      <TopNav />
      <main className="flex-1 w-full max-w-[1280px] mx-auto px-5 md:px-10 py-10">
        <h1 className="font-serif text-[2rem] font-bold text-[#000615] mb-8">Contracts</h1>
        <ContractsTable />
        <AuditLog />
      </main>
      <Footer />
    </>
  )
}
