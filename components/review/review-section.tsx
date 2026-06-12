'use client'

import { useState } from 'react'
import { useReviews } from '@/lib/contexts/review-context'

function Stars({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <span style={{ display: 'inline-flex', gap: 1 }}>
      {[1, 2, 3, 4, 5].map(n => (
        <span key={n} style={{ fontSize: size, color: n <= Math.round(rating) ? '#f59e0b' : '#d1d5db', lineHeight: 1 }}>★</span>
      ))}
    </span>
  )
}

export function ReviewSection({ productId }: { productId: string }) {
  const { getReviewsByProductId, getProductStats } = useReviews()
  const [filterRating, setFilterRating] = useState<number | null>(null)

  const allReviews = getReviewsByProductId(productId)
  const stats = getProductStats(productId)

  const displayed = filterRating
    ? allReviews.filter(r => r.rating === filterRating)
    : allReviews

  // Count per star
  const starCounts = [5, 4, 3, 2, 1].map(s => ({ star: s, count: allReviews.filter(r => r.rating === s).length }))

  function timeAgo(iso: string) {
    const diff = Date.now() - new Date(iso).getTime()
    const d = Math.floor(diff / 86400000)
    if (d === 0) return 'Hari ini'
    if (d === 1) return 'Kemarin'
    if (d < 30) return `${d} hari lalu`
    const m = Math.floor(d / 30)
    if (m < 12) return `${m} bulan lalu`
    return `${Math.floor(m / 12)} tahun lalu`
  }

  return (
    <div style={{ marginTop: 48 }}>
      <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', marginBottom: 20 }}>Ulasan Pelanggan</h2>

      {allReviews.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 24px', backgroundColor: '#f8fafc', border: '1px solid #e5e7eb', borderRadius: 16 }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>⭐</div>
          <p style={{ fontSize: 15, fontWeight: 700, color: '#374151', marginBottom: 6 }}>Belum ada ulasan untuk produk ini.</p>
          <p style={{ fontSize: 13, color: '#9ca3af' }}>Jadilah pelanggan pertama yang memberikan ulasan.</p>
        </div>
      ) : (
        <>
          {/* Summary */}
          <div style={{ display: 'flex', gap: 24, padding: '20px 24px', backgroundColor: '#f8fafc', border: '1px solid #e5e7eb', borderRadius: 14, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ textAlign: 'center', minWidth: 80 }}>
              <p style={{ fontSize: 40, fontWeight: 900, color: '#0f172a', lineHeight: 1 }}>{stats.avg.toFixed(1)}</p>
              <Stars rating={stats.avg} size={16} />
              <p style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>dari {stats.count} ulasan</p>
            </div>
            <div style={{ flex: 1, minWidth: 160 }}>
              {starCounts.map(({ star, count }) => {
                const pct = stats.count > 0 ? (count / stats.count) * 100 : 0
                return (
                  <div key={star} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 12, color: '#64748b', width: 12, textAlign: 'right', flexShrink: 0 }}>{star}</span>
                    <span style={{ fontSize: 12, color: '#f59e0b', lineHeight: 1 }}>★</span>
                    <div style={{ flex: 1, height: 6, backgroundColor: '#e2e8f0', borderRadius: 99, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, backgroundColor: '#f59e0b', borderRadius: 99, transition: 'width 0.3s' }} />
                    </div>
                    <span style={{ fontSize: 12, color: '#94a3b8', width: 24, textAlign: 'right', flexShrink: 0 }}>{count}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Filter */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
            {[null, 5, 4, 3, 2, 1].map(v => {
              const active = filterRating === v
              return (
                <button
                  key={v ?? 'all'}
                  onClick={() => setFilterRating(v)}
                  style={{
                    padding: '6px 12px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600,
                    backgroundColor: active ? '#1e3a5f' : '#fff',
                    color: active ? '#fff' : '#64748b',
                    boxShadow: active ? '0 2px 8px rgba(30,58,95,0.2)' : '0 1px 3px rgba(0,0,0,0.06)',
                  }}
                >
                  {v === null ? 'Semua' : `${'★'.repeat(v)} (${starCounts.find(s => s.star === v)?.count ?? 0})`}
                </button>
              )
            })}
          </div>

          {/* List */}
          {displayed.length === 0 ? (
            <p style={{ fontSize: 13, color: '#9ca3af', textAlign: 'center', padding: '24px 0' }}>Tidak ada ulasan dengan filter ini.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {displayed.map(review => (
                <div key={review.id} style={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 36, height: 36, borderRadius: '50%', backgroundColor: '#1e3a5f', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14, flexShrink: 0 }}>
                        {review.userFullName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{review.userFullName}</p>
                        <Stars rating={review.rating} size={13} />
                      </div>
                    </div>
                    <span style={{ fontSize: 11, color: '#9ca3af', flexShrink: 0 }}>{timeAgo(review.createdAt)}</span>
                  </div>
                  <p style={{ fontSize: 13, color: '#374151', lineHeight: 1.6 }}>{review.reviewText}</p>
                  {review.reviewImageUrl && (
                    <div style={{ marginTop: 10 }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={review.reviewImageUrl} alt="foto ulasan" style={{ maxWidth: 160, maxHeight: 160, objectFit: 'cover', borderRadius: 8, border: '1px solid #e2e8f0', cursor: 'pointer' }} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
