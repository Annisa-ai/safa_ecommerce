'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

// Chat internal sudah digantikan dengan WhatsApp
// Redirect ke dashboard
export default function AdminChatRedirect() {
  const router = useRouter()
  useEffect(() => { router.replace('/admin') }, [router])
  return null
}
