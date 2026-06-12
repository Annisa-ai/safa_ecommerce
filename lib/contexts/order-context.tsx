'use client'

import { createContext, ReactNode, useContext, useState, useEffect } from 'react'
import { Order } from '@/lib/types'

interface OrderContextType {
  orders: Order[]
  addOrder: (order: Order) => void
  updateOrder: (id: string, updates: Partial<Order>) => void
  getOrderById: (id: string) => Order | undefined
  isLoading: boolean
}

const OrderContext = createContext<OrderContextType | undefined>(undefined)

export function OrderProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isHydrated, setIsHydrated] = useState(false)

  // Load from localStorage on mount
  useEffect(() => {
    const savedOrders = localStorage.getItem('orders')
    if (savedOrders) {
      try {
        const parsed = JSON.parse(savedOrders)
        setOrders(parsed)
      } catch (e) {
        console.error('Failed to load orders:', e)
      }
    }
    setIsHydrated(true)
  }, [])

  // Save to localStorage whenever orders change
  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem('orders', JSON.stringify(orders))
    }
  }, [orders, isHydrated])

  const addOrder = (order: Order) => {
    setOrders(prev => [...prev, order])
  }

  const updateOrder = (id: string, updates: Partial<Order>) => {
    setOrders(prev => prev.map(order =>
      order.id === id ? { ...order, ...updates } : order
    ))
  }

  const getOrderById = (id: string) => {
    return orders.find(order => order.id === id)
  }

  return (
    <OrderContext.Provider value={{ orders, addOrder, updateOrder, getOrderById, isLoading }}>
      {children}
    </OrderContext.Provider>
  )
}

export function useOrders() {
  const context = useContext(OrderContext)
  if (!context) {
    throw new Error('useOrders must be used within OrderProvider')
  }
  return context
}
