// Mapper pour convertir les données Supabase (snake_case) en format frontend (camelCase)

export function mapProduct(product: any) {
  if (!product) return null
  
  return {
    id: product.id,
    storeId: product.store_id,
    userId: product.user_id,
    title: product.title,
    slug: product.slug,
    description: product.description,
    shortDescription: product.short_description,
    price: product.price,
    category: product.category,
    status: product.status,
    isPlatformProduct: product.is_platform_product,
    isPremiumOnly: product.is_premium_only,
    fileUrl: product.file_url,
    fileSize: product.file_size,
    fileType: product.file_type,
    thumbnailUrl: product.thumbnail_url,
    previewImages: product.preview_images,
    tags: product.tags,
    averageRating: product.average_rating,
    reviewCount: product.review_count,
    purchaseCount: product.purchase_count,
    viewCount: product.view_count,
    createdAt: product.created_at,
    updatedAt: product.updated_at,
    // Relations
    store: product.store,
    user: product.user,
    reviews: product.reviews,
  }
}

export function mapStore(store: any) {
  if (!store) return null
  
  return {
    id: store.id,
    userId: store.user_id,
    name: store.name,
    slug: store.slug,
    description: store.description,
    logo: store.logo,
    banner: store.banner,
    socialLinks: store.social_links,
    averageRating: store.average_rating,
    totalSales: store.total_sales,
    isActive: store.is_active,
    createdAt: store.created_at,
    updatedAt: store.updated_at,
    // Relations
    user: store.user ? {
      id: store.user.id,
      fullName: store.user.full_name,
      email: store.user.email,
      avatar: store.user.avatar,
      createdAt: store.user.created_at,
    } : null,
    products: store.products,
  }
}

export function mapUser(user: any) {
  if (!user) return null
  
  return {
    id: user.id,
    email: user.email,
    fullName: user.full_name,
    avatar: user.avatar,
    bio: user.bio,
    website: user.website,
    socialLinks: user.social_links,
    role: user.role,
    stripeCustomerId: user.stripe_customer_id,
    stripeConnectId: user.stripe_connect_id,
    trustScore: user.trust_score,
    strikes: user.strikes,
    isSuspended: user.is_suspended,
    suspendedAt: user.suspended_at,
    suspensionReason: user.suspension_reason,
    createdAt: user.created_at,
    updatedAt: user.updated_at,
  }
}
