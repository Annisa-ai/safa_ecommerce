'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'

export interface UserAddress {
  id: string
  userId: string
  label: string
  recipientName: string
  phone: string
  province: string
  city: string
  district: string
  postalCode: string
  fullAddress: string
  landmark?: string
  isDefault: boolean
  createdAt: string
  updatedAt: string
}

interface AddressContextType {
  addresses: UserAddress[]
  getUserAddresses: (userId: string) => UserAddress[]
  addAddress: (addr: Omit<UserAddress, 'id' | 'createdAt' | 'updatedAt'>) => UserAddress
  updateAddress: (id: string, updates: Partial<UserAddress>) => void
  deleteAddress: (id: string) => void
  setDefault: (id: string, userId: string) => void
}

const AddressContext = createContext<AddressContextType | undefined>(undefined)
const KEY = 'safa_user_addresses'

function load(): UserAddress[] {
  if (typeof window === 'undefined') return []
  try { return JSON.parse(localStorage.getItem(KEY) ?? '[]') } catch { return [] }
}

export function AddressProvider({ children }: { children: React.ReactNode }) {
  const [addresses, setAddresses] = useState<UserAddress[]>([])
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => { setAddresses(load()); setHydrated(true) }, [])
  useEffect(() => {
    if (hydrated) localStorage.setItem(KEY, JSON.stringify(addresses))
  }, [addresses, hydrated])

  const getUserAddresses = useCallback(
    (userId: string) => addresses.filter(a => a.userId === userId),
    [addresses]
  )

  const addAddress = useCallback((addr: Omit<UserAddress, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString()
    let created!: UserAddress

    setAddresses(prev => {
      const updated = addr.isDefault
        ? prev.map(a => a.userId === addr.userId ? { ...a, isDefault: false } : a)
        : prev
      const hasExisting = prev.some(a => a.userId === addr.userId)
      created = {
        ...addr,
        id: `addr_${Date.now()}`,
        createdAt: now,
        updatedAt: now,
        isDefault: !hasExisting || addr.isDefault,
      }
      return [...updated, created]
    })

    return created
  }, [])

  const updateAddress = useCallback((id: string, updates: Partial<UserAddress>) => {
    setAddresses(prev => prev.map(a => {
      if (a.id !== id) {
        // If updating to default, unset others for same user
        if (updates.isDefault && a.userId === prev.find(x => x.id === id)?.userId) {
          return { ...a, isDefault: false }
        }
        return a
      }
      return { ...a, ...updates, updatedAt: new Date().toISOString() }
    }))
  }, [])

  const deleteAddress = useCallback((id: string) => {
    setAddresses(prev => {
      const target = prev.find(a => a.id === id)
      const filtered = prev.filter(a => a.id !== id)
      // If deleted was default, make first remaining address of same user default
      if (target?.isDefault) {
        const firstOther = filtered.find(a => a.userId === target.userId)
        if (firstOther) {
          return filtered.map(a => a.id === firstOther.id ? { ...a, isDefault: true } : a)
        }
      }
      return filtered
    })
  }, [])

  const setDefault = useCallback((id: string, userId: string) => {
    setAddresses(prev => prev.map(a => ({
      ...a,
      isDefault: a.userId === userId ? a.id === id : a.isDefault,
      updatedAt: a.userId === userId ? new Date().toISOString() : a.updatedAt,
    })))
  }, [])

  return (
    <AddressContext.Provider value={{ addresses, getUserAddresses, addAddress, updateAddress, deleteAddress, setDefault }}>
      {children}
    </AddressContext.Provider>
  )
}

export function useAddresses() {
  const ctx = useContext(AddressContext)
  if (!ctx) throw new Error('useAddresses must be used within AddressProvider')
  return ctx
}
