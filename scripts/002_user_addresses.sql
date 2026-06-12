-- ============================================================
-- Migration: user_addresses
-- Tabel untuk menyimpan alamat pengiriman user
-- Kompatibel dengan Supabase PostgreSQL
-- ============================================================

-- Enable UUID extension (sudah aktif di Supabase by default)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- Tabel: user_addresses
-- ============================================================
CREATE TABLE IF NOT EXISTS user_addresses (
  id            UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Relasi ke auth.users (Supabase Auth) atau tabel users lokal
  -- Gunakan UUID agar kompatibel dengan Supabase Auth
  user_id       INTEGER          NOT NULL,

  -- Label singkat: "Rumah", "Kantor", "Gudang", dll.
  label         VARCHAR(50)   NOT NULL DEFAULT 'Rumah',

  -- Info penerima
  recipient_name VARCHAR(100) NOT NULL,
  phone         VARCHAR(20)   NOT NULL,

  -- Lokasi
  province      VARCHAR(100)  NOT NULL,
  city          VARCHAR(100)  NOT NULL,
  district      VARCHAR(100)  NOT NULL,
  postal_code   VARCHAR(10)   NOT NULL,
  full_address  TEXT          NOT NULL,
  landmark      TEXT          NULL,         -- patokan / catatan tambahan

  -- Alamat utama
  is_default    BOOLEAN       NOT NULL DEFAULT FALSE,

  -- Timestamps
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- ============================================================
-- Foreign Key
-- Uncomment salah satu sesuai setup project:
--
-- Opsi A: Supabase Auth (auth.users) — direkomendasikan
ALTER TABLE user_addresses
  ADD CONSTRAINT fk_user_addresses_user
  FOREIGN KEY (user_id)
  REFERENCES users (id)
  ON DELETE CASCADE;
--
-- Opsi B: Tabel users lokal (jika tidak pakai Supabase Auth)
-- ALTER TABLE user_addresses
--   ADD CONSTRAINT fk_user_addresses_user
--   FOREIGN KEY (user_id)
--   REFERENCES users (id)
--   ON DELETE CASCADE;
-- ============================================================

-- ============================================================
-- Constraint: hanya satu is_default=true per user
-- Menggunakan partial unique index
-- ============================================================
CREATE UNIQUE INDEX idx_one_default_per_user
  ON user_addresses (user_id)
  WHERE is_default = TRUE;

-- ============================================================
-- Indexes untuk performa query
-- ============================================================
CREATE INDEX idx_user_addresses_user_id
  ON user_addresses (user_id);

CREATE INDEX idx_user_addresses_is_default
  ON user_addresses (user_id, is_default);

-- ============================================================
-- Fungsi: auto-update updated_at saat row diupdate
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_user_addresses_updated_at
  BEFORE UPDATE ON user_addresses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- Fungsi: pastikan hanya satu is_default=true per user
-- Jika alamat baru di-set sebagai default, unset yang lain
-- ============================================================
CREATE OR REPLACE FUNCTION ensure_single_default_address()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_default = TRUE THEN
    UPDATE user_addresses
    SET    is_default = FALSE
    WHERE  user_id = NEW.user_id
      AND  id      <> NEW.id
      AND  is_default = TRUE;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_single_default_address
  BEFORE INSERT OR UPDATE OF is_default ON user_addresses
  FOR EACH ROW
  WHEN (NEW.is_default = TRUE)
  EXECUTE FUNCTION ensure_single_default_address();

-- ============================================================
-- Komentar tabel & kolom (dokumentasi di Supabase Studio)
-- ============================================================
COMMENT ON TABLE  user_addresses               IS 'Daftar alamat pengiriman milik user';
COMMENT ON COLUMN user_addresses.id            IS 'Primary key UUID';
COMMENT ON COLUMN user_addresses.user_id       IS 'Relasi ke auth.users.id (Supabase Auth)';
COMMENT ON COLUMN user_addresses.label         IS 'Label alamat: Rumah, Kantor, dsb.';
COMMENT ON COLUMN user_addresses.recipient_name IS 'Nama penerima paket';
COMMENT ON COLUMN user_addresses.phone         IS 'Nomor HP penerima';
COMMENT ON COLUMN user_addresses.province      IS 'Provinsi';
COMMENT ON COLUMN user_addresses.city          IS 'Kota / Kabupaten';
COMMENT ON COLUMN user_addresses.district      IS 'Kecamatan';
COMMENT ON COLUMN user_addresses.postal_code   IS 'Kode pos';
COMMENT ON COLUMN user_addresses.full_address  IS 'Alamat lengkap (nama jalan, nomor, RT/RW)';
COMMENT ON COLUMN user_addresses.landmark      IS 'Patokan atau catatan tambahan (opsional)';
COMMENT ON COLUMN user_addresses.is_default    IS 'Alamat utama — hanya boleh satu per user';
COMMENT ON COLUMN user_addresses.created_at    IS 'Waktu dibuat (timezone aware)';
COMMENT ON COLUMN user_addresses.updated_at    IS 'Waktu terakhir diupdate (auto-update via trigger)';
