import Link from 'next/link'
import { ShieldCheck } from 'lucide-react'

const footerLinks = [
  { href: '#', label: 'Terms of Service' },
  { href: '#', label: 'Privacy Policy' },
  { href: '#', label: 'Contact Support' },
  { href: '#', label: 'Security Overview' },
]

export function Footer() {
  return (
    <footer className="bg-[#F2F4F7] border-t border-[#C4C6CE] mt-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 py-8 px-5 md:px-10 w-full max-w-[1280px] mx-auto">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck className="w-5 h-5 text-[#1FB6A6]" strokeWidth={2} />
            <span className="font-serif text-lg font-bold text-[#0B1F3A]">ClauseGuard</span>
          </div>
          <p className="text-sm text-[#44474D]">
            &copy; 2026 ClauseGuard. All rights reserved. Informed Security for Small Business.
          </p>
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          {footerLinks.map(({ href, label }) => (
            <Link
              key={label}
              href={href}
              className="text-sm text-[#44474D] hover:text-[#1FB6A6] underline transition-colors"
            >
              {label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  )
}
