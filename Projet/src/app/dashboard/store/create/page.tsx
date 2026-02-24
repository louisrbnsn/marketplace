'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Store, ArrowLeft, Loader2, Image as ImageIcon, Sparkles } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContextSupabase'

export default function CreateStorePage() {
  const router = useRouter()
  const { refreshUser } = useAuth()
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
  })
  const [logo, setLogo] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [banner, setBanner] = useState<File | null>(null)
  const [bannerPreview, setBannerPreview] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleNameChange = (name: string) => {
    setFormData({ 
      ...formData, 
      name,
      slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    })
  }

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB max
        setError('Logo cannot exceed 5MB')
        return
      }
      setLogo(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setLogoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB max
        setError('Banner cannot exceed 10MB')
        return
      }
      setBanner(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setBannerPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const uploadFile = async (file: File, type: 'logo' | 'banner'): Promise<string | null> => {
    try {
      // Use Supabase Storage
      const formData = new FormData()
      formData.append('file', file)
      formData.append('bucket', 'stores')
      formData.append('folder', `stores/${type}s`)

      const uploadResponse = await fetch('/api/upload/supabase', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      })

      const uploadData = await uploadResponse.json()
      if (!uploadData.success) {
        throw new Error(uploadData.error)
      }

      return uploadData.data.url
    } catch (error) {
      console.error(`Error uploading ${type}:`, error)
      return null
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      console.log('🏪 Creating store:', formData)

      // Upload logo and banner if provided
      let logoUrl = null
      let bannerUrl = null

      if (logo) {
        console.log('📤 Uploading logo...')
        logoUrl = await uploadFile(logo, 'logo')
        if (!logoUrl) {
          setError('Error uploading logo')
          setIsLoading(false)
          return
        }
      }

      if (banner) {
        console.log('📤 Uploading banner...')
        bannerUrl = await uploadFile(banner, 'banner')
        if (!bannerUrl) {
          setError('Error uploading banner')
          setIsLoading(false)
          return
        }
      }

      // Create store with uploaded images
      const response = await fetch('/api/store/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...formData,
          logo: logoUrl,
          banner: bannerUrl,
        }),
      })

      const data = await response.json()
      console.log('📦 Response:', data)

      if (data.success) {
        console.log('✅ Store created successfully')
        await refreshUser() // Refresh user data to include new store
        router.push('/dashboard')
      } else {
        setError(data.error || 'Error creating store')
      }
    } catch (error) {
      console.error('❌ Store creation error:', error)
      setError('An error occurred during creation')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 py-12">
      <div className="container-custom max-w-3xl">
        {/* Back button */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to dashboard
        </Link>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">Create my store</h1>
              <p className="text-slate-400">Start selling your creations</p>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm">
                {error}
              </div>
            )}

            {/* Store Name */}
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium text-slate-300">
                Store name <span className="text-red-400">*</span>
              </label>
              <input
                id="name"
                type="text"
                placeholder="My Awesome Store"
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                required
                maxLength={50}
                disabled={isLoading}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50"
              />
              <p className="text-xs text-slate-500">{formData.name.length}/50 characters</p>
            </div>

            {/* Store Slug */}
            <div className="space-y-2">
              <label htmlFor="slug" className="text-sm font-medium text-slate-300">
                Store URL <span className="text-red-400">*</span>
              </label>
              <div className="flex items-center gap-2">
                <span className="text-slate-500 text-sm">marketplace.com/stores/</span>
                <input
                  id="slug"
                  type="text"
                  placeholder="my-store"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                  required
                  pattern="[a-z0-9-]+"
                  maxLength={30}
                  disabled={isLoading}
                  className="flex-1 px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50"
                />
              </div>
              <p className="text-xs text-slate-500">Only lowercase letters, numbers, and hyphens</p>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium text-slate-300">
                Short description <span className="text-red-400">*</span>
              </label>
              <input
                id="description"
                type="text"
                placeholder="Unique and quality digital creations"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
                maxLength={150}
                disabled={isLoading}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50"
              />
              <p className="text-xs text-slate-500">{formData.description.length}/150 characters</p>
            </div>

            {/* Logo Upload */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">
                Store logo <span className="text-slate-500">(optional)</span>
              </label>
              <div className="flex gap-4 items-start">
                {logoPreview && (
                  <div className="flex-shrink-0 w-24 h-24 bg-slate-900 border border-slate-700 rounded-xl overflow-hidden">
                    <img src={logoPreview} alt="Logo preview" className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="flex-1">
                  <input
                    type="file"
                    id="logo"
                    accept="image/*"
                    onChange={handleLogoChange}
                    disabled={isLoading}
                    className="hidden"
                  />
                  <label
                    htmlFor="logo"
                    className="block w-full px-4 py-8 bg-slate-900 border-2 border-dashed border-slate-700 rounded-xl text-center cursor-pointer hover:border-blue-500 transition-all disabled:opacity-50"
                  >
                    <ImageIcon className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                    <p className="text-sm text-slate-400">
                      {logo ? logo.name : 'Click to choose a logo'}
                    </p>
                    <p className="text-xs text-slate-600 mt-1">PNG, JPG or WebP (max 5MB)</p>
                  </label>
                </div>
              </div>
            </div>

            {/* Banner Upload */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">
                Store banner <span className="text-slate-500">(optional)</span>
              </label>
              {bannerPreview && (
                <div className="w-full h-32 bg-slate-900 border border-slate-700 rounded-xl overflow-hidden mb-2">
                  <img src={bannerPreview} alt="Banner preview" className="w-full h-full object-cover" />
                </div>
              )}
              <input
                type="file"
                id="banner"
                accept="image/*"
                onChange={handleBannerChange}
                disabled={isLoading}
                className="hidden"
              />
              <label
                htmlFor="banner"
                className="block w-full px-4 py-8 bg-slate-900 border-2 border-dashed border-slate-700 rounded-xl text-center cursor-pointer hover:border-blue-500 transition-all disabled:opacity-50"
              >
                <ImageIcon className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                <p className="text-sm text-slate-400">
                  {banner ? banner.name : 'Click to choose a banner'}
                </p>
                <p className="text-xs text-slate-600 mt-1">PNG, JPG or WebP • 16:9 format recommended (max 10MB)</p>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !formData.name || !formData.slug || !formData.description}
              className="w-full py-4 px-6 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <Store className="w-5 h-5" />
                  <span>Create my store</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
