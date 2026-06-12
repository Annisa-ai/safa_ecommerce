'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { Product } from '@/lib/types'
import { mockProducts } from '@/lib/mock-data'
import { supabase } from '@/lib/supabase/client'
import {
  getProducts,
  createProduct as dbCreateProduct,
  updateProductById as dbUpdateProduct,
  deleteProductById as dbDeleteProduct,
} from '@/lib/supabase/queries'

const STORAGE_KEY = 'safa_products'
const SOURCE_KEY = 'safa_products_source' // 'db' | 'local' — pelacakan sumber terakhir

function loadProductsFromLocal(): Product[] {
  if (typeof window === 'undefined') return mockProducts
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) return JSON.parse(stored)
  } catch {}
  return mockProducts
}

function saveProductsToLocal(products: Product[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products))
  } catch {}
}

interface ProductContextType {
  products: Product[]
  addProduct: (product: Omit<Product, 'id'>) => void
  updateProduct: (id: string, updates: Partial<Product>) => void
  deleteProduct: (id: string) => void
  getProduct: (id: string) => Product | undefined
}

const ProductContext = createContext<ProductContextType | undefined>(undefined)

export function ProductProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>(mockProducts)
  const [hydrated, setHydrated] = useState(false)

  // ============================================================
  // INIT: Hybrid load — cek Supabase dulu, fallback ke localStorage
  // ============================================================
  useEffect(() => {
    let cancelled = false

    async function init() {
      // 1) Coba ambil dari Supabase
      const { data, error } = await getProducts()
      if (!cancelled && data && !error && data.length > 0) {
        // DB punya data → pakai DB, sinkronkan ke localStorage sebagai cache
        setProducts(data)
        saveProductsToLocal(data)
        if (typeof window !== 'undefined') {
          localStorage.setItem(SOURCE_KEY, 'db')
        }
        setHydrated(true)
        return
      }

      // 2) Fallback ke localStorage / mock
      if (!cancelled) {
        const local = loadProductsFromLocal()
        setProducts(local)
        if (typeof window !== 'undefined') {
          localStorage.setItem(SOURCE_KEY, 'local')
        }
        setHydrated(true)
      }
    }

    init()
    return () => { cancelled = true }
  }, [])

  // ============================================================
  // PERSIST: Simpan ke localStorage setiap ada perubahan (setelah hydration)
  // Ini menjaga UX existing agar UI tidak berubah
  // ============================================================
  useEffect(() => {
    if (hydrated) {
      saveProductsToLocal(products)
    }
  }, [products, hydrated])

  // ============================================================
  // Realtime subscription: kalau DB berubah, sync state
  // (Opsional — aktif hanya jika env var Supabase terkonfigurasi)
  // ============================================================
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return

    const channel = supabase
      .channel('products-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'products' },
        async () => {
          const { data } = await getProducts()
          if (data) {
            setProducts(data)
            saveProductsToLocal(data)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  // ============================================================
  // CRUD: tulis ke state lokal, background sync ke Supabase
  // ============================================================
  const addProduct = (product: Omit<Product, 'id'>) => {
    // 1) Update state lokal dulu (UI tidak berubah)
    const newProduct: Product = {
      ...product,
      id: Date.now().toString(),
    }
    setProducts(prev => [...prev, newProduct])

    // 2) Background sync ke Supabase
    dbCreateProduct(product)
      .then(({ data, error }) => {
        if (data && !error) {
          // Replace ID lokal dengan ID dari DB agar konsisten
          setProducts(prev =>
            prev.map(p => (p.id === newProduct.id ? data : p))
          )
        }
      })
      .catch(err => {
        console.warn('[ProductContext] addProduct → DB sync failed:', err)
      })
  }

  const updateProduct = (id: string, updates: Partial<Product>) => {
    // 1) Update state lokal
    setProducts(prev =>
      prev.map(p => (p.id === id ? { ...p, ...updates } : p))
    )

    // 2) Background sync ke Supabase
    dbUpdateProduct(id, updates)
      .then(({ error }) => {
        if (error) {
          console.warn('[ProductContext] updateProduct → DB sync failed:', error)
        }
      })
      .catch(err => {
        console.warn('[ProductContext] updateProduct → DB sync failed:', err)
      })
  }

  const deleteProduct = (id: string) => {
    // 1) Update state lokal
    setProducts(prev => prev.filter(p => p.id !== id))

    // 2) Background sync ke Supabase
    dbDeleteProduct(id)
      .then(({ error }) => {
        if (error) {
          console.warn('[ProductContext] deleteProduct → DB sync failed:', error)
        }
      })
      .catch(err => {
        console.warn('[ProductContext] deleteProduct → DB sync failed:', err)
      })
  }

  const getProduct = (id: string) => {
    return products.find(p => p.id === id)
  }

  return (
    <ProductContext.Provider value={{ products, addProduct, updateProduct, deleteProduct, getProduct }}>
      {children}
    </ProductContext.Provider>
  )
}

export function useProducts() {
  const context = useContext(ProductContext)
  if (context === undefined) {
    throw new Error('useProducts harus digunakan dalam ProductProvider')
  }
  return context
}
