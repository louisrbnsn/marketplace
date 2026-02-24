'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Store, Package, DollarSign, TrendingUp, Loader2, Sparkles, ShoppingBag, Users, Plus, Edit, Trash2, Mail, CheckCircle, X } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContextSupabase'
import { normalizeImageUrl } from '@/utils/helpers'

export default function DashboardPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, supabaseUser, loading } = useAuth()
  const [products, setProducts] = useState<any[]>([])
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [showEmailBanner, setShowEmailBanner] = useState(true)
  const [showVerifiedBanner, setShowVerifiedBanner] = useState(false)

  useEffect(() => {
    // Don't redirect here - let middleware handle auth protection
    if (user && user.store) {
      fetchMyProducts()
    }
    
    // Check if user just verified their email
    if (searchParams.get('verified') === 'true') {
      setShowVerifiedBanner(true)
      setTimeout(() => setShowVerifiedBanner(false), 5000)
    }
  }, [user, searchParams])

  const fetchMyProducts = async () => {
    try {
      const response = await fetch('/api/products?myProducts=true', {
        credentials: 'include',
      })
      const data = await response.json()
      if (data.success) {
        setProducts(data.data.products)
      }
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoadingProducts(false)
    }
  }

  const handleDelete = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) {
      return
    }

    setDeletingId(productId)
    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      const data = await response.json()

      if (data.success) {
        setProducts(products.filter(p => p.id !== productId))
      } else {
        alert(data.error || 'Error during deletion')
      }
    } catch (error) {
      console.error('Error deleting product:', error)
      alert('Error deleting product')
    } finally {
      setDeletingId(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading...</p>
        </div>
      </div>
    )
  }

  // Si pas d'utilisateur après le chargement, ne rien afficher (le useEffect redirige)
  if (!user) {
    return null
  }

  const hasStore = user?.store

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 py-12">
      <div className="container-custom">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">Dashboard</h1>
              <p className="text-slate-400">
                Welcome, {user?.fullName}
              </p>
            </div>
          </div>
        </div>

        {/* Email Verification Success Banner */}
        {showVerifiedBanner && (
          <div className="mb-6 bg-green-500/10 border border-green-500/20 rounded-xl p-4 flex items-center justify-between animate-slide-down">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <div>
                <p className="text-green-400 font-medium">Email verified successfully!</p>
                <p className="text-green-400/70 text-sm">Your account is now fully activated.</p>
              </div>
            </div>
            <button
              onClick={() => setShowVerifiedBanner(false)}
              className="text-green-400 hover:text-green-300 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Email Verification Reminder Banner */}
        {!supabaseUser?.email_confirmed_at && showEmailBanner && (
          <div className="mb-6 bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 flex items-center justify-between animate-slide-down">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-yellow-400" />
              <div>
                <p className="text-yellow-400 font-medium">Verify your email</p>
                <p className="text-yellow-400/70 text-sm">
                  Check your mailbox and click the confirmation link to activate all features.
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowEmailBanner(false)}
              className="text-yellow-400 hover:text-yellow-300 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {!hasStore ? (
          /* No Store - Prompt to create */
          <div className="max-w-2xl mx-auto bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-12 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Store className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">Create your store</h2>
            <p className="text-slate-400 mb-8 text-lg">
              You don&apos;t have a store yet. Create one now to
              start selling your creations!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/dashboard/store/create">
                <button className="inline-flex items-center justify-center px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-300 hover:scale-105">
                  <Store className="h-5 w-5 mr-2" />
                  Create my store
                </button>
              </Link>
              <Link href="/products">
                <button className="inline-flex items-center justify-center px-8 py-3 bg-slate-700 border border-slate-600 text-white font-semibold rounded-xl hover:bg-slate-600 transition-all duration-300">
                  Browse products
                </button>
              </Link>
            </div>
          </div>
        ) : (
          /* Has Store - Show Stats */
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 hover:border-green-500/50 hover:shadow-lg hover:shadow-green-500/10 transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-slate-400">Total Revenue</span>
                  <DollarSign className="h-5 w-5 text-green-500" />
                </div>
                <div className="text-3xl font-bold text-white mb-1">€0.00</div>
                <p className="text-xs text-slate-500">+0% this month</p>
              </div>

              <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-slate-400">Sales</span>
                  <TrendingUp className="h-5 w-5 text-blue-500" />
                </div>
                <div className="text-3xl font-bold text-white mb-1">0</div>
                <p className="text-xs text-slate-500">+0% this month</p>
              </div>

              <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-slate-400">Products</span>
                  <Package className="h-5 w-5 text-purple-500" />
                </div>
                <div className="text-3xl font-bold text-white mb-1">{products.length}</div>
                <p className="text-xs text-slate-500">{products.filter(p => p.status === 'published').length} published</p>
              </div>

              <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 hover:border-orange-500/50 hover:shadow-lg hover:shadow-orange-500/10 transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-slate-400">Views</span>
                  <Users className="h-5 w-5 text-orange-500" />
                </div>
                <div className="text-3xl font-bold text-white mb-1">0</div>
                <p className="text-xs text-slate-500">+0% this month</p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-8">
              <h2 className="text-2xl font-bold text-white mb-6">Quick Actions</h2>
              <div className="flex flex-wrap gap-4">
                <Link href="/dashboard/products/create">
                  <button className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-300">
                    <Package className="h-4 w-4 mr-2" />
                    New product
                  </button>
                </Link>
                <Link href="/dashboard/store/manage">
                  <button className="inline-flex items-center px-6 py-3 bg-slate-700 border border-slate-600 text-white font-semibold rounded-lg hover:bg-slate-600 transition-all duration-300">
                    <Store className="h-4 w-4 mr-2" />
                    Manage my store
                  </button>
                </Link>
                <Link href={`/stores/${user.store?.slug}`}>
                  <button className="inline-flex items-center px-6 py-3 bg-slate-700 border border-slate-600 text-white font-semibold rounded-lg hover:bg-slate-600 transition-all duration-300">
                    <ShoppingBag className="h-4 w-4 mr-2" />
                    View my store
                  </button>
                </Link>
              </div>
            </div>

            {/* My Products */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">My products</h2>
                <Link href="/dashboard/products/create">
                  <button className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold text-sm rounded-lg hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-300">
                    <Plus className="h-4 w-4 mr-2" />
                    Add
                  </button>
                </Link>
              </div>

              {loadingProducts ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400 mb-6">You haven't added any products yet</p>
                  <Link href="/dashboard/products/create">
                    <button className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-300">
                      <Plus className="h-5 w-5 mr-2" />
                      Create my first product
                    </button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {products.slice(0, 5).map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center gap-4 p-4 bg-slate-900/50 border border-slate-700 rounded-xl hover:border-blue-500/50 transition-all"
                    >
                      {/* Thumbnail */}
                      <div className="flex-shrink-0 w-16 h-16 bg-slate-800 rounded-lg overflow-hidden">
                        {product.thumbnailUrl ? (
                          <img
                            src={normalizeImageUrl(product.thumbnailUrl) || ''}
                            alt={product.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-6 h-6 text-slate-600" />
                          </div>
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-semibold truncate">{product.title}</h3>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-sm text-slate-400">
                            €{(product.price / 100).toFixed(2)}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded ${
                            product.status === 'published'
                              ? 'bg-green-500/10 text-green-400'
                              : product.status === 'draft'
                              ? 'bg-slate-600 text-slate-300'
                              : 'bg-yellow-500/10 text-yellow-400'
                          }`}>
                            {product.status === 'published'
                              ? 'Published'
                              : product.status === 'draft'
                              ? 'Draft'
                              : 'Pending'}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Link href={`/dashboard/products/${product.id}/edit`}>
                          <button className="p-2 text-slate-400 hover:text-blue-400 hover:bg-slate-800 rounded-lg transition-all">
                            <Edit className="w-4 h-4" />
                          </button>
                        </Link>
                        <button 
                          onClick={() => handleDelete(product.id)}
                          disabled={deletingId === product.id}
                          className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-all disabled:opacity-50"
                        >
                          {deletingId === product.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  ))}

                  {products.length > 5 && (
                    <Link href="/dashboard/products">
                      <button className="w-full py-3 text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors">
                        View all products ({products.length})
                      </button>
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
