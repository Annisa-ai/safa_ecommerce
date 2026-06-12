import { supabase } from './client'
import type { Product } from '@/lib/types'

/* ============================================================
   Products Queries — Migrasi dari localStorage ke Supabase
   ============================================================
   Pola: hybrid (DB-first, fallback ke localStorage)
   - Read: cek Supabase dulu, jika tidak ada → fallback
   - Write: tulis ke state lokal (supaya UI tidak berubah) +
            background sync ke Supabase
   ============================================================ */

// ─── Row shape dari Supabase (snake_case) ──────────────────────
interface ProductRow {
  id: number
  name: string
  slug: string
  description: string | null
  category: string | null
  print_method: string | null
  price: number | string
  image_url: string | null
  stock_quantity: number | null
  status: string | null
  specifications: any
  tags: string | null
  created_at: string
  updated_at: string
}

// ─── Mapping: DB row → FE Product ──────────────────────────────
function rowToProduct(row: ProductRow): Product {
  const method = (row.print_method || 'sablon') as 'sablon' | 'dtf' | 'offset'
  return {
    id: String(row.id),
    name: row.name,
    description: row.description ?? '',
    category: (row.category as Product['category']) ?? 'kaos',
    price: Number(row.price),
    image: row.image_url ?? '',
    printMethods: [method] as Product['printMethods'],
    minOrder: 1,
    stock: row.stock_quantity ?? 0,
  } as Product
}

// ─── Mapping: FE Product (parsial) → DB row insert ─────────────
function productToInsert(p: Partial<Product>): any {
  return {
    name: p.name,
    slug: (p.name || 'product')
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .slice(0, 250) + '-' + Date.now().toString(36),
    description: p.description ?? '',
    category: p.category ?? 'kaos',
    print_method: p.printMethods?.[0] ?? 'sablon',
    price: p.price ?? 0,
    image_url: p.image ?? '',
    stock_quantity: (p as any).stock ?? 100,
    status: 'active',
  }
}

// ─── READ: Ambil semua produk (active + inactive untuk admin) ─
export const getProducts = async (): Promise<{ data: Product[] | null; error: any }> => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('id', { ascending: true })

  if (error || !data) return { data: null, error }

  return { data: data.map(rowToProduct), error: null }
}

// ─── READ: Hanya produk aktif (untuk landing/shop) ───────────
export const getActiveProducts = async (): Promise<{ data: Product[] | null; error: any }> => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('status', 'active')
    .order('id', { ascending: true })

  if (error || !data) return { data: null, error }

  return { data: data.map(rowToProduct), error: null }
}

// ─── READ: Produk by ID ───────────────────────────────────────
export const getProductById = async (id: string): Promise<{ data: Product | null; error: any }> => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (error || !data) return { data: null, error }
  return { data: rowToProduct(data as ProductRow), error: null }
}

// ─── CREATE: Tambah produk baru (admin only) ──────────────────
export const createProduct = async (product: Partial<Product>): Promise<{ data: Product | null; error: any }> => {
  const insertData = productToInsert(product)
  const { data, error } = await supabase
    .from('products')
    .insert(insertData)
    .select('*')
    .single()

  if (error || !data) return { data: null, error }
  return { data: rowToProduct(data as ProductRow), error: null }
}

// ─── UPDATE: Ubah produk (admin only) ─────────────────────────
export const updateProductById = async (
  id: string,
  updates: Partial<Product>
): Promise<{ data: Product | null; error: any }> => {
  const updateData: any = {}
  if (updates.name !== undefined) updateData.name = updates.name
  if (updates.description !== undefined) updateData.description = updates.description
  if (updates.category !== undefined) updateData.category = updates.category
  if (updates.printMethods !== undefined) updateData.print_method = updates.printMethods[0]
  if (updates.price !== undefined) updateData.price = updates.price
  if (updates.image !== undefined) updateData.image_url = updates.image
  if ((updates as any).stock !== undefined) updateData.stock_quantity = (updates as any).stock
  if ((updates as any).status !== undefined) updateData.status = (updates as any).status

  const { data, error } = await supabase
    .from('products')
    .update(updateData)
    .eq('id', id)
    .select('*')
    .single()

  if (error || !data) return { data: null, error }
  return { data: rowToProduct(data as ProductRow), error: null }
}

// ─── DELETE: Hapus produk (admin only) ────────────────────────
export const deleteProductById = async (id: string): Promise<{ error: any }> => {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id)
  return { error }
}
