'use client'

import { useState, useEffect } from 'react'
import Script from 'next/script'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { useCart } from '@/lib/contexts/cart-context'
import { useOrders } from '@/lib/contexts/order-context'
import { useProducts } from '@/lib/contexts/product-context'
import { useAuth } from '@/lib/contexts/auth-context'
import { useNotifications, buildOrderNotif, buildAdminNewOrderNotif, buildAdminDesignNotif } from '@/lib/contexts/notification-context'
import { useAddresses, type UserAddress } from '@/lib/contexts/address-context'
import { Order, Address } from '@/lib/types'
import { Button } from '@/components/ui/button'
import MidtransPaymentButton from '@/components/checkout/midtrans-payment-button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { DropZone } from '@/components/ui/drop-zone'
import { ShippingSelector } from '@/components/checkout/shipping-selector'
import { useShippingConfig } from '@/lib/contexts/shipping-config-context'
import { estimateCartWeightGrams } from '@/lib/shipping/utils'
import type { ShippingSelection } from '@/lib/shipping/types'
import { AddressFormModal } from '@/components/address/address-form-modal'
import { createOrder } from '@/lib/supabase/order-queries'

type CheckoutStep = 'shipping' | 'design' | 'payment' | 'review'

function addrToCheckout(a: UserAddress): Address {
  return {
    name: a.recipientName,
    phone: a.phone,
    email: '',
    street: a.fullAddress,
    city: a.city,
    province: a.province,
    postalCode: a.postalCode,
  }
}

export default function CheckoutPage() {
  const [step, setStep] = useState<CheckoutStep>('shipping')
  const [loading, setLoading] = useState(false)

  const { items, clearCart } = useCart()
  const { addOrder } = useOrders()
  const { products, updateProduct } = useProducts()
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const { addNotification } = useNotifications()
  const { getUserAddresses, addAddress } = useAddresses()
  const { originCity } = useShippingConfig()
  const router = useRouter()

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/login?redirect=/checkout')
    }
  }, [authLoading, isAuthenticated, router])

  const userId = user?.id?.toString() ?? ''
  const savedAddresses = getUserAddresses(userId)
  const defaultAddr = savedAddresses.find(a => a.isDefault) ?? savedAddresses[0]

  const [selectedAddrId, setSelectedAddrId] = useState<string | null>(defaultAddr?.id ?? null)
  const [showAddModal, setShowAddModal] = useState(false)

  const [manualAddress, setManualAddress] = useState<Address>({
    name: '', phone: '', email: '',
    street: '', city: '', province: '', postalCode: '',
  })

  const selectedSaved = savedAddresses.find(a => a.id === selectedAddrId)

  const address: Address = selectedSaved
    ? { ...addrToCheckout(selectedSaved), email: user?.email ?? '' }
    : manualAddress

  const isAddressComplete = selectedSaved
    ? true
    : Object.values(manualAddress).every(v => v !== '')

  const [paymentMethod, setPaymentMethod] = useState('duitku')
  const [midtransSnapToken, setMidtransSnapToken] = useState<string | null>(null)
  const [midtransTransactionId, setMidtransTransactionId] = useState<string | null>(null)
  const [shippingSelection, setShippingSelection] = useState<ShippingSelection | null>(null)

  const cartItems = items
    .map(item => ({ ...item, product: products.find(p => p.id === item.productId) }))
    .filter(item => item.product)

  const subtotal = cartItems.reduce((t, item) => t + (item.product?.price || 0) * item.quantity, 0)
  const weightGrams = estimateCartWeightGrams(cartItems.map(item => item.quantity))
  const shipping = shippingSelection?.cost ?? 0
  const total = subtotal + shipping

  const handleMidtransPlaceOrder = async () => {
    if (!isAddressComplete || !shippingSelection) return

    setLoading(true)
    try {
      const orderNumber = `ORD-${Date.now()}`
      const targetUserId = userId || `user-${Date.now()}`

      const response = await fetch('/api/midtrans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: orderNumber,
          orderNumber,
          finalPrice: total,
          customerEmail: user?.email || address.email,
          customerName: address.name,
          customerPhone: address.phone,
          userId: targetUserId,
          subtotal,
          shippingCost: shippingSelection.cost,
          shippingAddress: address,
          items: cartItems,
        }),
      })

      const data = await response.json()

      if (!response.ok || !data.snapToken) {
        throw new Error('Gagal membuat transaksi Midtrans')
      }

      setMidtransSnapToken(data.snapToken)
      setMidtransTransactionId(orderNumber)

    } catch (e) {
      alert('Gagal Midtrans')
    } finally {
      setLoading(false)
    }
  }

  const steps: { key: CheckoutStep; label: string }[] = [
    { key: 'shipping', label: 'Pengiriman' },
    { key: 'design', label: 'Desain' },
    { key: 'payment', label: 'Pembayaran' },
    { key: 'review', label: 'Konfirmasi' },
  ]

  const stepIndex = steps.findIndex(s => s.key === step)

  if (authLoading || !isAuthenticated) {
    return (
      <>
        <Script
          src="https://app.sandbox.midtrans.com/snap/snap.js"
          data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
          strategy="afterInteractive"
        />
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          Memuat...
        </div>
        <Footer />
      </>
    )
  }

  if (cartItems.length === 0) {
    return (
      <>
        <Script
          src="https://app.sandbox.midtrans.com/snap/snap.js"
          data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
          strategy="afterInteractive"
        />
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          Keranjang kosong
        </div>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Script
        src="https://app.sandbox.midtrans.com/snap/snap.js"
        data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
        strategy="afterInteractive"
      />

      <Header />

      <main className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <h1 className="text-4xl font-bold mb-10">Checkout</h1>

          <Button
            onClick={handleMidtransPlaceOrder}
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Generate Midtrans Token'}
          </Button>

          {midtransSnapToken && (
            <MidtransPaymentButton
              snapToken={midtransSnapToken}
              amount={total}
              onSuccess={() => router.push('/checkout/success')}
              onError={(err) => alert(err)}
              onClose={() => {}}
            />
          )}
        </div>
      </main>

      <Footer />
    </>
  )
}