'use client'

import { useState } from 'react'
import {
  AlertTriangle,
  Info,
  ChevronDown,
  Copy,
  Check,
  History,
  UserSearch,
  AlertCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Finding } from '@/lib/data'

const riskRailColor: Record<string, string> = {
  high: 'bg-[#DC2626]',
  medium: 'bg-[#D97706]',
  low: 'bg-[#16A34A]',
  abstained: 'bg-[#CBD5E1]',
}

const clauseTypeLabel: Record<string, string> = {
  liability: 'Liability',
  termination: 'Termination',
  ip: 'IP Assignment',
  payment: 'Payment Terms',
  renewal: 'Renewal',
  other: 'General',
}

const categoryChipColor: Record<string, string> = {
  liability: 'bg-[#FEF2F2] text-[#DC2626] border-[#DC2626]/20',
  termination: 'bg-[#FFFBEB] text-[#B45309] border-[#D97706]/20',
  ip: 'bg-[#EEF2FF] text-[#4338CA] border-[#6366F1]/20',
  payment: 'bg-[#F0FDF4] text-[#15803D] border-[#16A34A]/20',
  renewal: 'bg-[#F5F3FF] text-[#6D28D9] border-[#7C3AED]/20',
  other: 'bg-[#F8FAFC] text-[#475569] border-[#94A3B8]/20',
}

const riskBadgeConfig: Record<
  string,
  { label: string; icon: React.ReactNode; badgeClass: string; textClass: string }
> = {
  high: {
    label: 'Critical Risk',
    icon: <AlertTriangle className="w-3.5 h-3.5" />,
    badgeClass: 'bg-[#FEF2F2] border border-[#DC2626]/20 text-[#DC2626]',
    textClass: 'text-[#DC2626]',
  },
  medium: {
    label: 'Moderate Risk',
    icon: <AlertCircle className="w-3.5 h-3.5" />,
    badgeClass: 'bg-[#FFFBEB] border border-[#D97706]/20 text-[#D97706]',
    textClass: 'text-[#D97706]',
  },
  low: {
    label: 'Low Risk',
    icon: <Info className="w-3.5 h-3.5" />,
    badgeClass: 'bg-[#F0FDF4] border border-[#16A34A]/20 text-[#16A34A]',
    textClass: 'text-[#16A34A]',
  },
  abstained: {
    label: 'Needs Human Review',
    icon: <UserSearch className="w-3.5 h-3.5" />,
    badgeClass: 'bg-[#F1F5F9] border border-[#CBD5E1] text-[#475569]',
    textClass: 'text-[#475569]',
  },
}

const QUOTE_TRUNCATE_LENGTH = 200

// Parse simple <del>/<ins> tags from HTML string for rendering.
// Renders as two stacked blocks: original (strikethrough red) then replacement (green).
function RedlineContent({ html }: { html: string }) {
  const parts = html.split(/(<del>.*?<\/del>|<ins>.*?<\/ins>)/g)
  return (
    <p className="leading-relaxed">
      {parts.map((part, i) => {
        if (part.startsWith('<del>')) {
          return (
            <span key={i} className="redline-del">
              {part.replace(/<\/?del>/g, '')}
            </span>
          )
        }
        if (part.startsWith('<ins>')) {
          return (
            <span key={i} className="redline-ins">
              {part.replace(/<\/?ins>/g, '')}
            </span>
          )
        }
        return <span key={i}>{part}</span>
      })}
    </p>
  )
}

interface ClauseCardProps {
  clause: Finding
}

