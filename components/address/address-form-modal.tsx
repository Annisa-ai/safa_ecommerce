'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export const EMPTY_ADDRESS_FORM = {
  label: 'Rumah',
  recipientName: '',
  phone: '',
  province: '',
  city: '',
  district: '',
  postalCode: '',
  fullAddress: '',
  landmark: '',
  isDefault: false,
}

export type AddressFormState = typeof EMPTY_ADDRESS_FORM

const LABEL_PRESETS = ['Rumah', 'Kantor', 'Gudang', 'Kost'] as const
const isCustomLabel = (label: string) => !LABEL_PRESETS.includes(label as (typeof LABEL_PRESETS)[number])

const LABEL_EMOJI: Record<string, string> = {
  Rumah: '🏠',
  Kantor: '🏢',
  Gudang: '🏭',
  Kost: '🛏️',
}

function labelEmoji(label: string) {
  return LABEL_EMOJI[label] ?? '📍'
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 pt-1">
      <p className="text-xs font-bold text-foreground/80 uppercase tracking-wider">{children}</p>
      <div className="flex-1 h-px bg-border" />
    </div>
  )
}

interface AddressFormModalProps {
  isEdit?: boolean
  initial?: Partial<AddressFormState>
  onSave: (data: AddressFormState) => void | Promise<void>
  onClose: () => void
}

