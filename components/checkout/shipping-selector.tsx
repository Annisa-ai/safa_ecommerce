'use client'

import { useEffect, useState } from 'react'
import type { RajaOngkirDestination, RajaOngkirShippingOption, ShippingSelection } from '@/lib/shipping/types'
import { type AddressShippingHint, resolveDestinationFromAddress } from '@/lib/shipping/resolve-destination'
import { DestinationSearch } from '@/components/checkout/destination-search'

interface ShippingSelectorProps {
  originCityId?: string
  weightGrams: number
  addressHint: AddressShippingHint | null
  value: ShippingSelection | null
  onChange: (selection: ShippingSelection | null) => void
}

export function ShippingSelector({
  originCityId,
  weightGrams,
  addressHint,
  value,
  onChange,
}: ShippingSelectorProps) {
  const [destination, setDestination] = useState<RajaOngkirDestination | null>(
    value
      ? { id: value.destinationCityId, label: value.destinationLabel, provinceName: '', cityName: value.destinationLabel }
      : null
  )
  const [options, setOptions] = useState<RajaOngkirShippingOption[]>([])
  const [resolving, setResolving] = useState(false)
  const [loadingRates, setLoadingRates] = useState(false)
  const [error, setError] = useState('')
  const [showManualSearch, setShowManualSearch] = useState(false)

  const addressKey = addressHint
    ? `${addressHint.city}|${addressHint.province}|${addressHint.district ?? ''}|${addressHint.postalCode ?? ''}`
    : ''

  // Auto-resolve kota tujuan dari alamat yang dipilih
  useEffect(() => {
    if (!addressHint?.city?.trim() || !addressHint?.province?.trim()) {
      setDestination(null)
      setOptions([])
      setError('')
      setShowManualSearch(false)
      onChange(null)
      return
    }

    let cancelled = false

    async function resolve() {
      setResolving(true)
      setError('')
      setShowManualSearch(false)
      onChange(null)
      setOptions([])

      try {
        const match = await resolveDestinationFromAddress(addressHint!)
        if (cancelled) return
        if (!match) {
          setDestination(null)
          setError('Kota tujuan tidak ditemukan otomatis. Coba pilih manual di bawah.')
          setShowManualSearch(true)
          return
        }
        setDestination(match)
      } catch (err) {
        if (cancelled) return
        setDestination(null)
        setError(err instanceof Error ? err.message : 'Gagal mendeteksi kota tujuan')
        setShowManualSearch(true)
      } finally {
        if (!cancelled) setResolving(false)
      }
    }

    resolve()
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addressKey])

  // Hitung tarif kurir setelah kota tujuan terdeteksi
  useEffect(() => {
    if (!destination?.id || !originCityId) {
      setOptions([])
      if (!resolving) onChange(null)
      return
    }

    let cancelled = false

    async function fetchCost() {
      setLoadingRates(true)
      setError('')
      try {
        const res = await fetch('/api/shipping/cost', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            origin: originCityId,
            destination: destination!.id,
            weight: weightGrams,
          }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error ?? 'Gagal menghitung ongkir')
        if (cancelled) return
        setOptions(data.options ?? [])
        if ((data.options ?? []).length === 0) {
          onChange(null)
          setError('Tidak ada layanan pengiriman untuk rute ini')
        }
      } catch (err) {
        if (cancelled) return
        setOptions([])
        onChange(null)
        setError(err instanceof Error ? err.message : 'Gagal menghitung ongkir')
      } finally {
        if (!cancelled) setLoadingRates(false)
      }
    }

    fetchCost()
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [destination?.id, originCityId, weightGrams, resolving])

  function handleManualDestinationChange(next: RajaOngkirDestination | null) {
    setDestination(next)
    onChange(null)
    setOptions([])
    setError('')
    if (next) setShowManualSearch(false)
  }

  function handleSelectOption(option: RajaOngkirShippingOption) {
    if (!destination) return
    onChange({
      ...option,
      destinationCityId: destination.id,
      destinationLabel: destination.label,
      weightGrams,
    })
  }

  const optionKey = (option: RajaOngkirShippingOption) =>
    `${option.courier}-${option.service}-${option.cost}`

  const isLoading = resolving || loadingRates

  return (
    <div className="space-y-4 border-t border-border pt-5 mt-5">
      <div>
        <h3 className="text-base font-bold text-foreground">Kurir Pengiriman (Raja Ongkir)</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Estimasi berat paket: {(weightGrams / 1000).toFixed(1)} kg
        </p>
      </div>

      {!originCityId && (
        <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-sm">
          Kota asal toko belum dikonfigurasi. Admin harus mengatur kota asal di menu Pengaturan.
        </div>
      )}

      {!addressHint?.city?.trim() || !addressHint?.province?.trim() ? (
        <p className="text-sm text-muted-foreground">
          Lengkapi atau pilih alamat pengiriman untuk menghitung ongkir otomatis.
        </p>
      ) : (
        <>
          {destination && !showManualSearch && (
            <div className="p-3 rounded-lg bg-muted/30 border border-border text-sm">
              <p className="text-xs text-muted-foreground mb-0.5">Tujuan pengiriman terdeteksi</p>
              <p className="font-medium text-foreground">{destination.label}</p>
            </div>
          )}

          {isLoading && (
            <p className="text-sm text-muted-foreground">
              {resolving ? 'Mendeteksi kota tujuan...' : 'Menghitung tarif kurir...'}
            </p>
          )}

          {error && !isLoading && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          {showManualSearch && (
            <DestinationSearch
              label="Pilih kota tujuan secara manual"
              placeholder={`${addressHint.city}, ${addressHint.province}`}
              value={destination}
              onChange={handleManualDestinationChange}
              helperText="Gunakan jika kota dari alamat tidak terdeteksi otomatis"
            />
          )}

          {!isLoading && options.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">Pilih layanan kurir</p>
              {options.map(option => {
                const selected = value && optionKey(value) === optionKey(option)
                return (
                  <button
                    key={optionKey(option)}
                    type="button"
                    onClick={() => handleSelectOption(option)}
                    className={`w-full p-4 border-2 rounded-lg transition text-left ${
                      selected ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="flex justify-between items-start gap-3">
                      <div>
                        <p className="font-semibold text-foreground">
                          {option.courierName} — {option.service}
                        </p>
                        <p className="text-sm text-muted-foreground">{option.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">Estimasi: {option.etd} hari</p>
                      </div>
                      <p className="font-bold text-primary whitespace-nowrap">
                        Rp{option.cost.toLocaleString('id-ID')}
                      </p>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </>
      )}
    </div>
  )
}
