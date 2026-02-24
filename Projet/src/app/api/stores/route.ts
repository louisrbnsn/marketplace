import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createStoreSchema } from '@/utils/validation'
import { mapStore } from '@/utils/mappers'

// GET - Get all stores or search stores
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '12')
    const offset = (page - 1) * pageSize

    let query = supabase
      .from('stores')
      .select(`
        *,
        user:users(id, full_name, email, avatar)
      `, { count: 'exact' })
      .eq('is_active', true)

    if (search) {
      query = query.or(`name.ilike.%${search}%,slug.ilike.%${search}%`)
    }

    query = query
      .order('total_sales', { ascending: false })
      .range(offset, offset + pageSize - 1)

    const { data: allStores, error, count } = await query

    if (error) {
      console.error('Get stores error:', error)
      return NextResponse.json(
        { success: false, error: 'Error fetching stores' },
        { status: 500 }
      )
    }

    // Map stores to camelCase
    const mappedStores = allStores?.map(mapStore) || []

    return NextResponse.json(
      {
        success: true,
        data: {
          stores: mappedStores,
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
    console.error('Get stores error:', error)
    return NextResponse.json(
      { success: false, error: 'Error fetching stores' },
      { status: 500 }
    )
  }
}

// POST - Create a new store
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

    const body = await request.json()

    // Validate input
    const validatedData = createStoreSchema.parse(body)

    // Check if user already has a store
    const { data: existingStore } = await supabase
      .from('stores')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (existingStore) {
      return NextResponse.json(
        { success: false, error: 'You already have a store' },
        { status: 400 }
      )
    }

    // Check if slug is unique
    const { data: slugExists } = await supabase
      .from('stores')
      .select('id')
      .eq('slug', validatedData.slug)
      .single()

    if (slugExists) {
      return NextResponse.json(
        { success: false, error: 'This slug is already taken' },
        { status: 400 }
      )
    }

    // Create store
    const { data: newStore, error: insertError } = await supabase
      .from('stores')
      .insert({
        user_id: user.id,
        name: validatedData.name,
        slug: validatedData.slug,
        description: validatedData.description,
        logo: validatedData.logo,
        banner: validatedData.banner,
        social_links: validatedData.socialLinks,
      })
      .select()
      .single()

    if (insertError) {
      console.error('Insert error:', insertError)
      return NextResponse.json(
        { success: false, error: 'Error creating store' },
        { status: 500 }
      )
    }

    // Update user role to seller
    await supabase
      .from('users')
      .update({ role: 'seller' })
      .eq('id', user.id)

    return NextResponse.json(
      {
        success: true,
        data: { store: newStore },
        message: 'Store created successfully',
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Create store error:', error)

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { success: false, error: error.errors[0].message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Error creating store' },
      { status: 500 }
    )
  }
}
