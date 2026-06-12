'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

const STORAGE_KEY = 'safa_wa_number'
export const WA_FALLBACK = '6285719174315'

interface WAConfigContextType {
  waNumber: string
  setWaNumber: (num: string) => void
}

const WAConfigContext = createContext<WAConfigContextType | undefined>(undefined)

export function WAConfigProvider({ children }: { children: React.ReactNode }) {
  const [waNumber, setWaNumberState] = useState(WA_FALLBACK)

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) setWaNumberState(stored)
  }, [])

  function setWaNumber(num: string) {
    const clean = num.replace(/\D/g, '')
    setWaNumberState(clean)
    localStorage.setItem(STORAGE_KEY, clean)
  }

  return (
    <WAConfigContext.Provider value={{ waNumber, setWaNumber }}>
      {children}
    </WAConfigContext.Provider>
  )
}

export function useWAConfig() {
  const ctx = useContext(WAConfigContext)
  if (!ctx) throw new Error('useWAConfig must be used within WAConfigProvider')
  return ctx
}
