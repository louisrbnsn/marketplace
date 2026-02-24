import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/downloads/[id] - Download a specific product (mark as downloaded)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const orderItemId = params.id

    // Verify user owns this purchase
    const { data: purchase, error } = await supabase
      .from('order_items')
      .select(`
        *,
        product:products(*),
        order:orders!inner(buyer_id, status)
      `)
      .eq('id', orderItemId)
      .eq('order.buyer_id', user.id)
      .eq('order.status', 'completed')
      .single()

    if (error || !purchase) {
      return NextResponse.json({ 
        error: 'Purchase not found or you do not have access' 
      }, { status: 404 })
    }

    // Mark as downloaded if not already
    if (!purchase.is_downloaded) {
      await supabase
        .from('order_items')
        .update({
          is_downloaded: true,
          downloaded_at: new Date().toISOString(),
        })
        .eq('id', orderItemId)

      // Increment download count on product
      const currentDownloadCount = purchase.product.download_count || 0
      await supabase
        .from('products')
        .update({
          download_count: currentDownloadCount + 1,
          updated_at: new Date().toISOString(),
        })
        .eq('id', purchase.product.id)
    }

    // Return download URL
    return NextResponse.json({ 
      downloadUrl: purchase.product.file_url,
      fileName: `${purchase.product.slug}.${purchase.product.file_type}`,
      fileSize: purchase.product.file_size,
    })
  } catch (error) {
    console.error('Error processing download:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
