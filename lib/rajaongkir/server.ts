import type { RajaOngkirDestination, RajaOngkirShippingOption } from '@/lib/shipping/types'

const BASE_URL = 'https://rajaongkir.komerce.id/api/v1'
const DEFAULT_COURIERS = 'jne:pos:tiki:sicepat:jnt:anteraja:ninja'

export function getRajaOngkirApiKey() {
  return process.env.RAJAONGKIR_API_KEY?.trim() ?? ''
}

export function getDefaultOriginCityId() {
  return process.env.RAJAONGKIR_ORIGIN_CITY_ID?.trim() ?? ''
}

function ensureApiKey() {
  const key = getRajaOngkirApiKey()
  if (!key) {
    throw new Error('RAJAONGKIR_API_KEY belum dikonfigurasi di .env.local')
  }
  return key
}

async function rajaOngkirRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const key = ensureApiKey()
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      key,
      Accept: 'application/json',
      ...(init?.headers ?? {}),
    },
    cache: 'no-store',
  })

  const json = await res.json().catch(() => null)
  if (!res.ok) {
    const message = json?.meta?.message ?? json?.message ?? `Raja Ongkir HTTP ${res.status}`
    throw new Error(message)
  }

  const code = json?.meta?.code
  if (code != null && code !== 200) {
    throw new Error(json?.meta?.message ?? 'Raja Ongkir API error')
  }

  return json as T
}

function mapDestination(raw: Record<string, unknown>): RajaOngkirDestination | null {
  const id = String(raw.id ?? raw.city_id ?? raw.destination_id ?? '')
  if (!id) return null

  const cityName = String(raw.city_name ?? raw.label ?? raw.name ?? '')
  const provinceName = String(raw.province ?? raw.province_name ?? '')
  const districtName = raw.district_name ? String(raw.district_name) : undefined
  const zipCode = raw.zip_code ? String(raw.zip_code) : undefined

  const labelParts = [districtName, cityName, provinceName].filter(Boolean)
  const label = labelParts.join(', ') || cityName || id

  return { id, label, provinceName, cityName, districtName, zipCode }
}

function flattenDestinations(payload: unknown): RajaOngkirDestination[] {
  if (!payload) return []

  const rows = Array.isArray(payload)
    ? payload
    : Array.isArray((payload as { data?: unknown[] }).data)
      ? (payload as { data: unknown[] }).data
      : []

  return rows
    .map(row => mapDestination(row as Record<string, unknown>))
    .filter((row): row is RajaOngkirDestination => row != null)
}

function mapShippingOption(raw: Record<string, unknown>): RajaOngkirShippingOption | null {
  const courier = String(raw.code ?? raw.courier ?? '').toLowerCase()
  const service = String(raw.service ?? raw.service_code ?? '')
  const description = String(raw.description ?? raw.service_name ?? service)
  const costValue = raw.cost ?? raw.price ?? raw.value
  const cost = typeof costValue === 'number'
    ? costValue
    : typeof costValue === 'object' && costValue != null && 'value' in (costValue as object)
      ? Number((costValue as { value: number }).value)
      : Number(costValue)

  if (!courier || !service || Number.isNaN(cost)) return null

  return {
    courier,
    courierName: String(raw.name ?? raw.courier_name ?? courier.toUpperCase()),
    service,
    description,
    cost,
    etd: String(raw.etd ?? '-'),
  }
}

function flattenShippingOptions(payload: unknown): RajaOngkirShippingOption[] {
  if (!payload) return []

  const options: RajaOngkirShippingOption[] = []

  const pushOption = (courierBlock: Record<string, unknown>) => {
    const courier = String(courierBlock.code ?? courierBlock.courier ?? '').toLowerCase()
    const courierName = String(courierBlock.name ?? courierBlock.courier_name ?? courier.toUpperCase())
    const costs = courierBlock.costs ?? courierBlock.services ?? courierBlock.data

    if (Array.isArray(costs)) {
      costs.forEach(costRow => {
        const mapped = mapShippingOption({
          ...(costRow as Record<string, unknown>),
          code: courier,
          name: courierName,
        })
        if (mapped) options.push(mapped)
      })
      return
    }

    const mapped = mapShippingOption(courierBlock)
    if (mapped) options.push(mapped)
  }

  if (Array.isArray(payload)) {
    payload.forEach(row => pushOption(row as Record<string, unknown>))
    return options.sort((a, b) => a.cost - b.cost)
  }

  const data = (payload as { data?: unknown }).data ?? payload
  if (Array.isArray(data)) {
    data.forEach(row => pushOption(row as Record<string, unknown>))
    return options.sort((a, b) => a.cost - b.cost)
  }

  const mapped = mapShippingOption(data as Record<string, unknown>)
  if (mapped) options.push(mapped)
  return options.sort((a, b) => a.cost - b.cost)
}

export async function searchDomesticDestination(search: string, limit = 20) {
  const query = encodeURIComponent(search.trim())
  const json = await rajaOngkirRequest<{ data?: unknown }>(
    `/destination/domestic-destination?search=${query}&limit=${limit}&offset=0`
  )
  return flattenDestinations(json.data ?? json)
}

export async function calculateDomesticCost(params: {
  origin: string
  destination: string
  weight: number
  courier?: string
}) {
  const body = new URLSearchParams({
    origin: params.origin,
    destination: params.destination,
    weight: String(Math.max(1, Math.round(params.weight))),
    courier: params.courier ?? DEFAULT_COURIERS,
    price: 'lowest',
  })

  const json = await rajaOngkirRequest<{ data?: unknown }>('/calculate/domestic-cost', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  })

  return flattenShippingOptions(json.data ?? json)
}

