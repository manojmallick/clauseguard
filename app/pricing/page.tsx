import Link from 'next/link'
import { CheckCircle2, Star, ShieldCheck, Code2, BookOpen } from 'lucide-react'
import { TopNav } from '@/components/top-nav'
import { Footer } from '@/components/footer'

export const metadata = {
  title: 'Pricing | ClauseGuard',
  description: 'Simple, transparent pricing for businesses of every size.',
}

const plans = [
  {
    id: 'starter',
    name: 'Starter',
    price: '$29',
    period: '/user per month',
    seats: null,
    popular: false,
    cta: 'Start Starter',
    features: [
      '20 contracts/month',
      'Automated risk reports',
      'Standard legal library',
      'Email support',
    ],
  },
  {
    id: 'team',
    name: 'Team',
    price: '$99',
    period: '/month',
    seats: 'Includes 5 seats',
    popular: true,
    cta: 'Select Team',
    features: [
      'Unlimited contracts',
      'Redline suggestions',
      'Team collaboration workspace',
      'Priority 24/7 support',
    ],
  },
  {
    id: 'business',
    name: 'Business',
    price: '$299',
    period: '/month',
    seats: 'Includes 20 seats',
    popular: false,
    cta: 'Contact Enterprise',
    features: [
      'Advanced API access',
      'Custom clause library',
      'Compliance audit log',
      'SSO & Dedicated account manager',
    ],
  },
]

export default function PricingPage() {
  return (
    <>
      <TopNav />
      <main className="flex-1">
        {/* Header */}
        <section className="max-w-[1280px] mx-auto px-5 md:px-10 pt-16 pb-12 text-center">
          <h1 className="font-serif text-[2.75rem] leading-tight font-bold text-[#000615] mb-4 text-balance">
            Plans for Businesses of All Sizes
          </h1>
          <p className="text-lg text-[#44474D] max-w-2xl mx-auto leading-relaxed">
            Secure your commercial agreements with automated risk assessment and professional
            redlining tools. Choose the tier that matches your volume.
          </p>
        </section>

        {/* Pricing cards */}
        <section className="max-w-[1280px] mx-auto px-5 md:px-10 pb-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`relative flex flex-col rounded-2xl p-8 transition-transform duration-300 hover:scale-[1.02] ${
                  plan.popular
                    ? 'bg-white border-2 border-[#1FB6A6] shadow-[0_8px_32px_rgba(11,31,58,0.14)] scale-105 z-10 hover:scale-[1.07]'
                    : 'bg-white border border-[#C4C6CE] shadow-[0_2px_8px_rgba(11,31,58,0.05)]'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#1FB6A6] text-white px-5 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1 shadow-md">
                    <Star className="w-3.5 h-3.5 fill-white" />
                    Most popular
                  </div>
                )}

                <div className="mb-7">
                  <h3 className="font-serif text-2xl font-bold text-[#000615] mb-3">
                    {plan.name}
                  </h3>
                  <div className="flex items-baseline gap-1">
                    <span className="font-serif text-[2.5rem] font-bold text-[#000615] leading-none">
                      {plan.price}
                    </span>
                    <span className="text-sm text-[#44474D]">{plan.period}</span>
                  </div>
                  {plan.seats && (
                    <p
                      className={`text-sm mt-1.5 font-semibold ${
                        plan.popular ? 'text-[#1FB6A6]' : 'text-[#44474D]'
                      }`}
                    >
                      {plan.seats}
                    </p>
                  )}
                </div>

                <ul className="space-y-3.5 mb-9 flex-1">
                  {plan.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-5 h-5 text-[#1FB6A6] shrink-0 mt-0.5" strokeWidth={2} />
                      <span className="text-sm text-[#44474D] leading-relaxed">{feat}</span>
                    </li>
                  ))}
                </ul>

                <button
                  className={`w-full py-3 px-6 rounded-xl text-sm font-bold transition-all active:scale-95 ${
                    plan.popular
                      ? 'bg-[#1FB6A6] text-white hover:brightness-110 shadow-md'
                      : 'border-2 border-[#C4C6CE] text-[#0B1F3A] hover:border-[#1FB6A6] hover:text-[#1FB6A6]'
                  }`}
                >
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>

          {/* Reassurance */}
          <div className="mt-14 flex justify-center">
            <div className="inline-flex items-center gap-3 bg-[#ECEEF1] px-7 py-3 rounded-full border border-[#C4C6CE]">
              <ShieldCheck className="w-5 h-5 text-[#1FB6A6]" strokeWidth={2} />
              <p className="text-sm text-[#191C1E]">
                Cancel anytime. SOC 2-ready audit trail on every plan.
              </p>
            </div>
          </div>
        </section>

        {/* Bento feature section */}
        <section className="max-w-[1280px] mx-auto px-5 md:px-10 pb-20">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
            {/* Wide card */}
            <div className="md:col-span-2 bg-[#0B1F3A] p-8 rounded-2xl text-white flex flex-col justify-between overflow-hidden relative min-h-[220px]">
              <div className="relative z-10">
                <h4 className="font-serif text-2xl font-semibold mb-2">Automated Risk Scoring</h4>
                <p className="text-white/75 text-sm leading-relaxed">
                  Our AI identifies high-risk clauses in seconds, saving your team hours of manual review.
                </p>
              </div>
              <div className="flex gap-2 mt-8 relative z-10">
                <span className="px-3 py-1 bg-[#DC2626] rounded-lg text-xs font-bold text-white">High Risk</span>
                <span className="px-3 py-1 bg-[#1FB6A6] rounded-lg text-xs font-bold text-white">Safe</span>
                <span className="px-3 py-1 bg-[#D97706] rounded-lg text-xs font-bold text-white">Warning</span>
              </div>
              {/* Decorative */}
              <ShieldCheck
                className="absolute -right-6 -bottom-4 text-white/10"
                style={{ width: 140, height: 140 }}
                strokeWidth={0.5}
              />
            </div>

            <div className="bg-white border border-[#C4C6CE] p-8 rounded-2xl shadow-sm">
              <Code2 className="w-9 h-9 text-[#1FB6A6] mb-4" strokeWidth={1.5} />
              <h4 className="text-sm font-bold text-[#000615] mb-2">Robust API</h4>
              <p className="text-sm text-[#44474D] leading-relaxed">
                Seamlessly integrate with your existing CRM or contract management tool.
              </p>
            </div>

            <div className="bg-white border border-[#C4C6CE] p-8 rounded-2xl shadow-sm">
              <BookOpen className="w-9 h-9 text-[#1FB6A6] mb-4" strokeWidth={1.5} />
              <h4 className="text-sm font-bold text-[#000615] mb-2">Legal Benchmarks</h4>
              <p className="text-sm text-[#44474D] leading-relaxed">
                Compare your clauses against 100k+ industry standard agreements.
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
