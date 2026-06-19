'use client'

import { createContext, ReactNode, useContext, useState, useEffect } from 'react'
import { Order } from '@/lib/types'
import { supabase } from '@/lib/supabase/client'

interface OrderContextType {
  orders: Order[]
  addOrder: (order: Order) => void
  updateOrder: (id: string, updates: Partial<Order>) => void
  getOrderById: (id: string) => Order | undefined
  isLoading: boolean
}

const OrderContext = createContext<OrderContextType | undefined>(undefined)

// ── Helper: map raw Supabase row → Order ─────────────────────────────────────
function mapRowToOrder(item: any): Order {
  return {
    id: String(item.id),
    orderNumber: item.order_number || item.orderNumber || '',
    userId: String(item.user_id || item.userId || ''),
    status: item.status,
    total: Number(item.final_price ?? item.total ?? 0),
    paymentStatus: item.payment_status || 'pending',
    subtotal: Number(item.total_price ?? 0),
    shippingCost: Number(item.shipping_cost ?? 0),
    shippingInfo: item.shipping_info ?? undefined,
    notes: item.notes ?? undefined,
    createdAt: new Date(item.created_at || item.createdAt),
    updatedAt: new Date(item.updated_at || item.created_at || Date.now()),
    shippingAddress:
      typeof item.shipping_address === 'string'
        ? JSON.parse(item.shipping_address)
        : item.shipping_address || item.shippingAddress || {},
    items: (item.order_items || []).map((it: any) => ({
      productId: String(it.product_id ?? ''),
      productName: it.product_name ?? '',
      quantity: Number(it.quantity ?? 1),
      price: Number(it.unit_price ?? 0),
      selectedMethod: it.selected_method ?? 'sablon',
      customization: it.customization ?? undefined,
    })),
  }
}

export function OrderProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchOrders() {
      try {
        setIsLoading(true)
        const { data, error } = await supabase
          .from('orders')
          .select('*, order_items(*)')
          .order('created_at', { ascending: false })

        if (error) throw error
        if (data) setOrders(data.map(mapRowToOrder))
      } catch (e) {
        console.error('Gagal mengambil data orders dari Supabase:', e)
      } finally {
        setIsLoading(false)
      }
    }

    fetchOrders()
  }, [])

  useEffect(() => {
    const channel = supabase
      .channel('global-orders-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        async (payload: any) => {
          console.log('Realtime DB Update dideteksi di Context:', payload)

          if (payload.eventType === 'INSERT') {
            const { data: newOrderData, error } = await supabase
              .from('orders')
              .select('*, order_items(*)')
              .eq('id', payload.new.id)
              .single()

            if (error) {
              console.error('Gagal fetch order baru setelah INSERT:', error)
              return
            }
            if (newOrderData) {
              setOrders(prev => [mapRowToOrder(newOrderData), ...prev])
            }
          }

          else if (payload.eventType === 'UPDATE') {
            const updatedItem = payload.new
            setOrders(prev =>
              prev.map(order =>
                order.id === updatedItem.id
                  ? {
                      ...order,
                      status: updatedItem.status,
                      paymentStatus: updatedItem.payment_status || order.paymentStatus,
                      total: Number(updatedItem.final_price ?? updatedItem.total ?? order.total),
                      updatedAt: new Date(updatedItem.updated_at || Date.now()),
                    }
                  : order
              )
            )
          }
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  const addOrder = (order: Order) => setOrders(prev => [order, ...prev])

  const updateOrder = (id: string, updates: Partial<Order>) =>
    setOrders(prev => prev.map(order => (order.id === id ? { ...order, ...updates } : order)))

  const getOrderById = (id: string) => orders.find(order => order.id === id)

  return (
    <OrderContext.Provider value={{ orders, addOrder, updateOrder, getOrderById, isLoading }}>
      {children}
    </OrderContext.Provider>
  )
}

export function useOrders() {
  const context = useContext(OrderContext)
  if (!context) throw new Error('useOrders must be used within OrderProvider')
  return context
}