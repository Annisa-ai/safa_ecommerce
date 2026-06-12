'use client'

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'

export interface ChatMessage {
  id: string
  sessionId: string
  sender: 'customer' | 'admin'
  text: string
  createdAt: string
  read: boolean
}

export interface ChatSession {
  id: string
  customerName: string
  customerEmail?: string
  lastMessage: string
  lastMessageAt: string
  unreadCount: number
  status: 'open' | 'closed'
}

interface ChatContextType {
  sessions: ChatSession[]
  messages: ChatMessage[]
  activeSessionId: string | null
  sendCustomerMessage: (text: string, sessionId?: string) => void
  sendAdminMessage: (text: string, sessionId: string) => void
  setActiveSession: (sessionId: string) => void
  markSessionRead: (sessionId: string) => void
  closeSession: (sessionId: string) => void
  getSessionMessages: (sessionId: string) => ChatMessage[]
  totalUnread: number
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

const SESSIONS_KEY = 'safa_chat_sessions'
const MESSAGES_KEY = 'safa_chat_messages'

// Stable customer session id stored in sessionStorage (per tab)
function getCustomerSessionId(): string {
  if (typeof window === 'undefined') return 'session_default'
  let id = sessionStorage.getItem('customer_session_id')
  if (!id) {
    id = `session_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
    sessionStorage.setItem('customer_session_id', id)
  }
  return id
}

export const CUSTOMER_SESSION_ID =
  typeof window !== 'undefined' ? getCustomerSessionId() : 'session_default'

function loadFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  try {
    const raw = localStorage.getItem(key)
    if (raw) return JSON.parse(raw) as T
  } catch {}
  return fallback
}

function saveToStorage<T>(key: string, value: T) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {}
}

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null)
  const [hydrated, setHydrated] = useState(false)

  // Load from localStorage on mount
  useEffect(() => {
    setSessions(loadFromStorage<ChatSession[]>(SESSIONS_KEY, []))
    setMessages(loadFromStorage<ChatMessage[]>(MESSAGES_KEY, []))
    setHydrated(true)
  }, [])

  // Persist sessions whenever they change
  useEffect(() => {
    if (hydrated) saveToStorage(SESSIONS_KEY, sessions)
  }, [sessions, hydrated])

  // Persist messages whenever they change
  useEffect(() => {
    if (hydrated) saveToStorage(MESSAGES_KEY, messages)
  }, [messages, hydrated])

  const getSessionMessages = useCallback(
    (sessionId: string) => messages.filter((m) => m.sessionId === sessionId),
    [messages]
  )

  const totalUnread = sessions.reduce((sum, s) => sum + s.unreadCount, 0)

  const sendCustomerMessage = useCallback((text: string, sessionId?: string) => {
    const sid = sessionId ?? getCustomerSessionId()
    const now = new Date().toISOString()

    const newMsg: ChatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`,
      sessionId: sid,
      sender: 'customer',
      text,
      createdAt: now,
      read: false,
    }

    setMessages((prev) => [...prev, newMsg])

    setSessions((prev) => {
      const exists = prev.find((s) => s.id === sid)
      if (exists) {
        return prev.map((s) =>
          s.id === sid
            ? { ...s, lastMessage: text, lastMessageAt: now, unreadCount: s.unreadCount + 1, status: 'open' as const }
            : s
        )
      }
      return [
        ...prev,
        {
          id: sid,
          customerName: 'Customer',
          lastMessage: text,
          lastMessageAt: now,
          unreadCount: 1,
          status: 'open' as const,
        },
      ]
    })
  }, [])

  const sendAdminMessage = useCallback((text: string, sessionId: string) => {
    const now = new Date().toISOString()

    const newMsg: ChatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`,
      sessionId,
      sender: 'admin',
      text,
      createdAt: now,
      read: true,
    }

    setMessages((prev) => [...prev, newMsg])
    setSessions((prev) =>
      prev.map((s) => (s.id === sessionId ? { ...s, lastMessage: text, lastMessageAt: now } : s))
    )
  }, [])

  const setActiveSession = useCallback((sessionId: string) => {
    setActiveSessionId(sessionId)
    setMessages((prev) =>
      prev.map((m) =>
        m.sessionId === sessionId && m.sender === 'customer' ? { ...m, read: true } : m
      )
    )
    setSessions((prev) =>
      prev.map((s) => (s.id === sessionId ? { ...s, unreadCount: 0 } : s))
    )
  }, [])

  const markSessionRead = useCallback((sessionId: string) => {
    setMessages((prev) =>
      prev.map((m) => (m.sessionId === sessionId ? { ...m, read: true } : m))
    )
    setSessions((prev) =>
      prev.map((s) => (s.id === sessionId ? { ...s, unreadCount: 0 } : s))
    )
  }, [])

  const closeSession = useCallback((sessionId: string) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === sessionId ? { ...s, status: 'closed' as const } : s))
    )
    setActiveSessionId((prev) => (prev === sessionId ? null : prev))
  }, [])

  return (
    <ChatContext.Provider
      value={{
        sessions,
        messages,
        activeSessionId,
        sendCustomerMessage,
        sendAdminMessage,
        setActiveSession,
        markSessionRead,
        closeSession,
        getSessionMessages,
        totalUnread,
      }}
    >
      {children}
    </ChatContext.Provider>
  )
}

export function useChat() {
  const context = useContext(ChatContext)
  if (!context) throw new Error('useChat harus digunakan dalam ChatProvider')
  return context
}
