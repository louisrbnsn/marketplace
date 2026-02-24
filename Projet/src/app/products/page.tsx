'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Search, Filter } from 'lucide-react'
import ProductCard from '@/components/features/ProductCard'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import type { Product } from '@/types'

export default function ProductsPage() {
  const searchParams = useSearchParams()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [category, setCategory] = useState('')

  useEffect(() => {
    fetchProducts()
  }, [category])

  useEffect(() => {
    const searchFromUrl = searchParams.get('search')
    if (searchFromUrl) {
      setSearch(searchFromUrl)
      fetchProducts()
    }
  }, [searchParams])

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (category) params.append('category', category)
      if (search) params.append('search', search)

      const response = await fetch(`/api/products?${params.toString()}`)
      const data = await response.json()

      if (data.success) {
        setProducts(data.data.products)
      }
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    fetchProducts()
  }

  const categories = [
    { value: '', label: 'All' },
    { value: 'lut', label: 'LUTs' },
    { value: 'preset', label: 'Presets' },
    { value: 'sfx', label: 'SFX' },
    { value: 'template', label: 'Templates' },
    { value: 'pack', label: 'Packs' },
    { value: 'overlay', label: 'Overlays' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 py-12">
      <div className="container-custom">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-5xl font-bold text-white mb-4">
            Browse <span className="bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">products</span>
          </h1>
          <p className="text-slate-300 text-lg">
            Discover thousands of quality digital content
          </p>
        </div>

        {/* Filters */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search for products..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full px-6 py-3 pl-12 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <button
                  onClick={handleSearch}
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm font-semibold rounded-lg hover:shadow-lg hover:shadow-blue-500/50 transition-all"
                >
                  Search
                </button>
              </div>
            </div>

            {/* Category filter */}
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="px-6 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            >
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="bg-gray-200 rounded-lg animate-pulse h-80"
              />
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No products found</p>
          </div>
        )}
      </div>
    </div>
  )
}
