'use client'

import { useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { UploadCloud, ShieldCheck, Zap, Loader2, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

type Phase = 'idle' | 'uploading' | 'analyzing' | 'error'

export function UploadDropzone() {
  const router = useRouter()
  const [dragOver, setDragOver] = useState(false)
  const [phase, setPhase] = useState<Phase>('idle')
  const [filename, setFilename] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback(
    async (file: File) => {
      setFilename(file.name)
      setError(null)
      setPhase('uploading')
      try {
        // 1) Upload: parse + embed + store clauses
        const form = new FormData()
        form.append('file', file)
        const up = await fetch('/api/upload', { method: 'POST', body: form })
        const upJson = await up.json()
        if (!up.ok) throw new Error(upJson.error ?? 'Upload failed')
        const { contractId } = upJson

        // 2) Analyze: run the RAG pipeline over every clause
        setPhase('analyzing')
        const an = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contractId }),
        })
        if (!an.ok) throw new Error((await an.json()).error ?? 'Analysis failed')

        // 3) Go to the report
        router.push(`/report/${contractId}`)
      } catch (e) {
        setError((e as Error).message)
        setPhase('error')
      }
    },
    [router]
  )

  const onDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      setDragOver(false)
      const file = e.dataTransfer.files[0]
      if (file) handleFile(file)
    },
    [handleFile]
  )

  const onInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) handleFile(file)
    },
    [handleFile]
  )

  const busy = phase === 'uploading' || phase === 'analyzing'

  return (
    <section className="mb-14">
      <div
        role="button"
        tabIndex={0}
        aria-label="Upload contract file"
        onClick={() => !busy && inputRef.current?.click()}
        onKeyDown={(e) => e.key === 'Enter' && !busy && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); if (!busy) setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={cn(
          'relative cursor-pointer h-72 rounded-2xl dropzone-dash flex flex-col items-center justify-center text-center p-8 transition-all duration-300 group',
          dragOver
            ? 'bg-[#1FB6A6]/8 scale-[1.01]'
            : phase === 'error'
            ? 'bg-[#FEF2F2]'
            : busy
            ? 'bg-[#1FB6A6]/5 cursor-progress'
            : 'bg-white hover:bg-[#1FB6A6]/5'
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.docx,.txt"
          className="sr-only"
          onChange={onInputChange}
          aria-label="File input"
          disabled={busy}
        />

        {busy ? (
          <>
            <div className="w-16 h-16 bg-[#1FB6A6]/15 rounded-full flex items-center justify-center mb-5">
              <Loader2 className="w-8 h-8 text-[#1FB6A6] animate-spin" />
            </div>
            <p className="font-serif text-xl font-semibold text-[#000615] mb-1">{filename}</p>
            <p className="text-sm text-[#44474D]">
              {phase === 'uploading'
                ? 'Extracting clauses and embedding…'
                : 'Running the RAG risk analysis…'}
            </p>
          </>
        ) : phase === 'error' ? (
          <>
            <div className="w-16 h-16 bg-[#FEF2F2] border-2 border-[#DC2626] rounded-full flex items-center justify-center mb-5">
              <AlertTriangle className="w-8 h-8 text-[#DC2626]" />
            </div>
            <p className="font-serif text-xl font-semibold text-[#000615] mb-1">Upload failed</p>
            <p className="text-sm text-[#DC2626] max-w-md">{error}</p>
            <p className="mt-2 text-xs text-[#44474D]">Click to try another file.</p>
          </>
        ) : (
          <>
            <div className="w-16 h-16 bg-[#1FB6A6]/15 rounded-full flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
              <UploadCloud className="w-8 h-8 text-[#1FB6A6]" />
            </div>
            <h2 className="font-serif text-xl font-semibold text-[#000615] mb-2">
              Drop a PDF or DOCX contract here, or{' '}
              <span className="text-[#1FB6A6] underline underline-offset-2">browse</span>
            </h2>
            <p className="text-sm text-[#44474D] mb-6">
              Maximum file size: 25 MB. Your data is encrypted and private.
            </p>
            <div className="flex items-center gap-6 text-[#44474D]">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                <span className="text-xs font-semibold">Bank-grade security</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Zap className="w-4 h-4" />
                <span className="text-xs font-semibold">{'Analysis in < 30s'}</span>
              </div>
            </div>
          </>
        )}
      </div>
      <p className="mt-3 text-xs text-[#44474D] text-center">
        Supported formats:{' '}
        <span className="font-bold text-[#0B1F3A]">PDF, DOCX, TXT</span>
      </p>
    </section>
  )
}
