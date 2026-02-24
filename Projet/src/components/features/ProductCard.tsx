'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Star, ShoppingCart, Sparkles } from 'lucide-react'
import { useCart } from '@/contexts/CartContext'
import { formatPrice, normalizeImageUrl } from '@/utils/helpers'
import type { Product } from '@/types'

interface ProductCardProps {
  product: Product & {
    store?: {
      name: string
      slug: string
      logo: string | null
    } | null
  }
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem, items } = useCart()
  const isInCart = items.some(item => item.id === product.id)

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      title: product.title,
      price: product.price,
      thumbnailUrl: product.thumbnailUrl || null,
      storeId: product.storeId,
      storeName: product.store?.name,
    })
  }

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl overflow-hidden hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300 group">
      {/* Thumbnail */}
      <Link href={`/products/${product.slug}`}>
        <div className="relative aspect-video bg-slate-900/50 overflow-hidden">
          {product.thumbnailUrl ? (
            <Image
              src={normalizeImageUrl(product.thumbnailUrl) || '/placeholder.png'}
              alt={product.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-slate-600 text-center">
                <ShoppingCart className="w-12 h-12 mx-auto mb-2" />
                <p className="text-sm">No preview</p>
              </div>
            </div>
          )}
          {product.isPremiumOnly && (
            <div className="absolute top-3 right-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-lg">
              <Sparkles className="w-3 h-3" />
              PREMIUM
            </div>
          )}
        </div>
      </Link>

      {/* Content */}
      <div className="p-5">
        {/* Category badge */}
        <span className="text-xs font-semibold text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-lg">
          {product.category.toUpperCase()}
        </span>

        {/* Title */}
        <Link href={`/products/${product.slug}`}>
          <h3 className="font-bold text-lg mt-3 line-clamp-2 text-white group-hover:text-blue-400 transition-colors">
            {product.title}
          </h3>
        </Link>

        {/* Store info */}
        {product.store && (
          <Link
            href={`/stores/${product.store.slug}`}
            className="flex items-center space-x-2 mt-3 text-sm text-slate-400 hover:text-blue-400 transition-colors"
          >
            {product.store.logo ? (
              <Image
                src={product.store.logo}
                alt={product.store.name}
                width={20}
                height={20}
                className="rounded-full"
              />
            ) : (
              <div className="w-5 h-5 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full"></div>
            )}
            <span>{product.store.name}</span>
          </Link>
        )}

        {/* Rating */}
        <div className="flex items-center space-x-1 mt-3">
          <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
          <span className="text-sm font-semibold text-white">
            {parseFloat(product.averageRating || '0').toFixed(1)}
          </span>
          <span className="text-xs text-slate-500">
            ({product.reviewCount || 0} reviews)
          </span>
        </div>

        {/* Price and action */}
        <div className="flex items-center justify-between mt-5 pt-5 border-t border-slate-700">
          <span className="font-bold text-2xl text-white">{formatPrice(product.price)}</span>
          <button
            onClick={handleAddToCart}
            disabled={isInCart}
            className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 flex items-center gap-2 ${
              isInCart
                ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:shadow-lg hover:shadow-blue-500/50 hover:scale-105'
            }`}
          >
            <ShoppingCart className="h-4 w-4" />
            {isInCart ? 'In cart' : 'Add'}
          </button>
        </div>
      </div>
    </div>
  )
}
