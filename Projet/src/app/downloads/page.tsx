'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContextSupabase'
import Link from 'next/link'
import { Download as DownloadIcon, Package, Loader2 } from 'lucide-react'

interface Download {
  id: string
  productId: string
  orderId: string
  price: number
  isDownloaded: boolean
  downloadedAt: string | null
  purchasedAt: string
  product: {
    id: string
    title: string
    slug: string
    thumbnailUrl: string | null
    fileUrl: string | null
    fileSize: number | null
    fileType: string | null
    category: string
  }
}

export default function DownloadsPage() {
  const { user } = useAuth()
  const [downloads, setDownloads] = useState<Download[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchDownloads()
  }, [])

  const fetchDownloads = async () => {
    try {
      const response = await fetch('/api/downloads')
      if (!response.ok) {
        throw new Error('Failed to fetch downloads')
      }
      const data = await response.json()
      setDownloads(data.downloads)
    } catch (err) {
      setError('Unable to load your downloads')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async (downloadId: string, productTitle: string) => {
    try {
      const response = await fetch(`/api/downloads/${downloadId}`)
      if (!response.ok) {
        throw new Error('Download failed')
      }
      
      const data = await response.json()
      
      // Open download URL in new tab
      window.open(data.downloadUrl, '_blank')
      
      // Refresh downloads list to update download status
      fetchDownloads()
    } catch (err) {
      alert('Download failed')
      console.error(err)
    }
  }

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return 'N/A'
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading your downloads...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 py-12">
        <div className="container-custom">
          <div className="text-center">
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-lg inline-block">
              {error}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 py-12">
      <div className="container-custom">
        <h1 className="text-4xl font-bold text-white mb-8 flex items-center gap-3">
          <DownloadIcon className="w-10 h-10 text-blue-500" />
          My Downloads
        </h1>

        {downloads.length === 0 ? (
          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-12 text-center">
            <Package className="w-20 h-20 text-slate-600 mx-auto mb-6" />
            <p className="text-slate-400 mb-6 text-lg">You have not purchased any products yet.</p>
            <Link
              href="/products"
              className="inline-block px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-300"
            >
              Browse products
            </Link>
          </div>
        ) : (
          <div className="grid gap-6">
            {downloads.map((download) => (
              <div
                key={download.id}
                className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-300"
              >
                <div className="flex items-center gap-6">
                  {/* Thumbnail */}
                  <div className="flex-shrink-0">
                    {download.product.thumbnailUrl ? (
                      <img
                        src={download.product.thumbnailUrl}
                        alt={download.product.title}
                        className="w-24 h-24 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-24 h-24 bg-slate-700 rounded-lg flex items-center justify-center">
                        <Package className="w-10 h-10 text-slate-500" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    <Link
                      href={`/products/${download.product.slug}`}
                      className="text-xl font-semibold text-white hover:text-blue-400 transition-colors inline-block mb-2"
                    >
                      {download.product.title}
                    </Link>
                    <div className="text-sm text-slate-400 space-y-1">
                      <p>
                        <span className="text-slate-500">Category:</span>{' '}
                        <span className="capitalize">{download.product.category}</span>
                      </p>
                      <p>
                        <span className="text-slate-500">Size:</span>{' '}
                        {formatFileSize(download.product.fileSize)}
                      </p>
                      <p>
                        <span className="text-slate-500">Purchased on:</span>{' '}
                        {formatDate(download.purchasedAt)}
                      </p>
                      {download.isDownloaded && download.downloadedAt && (
                        <p className="text-green-400">
                          <span className="text-slate-500">Downloaded on:</span>{' '}
                          {formatDate(download.downloadedAt)}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-3">
                    <button
                      onClick={() => handleDownload(download.id, download.product.title)}
                      className="px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-green-500/50 transition-all duration-300 flex items-center gap-2"
                    >
                      <DownloadIcon className="w-4 h-4" />
                      {download.isDownloaded ? 'Download again' : 'Download'}
                    </button>
                    <Link
                      href={`/products/${download.product.slug}?review=true`}
                      className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-300 text-center"
                    >
                      Leave a review
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
