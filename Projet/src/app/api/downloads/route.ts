import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

// GET /api/downloads - Get all purchased products (downloads) for logged-in user
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get all completed purchases for this user
    const { data: purchases, error } = await supabase
      .from('order_items')
      .select(`
        id,
        product_id,
        order_id,
        price,
        is_downloaded,
        downloaded_at,
        created_at,
        product:products(
          id,
          title,
          slug,
          thumbnail_url,
          file_url,
          file_size,
          file_type,
          category
        ),
        order:orders!inner(
          id,
          buyer_id,
          status
        )
      `)
      .eq('order.buyer_id', user.id)
      .eq('order.status', 'completed')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching downloads:', error)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }

    // Transform to match expected format
    const downloads = purchases?.map(p => {
      const productData = Array.isArray(p.product) ? p.product[0] : p.product
      return {
        id: p.id,
        productId: p.product_id,
        orderId: p.order_id,
        price: p.price,
        isDownloaded: p.is_downloaded,
        downloadedAt: p.downloaded_at,
        purchasedAt: p.created_at,
        product: productData ? {
          id: productData.id,
          title: productData.title,
          slug: productData.slug,
          thumbnailUrl: productData.thumbnail_url,
          fileUrl: productData.file_url,
          fileSize: productData.file_size,
          fileType: productData.file_type,
          category: productData.category,
        } : null,
      }
    }) || []

    return NextResponse.json({ downloads })
  } catch (error) {
    console.error('Error fetching downloads:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
