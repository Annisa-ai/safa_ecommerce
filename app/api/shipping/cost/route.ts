import { NextRequest, NextResponse } from 'next/server'
import { calculateDomesticCost, getDefaultOriginCityId } from '@/lib/rajaongkir/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const destination = String(body.destination ?? '').trim()
    const origin = String(body.origin ?? getDefaultOriginCityId()).trim()
    const weight = Number(body.weight)

    if (!origin) {
      return NextResponse.json(
        { error: 'Kota asal belum dikonfigurasi. Atur di Pengaturan Admin atau RAJAONGKIR_ORIGIN_CITY_ID.' },
        { status: 400 }
      )
    }
    if (!destination) {
      return NextResponse.json({ error: 'Kota tujuan wajib dipilih' }, { status: 400 })
    }
    if (!weight || weight < 1) {
      return NextResponse.json({ error: 'Berat paket tidak valid' }, { status: 400 })
    }

    const options = await calculateDomesticCost({ origin, destination, weight })
    return NextResponse.json({ options, origin, destination, weight })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Gagal menghitung ongkir'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
