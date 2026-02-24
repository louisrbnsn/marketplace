import { z } from 'zod'

// Auth validation schemas
export const registerSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z
    .string()
    .min(8, 'Password must contain at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  fullName: z.string().min(2, 'Name must contain at least 2 characters'),
})

export const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
})

// Store validation schemas
export const createStoreSchema = z.object({
  name: z.string().min(3, 'Name must contain at least 3 characters'),
  slug: z
    .string()
    .min(3, 'Slug must contain at least 3 characters')
    .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers and dashes'),
  description: z.string().max(1000, 'Description cannot exceed 1000 characters').optional(),
  logo: z.string().url('Invalid URL').optional(),
  banner: z.string().url('Invalid URL').optional(),
  socialLinks: z
    .object({
      twitter: z.string().url().optional(),
      instagram: z.string().url().optional(),
      youtube: z.string().url().optional(),
      website: z.string().url().optional(),
    })
    .optional(),
})

// Product validation schemas
export const createProductSchema = z.object({
  title: z.string().min(3, 'Title must contain at least 3 characters'),
  description: z.string().min(20, 'Description must contain at least 20 characters'),
  shortDescription: z.string().max(500, 'Short description cannot exceed 500 characters').optional(),
  price: z.number().int().min(0, 'Price must be positive'),
  category: z.enum(['lut', 'preset', 'sfx', 'template', 'pack', 'overlay', 'other']),
  isPremiumOnly: z.boolean().default(false),
  tags: z.array(z.string()).max(10, 'Maximum 10 tags').optional(),
  status: z.enum(['draft', 'pending_validation', 'published', 'rejected', 'suspended']).default('draft').optional(),
})

export const updateProductSchema = createProductSchema.partial().extend({
  fileUrl: z.string().optional(),
  fileSize: z.number().int().optional(),
  fileType: z.string().optional(),
  thumbnailUrl: z.string().optional(),
})

// Review validation schemas
export const createReviewSchema = z.object({
  rating: z.number().int().min(1).max(5, 'La note doit être entre 1 et 5'),
  comment: z.string().max(1000, 'Le commentaire ne peut pas dépasser 1000 caractères').optional(),
})

// Featured product validation schemas
export const createFeaturedProductSchema = z.object({
  productId: z.string().uuid('Invalid product ID'),
  type: z.enum(['homepage', 'category']),
  category: z.enum(['lut', 'preset', 'sfx', 'template', 'pack', 'overlay', 'other']).optional(),
  duration: z.enum(['7', '30']),
})

// File upload validation
export const ALLOWED_FILE_TYPES = {
  lut: ['.cube'],
  preset: ['.xmp', '.lrtemplate'],
  sfx: ['.wav', '.mp3', '.ogg'],
  template: ['.aep', '.prproj', '.mogrt'],
  pack: ['.zip'],
  overlay: ['.png', '.jpg', '.jpeg', '.mov', '.mp4'],
  other: ['.zip'],
}

export const MAX_FILE_SIZE = 500 * 1024 * 1024 // 500MB

export const ALLOWED_IMAGE_TYPES = ['.jpg', '.jpeg', '.png', '.webp']

export function validateFileType(fileName: string, category: string): boolean {
  const extension = fileName.toLowerCase().substring(fileName.lastIndexOf('.'))
  const allowedTypes = ALLOWED_FILE_TYPES[category as keyof typeof ALLOWED_FILE_TYPES] || []
  return allowedTypes.includes(extension)
}

export function validateImageType(fileName: string): boolean {
  const extension = fileName.toLowerCase().substring(fileName.lastIndexOf('.'))
  return ALLOWED_IMAGE_TYPES.includes(extension)
}
