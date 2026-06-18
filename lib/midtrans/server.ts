import { createHash } from 'crypto'

export interface MidtransConfig {
  serverKey: string
  clientKey: string
  isProduction: boolean
}

export function getMidtransConfig(): MidtransConfig | null {
  const serverKey = process.env.MIDTRANS_SERVER_KEY
  const clientKey = process.env.MIDTRANS_CLIENT_KEY

  if (!serverKey || !clientKey) {
    return null
  }

  return {
    serverKey,
    clientKey,
    isProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true',
  }
}

export function getSnapBaseUrl(isProduction: boolean): string {
  return isProduction
    ? 'https://app.midtrans.com/snap/v1/transactions'
    : 'https://app.sandbox.midtrans.com/snap/v1/transactions'
}

export function getSnapCdnUrl(isProduction: boolean): string {
  return isProduction
    ? 'https://app.midtrans.com/snap/snap.js'
    : 'https://app.sandbox.midtrans.com/snap/snap.js'
}

/**
 * Generate Snap transaction token via Midtrans Snap API v1
 */
export async function createSnapTransaction(params: {
  orderId: string
  grossAmount: number
  customerEmail?: string
  customerName?: string
  customerPhone?: string
  itemDetails?: Array<{
    id: string
    name: string
    price: number
    quantity: number
  }>
}): Promise<{ snapToken: string; redirectUrl: string; transactionId: string }> {
  const config = getMidtransConfig()
  if (!config) {
    throw new Error('Midtrans credentials not configured')
  }

  const baseUrl = getSnapBaseUrl(config.isProduction)

  const payload = {
    transaction_details: {
      order_id: params.orderId,
      gross_amount: Math.round(params.grossAmount),
    },
    credit_card: {
      secure: true,
    },
    customer_details: {
      email: params.customerEmail || '',
      first_name: params.customerName || '',
      phone: params.customerPhone || '',
    },
    item_details: params.itemDetails || [],
    callbacks: {
      finish: `${process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_API_URL || ''}/checkout/success`,
      error: `${process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_API_URL || ''}/checkout`,
    },
  }

  const response = await fetch(baseUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Basic ${Buffer.from(config.serverKey + ':').toString('base64')}`,
    },
    body: JSON.stringify(payload),
  })

  const data = await response.json()

  if (!response.ok || !data.token) {
    throw new Error(data.error_message || data.status_message || 'Failed to create Midtrans transaction')
  }

  return {
    snapToken: data.token,
    redirectUrl: data.redirect_url || '',
    transactionId: data.transaction_id || params.orderId,
  }
}

/**
 * Verify Midtrans notification signature.
 * Midtrans uses HMAC-SHA512 with server key as the secret.
 * The signature is computed from: order_id + status_code + gross_amount + server_key
 */
export function verifyMidtransNotification(notification: {
  order_id: string
  status_code: string
  gross_amount: string
  signature_key: string
}): boolean {
  const config = getMidtransConfig()
  if (!config) {
    return false
  }

  const raw = `${notification.order_id}${notification.status_code}${notification.gross_amount}${config.serverKey}`
  const expected = createHash('sha512').update(raw, 'utf8').digest('hex')

  return expected === notification.signature_key
}

/**
 * Map Midtrans transaction status to local payment status.
 * Reference: https://docs.midtrans.com/en/after-payment/http-notification?id=transaction-status
 */
export function mapMidtransStatus(params: {
  transactionStatus: string
  fraudStatus: string
}): 'pending' | 'paid' | 'failed' {
  const { transactionStatus, fraudStatus } = params

  // Settlement / Capture with accept = paid
  if (transactionStatus === 'settlement') {
    return 'paid'
  }

  if (transactionStatus === 'capture') {
    if (fraudStatus === 'accept') {
      return 'paid'
    }
    if (fraudStatus === 'challenge') {
      return 'pending'
    }
    return 'failed'
  }

  // Pending
  if (transactionStatus === 'pending') {
    return 'pending'
  }

  // Deny / Cancel / Expire / Refund = failed
  if (['deny', 'cancel', 'expire', 'refund', 'partial_refund'].includes(transactionStatus)) {
    return 'failed'
  }

  // Default fallback
  return 'failed'
}