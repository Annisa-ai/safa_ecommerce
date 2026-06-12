'use client'

import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useReviews } from '@/lib/contexts/review-context'
import type { Review } from '@/lib/types'

interface ReviewModalProps {
  orderId: string
  productId: string
  productName: string
  userId: string
  userFullName: string
  existingReview?: Review
  onClose: () => void
  onSuccess: (msg: string) => void
}

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0)
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          type="button"
          onMouseEnter={() => setHovered(n)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(n)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, fontSize: 28, lineHeight: 1, color: (hovered || value) >= n ? '#f59e0b' : '#d1d5db', transition: 'color 0.1s' }}
          aria-label={`${n} bintang`}
        >
          ★
        </button>
      ))}
    </div>
  )
}

export function ReviewModal({ orderId, productId, productName, userId, userFullName, existingReview, onClose, onSuccess }: ReviewModalProps) {
  const { addReview, updateReview } = useReviews()
  const [rating, setRating]     = useState(existingReview?.rating ?? 0)
  const [text, setText]         = useState(existingReview?.reviewText ?? '')
  const [imageUrl, setImageUrl] = useState(existingReview?.reviewImageUrl ?? '')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [error, setError]       = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [mounted, setMounted]   = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => { setMounted(true) }, [])

  function handleImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { setError('Ukuran foto maksimal 5 MB'); return }
    setImageFile(file)
    setImageUrl(URL.createObjectURL(file))
  }

  function validate() {
    if (!rating) { setError('Silakan pilih rating terlebih dahulu.'); return false }
    if (!text.trim()) { setError('Silakan isi ulasan Anda.'); return false }
    if (text.trim().length < 10) { setError('Ulasan minimal 10 karakter.'); return false }
    if (text.trim().length > 500) { setError('Ulasan maksimal 500 karakter.'); return false }
    return true
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!validate()) return
    setSubmitting(true)

    // Simulate slight delay
    await new Promise(r => setTimeout(r, 400))

    if (existingReview) {
      updateReview(existingReview.id, { rating, reviewText: text.trim(), reviewImageUrl: imageUrl || undefined })
      onSuccess('Ulasan berhasil diperbarui.')
    } else {
      addReview({ userId, userFullName, orderId, productId, productName, rating, reviewText: text.trim(), reviewImageUrl: imageUrl || undefined, isVisible: true })
      onSuccess('Ulasan berhasil dikirim.')
    }
    setSubmitting(false)
    onClose()
  }

  const modal = (
    <div
      style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{ backgroundColor: '#fff', borderRadius: 18, width: '100%', maxWidth: 480, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 24px 60px rgba(0,0,0,0.2)' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 20px', borderBottom: '1px solid #f1f5f9' }}>
          <div>
            <p style={{ fontSize: 16, fontWeight: 800, color: '#0f172a' }}>{existingReview ? 'Edit Ulasan' : 'Beri Ulasan'}</p>
            <p style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{productName}</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 22, color: '#9ca3af', lineHeight: 1, padding: '0 4px' }}>×</button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Rating */}
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 }}>Rating *</label>
            <StarPicker value={rating} onChange={setRating} />
            {rating > 0 && (
              <p style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
                {['', 'Sangat Buruk', 'Buruk', 'Cukup', 'Baik', 'Sangat Baik'][rating]}
              </p>
            )}
          </div>

          {/* Text */}
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 }}>
              Komentar * <span style={{ color: '#9ca3af', fontWeight: 400 }}>({text.length}/500)</span>
            </label>
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              maxLength={500}
              rows={4}
              placeholder="Bagikan pengalaman Anda menggunakan produk ini..."
              style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #e2e8f0', borderRadius: 10, fontSize: 13, color: '#0f172a', backgroundColor: '#f8fafc', resize: 'vertical', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }}
              onFocus={e => e.currentTarget.style.borderColor = '#1e3a5f'}
              onBlur={e => e.currentTarget.style.borderColor = '#e2e8f0'}
            />
          </div>

          {/* Image */}
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 }}>Upload Foto Produk (opsional)</label>
            <input ref={fileRef} type="file" accept="image/jpg,image/jpeg,image/png,image/webp" onChange={handleImage} style={{ display: 'none' }} />
            {imageUrl ? (
              <div style={{ position: 'relative', display: 'inline-block' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imageUrl} alt="preview" style={{ width: 100, height: 100, objectFit: 'cover', borderRadius: 10, border: '1.5px solid #e2e8f0' }} />
                <button type="button" onClick={() => { setImageUrl(''); setImageFile(null); if (fileRef.current) fileRef.current.value = '' }}
                  style={{ position: 'absolute', top: -6, right: -6, width: 22, height: 22, borderRadius: '50%', backgroundColor: '#ef4444', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  ×
                </button>
                <button type="button" onClick={() => fileRef.current?.click()}
                  style={{ display: 'block', marginTop: 6, fontSize: 12, color: '#1e3a5f', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                  Ganti foto
                </button>
              </div>
            ) : (
              <button type="button" onClick={() => fileRef.current?.click()}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', padding: '20px 16px', border: '2px dashed #e2e8f0', borderRadius: 12, cursor: 'pointer', background: 'none', gap: 8, color: '#64748b' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = '#1e3a5f'}
                onMouseLeave={e => e.currentTarget.style.borderColor = '#e2e8f0'}
              >
                <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
                <span style={{ fontSize: 13, fontWeight: 600 }}>Klik untuk upload foto</span>
                <span style={{ fontSize: 11 }}>JPG, JPEG, PNG, WEBP · Maks 5 MB</span>
              </button>
            )}
          </div>

          {/* Error */}
          {error && (
            <div style={{ padding: '10px 14px', backgroundColor: '#fff1f2', border: '1px solid #fecdd3', borderRadius: 8, fontSize: 13, color: '#be123c', fontWeight: 500 }}>
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            style={{ width: '100%', padding: '12px 0', backgroundColor: submitting ? '#94a3b8' : '#1e3a5f', color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: submitting ? 'not-allowed' : 'pointer', transition: 'background-color 0.15s' }}
          >
            {submitting ? 'Mengirim...' : existingReview ? 'Perbarui Ulasan' : 'Kirim Ulasan'}
          </button>
        </form>
      </div>
    </div>
  )

  return mounted ? createPortal(modal, document.body) : null
}
