import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  getDuitkuConfig,
  generateDuitkuRequestSignature,
} from '@/lib/duitku/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    const { orderId, finalPrice, customerEmail } = body
    const orderNumber = body.orderNumber || orderId

    if (!orderNumber || !finalPrice) {
      return NextResponse.json({ error: 'Data order tidak lengkap' }, { status: 400 })
    }

    const config = getDuitkuConfig()
    if (!config) {
      return NextResponse.json({ error: 'Kredensial .env Duitku belum lengkap di Vercel' }, { status: 500 })
    }

    const paymentAmount = Math.round(Number(finalPrice))

    // Pembuatan signature SHA256 resmi untuk Duitku
    const signature = generateDuitkuRequestSignature({
      merchantCode: config.merchantCode,
      merchantOrderId: String(orderNumber),
      paymentAmount: paymentAmount,
      apiKey: config.apiKey,
    })

    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://www.safablon.my.id'
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || baseUrl

    const duitkuPayload = {
      merchantCode: config.merchantCode,
      paymentAmount: paymentAmount,
      merchantOrderId: String(orderNumber),
      productDetails: `Pembayaran Order #${orderNumber} - Safa Sablon`,
      email: customerEmail || 'customer@safasablon.com',
      paymentMethod: '', 
      expiryPeriod: 1440,
      callbackUrl: `${baseUrl}/api/duitku/callback`,
      returnUrl: `${siteUrl}/checkout/success`,
      signature: signature
    }

    // Tembak langsung ke endpoint resmi Duitku Sandbox Passport V2
    const duitkuResponse = await fetch('https://sandbox.duitku.com/passport/v2/merchant/invoice', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(duitkuPayload),
    })

    const duitkuData = await duitkuResponse.json()

    // JIKA DUITKU MENOLAK (Misal karena ID Duplikat / Merchant Code Salah)
    if (!duitkuData || !duitkuData.paymentUrl) {
      return NextResponse.json({ 
        error: 'Duitku menolak membuat invoice', 
        details: duitkuData 
      }, { status: 400 })
    }

    // Update status awal ke Supabase secara asinkronus
    try {
      const supabase = await createClient()
      await supabase
        .from('orders')
        .update({
          payment_provider: 'duitku',
          payment_reference: duitkuData.reference || null,
          payment_status: 'pending'
        })
        .eq('order_number', orderNumber)
    } catch (dbError) {
      console.error('Gagal update Supabase:', dbError)
    }

    // Mengembalikan data JSON murni berisi tautan pembayaran resmi Duitku
    return NextResponse.json({ redirectUrl: duitkuData.paymentUrl })

  } catch (error: any) {
    // Pastikan jika ada crash tetap merespons dengan format JSON yang valid
    return NextResponse.json({ error: 'Internal Server Error', message: error.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  return new Response('OK', { status: 200 })
}

export async function GET() {
  return NextResponse.json({ success: false }, { status: 405 })
}