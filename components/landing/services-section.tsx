'use client'

import Link from 'next/link'

const SERVICES = [
  {
    id: 1,
    num: 'SERVICE 01',
    title: 'Sablon Manual',
    desc: 'Teknik sablon tradisional dengan hasil berkualitas tinggi untuk kaos, tote bag, dan berbagai produk tekstil. Cocok untuk warna solid dan desain tegas.',
    icon: '🖨️',
    color: '#0d1b2a',
    href: '/shop',
  },
  {
    id: 2,
    num: 'SERVICE 02',
    title: 'DTF Printing',
    desc: 'Teknologi cetak Direct-to-Film terkini untuk detail gambar yang sempurna dan warna lebih vibrant. Cocok untuk desain gradasi dan full color.',
    icon: '🖥️',
    color: '#1a3a5c',
    href: '/shop',
  },
  {
    id: 3,
    num: 'SERVICE 03',
    title: 'Offset Printing',
    desc: 'Cetak offset untuk produksi skala besar dengan konsistensi warna tinggi. Ideal untuk kebutuhan korporat, event, dan seragam organisasi.',
    icon: '📋',
    color: '#0d1b2a',
    href: '/shop',
  },
]

export function ServicesSection() {
  return (
    <section style={{ backgroundColor: '#f8fafc', padding: '80px 0' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px' }}>
        {/* Section header */}
        <div style={{ textAlign: 'center', marginBottom: 52 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, backgroundColor: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 99, padding: '5px 14px', marginBottom: 16 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#f97316' }} />
            <span style={{ fontSize: 12, fontWeight: 700, color: '#f97316' }}>LAYANAN KAMI</span>
          </div>
          <h2 style={{ fontSize: 'clamp(28px, 3vw, 40px)', fontWeight: 900, color: '#0d1b2a', marginBottom: 12 }}>
            Pilihan Layanan Sablon Terlengkap
          </h2>
          <p style={{ fontSize: 15, color: '#64748b', maxWidth: 520, margin: '0 auto', lineHeight: 1.7 }}>
            Kami menyediakan berbagai metode cetak untuk memenuhi kebutuhan desain kamu, dari skala kecil hingga produksi massal.
          </p>
        </div>

        {/* Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
          {SERVICES.map(svc => (
            <div
              key={svc.id}
              style={{ borderRadius: 20, overflow: 'hidden', backgroundColor: '#fff', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', border: '1px solid #e2e8f0', transition: 'transform 0.2s, box-shadow 0.2s' }}
              onMouseEnter={e => { const el = e.currentTarget as HTMLDivElement; el.style.transform = 'translateY(-6px)'; el.style.boxShadow = '0 12px 36px rgba(0,0,0,0.12)' }}
              onMouseLeave={e => { const el = e.currentTarget as HTMLDivElement; el.style.transform = 'translateY(0)'; el.style.boxShadow = '0 4px 20px rgba(0,0,0,0.06)' }}
            >
              {/* Card image area */}
              <div style={{ height: 180, background: `linear-gradient(135deg, ${svc.color} 0%, #1a3a5c 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
                <div style={{ fontSize: 64 }}>{svc.icon}</div>
                {/* Service number overlay */}
                <div style={{ position: 'absolute', top: 14, left: 14, backgroundColor: '#f97316', color: '#fff', fontSize: 10, fontWeight: 800, padding: '3px 10px', borderRadius: 99, letterSpacing: '0.08em' }}>
                  {svc.num}
                </div>
                {/* Decorative circle */}
                <div style={{ position: 'absolute', bottom: -30, right: -30, width: 100, height: 100, borderRadius: '50%', backgroundColor: 'rgba(249,115,22,0.15)' }} />
              </div>

              {/* Card body */}
              <div style={{ padding: '20px 22px 22px' }}>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0d1b2a', marginBottom: 8 }}>{svc.title}</h3>
                <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.65, marginBottom: 18 }}>{svc.desc}</p>
                <Link href={svc.href}>
                  <button style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, color: '#f97316', backgroundColor: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 8, padding: '8px 16px', cursor: 'pointer', transition: 'all 0.15s' }}
                    onMouseEnter={e => { const el = e.currentTarget; el.style.backgroundColor = '#f97316'; el.style.color = '#fff'; el.style.borderColor = '#f97316' }}
                    onMouseLeave={e => { const el = e.currentTarget; el.style.backgroundColor = '#fff7ed'; el.style.color = '#f97316'; el.style.borderColor = '#fed7aa' }}
                  >
                    Pelajari Lebih
                    <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
                  </button>
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div style={{ textAlign: 'center', marginTop: 48 }}>
          <Link href="/shop">
            <button style={{ display: 'inline-flex', alignItems: 'center', gap: 8, backgroundColor: '#0d1b2a', color: '#fff', fontWeight: 700, fontSize: 15, padding: '13px 32px', borderRadius: 8, border: 'none', cursor: 'pointer' }}>
              Lihat Semua Produk
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
            </button>
          </Link>
        </div>
      </div>
    </section>
  )
}
