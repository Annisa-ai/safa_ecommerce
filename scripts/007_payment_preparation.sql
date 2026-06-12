-- ============================================================
-- Migration: payment preparation
-- Tujuan: tambahkan kolom payment ke orders dan buat payment_transactions
-- ============================================================

-- Add payment summary fields to orders if missing
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
  amount DECIMAL(12,2) NOT NULL,
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
