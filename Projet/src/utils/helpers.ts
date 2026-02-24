import { type ClassValue, clsx } from 'clsx'

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

/**
 * Format price in cents to currency string
 */
export function formatPrice(cents: number): string {
  if (cents === 0) {
    return 'FREE'
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'EUR',
  }).format(cents / 100)
}

/**
 * Format file size in bytes to human readable string
 */
export function formatFileSize(bytes: number): string {
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  if (bytes === 0) return '0 Bytes'
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
}

/**
 * Generate a slug from a string
 */
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '')
}

/**
 * Calculate platform fee
 */
export function calculatePlatformFee(amount: number): number {
  const feePercentage = parseInt(process.env.PLATFORM_FEE_PERCENTAGE || '20')
  return Math.round((amount * feePercentage) / 100)
}

/**
 * Truncate text to specified length
 */
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text
  return text.slice(0, length) + '...'
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Generate random string
 */
export function randomString(length: number = 10): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

/**
 * Check if user has premium access
 */
export function hasPremiumAccess(userRole: string): boolean {
  return userRole === 'premium' || userRole === 'starter' || userRole === 'business' || userRole === 'admin'
}

/**
 * Get upload limit based on user role (in bytes)
 */
export function getUploadLimit(userRole: string): number {
  const limits = {
    user: 25 * 1024 * 1024,      // 25 MB (free)
    starter: 50 * 1024 * 1024,   // 50 MB
    premium: 200 * 1024 * 1024,  // 200 MB (Creator)
    business: 500 * 1024 * 1024, // 500 MB
    admin: 1000 * 1024 * 1024,   // 1 GB
  }
  return limits[userRole as keyof typeof limits] || limits.user
}

/**
 * Get commission percentage based on user role
 */
export function getCommissionRate(userRole: string): number {
  const rates = {
    user: 20,       // 20% (free)
    starter: 15,    // 15%
    premium: 10,    // 10% (Creator)
    business: 0,    // 0%
    admin: 0,       // 0%
  }
  return rates[userRole as keyof typeof rates] || 20
}

/**
 * Get plan name from role
 */
export function getPlanName(userRole: string): string {
  const plans = {
    user: 'Free',
    starter: 'Starter',
    premium: 'Creator',
    business: 'Business',
    admin: 'Admin',
  }
  return plans[userRole as keyof typeof plans] || 'Free'
}

/**
 * Get plan color from role
 */
export function getPlanColor(userRole: string): string {
  const colors = {
    user: 'from-slate-500 to-slate-600',
    starter: 'from-blue-500 to-cyan-500',
    premium: 'from-purple-500 to-pink-500',
    business: 'from-amber-500 to-orange-500',
    admin: 'from-red-500 to-rose-500',
  }
  return colors[userRole as keyof typeof colors] || colors.user
}

/**
 * Format date to relative time
 */
export function formatRelativeTime(date: Date): string {
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) return 'À l\'instant'
  if (diffInSeconds < 3600) return `Il y a ${Math.floor(diffInSeconds / 60)} minutes`
  if (diffInSeconds < 86400) return `Il y a ${Math.floor(diffInSeconds / 3600)} heures`
  if (diffInSeconds < 2592000) return `Il y a ${Math.floor(diffInSeconds / 86400)} jours`
  if (diffInSeconds < 31536000) return `Il y a ${Math.floor(diffInSeconds / 2592000)} mois`
  return `Il y a ${Math.floor(diffInSeconds / 31536000)} ans`
}

/**
 * Safe JSON parse
 */
export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json)
  } catch {
    return fallback
  }
}

/**
 * Get initials from name
 */
export function getInitials(name: string): string {
  const parts = name.split(' ')
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }
  return name.slice(0, 2).toUpperCase()
}

/**
 * Normalize image URL for next/image
 * Converts relative paths to absolute URLs for local storage
 */
export function normalizeImageUrl(url: string | null): string | null {
  if (!url) return null
  
  // Already an absolute URL (http/https)
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }
  
  // Already starts with / (absolute path)
  if (url.startsWith('/')) {
    return url
  }
  
  // Relative path - convert to absolute for local storage
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  return `${appUrl}/uploads/${url}`
}
