'use client'

import { useState, useMemo } from 'react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { ProductCard } from '@/components/shop/product-card'
import { ProductFilter } from '@/components/shop/product-filter'
import { useProducts } from '@/lib/contexts/product-context'

export default function ShopPage() {
  const { products } = useProducts()
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState('newest')

  const categories = Array.from(new Set(products.map(p => p.category)))

  const filteredAndSortedProducts = useMemo(() => {
    let filtered = selectedCategory
      ? products.filter(p => p.category === selectedCategory)
      : [...products]

    switch (sortBy) {
      case 'price-low':
        return filtered.sort((a, b) => a.price - b.price)
      case 'price-high':
        return filtered.sort((a, b) => b.price - a.price)
      case 'popular':
        return filtered.sort((a, b) => (b.minOrder ?? 0) - (a.minOrder ?? 0))
      case 'newest':
      default:
        return filtered
    }
  }, [products, selectedCategory, sortBy])

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-4">Toko Produk</h1>
            <p className="text-lg text-muted-foreground">
              Jelajahi koleksi lengkap produk sablon dan printing berkualitas tinggi kami
            </p>
          </div>

          <div className="grid lg:grid-cols-4 gap-8">
            {/* Sidebar Filter */}
            <div className="lg:col-span-1">
              <div className="sticky top-20">
                <ProductFilter
                  categories={categories}
                  selectedCategory={selectedCategory}
                  onCategoryChange={setSelectedCategory}
                  onSortChange={setSortBy}
                />
              </div>
            </div>

            {/* Products Grid */}
            <div className="lg:col-span-3">
              {filteredAndSortedProducts.length > 0 ? (
                <>
                  <div className="mb-6">
                    <p className="text-sm text-muted-foreground">
                      Menampilkan {filteredAndSortedProducts.length} produk
                    </p>
                  </div>
                  <div className="grid md:grid-cols-2 gap-6">
                    {filteredAndSortedProducts.map(product => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground mb-4">Tidak ada produk ditemukan</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
