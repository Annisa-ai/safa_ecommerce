'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { loadMidtransSnapScript } from '@/lib/midtrans/client'

interface Props {
  snapToken: string
  amount: number
  disabled?: boolean
  loading?: boolean
  onSuccess?: () => void
  // Dipanggil saat Midtrans mengembalikan status "pending" (mis. VA/QRIS/e-wallet
  // yang menunggu user menyelesaikan pembayaran di luar popup).
  // INI BUKAN "pembayaran berhasil" — jangan dipakai untuk update status order jadi paid.
  onPending?: () => void
  onError?: (error: string) => void
  onClose?: () => void
}

export default function MidtransPaymentButton({
  snapToken,
  amount,
  disabled = false,
  loading: externalLoading = false,
  onSuccess,
  onPending,
  onError,
  onClose,
}: Props) {
  const [snapReady, setSnapReady] = useState(false)
  const [snapLoading, setSnapLoading] = useState(false)
  const [snapError, setSnapError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    const init = async () => {
      try {
        const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY
        const isProd = process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === 'true'

        if (!clientKey) {
          setSnapReady(true)
          return
        }

        await loadMidtransSnapScript(clientKey, isProd)

        if (mounted) setSnapReady(true)
      } catch {
        if (mounted) setSnapError('Gagal load pembayaran')
      }
    }

    if (typeof window !== 'undefined' && (window as any).snap?.pay) {
      setSnapReady(true)
    } else {
      init()
    }

    return () => {
      mounted = false
    }
  }, [])

  const handlePay = useCallback(() => {
    if (!snapToken) {
      onError?.('Token tidak tersedia')
      return
    }

    if (typeof window === 'undefined' || !(window as any).snap?.pay) {
      setSnapError('Snap belum siap')
      return
    }

    setSnapLoading(true)
    setSnapError(null)

    window.snap.pay(snapToken, {
      // Status transaksi capture/settlement langsung (mis. kartu kredit tanpa 3DS
      // tambahan). Status final TETAP harus dikonfirmasi oleh webhook backend,
      // tapi UI boleh memberi feedback awal di sini.
      onSuccess: () => {
        setSnapLoading(false)
        onSuccess?.()
      },
      // Status transaksi masih "pending" di sisi Midtrans (VA/QRIS/e-wallet yang
      // menunggu pembayaran diselesaikan user). BUKAN pembayaran berhasil.
      onPending: () => {
        setSnapLoading(false)
        onPending?.()
      },
      onError: (result: any) => {
        setSnapLoading(false)
        setSnapError(result?.status_message || 'Pembayaran gagal')
        onError?.(result?.status_message || 'Pembayaran gagal')
      },
      onClose: () => {
        setSnapLoading(false)
        onClose?.()
      },
    })
  }, [snapToken, onSuccess, onPending, onError, onClose])

  const isLoading = externalLoading || snapLoading
  const isDisabled = disabled || isLoading || !snapToken

  return (
    <div className="space-y-3">
      <Button onClick={handlePay} disabled={isDisabled} className="w-full">
        {snapLoading
          ? 'Membuka pembayaran...'
          : `Bayar Rp${amount.toLocaleString('id-ID')}`}
      </Button>

      {snapError && (
        <p className="text-sm text-red-500">{snapError}</p>
      )}

      {!snapReady && !snapError && (
        <p className="text-xs text-gray-500 text-center">
          Memuat pembayaran...
        </p>
      )}
    </div>
  )
}