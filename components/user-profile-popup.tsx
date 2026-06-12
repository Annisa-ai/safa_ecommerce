'use client'

import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/contexts/auth-context'
import { useOrders } from '@/lib/contexts/order-context'

type Panel = 'menu' | 'orders'

const STATUS_BADGE: Record<string, { bg: string; color: string }> = {
  pending:    { bg: '#fef9c3', color: '#854d0e' },
  processing: { bg: '#dbeafe', color: '#1e40af' },
  ready:      { bg: '#f3e8ff', color: '#6b21a8' },
  shipped:    { bg: '#cffafe', color: '#155e75' },
  delivered:  { bg: '#dcfce7', color: '#166534' },
  cancelled:  { bg: '#fee2e2', color: '#991b1b' },
}
const STATUS_LABEL: Record<string, string> = {
  pending: 'Tertunda', processing: 'Diproses', ready: 'Siap Kirim',
  shipped: 'Dikirim', delivered: 'Selesai', cancelled: 'Dibatalkan',
}

function BackBtn({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderBottom: '1px solid #e5e7eb', backgroundColor: '#fff' }}>
      <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: '#6b7280', display: 'flex', alignItems: 'center' }}>
        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <span style={{ fontWeight: 700, fontSize: 14, color: '#111827' }}>{title}</span>
    </div>
  )
}

