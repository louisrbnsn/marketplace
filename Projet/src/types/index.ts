// ============================================================================
// DATABASE TYPES (from Supabase schema)
// ============================================================================

export type UserRole = 'buyer' | 'seller' | 'premium' | 'admin'
export type ProductStatus = 'draft' | 'pending_validation' | 'published' | 'rejected' | 'suspended'
export type ProductCategory = 'lut' | 'preset' | 'sfx' | 'template' | 'pack' | 'overlay' | 'other'
export type OrderStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'refunded'
export type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'trialing'

// User types
export interface User {
  id: string
  email: string
  full_name: string
  avatar: string | null
  bio: string | null
  website: string | null
  role: UserRole
  stripe_customer_id: string | null
  stripe_connect_id: string | null
  is_email_verified: boolean
  email_verification_token: string | null
  reset_password_token: string | null
  reset_password_expires: string | null
  created_at: string
  updated_at: string
}

export type NewUser = Omit<User, 'id' | 'created_at' | 'updated_at'>

// Store types
export interface Store {
  id: string
  user_id: string
  name: string
  slug: string
  description: string | null
  logo: string | null
  banner: string | null
  website: string | null
  social_links: any | null
  created_at: string
  updated_at: string
}

export type NewStore = Omit<Store, 'id' | 'created_at' | 'updated_at'>

// Product types
export interface Product {
  id: string
  user_id: string
  store_id: string | null
  title: string
  slug: string
  description: string | null
  category: ProductCategory
  tags: string[] | null
  price: number
  is_premium_only: boolean
  file_url: string | null
  file_size: number | null
  download_count: number
  view_count: number
  purchase_count: number
  average_rating: number | null
  review_count: number
  status: ProductStatus
  thumbnail_url: string | null
  preview_images: string[] | null
  demo_url: string | null
  created_at: string
  updated_at: string
}

export type NewProduct = Omit<Product, 'id' | 'created_at' | 'updated_at'>

// Order types
export interface Order {
  id: string
  buyer_id: string
  total_amount: number
  platform_fee: number
  status: OrderStatus
  stripe_payment_intent_id: string | null
  stripe_charge_id: string | null
  completed_at: string | null
  created_at: string
  updated_at: string
}

export type NewOrder = Omit<Order, 'id' | 'created_at' | 'updated_at'>

// Review types
export interface Review {
  id: string
  user_id: string
  product_id: string
  rating: number
  comment: string | null
  created_at: string
  updated_at: string
}

export type NewReview = Omit<Review, 'id' | 'created_at' | 'updated_at'>

// Subscription types
export interface Subscription {
  id: string
  user_id: string
  stripe_subscription_id: string | null
  plan: string
  status: SubscriptionStatus
  current_period_start: string | null
  current_period_end: string | null
  canceled_at: string | null
  created_at: string
  updated_at: string
}

export type NewSubscription = Omit<Subscription, 'id' | 'created_at' | 'updated_at'>

// Auth types
export interface AuthUser {
  id: string
  email: string
  full_name: string
  role: UserRole
  avatar: string | null
  is_email_verified: boolean
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
