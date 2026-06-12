'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'

// ── Data paket tidak diubah ───────────────────────────────────────────────────
const plans = [
  {
    name: 'Starter',
    description: 'Untuk pesanan kecil dan percobaan',
    monthlyPrice: 50000,
    yearlyPrice: 42000,
    minOrder: '10 pcs',
    minQty: 1,
    maxQty: 49,
    features: [
      'Minimum order 10 pcs',
      'Design custom',
      'Sablon 1–2 warna',
      'Pengiriman 5–7 hari',
      'Garansi kualitas',
    ],
    highlighted: false,
    color: 'border-border',
  },
  {
    name: 'Professional',
    description: 'Untuk kebutuhan corporate dan event',
    monthlyPrice: 40000,
    yearlyPrice: 33000,
    minOrder: '50 pcs',
    minQty: 50,
    maxQty: 499,
    features: [
      'Minimum order 50 pcs',
      'Revisi desain unlimited',
      'Sablon full color (DTF)',
      'Pengiriman 3–5 hari',
      'Gratis konsultasi desain',
      'Packaging premium',
    ],
    highlighted: true,
    color: 'border-accent',
  },
  {
    name: 'Enterprise',
    description: 'Untuk produksi skala besar',
    monthlyPrice: 25000,
    yearlyPrice: 20000,
    minOrder: '500 pcs',
    minQty: 500,
    maxQty: Infinity,
    features: [
      'Minimum order 500 pcs',
      'Desain custom unlimited',
      'Multi-color printing',
      'Pengiriman 1–2 hari',
      'Dedicated account manager',
      'Harga khusus & fleksibel',
    ],
    highlighted: false,
    color: 'border-border',
  },
]

const PRINT_METHODS = ['Sablon Manual', 'DTF', 'Offset', 'Sublimasi']

// ── Toast ─────────────────────────────────────────────────────────────────────
function Toast({ message, onDone }: { message: string; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2800)
    return () => clearTimeout(t)
  }, [onDone])
  return (
    <div
      style={{
        position: 'fixed', bottom: 28, left: '50%', transform: 'translateX(-50%)',
        backgroundColor: '#1e3a5f', color: '#fff',
        padding: '12px 24px', borderRadius: 12,
        fontSize: 14, fontWeight: 600,
        boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
        zIndex: 9999, whiteSpace: 'nowrap',
        animation: 'fadeInUp 0.25s ease',
      }}
    >
      ✓ {message}
      <style>{`@keyframes fadeInUp{from{opacity:0;transform:translateX(-50%) translateY(12px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}`}</style>
    </div>
  )
}

