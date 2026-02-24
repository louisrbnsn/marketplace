'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Loader2, Save, Check, X, Upload, Image as ImageIcon, Info } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContextSupabase'
import { getUploadLimit, getPlanName, formatFileSize } from '@/utils/helpers'

const categories = [
  { value: 'lut', label: 'LUT' },
  { value: 'preset', label: 'Preset' },
  { value: 'sfx', label: 'SFX' },
  { value: 'template', label: 'Template' },
  { value: 'pack', label: 'Pack' },
  { value: 'overlay', label: 'Overlay' },
  { value: 'other', label: 'Other' },
]

export default function CreateProductPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [loading, setLoading] = useState(false)
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
  }, [user, router])

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

  const uploadFile = async (file: File, productId: string, type: 'thumbnail' | 'product'): Promise<string | null> => {
    try {
      console.log(`📤 Starting upload for ${type}:`, {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        category: formData.category,
      })

      // Use Supabase Storage
      const uploadFormData = new FormData()
      uploadFormData.append('file', file)
      uploadFormData.append('bucket', 'products')
      uploadFormData.append('folder', `products/${productId}`)

      const uploadResponse = await fetch('/api/upload/supabase', {
        method: 'POST',
        credentials: 'include',
        body: uploadFormData,
      })

      const uploadData = await uploadResponse.json()
      console.log(`📦 Upload response for ${type}:`, uploadData)

      if (!uploadData.success) {
        console.error(`❌ Upload error for ${type}:`, uploadData.error)
        throw new Error(uploadData.error)
      }

      console.log(`✅ ${type} uploaded successfully:`, uploadData.data.url)

      return uploadData.data.url
    } catch (error) {
      console.error(`❌ Error uploading ${type}:`, error)
      return null
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      // Convertir le prix en centimes (0 si gratuit)
      const priceInCents = isFree ? 0 : Math.round(parseFloat(formData.price) * 100)
      
      // Convertir les tags en tableau
      const tagsArray = formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)

      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...formData,
          price: priceInCents,
          tags: tagsArray,
          status: formData.status,
        }),
      })

      const data = await response.json()

      if (data.success) {
        const productId = data.data.product.id

        // Upload files if provided
        if (thumbnail || productFile) {
          setUploading(true)
          const updateData: any = {}
          let uploadError = false
          let uploadErrorMessage = ''

          if (thumbnail) {
            const thumbnailUrl = await uploadFile(thumbnail, productId, 'thumbnail')
            if (thumbnailUrl) {
              updateData.thumbnailUrl = thumbnailUrl
            } else {
              uploadError = true
              uploadErrorMessage = 'Error uploading thumbnail image. The product was not created.'
            }
          }

          if (productFile && !uploadError) {
            const fileUrl = await uploadFile(productFile, productId, 'product')
            if (fileUrl) {
              updateData.fileUrl = fileUrl
              updateData.fileSize = productFile.size
              updateData.fileType = productFile.type
            } else {
              uploadError = true
              uploadErrorMessage = 'Error uploading product file. The product was not created.'
            }
          }

          // If upload errors occurred, delete the product and show error
          if (uploadError) {
            // Delete the created product
            await fetch(`/api/products/${productId}`, {
              method: 'DELETE',
              credentials: 'include',
            })
            
            setError(uploadErrorMessage)
            setLoading(false)
            setUploading(false)
            return
          }

          // Update product with file URLs if no upload errors
          if (Object.keys(updateData).length > 0) {
            const updateResponse = await fetch(`/api/products/${productId}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify(updateData),
            })

            const updateResult = await updateResponse.json()
            if (!updateResult.success) {
              // Delete the product if update fails
              await fetch(`/api/products/${productId}`, {
                method: 'DELETE',
                credentials: 'include',
              })
              
              setError('Error saving files. The product was not created.')
              setLoading(false)
              setUploading(false)
              return
            }
          }
        }

        setSuccess(true)
        setTimeout(() => {
          router.push('/dashboard')
        }, 2000)
      } else {
        setError(data.error || 'Error creating product')
      }
    } catch (error) {
      setError('An error occurred')
    } finally {
      setLoading(false)
      setUploading(false)
    }
  }

  if (authLoading) {
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
          <h1 className="text-4xl font-bold text-white mb-2">Add a product</h1>
          <p className="text-slate-400">Create a new product for your store</p>
        </div>

        {/* Product Form */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {success && (
              <div className="bg-green-500/10 border border-green-500/20 text-green-400 p-4 rounded-xl text-sm flex items-center gap-2">
                <Check className="w-5 h-5" />
                Product created successfully! Redirecting...
              </div>
            )}
            
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm flex items-center gap-2">
                <X className="w-5 h-5" />
                {error}
              </div>
            )}

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
                disabled={loading}
                placeholder="e.g., Pack of 50 Cinematic LUTs"
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
                disabled={loading}
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
                disabled={loading}
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
                    disabled={loading}
                    className="w-5 h-5 rounded border-slate-600 bg-slate-700 text-green-500 focus:ring-2 focus:ring-green-500 focus:ring-offset-0"
                  />
                  <label htmlFor="isFree" className="text-sm text-slate-300 cursor-pointer flex items-center gap-2">
                    💚 Free product
                  </label>
                </div>

                {/* Price input */}
                <div className="space-y-2">
                  <label htmlFor="price" className="text-sm font-medium text-slate-300">
                    Price (€) {!isFree && <span className="text-red-400">*</span>}
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
                      disabled={loading || isFree}
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
                  disabled={loading}
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
                disabled={loading}
                placeholder="cinematic, vintage, creative (separated by commas)"
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50"
              />
              <p className="text-xs text-slate-500">Separate tags with commas</p>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <label htmlFor="status" className="text-sm font-medium text-slate-300">
                Publication Status <span className="text-red-400">*</span>
              </label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                required
                disabled={loading}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50"
              >
                <option value="draft">Draft (not visible)</option>
                <option value="published">Published (visible in store)</option>
              </select>
              <p className="text-xs text-slate-500">
                Draft products are only visible to you in the dashboard
              </p>
            </div>

            {/* Premium Only */}
            <div className="flex items-center gap-3 p-4 bg-slate-900 border border-slate-700 rounded-xl">
              <input
                id="isPremiumOnly"
                type="checkbox"
                checked={formData.isPremiumOnly}
                onChange={(e) => setFormData({ ...formData, isPremiumOnly: e.target.checked })}
                disabled={loading}
                className="w-5 h-5 rounded border-slate-600 bg-slate-700 text-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0"
              />
              <label htmlFor="isPremiumOnly" className="text-sm text-slate-300 cursor-pointer">
                Reserved for Premium members only
              </label>
            </div>

            {/* Thumbnail Upload */}
            <div className="space-y-2">
              <label htmlFor="thumbnail" className="text-sm font-medium text-slate-300">
                Thumbnail image {thumbnail && <span className="text-blue-400">(file selected)</span>}
              </label>
              <div className="space-y-3">
                {thumbnailPreview && (
                  <div className="relative w-full h-48 rounded-xl overflow-hidden border border-slate-700">
                    <img
                      src={thumbnailPreview}
                      alt="Thumbnail preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <label
                    htmlFor="thumbnail"
                    className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg cursor-pointer transition-colors"
                  >
                    <ImageIcon className="w-4 h-4" />
                    {thumbnail ? 'Change image' : 'Choose an image'}
                  </label>
                  <input
                    id="thumbnail"
                    type="file"
                    accept="image/*"
                    onChange={handleThumbnailChange}
                    disabled={loading || uploading}
                    className="hidden"
                  />
                  {thumbnail && (
                    <span className="text-sm text-slate-400">{thumbnail.name}</span>
                  )}
                </div>
              </div>
              <p className="text-xs text-slate-500">Accepted formats: JPG, PNG, WebP. If the upload fails, the product will not be created.</p>
            </div>

            {/* Upload Limit Info */}
            {user && (
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-sm font-medium text-blue-300 mb-1">
                    Upload limit for your {getPlanName(user.role)} plan
                  </div>
                  <div className="text-xs text-slate-300">
                    Maximum file size: <span className="font-semibold text-blue-400">{formatFileSize(getUploadLimit(user.role))}</span>
                    {user.role === 'user' && (
                      <>
                        {' • '}
                        <Link href="/premium" className="text-purple-400 hover:text-purple-300 underline">
                          Upgrade to Premium to increase the limit
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Product File Upload */}
            <div className="space-y-2">
              <label htmlFor="productFile" className="text-sm font-medium text-slate-300">
                Product file {productFile && <span className="text-blue-400">(file selected)</span>}
              </label>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <label
                    htmlFor="productFile"
                    className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg cursor-pointer transition-colors"
                  >
                    <Upload className="w-4 h-4" />
                    {productFile ? 'Change file' : 'Choose a file'}
                  </label>
                  <input
                    id="productFile"
                    type="file"
                    onChange={handleProductFileChange}
                    disabled={loading || uploading}
                    className="hidden"
                  />
                  {productFile && (
                    <span className="text-sm text-slate-400">{productFile.name}</span>
                  )}
                </div>
              </div>
              <p className="text-xs text-slate-500">The file that buyers will download. If the upload fails, the product will not be created.</p>
            </div>

            {uploading && (
              <div className="bg-blue-500/10 border border-blue-500/20 text-blue-400 p-4 rounded-xl text-sm flex items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                Uploading files... Please wait.
              </div>
            )}

            {(thumbnail || productFile) && !uploading && !loading && (
              <div className="bg-amber-500/10 border border-amber-500/20 text-amber-400 p-4 rounded-xl text-sm">
                ⚠️ <strong>Important:</strong> If the file upload fails, the product will not be created. Make sure your files are valid.
              </div>
            )}

            {/* Submit Button */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading || uploading}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading || uploading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {uploading ? 'Uploading...' : 'Creating...'}
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Create product
                  </>
                )}
              </button>
              <Link href="/dashboard">
                <button
                  type="button"
                  disabled={loading || uploading}
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
