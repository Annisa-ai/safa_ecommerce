'use client'

import Link from 'next/link'
import { useCMS } from '@/lib/contexts/cms-context'

export function Footer() {
  const { getContent } = useCMS()
  const contactContent = getContent('contact')

  return (
    <footer className="bg-primary text-primary-foreground mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-primary-foreground rounded-sm flex items-center justify-center">
                <span className="text-primary text-sm font-bold">S</span>
              </div>
              <span className="text-lg font-bold">ScreenStudio</span>
            </div>
            <p className="text-sm opacity-80">
              Layanan sablon profesional untuk produk dan jasa berkualitas tinggi.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-bold mb-4 text-sm">Produk</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="#" className="opacity-80 hover:opacity-100 transition">
                  Kaos Sablon
                </Link>
              </li>
              <li>
                <Link href="#" className="opacity-80 hover:opacity-100 transition">
                  Tote Bag
                </Link>
              </li>
              <li>
                <Link href="#" className="opacity-80 hover:opacity-100 transition">
                  Hoodie
                </Link>
              </li>
              <li>
                <Link href="#" className="opacity-80 hover:opacity-100 transition">
                  Jersey
                </Link>
              </li>
            </ul>
          </div>

          {/* Layanan */}
          <div>
            <h3 className="font-bold mb-4 text-sm">Layanan</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="#" className="opacity-80 hover:opacity-100 transition">
                  Sablon Tekstil
                </Link>
              </li>
              <li>
                <Link href="#" className="opacity-80 hover:opacity-100 transition">
                  Printing DTF
                </Link>
              </li>
              <li>
                <Link href="#" className="opacity-80 hover:opacity-100 transition">
                  Offset Printing
                </Link>
              </li>
              <li>
                <Link href="#" className="opacity-80 hover:opacity-100 transition">
                  Desain Custom
                </Link>
              </li>
            </ul>
          </div>

          {/* Kontak */}
          <div>
            <h3 className="font-bold mb-4 text-sm">Kontak</h3>
            <div className="space-y-2 text-sm">
              <p className="opacity-80">
                <span className="inline-block w-4">▼</span>
                {' '}
                <a href={`tel:${contactContent?.phone || '+62812345678'}`} className="hover:opacity-100 transition">
                  {contactContent?.phone || '+62 812-3456-7890'}
                </a>
              </p>
              <p className="opacity-80">
                <span className="inline-block w-4">✉</span>
                {' '}
                <a href={`mailto:${contactContent?.email || 'info@screenstudio.id'}`} className="hover:opacity-100 transition">
                  {contactContent?.email || 'info@screenstudio.id'}
                </a>
              </p>
              <p className="opacity-80">
                <span className="inline-block w-4">⌖</span>
                {' '}
                {contactContent?.address || 'Jl. Merdeka No. 123, Jakarta'}
              </p>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-primary-foreground/20 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm opacity-80">
            © 2024 ScreenStudio. Semua hak dilindungi.
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-sm opacity-80 hover:opacity-100 transition">
              Instagram
            </a>
            <a href="#" className="text-sm opacity-80 hover:opacity-100 transition">
              Facebook
            </a>
            <a href="#" className="text-sm opacity-80 hover:opacity-100 transition">
              WhatsApp
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
