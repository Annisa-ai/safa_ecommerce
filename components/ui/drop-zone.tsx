'use client'

import { useState, useRef, useCallback } from 'react'
import Image from 'next/image'

interface DropZoneProps {
  /** accepted MIME types or extensions, e.g. "image/*" or ".pdf,.jpg" */
  accept?: string
  /** label shown inside the drop area */
  label?: string
  /** sub-label shown below the main label */
  hint?: string
  /** current preview URL (image) or filename (non-image) */
  previewUrl?: string
  /** original File object if available */
  file?: File | null
  /** called when a valid file is selected/dropped */
  onChange: (file: File) => void
  /** called when the user removes the current file */
  onRemove?: () => void
  /** whether to show an image preview (true) or just a filename chip (false) */
  imagePreview?: boolean
  /** extra class on the outer wrapper */
  className?: string
}

function isImageFile(file: File) {
  return file.type.startsWith('image/')
}

function isImageUrl(url: string) {
  return /\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i.test(url)
}

export function DropZone({
  accept = '*',
  label = 'Klik atau drag & drop file di sini',
  hint,
  previewUrl,
  file,
  onChange,
  onRemove,
  imagePreview = false,
  className = '',
}: DropZoneProps) {
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback(
    (f: File) => {
      onChange(f)
    },
    [onChange]
  )

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(true)
  }

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
  }

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const dropped = e.dataTransfer.files[0]
    if (dropped) handleFile(dropped)
  }

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0]
    if (selected) handleFile(selected)
  }

  const showImagePreview = imagePreview && previewUrl && (file ? isImageFile(file) : isImageUrl(previewUrl))

  // ── Has file: show preview / chip ──────────────────────────────────────────
  if (previewUrl) {
    return (
      <div className={`relative ${className}`}>
        {showImagePreview ? (
          // Image preview box
          <div
            className={`relative rounded-xl overflow-hidden border-2 transition-colors ${
              dragging ? 'border-primary' : 'border-border'
            } group`}
            style={{ minHeight: 160 }}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
          >
            <Image
              src={previewUrl}
              alt="Preview"
              fill
              className="object-cover"
              unoptimized
            />
            {/* Overlay on hover */}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="px-3 py-1.5 bg-background text-foreground text-xs font-medium rounded-lg hover:bg-muted transition"
              >
                Ganti
              </button>
              {onRemove && (
                <button
                  type="button"
                  onClick={onRemove}
                  className="px-3 py-1.5 bg-destructive text-destructive-foreground text-xs font-medium rounded-lg hover:bg-destructive/90 transition"
                >
                  Hapus
                </button>
              )}
            </div>
            {dragging && (
              <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                <p className="text-sm font-semibold text-primary">Lepaskan untuk mengganti</p>
              </div>
            )}
          </div>
        ) : (
          // Non-image file chip
          <div
            className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-colors ${
              dragging ? 'border-primary bg-primary/5' : 'border-border bg-muted/30'
            }`}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
          >
            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{file?.name ?? previewUrl}</p>
              {file && <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(0)} KB</p>}
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="text-xs text-primary hover:underline"
              >
                Ganti
              </button>
              {onRemove && (
                <button
                  type="button"
                  onClick={onRemove}
                  className="text-xs text-destructive hover:underline"
                >
                  Hapus
                </button>
              )}
            </div>
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={onInputChange}
        />
      </div>
    )
  }

  // ── Empty: show drop area ──────────────────────────────────────────────────
  return (
    <div className={className}>
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={`flex flex-col items-center justify-center gap-2 p-6 rounded-xl border-2 border-dashed cursor-pointer transition-all ${
          dragging
            ? 'border-primary bg-primary/5 scale-[1.01]'
            : 'border-border hover:border-primary/60 hover:bg-muted/30'
        }`}
      >
        {dragging ? (
          <>
            <svg className="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p className="text-sm font-semibold text-primary">Lepaskan file di sini</p>
          </>
        ) : (
          <>
            <svg className="w-9 h-9 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            <p className="text-sm font-medium text-foreground">{label}</p>
            {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
          </>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={onInputChange}
      />
    </div>
  )
}
