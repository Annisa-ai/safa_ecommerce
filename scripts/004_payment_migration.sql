-- ============================================================
-- Migration: payment fields for orders + payment_transactions
-- Tujuan: menambahkan metadata pembayaran ke tabel orders
--        dan membuat tabel payment_transactions untuk menyimpan riwayat transaksi.
-- ============================================================

-- Add payment summary fields to orders
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS payment_provider VARCHAR(100),
  ADD COLUMN IF NOT EXISTS payment_reference VARCHAR(200),
  ADD COLUMN IF NOT EXISTS payment_due_at TIMESTAMP,
  ADD COLUMN IF NOT EXISTS payment_paid_at TIMESTAMP,
  ADD COLUMN IF NOT EXISTS payment_details JSONB;

-- Create payment_transactions table
CREATE TABLE IF NOT EXISTS payment_transactions (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL,
  transaction_reference VARCHAR(200) NOT NULL UNIQUE,
  amount DECIMAL(12, 2) NOT NULL,
  currency VARCHAR(10) NOT NULL DEFAULT 'IDR',
  payment_method VARCHAR(100),
  payment_provider VARCHAR(100),
  payment_channel VARCHAR(100),
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  payment_details JSONB,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

-- Indexes for query performance
CREATE INDEX IF NOT EXISTS idx_payment_transactions_order_id
  ON payment_transactions(order_id);

CREATE INDEX IF NOT EXISTS idx_payment_transactions_status
  ON payment_transactions(status);

CREATE INDEX IF NOT EXISTS idx_payment_transactions_provider
  ON payment_transactions(payment_provider);

-- Trigger helper to auto-update updated_at on payment_transactions
CREATE OR REPLACE FUNCTION update_payment_transactions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_payment_transactions_updated_at ON payment_transactions;
CREATE TRIGGER trg_payment_transactions_updated_at
  BEFORE UPDATE ON payment_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_payment_transactions_updated_at();

-- Comments for documentation
COMMENT ON COLUMN orders.payment_provider IS 'Nama penyedia pembayaran atau gateway, mis. bank_transfer, e-wallet, manual';
COMMENT ON COLUMN orders.payment_reference IS 'Referensi transaksi eksternal atau invoice payment id';
COMMENT ON COLUMN orders.payment_due_at IS 'Batas waktu pembayaran untuk order yang memerlukan invoice atau pembayaran manual';
COMMENT ON COLUMN orders.payment_paid_at IS 'Waktu ketika pembayaran berhasil dikonfirmasi';
COMMENT ON COLUMN orders.payment_details IS 'Data tambahan pembayaran dalam format JSON, mis. payload gateway atau response metadata';

COMMENT ON TABLE payment_transactions IS 'Tabel riwayat transaksi pembayaran untuk order';
COMMENT ON COLUMN payment_transactions.order_id IS 'Relasi ke orders.id';
COMMENT ON COLUMN payment_transactions.transaction_reference IS 'Referensi unik transaksi dari payment gateway atau invoice';
COMMENT ON COLUMN payment_transactions.amount IS 'Jumlah yang dibayarkan untuk transaksi ini';
COMMENT ON COLUMN payment_transactions.currency IS 'Mata uang transaksi';
COMMENT ON COLUMN payment_transactions.payment_method IS 'Metode pembayaran yang dipilih, mis. bank_transfer, e-wallet';
COMMENT ON COLUMN payment_transactions.payment_provider IS 'Penyedia payment gateway atau jenis provider';
COMMENT ON COLUMN payment_transactions.payment_channel IS 'Saluran pembayaran yang lebih spesifik, mis. BCA, Gopay, ShopeePay';
COMMENT ON COLUMN payment_transactions.status IS 'Status transaksi pembayaran: pending, paid, failed, refunded, cancelled';
COMMENT ON COLUMN payment_transactions.payment_details IS 'Informasi tambahan transaksi dalam JSONB format';
COMMENT ON COLUMN payment_transactions.created_at IS 'Waktu pembuatan catatan transaksi';
COMMENT ON COLUMN payment_transactions.updated_at IS 'Waktu terakhir catatan transaksi diupdate';
