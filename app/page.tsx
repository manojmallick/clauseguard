import Link from 'next/link'
import {
  ShieldCheck,
  Upload,
  BrainCircuit,
  Gavel,
  AlertTriangle,
  Sparkles,
  Lock,
  BadgeCheck,
} from 'lucide-react'
import { TopNav } from '@/components/top-nav'
import { Footer } from '@/components/footer'

export default function LandingPage() {
  return (
    <>
      <TopNav />
      <main className="flex-1">
        {/* Hero */}
        <section
          className="relative overflow-hidden pt-20 pb-28"
          style={{ background: 'radial-gradient(circle at top right, #D6E3FF 0%, #F7F9FC 60%)' }}
        >
          <div className="max-w-[1280px] mx-auto px-5 md:px-10 grid md:grid-cols-2 gap-14 items-center">
            <div className="z-10">
              <div className="inline-flex items-center gap-2 bg-[#1FB6A6]/10 text-[#1FB6A6] border border-[#1FB6A6]/20 rounded-full px-4 py-1.5 text-xs font-semibold mb-6 uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5" />
                AI-Powered Contract Risk Scanner
              </div>
              <h1 className="font-serif text-[2.75rem] leading-[1.15] font-bold text-[#000615] mb-6 text-balance">
                Catch the risky clause before you sign.
              </h1>
              <p className="text-lg leading-relaxed text-[#44474D] mb-10 max-w-lg">
                Small businesses sign contracts they can&apos;t afford a $400/hour lawyer to read.
                ClauseGuard reads them in 30 seconds — flagging liabilities in plain English.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/upload"
                  className="inline-flex items-center justify-center gap-2 bg-[#1FB6A6] text-white px-8 py-3.5 rounded-xl text-sm font-semibold shadow-sm hover:brightness-110 active:scale-95 transition-all"
                >
                  <Upload className="w-4 h-4" />
                  Scan a contract free
                </Link>
                <a
                  href="#how-it-works"
                  className="inline-flex items-center justify-center gap-2 bg-transparent border border-[#C4C6CE] text-[#191C1E] px-8 py-3.5 rounded-xl text-sm font-semibold hover:bg-[#ECEEF1] transition-all"
                >
                  See how it works
                </a>
              </div>
            </div>

            {/* Product preview card */}
            <div className="relative">
              <div className="bg-white/80 backdrop-blur-sm border border-[#E0E3E6] rounded-2xl p-6 shadow-xl rotate-1 md:translate-x-4">
                <div className="flex justify-between items-center mb-5 pb-4 border-b border-[#ECEEF1]">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded bg-[#F2F4F7] flex items-center justify-center">
                      <ShieldCheck className="w-4 h-4 text-[#0B1F3A]" />
                    </div>
                    <span className="text-sm font-semibold text-[#191C1E]">Vendor_Agreement_v2.pdf</span>
                  </div>
                  <span className="bg-[#FEF2F2] text-[#DC2626] border border-[#DC2626]/20 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                    High Risk Found
                  </span>
                </div>
                <div className="bg-[#F2F4F7] p-4 rounded-xl border-l-4 border-[#DC2626] mb-4">
                  <p className="text-sm italic text-[#44474D] mb-3 line-through opacity-60 leading-relaxed">
                    &quot;...Company reserves the right to terminate this agreement without notice for any reason, with no pro-rated refunds for prepaid services...&quot;
                  </p>
                  <div className="flex items-start gap-3 mt-3">
                    <AlertTriangle className="w-4 h-4 text-[#DC2626] mt-0.5 shrink-0" />
                    <div>
                      <h4 className="text-sm font-bold text-[#191C1E]">Unilateral Termination</h4>
                      <p className="text-xs text-[#44474D] leading-relaxed mt-0.5">
                        This clause allows the provider to keep your money while cutting off service instantly. We recommend 30-day notice.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-[#1FB6A6]/10 p-4 rounded-xl border-l-4 border-[#1FB6A6]">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Sparkles className="w-4 h-4 text-[#1FB6A6]" />
                    <span className="text-xs font-bold text-[#006a60] uppercase tracking-wider">Suggested Replacement</span>
                  </div>
                  <p className="text-sm text-[#191C1E] leading-relaxed">
                    &quot;Either party may terminate this agreement upon 30 days written notice. Prepaid fees for unused services shall be refunded...&quot;
                  </p>
                </div>
              </div>
              <div className="absolute top-0 right-0 w-56 h-56 bg-[#1FB6A6]/10 rounded-full blur-3xl -z-10" />
            </div>
          </div>
        </section>

        {/* Trust strip */}
        <div className="bg-[#0B1F3A] text-white py-5">
          <div className="max-w-[1280px] mx-auto px-5 md:px-10 flex flex-col md:flex-row items-center justify-center gap-3 text-center">
            <BadgeCheck className="w-5 h-5 text-[#55dbca] shrink-0" />
            <p className="text-sm leading-relaxed">
              Grounded on a curated legal clause library — answers are retrieved and explained,{' '}
              <span className="text-[#55dbca] font-bold">never hallucinated.</span>
            </p>
          </div>
        </div>

        {/* How it works */}
        <section id="how-it-works" className="py-24 bg-[#F7F9FC]">
          <div className="max-w-[1280px] mx-auto px-5 md:px-10">
            <div className="text-center mb-16">
              <h2 className="font-serif text-3xl font-bold text-[#000615] mb-4">
                From Upload to Insight in 30 Seconds
              </h2>
              <div className="w-20 h-1 bg-[#1FB6A6] mx-auto rounded-full" />
            </div>
            <div className="grid md:grid-cols-3 gap-10 relative">
              <div className="hidden md:block absolute top-12 left-0 w-full h-px bg-[#C4C6CE]" />
              {[
                {
                  icon: <Upload className="w-8 h-8 text-[#0B1F3A]" />,
                  step: '1',
                  title: 'Upload your PDF',
                  body: 'Drag and drop any vendor agreement, lease, or service contract. Our secure encryption keeps your data private.',
                },
                {
                  icon: <BrainCircuit className="w-8 h-8 text-[#0B1F3A]" />,
                  step: '2',
                  title: 'AI flags every risky clause',
                  body: 'Our legal-trained model scans for hidden liabilities, automatic renewals, and unfavorable termination rights.',
                },
                {
                  icon: <Gavel className="w-8 h-8 text-[#0B1F3A]" />,
                  step: '3',
                  title: 'Get plain-English fixes',
                  body: 'Receive specific, safer wording suggestions that you can copy-paste back into your contract.',
                },
              ].map(({ icon, step, title, body }) => (
                <div key={step} className="flex flex-col items-center text-center relative z-10 group">
                  <div className="w-24 h-24 rounded-full bg-white border border-[#C4C6CE] shadow-sm flex items-center justify-center mb-6 group-hover:border-[#1FB6A6] group-hover:shadow-lg transition-all duration-300">
                    {icon}
                  </div>
                  <h3 className="font-serif text-xl font-semibold text-[#000615] mb-3">
                    {step}) {title}
                  </h3>
                  <p className="text-base text-[#44474D] leading-relaxed max-w-xs">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 px-5 md:px-10">
          <div className="max-w-[1280px] mx-auto">
            <div className="bg-[#0B1F3A] rounded-3xl p-14 text-center text-white relative overflow-hidden shadow-2xl">
              <div className="relative z-10">
                <h2 className="font-serif text-4xl font-bold mb-5 text-balance">
                  Stop signing in the dark.
                </h2>
                <p className="text-lg text-white/75 mb-10 max-w-xl mx-auto leading-relaxed">
                  Join 2,500+ small business owners who use ClauseGuard to negotiate like a Fortune 500 company.
                </p>
                <Link
                  href="/upload"
                  className="inline-flex items-center gap-2 bg-[#55dbca] text-[#00201c] px-10 py-4 rounded-xl text-base font-bold shadow-lg hover:scale-105 active:scale-95 transition-all"
                >
                  <Upload className="w-5 h-5" />
                  Scan My First Contract Free
                </Link>
              </div>
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#1FB6A6]/10 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#1FB6A6]/5 rounded-full blur-3xl" />
            </div>
          </div>
        </section>

        {/* Trust icons */}
        <section className="py-10 bg-[#F2F4F7] border-t border-[#C4C6CE]">
          <div className="max-w-[1280px] mx-auto px-5 md:px-10">
            <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16">
              {[
                { icon: <Lock className="w-5 h-5 text-[#1FB6A6]" />, text: 'Bank-grade encryption' },
                { icon: <BadgeCheck className="w-5 h-5 text-[#1FB6A6]" />, text: 'SOC 2-ready audit trail' },
                { icon: <ShieldCheck className="w-5 h-5 text-[#1FB6A6]" />, text: 'Never trained on your contracts' },
              ].map(({ icon, text }) => (
                <div key={text} className="flex items-center gap-2.5">
                  {icon}
                  <span className="text-sm font-medium text-[#44474D]">{text}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
