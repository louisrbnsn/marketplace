import type { users, stores, products, orders, reviews, subscriptions } from '@/lib/db/schema'

// User types
export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
export type UserRole = 'buyer' | 'seller' | 'premium' | 'admin'

// Store types
export type Store = typeof stores.$inferSelect
export type NewStore = typeof stores.$inferInsert

// Product types
export type Product = typeof products.$inferSelect
export type NewProduct = typeof products.$inferInsert
export type ProductStatus = 'draft' | 'pending_validation' | 'published' | 'rejected' | 'suspended'
export type ProductCategory = 'lut' | 'preset' | 'sfx' | 'template' | 'pack' | 'overlay' | 'other'

// Order types
export type Order = typeof orders.$inferSelect
export type NewOrder = typeof orders.$inferInsert
export type OrderStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'refunded'

// Review types
export type Review = typeof reviews.$inferSelect
export type NewReview = typeof reviews.$inferInsert

// Subscription types
export type Subscription = typeof subscriptions.$inferSelect
export type NewSubscription = typeof subscriptions.$inferInsert
export type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'trialing'

// Auth types
export interface AuthUser {
  id: string
  email: string
  fullName: string
  role: UserRole
  avatar: string | null
  isEmailVerified: boolean
}

export interface JWTPayload {
  userId: string
  email: string
  role: UserRole
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    total: number
    page: number
    pageSize: number
    totalPages: number
  }
}

// Product with relations
export interface ProductWithStore extends Product {
  store?: Store | null
}

export interface ProductWithReviews extends Product {
  reviews: Review[]
}

// Dashboard types
export interface SellerStats {
  totalRevenue: number
  netRevenue: number
  totalCommission: number
  totalSales: number
  totalProducts: number
  totalViews: number
  conversionRate: number
}

export interface AdminStats {
  totalUsers: number
  totalStores: number
  totalProducts: number
  totalOrders: number
  totalRevenue: number
  commissionRevenue: number
  subscriptionRevenue: number
  featuredRevenue: number
}

// Filter types
export interface ProductFilters {
  category?: ProductCategory
  minPrice?: number
  maxPrice?: number
  minRating?: number
  featured?: boolean
  premiumOnly?: boolean
  sortBy?: 'recent' | 'price-asc' | 'price-desc' | 'rating' | 'popular'
  search?: string
}
