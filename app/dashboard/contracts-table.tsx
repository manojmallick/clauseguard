'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import Link from 'next/link'
import { Search, ChevronDown, Check } from 'lucide-react'
import { RiskBadge } from '@/components/risk-badge'
import type { ContractRow } from '@/lib/data'
type RiskLevel = 'low' | 'medium' | 'high'

const RISK_OPTIONS: { value: RiskLevel; label: string; dot: string }[] = [
  { value: 'high',   label: 'High',   dot: 'bg-[#DC2626]' },
  { value: 'medium', label: 'Medium', dot: 'bg-[#D97706]' },
  { value: 'low',    label: 'Low',    dot: 'bg-[#16A34A]' },
]

const CONTRACT_TYPES = [
  'All Types',
  'Vendor Agreement',
  'Vendor',
  'Lease',
  'Employment',
  'NDA',
  'SaaS',
  'SOW',
  'Other',
]

const STATUS_META: Record<string, { label: string; dot: string; text: string }> = {
  complete:  { label: 'Analyzed',   dot: 'bg-[#1FB6A6]', text: 'text-[#1FB6A6]' },
  analyzing: { label: 'Analyzing…', dot: 'bg-[#1FB6A6] animate-pulse', text: 'text-[#1FB6A6]' },
  pending:   { label: 'Pending',    dot: 'bg-[#CBD5E1]', text: 'text-[#64748B]' },
}

