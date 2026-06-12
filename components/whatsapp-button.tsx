'use client'

import { useWAConfig, WA_FALLBACK } from '@/lib/contexts/wa-config-context'

export interface WAContext {
  type: 'general' | 'product' | 'order' | 'pricing'
  productName?: string
  productCategory?: string
  orderNumber?: string
  planName?: string
  userName?: string
}

export function buildWAUrl(waNumber: string, ctx: WAContext = { type: 'general' }): string {
  let text = ''

  switch (ctx.type) {
    case 'product':
      text = [
        `Halo Safa Apparel 👋`,
        ``,
        `Saya tertarik dengan produk *${ctx.productName ?? 'produk Anda'}*${ctx.productCategory ? ` (kategori: ${ctx.productCategory})` : ''}.`,
        ``,
        `Boleh saya bertanya lebih lanjut mengenai detail, harga, dan ketersediaannya?`,
        ``,
        `Terima kasih 🙏`,
      ].join('\n')
      break

    case 'order':
      text = [
        `Halo Safa Apparel 👋`,
        ``,
        `Saya ingin menanyakan status pesanan saya:`,
        `📦 No. Pesanan: *${ctx.orderNumber ?? '-'}*`,
        ctx.userName ? `👤 Nama: *${ctx.userName}*` : '',
        ``,
        `Mohon bantuannya ya. Terima kasih 🙏`,
      ].filter(Boolean).join('\n')
      break

    case 'pricing':
      text = [
        `Halo Safa Apparel 👋`,
        ``,
        `Saya tertarik dengan *Paket ${ctx.planName ?? 'Sablon'}* dan ingin mengetahui info lebih lanjut.`,
        ``,
        `Bisa bantu saya? Terima kasih 🙏`,
      ].join('\n')
      break

    default:
      text = [
        `Halo Safa Apparel 👋`,
        ``,
        `Saya ingin bertanya mengenai layanan sablon Anda.`,
        `Boleh dibantu? Terima kasih 🙏`,
      ].join('\n')
  }

  const num = waNumber || WA_FALLBACK
  return `https://wa.me/${num}?text=${encodeURIComponent(text)}`
}

// ── WA icon ───────────────────────────────────────────────────────────────────
function WAIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  )
}

// ── Floating WhatsApp Button ──────────────────────────────────────────────────
export function WhatsAppFloatingButton() {
  const { waNumber } = useWAConfig()
  const url = buildWAUrl(waNumber, { type: 'general' })

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat via WhatsApp"
      style={{
        position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
        width: 56, height: 56, borderRadius: '50%',
        backgroundColor: '#25d366',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 4px 20px rgba(37,211,102,0.45)',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        textDecoration: 'none', color: '#fff',
      }}
      onMouseEnter={e => {
        const el = e.currentTarget
        el.style.transform = 'scale(1.1)'
        el.style.boxShadow = '0 6px 28px rgba(37,211,102,0.55)'
      }}
      onMouseLeave={e => {
        const el = e.currentTarget
        el.style.transform = 'scale(1)'
        el.style.boxShadow = '0 4px 20px rgba(37,211,102,0.45)'
      }}
    >
      <WAIcon size={28} />
    </a>
  )
}

// ── Inline WhatsApp Button ────────────────────────────────────────────────────
export function WhatsAppInlineButton({
  ctx,
  label = 'Chat via WhatsApp',
  variant = 'default',
  className = '',
}: {
  ctx?: WAContext
  label?: string
  variant?: 'default' | 'outline' | 'ghost'
  className?: string
}) {
  const { waNumber } = useWAConfig()
  const url = buildWAUrl(waNumber, ctx)

  const base: React.CSSProperties = {
    display: 'inline-flex', alignItems: 'center', gap: 8,
    fontWeight: 700, fontSize: 14, borderRadius: 10,
    padding: '10px 20px', cursor: 'pointer', border: 'none',
    textDecoration: 'none', transition: 'all 0.15s ease',
  }
  const styles: Record<string, React.CSSProperties> = {
    default: { backgroundColor: '#25d366', color: '#fff', boxShadow: '0 2px 8px rgba(37,211,102,0.3)' },
    outline: { backgroundColor: '#fff', color: '#25d366', border: '1.5px solid #25d366' },
    ghost:   { backgroundColor: 'transparent', color: '#25d366' },
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      style={{ ...base, ...styles[variant] }}
      className={className}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLAnchorElement
        if (variant === 'default') el.style.backgroundColor = '#1ebe5d'
        else if (variant === 'outline') el.style.backgroundColor = '#f0fdf4'
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLAnchorElement
        if (variant === 'default') el.style.backgroundColor = '#25d366'
        else if (variant === 'outline') el.style.backgroundColor = '#fff'
      }}
    >
      <WAIcon size={18} />
      {label}
    </a>
  )
}
