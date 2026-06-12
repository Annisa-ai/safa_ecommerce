-- ============================================================
-- Migration: Products Module → Supabase
-- Tabel: products
-- Tujuan: Migrasi data produk dari localStorage/mock-data.ts
--          ke tabel products di Supabase dengan RLS policy
-- ============================================================

-- Tabel products sudah ada dari 001_create_schema.sql
-- Struktur kolom yang dipakai FE:
--   id (SERIAL)        -> map ke Product.id (string, di-cast)
--   name (VARCHAR)     -> map ke Product.name
--   description (TEXT) -> map ke Product.description
--   category (VARCHAR) -> map ke Product.category
--   print_method (VARCHAR) -> map ke Product.printMethods[0] (primary)
--   price (DECIMAL)    -> map ke Product.price
--   image_url (VARCHAR) -> map ke Product.image
--   stock_quantity (INTEGER) -> map ke Product.stock
--   status (VARCHAR)   -> 'active' | 'inactive'
--   specifications (JSONB) -> optional metadata
--   tags (VARCHAR)     -> comma-separated tags
--   created_at, updated_at -> timestamps

-- ============================================================
-- 1. Enable RLS
-- ============================================================
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 2. Policies
-- ============================================================

-- Public bisa membaca produk yang aktif
DROP POLICY IF EXISTS "products_public_read_active" ON products;
CREATE POLICY "products_public_read_active"
  ON products
  FOR SELECT
  USING (status = 'active');

-- Admin bisa membaca semua produk (untuk halaman admin)
DROP POLICY IF EXISTS "products_admin_read_all" ON products;
CREATE POLICY "products_admin_read_all"
  ON products
  FOR SELECT
  USING (
    (auth.jwt() ->> 'role') = 'admin'
    OR
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );

-- Admin bisa insert/update/delete produk
DROP POLICY IF EXISTS "products_admin_insert" ON products;
CREATE POLICY "products_admin_insert"
  ON products
  FOR INSERT
  WITH CHECK (
    (auth.jwt() ->> 'role') = 'admin'
    OR
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );

DROP POLICY IF EXISTS "products_admin_update" ON products;
CREATE POLICY "products_admin_update"
  ON products
  FOR UPDATE
  USING (
    (auth.jwt() ->> 'role') = 'admin'
    OR
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );

DROP POLICY IF EXISTS "products_admin_delete" ON products;
CREATE POLICY "products_admin_delete"
  ON products
  FOR DELETE
  USING (
    (auth.jwt() ->> 'role') = 'admin'
    OR
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );

-- ============================================================
-- 3. Trigger: auto-update updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION update_products_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_products_updated_at ON products;
CREATE TRIGGER trg_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_products_updated_at();

-- ============================================================
-- 4. Seed default products (jika tabel kosong)
--    Mapping dari lib/mock-data.ts (8 produk)
-- ============================================================
INSERT INTO products (name, slug, description, category, print_method, price, image_url, stock_quantity, status)
SELECT * FROM (VALUES
  ('Kaos Sablon Premium', 'kaos-sablon-premium', 'Kaos berkualitas tinggi dengan sablon custom. Cocok untuk souvenir, merchandise, atau kebutuhan corporate.', 'kaos', 'sablon', 50000, 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&h=500&fit=crop', 100, 'active'),
  ('Tote Bag Canvas', 'tote-bag-canvas', 'Tas belanja ramah lingkungan dengan desain custom. Material canvas tebal dan tahan lama.', 'tote', 'sablon', 75000, 'https://images.unsplash.com/photo-1590736969955-71cc94901144?w=500&h=500&fit=crop', 100, 'active'),
  ('Hoodie Sablon', 'hoodie-sablon', 'Jaket hoodie premium dengan sablon depan. Bahan tebal dan nyaman digunakan sepanjang hari.', 'hoodie', 'sablon', 120000, 'https://images.unsplash.com/photo-1556821552-5a70e0f5fdbe?w=500&h=500&fit=crop', 100, 'active'),
  ('Jersey Olahraga', 'jersey-olahraga', 'Jersey custom untuk tim olahraga atau organisasi. Bahan breathable dan nyaman untuk aktivitas intensif.', 'jersey', 'dtf', 65000, 'https://images.unsplash.com/photo-1609285055440-02d8f3d95b9a?w=500&h=500&fit=crop', 100, 'active'),
  ('Kaos Anak-Anak', 'kaos-anak-anak', 'Kaos sablon untuk anak-anak dengan desain ceria dan bahan yang aman untuk kulit sensitive.', 'kaos', 'sablon', 35000, 'https://images.unsplash.com/photo-1519046904884-53103b34b206?w=500&h=500&fit=crop', 100, 'active'),
  ('Kaos Oversized', 'kaos-oversized', 'Kaos oversized trendy dengan sablon full color. Model nyaman dan fashionable untuk casual wear.', 'kaos', 'dtf', 55000, 'https://images.unsplash.com/photo-1618886996285-fcbfac9b62d8?w=500&h=500&fit=crop', 100, 'active'),
  ('Tas Pundak Custom', 'tas-pundak-custom', 'Tas pundak dengan kapasitas sedang, cocok untuk keperluan sehari-hari dengan branding custom.', 'tote', 'sablon', 95000, 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&h=500&fit=crop', 100, 'active'),
  ('Jasa Desain Grafis', 'jasa-desain-grafis', 'Layanan desain custom untuk produk sablon Anda. Kami siap mewujudkan ide kreatif Anda menjadi karya nyata.', 'jasa', 'sablon', 150000, 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=500&h=500&fit=crop', 100, 'active')
) AS v(name, slug, description, category, print_method, price, image_url, stock_quantity, status)
WHERE NOT EXISTS (SELECT 1 FROM products WHERE products.slug = v.slug);

-- ============================================================
-- 5. Index tambahan untuk performa
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_status_category ON products(status, category);

-- ============================================================
-- 6. Dokumentasi
-- ============================================================
COMMENT ON POLICY "products_public_read_active" ON products IS 'Public dapat membaca produk yang berstatus active';
COMMENT ON POLICY "products_admin_read_all" ON products IS 'Admin dapat membaca semua produk termasuk yang inactive';
COMMENT ON POLICY "products_admin_insert" ON products IS 'Admin dapat menambah produk baru';
COMMENT ON POLICY "products_admin_update" ON products IS 'Admin dapat mengubah produk';
COMMENT ON POLICY "products_admin_delete" ON products IS 'Admin dapat menghapus produk';
