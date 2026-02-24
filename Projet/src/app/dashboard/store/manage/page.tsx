'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Store, ArrowLeft, Loader2, Save, Check, X, Image as ImageIcon, Trash2, AlertTriangle } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContextSupabase'

export default function StoreManagementPage() {
  const router = useRouter()
  const { user, loading: authLoading, refreshUser } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteConfirmation, setDeleteConfirmation] = useState('')

  const [storeData, setStoreData] = useState({
    name: '',
    slug: '',
    description: '',
    logo: '',
    banner: '',
  })

  const [logo, setLogo] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [banner, setBanner] = useState<File | null>(null)
  const [bannerPreview, setBannerPreview] = useState<string | null>(null)

  useEffect(() => {
    // Don't redirect to login - let middleware handle auth
    if (user && !user.store) {
      router.push('/dashboard')
    }
    if (user?.store) {
      setStoreData({
        name: user.store.name,
        slug: user.store.slug,
        description: user.store.description || '',
        logo: user.store.logo || '',
        banner: user.store.banner || '',
      })
      setLogoPreview(user.store.logo || null)
      setBannerPreview(user.store.banner || null)
      setLoading(false)
    }
  }, [user, authLoading, router])

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
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
      if (file.size > 10 * 1024 * 1024) {
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
    setSaving(true)
    setError('')
    setSuccess(false)

    try {
      // Upload new logo if provided
      let logoUrl = storeData.logo
      if (logo) {
        console.log('📤 Uploading new logo...')
        const newLogoUrl = await uploadFile(logo, 'logo')
        if (newLogoUrl) {
          logoUrl = newLogoUrl
        }
      }

      // Upload new banner if provided
      let bannerUrl = storeData.banner
      if (banner) {
        console.log('📤 Uploading new banner...')
        const newBannerUrl = await uploadFile(banner, 'banner')
        if (newBannerUrl) {
          bannerUrl = newBannerUrl
        }
      }

      const response = await fetch('/api/store/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: storeData.name,
          description: storeData.description,
          logo: logoUrl,
          banner: bannerUrl,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setSuccess(true)
        await refreshUser()
        setLogo(null)
        setBanner(null)
        setTimeout(() => setSuccess(false), 3000)
      } else {
        setError(data.error || 'Error updating')
      }
    } catch (error) {
      setError('An error occurred')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteStore = async () => {
    if (deleteConfirmation !== storeData.name) {
      setError('Store name doesn\'t match')
      return
    }

    setDeleting(true)
    setError('')

    try {
      const response = await fetch('/api/store/delete', {
        method: 'DELETE',
        credentials: 'include',
      })

      const data = await response.json()

      if (data.success) {
        await refreshUser()
        router.push('/dashboard')
      } else {
        setError(data.error || 'Error during deletion')
      }
    } catch (error) {
      setError('An error occurred')
    } finally {
      setDeleting(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user?.store) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 py-12">
      <div className="container-custom max-w-4xl">
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
          <h1 className="text-4xl font-bold text-white mb-2">Manage my store</h1>
          <p className="text-slate-400">Customize your store information</p>
        </div>

        {/* Store Form */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {success && (
              <div className="bg-green-500/10 border border-green-500/20 text-green-400 p-4 rounded-xl text-sm flex items-center gap-2">
                <Check className="w-5 h-5" />
                Store updated successfully
              </div>
            )}
            
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm flex items-center gap-2">
                <X className="w-5 h-5" />
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
                value={storeData.name}
                onChange={(e) => setStoreData({ ...storeData, name: e.target.value })}
                required
                maxLength={50}
                disabled={saving}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50"
              />
              <p className="text-xs text-slate-500">{storeData.name.length}/50 characters</p>
            </div>

            {/* Store Slug (Read-only) */}
            <div className="space-y-2">
              <label htmlFor="slug" className="text-sm font-medium text-slate-300">
                Store URL
              </label>
              <div className="flex items-center gap-2">
                <span className="text-slate-500 text-sm">{process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/stores/</span>
                <input
                  id="slug"
                  type="text"
                  value={storeData.slug}
                  disabled
                  className="flex-1 px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-slate-400 cursor-not-allowed"
                />
              </div>
              <p className="text-xs text-slate-500">URL cannot be modified</p>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium text-slate-300">
                Short description <span className="text-red-400">*</span>
              </label>
              <textarea
                id="description"
                value={storeData.description}
                onChange={(e) => setStoreData({ ...storeData, description: e.target.value })}
                required
                maxLength={150}
                rows={3}
                disabled={saving}
                placeholder="Describe your store in a few words..."
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none disabled:opacity-50"
              />
              <p className="text-xs text-slate-500">{storeData.description.length}/150 characters</p>
            </div>

            {/* Logo Upload */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">
                Store logo
              </label>
              <div className="flex gap-4 items-start">
                {logoPreview && (
                  <div className="flex-shrink-0 w-24 h-24 bg-slate-900 border border-slate-700 rounded-xl overflow-hidden">
                    <img src={logoPreview} alt="Current logo" className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="flex-1">
                  <input
                    type="file"
                    id="logo"
                    accept="image/*"
                    onChange={handleLogoChange}
                    disabled={saving}
                    className="hidden"
                  />
                  <label
                    htmlFor="logo"
                    className="block w-full px-4 py-8 bg-slate-900 border-2 border-dashed border-slate-700 rounded-xl text-center cursor-pointer hover:border-blue-500 transition-all"
                  >
                    <ImageIcon className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                    <p className="text-sm text-slate-400">
                      {logo ? logo.name : logoPreview ? 'Click to change logo' : 'Click to add a logo'}
                    </p>
                    <p className="text-xs text-slate-600 mt-1">PNG, JPG or WebP (max 5MB)</p>
                  </label>
                </div>
              </div>
            </div>

            {/* Banner Upload */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">
                Store banner
              </label>
              {bannerPreview && (
                <div className="w-full h-32 bg-slate-900 border border-slate-700 rounded-xl overflow-hidden mb-2">
                  <img src={bannerPreview} alt="Current banner" className="w-full h-full object-cover" />
                </div>
              )}
              <input
                type="file"
                id="banner"
                accept="image/*"
                onChange={handleBannerChange}
                disabled={saving}
                className="hidden"
              />
              <label
                htmlFor="banner"
                className="block w-full px-4 py-8 bg-slate-900 border-2 border-dashed border-slate-700 rounded-xl text-center cursor-pointer hover:border-blue-500 transition-all"
              >
                <ImageIcon className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                <p className="text-sm text-slate-400">
                  {banner ? banner.name : bannerPreview ? 'Click to change banner' : 'Click to add a banner'}
                </p>
                <p className="text-xs text-slate-600 mt-1">PNG, JPG or WebP • 16:9 format recommended (max 10MB)</p>
              </label>
            </div>

            {/* Store Info */}
            <div className="bg-slate-900/50 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Creation date</span>
                <span className="text-white font-medium">
                  {new Date(user.store.createdAt).toLocaleDateString('fr-FR')}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Published products</span>
                <span className="text-white font-medium">0</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Total sales</span>
                <span className="text-white font-medium">0</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 py-3 px-6 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-blue-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Save changes
                  </>
                )}
              </button>
              <Link
                href="/dashboard"
                className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-xl transition-all flex items-center"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>

        {/* Store Preview Link */}
        <div className="mt-6 p-6 bg-slate-800/30 border border-slate-700 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-white font-semibold mb-1">View my public store</h3>
              <p className="text-sm text-slate-400">See how visitors view your store</p>
            </div>
            <Link
              href={`/stores/${user.store.slug}`}
              target="_blank"
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <Store className="w-4 h-4" />
              View store
            </Link>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="mt-6 p-6 bg-red-950/20 border border-red-900/50 rounded-xl">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5 text-red-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-white font-semibold mb-1">Danger Zone</h3>
              <p className="text-sm text-slate-400 mb-4">
                Deleting your store is permanent and will also delete all your products.
                This action is irreversible.
              </p>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete my store
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-8 max-w-md w-full">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Delete store</h3>
                <p className="text-sm text-slate-400">This action is irreversible</p>
              </div>
            </div>

            <div className="bg-red-950/30 border border-red-900/50 rounded-lg p-4 mb-6">
              <p className="text-sm text-red-300 mb-2">
                ⚠️ Warning: This action will delete:
              </p>
              <ul className="text-sm text-slate-300 space-y-1 ml-4">
                <li>• Your store</li>
                <li>• All your products</li>
                <li>• All associated statistics</li>
              </ul>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-300 mb-2 block">
                  To confirm, type your store name: <span className="text-white font-bold">{storeData.name}</span>
                </label>
                <input
                  type="text"
                  value={deleteConfirmation}
                  onChange={(e) => setDeleteConfirmation(e.target.value)}
                  placeholder={storeData.name}
                  disabled={deleting}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all disabled:opacity-50"
                />
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={handleDeleteStore}
                  disabled={deleting || deleteConfirmation !== storeData.name}
                  className="flex-1 py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {deleting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-5 h-5" />
                      Delete permanently
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    setShowDeleteModal(false)
                    setDeleteConfirmation('')
                    setError('')
                  }}
                  disabled={deleting}
                  className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-xl transition-all disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
