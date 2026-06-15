'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client'
import type { User, AuthSession } from '@/lib/types'

interface AuthContextType {
  session: AuthSession
  user: User | null
  isLoading: boolean

  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, fullName: string) => Promise<void>
  loginWithGoogle: () => Promise<void>
  logout: () => Promise<void>

  isAuthenticated: boolean
  isAdmin: boolean

  // OPTIONAL biar file lain gak error build
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>
  changeEmail: (newEmail: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

/* =========================
   MAPPER USER SUPABASE
========================= */
function mapUser(user: any): User {
  return {
    id: user.id,
    email: user.email ?? '',
    fullName:
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      user.email?.split('@')[0] ||
      'User',
    role: user.user_metadata?.role || 'customer',
    status: 'active',
    createdAt: new Date(user.created_at ?? Date.now()),
    updatedAt: new Date(),
  }
}

function mapSession(session: any): AuthSession {
  return {
    user: session?.user ? mapUser(session.user) : null,
    isLoggedIn: !!session?.user,
    isAdmin: session?.user?.user_metadata?.role === 'admin',
    token: session?.access_token ?? null,
  }
}

/* =========================
   PROVIDER
========================= */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<AuthSession>({
    user: null,
    isLoggedIn: false,
    isAdmin: false,
    token: null,
  })

  const [isLoading, setIsLoading] = useState(true)

  /* =========================
     INIT SESSION
  ========================= */
  useEffect(() => {
    const init = async () => {
      setIsLoading(true)

      if (!isSupabaseConfigured) {
        setIsLoading(false)
        return
      }

      const { data } = await supabase.auth.getSession()

      if (data.session) {
        setSession(mapSession(data.session))
      }

      setIsLoading(false)
    }

    init()

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session) {
          setSession(mapSession(session))
        } else {
          setSession({
            user: null,
            isLoggedIn: false,
            isAdmin: false,
            token: null,
          })
        }
      }
    )

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  /* =========================
     LOGIN
  ========================= */
  const login = async (email: string, password: string) => {
    setIsLoading(true)

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    setIsLoading(false)

    if (error) throw error
    if (data.session) setSession(mapSession(data.session))
  }

  /* =========================
     REGISTER
  ========================= */
  const register = async (
    email: string,
    password: string,
    fullName: string
  ) => {
    setIsLoading(true)

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: 'customer',
        },
      },
    })

    setIsLoading(false)

    if (error) throw error

    // kalau auto login aktif
    if (data.session) {
      setSession(mapSession(data.session))
    }
  }

  /* =========================
     GOOGLE LOGIN
  ========================= */
  const loginWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    })

    if (error) throw error
  }

  /* =========================
     LOGOUT
  ========================= */
  const logout = async () => {
    await supabase.auth.signOut()

    setSession({
      user: null,
      isLoggedIn: false,
      isAdmin: false,
      token: null,
    })
  }

  /* =========================
     DUMMY (biar build gak error)
  ========================= */
  const changePassword = async () => {
    throw new Error('Not implemented')
  }

  const changeEmail = async () => {
    throw new Error('Not implemented')
  }

  return (
    <AuthContext.Provider
      value={{
        session,
        user: session.user,
        isLoading,

        login,
        register,
        loginWithGoogle,
        logout,

        isAuthenticated: session.isLoggedIn,
        isAdmin: session.isAdmin,

        changePassword,
        changeEmail,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

/* =========================
   HOOK
========================= */
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}