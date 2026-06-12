'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface ProductFilterProps {
  categories: string[]
  selectedCategory: string | null
  onCategoryChange: (category: string | null) => void
  onSortChange: (sort: string) => void
}

export function ProductFilter({
  categories,
  selectedCategory,
  onCategoryChange,
  onSortChange,
}: ProductFilterProps) {
  return (
    <div className="space-y-6">
      <Card className="p-6 border border-border">
        <h3 className="font-bold text-foreground mb-4">Kategori</h3>
        <div className="space-y-2">
          <button
            onClick={() => onCategoryChange(null)}
            className={`w-full text-left px-3 py-2 rounded-md transition ${
              selectedCategory === null
                ? 'bg-primary text-primary-foreground'
                : 'text-foreground/70 hover:text-foreground'
            }`}
          >
            Semua Produk
          </button>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => onCategoryChange(category)}
              className={`w-full text-left px-3 py-2 rounded-md transition ${
                selectedCategory === category
                  ? 'bg-primary text-primary-foreground'
                  : 'text-foreground/70 hover:text-foreground'
              }`}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>
      </Card>

      <Card className="p-6 border border-border">
        <h3 className="font-bold text-foreground mb-4">Urutkan</h3>
        <div className="space-y-2">
          {[
            { value: 'newest', label: 'Terbaru' },
            { value: 'price-low', label: 'Harga Termurah' },
            { value: 'price-high', label: 'Harga Termahal' },
            { value: 'popular', label: 'Paling Populer' },
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => onSortChange(option.value)}
              className="w-full text-left px-3 py-2 rounded-md text-foreground/70 hover:text-foreground hover:bg-muted/50 transition"
            >
              {option.label}
            </button>
          ))}
        </div>
      </Card>
    </div>
  )
}
