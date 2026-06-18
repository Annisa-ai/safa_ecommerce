'use client'

/**
 * Load Midtrans Snap JS script dynamically.
 * Returns a promise that resolves when the script is loaded.
 */
export function loadMidtransSnapScript(clientKey: string, isProduction: boolean): Promise<void> {
  return new Promise((resolve, reject) => {
    // Check if already loaded
    if (typeof window !== 'undefined' && (window as any).snap) {
      resolve()
      return
    }

    const baseUrl = isProduction
      ? 'https://app.midtrans.com/snap/snap.js'
      : 'https://app.sandbox.midtrans.com/snap/snap.js'

    const script = document.createElement('script')
    script.src = `${baseUrl}?data-client-key=${encodeURIComponent(clientKey)}`
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Failed to load Midtrans Snap script'))
    document.head.appendChild(script)
  })
}

export interface SnapCallbacks {
  onSuccess?: (result: any) => void
  onPending?: (result: any) => void
  onError?: (result: any) => void
  onClose?: () => void
}

/**
 * Open Midtrans Snap payment popup.
 * Requires snap.js to be loaded first (call loadMidtransSnapScript first).
 */
export function openMidtransSnap(snapToken: string, callbacks?: SnapCallbacks): void {
  const snap = (window as any).snap

  if (!snap) {
    throw new Error('Midtrans Snap not loaded. Call loadMidtransSnapScript first.')
  }

  snap.pay(snapToken, {
    onSuccess: (result: any) => {
      callbacks?.onSuccess?.(result)
    },
    onPending: (result: any) => {
      callbacks?.onPending?.(result)
    },
    onError: (result: any) => {
      callbacks?.onError?.(result)
    },
    onClose: () => {
      callbacks?.onClose?.()
    },
  })
}