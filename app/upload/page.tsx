import { TopNav } from '@/components/top-nav'
import { Footer } from '@/components/footer'
import { UploadDropzone } from './upload-dropzone'
import { RecentContracts } from './recent-contracts'

export const metadata = {
  title: 'Upload Contract | ClauseGuard',
  description: 'Upload a PDF or DOCX contract for instant AI-powered risk assessment.',
}

export const dynamic = 'force-dynamic'

export default function UploadPage() {
  return (
    <>
      <TopNav />
      <main className="flex-1 w-full max-w-[1280px] mx-auto px-5 md:px-10 py-12">
        <div className="mb-10">
          <h1 className="font-serif text-[2rem] font-bold text-[#000615] mb-2">
            Secure Document Analysis
          </h1>
          <p className="text-lg text-[#44474D] max-w-2xl leading-relaxed">
            Upload your business contracts for instant, AI-powered risk assessment. We identify
            hidden liabilities so you can sign with confidence.
          </p>
        </div>
        <UploadDropzone />
        <RecentContracts />
      </main>
      <Footer />
    </>
  )
}
