'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { RefreshCw } from 'lucide-react'

export function ReanalyzeButton({ contractId }: { contractId: string }) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function reanalyze() {
    setBusy(true)
    setError(null)
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contractId }),
      })
      if (!res.ok) throw new Error((await res.json()).error ?? 'Analysis failed')
      router.refresh()
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={reanalyze}
        disabled={busy}
        className="flex items-center gap-2 bg-[#0B1F3A] text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:brightness-125 transition-all active:scale-95 shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
      >
        <RefreshCw className={`w-4 h-4 ${busy ? 'animate-spin' : ''}`} />
        {busy ? 'Analyzing…' : 'Re-analyze'}
      </button>
      {error && <span className="text-xs text-[#DC2626]">{error}</span>}
    </div>
  )
}
