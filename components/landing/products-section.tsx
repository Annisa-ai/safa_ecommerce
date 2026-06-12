'use client'

import Link from 'next/link'
import { useProducts } from '@/lib/contexts/product-context'
import { Button } from '@/components/ui/button'
import { ProductCard } from '@/components/shop/product-card'

export function ProductsSection() {
  const { products } = useProducts()
  const featuredProducts = products.slice(0, 6)

  return (
    <section id="shop" className="py-20 bg-muted/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Produk Unggulan
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Koleksi produk sablon dan printing berkualitas tinggi dengan harga kompetitif
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {featuredProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        <div className="text-center">
          <Link href="/shop">
            <Button size="lg" variant="outline">
              Lihat Semua Produk
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
