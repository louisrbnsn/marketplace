'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Loader2, Store, Star, Package, TrendingUp, MapPin, Globe, Twitter, Instagram, Youtube } from 'lucide-react'
import ProductCard from '@/components/features/ProductCard'

interface StoreData {
  id: string
  name: string
  slug: string
  description: string | null
  logo: string | null
  banner: string | null
  averageRating: string
  totalSales: number
  user: {
    id: string
    fullName: string
    avatar: string | null
  }
  products: any[]
  socialLinks?: {
    twitter?: string
    instagram?: string
    youtube?: string
    website?: string
  }
}

export default function StoreDetailPage() {
  const params = useParams()
  const slug = params.slug as string
  const [store, setStore] = useState<StoreData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (slug) {
      fetchStore()
    }
  }, [slug])

  const fetchStore = async () => {
    try {
      const response = await fetch(`/api/stores/${slug}`)
      const data = await response.json()

      if (data.success) {
        setStore(data.data.store)
      } else {
        setError(data.error || 'Store not found')
      }
    } catch (error) {
      console.error('Error fetching store:', error)
      setError('Error loading store')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading store...</p>
        </div>
      </div>
    )
  }

  if (error || !store) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 py-12">
        <div className="container-custom">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-12">
              <Store className="w-20 h-20 text-slate-600 mx-auto mb-6" />
              <h2 className="text-3xl font-bold text-white mb-4">Store not found</h2>
              <p className="text-slate-400 mb-8">
                {error || 'This store does not exist or has been deleted'}
              </p>
              <Link href="/stores">
                <button className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-300">
                  ← Back to stores
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Banner */}
      <div className="relative h-64 bg-gradient-to-r from-blue-500/20 to-purple-500/20 overflow-hidden">
        {store.banner ? (
          <img
            src={store.banner}
            alt={store.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Store className="w-32 h-32 text-slate-700" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-950"></div>
      </div>

      {/* Store Info */}
      <div className="container-custom -mt-20 relative z-10">
        <div className="mb-8">
          <Link
            href="/stores"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to stores
          </Link>

          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Logo */}
            <div className="flex-shrink-0">
              <div className="w-32 h-32 bg-slate-800 border-4 border-slate-900 rounded-2xl overflow-hidden shadow-2xl">
                {store.logo ? (
                  <img
                    src={store.logo}
                    alt={store.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                    <Store className="w-16 h-16 text-white" />
                  </div>
                )}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-white mb-2">{store.name}</h1>
              <p className="text-slate-400 mb-4">by {store.user.fullName}</p>

              {store.description && (
                <p className="text-slate-300 mb-6 max-w-3xl">{store.description}</p>
              )}

              {/* Stats */}
              <div className="flex flex-wrap gap-6 mb-6">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                  <span className="text-white font-semibold">
                    {parseFloat(store.averageRating).toFixed(1)}
                  </span>
                  <span className="text-slate-400">average rating</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-400" />
                  <span className="text-white font-semibold">{store.totalSales}</span>
                  <span className="text-slate-400">sales</span>
                </div>
                <div className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-blue-400" />
                  <span className="text-white font-semibold">{store.products.length}</span>
                  <span className="text-slate-400">products</span>
                </div>
              </div>

              {/* Social Links */}
              {store.socialLinks && Object.keys(store.socialLinks).length > 0 && (
                <div className="flex gap-3">
                  {store.socialLinks.twitter && (
                    <a
                      href={store.socialLinks.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-400 hover:text-blue-400 hover:border-blue-400 transition-all"
                    >
                      <Twitter className="w-5 h-5" />
                    </a>
                  )}
                  {store.socialLinks.instagram && (
                    <a
                      href={store.socialLinks.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-400 hover:text-pink-400 hover:border-pink-400 transition-all"
                    >
                      <Instagram className="w-5 h-5" />
                    </a>
                  )}
                  {store.socialLinks.youtube && (
                    <a
                      href={store.socialLinks.youtube}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-400 hover:text-red-400 hover:border-red-400 transition-all"
                    >
                      <Youtube className="w-5 h-5" />
                    </a>
                  )}
                  {store.socialLinks.website && (
                    <a
                      href={store.socialLinks.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-400 hover:text-white hover:border-white transition-all"
                    >
                      <Globe className="w-5 h-5" />
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Products */}
        <div className="py-12">
          <h2 className="text-3xl font-bold text-white mb-8">Store Products</h2>
          
          {store.products.length === 0 ? (
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-12 text-center">
              <Package className="w-16 h-16 text-slate-600 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-white mb-4">No products yet</h3>
              <p className="text-slate-400">
                This store has no published products yet
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {store.products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
