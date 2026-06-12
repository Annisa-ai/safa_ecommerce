'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import type { RajaOngkirDestination } from '@/lib/shipping/types'

const STORAGE_KEY = 'safa_rajongkir_origin'

interface ShippingConfigContextType {
  originCity: RajaOngkirDestination | null
  setOriginCity: (city: RajaOngkirDestination | null) => void
}

const ShippingConfigContext = createContext<ShippingConfigContextType | undefined>(undefined)

export function ShippingConfigProvider({ children }: { children: React.ReactNode }) {
  const [originCity, setOriginCityState] = useState<RajaOngkirDestination | null>(null)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) setOriginCityState(JSON.parse(stored))
    } catch {
      // ignore corrupt storage
    }
  }, [])

  function setOriginCity(city: RajaOngkirDestination | null) {
    setOriginCityState(city)
    if (city) localStorage.setItem(STORAGE_KEY, JSON.stringify(city))
    else localStorage.removeItem(STORAGE_KEY)
  }

  return (
    <ShippingConfigContext.Provider value={{ originCity, setOriginCity }}>
      {children}
    </ShippingConfigContext.Provider>
  )
}

export function useShippingConfig() {
  const ctx = useContext(ShippingConfigContext)
  if (!ctx) throw new Error('useShippingConfig must be used within ShippingConfigProvider')
  return ctx
}
