import { Lock } from 'lucide-react'
import type { AuditEntry } from '@/lib/data'

const ACTION_STYLES: Record<string, string> = {
  uploaded: 'text-[#1FB6A6] bg-[#1FB6A6]/10 border-[#1FB6A6]/20',
  analyzed: 'text-[#0B1F3A] bg-[#0B1F3A]/08 border-[#0B1F3A]/15',
  exported: 'text-[#D97706] bg-[#FFFBEB] border-[#D97706]/20',
}

function ActionChip({ action }: { action: string }) {
  const style = ACTION_STYLES[action] ?? 'text-[#44474D] bg-[#F2F4F7] border-[#C4C6CE]'
  return (
    <span
      className={`inline-block font-mono text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${style}`}
    >
      {action}
    </span>
  )
}

function formatTimestamp(iso: string): string {
  // Render as YYYY-MM-DD HH:MM:SS UTC  (deterministic, no locale variance)
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return (
    `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}` +
    ` ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())} UTC`
  )
}

export function AuditLog({ entries }: { entries: AuditEntry[] }) {
  const auditLog = entries
  return (
    <section aria-label="Compliance audit log">
      <div className="flex items-center gap-2 mb-4">
        <Lock className="w-5 h-5 text-[#1FB6A6]" strokeWidth={2} />
        <h2 className="font-serif text-2xl font-semibold text-[#000615]">Compliance Audit Log</h2>
      </div>

      <div className="bg-[#0B1F3A] rounded-2xl border border-[#1a3150] shadow-sm overflow-hidden">
        {/* Header bar */}
        <div className="flex items-center gap-2 px-5 py-3 border-b border-[#1a3150] bg-[#071428]">
          <span className="font-mono text-[11px] font-bold uppercase tracking-widest text-[#1FB6A6]">
            Audit Trail
          </span>
          <span className="ml-auto font-mono text-[11px] text-[#55DBCA]/50 tabular-nums">
            {auditLog.length} events
          </span>
        </div>

        {/* Entries */}
        <div className="divide-y divide-[#1a3150]">
          {auditLog.map((entry) => (
            <div
              key={entry.id}
              className="grid grid-cols-[auto_1fr] gap-x-6 items-start px-5 py-3.5 hover:bg-white/[0.03] transition-colors"
            >
              {/* Timestamp */}
              <span className="font-mono text-[12px] text-[#55DBCA]/70 tabular-nums whitespace-nowrap pt-px select-all">
                {formatTimestamp(entry.timestamp)}
              </span>

              {/* Actor + action chip + target */}
              <p className="text-sm leading-relaxed text-[#C8D8E8] flex flex-wrap items-center gap-x-2 gap-y-1">
                <span className="font-semibold text-white">{entry.user}</span>
                <ActionChip action={entry.action} />
                <span className="font-mono text-[12px] text-[#8EA8C3] break-all">{entry.filename}</span>
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
