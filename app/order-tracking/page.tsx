'use client'

import Link from 'next/link'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { useOrders } from '@/lib/contexts/order-context'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useState } from 'react'

export default function OrderTrackingPage() {
  const { orders } = useOrders()
  const [searchId, setSearchId] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchId.trim()) {
      const results = orders.filter(order =>
        order.orderNumber.includes(searchId) || order.id.includes(searchId)
      )
      setSearchResults(results)
    } else {
      setSearchResults([])
    }
  }

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
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-4">Lacak Pesanan</h1>
            <p className="text-lg text-muted-foreground">
              Masukkan nomor pesanan untuk melacak status pengiriman Anda
            </p>
          </div>

          {/* Search Form */}
          <Card className="p-8 border border-border mb-12">
            <form onSubmit={handleSearch} className="flex gap-3">
              <Input
                type="text"
                placeholder="Masukkan nomor pesanan (contoh: ORD-1234567890)"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                className="flex-1"
              />
              <Button type="submit">Cari</Button>
            </form>
          </Card>

          {/* Search Results */}
          {searchResults.length > 0 ? (
            <div className="space-y-6">
              {searchResults.map((order) => (
                <Link key={order.id} href={`/order-tracking/${order.id}`}>
                  <Card className="p-6 border border-border hover:shadow-lg transition cursor-pointer">
                    <div className="grid md:grid-cols-4 gap-6">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Nomor Pesanan</p>
                        <p className="font-bold text-foreground">{order.orderNumber}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Total</p>
                        <p className="font-bold text-primary">
                          Rp{order.total.toLocaleString('id-ID')}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Status</p>
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${statusColors[order.status] || 'bg-gray-100 text-gray-800'}`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground mb-1">Tanggal Pesanan</p>
                        <p className="font-medium text-foreground">
                          {new Date(order.createdAt).toLocaleDateString('id-ID')}
                        </p>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          ) : searchId ? (
            <div className="text-center py-12">
              <p className="text-lg text-muted-foreground mb-6">
                Pesanan tidak ditemukan. Pastikan nomor pesanan sudah benar.
              </p>
              <Link href="/shop">
                <Button>Lanjutkan Belanja</Button>
              </Link>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-lg text-muted-foreground">
                Masukkan nomor pesanan untuk mulai melacak
              </p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
