import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { AuthProvider } from '@/contexts/AuthContextSupabase'
import { CartProvider } from '@/contexts/CartContext'
import { CookieProvider } from '@/contexts/CookieContext'
import CookieConsent from '@/components/ui/CookieConsent'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'Creator Marketplace - Plateforme pour créateurs',
  description: 'La plateforme professionnelle pour créateurs de contenus multimédia',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" className="dark">
      <body className={`${inter.variable} bg-slate-950`}>
        <CookieProvider>
          <AuthProvider>
            <CartProvider>
              <div className="flex flex-col min-h-screen">
                <Navbar />
                <main className="flex-1">{children}</main>
                <Footer />
              </div>
              <CookieConsent />
            </CartProvider>
          </AuthProvider>
        </CookieProvider>
      </body>
    </html>
  )
}
