'use client'

import { useState, useRef, useCallback } from 'react'
import { UploadCloud, ShieldCheck, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'

export function UploadDropzone() {
  const [dragOver, setDragOver] = useState(false)
  const [uploaded, setUploaded] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback((file: File) => {
    setUploaded(file.name)
  }, [])

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

  return (
    <section className="mb-14">
      <div
        role="button"
        tabIndex={0}
        aria-label="Upload contract file"
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={cn(
          'relative cursor-pointer h-72 rounded-2xl dropzone-dash flex flex-col items-center justify-center text-center p-8 transition-all duration-300 group',
          dragOver
            ? 'bg-[#1FB6A6]/8 scale-[1.01]'
            : uploaded
            ? 'bg-[#F0FDF4]'
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
        />

        {uploaded ? (
          <>
            <div className="w-16 h-16 bg-[#F0FDF4] border-2 border-[#16A34A] rounded-full flex items-center justify-center mb-5">
              <ShieldCheck className="w-8 h-8 text-[#16A34A]" />
            </div>
            <p className="font-serif text-xl font-semibold text-[#000615] mb-1">{uploaded}</p>
            <p className="text-sm text-[#44474D]">
              File received — analysis will begin shortly.
            </p>
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
