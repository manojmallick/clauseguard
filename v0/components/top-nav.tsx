'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ShieldCheck, Bell, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

const navLinks = [
  { href: '/upload', label: 'Upload' },
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/pricing', label: 'Pricing' },
]

export function TopNav() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-[#0B1F3A] border-b-2 border-[#1FB6A6] shadow-sm">
      <div className="flex justify-between items-center h-16 px-5 md:px-10 w-full max-w-[1280px] mx-auto">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <ShieldCheck className="w-6 h-6 text-[#1FB6A6]" strokeWidth={2} />
          <span className="font-serif text-xl font-bold text-white">ClauseGuard</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map(({ href, label }) => {
            const active = pathname === href || (href !== '/' && pathname.startsWith(href))
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'text-sm font-medium transition-colors duration-200',
                  active
                    ? 'text-[#55dbca] font-bold border-b-2 border-[#55dbca] pb-0.5'
                    : 'text-white/80 hover:text-[#55dbca]'
                )}
              >
                {label}
              </Link>
            )
          })}
        </nav>

        {/* Right slot */}
        <div className="flex items-center gap-3">
          <button
            aria-label="Notifications"
            className="hidden md:flex text-white/80 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10"
          >
            <Bell className="w-5 h-5" />
          </button>
          <div
            className="w-8 h-8 rounded-full bg-[#1FB6A6]/20 border border-[#1FB6A6]/40 flex items-center justify-center text-[#55dbca] text-sm font-bold shrink-0"
            aria-label="User avatar"
          >
            MC
          </div>

          {/* Mobile menu toggle */}
          <button
            className="md:hidden text-white/80 hover:text-white p-1"
            aria-label="Toggle mobile menu"
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <nav className="md:hidden bg-[#0B1F3A] border-t border-white/10 px-5 py-4 flex flex-col gap-4">
          {navLinks.map(({ href, label }) => {
            const active = pathname === href || (href !== '/' && pathname.startsWith(href))
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'text-sm font-medium transition-colors',
                  active ? 'text-[#55dbca] font-bold' : 'text-white/80 hover:text-[#55dbca]'
                )}
              >
                {label}
              </Link>
            )
          })}
        </nav>
      )}
    </header>
  )
}
