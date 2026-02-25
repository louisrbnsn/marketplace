import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { updateProductRating, updateStoreRating } from '@/lib/review-utils'

export const dynamic = 'force-dynamic'

// GET /api/reviews?productId=xxx - Get all reviews for a product
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId')

    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 })
    }

    const { data: productReviews, error } = await supabase
      .from('reviews')
      .select(`
        id,
        rating,
        comment,
        is_verified_purchase,
        created_at,
        user_id,
        user:users(full_name, avatar)
      `)
      .eq('product_id', productId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching reviews:', error)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }

    // Transform data
    const reviews = productReviews?.map(r => {
      const userData = Array.isArray(r.user) ? r.user[0] : r.user
      return {
        id: r.id,
        rating: r.rating,
        comment: r.comment,
        isVerifiedPurchase: r.is_verified_purchase,
        createdAt: r.created_at,
        userId: r.user_id,
        userName: userData?.full_name || 'Anonymous',
        userAvatar: userData?.avatar || null,
      }
    }) || []

    return NextResponse.json({ reviews })
  } catch (error) {
    console.error('Error fetching reviews:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/reviews - Create a review (only if user purchased the product)
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized. You must be logged in.' }, { status: 401 })
    }

    const { productId, rating, comment } = await request.json()

    // Validation
    if (!productId || !rating) {
      return NextResponse.json({ 
        error: 'Product ID and rating are required' 
      }, { status: 400 })
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ 
        error: 'Rating must be between 1 and 5' 
      }, { status: 400 })
    }

    // Check if user has purchased this product
    const { data: purchase, error: purchaseError } = await supabase
      .from('order_items')
      .select(`
        id,
        order_id,
        order:orders!inner(buyer_id, status)
      `)
      .eq('product_id', productId)
      .eq('order.buyer_id', user.id)
      .eq('order.status', 'completed')
      .limit(1)
      .single()

    if (purchaseError || !purchase) {
      return NextResponse.json({ 
        error: 'You must purchase this product before leaving a review' 
      }, { status: 403 })
    }

    // Check if user already reviewed this product
    const { data: existingReview } = await supabase
      .from('reviews')
      .select('id')
      .eq('product_id', productId)
      .eq('user_id', user.id)
      .limit(1)
      .single()

    if (existingReview) {
      return NextResponse.json({ 
        error: 'You have already left a review for this product' 
      }, { status: 400 })
    }

    // Create review
    const { data: newReview, error: insertError } = await supabase
      .from('reviews')
      .insert({
        product_id: productId,
        user_id: user.id,
        order_id: purchase.order_id,
        rating,
        comment: comment || null,
        is_verified_purchase: true,
      })
      .select()
      .single()

    if (insertError) {
      console.error('Insert error:', insertError)
      return NextResponse.json({ error: 'Failed to create review' }, { status: 500 })
    }

    // Update product average rating and review count
    await updateProductRating(productId)

    // Update store average rating
    const { data: productData } = await supabase
      .from('products')
      .select('store_id')
      .eq('id', productId)
      .single()

    if (productData?.store_id) {
      await updateStoreRating(productData.store_id)
    }

    return NextResponse.json({ 
      message: 'Review created successfully', 
      review: newReview 
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating review:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
