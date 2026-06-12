'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { AdminSidebar } from '@/components/admin/sidebar'
import { AdminProtectedLayout } from '@/components/admin/protected-layout'
import { useOrders } from '@/lib/contexts/order-context'
import { useAuth } from '@/lib/contexts/auth-context'

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string; dot: string }> = {
  pending:    { label: 'Menunggu',  bg: '#fffbeb', text: '#92400e', dot: '#f59e0b' },
  processing: { label: 'Diproses', bg: '#eff6ff', text: '#1d4ed8', dot: '#3b82f6' },
  ready:      { label: 'Siap',     bg: '#faf5ff', text: '#6b21a8', dot: '#a855f7' },
  shipped:    { label: 'Dikirim',  bg: '#ecfeff', text: '#155e75', dot: '#06b6d4' },
  delivered:  { label: 'Selesai',  bg: '#f0fdf4', text: '#14532d', dot: '#22c55e' },
  cancelled:  { label: 'Batal',    bg: '#fff1f2', text: '#9f1239', dot: '#f43f5e' },
}

function formatRpShort(n: number) {
  if (n >= 1_000_000) return `Rp${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `Rp${(n / 1_000).toFixed(0)}K`
  return `Rp${n.toLocaleString('id-ID')}`
}

function StatCard({ label, value, sub, color, icon }: {
  label: string; value: string | number; sub?: string; color: string; icon: React.ReactNode
}) {
  return (
    <div style={{ backgroundColor: '#fff', borderRadius: 14, padding: '20px 22px', border: '1px solid #f1f5f9', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: '#64748b' }}>{label}</p>
        <div style={{ width: 38, height: 38, borderRadius: 10, backgroundColor: color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', color }}>
          {icon}
        </div>
      </div>
      <p style={{ fontSize: 28, fontWeight: 900, color: '#0f172a', lineHeight: 1 }}>{value}</p>
      {sub && <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 6 }}>{sub}</p>}
    </div>
  )
}

export default function AdminDashboard() {
  const { orders } = useOrders()
  const { user }   = useAuth()

  const totalOrders   = orders.length
  const totalRevenue  = orders.reduce((s, o) => s + o.total, 0)
  const totalCustomers = new Set(orders.map(o => o.userId)).size

  const statusCounts: Record<string, number> = {}
  orders.forEach(o => { statusCounts[o.status] = (statusCounts[o.status] ?? 0) + 1 })

  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 6)

  const topProducts = useMemo(() => {
    const map: Record<string, { name: string; qty: number; revenue: number }> = {}
    orders
      .filter(o => o.status !== 'cancelled')
      .forEach(o => {
        o.items.forEach(item => {
          if (!map[item.productId]) map[item.productId] = { name: item.productName, qty: 0, revenue: 0 }
          map[item.productId].qty += item.quantity
          map[item.productId].revenue += item.price * item.quantity
        })
      })
    return Object.values(map).sort((a, b) => b.revenue - a.revenue).slice(0, 5)
  }, [orders])

  const today = new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <AdminProtectedLayout>
      <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', backgroundColor: '#f8fafc' }}>
        <AdminSidebar />

        <div style={{ flex: 1, overflowY: 'auto' }}>
          {/* Top bar */}
          <div style={{ backgroundColor: '#fff', borderBottom: '1px solid #f1f5f9', padding: '16px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 10 }}>
            <div>
              <h1 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a' }}>Dashboard</h1>
              <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 1 }}>{today}</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Link href="/admin/orders">
                <button style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 9, backgroundColor: '#f97316', color: '#fff', fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer' }}>
                  <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
                  </svg>
                  Kelola Pesanan
                </button>
              </Link>
            </div>
          </div>

          <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 24 }}>

            {/* Greeting */}
            <div style={{ background: 'linear-gradient(135deg,#1e3a5f 0%,#2d5986 100%)', borderRadius: 16, padding: '22px 26px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', marginBottom: 4 }}>Selamat datang kembali 👋</p>
                <p style={{ fontSize: 22, fontWeight: 800, color: '#fff' }}>{user?.fullName ?? 'Admin'}</p>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', marginTop: 4 }}>
                  Pantau aktivitas toko Anda hari ini
                </p>
              </div>
              <div style={{ fontSize: 52, opacity: 0.3 }}>📊</div>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
              <StatCard
                label="Total Pesanan" value={totalOrders} sub="Sepanjang waktu"
                color="#f97316"
                icon={<svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>}
              />
              <StatCard
                label="Total Pendapatan"
                value={totalRevenue >= 1_000_000 ? `Rp${(totalRevenue/1_000_000).toFixed(1)}M` : `Rp${(totalRevenue/1000).toFixed(0)}K`}
                sub="Semua transaksi"
                color="#22c55e"
                icon={<svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>}
              />
              <StatCard
                label="Total Pelanggan" value={totalCustomers} sub="Unik"
                color="#3b82f6"
                icon={<svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>}
              />
            </div>

            {/* Middle row: status breakdown + quick links */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20 }}>

              {/* Status breakdown */}
              <div style={{ backgroundColor: '#fff', borderRadius: 14, padding: '20px 22px', border: '1px solid #f1f5f9', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
                <p style={{ fontSize: 14, fontWeight: 800, color: '#0f172a', marginBottom: 16 }}>Status Pesanan</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {['pending','processing','ready','shipped','delivered'].map(s => {
                    const count = statusCounts[s] ?? 0
                    const pct   = totalOrders > 0 ? (count / totalOrders) * 100 : 0
                    const cfg   = STATUS_CONFIG[s]
                    return (
                      <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: cfg.dot, flexShrink: 0 }} />
                        <span style={{ fontSize: 13, color: '#475569', width: 80, flexShrink: 0 }}>{cfg.label}</span>
                        <div style={{ flex: 1, height: 6, backgroundColor: '#f1f5f9', borderRadius: 99, overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${pct}%`, backgroundColor: cfg.dot, borderRadius: 99, transition: 'width 0.5s ease' }} />
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', width: 24, textAlign: 'right', flexShrink: 0 }}>{count}</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Quick links */}
              <div style={{ backgroundColor: '#fff', borderRadius: 14, padding: '20px 22px', border: '1px solid #f1f5f9', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
                <p style={{ fontSize: 14, fontWeight: 800, color: '#0f172a', marginBottom: 16 }}>Akses Cepat</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {[
                    { href: '/admin/products', label: 'Tambah Produk', icon: '📦', color: '#f97316' },
                    { href: '/admin/orders',   label: 'Lihat Pesanan', icon: '📋', color: '#3b82f6' },
                    { href: '/admin/reviews',  label: 'Kelola Ulasan', icon: '⭐', color: '#f59e0b' },
                    { href: '/admin/analytics',label: 'Lihat Laporan', icon: '📊', color: '#22c55e' },
                  ].map(ql => (
                    <Link key={ql.href} href={ql.href} style={{ textDecoration: 'none' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 9, border: '1px solid #f1f5f9', transition: 'all 0.15s', cursor: 'pointer' }}
                        onMouseEnter={e => { const el = e.currentTarget as HTMLDivElement; el.style.backgroundColor = '#f8fafc'; el.style.borderColor = '#e2e8f0' }}
                        onMouseLeave={e => { const el = e.currentTarget as HTMLDivElement; el.style.backgroundColor = 'transparent'; el.style.borderColor = '#f1f5f9' }}
                      >
                        <span style={{ fontSize: 18 }}>{ql.icon}</span>
                        <span style={{ fontSize: 13, fontWeight: 600, color: '#334155', flex: 1 }}>{ql.label}</span>
                        <svg width="14" height="14" fill="none" stroke="#94a3b8" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
                        </svg>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Top products */}
            {topProducts.length > 0 && (
              <div style={{ backgroundColor: '#fff', borderRadius: 14, padding: '20px 22px', border: '1px solid #f1f5f9', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
                <p style={{ fontSize: 14, fontWeight: 800, color: '#0f172a', marginBottom: 16 }}>Produk Terlaris</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {topProducts.map((p, i) => {
                    const maxRevenue = topProducts[0].revenue
                    return (
                      <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span style={{ width: 20, fontSize: 12, fontWeight: 700, color: '#94a3b8', textAlign: 'right', flexShrink: 0 }}>{i + 1}</span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                            <span style={{ fontWeight: 600, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</span>
                            <span style={{ color: '#94a3b8', marginLeft: 8, flexShrink: 0 }}>{p.qty} pcs</span>
                          </div>
                          <div style={{ height: 6, backgroundColor: '#f1f5f9', borderRadius: 99, overflow: 'hidden' }}>
                            <div style={{ height: '100%', backgroundColor: '#f97316', borderRadius: 99, width: `${maxRevenue > 0 ? (p.revenue / maxRevenue) * 100 : 0}%`, transition: 'width 0.5s ease' }} />
                          </div>
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#f97316', flexShrink: 0, width: 80, textAlign: 'right' }}>
                          {formatRpShort(p.revenue)}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Recent orders table */}
            <div style={{ backgroundColor: '#fff', borderRadius: 14, border: '1px solid #f1f5f9', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 22px', borderBottom: '1px solid #f8fafc' }}>
                <p style={{ fontSize: 14, fontWeight: 800, color: '#0f172a' }}>Pesanan Terbaru</p>
                <Link href="/admin/orders" style={{ fontSize: 12, fontWeight: 600, color: '#f97316', textDecoration: 'none' }}>
                  Lihat semua →
                </Link>
              </div>
              {recentOrders.length === 0 ? (
                <div style={{ padding: '40px 22px', textAlign: 'center', color: '#94a3b8', fontSize: 14 }}>
                  Belum ada pesanan
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f8fafc' }}>
                        {['Nomor Pesanan','Pelanggan','Total','Status','Tanggal'].map(h => (
                          <th key={h} style={{ padding: '10px 18px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {recentOrders.map((order, i) => {
                        const cfg = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.pending
                        return (
                          <tr key={order.id} style={{ borderTop: '1px solid #f8fafc', transition: 'background 0.1s' }}
                            onMouseEnter={e => (e.currentTarget as HTMLTableRowElement).style.backgroundColor = '#fafafa'}
                            onMouseLeave={e => (e.currentTarget as HTMLTableRowElement).style.backgroundColor = 'transparent'}
                          >
                            <td style={{ padding: '13px 18px', fontSize: 13, fontFamily: 'monospace', fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap' }}>{order.orderNumber}</td>
                            <td style={{ padding: '13px 18px', fontSize: 13, color: '#475569' }}>{order.shippingAddress.name}</td>
                            <td style={{ padding: '13px 18px', fontSize: 13, fontWeight: 700, color: '#f97316', whiteSpace: 'nowrap' }}>Rp{order.total.toLocaleString('id-ID')}</td>
                            <td style={{ padding: '13px 18px' }}>
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, backgroundColor: cfg.bg, color: cfg.text, fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 99, whiteSpace: 'nowrap' }}>
                                <span style={{ width: 5, height: 5, borderRadius: '50%', backgroundColor: cfg.dot }} />
                                {cfg.label}
                              </span>
                            </td>
                            <td style={{ padding: '13px 18px', fontSize: 12, color: '#94a3b8', whiteSpace: 'nowrap' }}>
                              {new Date(order.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </AdminProtectedLayout>
  )
}
