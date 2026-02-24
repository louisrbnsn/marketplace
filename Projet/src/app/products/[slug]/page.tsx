'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Loader2, Package, Star, ShoppingCart, Download, Eye, Heart, Sparkles, Store as StoreIcon } from 'lucide-react'
import { useCart } from '@/contexts/CartContext'
import { useAuth } from '@/contexts/AuthContextSupabase'
import { normalizeImageUrl } from '@/utils/helpers'
import ReviewSection from '@/components/features/ReviewSection'

interface ProductData {
  id: string
  title: string
  slug: string
  description: string
  shortDescription: string | null
  price: number
  category: string
  status: string
  isPremiumOnly: boolean
  thumbnailUrl: string | null
  fileUrl: string | null
  fileSize: number | null
  fileType: string | null
  tags: string[]
  viewCount: number
  downloadCount: number
  purchaseCount: number
  averageRating: string
  reviewCount: number
  createdAt: string
  store: {
    id: string
    name: string
    slug: string
    logo: string | null
    banner: string | null
    description: string | null
    averageRating: string
    totalSales: number
  } | null
  user: {
    id: string
    fullName: string
    avatar: string | null
  }
  reviews: Array<{
    id: string
    rating: number
    comment: string | null
    createdAt: string
    user: {
      id: string
      fullName: string
      avatar: string | null
    }
  }>
}

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string
  const { user } = useAuth()
  const { addItem, items } = useCart()
  const [product, setProduct] = useState<ProductData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const isInCart = items.some(item => item.id === product?.id)

  useEffect(() => {
    if (slug) {
      fetchProduct()
    }
  }, [slug])

  const fetchProduct = async () => {
    try {
      const response = await fetch(`/api/products/${slug}`)
      const data = await response.json()

      if (data.success) {
        setProduct(data.data.product)
      } else {
        setError(data.error || 'Product not found')
      }
    } catch (error) {
      console.error('Error fetching product:', error)
      setError('Error loading product')
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = () => {
    if (!product) return
    addItem({
      id: product.id,
      title: product.title,
      price: product.price,
      thumbnailUrl: product.thumbnailUrl,
      storeId: product.store?.id || null,
      storeName: product.store?.name,
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading product...</p>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 py-12">
        <div className="container-custom">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-12">
              <Package className="w-20 h-20 text-slate-600 mx-auto mb-6" />
              <h2 className="text-3xl font-bold text-white mb-4">Product not found</h2>
              <p className="text-slate-400 mb-8">
                {error || 'This product does not exist or has been deleted'}
              </p>
              <Link href="/products">
                <button className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-300">
                  ← Back to products
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 py-12">
      <div className="container-custom">
        {/* Back button */}
        <Link
          href="/products"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to products
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left column - Image */}
          <div className="space-y-6">
            <div className="relative aspect-video bg-slate-800/50 border border-slate-700 rounded-2xl overflow-hidden">
              {product.thumbnailUrl ? (
                <Image
                  src={normalizeImageUrl(product.thumbnailUrl) || '/placeholder.png'}
                  alt={product.title}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-slate-600 text-center">
                    <Package className="w-16 h-16 mx-auto mb-4" />
                    <p>No preview available</p>
                  </div>
                </div>
              )}
              {product.isPremiumOnly && (
                <div className="absolute top-4 right-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-bold px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg">
                  <Sparkles className="w-4 h-4" />
                  PREMIUM
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-center">
                <Eye className="w-5 h-5 text-slate-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">{product.viewCount}</p>
                <p className="text-xs text-slate-400">Views</p>
              </div>
              <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-center">
                <Download className="w-5 h-5 text-slate-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">{product.downloadCount}</p>
                <p className="text-xs text-slate-400">Downloads</p>
              </div>
              <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-center">
                <ShoppingCart className="w-5 h-5 text-slate-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">{product.purchaseCount}</p>
                <p className="text-xs text-slate-400">Sales</p>
              </div>
            </div>
          </div>

          {/* Right column - Details */}
          <div className="space-y-6">
            {/* Category badge */}
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-blue-400 bg-blue-500/10 px-3 py-1.5 rounded-lg">
                {product.category.toUpperCase()}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-4xl font-bold text-white">{product.title}</h1>

            {/* Short description */}
            {product.shortDescription && (
              <p className="text-lg text-slate-300">{product.shortDescription}</p>
            )}

            {/* Store info */}
            {product.store && (
              <Link
                href={`/stores/${product.store.slug}`}
                className="flex items-center gap-3 p-4 bg-slate-800/50 border border-slate-700 rounded-xl hover:border-blue-500/50 transition-colors"
              >
                {product.store.logo ? (
                  <Image
                    src={product.store.logo}
                    alt={product.store.name}
                    width={48}
                    height={48}
                    className="rounded-full"
                  />
                ) : (
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <StoreIcon className="w-6 h-6 text-white" />
                  </div>
                )}
                <div>
                  <p className="text-sm text-slate-400">Sold by</p>
                  <p className="text-white font-semibold">{product.store.name}</p>
                </div>
              </Link>
            )}

            {/* Rating */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-5 h-5 ${
                        star <= Math.round(parseFloat(product.averageRating))
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-slate-600'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-white font-semibold">
                  {parseFloat(product.averageRating).toFixed(1)}
                </span>
              </div>
              <span className="text-slate-400 text-sm">
                ({product.reviewCount} {product.reviewCount > 1 ? 'reviews' : 'review'})
              </span>
            </div>

            {/* Price */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-4xl font-bold text-white">
                  €{(product.price / 100).toFixed(2)}
                </span>
              </div>

              {/* Add to cart button */}
              <button
                onClick={handleAddToCart}
                disabled={isInCart}
                className={`w-full px-6 py-4 rounded-xl font-semibold text-lg transition-all duration-300 flex items-center justify-center gap-2 ${
                  isInCart
                    ? 'bg-green-500 text-white cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:shadow-lg hover:shadow-blue-500/50'
                }`}
              >
                <ShoppingCart className="w-5 h-5" />
                {isInCart ? 'Added to cart' : 'Add to cart'}
              </button>
            </div>

            {/* Tags */}
            {product.tags && product.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-slate-700 text-slate-300 text-sm rounded-lg"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        <div className="mt-12 bg-slate-800/50 border border-slate-700 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-white mb-6">Description</h2>
          <div className="text-slate-300 whitespace-pre-wrap leading-relaxed">
            {product.description}
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-12 bg-slate-800/50 border border-slate-700 rounded-2xl p-8">
          <ReviewSection productId={product.id} />
        </div>
      </div>
    </div>
  )
}
