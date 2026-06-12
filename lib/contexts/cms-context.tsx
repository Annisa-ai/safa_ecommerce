'use client'

import { createContext, ReactNode, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { CMSContent } from '@/lib/types'

interface CMSContextType {
  content: CMSContent[]
  loading: boolean
  updateContent: (section: string, data: Record<string, any>) => Promise<void>
  getContent: (section: string) => Record<string, any> | undefined
}

const CMSContext = createContext<CMSContextType | undefined>(undefined)

export function CMSProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState<CMSContent[]>([])
  const [loading, setLoading] = useState(true)

  // ✅ FETCH DATA
  const fetchContent = async () => {
    try {
      setLoading(true)

      console.log('🚀 Fetching CMS...')

      const { data, error } = await supabase
        .from('cms_content')
        .select('*')

      if (error) {
        console.error('❌ Supabase fetch error:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        })
        return
      }

      console.log('✅ CMS loaded:', data)

      setContent(data || [])
    } catch (err: any) {
      console.error('❌ Unexpected fetch error:', err?.message)
    } finally {
      setLoading(false)
    }
  }

  // load pertama kali
  useEffect(() => {
    fetchContent()
  }, [])

  // ✅ UPDATE DATA
  const updateContent = async (section: string, data: Record<string, any>) => {
    try {
      const { error } = await supabase
        .from('cms_content')
        .upsert(
          {
            section_name: section,
            content: data
          },
          { onConflict: 'section_name' }
        )

      if (error) {
        console.error('❌ Supabase update error:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        })
        return
      }

      console.log('✅ CMS updated:', section)

      await fetchContent()
    } catch (err: any) {
      console.error('❌ Unexpected update error:', err?.message)
    }
  }

  // ✅ GET BY SECTION
  const getContent = (section: string) => {
    return content.find(c => c.section_name === section)?.content
  }

  return (
    <CMSContext.Provider value={{ content, loading, updateContent, getContent }}>
      {children}
    </CMSContext.Provider>
  )
}

export function useCMS() {
  const context = useContext(CMSContext)

  if (!context) {
    throw new Error('useCMS must be used within CMSProvider')
  }

  return context
}