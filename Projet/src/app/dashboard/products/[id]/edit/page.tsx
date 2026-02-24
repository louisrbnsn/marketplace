'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Loader2, Save, Check, X, Upload, Image as ImageIcon } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContextSupabase'

const categories = [
  { value: 'lut', label: 'LUT' },
  { value: 'preset', label: 'Preset' },
  { value: 'sfx', label: 'SFX' },
  { value: 'template', label: 'Template' },
  { value: 'pack', label: 'Pack' },
  { value: 'overlay', label: 'Overlay' },
  { value: 'other', label: 'Other' },
]

export default function EditProductPage() {
  const router = useRouter()
  const params = useParams()
  const productId = params.id as string
  const { user, loading: authLoading } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    title: '',
    shortDescription: '',
    description: '',
    price: '',
    category: 'lut',
    isPremiumOnly: false,
    tags: '',
    status: 'draft',
  })
  const [isFree, setIsFree] = useState(false)

  const [thumbnail, setThumbnail] = useState<File | null>(null)
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null)
  const [productFile, setProductFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    // Don't redirect to login - let middleware handle auth
    if (user && !user.store) {
      router.push('/dashboard/store/create')
    }
    if (user && productId) {
      fetchProduct()
    }
  }, [user, authLoading, router, productId])

  const fetchProduct = async () => {
    try {
      const response = await fetch(`/api/products/${productId}`, {
        credentials: 'include',
      })
      const data = await response.json()

      if (data.success) {
        const product = data.data.product
        const priceValue = product.price / 100
        setFormData({
          title: product.title,
          shortDescription: product.shortDescription || '',
          description: product.description,
          price: priceValue.toString(),
          category: product.category,
          isPremiumOnly: product.isPremiumOnly,
          tags: product.tags?.join(', ') || '',
          status: product.status,
        })
        // Set isFree if price is 0
        setIsFree(priceValue === 0)
        if (product.thumbnailUrl) {
          setThumbnailPreview(product.thumbnailUrl)
        }
      } else {
        setError(data.error || 'Product not found')
      }
    } catch (error) {
      setError('Error loading product')
    } finally {
      setLoading(false)
    }
  }

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setThumbnail(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setThumbnailPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleProductFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setProductFile(file)
    }
  }

  const handleFreeToggle = (checked: boolean) => {
    setIsFree(checked)
    if (checked) {
      setFormData({ ...formData, price: '0' })
    }
  }

  const uploadFile = async (file: File, type: 'thumbnail' | 'product'): Promise<string | null> => {
    try {
      // Use Supabase Storage
      const formData = new FormData()
      formData.append('file', file)
      formData.append('bucket', 'products')
      formData.append('folder', `products/${productId}`)

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
    setUploading(true)

    try {
      const updateData: any = {
        title: formData.title,
        shortDescription: formData.shortDescription,
        description: formData.description,
        price: isFree ? 0 : Math.round(parseFloat(formData.price) * 100),
        category: formData.category,
        isPremiumOnly: formData.isPremiumOnly,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        status: formData.status,
      }

      let uploadError = false

      // Upload thumbnail if changed
      if (thumbnail) {
        const thumbnailUrl = await uploadFile(thumbnail, 'thumbnail')
        if (thumbnailUrl) {
          updateData.thumbnailUrl = thumbnailUrl
        } else {
          uploadError = true
          setError('Error uploading thumbnail image')
        }
      }

      // Upload product file if provided
      if (productFile && !uploadError) {
        const fileUrl = await uploadFile(productFile, 'product')
        if (fileUrl) {
          updateData.fileUrl = fileUrl
          updateData.fileSize = productFile.size
          updateData.fileType = productFile.type
        } else {
          uploadError = true
          setError('Error uploading product file')
        }
      }

      setUploading(false)

      // If upload errors occurred, stop here
      if (uploadError) {
        setSaving(false)
        return
      }

      const response = await fetch(`/api/products/${productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(updateData),
      })

      const data = await response.json()

      if (data.success) {
        setSuccess(true)
        setTimeout(() => {
          router.push('/dashboard')
        }, 2000)
      } else {
        setError(data.error || 'Error updating product')
      }
    } catch (error) {
      setError('An error occurred')
    } finally {
      setSaving(false)
      setUploading(false)
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
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to dashboard
        </Link>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Edit product</h1>
          <p className="text-slate-400">Update your product information</p>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {success && (
              <div className="bg-green-500/10 border border-green-500/20 text-green-400 p-4 rounded-xl text-sm flex items-center gap-2">
                <Check className="w-5 h-5" />
                Product updated successfully! Redirecting...
              </div>
            )}
            
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm flex items-center gap-2">
                <X className="w-5 h-5" />
                {error}
              </div>
            )}

            {/* Thumbnail Upload */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">
                Display Image
              </label>
              <div className="flex gap-4 items-start">
                {thumbnailPreview && (
                  <div className="flex-shrink-0 w-32 h-32 bg-slate-900 rounded-xl overflow-hidden">
                    <img
                      src={thumbnailPreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="flex-1">
                  <label className="flex flex-col items-center px-4 py-6 bg-slate-900 border-2 border-dashed border-slate-700 rounded-xl cursor-pointer hover:border-blue-500 transition-all">
                    <ImageIcon className="w-8 h-8 text-slate-500 mb-2" />
                    <span className="text-sm text-slate-400">Click to change image</span>
                    <span className="text-xs text-slate-500 mt-1">PNG, JPG, WEBP (max 5MB)</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleThumbnailChange}
                      className="hidden"
                      disabled={saving}
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* Product File Upload */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">
                Product File
              </label>
              <label className="flex flex-col items-center px-4 py-6 bg-slate-900 border-2 border-dashed border-slate-700 rounded-xl cursor-pointer hover:border-blue-500 transition-all">
                <Upload className="w-8 h-8 text-slate-500 mb-2" />
                <span className="text-sm text-slate-400">
                  {productFile ? productFile.name : 'Click to change file'}
                </span>
                <span className="text-xs text-slate-500 mt-1">All formats accepted</span>
                <input
                  type="file"
                  onChange={handleProductFileChange}
                  className="hidden"
                  disabled={saving}
                />
              </label>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium text-slate-300">
                Product Title <span className="text-red-400">*</span>
              </label>
              <input
                id="title"
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                maxLength={255}
                disabled={saving}
                placeholder="Ex: Pack de 50 LUTs Cinématiques"
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50"
              />
            </div>

            {/* Short Description */}
            <div className="space-y-2">
              <label htmlFor="shortDescription" className="text-sm font-medium text-slate-300">
                Short Description
              </label>
              <input
                id="shortDescription"
                type="text"
                value={formData.shortDescription}
                onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                maxLength={500}
                disabled={saving}
                placeholder="A short and catchy description"
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50"
              />
              <p className="text-xs text-slate-500">{formData.shortDescription.length}/500 characters</p>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium text-slate-300">
                Full Description <span className="text-red-400">*</span>
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
                rows={6}
                disabled={saving}
                placeholder="Describe your product in detail..."
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50 resize-none"
              />
            </div>

            {/* Price and Category */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Price */}
              <div className="space-y-3">
                {/* Free product checkbox */}
                <div className="flex items-center gap-3 p-3 bg-slate-900 border border-slate-700 rounded-xl">
                  <input
                    id="isFree"
                    type="checkbox"
                    checked={isFree}
                    onChange={(e) => handleFreeToggle(e.target.checked)}
                    disabled={saving}
                    className="w-5 h-5 rounded border-slate-600 bg-slate-700 text-green-500 focus:ring-2 focus:ring-green-500 focus:ring-offset-0"
                  />
                  <label htmlFor="isFree" className="text-sm text-slate-300 cursor-pointer flex items-center gap-2">
                    💚 Free product
                  </label>
                </div>

                {/* Price input */}
                <div className="space-y-2">
                  <label htmlFor="price" className="text-sm font-medium text-slate-300">
                    Prix (€) {!isFree && <span className="text-red-400">*</span>}
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">€</span>
                    <input
                      id="price"
                      type="number"
                      step="0.01"
                      min="0"
                      value={isFree ? '0.00' : formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      required={!isFree}
                      disabled={saving || isFree}
                      placeholder="0.00"
                      className="w-full pl-8 pr-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                  {isFree && (
                    <p className="text-xs text-green-400">✓ This product will be available for free</p>
                  )}
                </div>
              </div>

              {/* Category */}
              <div className="space-y-2">
                <label htmlFor="category" className="text-sm font-medium text-slate-300">
                  Category <span className="text-red-400">*</span>
                </label>
                <select
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  required
                  disabled={saving}
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50"
                >
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <label htmlFor="tags" className="text-sm font-medium text-slate-300">
                Tags
              </label>
              <input
                id="tags"
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                disabled={saving}
                placeholder="cinematic, vintage, creative (comma-separated)"
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50"
              />
              <p className="text-xs text-slate-500">Separate tags with commas</p>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <label htmlFor="status" className="text-sm font-medium text-slate-300">
                Status
              </label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                disabled={saving}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>

            {/* Premium Only */}
            <div className="flex items-center gap-3 p-4 bg-slate-900 border border-slate-700 rounded-xl">
              <input
                id="isPremiumOnly"
                type="checkbox"
                checked={formData.isPremiumOnly}
                onChange={(e) => setFormData({ ...formData, isPremiumOnly: e.target.checked })}
                disabled={saving}
                className="w-5 h-5 rounded border-slate-600 bg-slate-700 text-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0"
              />
              <label htmlFor="isPremiumOnly" className="text-sm text-slate-300 cursor-pointer">
                Reserved for Premium members only
              </label>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={saving || uploading}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {saving || uploading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {uploading ? 'Uploading...' : 'Saving...'}
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Save changes
                  </>
                )}
              </button>
              <Link href="/dashboard">
                <button
                  type="button"
                  disabled={saving || uploading}
                  className="px-6 py-3 bg-slate-700 border border-slate-600 text-white font-semibold rounded-xl hover:bg-slate-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
