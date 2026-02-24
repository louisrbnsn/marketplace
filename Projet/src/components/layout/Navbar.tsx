'use client'

import Link from 'next/link'
import { useState, useRef, useEffect } from 'react'
import { Menu, X, User, ShoppingCart, Search, Sparkles, LogOut, LayoutDashboard, Settings, ChevronDown } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContextSupabase'
import { useCart } from '@/contexts/CartContext'

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const userMenuRef = useRef<HTMLDivElement>(null)
  const searchModalRef = useRef<HTMLDivElement>(null)
  const { user, loading, logout } = useAuth()
  const { itemCount } = useCart()

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false)
      }
      if (searchModalRef.current && !searchModalRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false)
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsSearchOpen(false)
        setIsUserMenuOpen(false)
      }
    }

    if (isUserMenuOpen || isSearchOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleEscape)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isUserMenuOpen, isSearchOpen])

  const handleLogout = async () => {
    await logout()
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      window.location.href = `/products?search=${encodeURIComponent(searchQuery)}`
      setIsSearchOpen(false)
      setSearchQuery('')
    }
  }

  return (
    <nav className="bg-slate-900/80 backdrop-blur-2xl border-b border-slate-800 sticky top-0 z-50">
      <div className="container-custom">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl hidden sm:block bg-gradient-to-r from-blue-400 to-purple-400 text-transparent bg-clip-text">
              Creator Marketplace
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            <Link
              href="/products"
              className="px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-all duration-200"
            >
              Products
            </Link>
            <Link
              href="/stores"
              className="px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-all duration-200"
            >
              Stores
            </Link>
            <Link
              href="/premium"
              className="px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-all duration-200 flex items-center gap-1"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              Premium
            </Link>
          </div>

          {/* Right side actions */}
          <div className="hidden md:flex items-center space-x-2">
            <button 
              onClick={() => setIsSearchOpen(true)}
              className="p-2.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
            >
              <Search className="h-5 w-5" />
            </button>
            <Link href="/cart">
              <button className="p-2.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all relative">
                <ShoppingCart className="h-5 w-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[20px] h-5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full text-xs text-white flex items-center justify-center font-semibold px-1.5">
                    {itemCount}
                  </span>
                )}
              </button>
            </Link>
            
            {!user && (
              <>
                <Link href="/login">
                  <button className="px-4 py-2.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-all font-medium">
                    Login
                  </button>
                </Link>
                <Link href="/register">
                  <button className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-300 hover:scale-105">
                    Sign up
                  </button>
                </Link>
              </>
            )}

            {user && (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-medium">{user.fullName}</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-slate-800 border border-slate-700 rounded-xl shadow-xl overflow-hidden animate-slide-down">
                    <div className="p-4 border-b border-slate-700">
                      <p className="text-white font-semibold">{user.fullName}</p>
                      <p className="text-slate-400 text-sm">{user.email}</p>
                    </div>
                    <div className="py-2">
                      <Link href="/dashboard">
                        <button className="w-full px-4 py-2.5 text-left text-slate-300 hover:text-white hover:bg-slate-700 transition-all flex items-center gap-3">
                          <LayoutDashboard className="w-4 h-4" />
                          Dashboard
                        </button>
                      </Link>
                      <Link href="/profile">
                        <button className="w-full px-4 py-2.5 text-left text-slate-300 hover:text-white hover:bg-slate-700 transition-all flex items-center gap-3">
                          <Settings className="w-4 h-4" />
                          Settings
                        </button>
                      </Link>
                    </div>
                    <div className="border-t border-slate-700 py-2">
                      <button
                        onClick={handleLogout}
                        className="w-full px-4 py-2.5 text-left text-red-400 hover:text-red-300 hover:bg-slate-700 transition-all flex items-center gap-3"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-800 animate-slide-down">
            <div className="flex flex-col space-y-2">
              <Link
                href="/products"
                className="px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
              >
                Products
              </Link>
              <Link
                href="/stores"
                className="px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
              >
                Stores
              </Link>
              <Link
                href="/premium"
                className="px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-all flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                Premium
              </Link>
              
              {user ? (
                <div className="px-4 pt-4 space-y-2 border-t border-slate-800 mt-2">
                  <div className="px-4 py-3 bg-slate-800 rounded-lg">
                    <p className="text-white font-semibold text-sm">{user.fullName}</p>
                    <p className="text-slate-400 text-xs">{user.email}</p>
                  </div>
                  <Link href="/dashboard" className="block">
                    <button className="w-full px-4 py-3 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-all font-medium flex items-center gap-2">
                      <LayoutDashboard className="w-4 h-4" />
                      Dashboard
                    </button>
                  </Link>
                  <Link href="/profile" className="block">
                    <button className="w-full px-4 py-3 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-all font-medium flex items-center gap-2">
                      <Settings className="w-4 h-4" />
                      Settings
                    </button>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-3 text-red-400 hover:text-red-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition-all font-medium flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              ) : (
                <div className="px-4 pt-4 space-y-2 border-t border-slate-800 mt-2">
                  <Link href="/login" className="block">
                    <button className="w-full px-4 py-3 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-all font-medium">
                      Login
                    </button>
                  </Link>
                  <Link href="/register" className="block">
                    <button className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-lg transition-all">
                      Sign up
                    </button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Search Modal */}
      {isSearchOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-start justify-center pt-32 px-4">
          <div ref={searchModalRef} className="w-full max-w-2xl">
            <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden">
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for products..."
                  autoFocus
                  className="w-full px-6 py-5 bg-transparent border-none text-white placeholder-slate-400 focus:outline-none text-lg"
                />
                <button
                  type="submit"
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-white transition-colors"
                >
                  <Search className="w-6 h-6" />
                </button>
              </form>
              <div className="border-t border-slate-700 p-4">
                <p className="text-sm text-slate-400 text-center">
                  Press Esc to close
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
