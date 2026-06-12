'use client'

import Link from 'next/link'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { useOrders } from '@/lib/contexts/order-context'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface OrderDetailPageProps {
  params: Promise<{ orderId: string }>
}

export default function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { orderId } = (params as any)
  const { getOrderById } = useOrders()
  const order = getOrderById(orderId)

  if (!order) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Pesanan tidak ditemukan</h1>
            <Link href="/order-tracking">
              <Button>Kembali ke Pelacakan Pesanan</Button>
            </Link>
          </div>
        </div>
        <Footer />
      </>
    )
  }

  const statusSteps = [
    { status: 'pending', label: 'Pesanan Diterima', icon: '✓' },
    { status: 'processing', label: 'Diproses', icon: '○' },
    { status: 'ready', label: 'Siap Dikirim', icon: '○' },
    { status: 'shipped', label: 'Dalam Pengiriman', icon: '→' },
    { status: 'delivered', label: 'Tiba', icon: '✓' }
  ]

  const currentStepIndex = statusSteps.findIndex(s => s.status === order.status)

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    processing: 'bg-blue-100 text-blue-800',
    ready: 'bg-purple-100 text-purple-800',
    shipped: 'bg-cyan-100 text-cyan-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800'
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-4xl font-bold text-foreground mb-2">Pesanan {order.orderNumber}</h1>
                <p className="text-muted-foreground">
                  Tanggal Pesanan: {new Date(order.createdAt).toLocaleDateString('id-ID', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
              <span className={`inline-block px-4 py-2 rounded-full text-sm font-bold ${statusColors[order.status] || 'bg-gray-100 text-gray-800'}`}>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </span>
            </div>
          </div>

          {/* Status Timeline */}
          <Card className="p-8 border border-border mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-8">Status Pengiriman</h2>
            <div className="flex justify-between relative mb-12">
              {/* Progress Line */}
              <div className="absolute top-5 left-0 right-0 h-1 bg-border" />
              <div
                className="absolute top-5 left-0 h-1 bg-primary transition-all"
                style={{ width: `${(currentStepIndex / (statusSteps.length - 1)) * 100}%` }}
              />

              {/* Steps */}
              <div className="w-full flex justify-between relative z-10">
                {statusSteps.map((step, index) => (
                  <div key={step.status} className="flex flex-col items-center">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg mb-3 transition ${
                        index <= currentStepIndex
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {step.icon}
                    </div>
                    <span className="text-xs text-center text-foreground/70 max-w-20 leading-tight">
                      {step.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {order.status === 'shipped' && (
              <div className="p-4 bg-accent/10 border border-accent/30 rounded-lg">
                <p className="text-sm text-foreground">
                  <span className="font-bold">Nomor Resi Pengiriman:</span> PENDING
                </p>
                <p className="text-sm text-foreground/70 mt-1">
                  Estimasi tiba: 3-5 hari kerja
                </p>
              </div>
            )}
          </Card>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Shipping Address */}
            <Card className="p-8 border border-border">
              <h3 className="text-xl font-bold text-foreground mb-6">Alamat Pengiriman</h3>
              <div className="space-y-2 text-foreground/70">
                <p><span className="font-medium text-foreground">Nama:</span> {order.shippingAddress.name}</p>
                <p><span className="font-medium text-foreground">Telepon:</span> {order.shippingAddress.phone}</p>
                <p><span className="font-medium text-foreground">Email:</span> {order.shippingAddress.email}</p>
                <p><span className="font-medium text-foreground">Alamat:</span></p>
                <p className="ml-4">
                  {order.shippingAddress.street}<br />
                  {order.shippingAddress.city}, {order.shippingAddress.province} {order.shippingAddress.postalCode}
                </p>
              </div>
            </Card>

            {/* Order Summary */}
            <Card className="p-8 border border-border">
              <h3 className="text-xl font-bold text-foreground mb-6">Ringkasan Pesanan</h3>
              <div className="space-y-3 text-foreground/70">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>Rp{(order.total - 50000).toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Ongkir</span>
                  <span>Rp50.000</span>
                </div>
                <div className="border-t border-border pt-3 flex justify-between font-bold text-foreground">
                  <span>Total</span>
                  <span className="text-lg text-primary">Rp{order.total.toLocaleString('id-ID')}</span>
                </div>
                <div className="pt-3">
                  <p className="text-sm"><span className="font-medium text-foreground">Status Pembayaran:</span> Sudah dibayar</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Order Items */}
          <Card className="p-8 border border-border mb-12">
            <h3 className="text-xl font-bold text-foreground mb-6">Detail Produk</h3>
            <div className="space-y-6">
              {order.items.map((item, index) => (
                <div key={index} className="flex justify-between pb-6 border-b border-border last:border-0 last:pb-0">
                  <div>
                    <p className="font-medium text-foreground">{item.productName}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Metode: {item.selectedMethod} | Qty: {item.quantity} pcs
                    </p>
                    {item.customization?.notes && (
                      <p className="text-sm text-muted-foreground mt-2">
                        Catatan: {item.customization.notes}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-foreground">
                      Rp{(item.price * item.quantity).toLocaleString('id-ID')}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Rp{item.price.toLocaleString('id-ID')} x {item.quantity}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Actions */}
          <div className="flex gap-4">
            <Link href="/order-tracking" className="flex-1">
              <Button variant="outline" className="w-full">
                Lacak Pesanan Lain
              </Button>
            </Link>
            <Link href="/shop" className="flex-1">
              <Button className="w-full">
                Lanjutkan Belanja
              </Button>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
