import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  getMidtransConfig,
  createSnapTransaction,
} from '@/lib/midtrans/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      orderId,
      orderNumber,
      finalPrice,
      customerEmail,
      customerName,
      customerPhone,
      // Additional order data for INSERT
      userId,
      items,
      subtotal,
      shippingCost,
      shippingAddress,
    } = body

    const effectiveOrderNumber = orderNumber || orderId

    if (!effectiveOrderNumber || !finalPrice) {
      return NextResponse.json({ error: 'Data order tidak lengkap' }, { status: 400 })
    }

    const config = getMidtransConfig()
    if (!config) {
      return NextResponse.json({ error: 'Kredensial .env Midtrans belum lengkap' }, { status: 500 })
    }

    const grossAmount = Math.round(Number(finalPrice))
    const supabase = await createClient()

    // ===== STEP 1: INSERT order ke database =====
    // Order harus ada di database SEBELUM kita create Snap transaction,
    // agar webhook Midtrans bisa menemukan order ini nantinya.
    const orderInsertPayload: any = {
      order_number: effectiveOrderNumber,
      user_id: userId || null,
      total_price: subtotal || grossAmount,
      shipping_cost: shippingCost || 0,
      final_price: grossAmount,
      status: 'pending',
      payment_status: 'pending',
      payment_method: 'midtrans',
      shipping_address: shippingAddress || null,
      customer_name: customerName || null,
      customer_phone: customerPhone || null,
      customer_email: customerEmail || null,
    }

    const { data: createdOrder, error: insertError } = await supabase
      .from('orders')
      .insert(orderInsertPayload)
      .select('id')
      .single()

    if (insertError || !createdOrder) {
      console.error('Gagal insert order:', insertError)
      return NextResponse.json({ error: 'Gagal membuat order', details: insertError }, { status: 500 })
    }

    // Insert order_items jika ada
    if (items && Array.isArray(items) && items.length > 0) {
      const orderItemRows = items.map((item: any) => ({
        order_id: createdOrder.id,
        product_id: Number(item.productId) || null,
        product_name: item.productName || null,
        quantity: item.quantity || 1,
        unit_price: item.price || 0,
        selected_method: item.selectedMethod || null,
        design_url: item.customization?.designUrl || null,
        customization: item.customization || null,
      }))

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItemRows)

      if (itemsError) {
        console.error('Gagal insert order_items:', itemsError)
        // Non-critical, order tetap terbuat
      }
    }

    // ===== STEP 2: Create Snap transaction via Midtrans API =====
    const snapResult = await createSnapTransaction({
      orderId: String(effectiveOrderNumber),
      grossAmount,
      customerEmail: customerEmail || 'customer@safasablon.com',
      customerName: customerName || '',
      customerPhone: customerPhone || '',
    })

    // ===== STEP 3: Update payment info di database =====
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        payment_provider: 'midtrans',
        payment_reference: snapResult.transactionId || null,
        payment_status: 'pending',
      })
      .eq('order_number', effectiveOrderNumber)

    if (updateError) {
      console.error('Gagal update payment info:', updateError)
    }

    return NextResponse.json({
      snapToken: snapResult.snapToken,
      redirectUrl: snapResult.redirectUrl,
      transactionId: snapResult.transactionId,
    })
  } catch (error: any) {
    console.error('Midtrans create transaction error:', error)
    return NextResponse.json(
      { error: 'Gagal membuat transaksi Midtrans', message: error.message },
      { status: 500 }
    )
  }
}
