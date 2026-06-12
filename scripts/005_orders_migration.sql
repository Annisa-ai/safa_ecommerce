-- ============================================================
-- Migration: orders & order_items schema enhancements
-- Tujuan: tambahkan kolom shipping_info, product_name, selected_method, customization
-- Catatan: Kolom payment dikelola di 007_payment_preparation.sql
-- ============================================================

-- ADD kolom shipping_info (JSON metadata untuk pengiriman)
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS shipping_info JSONB;

-- ADD kolom product snapshot & customization ke order_items
ALTER TABLE order_items
  ADD COLUMN IF NOT EXISTS product_name VARCHAR(255),
  ADD COLUMN IF NOT EXISTS selected_method VARCHAR(50),
  ADD COLUMN IF NOT EXISTS customization JSONB;

COMMENT ON COLUMN orders.shipping_info IS 'Shipping metadata (carrier, tracking, etc) as JSON';
COMMENT ON COLUMN order_items.product_name IS 'Snapshot of product name at order time';
COMMENT ON COLUMN order_items.selected_method IS 'Printing method selected (sablon/dtf/offset)';
COMMENT ON COLUMN order_items.customization IS 'Full customization details as JSON';
