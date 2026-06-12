'use client'

import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'
import { useNotifications } from '@/lib/contexts/notification-context'
import { useAuth } from '@/lib/contexts/auth-context'
import type { AppNotification } from '@/lib/types'

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'Baru saja'
  if (m < 60) return `${m} menit lalu`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h} jam lalu`
  const d = Math.floor(h / 24)
  if (d === 1) return 'Kemarin'
  return `${d} hari lalu`
}

// ── Shared Dropdown Panel ────────────────────────────────────────────────────
function NotifPanel({
  title,
  items,
  onMarkAll,
  onMarkRead,
  onClear,
  onNavigate,
  rect,
  panelRef,
}: {
  title: string
  items: AppNotification[]
  onMarkAll: () => void
  onMarkRead: (id: string) => void
  onClear: () => void
  onNavigate: (url?: string) => void
  rect: DOMRect
  panelRef: React.RefObject<HTMLDivElement | null>
}) {
  const top = rect.bottom + 8
  const right = window.innerWidth - rect.right

  return createPortal(
    <div
      ref={panelRef}
      style={{
        position: 'fixed',
        top,
        right,
        width: 340,
        maxHeight: 480,
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'rgb(255,255,255)',
        border: '1.5px solid rgb(229,231,235)',
        borderRadius: 16,
        boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
        zIndex: 2147483647,
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div style={{ padding: '14px 16px', borderBottom: '1px solid rgb(229,231,235)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'rgb(249,250,251)' }}>
        <span style={{ fontWeight: 700, fontSize: 15, color: 'rgb(17,24,39)' }}>🔔 {title}</span>
        <div style={{ display: 'flex', gap: 8 }}>
          {items.length > 0 && (
            <button onClick={onMarkAll} style={{ fontSize: 11, color: 'rgb(30,58,95)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
              Tandai semua dibaca
            </button>
          )}
        </div>
      </div>

      {/* List */}
      <div style={{ overflowY: 'auto', flex: 1 }}>
        {items.length === 0 ? (
          <div style={{ padding: '40px 20px', textAlign: 'center' }}>
            <div style={{ fontSize: 36, marginBottom: 10 }}>🔔</div>
            <p style={{ fontSize: 14, fontWeight: 600, color: 'rgb(17,24,39)', marginBottom: 4 }}>Belum ada notifikasi</p>
            <p style={{ fontSize: 12, color: 'rgb(107,114,128)' }}>Notifikasi aktivitas kamu akan muncul di sini.</p>
          </div>
        ) : (
          items.map(n => (
            <div
              key={n.id}
              onClick={() => { onMarkRead(n.id); onNavigate(n.referenceUrl) }}
              style={{
                padding: '12px 16px',
                borderBottom: '1px solid rgb(243,244,246)',
                cursor: n.referenceUrl ? 'pointer' : 'default',
                backgroundColor: n.isRead ? 'rgb(255,255,255)' : 'rgb(239,246,255)',
                display: 'flex',
                gap: 10,
                alignItems: 'flex-start',
                transition: 'background 0.15s',
              }}
            >
              {/* Unread dot */}
              <div style={{ flexShrink: 0, marginTop: 5 }}>
                {!n.isRead
                  ? <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'rgb(59,130,246)' }} />
                  : <div style={{ width: 8, height: 8 }} />
                }
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <p style={{ fontSize: 13, fontWeight: n.isRead ? 400 : 700, color: 'rgb(17,24,39)', marginBottom: 2 }}>{n.title}</p>
                <p style={{ fontSize: 12, color: 'rgb(107,114,128)', lineHeight: 1.4, marginBottom: 4 }}>{n.message}</p>
                <p style={{ fontSize: 10, color: 'rgb(156,163,175)' }}>{timeAgo(n.createdAt)}</p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      {items.length > 0 && (
        <div style={{ padding: '10px 16px', borderTop: '1px solid rgb(229,231,235)', display: 'flex', justifyContent: 'flex-end', backgroundColor: 'rgb(249,250,251)' }}>
          <button onClick={onClear} style={{ fontSize: 11, color: 'rgb(156,163,175)', background: 'none', border: 'none', cursor: 'pointer' }}>
            Hapus semua
          </button>
        </div>
      )}
    </div>,
    document.body
  )
}

// ── User Bell ────────────────────────────────────────────────────────────────
export function UserNotificationBell() {
  const { user, isAuthenticated } = useAuth()
  const { userNotifications, unreadCount, markRead, markAllRead, clearAll } = useNotifications()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [rect, setRect] = useState<DOMRect | null>(null)
  const [mounted, setMounted] = useState(false)
  const btnRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (!open) return
    function handler(e: MouseEvent) {
      const t = e.target as Node
      if (!panelRef.current?.contains(t) && !btnRef.current?.contains(t)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  useEffect(() => {
    if (!open) return
    function update() { if (btnRef.current) setRect(btnRef.current.getBoundingClientRect()) }
    window.addEventListener('scroll', update, true)
    window.addEventListener('resize', update)
    return () => { window.removeEventListener('scroll', update, true); window.removeEventListener('resize', update) }
  }, [open])

  if (!isAuthenticated || !user) return null

  const userId = user.id?.toString() ?? ''
  const notifs = userNotifications(userId)
  const count = unreadCount(userId)

  function toggle() {
    if (!open && btnRef.current) setRect(btnRef.current.getBoundingClientRect())
    setOpen(v => !v)
  }

  return (
    <>
      <button
        ref={btnRef}
        onClick={toggle}
        style={{ position: 'relative', background: 'none', border: 'none', cursor: 'pointer', padding: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}
        aria-label="Notifikasi"
      >
        <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {count > 0 && (
          <span style={{ position: 'absolute', top: 0, right: 0, backgroundColor: 'rgb(220,38,38)', color: '#fff', borderRadius: '50%', width: 17, height: 17, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700 }}>
            {count > 9 ? '9+' : count}
          </span>
        )}
      </button>

      {mounted && open && rect && (
        <NotifPanel
          title="Notifikasi"
          items={notifs}
          rect={rect}
          panelRef={panelRef}
          onMarkAll={() => markAllRead(userId, 'customer')}
          onMarkRead={markRead}
          onClear={() => clearAll(userId, 'customer')}
          onNavigate={(url) => { if (url) router.push(url); setOpen(false) }}
        />
      )}
    </>
  )
}

// ── Admin Bell ───────────────────────────────────────────────────────────────
export function AdminNotificationBell() {
  const { adminNotifications, adminUnreadCount, markRead, markAllRead, clearAll } = useNotifications()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [rect, setRect] = useState<DOMRect | null>(null)
  const [mounted, setMounted] = useState(false)
  const btnRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (!open) return
    function handler(e: MouseEvent) {
      const t = e.target as Node
      if (!panelRef.current?.contains(t) && !btnRef.current?.contains(t)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  useEffect(() => {
    if (!open) return
    function update() { if (btnRef.current) setRect(btnRef.current.getBoundingClientRect()) }
    window.addEventListener('scroll', update, true)
    window.addEventListener('resize', update)
    return () => { window.removeEventListener('scroll', update, true); window.removeEventListener('resize', update) }
  }, [open])

  const notifs = adminNotifications()
  const count = adminUnreadCount()

  function toggle() {
    if (!open && btnRef.current) setRect(btnRef.current.getBoundingClientRect())
    setOpen(v => !v)
  }

  return (
    <>
      <button
        ref={btnRef}
        onClick={toggle}
        style={{ position: 'relative', background: 'none', border: 'none', cursor: 'pointer', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 10, width: '100%', borderRadius: 8 }}
        aria-label="Notifikasi Admin"
      >
        <span style={{ fontSize: 20 }}>🔔</span>
        <span style={{ flex: 1, fontSize: 14, fontWeight: 500, textAlign: 'left', color: open ? 'inherit' : undefined }}>Notifikasi</span>
        {count > 0 && (
          <span style={{ backgroundColor: 'rgb(220,38,38)', color: '#fff', borderRadius: '50%', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, flexShrink: 0 }}>
            {count > 9 ? '9+' : count}
          </span>
        )}
      </button>

      {mounted && open && rect && (
        <NotifPanel
          title="Aktivitas Terbaru"
          items={notifs}
          rect={rect}
          panelRef={panelRef}
          onMarkAll={() => markAllRead('admin', 'admin')}
          onMarkRead={markRead}
          onClear={() => clearAll('admin', 'admin')}
          onNavigate={(url) => { if (url) router.push(url); setOpen(false) }}
        />
      )}
    </>
  )
}
