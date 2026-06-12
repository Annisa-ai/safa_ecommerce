'use client'

import { useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'
import type { RajaOngkirDestination } from '@/lib/shipping/types'

interface DestinationSearchProps {
  label: string
  placeholder?: string
  value: RajaOngkirDestination | null
  onChange: (destination: RajaOngkirDestination | null) => void
  helperText?: string
}

export function DestinationSearch({
  label,
  placeholder = 'Cari kota atau kecamatan...',
  value,
  onChange,
  helperText,
}: DestinationSearchProps) {
  const [query, setQuery] = useState(value?.label ?? '')
  const [results, setResults] = useState<RajaOngkirDestination[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [open, setOpen] = useState(false)

  useEffect(() => {
    setQuery(value?.label ?? '')
  }, [value])

  useEffect(() => {
    if (!open) return
    const keyword = query.trim()
    if (keyword.length < 2) {
      setResults([])
      setError('')
      return
    }

    const timer = setTimeout(async () => {
      setLoading(true)
      setError('')
      try {
        const res = await fetch(`/api/shipping/destination?search=${encodeURIComponent(keyword)}`)
        const data = await res.json()
        if (!res.ok) throw new Error(data.error ?? 'Gagal mencari kota')
        setResults(data.destinations ?? [])
      } catch (err) {
        setResults([])
        setError(err instanceof Error ? err.message : 'Gagal mencari kota')
      } finally {
        setLoading(false)
      }
    }, 350)

    return () => clearTimeout(timer)
  }, [query, open])

  function handleSelect(destination: RajaOngkirDestination) {
    onChange(destination)
    setQuery(destination.label)
    setOpen(false)
    setResults([])
  }

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-foreground mb-2">{label}</label>
      <Input
        value={query}
        onChange={e => {
          setQuery(e.target.value)
          onChange(null)
          setOpen(true)
        }}
        onFocus={() => setOpen(true)}
        placeholder={placeholder}
      />
      {helperText && <p className="text-xs text-muted-foreground mt-1.5">{helperText}</p>}
      {error && <p className="text-xs text-destructive mt-1.5">{error}</p>}

      {open && (loading || results.length > 0 || query.trim().length >= 2) && (
        <div className="absolute z-20 mt-1 w-full rounded-lg border border-border bg-background shadow-lg max-h-56 overflow-y-auto">
          {loading && (
            <p className="px-3 py-2 text-sm text-muted-foreground">Mencari...</p>
          )}
          {!loading && results.length === 0 && query.trim().length >= 2 && !error && (
            <p className="px-3 py-2 text-sm text-muted-foreground">Kota tidak ditemukan</p>
          )}
          {results.map(destination => (
            <button
              key={destination.id}
              type="button"
              onClick={() => handleSelect(destination)}
              className="w-full text-left px-3 py-2.5 text-sm hover:bg-muted/50 border-b border-border/50 last:border-b-0"
            >
              <span className="font-medium text-foreground">{destination.label}</span>
              {destination.zipCode && (
                <span className="block text-xs text-muted-foreground mt-0.5">Kode pos: {destination.zipCode}</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
