'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import type { AppNotification, NotificationType } from '@/lib/types'

const STORAGE_KEY = 'safa_notifications'

interface NotificationContextType {
  notifications: AppNotification[]
  userNotifications: (userId: string) => AppNotification[]
  adminNotifications: () => AppNotification[]
  unreadCount: (userId: string) => number
  adminUnreadCount: () => number
  addNotification: (n: Omit<AppNotification, 'id' | 'createdAt' | 'isRead'>) => void
  markRead: (id: string) => void
  markAllRead: (userId: string, role: 'customer' | 'admin') => void
  clearAll: (userId: string, role: 'customer' | 'admin') => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

function load(): AppNotification[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

function save(data: AppNotification[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)) } catch { }
}

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setNotifications(load())
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (hydrated) save(notifications)
  }, [notifications, hydrated])

  const addNotification = useCallback((n: Omit<AppNotification, 'id' | 'createdAt' | 'isRead'>) => {
    const newN: AppNotification = {
      ...n,
      id: `notif_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      isRead: false,
      createdAt: new Date().toISOString(),
    }
    setNotifications(prev => [newN, ...prev].slice(0, 200)) // keep max 200
  }, [])

  const markRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n))
  }, [])

  const markAllRead = useCallback((userId: string, role: 'customer' | 'admin') => {
    setNotifications(prev => prev.map(n =>
      (role === 'admin' ? n.role === 'admin' : n.userId === userId && n.role === 'customer')
        ? { ...n, isRead: true }
        : n
    ))
  }, [])

  const clearAll = useCallback((userId: string, role: 'customer' | 'admin') => {
    setNotifications(prev => prev.filter(n =>
      role === 'admin' ? n.role !== 'admin' : !(n.userId === userId && n.role === 'customer')
    ))
  }, [])

  const userNotifications = useCallback((userId: string) =>
    notifications.filter(n => n.userId === userId && n.role === 'customer'),
    [notifications])

  const adminNotifications = useCallback(() =>
    notifications.filter(n => n.role === 'admin'),
    [notifications])

  const unreadCount = useCallback((userId: string) =>
    notifications.filter(n => n.userId === userId && n.role === 'customer' && !n.isRead).length,
    [notifications])

  const adminUnreadCount = useCallback(() =>
    notifications.filter(n => n.role === 'admin' && !n.isRead).length,
    [notifications])

  return (
    <NotificationContext.Provider value={{
      notifications,
      userNotifications,
      adminNotifications,
      unreadCount,
      adminUnreadCount,
      addNotification,
      markRead,
      markAllRead,
      clearAll,
    }}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const ctx = useContext(NotificationContext)
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider')
  return ctx
}

// ── Helpers to build notification payloads ────────────────────────────────────

export function buildOrderNotif(userId: string, orderNumber: string, orderId: string) {
  return {
    userId,
    role: 'customer' as const,
    title: '📦 Pesanan berhasil dibuat',
    message: `Pesanan ${orderNumber} sedang menunggu konfirmasi.`,
    type: 'order' as const,
    referenceId: orderId,
    referenceUrl: `/order-tracking/${orderId}`,
  }
}

export function buildStatusNotif(
  userId: string,
  orderNumber: string,
  orderId: string,
  status: string
) {
  const MAP: Record<string, { title: string; message: string }> = {
    processing: { title: '⚙️ Pesanan sedang diproses', message: `Pesanan ${orderNumber} sedang diproses.` },
    ready:      { title: '✅ Produksi selesai', message: `Pesanan ${orderNumber} siap untuk dikirim.` },
    shipped:    { title: '🚚 Pesanan telah dikirim', message: `Pesanan ${orderNumber} dalam perjalanan.` },
    delivered:  { title: '🎉 Pesanan selesai', message: `Pesanan ${orderNumber} telah diterima.` },
    cancelled:  { title: '❌ Pesanan dibatalkan', message: `Pesanan ${orderNumber} telah dibatalkan.` },
  }
  const info = MAP[status] ?? { title: '📦 Status pesanan diperbarui', message: `Pesanan ${orderNumber}: ${status}.` }
  return {
    userId,
    role: 'customer' as const,
    ...info,
    type: 'order' as const,
    referenceId: orderId,
    referenceUrl: `/order-tracking/${orderId}`,
  }
}

export function buildAdminNewOrderNotif(orderNumber: string, orderId: string, customerName: string) {
  return {
    userId: 'admin',
    role: 'admin' as const,
    title: '🛒 Pesanan baru masuk',
    message: `Pesanan ${orderNumber} dari ${customerName}.`,
    type: 'order' as const,
    referenceId: orderId,
    referenceUrl: `/admin/orders`,
  }
}

export function buildAdminDesignNotif(orderNumber: string, orderId: string) {
  return {
    userId: 'admin',
    role: 'admin' as const,
    title: '🎨 Upload desain baru',
    message: `Customer mengupload desain untuk pesanan ${orderNumber}.`,
    type: 'design' as const,
    referenceId: orderId,
    referenceUrl: `/admin/orders`,
  }
}
