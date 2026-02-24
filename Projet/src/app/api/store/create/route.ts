import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { name, slug, description, logo, banner } = body

    // Validation
    if (!name || !slug || !description) {
      return NextResponse.json(
        { success: false, error: 'Name, slug and description are required' },
        { status: 400 }
      )
    }

    // Check if user already has a store
    const { data: existingUserStore } = await supabase
      .from('stores')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (existingUserStore) {
      return NextResponse.json(
        { success: false, error: 'You already have a store' },
        { status: 400 }
      )
    }

    // Check if slug is already taken
    const { data: existingSlug } = await supabase
      .from('stores')
      .select('*')
      .eq('slug', slug)
      .single()

    if (existingSlug) {
      return NextResponse.json(
        { success: false, error: 'This URL is already taken' },
        { status: 400 }
      )
    }

    // Create store
    const { data: newStore, error: createError } = await supabase
      .from('stores')
      .insert({
        user_id: user.id,
        name,
        slug,
        description,
        logo: logo || null,
        banner: banner || null,
        is_active: true,
      })
      .select()
      .single()

    if (createError) {
      console.error('Store creation error:', createError)
      return NextResponse.json(
        { success: false, error: 'Error creating store' },
        { status: 500 }
      )
    }

    // Update user role to seller
    await supabase
      .from('users')
      .update({ role: 'seller', updated_at: new Date().toISOString() })
      .eq('id', user.id)

    console.log('✅ Store created:', newStore.slug)

    return NextResponse.json(
      {
        success: true,
        data: { store: newStore },
        message: 'Store created successfully',
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Store creation error:', error)
    return NextResponse.json(
      { success: false, error: 'Error creating store' },
      { status: 500 }
    )
  }
}
