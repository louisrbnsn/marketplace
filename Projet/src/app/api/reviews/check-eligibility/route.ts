import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/reviews/check-eligibility?productId=xxx - Check if user can leave a review
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId')

    if (!productId) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 })
    }

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ 
        canReview: false,
        reason: 'not_authenticated',
        message: 'You must be logged in to leave a review'
      })
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
        canReview: false,
        reason: 'not_purchased',
        message: 'You must purchase this product before leaving a review'
      })
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
        canReview: false,
        reason: 'already_reviewed',
        message: 'You have already left a review for this product'
      })
    }

    return NextResponse.json({
      canReview: true,
      reason: 'eligible',
      message: 'You can leave a review for this product'
    })
  } catch (error) {
    console.error('Error checking review eligibility:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      canReview: false 
    }, { status: 500 })
  }
}