export function ContractsTable({ contracts }: { contracts: ContractRow[] }) {
  const [selectedRisks, setSelectedRisks] = useState<Set<RiskLevel>>(new Set())
  const [riskDropdownOpen, setRiskDropdownOpen] = useState(false)
  const [typeFilter, setTypeFilter] = useState('All Types')
  const [search, setSearch] = useState('')
  const riskRef = useRef<HTMLDivElement>(null)

  // Close risk dropdown on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (riskRef.current && !riskRef.current.contains(e.target as Node)) {
        setRiskDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  function toggleRisk(level: RiskLevel) {
    setSelectedRisks((prev) => {
      const next = new Set(prev)
      next.has(level) ? next.delete(level) : next.add(level)
      return next
    })
  }

  const riskLabel =
    selectedRisks.size === 0
      ? 'All Risk Levels'
      : selectedRisks.size === 1
      ? `${[...selectedRisks][0].charAt(0).toUpperCase() + [...selectedRisks][0].slice(1)} risk`
      : `${selectedRisks.size} risk levels`

  const filtered = useMemo(() => {
    return contracts.filter((c) => {
      const matchesRisk =
        selectedRisks.size === 0 ||
        (c.overallRisk !== null && selectedRisks.has(c.overallRisk as RiskLevel))
      const matchesType = typeFilter === 'All Types' || c.contractType === typeFilter
      const matchesSearch =
        search === '' ||
        c.filename.toLowerCase().includes(search.toLowerCase()) ||
        c.contractType.toLowerCase().includes(search.toLowerCase()) ||
        c.uploadedBy.toLowerCase().includes(search.toLowerCase())
      return matchesRisk && matchesType && matchesSearch
    })
  }, [selectedRisks, typeFilter, search])

  return (
    <div className="mb-12">
      {/* ── Filter bar ────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-5">
        <p className="text-sm text-[#44474D] font-medium">
          {filtered.length} contract{filtered.length !== 1 ? 's' : ''}
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          {/* Risk multi-select */}
          <div className="relative" ref={riskRef}>
            <button
              type="button"
              onClick={() => setRiskDropdownOpen((v) => !v)}
              className="flex items-center gap-2 bg-white border border-[#C4C6CE] pl-4 pr-3 py-2 rounded-xl text-sm text-[#191C1E] hover:border-[#1FB6A6] focus:ring-2 focus:ring-[#1FB6A6] focus:border-[#1FB6A6] outline-none transition-all cursor-pointer min-w-[160px] justify-between"
              aria-expanded={riskDropdownOpen}
              aria-haspopup="listbox"
            >
              <span className="flex items-center gap-2">
                {selectedRisks.size > 0 && (
                  <span className="flex gap-1">
                    {[...selectedRisks].map((r) => (
                      <span
                        key={r}
                        className={`w-2 h-2 rounded-full ${RISK_OPTIONS.find((o) => o.value === r)?.dot}`}
                      />
                    ))}
                  </span>
                )}
                {riskLabel}
              </span>
              <ChevronDown
                className={`w-4 h-4 text-[#44474D] transition-transform ${riskDropdownOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {riskDropdownOpen && (
              <ul
                role="listbox"
                aria-multiselectable="true"
                className="absolute z-20 top-full mt-1.5 left-0 bg-white border border-[#C4C6CE] rounded-xl shadow-lg py-1.5 min-w-full"
              >
                <li
                  role="option"
                  aria-selected={selectedRisks.size === 0}
                  onClick={() => { setSelectedRisks(new Set()); setRiskDropdownOpen(false) }}
                  className="flex items-center justify-between px-4 py-2 text-sm cursor-pointer hover:bg-[#F2F4F7] text-[#191C1E]"
                >
                  All Risk Levels
                  {selectedRisks.size === 0 && <Check className="w-3.5 h-3.5 text-[#1FB6A6]" />}
                </li>
                <li className="mx-3 my-1 border-t border-[#F2F4F7]" role="separator" />
                {RISK_OPTIONS.map((opt) => (
                  <li
                    key={opt.value}
                    role="option"
                    aria-selected={selectedRisks.has(opt.value)}
                    onClick={() => toggleRisk(opt.value)}
                    className="flex items-center justify-between px-4 py-2 text-sm cursor-pointer hover:bg-[#F2F4F7]"
                  >
                    <span className="flex items-center gap-2 text-[#191C1E]">
                      <span className={`w-2 h-2 rounded-full ${opt.dot}`} />
                      {opt.label}
                    </span>
                    {selectedRisks.has(opt.value) && (
                      <Check className="w-3.5 h-3.5 text-[#1FB6A6]" />
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Type dropdown */}
          <div className="relative">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="appearance-none bg-white border border-[#C4C6CE] pl-4 pr-9 py-2 rounded-xl text-sm focus:ring-2 focus:ring-[#1FB6A6] focus:border-[#1FB6A6] outline-none text-[#191C1E] cursor-pointer"
            >
              {CONTRACT_TYPES.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#44474D] pointer-events-none" />
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#44474D]" />
            <input
              type="text"
              placeholder="Search contracts…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 border border-[#C4C6CE] rounded-xl text-sm bg-white focus:ring-2 focus:ring-[#1FB6A6] focus:border-[#1FB6A6] outline-none min-w-[240px] text-[#191C1E]"
            />
          </div>
        </div>
      </div>

      {/* ── Table ─────────────────────────────────────── */}
      <div className="bg-white rounded-2xl shadow-sm border border-[#C4C6CE] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#ECEEF1] border-b border-[#C4C6CE]">
                <th className="px-5 py-3.5 text-xs font-bold text-[#44474D] uppercase tracking-wider">Filename</th>
                <th className="px-5 py-3.5 text-xs font-bold text-[#44474D] uppercase tracking-wider">Type</th>
                <th className="px-5 py-3.5 text-xs font-bold text-[#44474D] uppercase tracking-wider">Overall Risk</th>
                <th className="px-5 py-3.5 text-xs font-bold text-[#44474D] uppercase tracking-wider">Findings</th>
                <th className="px-5 py-3.5 text-xs font-bold text-[#44474D] uppercase tracking-wider">Uploaded by</th>
                <th className="px-5 py-3.5 text-xs font-bold text-[#44474D] uppercase tracking-wider">Date</th>
                <th className="px-5 py-3.5 text-xs font-bold text-[#44474D] uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F2F4F7]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-sm text-[#44474D]">
                    No contracts match your filters.
                  </td>
                </tr>
              ) : (
                filtered.map((contract, i) => {
                  const status = STATUS_META[contract.status]
                  return (
                    <tr
                      key={contract.id}
                      className={`hover:bg-[#F7F9FC] transition-colors duration-150 ${i % 2 === 1 ? 'bg-[#FAFBFC]' : ''}`}
                    >
                      {/* Filename */}
                      <td className="px-5 py-4 max-w-[220px]">
                        <Link
                          href={`/report/${contract.id}`}
                          className="text-sm font-semibold text-[#0B1F3A] hover:text-[#1FB6A6] transition-colors truncate block"
                        >
                          {contract.filename}
                        </Link>
                      </td>

                      {/* Type */}
                      <td className="px-5 py-4 text-sm text-[#44474D] whitespace-nowrap">
                        {contract.contractType}
                      </td>

                      {/* Overall Risk */}
                      <td className="px-5 py-4">
                        {contract.overallRisk ? (
                          <RiskBadge level={contract.overallRisk} size="sm" />
                        ) : (
                          <div className="flex items-center gap-1.5 text-xs text-[#1FB6A6] italic">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#1FB6A6] animate-pulse" />
                            Analyzing…
                          </div>
                        )}
                      </td>

                      {/* Findings — H/M/L mini chips */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5">
                          <span className="inline-flex items-center gap-0.5 bg-[#FEF2F2] text-[#DC2626] border border-[#DC2626]/20 text-[11px] font-bold px-2 py-0.5 rounded-md tabular-nums">
                            {contract.counts.high}<span className="ml-0.5 opacity-70">H</span>
                          </span>
                          <span className="inline-flex items-center gap-0.5 bg-[#FFFBEB] text-[#D97706] border border-[#D97706]/20 text-[11px] font-bold px-2 py-0.5 rounded-md tabular-nums">
                            {contract.counts.medium}<span className="ml-0.5 opacity-70">M</span>
                          </span>
                          <span className="inline-flex items-center gap-0.5 bg-[#F0FDF4] text-[#16A34A] border border-[#16A34A]/20 text-[11px] font-bold px-2 py-0.5 rounded-md tabular-nums">
                            {contract.counts.low}<span className="ml-0.5 opacity-70">L</span>
                          </span>
                        </div>
                      </td>

                      {/* Uploaded by */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-[#0B1F3A]/10 flex items-center justify-center text-[#0B1F3A] text-[10px] font-bold shrink-0 select-none">
                            {contract.uploadedBy.split(' ').map((n) => n[0]).join('')}
                          </div>
                          <span className="text-sm text-[#44474D]">{contract.uploadedBy}</span>
                        </div>
                      </td>

                      {/* Date */}
                      <td className="px-5 py-4 text-sm text-[#44474D] whitespace-nowrap">
                        {contract.uploadedAt}
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className={`flex items-center gap-1.5 text-sm font-medium ${status.text}`}>
                          <span className={`w-2 h-2 rounded-full shrink-0 ${status.dot}`} />
                          {status.label}
                        </span>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
