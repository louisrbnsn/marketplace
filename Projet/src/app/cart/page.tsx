'use client'

import Link from 'next/link'
import { ShoppingCart, Trash2, ArrowLeft } from 'lucide-react'
import { useCart } from '@/contexts/CartContext'
import { normalizeImageUrl } from '@/utils/helpers'

export default function CartPage() {
  const { items, removeItem, clearCart, total } = useCart()

  const handleRemoveItem = (itemId: string, itemTitle: string) => {
    if (window.confirm(`Do you really want to remove "${itemTitle}" from your cart?`)) {
      removeItem(itemId)
    }
  }

  const handleClearCart = () => {
    if (window.confirm(`Do you really want to empty your cart? (${items.length} product${items.length > 1 ? 's' : ''})`)) {
      clearCart()
    }
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 py-12">
        <div className="container-custom">
          <div className="max-w-2xl mx-auto">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to products
            </Link>

            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-12 text-center">
              <ShoppingCart className="w-20 h-20 text-slate-600 mx-auto mb-6" />
              <h2 className="text-3xl font-bold text-white mb-4">Your cart is empty</h2>
              <p className="text-slate-400 mb-8">
                Add products to start shopping
              </p>
              <Link href="/products">
                <button className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-300">
                  Discover products
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
      <div className="container-custom max-w-5xl">
        <Link
          href="/products"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Continue shopping
        </Link>

        <h1 className="text-4xl font-bold text-white mb-8">
          My cart <span className="text-slate-500">({items.length})</span>
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 flex gap-6"
              >
                {/* Thumbnail */}
                <div className="flex-shrink-0 w-24 h-24 bg-slate-900 rounded-lg overflow-hidden">
                  {item.thumbnailUrl ? (
                    <img
                      src={normalizeImageUrl(item.thumbnailUrl) || ''}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ShoppingCart className="w-8 h-8 text-slate-600" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-1">{item.title}</h3>
                  {item.storeName && (
                    <p className="text-sm text-slate-400 mb-3">by {item.storeName}</p>
                  )}
                  <p className="text-xl font-bold text-blue-400">
                    €{(item.price / 100).toFixed(2)}
                  </p>
                </div>

                {/* Remove button */}
                <button
                  onClick={() => handleRemoveItem(item.id, item.title)}
                  className="flex-shrink-0 p-2 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded-lg transition-all"
                  title="Remove from cart"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}

            {items.length > 1 && (
              <button
                onClick={handleClearCart}
                className="w-full px-4 py-3 text-red-400 hover:text-red-300 bg-slate-800/50 border border-slate-700 hover:border-red-400 rounded-xl transition-all"
              >
                Empty cart
              </button>
            )}
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 sticky top-24">
              <h2 className="text-xl font-bold text-white mb-6">Summary</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-slate-300">
                  <span>Subtotal</span>
                  <span>€{(total / 100).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>VAT (20%)</span>
                  <span>€{(total * 0.2 / 100).toFixed(2)}</span>
                </div>
                <div className="h-px bg-slate-700"></div>
                <div className="flex justify-between text-white font-bold text-lg">
                  <span>Total</span>
                  <span>€{(total * 1.2 / 100).toFixed(2)}</span>
                </div>
              </div>

              <button className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-300 mb-4">
                Proceed to checkout
              </button>

              <p className="text-xs text-slate-500 text-center">
                Payment is secured by Stripe
              </p>

              <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <p className="text-sm text-blue-300">
                  💡 <strong>Note:</strong> Payment feature is under development
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
