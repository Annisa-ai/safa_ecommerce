-- ============================================================
-- Rollback: user_addresses
-- Jalankan ini untuk membatalkan migration 002
-- ============================================================

-- Hapus policies RLS
DROP POLICY IF EXISTS "user_addresses_select_own"  ON user_addresses;
DROP POLICY IF EXISTS "user_addresses_insert_own"  ON user_addresses;
DROP POLICY IF EXISTS "user_addresses_update_own"  ON user_addresses;
DROP POLICY IF EXISTS "user_addresses_delete_own"  ON user_addresses;
DROP POLICY IF EXISTS "user_addresses_admin_all"   ON user_addresses;

-- Hapus triggers
DROP TRIGGER IF EXISTS trg_user_addresses_updated_at ON user_addresses;
DROP TRIGGER IF EXISTS trg_single_default_address    ON user_addresses;

-- Hapus functions
DROP FUNCTION IF EXISTS update_updated_at_column();
DROP FUNCTION IF EXISTS ensure_single_default_address();

-- Hapus indexes
DROP INDEX IF EXISTS idx_one_default_per_user;
DROP INDEX IF EXISTS idx_user_addresses_user_id;
DROP INDEX IF EXISTS idx_user_addresses_is_default;

-- Hapus tabel
DROP TABLE IF EXISTS user_addresses;
