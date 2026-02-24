'use client';

import Link from 'next/link'
import { Facebook, Twitter, Instagram, Youtube, Sparkles, Heart, Cookie } from 'lucide-react'
import { useCookieConsent } from '@/contexts/CookieContext'

export default function Footer() {
  const { openSettings } = useCookieConsent();

  return (
    <footer className="bg-slate-950 border-t border-slate-900">
      <div className="container-custom py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-white text-lg">Creator Marketplace</span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed mb-6">
              The professional platform for multimedia content creators.
            </p>
            <div className="flex space-x-3">
              <a href="#" className="w-9 h-9 bg-slate-800 hover:bg-blue-500 rounded-lg flex items-center justify-center transition-all duration-300">
                <Twitter className="h-4 w-4 text-slate-300" />
              </a>
              <a href="#" className="w-9 h-9 bg-slate-800 hover:bg-pink-500 rounded-lg flex items-center justify-center transition-all duration-300">
                <Instagram className="h-4 w-4 text-slate-300" />
              </a>
              <a href="#" className="w-9 h-9 bg-slate-800 hover:bg-red-500 rounded-lg flex items-center justify-center transition-all duration-300">
                <Youtube className="h-4 w-4 text-slate-300" />
              </a>
              <a href="#" className="w-9 h-9 bg-slate-800 hover:bg-blue-600 rounded-lg flex items-center justify-center transition-all duration-300">
                <Facebook className="h-4 w-4 text-slate-300" />
              </a>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h3 className="font-semibold text-white mb-5 text-sm uppercase tracking-wider">Shop</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/products" className="text-slate-400 hover:text-white transition-colors">
                  All products
                </Link>
              </li>
              <li>
                <Link href="/products?category=lut" className="text-slate-400 hover:text-white transition-colors">
                  LUTs
                </Link>
              </li>
              <li>
                <Link href="/products?category=preset" className="text-slate-400 hover:text-white transition-colors">
                  Presets
                </Link>
              </li>
              <li>
                <Link href="/products?category=sfx" className="text-slate-400 hover:text-white transition-colors">
                  SFX & Audio
                </Link>
              </li>
              <li>
                <Link href="/products?category=template" className="text-slate-400 hover:text-white transition-colors">
                  Templates
                </Link>
              </li>
            </ul>
          </div>

          {/* Marketplace */}
          <div>
            <h3 className="font-semibold text-white mb-5 text-sm uppercase tracking-wider">Marketplace</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/register" className="text-slate-400 hover:text-white transition-colors">
                  Start selling
                </Link>
              </li>
              <li>
                <Link href="/stores" className="text-slate-400 hover:text-white transition-colors">
                  Stores
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-slate-400 hover:text-white transition-colors">
                  Seller dashboard
                </Link>
              </li>
              <li>
                <Link href="/premium" className="text-slate-400 hover:text-white transition-colors flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  Become Premium
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold text-white mb-5 text-sm uppercase tracking-wider">Support</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/faq" className="text-slate-400 hover:text-white transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-slate-400 hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-slate-400 hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-slate-400 hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <button 
                  onClick={openSettings}
                  className="text-slate-400 hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <Cookie className="w-3.5 h-3.5" />
                  Cookie Settings
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center text-sm">
          <p className="text-slate-400">© 2026 Creator Marketplace. All rights reserved.</p>
          <p className="text-slate-400 flex items-center gap-2 mt-4 md:mt-0">
            Made with <Heart className="w-4 h-4 text-red-500" fill="currentColor" /> for creators
          </p>
        </div>
      </div>
    </footer>
  )
}
