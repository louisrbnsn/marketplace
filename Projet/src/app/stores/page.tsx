'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Search, Store, Loader2, Star, Package, TrendingUp } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContextSupabase'

interface Store {
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
}

export default function StoresPage() {
  const { user } = useAuth()
  const [stores, setStores] = useState<Store[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)

  useEffect(() => {
    fetchStores()
  }, [])

  const fetchStores = async (search?: string) => {
    setIsSearching(true)
    try {
      const url = search 
        ? `/api/stores?search=${encodeURIComponent(search)}`
        : '/api/stores'
      
      const response = await fetch(url)
      const data = await response.json()

      if (data.success) {
        setStores(data.data.stores)
      }
    } catch (error) {
      console.error('Error fetching stores:', error)
    } finally {
      setLoading(false)
      setIsSearching(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchStores(searchQuery)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Explore the <span className="bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">Stores</span>
          </h1>
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            Discover content creators and their premium resources
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for a store..."
                className="w-full px-6 py-4 bg-slate-800/80 backdrop-blur-sm border border-slate-700 rounded-2xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all pl-14"
              />
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <button
                type="submit"
                disabled={isSearching}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-300 disabled:opacity-50"
              >
                {isSearching ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  'Search'
                )}
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Stores Grid */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
                <p className="text-slate-400">Loading stores...</p>
              </div>
            </div>
          ) : stores.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                <Store className="w-10 h-10 text-slate-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">No stores found</h2>
              <p className="text-slate-400 mb-8">
                {searchQuery ? 'Try different search terms' : 'Stores will appear here soon'}
              </p>
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery('')
                    fetchStores()
                  }}
                  className="px-6 py-3 bg-slate-700 border border-slate-600 text-white font-semibold rounded-lg hover:bg-slate-600 transition-all"
                >
                  View all stores
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-white">
                  {searchQuery ? `Results for "${searchQuery}"` : 'All stores'}
                </h2>
                <p className="text-slate-400">{stores.length} store{stores.length > 1 ? 's' : ''}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {stores.map((store) => (
                  <Link key={store.id} href={`/stores/${store.slug}`}>
                    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl overflow-hidden hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300 group">
                      {/* Banner */}
                      <div className="h-32 bg-gradient-to-r from-blue-500/20 to-purple-500/20 relative overflow-hidden">
                        {store.banner ? (
                          <img
                            src={store.banner}
                            alt={store.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Store className="w-12 h-12 text-slate-600" />
                          </div>
                        )}
                        
                        {/* Logo */}
                        <div className="absolute -bottom-10 left-6">
                          <div className="w-20 h-20 bg-slate-800 border-4 border-slate-900 rounded-xl overflow-hidden">
                            {store.logo ? (
                              <img
                                src={store.logo}
                                alt={store.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                                <Store className="w-8 h-8 text-white" />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-6 pt-14">
                        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
                          {store.name}
                        </h3>
                        
                        <p className="text-sm text-slate-400 mb-4">
                          by {store.user.fullName}
                        </p>

                        {store.description && (
                          <p className="text-slate-300 text-sm mb-4 line-clamp-2">
                            {store.description}
                          </p>
                        )}

                        {/* Stats */}
                        <div className="flex items-center gap-4 text-sm text-slate-400">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                            <span>{parseFloat(store.averageRating).toFixed(1)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <TrendingUp className="w-4 h-4 text-green-400" />
                            <span>{store.totalSales} sales</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Call to Action */}
              {!searchQuery && (
                <div className="mt-16 text-center bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-12">
                  <Store className="w-16 h-16 text-blue-400 mx-auto mb-6" />
                  <h3 className="text-2xl font-bold text-white mb-4">
                    Are you a creator?
                  </h3>
                  <p className="text-slate-400 mb-8 max-w-md mx-auto">
                    Create your store and start selling your creations today
                  </p>
                  <Link href="/dashboard/store/create">
                    <button className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-300">
                      Create my store
                    </button>
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  )
}
