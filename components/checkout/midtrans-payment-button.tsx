
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
  onError?: (error: string) => void
  onClose?: () => void
}

export default function MidtransPaymentButton({
  snapToken,
  amount,
  disabled = false,
  loading: externalLoading = false,
  onSuccess,
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
      onSuccess: () => {
        setSnapLoading(false)
        onSuccess?.()
      },
      onPending: () => {
        setSnapLoading(false)
        onSuccess?.()
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
  }, [snapToken, onSuccess, onError, onClose])

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

