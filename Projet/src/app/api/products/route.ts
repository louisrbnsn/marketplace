import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createProductSchema } from '@/utils/validation'
import { slugify } from '@/utils/helpers'
import { mapProduct } from '@/utils/mappers'

// GET - Get all products with filters
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    const { searchParams } = new URL(request.url)
    
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '12')
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const sortBy = searchParams.get('sortBy') || 'recent'
    const myProducts = searchParams.get('myProducts') === 'true'

    const offset = (page - 1) * pageSize

    // Build query
    let query = supabase
      .from('products')
      .select(`
        *,
        store:stores(id, name, slug, logo, average_rating),
        user:users(id, full_name, avatar)
      `, { count: 'exact' })

    // If myProducts, get only user's products
    if (myProducts) {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        return NextResponse.json(
          { success: false, error: 'Authentication required' },
          { status: 401 }
        )
      }
      query = query.eq('user_id', user.id)
    } else {
      // Otherwise only show published products
      query = query.eq('status', 'published')
    }

    // Apply filters
    if (category) {
      query = query.eq('category', category)
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
    }

    if (minPrice) {
      query = query.gte('price', parseInt(minPrice) * 100)
    }

    if (maxPrice) {
      query = query.lte('price', parseInt(maxPrice) * 100)
    }

    // Apply sorting
    switch (sortBy) {
      case 'price-asc':
        query = query.order('price', { ascending: true })
        break
      case 'price-desc':
        query = query.order('price', { ascending: false })
        break
      case 'rating':
        query = query.order('average_rating', { ascending: false })
        break
      case 'popular':
        query = query.order('purchase_count', { ascending: false })
        break
      default:
        query = query.order('created_at', { ascending: false })
    }

    // Apply pagination
    query = query.range(offset, offset + pageSize - 1)

    const { data: products, error, count } = await query

    if (error) {
      console.error('Get products error:', error)
      return NextResponse.json(
        { success: false, error: 'Error fetching products' },
        { status: 500 }
      )
    }

    // Map products to camelCase
    const mappedProducts = products?.map(mapProduct) || []

    return NextResponse.json(
      {
        success: true,
        data: {
          products: mappedProducts,
          pagination: {
            total: count || 0,
            page,
            pageSize,
            totalPages: Math.ceil((count || 0) / pageSize),
          },
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Get products error:', error)
    return NextResponse.json(
      { success: false, error: 'Error fetching products' },
      { status: 500 }
    )
  }
}

// POST - Create a new product
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Check if user has a store
    const { data: store } = await supabase
      .from('stores')
      .select('*')
      .eq('user_id', user.id)
      .single()

    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!store && profile?.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'You must create a store first' },
        { status: 400 }
      )
    }

    const body = await request.json()

    // Validate input
    const validatedData = createProductSchema.parse(body)

    // Generate slug
    const slug = slugify(validatedData.title)

    // Create product
    const { data: newProduct, error: insertError } = await supabase
      .from('products')
      .insert({
        store_id: store?.id || null,
        user_id: user.id,
        title: validatedData.title,
        slug,
        description: validatedData.description,
        short_description: validatedData.shortDescription,
        price: validatedData.price,
        category: validatedData.category,
        is_platform_product: profile?.role === 'admin' && !store,
        is_premium_only: validatedData.isPremiumOnly,
        tags: validatedData.tags,
        status: validatedData.status || 'draft',
      })
      .select()
      .single()

    if (insertError) {
      console.error('Insert error:', insertError)
      return NextResponse.json(
        { success: false, error: 'Error creating product' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        data: { product: mapProduct(newProduct) },
        message: 'Product created successfully',
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Create product error:', error)

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { success: false, error: error.errors[0].message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Error creating product' },
      { status: 500 }
    )
  }
}
