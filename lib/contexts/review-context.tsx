'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import type { Review } from '@/lib/types'

const STORAGE_KEY = 'safa_reviews'

interface ReviewContextType {
  reviews: Review[]
  addReview: (r: Omit<Review, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateReview: (id: string, updates: Partial<Review>) => void
  deleteReview: (id: string) => void
  toggleVisibility: (id: string) => void
  getReviewByOrderId: (orderId: string) => Review | undefined
  getReviewsByProductId: (productId: string) => Review[]
  getProductStats: (productId: string) => { avg: number; count: number }
  getAllVisible: () => Review[]
}

const ReviewContext = createContext<ReviewContextType | undefined>(undefined)

function load(): Review[] {
  if (typeof window === 'undefined') return []
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') } catch { return [] }
}
function save(data: Review[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)) } catch {}
}

export function ReviewProvider({ children }: { children: React.ReactNode }) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => { setReviews(load()); setHydrated(true) }, [])
  useEffect(() => { if (hydrated) save(reviews) }, [reviews, hydrated])

  const addReview = useCallback((r: Omit<Review, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString()
    const newR: Review = { ...r, id: `rev_${Date.now()}`, createdAt: now, updatedAt: now }
    setReviews(prev => [newR, ...prev])
  }, [])

  const updateReview = useCallback((id: string, updates: Partial<Review>) => {
    setReviews(prev => prev.map(r =>
      r.id === id ? { ...r, ...updates, updatedAt: new Date().toISOString() } : r
    ))
  }, [])

  const deleteReview = useCallback((id: string) => {
    setReviews(prev => prev.map(r => r.id === id ? { ...r, isVisible: false } : r))
  }, [])

  const toggleVisibility = useCallback((id: string) => {
    setReviews(prev => prev.map(r => r.id === id ? { ...r, isVisible: !r.isVisible } : r))
  }, [])

  const getReviewByOrderId = useCallback((orderId: string) =>
    reviews.find(r => r.orderId === orderId), [reviews])

  const getReviewsByProductId = useCallback((productId: string) =>
    reviews.filter(r => r.productId === productId && r.isVisible), [reviews])

  const getProductStats = useCallback((productId: string) => {
    const list = reviews.filter(r => r.productId === productId && r.isVisible)
    if (!list.length) return { avg: 0, count: 0 }
    return { avg: list.reduce((s, r) => s + r.rating, 0) / list.length, count: list.length }
  }, [reviews])

  const getAllVisible = useCallback(() => reviews.filter(r => r.isVisible), [reviews])

  return (
    <ReviewContext.Provider value={{
      reviews, addReview, updateReview, deleteReview, toggleVisibility,
      getReviewByOrderId, getReviewsByProductId, getProductStats, getAllVisible,
    }}>
      {children}
    </ReviewContext.Provider>
  )
}

export function useReviews() {
  const ctx = useContext(ReviewContext)
  if (!ctx) throw new Error('useReviews must be used within ReviewProvider')
  return ctx
}
