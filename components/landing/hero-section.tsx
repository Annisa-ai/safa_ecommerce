'use client'

import Link from 'next/link'
import { WhatsAppInlineButton } from '@/components/whatsapp-button'

export function HeroSection() {
  return (
    <section
      id="home"
      style={{
        background: 'linear-gradient(135deg, #0d1b2a 0%, #1a2e44 50%, #0d1b2a 100%)',
        minHeight: '90vh',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      {/* Background decorative shapes */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: -80, right: -80, width: 400, height: 400, borderRadius: '50%', backgroundColor: 'rgba(249,115,22,0.08)' }} />
        <div style={{ position: 'absolute', bottom: -100, left: '30%', width: 300, height: 300, borderRadius: '50%', backgroundColor: 'rgba(249,115,22,0.05)' }} />
        {/* Arrow decorations */}
        <div style={{ position: 'absolute', right: 40, top: '40%', opacity: 0.15 }}>
          {[0,1,2].map(i => (
            <div key={i} style={{ width: 0, height: 0, borderLeft: '12px solid transparent', borderRight: '12px solid transparent', borderBottom: '20px solid #f97316', marginBottom: 6, opacity: 1 - i * 0.2 }} />
          ))}
        </div>
        <div style={{ position: 'absolute', left: 24, bottom: '25%', opacity: 0.15 }}>
          {[0,1,2].map(i => (
            <div key={i} style={{ width: 0, height: 0, borderLeft: '10px solid transparent', borderRight: '10px solid transparent', borderTop: '16px solid #22d3ee', marginBottom: 5, opacity: 1 - i * 0.2 }} />
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '80px 24px', position: 'relative', zIndex: 10, width: '100%' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'center' }}>

          {/* Left content */}
          <div>
            {/* Pill label */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, backgroundColor: 'rgba(249,115,22,0.15)', border: '1px solid rgba(249,115,22,0.3)', borderRadius: 99, padding: '5px 14px', marginBottom: 20 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#f97316' }} />
              <span style={{ fontSize: 12, fontWeight: 600, color: '#f97316', letterSpacing: '0.05em' }}>Safa Apparel — Sablon Profesional</span>
            </div>

            <h1 style={{ fontSize: 'clamp(32px, 4vw, 56px)', fontWeight: 900, color: '#ffffff', lineHeight: 1.15, marginBottom: 20 }}>
              Selamat Datang di{' '}
              <span style={{ color: '#f97316' }}>Safa Apparel</span>
              <br />Sablon & Printing
            </h1>

            <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.7)', lineHeight: 1.75, marginBottom: 32, maxWidth: 460 }}>
              Wujudkan desain impianmu bersama kami. Sablon kaos, hoodie, tote bag, jersey, dan berbagai produk custom berkualitas tinggi dengan harga kompetitif.
            </p>

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 40 }}>
              <Link href="/shop">
                <button style={{ display: 'inline-flex', alignItems: 'center', gap: 8, backgroundColor: '#f97316', color: '#fff', fontWeight: 700, fontSize: 15, padding: '13px 28px', borderRadius: 8, border: 'none', cursor: 'pointer', transition: 'background 0.2s' }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#ea6c00')}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#f97316')}
                >
                  Pesan Sekarang
                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
                </button>
              </Link>
              <WhatsAppInlineButton variant="outline" label="Konsultasi Gratis" />
            </div>

            {/* Mini features */}
            <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
              {[
                { icon: '✓', text: 'Kualitas Premium' },
                { icon: '✓', text: 'Free Konsultasi' },
                { icon: '✓', text: 'Pengiriman Cepat' },
              ].map(f => (
                <div key={f.text} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 20, height: 20, borderRadius: '50%', backgroundColor: 'rgba(249,115,22,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: '#f97316', fontWeight: 800, flexShrink: 0 }}>{f.icon}</div>
                  <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', fontWeight: 500 }}>{f.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right — visual card stack */}
          <div style={{ display: 'flex', justifyContent: 'center', position: 'relative' }}>
            {/* Main card */}
            <div style={{ width: '100%', maxWidth: 460, borderRadius: 20, overflow: 'hidden', background: 'linear-gradient(135deg, #1e3a5f 0%, #0f2235 100%)', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 24px 60px rgba(0,0,0,0.4)' }}>
              {/* Card header */}
              <div style={{ background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)', padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', fontWeight: 600 }}>LAYANAN SABLON</p>
                  <p style={{ fontSize: 20, fontWeight: 800, color: '#fff', marginTop: 2 }}>Safa Apparel</p>
                </div>
                <div style={{ width: 50, height: 50, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
                  🎨
                </div>
              </div>

              {/* Card body */}
              <div style={{ padding: '20px 24px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                  {[
                    { label: 'Sablon Manual', emoji: '🖨️' },
                    { label: 'DTF Printing', emoji: '🖥️' },
                    { label: 'Offset Print', emoji: '📋' },
                    { label: 'Custom Design', emoji: '✏️' },
                  ].map(s => (
                    <div key={s.label} style={{ backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 10, padding: '12px', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 18 }}>{s.emoji}</span>
                      <span style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.85)' }}>{s.label}</span>
                    </div>
                  ))}
                </div>

                {/* Products */}
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {['Kaos', 'Hoodie', 'Tote Bag', 'Jersey', 'Kemeja'].map(p => (
                    <span key={p} style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 99, backgroundColor: 'rgba(249,115,22,0.15)', color: '#f97316', border: '1px solid rgba(249,115,22,0.25)' }}>{p}</span>
                  ))}
                </div>

                {/* Badge */}
                <div style={{ marginTop: 16, display: 'flex', gap: 12 }}>
                  <div style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 10, padding: '10px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <p style={{ fontSize: 22, fontWeight: 900, color: '#f97316' }}>10+</p>
                    <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', marginTop: 2 }}>Tahun Pengalaman</p>
                  </div>
                  <div style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 10, padding: '10px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <p style={{ fontSize: 22, fontWeight: 900, color: '#f97316' }}>2K+</p>
                    <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', marginTop: 2 }}>Pelanggan Puas</p>
                  </div>
                  <div style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 10, padding: '10px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <p style={{ fontSize: 22, fontWeight: 900, color: '#f97316' }}>50+</p>
                    <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', marginTop: 2 }}>Kota Pengiriman</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(249,115,22,0.95)', backdropFilter: 'blur(10px)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '16px 24px', display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: 16 }}>
          {[
            { num: '10K+', label: 'Produk Selesai', icon: '🏆' },
            { num: '2K+', label: 'Pelanggan Puas', icon: '😊' },
            { num: '15+', label: 'Kota Operasi', icon: '📍' },
            { num: '3', label: 'Metode Sablon', icon: '🎨' },
          ].map(s => (
            <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 22 }}>{s.icon}</span>
              <div>
                <p style={{ fontSize: 20, fontWeight: 900, color: '#fff', lineHeight: 1 }}>{s.num}</p>
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.8)', marginTop: 2 }}>{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
