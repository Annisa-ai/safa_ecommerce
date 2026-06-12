import type { RajaOngkirDestination } from '@/lib/shipping/types'

export interface AddressShippingHint {
  city: string
  province: string
  district?: string
  postalCode?: string
}

function normalize(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, ' ')
}

function scoreDestination(destination: RajaOngkirDestination, hint: AddressShippingHint) {
  const city = normalize(hint.city)
  const province = normalize(hint.province)
  const district = hint.district ? normalize(hint.district) : ''
  const destCity = normalize(destination.cityName)
  const destProvince = normalize(destination.provinceName)
  const destDistrict = destination.districtName ? normalize(destination.districtName) : ''
  const destLabel = normalize(destination.label)

  let score = 0
  if (destCity && (destCity.includes(city) || city.includes(destCity))) score += 4
  if (destProvince && (destProvince.includes(province) || province.includes(destProvince))) score += 3
  if (district && destDistrict && (destDistrict.includes(district) || district.includes(destDistrict))) score += 2
  if (hint.postalCode && destination.zipCode === hint.postalCode) score += 2
  if (destLabel.includes(city)) score += 1
  if (destLabel.includes(province)) score += 1

  return score
}

function pickBestMatch(destinations: RajaOngkirDestination[], hint: AddressShippingHint) {
  if (destinations.length === 0) return null

  const ranked = [...destinations].sort((a, b) => scoreDestination(b, hint) - scoreDestination(a, hint))
  const best = ranked[0]
  return scoreDestination(best, hint) > 0 ? best : ranked[0]
}

async function searchDestinations(search: string) {
  const res = await fetch(`/api/shipping/destination?search=${encodeURIComponent(search)}`)
  const data = await res.json()
  if (!res.ok) throw new Error(data.error ?? 'Gagal mencari kota')
  return (data.destinations ?? []) as RajaOngkirDestination[]
}

export async function resolveDestinationFromAddress(
  hint: AddressShippingHint
): Promise<RajaOngkirDestination | null> {
  const queries = [
    [hint.district, hint.city, hint.province].filter(Boolean).join(', '),
    [hint.city, hint.province].filter(Boolean).join(', '),
    hint.city,
  ].filter(q => q.trim().length >= 2)

  let lastError: Error | null = null

  for (const search of queries) {
    try {
      const destinations = await searchDestinations(search)
      const match = pickBestMatch(destinations, hint)
      if (match) return match
    } catch (err) {
      lastError = err instanceof Error ? err : new Error('Gagal mencari kota')
    }
  }

  if (lastError) throw lastError
  return null
}