// ── Order Modal ───────────────────────────────────────────────────────────────
function OrderModal({ plan, price, onClose }: { plan: typeof plans[0]; price: number; onClose: () => void }) {
  const router = useRouter()
  const [qty, setQty] = useState(plan.minQty)

  return (
    <div
      style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9998, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{ backgroundColor: '#fff', borderRadius: 16, padding: 28, width: '100%', maxWidth: 420, boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: '#111827' }}>Paket {plan.name}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: '#6b7280' }}>×</button>
        </div>

        <div style={{ backgroundColor: '#f9fafb', borderRadius: 10, padding: '12px 16px', marginBottom: 20 }}>
          <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 4 }}>Harga per item</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#1e3a5f' }}>Rp{price.toLocaleString('id-ID')}</div>
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>Jumlah Pesanan</label>
          <input
            type="number"
            min={plan.minQty}
            value={qty}
            onChange={e => setQty(Math.max(plan.minQty, Number(e.target.value) || 0))}
            style={{ width: '100%', padding: '9px 12px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14, color: '#111827', backgroundColor: '#fff', outline: 'none', boxSizing: 'border-box' }}
          />
          <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>Min. {plan.minOrder}</p>        </div>

        <div style={{ backgroundColor: '#eff6ff', borderRadius: 10, padding: '12px 16px', marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#374151', marginBottom: 4 }}>
            <span>Subtotal</span>
            <span style={{ fontWeight: 700 }}>Rp{(price * qty).toLocaleString('id-ID')}</span>
          </div>
          <div style={{ fontSize: 11, color: '#6b7280' }}>Belum termasuk ongkos kirim</div>
        </div>

        <button
          onClick={() => { onClose(); router.push('/shop') }}
          style={{ width: '100%', padding: '11px 0', backgroundColor: '#1e3a5f', color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}
        >
          Lanjut ke Toko →
        </button>
      </div>
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────
export function PricingSection() {
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly')
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [modalIndex, setModalIndex] = useState<number | null>(null)

  // Calculator state
  const [calcQty, setCalcQty] = useState(100)
  const [calcMethod, setCalcMethod] = useState(PRINT_METHODS[0])
  const calcRef = useRef<HTMLDivElement>(null)

  // Determine active plan from quantity
  const calcPlanIndex = calcQty >= 500 ? 2 : calcQty >= 50 ? 1 : 0
  const calcPlan = plans[calcPlanIndex]
  const calcPrice = billing === 'monthly' ? calcPlan.monthlyPrice : calcPlan.yearlyPrice
  const calcTotal = calcPrice * calcQty

  function handleSelectPlan(index: number) {
    setSelectedIndex(index)
    setToast(`Paket ${plans[index].name} dipilih`)
  }

  function handleOrderClick(e: React.MouseEvent, index: number) {
    e.stopPropagation()
    setModalIndex(index)
  }

  return (
    <section id="pricing" className="py-20 bg-background relative z-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Paket Harga</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Pilih paket yang sesuai kebutuhan. Harga dapat disesuaikan untuk pesanan khusus.
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center gap-3 bg-muted rounded-full p-1">
            <button
              onClick={() => setBilling('monthly')}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                billing === 'monthly' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Per Item
            </button>
            <button
              onClick={() => setBilling('yearly')}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                billing === 'yearly' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Bulk Order
              <span className="px-1.5 py-0.5 bg-accent text-accent-foreground text-[10px] font-bold rounded-full">HEMAT 20%</span>
            </button>
          </div>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-6 items-start">
          {plans.map((plan, index) => {
            const price = billing === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice
            const isHovered = hoveredIndex === index
            const isSelected = selectedIndex === index
            const isHighlighted = plan.highlighted

            return (
              <div
                key={index}
                onClick={() => handleSelectPlan(index)}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                style={{
                  position: 'relative',
                  cursor: 'pointer',
                  transition: 'transform 0.25s ease, box-shadow 0.25s ease',
                  transform: isHighlighted && !isHovered && !isSelected
                    ? 'translateY(-8px)'
                    : isHovered || isSelected
                    ? 'translateY(-10px)'
                    : 'translateY(0)',
                  borderRadius: 16,
                }}
              >
                {/* Badge: DIPILIH takes priority over POPULER */}
                {(isSelected || isHighlighted) && (
                  <div style={{ position: 'absolute', top: -14, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 10 }}>
                    <span style={{
                      padding: '3px 14px',
                      borderRadius: 99,
                      fontSize: 11,
                      fontWeight: 700,
                      backgroundColor: isSelected ? '#1e3a5f' : '#d97706',
                      color: '#fff',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                    }}>
                      {isSelected ? '✓ DIPILIH' : 'PALING POPULER'}
                    </span>
                  </div>
                )}

                <Card
                  style={{
                    padding: '24px',
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                    borderWidth: 2,
                    borderStyle: 'solid',
                    borderColor: isSelected
                      ? '#1e3a5f'
                      : isHovered
                      ? '#d97706'
                      : isHighlighted
                      ? '#d97706'
                      : '#e5e7eb',
                    boxShadow: isSelected
                      ? '0 8px 30px rgba(30,58,95,0.2)'
                      : isHovered
                      ? '0 12px 36px rgba(0,0,0,0.13)'
                      : isHighlighted
                      ? '0 8px 24px rgba(0,0,0,0.1)'
                      : '0 1px 4px rgba(0,0,0,0.06)',
                    backgroundColor: isSelected ? '#f0f4ff' : '#ffffff',
                    transition: 'border-color 0.25s ease, box-shadow 0.25s ease, background-color 0.25s ease',
                    borderRadius: 14,
                  }}
                >
                  {/* Name */}
                  <div style={{ marginBottom: 16 }}>
                    <h3 style={{ fontSize: 22, fontWeight: 700, color: '#111827', marginBottom: 4 }}>{plan.name}</h3>
                    <p style={{ fontSize: 13, color: '#6b7280' }}>{plan.description}</p>
                  </div>

                  {/* Price */}
                  <div style={{ marginBottom: 16, paddingBottom: 16, borderBottom: '1px solid #e5e7eb' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4 }}>
                      <span style={{ fontSize: 32, fontWeight: 700, color: '#1e3a5f', lineHeight: 1 }}>
                        Rp{price.toLocaleString('id-ID')}
                      </span>
                      <span style={{ fontSize: 13, color: '#9ca3af', marginBottom: 3 }}>/item</span>
                    </div>
                    {billing === 'yearly' && (
                      <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 4, textDecoration: 'line-through' }}>
                        Rp{plan.monthlyPrice.toLocaleString('id-ID')}/item
                      </p>
                    )}
                    <p style={{ fontSize: 12, color: '#6b7280', marginTop: 6 }}>Min. order {plan.minOrder}</p>
                  </div>

                  {/* Features */}
                  <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 20px 0', display: 'flex', flexDirection: 'column', gap: 10, flexGrow: 1 }}>
                    {plan.features.map((feature, i) => (
                      <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                        <span style={{
                          flexShrink: 0, width: 18, height: 18, borderRadius: '50%',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 10, fontWeight: 700,
                          backgroundColor: isHighlighted || isSelected ? '#d97706' : '#eff6ff',
                          color: isHighlighted || isSelected ? '#fff' : '#1e3a5f',
                          marginTop: 1,
                        }}>✓</span>
                        <span style={{ fontSize: 13, color: '#374151' }}>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <button
                    onClick={e => handleOrderClick(e, index)}
                    style={{
                      width: '100%',
                      padding: '11px 0',
                      borderRadius: 10,
                      fontSize: 14,
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'background-color 0.2s ease, color 0.2s ease',
                      border: isHighlighted || isSelected ? 'none' : '2px solid #d97706',
                      backgroundColor: isHighlighted || isSelected || isHovered ? '#d97706' : '#ffffff',
                      color: isHighlighted || isSelected || isHovered ? '#ffffff' : '#d97706',
                    }}
                    onMouseEnter={e => {
                      const btn = e.currentTarget
                      btn.style.backgroundColor = '#d97706'
                      btn.style.color = '#ffffff'
                    }}
                    onMouseLeave={e => {
                      const btn = e.currentTarget
                      if (!isHighlighted && !isSelected) {
                        btn.style.backgroundColor = '#ffffff'
                        btn.style.color = '#d97706'
                      }
                    }}
                  >
                    {isSelected ? 'Pesan Sekarang →' : isHighlighted ? 'Mulai Sekarang' : 'Pilih Paket'}
                  </button>
                </Card>
              </div>
            )
          })}
        </div>

        {/* Bottom Note */}
        <p className="text-center text-sm text-muted-foreground mt-10">
          Butuh kuantitas lebih besar atau desain khusus?{' '}
          <a href="#contact" className="text-primary font-medium hover:underline">Hubungi kami</a>{' '}
          untuk penawaran custom.
        </p>

        {/* ── Kalkulator Harga ── */}
        <div ref={calcRef} style={{ marginTop: 48 }}>
          <div style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e5e7eb',
            borderRadius: 16,
            padding: '28px 32px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
          }}>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: '#111827', marginBottom: 4 }}>
              🧮 Hitung Estimasi Harga
            </h3>
            <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 24 }}>
              Masukkan jumlah dan jenis sablon untuk melihat estimasi harga dan paket yang sesuai.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20, marginBottom: 24 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 }}>
                  Jumlah Pesanan (pcs)
                </label>
                <input
                  type="number"
                  min={1}
                  value={calcQty}
                  onChange={e => setCalcQty(Math.max(1, parseInt(e.target.value) || 1))}
                  style={{
                    width: '100%', padding: '10px 14px', fontSize: 15,
                    border: '1.5px solid #d1d5db', borderRadius: 10,
                    color: '#111827', backgroundColor: '#f9fafb',
                    outline: 'none', boxSizing: 'border-box',
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 }}>
                  Jenis Sablon
                </label>
                <select
                  value={calcMethod}
                  onChange={e => setCalcMethod(e.target.value)}
                  style={{
                    width: '100%', padding: '10px 14px', fontSize: 15,
                    border: '1.5px solid #d1d5db', borderRadius: 10,
                    color: '#111827', backgroundColor: '#f9fafb',
                    outline: 'none', cursor: 'pointer',
                  }}
                >
                  {PRINT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
            </div>

            {/* Result */}
            <div style={{
              backgroundColor: '#f0f4ff',
              border: '1.5px solid #c7d7f0',
              borderRadius: 12,
              padding: '20px 24px',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: 20,
            }}>
              <div>
                <p style={{ fontSize: 11, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>Paket Aktif</p>
                <p style={{ fontSize: 20, fontWeight: 700, color: '#1e3a5f' }}>{calcPlan.name}</p>
                <p style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>
                  {calcQty < 50 ? '1–49 pcs' : calcQty < 500 ? '50–499 pcs' : '500+ pcs'}
                </p>
              </div>
              <div>
                <p style={{ fontSize: 11, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>Harga per pcs</p>
                <p style={{ fontSize: 20, fontWeight: 700, color: '#1e3a5f' }}>Rp{calcPrice.toLocaleString('id-ID')}</p>
                <p style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>{calcMethod}</p>
              </div>
              <div>
                <p style={{ fontSize: 11, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>Total Estimasi</p>
                <p style={{ fontSize: 20, fontWeight: 700, color: '#d97706' }}>Rp{calcTotal.toLocaleString('id-ID')}</p>
                <p style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>{calcQty} pcs × Rp{calcPrice.toLocaleString('id-ID')}</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <button
                  onClick={() => {
                    handleSelectPlan(calcPlanIndex)
                    setModalIndex(calcPlanIndex)
                  }}
                  style={{
                    width: '100%', padding: '10px 0',
                    backgroundColor: '#1e3a5f', color: '#fff',
                    border: 'none', borderRadius: 10,
                    fontSize: 13, fontWeight: 700, cursor: 'pointer',
                  }}
                >
                  Pesan Paket {calcPlan.name} →
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Toast */}
      {toast && <Toast message={toast} onDone={() => setToast(null)} />}

      {/* Order Modal */}
      {modalIndex !== null && (
        <OrderModal
          plan={plans[modalIndex]}
          price={billing === 'monthly' ? plans[modalIndex].monthlyPrice : plans[modalIndex].yearlyPrice}
          onClose={() => setModalIndex(null)}
        />
      )}
    </section>
  )
}
