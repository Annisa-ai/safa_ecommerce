'use client'

import { useState } from 'react'
import { AdminSidebar } from '@/components/admin/sidebar'
import { AdminProtectedLayout } from '@/components/admin/protected-layout'
import { useOrders } from '@/lib/contexts/order-context'
import { useNotifications, buildStatusNotif } from '@/lib/contexts/notification-context'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { exportToCSV } from '@/lib/utils/csv-export'

const statusOptions = [
  { value: 'pending', label: 'Tertunda' },
  { value: 'processing', label: 'Diproses' },
  { value: 'ready', label: 'Siap Dikirim' },
  { value: 'shipped', label: 'Dikirim' },
  { value: 'delivered', label: 'Tiba' }
]

export default function AdminOrdersPage() {
  const { orders, updateOrder } = useOrders()
  const { addNotification } = useNotifications()
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null)

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    processing: 'bg-blue-100 text-blue-800',
    ready: 'bg-purple-100 text-purple-800',
    shipped: 'bg-cyan-100 text-cyan-800',
    delivered: 'bg-green-100 text-green-800'
  }

  const handleStatusChange = (orderId: string, newStatus: string) => {
    updateOrder(orderId, { status: newStatus as any })
    // Fire customer notification for status change
    const order = orders.find(o => o.id === orderId)
    if (order) {
      addNotification(buildStatusNotif(order.userId, order.orderNumber, order.id, newStatus))
    }
    alert('Status pesanan berhasil diubah')
  }

  const handleExportCSV = () => {
    const rows = orders.map(o => [
      o.orderNumber,
      o.shippingAddress.name,
      o.shippingAddress.email,
      o.status,
      new Date(o.createdAt).toLocaleDateString('id-ID'),
      o.total.toString(),
    ])

    exportToCSV({
      filename: `laporan_pesanan_${new Date().toISOString().split('T')[0]}`,
      headers: ['No. Pesanan', 'Pelanggan', 'Email', 'Status', 'Tanggal', 'Total (Rp)'],
      rows,
    })
  }

  const selectedOrderData = orders.find(o => o.id === selectedOrder)

  return (
    <AdminProtectedLayout>
      <div className="flex h-screen overflow-hidden">
        <AdminSidebar />
        <div className="flex-1 bg-background overflow-y-auto">
          <div className="p-8">
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-foreground">Pesanan</h1>
              <p className="text-muted-foreground mt-2">Kelola dan lacak pesanan pelanggan</p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Orders List */}
              <div className="lg:col-span-2">
                <Card className="p-6 border border-border">
                  <div className="mb-6 pb-6 border-b border-border flex justify-between items-center">
                    <div>
                      <h2 className="text-xl font-bold text-foreground">Daftar Pesanan</h2>
                      <p className="text-xs text-muted-foreground mt-1">{orders.length} pesanan</p>
                    </div>
                    <Button onClick={handleExportCSV} variant="outline" size="sm" className="flex items-center gap-2">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Export
                    </Button>
                  </div>

                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {orders.length > 0 ? (
                      orders.map((order) => (
                        <button
                          key={order.id}
                          onClick={() => setSelectedOrder(order.id)}
                          className={`w-full p-4 rounded-lg border-2 transition text-left ${
                            selectedOrder === order.id
                              ? 'border-primary bg-primary/5'
                              : 'border-border hover:border-primary/50'
                          }`}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="font-bold text-foreground">{order.orderNumber}</p>
                              <p className="text-xs text-muted-foreground">
                                {order.shippingAddress.name}
                              </p>
                            </div>
                            <span className={`inline-block px-2 py-1 rounded text-xs font-bold ${statusColors[order.status]}`}>
                              {order.status}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">
                              {new Date(order.createdAt).toLocaleDateString('id-ID')}
                            </span>
                            <span className="font-bold text-primary">
                              Rp{order.total.toLocaleString('id-ID')}
                            </span>
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">Belum ada pesanan</p>
                      </div>
                    )}
                  </div>
                </Card>
              </div>

              {/* Order Details */}
              <div className="lg:col-span-1">
                {selectedOrderData ? (
                  <Card className="p-6 border border-border sticky top-8">
                    <h3 className="text-xl font-bold text-foreground mb-6">Detail Pesanan</h3>

                    <div className="space-y-4 mb-6 pb-6 border-b border-border">
                      <div>
                        <p className="text-xs text-muted-foreground">Nomor Pesanan</p>
                        <p className="font-bold text-foreground">{selectedOrderData.orderNumber}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Pelanggan</p>
                        <p className="font-bold text-foreground">{selectedOrderData.shippingAddress.name}</p>
                        <p className="text-sm text-muted-foreground">{selectedOrderData.shippingAddress.email}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Total</p>
                        <p className="text-xl font-bold text-primary">
                          Rp{selectedOrderData.total.toLocaleString('id-ID')}
                        </p>
                      </div>
                    </div>

                    <div className="mb-6">
                      <p className="text-sm font-medium text-foreground mb-3">Ubah Status</p>
                      <select
                        value={selectedOrderData.status}
                        onChange={(e) => handleStatusChange(selectedOrderData.id, e.target.value)}
                        className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground text-sm"
                      >
                        {statusOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-muted-foreground">Alamat</p>
                        <p className="text-sm text-foreground/70">
                          {selectedOrderData.shippingAddress.street}<br />
                          {selectedOrderData.shippingAddress.city}, {selectedOrderData.shippingAddress.province}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Telepon</p>
                        <p className="text-sm text-foreground/70">{selectedOrderData.shippingAddress.phone}</p>
                      </div>
                    </div>

                    <Button className="w-full mt-6" size="sm">
                      Cetak Label Pengiriman
                    </Button>
                  </Card>
                ) : (
                  <Card className="p-6 border border-border text-center">
                    <p className="text-muted-foreground">Pilih pesanan untuk melihat detail</p>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminProtectedLayout>
  )
}
