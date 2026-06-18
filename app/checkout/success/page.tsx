'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

function SuccessContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [countdown, setCountdown] = useState(5)

  const orderId = searchParams.get('order_id') || ''

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const handleRedirect = () => {
    router.push('/pesanan-saya')
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="max-w-lg mx-auto px-4 py-12">
          <Card className="p-8 text-center border-border">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <h1 className="text-2xl font-bold text-foreground mb-3">
              Pesanan Berhasil Dibuat!
            </h1>

            <p className="text-muted-foreground mb-6">
              Terima kasih, pesanan Anda telah berhasil dibuat.
              {orderId && (
                <>
                  <br />
                  Nomor Pesanan: <span className="font-semibold text-foreground">{orderId}</span>
                </>
              )}
            </p>

            <div className="bg-muted/30 rounded-lg p-4 mb-6">
              <p className="text-sm text-muted-foreground">
                Status pembayaran akan diperbarui secara otomatis.
                Silakan cek halaman <strong>Pesanan Saya</strong> untuk melihat status terbaru.
              </p>
            </div>

            <div className="space-y-3">
              <Button onClick={handleRedirect} className="w-full">
                Lihat Pesanan Saya
              </Button>
              <Link href="/shop" className="block">
                <Button variant="outline" className="w-full">
                  Lanjut Belanja
                </Button>
              </Link>
            </div>

            <p className="text-xs text-muted-foreground mt-6">
              Dialihkan ke halaman pesanan dalam {countdown} detik...
            </p>
          </Card>
        </div>
      </main>
      <Footer />
    </>
  )
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SuccessContent />
    </Suspense>
  )
}