export function UserProfilePopup() {
  const router = useRouter()
  const { user, isAuthenticated, logout } = useAuth()
  const { orders } = useOrders()

  const [open, setOpen] = useState(false)
  const [panel, setPanel] = useState<Panel>('menu')
  const [hovered, setHovered] = useState<string | null>(null)
  const [rect, setRect] = useState<DOMRect | null>(null)
  const [mounted, setMounted] = useState(false)
  const [address, setAddress] = useState({ street: '', city: '', province: '', postalCode: '' })

  const btnRef = useRef<HTMLButtonElement>(null)
  const popupRef = useRef<HTMLDivElement>(null)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (!open) return
    function onDown(e: MouseEvent) {
      const t = e.target as Node
      if (popupRef.current?.contains(t) || btnRef.current?.contains(t)) return
      setOpen(false)
      setPanel('menu')
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open])

  useEffect(() => {
    if (!open) return
    function update() {
      if (btnRef.current) setRect(btnRef.current.getBoundingClientRect())
    }
    window.addEventListener('scroll', update, true)
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update, true)
      window.removeEventListener('resize', update)
    }
  }, [open])

  if (!isAuthenticated || !user) return null

  const userOrders = orders.filter(o => String(o.userId) === String(user.id))
  const initials = user.fullName?.charAt(0).toUpperCase() ?? '?'

  function handleToggle() {
    if (!open && btnRef.current) setRect(btnRef.current.getBoundingClientRect())
    setOpen(v => !v)
    setPanel('menu')
  }

  const close = () => { setOpen(false); setPanel('menu') }
  const handleLogout = () => { close(); logout(); router.push('/') }

  const popupTop = rect ? rect.bottom + 8 : 0
  const popupRight = rect ? window.innerWidth - rect.right : 16

  const W: React.CSSProperties = {
    position: 'fixed',
    top: popupTop,
    right: popupRight,
    width: 300,
    maxHeight: '80vh',
    overflowY: 'auto',
    backgroundColor: 'rgb(255,255,255)',
    color: 'rgb(17,24,39)',
    border: '1.5px solid rgb(229,231,235)',
    borderRadius: 16,
    boxShadow: '0 20px 60px rgba(0,0,0,0.22)',
    zIndex: 2147483647,
    isolation: 'isolate',
    willChange: 'transform',
  }

  const inp: React.CSSProperties = {
    width: '100%', padding: '9px 12px', fontSize: 13,
    border: '1px solid rgb(209,213,219)', borderRadius: 8,
    backgroundColor: 'rgb(249,250,251)', color: 'rgb(17,24,39)',
    outline: 'none', boxSizing: 'border-box',
  }
  const btn: React.CSSProperties = {
    width: '100%', padding: '10px 0', borderRadius: 9,
    fontSize: 14, fontWeight: 700, cursor: 'pointer',
    backgroundColor: 'rgb(30,58,95)', color: 'rgb(255,255,255)',
    border: 'none',
  }
  const itemStyle = (id: string, red = false): React.CSSProperties => ({
    width: '100%', display: 'flex', alignItems: 'center', gap: 10,
    padding: '10px 16px', fontSize: 13, border: 'none', cursor: 'pointer',
    textAlign: 'left',
    backgroundColor: hovered === id ? (red ? 'rgb(255,241,242)' : 'rgb(243,244,246)') : 'rgb(255,255,255)',
    color: red ? 'rgb(220,38,38)' : 'rgb(17,24,39)',
  })
  const lbl: React.CSSProperties = {
    display: 'block', fontSize: 11, fontWeight: 600,
    color: 'rgb(107,114,128)', marginBottom: 5,
  }

  const menuItems = [
    { id: 'orders',  icon: '📦', label: 'Pesanan Saya',     badge: userOrders.length || null, href: '/pesanan-saya' },
    { id: 'address', icon: '📍', label: 'Alamat Pengiriman', badge: null, href: '/account/addresses' },
  ]

  const popup = open && rect ? (
    <div ref={popupRef} style={W}>

      {/* ── MENU UTAMA ── */}
      {panel === 'menu' && (
        <>
          {/* User header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', backgroundColor: 'rgb(249,250,251)', borderBottom: '1px solid rgb(229,231,235)' }}>
            <div style={{ width: 42, height: 42, borderRadius: '50%', backgroundColor: 'rgb(30,58,95)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 17, flexShrink: 0 }}>
              {initials}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: 'rgb(17,24,39)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.fullName}</div>
              <div style={{ fontSize: 11, color: 'rgb(107,114,128)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</div>
            </div>
          </div>

          {/* Menu items */}
          <div style={{ paddingTop: 4, paddingBottom: 4 }}>
            {menuItems.map(it => (
              <button
                key={it.id}
                onClick={() => { if (it.href) { close(); router.push(it.href) } else setPanel(it.id as Panel) }}
                onMouseEnter={() => setHovered(it.id)}
                onMouseLeave={() => setHovered(null)}
                style={itemStyle(it.id)}
              >
                <span style={{ fontSize: 16 }}>{it.icon}</span>
                <span style={{ flex: 1 }}>{it.label}</span>
                {it.badge != null && (
                  <span style={{ fontSize: 10, fontWeight: 700, backgroundColor: 'rgb(30,58,95)', color: '#fff', borderRadius: 99, padding: '1px 7px' }}>
                    {it.badge}
                  </span>
                )}
                <svg width="13" height="13" fill="none" stroke="rgb(156,163,175)" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ))}

            <div style={{ height: 1, backgroundColor: 'rgb(229,231,235)', margin: '4px 0' }} />

            <button
              onClick={handleLogout}
              onMouseEnter={() => setHovered('logout')}
              onMouseLeave={() => setHovered(null)}
              style={itemStyle('logout', true)}
            >
              <span style={{ fontSize: 16 }}>🚪</span>
              <span>Logout</span>
            </button>
          </div>
        </>
      )}

      {/* ── PESANAN SAYA ── */}
      {panel === 'orders' && (
        <>
          <BackBtn title="Pesanan Saya" onBack={() => setPanel('menu')} />
          <div style={{ maxHeight: 300, overflowY: 'auto', backgroundColor: 'rgb(255,255,255)' }}>
            {userOrders.length === 0
              ? <p style={{ textAlign: 'center', padding: '32px 0', fontSize: 13, color: 'rgb(107,114,128)' }}>Belum ada pesanan</p>
              : [...userOrders].reverse().map(o => (
                <div key={o.id} style={{ padding: '10px 16px', borderBottom: '1px solid rgb(229,231,235)', display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'flex-start', backgroundColor: 'rgb(255,255,255)' }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 11, fontFamily: 'monospace', fontWeight: 700, color: 'rgb(17,24,39)' }}>{o.orderNumber}</div>
                    <div style={{ fontSize: 11, color: 'rgb(107,114,128)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 150 }}>
                      {o.items.map(i => `${i.productName} ×${i.quantity}`).join(', ')}
                    </div>
                    <div style={{ fontSize: 10, color: 'rgb(156,163,175)', marginTop: 2 }}>
                      {new Date(o.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, borderRadius: 99, padding: '2px 8px', backgroundColor: STATUS_BADGE[o.status]?.bg ?? '#f3f4f6', color: STATUS_BADGE[o.status]?.color ?? '#374151' }}>
                      {STATUS_LABEL[o.status] ?? o.status}
                    </span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: 'rgb(30,58,95)' }}>Rp{o.total.toLocaleString('id-ID')}</span>
                  </div>
                </div>
              ))
            }
          </div>
          <div style={{ padding: '10px 16px', borderTop: '1px solid rgb(229,231,235)', textAlign: 'center', backgroundColor: 'rgb(255,255,255)' }}>
            <Link href="/pesanan-saya" onClick={close} style={{ fontSize: 12, color: 'rgb(30,58,95)', textDecoration: 'none', fontWeight: 600 }}>
              Lihat semua pesanan →
            </Link>
          </div>
        </>
      )}


    </div>
  ) : null

  return (
    <>
      <button
        ref={btnRef}
        onClick={handleToggle}
        style={{
          width: 34, height: 34, borderRadius: '50%',
          backgroundColor: 'rgb(30,58,95)', color: 'rgb(255,255,255)',
          fontSize: 13, fontWeight: 700,
          border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}
        aria-label="Profil"
      >
        {initials}
      </button>
      {mounted && createPortal(popup, document.body)}
    </>
  )
}
