'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContextSupabase'
import { Star } from 'lucide-react'

interface Review {
  id: string
  rating: number
  comment: string | null
  isVerifiedPurchase: boolean
  createdAt: string
  userId: string
  userName: string
  userAvatar: string | null
}

interface ReviewSectionProps {
  productId: string
}

export default function ReviewSection({ productId }: ReviewSectionProps) {
  const { user } = useAuth()
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [canReview, setCanReview] = useState(false)
  const [eligibilityMessage, setEligibilityMessage] = useState<string>('')
  const [checkingEligibility, setCheckingEligibility] = useState(false)

  useEffect(() => {
    fetchReviews()
    if (user) {
      checkReviewEligibility()
    }
  }, [productId, user])

  const fetchReviews = async () => {
    try {
      const response = await fetch(`/api/reviews?productId=${productId}`)
      if (!response.ok) throw new Error('Failed to fetch reviews')
      const data = await response.json()
      setReviews(data.reviews)
    } catch (err) {
      console.error('Error fetching reviews:', err)
    } finally {
      setLoading(false)
    }
  }

  const checkReviewEligibility = async () => {
    setCheckingEligibility(true)
    try {
      const response = await fetch(`/api/reviews/check-eligibility?productId=${productId}`)
      if (!response.ok) throw new Error('Failed to check eligibility')
      const data = await response.json()
      setCanReview(data.canReview)
      setEligibilityMessage(data.message)
    } catch (err) {
      console.error('Error checking eligibility:', err)
      setCanReview(false)
    } finally {
      setCheckingEligibility(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          rating,
          comment: comment.trim() || null,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit review')
      }

      // Refresh reviews and reset form
      await fetchReviews()
      setShowForm(false)
      setRating(5)
      setComment('')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const renderStars = (rating: number, interactive: boolean = false) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type={interactive ? 'button' : undefined}
            onClick={interactive ? () => setRating(star) : undefined}
            className={`${
              star <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-600'
            } ${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : ''}`}
            disabled={!interactive}
          >
            <Star className="w-5 h-5" fill={star <= rating ? 'currentColor' : 'none'} />
          </button>
        ))}
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  if (loading) {
    return <div className="py-4 text-slate-400">Loading reviews...</div>
  }

  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : '0.0'

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-6">Reviews & Ratings</h2>

      {/* Summary */}
      <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-6 mb-8">
        <div className="flex items-center gap-6">
          <div className="text-center">
            <div className="text-4xl font-bold text-white">{averageRating}</div>
            <div className="text-sm text-slate-400 mt-1">{reviews.length} reviews</div>
          </div>
          <div className="flex-1">
            {renderStars(Math.round(parseFloat(averageRating)))}
          </div>
        </div>
      </div>

      {/* Review Form */}
      {user && (
        <div className="mb-8">
          {!showForm ? (
            <button
              onClick={() => setShowForm(true)}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-300"
            >
              Write a review
            </button>
          ) : (
            <form onSubmit={handleSubmit} className="bg-slate-900/50 border border-slate-700 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Leave a review</h3>
              
              {error && (
                <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg mb-4">
                  {error}
                </div>
              )}

              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-300 mb-2">Rating</label>
                {renderStars(rating, true)}
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Comment (optional)
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg p-3 min-h-[100px] focus:border-blue-500 focus:outline-none transition-colors"
                  placeholder="Share your experience with this product..."
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-300 disabled:opacity-50"
                >
                  {submitting ? 'Sending...' : 'Submit'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-6 py-2 border border-slate-700 text-slate-300 rounded-lg hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Message for non-authenticated users */}
      {!user && (
        <div className="mb-8 bg-slate-900/50 border border-slate-700 rounded-lg p-6 text-center">
          <p className="text-slate-300 mb-3">
            Want to leave a review?
          </p>
          <p className="text-slate-400 text-sm mb-4">
            Please create an account to share your experience with this product.
          </p>
          <div className="flex gap-3 justify-center">
            <a
              href="/register"
              className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-300"
            >
              Create account
            </a>
            <a
              href="/login"
              className="px-6 py-2 border border-slate-700 text-slate-300 rounded-lg hover:bg-slate-800 transition-colors"
            >
              Login
            </a>
          </div>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-6">
        {reviews.length === 0 ? (
          <p className="text-slate-400 text-center py-8">
            No reviews yet. Be the first to share your opinion!
          </p>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="border-b border-slate-700 pb-6 last:border-0">
              <div className="flex items-start gap-4">
                {review.userAvatar ? (
                  <img
                    src={review.userAvatar}
                    alt={review.userName}
                    className="w-12 h-12 rounded-full"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                    {review.userName.charAt(0).toUpperCase()}
                  </div>
                )}
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold text-white">{review.userName}</span>
                    {review.isVerifiedPurchase && (
                      <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded border border-green-500/30">
                        Verified purchase
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-3 mb-2">
                    {renderStars(review.rating)}
                    <span className="text-sm text-slate-500">
                      {formatDate(review.createdAt)}
                    </span>
                  </div>
                  
                  {review.comment && (
                    <p className="text-slate-300 mt-2">{review.comment}</p>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
