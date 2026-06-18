'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { loadMidtransSnapScript, openMidtransSnap, type SnapCallbacks } from '@/lib/midtrans/client'

interface MidtransPaymentButtonProps {
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
}: MidtransPaymentButtonProps) {
  const [snapReady, setSnapReady] = useState(false)
  const [snapLoading, setSnapLoading] = useState(false)
  const [snapError, setSnapError] = useState<string | null>(null)

  // Load Snap JS on mount
  useEffect(() => {
    let mounted = true

    async function initSnap() {
      try {
        // We can't call getMidtransConfig directly from client since it reads process.env
        // Instead, we'll attempt to load dynamically — the client key is embedded in script URL
        // For dynamic loading, we need the client key from props or a different approach
        // Since Snap JS requires the client key in the script URL, we need it here
        // We'll use a publicly exposed env var or pass via props
        const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY
        const isProduction = process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === 'true'

        if (!clientKey) {
          console.warn('MIDTRANS_CLIENT_KEY not available, Snap will use fallback approach')
          setSnapReady(true) // Assume Snap might already be loaded via layout
          return
        }

        await loadMidtransSnapScript(clientKey, isProduction)
        if (mounted) {
          setSnapReady(true)
        }
      } catch (err: any) {
        console.error('Failed to load Midtrans Snap:', err)
        if (mounted) {
          setSnapError('Gagal memuat pembayaran. Silakan refresh halaman.')
        }
      }
    }

    // Check if already loaded
    if (typeof window !== 'undefined' && (window as any).snap) {
      setSnapReady(true)
    } else {
      initSnap()
    }

    return () => {
      mounted = false
    }
  }, [])

  const handlePay = useCallback(() => {
    if (!snapToken) {
      onError?.('Token pembayaran tidak tersedia')
      return
    }

    setSnapLoading(true)
    setSnapError(null)

    try {
      openMidtransSnap(snapToken, {
        onSuccess: (result) => {
          setSnapLoading(false)
          onSuccess?.()
        },
        onPending: (result) => {
          setSnapLoading(false)
          // Payment is pending (e.g., bank transfer waiting for confirmation)
          // We can show a pending state — redirect to success page
          onSuccess?.()
        },
        onError: (result) => {
          setSnapLoading(false)
          const msg = result?.status_message || 'Pembayaran gagal'
          setSnapError(msg)
          onError?.(msg)
        },
        onClose: () => {
          setSnapLoading(false)
          onClose?.()
        },
      })
    } catch (err: any) {
      setSnapLoading(false)
      setSnapError(err.message || 'Gagal membuka pembayaran')
      onError?.(err.message || 'Gagal membuka pembayaran')
    }
  }, [snapToken, onSuccess, onError, onClose])

  const isLoading = externalLoading || snapLoading
  const isDisabled = disabled || isLoading || !snapToken

  return (
    <div className="space-y-3">
      <Button
        onClick={handlePay}
        disabled={isDisabled}
        className="w-full"
        size="lg"
      >
        {snapLoading ? (
          <>
            <span className="animate-spin mr-2">⟳</span>
            Membuka Pembayaran...
          </>
        ) : isLoading ? (
          'Memproses...'
        ) : !snapReady ? (
          'Memuat Pembayaran...'
        ) : (
          `Bayar Rp${amount.toLocaleString('id-ID')}`
        )}
      </Button>

      {snapError && (
        <p className="text-sm text-destructive">{snapError}</p>
      )}

      {!snapReady && !snapError && (
        <p className="text-xs text-muted-foreground text-center">
          Memuat metode pembayaran...
        </p>
      )}
    </div>
  )
}