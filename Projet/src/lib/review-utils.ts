import { supabaseAdmin } from '@/lib/supabase/admin'

/**
 * Update product average rating and review count
 * @param productId - The product ID to update
 */
export async function updateProductRating(productId: string): Promise<void> {
  try {
    // Get average rating and count
    const { data: stats } = await supabaseAdmin
      .from('reviews')
      .select('rating')
      .eq('product_id', productId)

    if (!stats || stats.length === 0) {
      // No reviews, set to 0
      await supabaseAdmin
        .from('products')
        .update({
          average_rating: 0,
          review_count: 0,
          updated_at: new Date().toISOString(),
        })
        .eq('id', productId)
      return
    }

    const avgRating = stats.reduce((sum, r) => sum + r.rating, 0) / stats.length
    const count = stats.length

    await supabaseAdmin
      .from('products')
      .update({
        average_rating: parseFloat(avgRating.toFixed(2)),
        review_count: count,
        updated_at: new Date().toISOString(),
      })
      .eq('id', productId)
  } catch (error) {
    console.error('Error updating product rating:', error)
    throw error
  }
}

/**
 * Update store average rating based on all its products' ratings
 * @param storeId - The store ID to update
 */
export async function updateStoreRating(storeId: string): Promise<void> {
  try {
    // Get all published products' ratings
    const { data: productsData } = await supabaseAdmin
      .from('products')
      .select('average_rating')
      .eq('store_id', storeId)
      .eq('status', 'published')

    if (!productsData || productsData.length === 0) {
      await supabaseAdmin
        .from('stores')
        .update({
          average_rating: 0,
          updated_at: new Date().toISOString(),
        })
        .eq('id', storeId)
      return
    }

    const avgRating =
      productsData.reduce((sum, p) => sum + (p.average_rating || 0), 0) / productsData.length

    await supabaseAdmin
      .from('stores')
      .update({
        average_rating: parseFloat(avgRating.toFixed(2)),
        updated_at: new Date().toISOString(),
      })
      .eq('id', storeId)
  } catch (error) {
    console.error('Error updating store rating:', error)
    throw error
  }
}

/**
 * Check if a user has purchased a specific product
 * @param userId - User ID
 * @param productId - Product ID
 * @returns True if user has purchased the product
 */
export async function hasUserPurchasedProduct(
  userId: string,
  productId: string
): Promise<boolean> {
  try {
    const { data, error } = await supabaseAdmin
      .from('order_items')
      .select('id, orders!inner(buyer_id, status)')
      .eq('product_id', productId)
      .eq('orders.buyer_id', userId)
      .eq('orders.status', 'completed')
      .limit(1)

    if (error) {
      console.error('Error checking user purchase:', error)
      return false
    }

    return data && data.length > 0
  } catch (error) {
    console.error('Error checking user purchase:', error)
    return false
  }
}

/**
 * Check if a user has already reviewed a product
 * @param userId - User ID
 * @param productId - Product ID
 * @returns True if user has already reviewed the product
 */
export async function hasUserReviewedProduct(
  userId: string,
  productId: string
): Promise<boolean> {
  try {
    const { data, error } = await supabaseAdmin
      .from('reviews')
      .select('id')
      .eq('product_id', productId)
      .eq('user_id', userId)
      .limit(1)

    if (error) {
      console.error('Error checking user review:', error)
      return false
    }

    return data && data.length > 0
  } catch (error) {
    console.error('Error checking user review:', error)
    return false
  }
}