export function AddressFormModal({
  isEdit = false,
  initial,
  onSave,
  onClose,
}: AddressFormModalProps) {
  const [form, setForm] = useState<AddressFormState>({ ...EMPTY_ADDRESS_FORM, ...initial })
  const [errors, setErrors] = useState<Partial<Record<keyof AddressFormState, string>>>({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setForm({ ...EMPTY_ADDRESS_FORM, ...initial })
    setErrors({})
  }, [initial])

  const set = (k: keyof AddressFormState, v: string | boolean) =>
    setForm(prev => ({ ...prev, [k]: v }))

  function validate() {
    const e: Partial<Record<keyof AddressFormState, string>> = {}
    if (!form.label.trim()) e.label = 'Wajib diisi'
    if (!form.recipientName.trim()) e.recipientName = 'Wajib diisi'
    if (!form.phone.trim()) e.phone = 'Wajib diisi'
    else if (!/^\d{8,15}$/.test(form.phone.replace(/[\s\-]/g, ''))) e.phone = 'Nomor HP tidak valid (8–15 digit)'
    if (!form.province.trim()) e.province = 'Wajib diisi'
    if (!form.city.trim()) e.city = 'Wajib diisi'
    if (!form.district.trim()) e.district = 'Wajib diisi'
    if (!form.postalCode.trim()) e.postalCode = 'Wajib diisi'
    else if (!/^\d{5}$/.test(form.postalCode.trim())) e.postalCode = 'Harus 5 digit angka'
    if (!form.fullAddress.trim()) e.fullAddress = 'Wajib diisi'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    setSaving(true)
    try {
      await new Promise(r => setTimeout(r, 150))
      await onSave(form)
    } finally {
      setSaving(false)
    }
  }

  const fieldError = (key: keyof AddressFormState) =>
    errors[key] ? (
      <p className="text-xs text-destructive mt-1.5 flex items-center gap-1">
        <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
        {errors[key]}
      </p>
    ) : null

  const inputClass = (key: keyof AddressFormState) =>
    `h-11 text-sm ${errors[key] ? 'border-destructive focus-visible:ring-destructive/30' : ''}`

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center bg-black/55 backdrop-blur-[2px] p-0 sm:p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="w-full sm:max-w-xl bg-background rounded-t-2xl sm:rounded-2xl shadow-2xl max-h-[92vh] flex flex-col overflow-hidden border border-border/60">
        {/* Header */}
        <div className="flex-shrink-0 px-5 sm:px-6 py-4 border-b border-border bg-background/95 backdrop-blur">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-foreground">
                {isEdit ? 'Edit Alamat' : 'Tambah Alamat Baru'}
              </h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                Lengkapi data pengiriman agar pesanan sampai tepat waktu
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Tutup"
              className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-muted transition text-muted-foreground hover:text-foreground"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Body */}
        <form id="address-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-5 sm:px-6 py-5 space-y-6">
          {/* Label */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-foreground">Simpan sebagai</p>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {LABEL_PRESETS.map(label => {
                const active = form.label === label
                return (
                  <button
                    key={label}
                    type="button"
                    onClick={() => set('label', label)}
                    className={`flex flex-col items-center justify-center gap-1.5 rounded-xl border-2 px-2 py-3 text-center transition-all ${
                      active
                        ? 'border-primary bg-primary/5 text-primary shadow-sm'
                        : 'border-border bg-background text-muted-foreground hover:border-primary/40 hover:bg-muted/30'
                    }`}
                  >
                    <span className="text-xl leading-none">{labelEmoji(label)}</span>
                    <span className="text-xs font-semibold">{label}</span>
                  </button>
                )
              })}
              <button
                type="button"
                onClick={() => set('label', isCustomLabel(form.label) ? form.label : '')}
                className={`flex flex-col items-center justify-center gap-1.5 rounded-xl border-2 px-2 py-3 text-center transition-all sm:col-span-1 col-span-2 ${
                  isCustomLabel(form.label)
                    ? 'border-primary bg-primary/5 text-primary shadow-sm'
                    : 'border-border bg-background text-muted-foreground hover:border-primary/40 hover:bg-muted/30'
                }`}
              >
                <span className="text-xl leading-none">📍</span>
                <span className="text-xs font-semibold">Lainnya</span>
              </button>
            </div>
            {isCustomLabel(form.label) && (
              <Input
                value={form.label}
                onChange={e => set('label', e.target.value)}
                placeholder="Nama label kustom, mis. Kosan"
                className={`h-11 text-sm ${errors.label ? 'border-destructive' : ''}`}
              />
            )}
            {fieldError('label')}
          </div>

          <SectionTitle>Informasi Penerima</SectionTitle>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Nama Penerima <span className="text-destructive">*</span>
              </label>
              <Input
                value={form.recipientName}
                onChange={e => set('recipientName', e.target.value)}
                placeholder="Nama lengkap penerima"
                className={inputClass('recipientName')}
              />
              {fieldError('recipientName')}
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Nomor HP <span className="text-destructive">*</span>
              </label>
              <div className="flex">
                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-border bg-muted text-sm text-muted-foreground">
                  +62
                </span>
                <Input
                  value={form.phone}
                  onChange={e => set('phone', e.target.value.replace(/[^\d\s\-]/g, ''))}
                  placeholder="812-3456-7890"
                  inputMode="tel"
                  className={`rounded-l-none ${inputClass('phone')}`}
                />
              </div>
              {fieldError('phone')}
            </div>
          </div>

          <SectionTitle>Lokasi</SectionTitle>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Provinsi <span className="text-destructive">*</span>
              </label>
              <Input
                value={form.province}
                onChange={e => set('province', e.target.value)}
                placeholder="Contoh: DKI Jakarta"
                className={inputClass('province')}
              />
              {fieldError('province')}
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Kota / Kabupaten <span className="text-destructive">*</span>
              </label>
              <Input
                value={form.city}
                onChange={e => set('city', e.target.value)}
                placeholder="Contoh: Jakarta Selatan"
                className={inputClass('city')}
              />
              {fieldError('city')}
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Kecamatan <span className="text-destructive">*</span>
              </label>
              <Input
                value={form.district}
                onChange={e => set('district', e.target.value)}
                placeholder="Contoh: Kebayoran Baru"
                className={inputClass('district')}
              />
              {fieldError('district')}
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Kode Pos <span className="text-destructive">*</span>
              </label>
              <Input
                value={form.postalCode}
                onChange={e => set('postalCode', e.target.value.replace(/\D/g, '').slice(0, 5))}
                placeholder="12160"
                inputMode="numeric"
                maxLength={5}
                className={inputClass('postalCode')}
              />
              {fieldError('postalCode')}
            </div>
          </div>

          <SectionTitle>Detail Alamat</SectionTitle>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Alamat Lengkap <span className="text-destructive">*</span>
            </label>
            <textarea
              value={form.fullAddress}
              onChange={e => set('fullAddress', e.target.value)}
              rows={3}
              placeholder="Nama jalan, nomor rumah, RT/RW, kelurahan..."
              className={`w-full px-3 py-3 text-sm border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none transition ${
                errors.fullAddress ? 'border-destructive' : 'border-border'
              }`}
            />
            {fieldError('fullAddress')}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Patokan <span className="text-muted-foreground font-normal">(opsional)</span>
            </label>
            <Input
              value={form.landmark}
              onChange={e => set('landmark', e.target.value)}
              placeholder="Dekat minimarket, sebelah masjid, dll."
              className="h-11 text-sm"
            />
          </div>

          <button
            type="button"
            onClick={() => set('isDefault', !form.isDefault)}
            className={`w-full flex items-start gap-3 p-4 rounded-xl border-2 text-left transition ${
              form.isDefault ? 'border-primary/40 bg-primary/5' : 'border-border hover:bg-muted/30'
            }`}
          >
            <div className={`mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition ${
              form.isDefault ? 'bg-primary border-primary' : 'border-muted-foreground/40 bg-background'
            }`}>
              {form.isDefault && (
                <svg className="w-3 h-3 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Jadikan alamat utama</p>
              <p className="text-xs text-muted-foreground mt-0.5">Otomatis dipilih saat checkout berikutnya</p>
            </div>
          </button>
        </form>

        {/* Footer */}
        <div className="flex-shrink-0 px-5 sm:px-6 py-4 border-t border-border bg-background/95 backdrop-blur">
          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 h-11" disabled={saving}>
              Batal
            </Button>
            <Button type="submit" form="address-form" className="flex-1 h-11 gap-2" disabled={saving}>
              {saving && (
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              )}
              {saving ? 'Menyimpan...' : isEdit ? 'Simpan Perubahan' : 'Simpan Alamat'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
