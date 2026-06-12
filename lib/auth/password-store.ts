const STORAGE_KEY = 'safa_user_passwords'

const DEFAULT_PASSWORDS: Record<string, string> = {
  'admin@screenstudio.com': 'admin123',
  'customer@example.com': 'password123',
  'toko.online@example.com': 'password123',
}

function readStore(): Record<string, string> {
  if (typeof window === 'undefined') return {}
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}')
  } catch {
    return {}
  }
}

export function getStoredPassword(email: string): string {
  const stored = readStore()
  return stored[email] ?? DEFAULT_PASSWORDS[email] ?? ''
}

export function setStoredPassword(email: string, password: string) {
  const stored = readStore()
  stored[email] = password
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stored))
}

export function verifyPassword(email: string, password: string): boolean {
  return getStoredPassword(email) === password
}

export function migrateStoredPassword(fromEmail: string, toEmail: string) {
  const password = getStoredPassword(fromEmail)
  if (!password) return
  setStoredPassword(toEmail, password)
  const stored = readStore()
  delete stored[fromEmail]
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stored))
}

const ADMIN_EMAIL_KEY = 'safa_admin_login_email'
const DEFAULT_ADMIN_EMAIL = 'admin@screenstudio.com'

export function getAdminLoginEmail(): string {
  if (typeof window === 'undefined') return DEFAULT_ADMIN_EMAIL
  return localStorage.getItem(ADMIN_EMAIL_KEY) ?? DEFAULT_ADMIN_EMAIL
}

export function setAdminLoginEmail(email: string) {
  localStorage.setItem(ADMIN_EMAIL_KEY, email)
}
