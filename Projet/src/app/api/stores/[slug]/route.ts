import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { mapProduct, mapStore } from '@/utils/mappers'

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const supabase = createClient()
    const { slug } = params

    // Get store by slug with products
    const { data: store, error } = await supabase
      .from('stores')
      .select(`
        *,
        user:users(id, full_name, email, avatar, created_at),
        products(
          *
        )
      `)
      .eq('slug', slug)
      .eq('products.status', 'published')
      .order('created_at', { ascending: false, foreignTable: 'products' })
      .limit(20, { foreignTable: 'products' })
      .single()

    if (error || !store) {
      return NextResponse.json(
        { success: false, error: 'Store not found' },
        { status: 404 }
      )
    }

    // Map store and products to camelCase
    const mappedStore = {
      ...mapStore(store),
      user: store.user,
      products: store.products?.map(mapProduct) || []
    }

    return NextResponse.json(
      {
        success: true,
        data: { store: mappedStore },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Get store error:', error)
    return NextResponse.json(
      { success: false, error: 'Error fetching store' },
      { status: 500 }
    )
  }
}