export function ClauseCard({ clause }: ClauseCardProps) {
  const [redlineOpen, setRedlineOpen] = useState(false)
  const [quoteExpanded, setQuoteExpanded] = useState(false)
  const [copied, setCopied] = useState(false)

  // Derive display-level risk key: abstained findings use 'abstained', else riskLevel
  const isAbstained = !!clause.abstained
  const riskKey = isAbstained ? 'abstained' : (clause.riskLevel ?? 'low')
  const config = riskBadgeConfig[riskKey]
  const railColor = riskRailColor[riskKey]
  const categoryChip = categoryChipColor[clause.clauseType] ?? 'bg-[#F2F4F7] text-[#44474D] border-[#E0E3E6]'
  const categoryLabel = clauseTypeLabel[clause.clauseType] ?? clause.clauseType

  const isLongQuote = clause.clauseText.length > QUOTE_TRUNCATE_LENGTH
  const displayedQuote =
    isLongQuote && !quoteExpanded
      ? clause.clauseText.slice(0, QUOTE_TRUNCATE_LENGTH).trimEnd() + '…'
      : clause.clauseText

  // confidence is 0..1 in the interface; render as integer percent
  const confidencePct = clause.confidence != null ? Math.round(clause.confidence * 100) : null

  const handleCopy = () => {
    if (clause.redline) {
      const text = clause.redline.replace(/<\/?(?:del|ins)>/g, '')
      navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <article
      className={cn(
        'relative flex rounded-2xl border overflow-hidden transition-shadow hover:shadow-md',
        isAbstained
          ? 'bg-[#F8FAFC] border-[#E2E8F0] shadow-sm'
          : 'bg-white border-[#E0E3E6] shadow-sm'
      )}
    >
      {/* Left risk rail */}
      <div className={cn('clause-rail shrink-0', railColor)} />

      <div className="p-6 md:p-7 w-full min-w-0">

        {/* ── Header row ── */}
        <div className="flex flex-wrap justify-between items-start gap-3 mb-5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-mono font-semibold text-[#44474D] bg-[#ECEEF1] px-2.5 py-0.5 rounded-md">
              Clause {clause.clauseNumber}
            </span>
            <span
              className={cn(
                'text-xs font-semibold px-2.5 py-0.5 rounded-lg border',
                categoryChip
              )}
            >
              {categoryLabel}
            </span>
          </div>
          {/* Risk badge */}
          <span
            className={cn(
              'flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full',
              config.badgeClass
            )}
          >
            {config.icon}
            {config.label}
          </span>
        </div>

        {/* ── Prior-exposure callout (HIGH only) — headline feature ── */}
        {clause.priorExposure && clause.priorExposure.length > 0 && (
          <div className="mb-5 rounded-xl border border-[#FCA5A5] bg-[#FEF2F2] overflow-hidden">
            <div className="flex items-start gap-3 px-4 py-3 bg-[#DC2626]">
              <AlertTriangle className="w-4 h-4 text-white mt-0.5 shrink-0" />
              <p className="text-sm font-bold text-white">
                You accepted similar language in {clause.priorExposure.length} past contract{clause.priorExposure.length > 1 ? 's' : ''}
              </p>
            </div>
            <div className="px-4 py-3 flex flex-wrap gap-x-5 gap-y-1">
              {clause.priorExposure.map((pc) => (
                <a
                  key={pc.contractId}
                  href="#"
                  className="text-xs text-[#991B1B] underline underline-offset-2 hover:text-[#DC2626] transition-colors"
                >
                  {pc.filename}
                  <span className="text-[#B91C1C] no-underline"> · {pc.date}</span>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* ── ABSTAINED VARIANT ── */}
        {isAbstained ? (
          <div className="rounded-xl border border-[#CBD5E1] bg-white p-4 mb-1">
            <div className="flex gap-3 items-start">
              <div className="flex items-center justify-center w-7 h-7 rounded-full bg-[#F1F5F9] border border-[#CBD5E1] shrink-0">
                <Info className="w-3.5 h-3.5 text-[#64748B]" />
              </div>
              <div className="space-y-2.5">
                <blockquote className="italic text-[#475569] text-sm leading-relaxed border-l-4 border-[#CBD5E1] pl-3">
                  {displayedQuote}
                </blockquote>
                {isLongQuote && (
                  <button
                    onClick={() => setQuoteExpanded((v) => !v)}
                    className="text-xs font-semibold text-[#1FB6A6] hover:underline"
                  >
                    {quoteExpanded ? 'Show less' : 'Show full clause'}
                  </button>
                )}
                <p className="text-sm text-[#475569] leading-relaxed pt-1">
                  <strong className="text-[#1E293B]">
                    No strong match in our clause library — we won&apos;t guess on legal risk.
                  </strong>{' '}
                  A human should review this.
                </p>
                {clause.note && (
                  <p className="text-xs text-[#94A3B8]">{clause.note}</p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* ── Clause quote ── */}
            <div className="mb-5">
              <blockquote className="border-l-4 border-[#ECEEF1] pl-4 italic text-[#44474D] text-sm leading-relaxed">
                {displayedQuote}
              </blockquote>
              {isLongQuote && (
                <button
                  onClick={() => setQuoteExpanded((v) => !v)}
                  className="mt-1.5 ml-5 text-xs font-semibold text-[#1FB6A6] hover:underline"
                >
                  {quoteExpanded ? 'Show less' : 'Show full clause'}
                </button>
              )}
            </div>

            {/* ── AI explanation ── */}
            <p className="text-sm text-[#191C1E] leading-relaxed mb-6">{clause.explanation}</p>

            {/* ── Meta row: grounded on + confidence meter ── */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 mb-6 pb-6 border-b border-[#ECEEF1]">
              {clause.groundedOnPattern && (
                <span className="bg-[#F2F4F7] text-[#44474D] text-xs font-semibold px-3 py-1.5 rounded-full border border-[#E0E3E6] shrink-0">
                  Grounded on: &ldquo;{clause.groundedOnPattern}&rdquo;
                </span>
              )}
              {confidencePct != null && confidencePct > 0 && (
                <div className="flex items-center gap-2.5 flex-1 min-w-[200px] max-w-[300px]">
                  <span className="text-xs text-[#64748B] shrink-0 font-medium">Model confidence</span>
                  <div className="flex-1 bg-[#ECEEF1] h-2 rounded-full overflow-hidden">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all',
                        confidencePct >= 90
                          ? 'bg-[#1FB6A6]'
                          : confidencePct >= 70
                          ? 'bg-[#D97706]'
                          : 'bg-[#94A3B8]'
                      )}
                      style={{ width: `${confidencePct}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold text-[#191C1E] shrink-0 tabular-nums">
                    {confidencePct}%
                  </span>
                </div>
              )}
            </div>

            {/* ── Redline accordion ── */}
            {clause.redline && (
              <div className="rounded-xl border border-[#E0E3E6] overflow-hidden">
                <button
                  onClick={() => setRedlineOpen((v) => !v)}
                  className="w-full flex justify-between items-center px-4 py-3.5 hover:bg-[#F7F9FC] transition-colors text-left"
                  aria-expanded={redlineOpen}
                >
                  <span className="flex items-center gap-2 text-sm font-semibold text-[#0B1F3A]">
                    <ChevronDown
                      className={cn(
                        'w-4 h-4 text-[#1FB6A6] transition-transform duration-200',
                        redlineOpen && 'rotate-180'
                      )}
                    />
                    Suggested safer language
                  </span>
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleCopy()
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.stopPropagation()
                        handleCopy()
                      }
                    }}
                    className="flex items-center gap-1.5 text-xs font-semibold text-[#1FB6A6] hover:underline cursor-pointer select-none"
                    aria-label="Copy redline suggestion"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        Copy redline
                      </>
                    )}
                  </span>
                </button>

                {redlineOpen && (
                  <div className="border-t border-[#E0E3E6] bg-[#FAFBFC]">
                    {/* Legend */}
                    <div className="flex items-center gap-4 px-4 py-2.5 border-b border-[#E0E3E6] bg-white">
                      <span className="flex items-center gap-1.5 text-xs text-[#64748B]">
                        <span className="inline-block w-3 h-3 rounded-sm bg-[#DC2626]/10 border border-[#DC2626]/30" />
                        Remove
                      </span>
                      <span className="flex items-center gap-1.5 text-xs text-[#64748B]">
                        <span className="inline-block w-3 h-3 rounded-sm bg-[#16A34A]/10 border border-[#16A34A]/30" />
                        Add
                      </span>
                    </div>
                    <div className="p-5 text-sm">
                      <RedlineContent html={clause.redline!} />
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </article>
  )
}
