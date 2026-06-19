import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  getMidtransConfig,
  verifyMidtransNotification,
  mapMidtransStatus,
} from '@/lib/midtrans/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Midtrans HTTP Notification (Webhook) Handler
 *
 * Midtrans sends POST notifications to this endpoint when payment status changes.
 * We verify the signature, map the status, and update the order in Supabase.
 *
 * Reference: https://docs.midtrans.com/en/after-payment/http-notification
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const {
      order_id: orderId,
      transaction_id: transactionId,
      transaction_status: transactionStatus,
      fraud_status: fraudStatus,
      status_code: statusCode,
      gross_amount: grossAmount,
      signature_key: signatureKey,
      payment_type: paymentType,
      transaction_time: transactionTime,
      settlement_time: settlementTime,
      status_message: statusMessage,
    } = body

    // Log incoming notification for debugging
    console.log('Midtrans notification received:', {
      orderId,
      transactionId,
      transactionStatus,
      fraudStatus,
    })

    // Verify configuration
    const config = getMidtransConfig()
    if (!config) {
      console.error('Midtrans config not found')
      return NextResponse.json({ error: 'Config not found' }, { status: 500 })
    }

    // Verify signature
    const isValid = verifyMidtransNotification({
      order_id: orderId,
      status_code: statusCode,
      gross_amount: grossAmount,
      signature_key: signatureKey,
    })

    if (!isValid) {
      console.error('Invalid Midtrans notification signature for order:', orderId)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 403 })
    }

    // Map status
    const paymentStatus = mapMidtransStatus({
      transactionStatus,
      fraudStatus: fraudStatus || '',
    })

    console.log(`Mapping status: transaction=${transactionStatus}, fraud=${fraudStatus} → payment_status=${paymentStatus}`)

    // Only update if status changed (avoid redundant updates)
    const supabase = await createClient()

    // Fetch current order to check existing status
    const { data: existingOrder } = await supabase
      .from('orders')
      .select('payment_status, payment_provider, payment_reference')
      .eq('order_number', orderId)
      .maybeSingle()

    if (!existingOrder) {
      console.warn(`Order ${orderId} not found in database, skipping update`)
      return NextResponse.json({ status: 'order_not_found' }, { status: 200 })
    }

    // Only process if this is a Midtrans payment
    if (existingOrder.payment_provider && existingOrder.payment_provider !== 'midtrans') {
      console.warn(`Order ${orderId} has payment_provider=${existingOrder.payment_provider}, skipping Midtrans update`)
      return NextResponse.json({ status: 'wrong_provider' }, { status: 200 })
    }

    // Skip if already paid and this is not a new state
    if (existingOrder.payment_status === 'paid' && paymentStatus === 'paid') {
      console.log(`Order ${orderId} already paid, skipping duplicate update`)
      return NextResponse.json({ status: 'already_paid' }, { status: 200 })
    }

    // Build update data
   const updateData: any = {
    payment_status: paymentStatus,
    payment_reference: transactionId || existingOrder.payment_reference,
    payment_details: {
      transaction_id: transactionId,
      transaction_status: transactionStatus,
      fraud_status: fraudStatus,
      payment_type: paymentType,
      transaction_time: transactionTime,
      settlement_time: settlementTime,
      status_message: statusMessage,
      raw_notification: body,
    },
  }
  // 🔥 AUTO UPDATE ORDER STATUS
if (paymentStatus === 'paid') {
  updateData.status = 'processing'
  updateData.payment_paid_at = settlementTime
    ? new Date(settlementTime).toISOString()
    : new Date().toISOString()
}

    // If payment is successful, set paid_at timestamp
    if (paymentStatus === 'paid') {
      updateData.payment_paid_at = settlementTime
        ? new Date(settlementTime).toISOString()
        : new Date().toISOString()
    }

    // Update the order
    const { error: updateError } = await supabase
      .from('orders')
      .update(updateData)
      .eq('order_number', orderId)

    if (updateError) {
      console.error('Failed to update order:', updateError)
      return NextResponse.json({ error: 'Database update failed' }, { status: 500 })
    }

    // Also insert/update payment_transactions for audit trail
    try {
      const { data: orderRow } = await supabase
        .from('orders')
        .select('id')
        .eq('order_number', orderId)
        .maybeSingle()

      if (orderRow) {
        await supabase.from('payment_transactions').upsert(
          {
            order_id: orderRow.id,
            transaction_reference: transactionId || orderId,
            amount: parseFloat(grossAmount) || 0,
            currency: 'IDR',
            payment_method: paymentType || null,
            payment_provider: 'midtrans',
            payment_channel: paymentType || null,
            status: paymentStatus === 'paid' ? 'settlement' : transactionStatus || 'pending',
            payment_details: updateData.payment_details,
          },
          {
            onConflict: 'transaction_reference',
            ignoreDuplicates: false,
          }
        )
      }
    } catch (txError) {
      console.error('Failed to upsert payment_transactions:', txError)
      // Non-critical, don't fail the whole request
    }

    console.log(`Order ${orderId} updated: payment_status=${paymentStatus}`)
    return NextResponse.json({ status: 'ok' }, { status: 200 })
  } catch (error: any) {
    console.error('Midtrans callback error:', error)
    // Always return 200 to prevent Midtrans from retrying excessively
    return NextResponse.json({ error: 'Internal error' }, { status: 200 })
  }
}

/**
 * Health check / GET — simply returns OK
 */
export async function GET() {
  return NextResponse.json({ status: 'ok', message: 'Midtrans callback endpoint ready' })
}