import { NextRequest, NextResponse } from 'next/server'
import { searchDomesticDestination } from '@/lib/rajaongkir/server'

export async function GET(req: NextRequest) {
  const search = req.nextUrl.searchParams.get('search')?.trim() ?? ''
  if (search.length < 2) {
    return NextResponse.json({ error: 'Ketik minimal 2 karakter untuk mencari kota' }, { status: 400 })
  }

  try {
    const destinations = await searchDomesticDestination(search)
    return NextResponse.json({ destinations })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Gagal mengambil data tujuan'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
