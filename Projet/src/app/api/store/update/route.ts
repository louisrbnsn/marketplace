import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PUT(request: NextRequest) {
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
    const { name, description, logo, banner } = body

    // Validation
    if (!name || !description) {
      return NextResponse.json(
        { success: false, error: 'Name and description are required' },
        { status: 400 }
      )
    }

    if (name.length > 50) {
      return NextResponse.json(
        { success: false, error: 'Name cannot exceed 50 characters' },
        { status: 400 }
      )
    }

    if (description.length > 150) {
      return NextResponse.json(
        { success: false, error: 'Description cannot exceed 150 characters' },
        { status: 400 }
      )
    }

    // Build update data
    const updateData: any = {
      name,
      description,
      updated_at: new Date().toISOString(),
    }

    // Only update logo/banner if provided
    if (logo !== undefined) {
      updateData.logo = logo
    }
    if (banner !== undefined) {
      updateData.banner = banner
    }

    // Update store
    const { data: updatedStore, error: updateError } = await supabase
      .from('stores')
      .update(updateData)
      .eq('user_id', user.id)
      .select()
      .single()

    if (updateError || !updatedStore) {
      console.error('Store update error:', updateError)
      return NextResponse.json(
        { success: false, error: 'Store not found' },
        { status: 404 }
      )
    }

    console.log('✅ Store updated:', updatedStore.slug)

    return NextResponse.json(
      {
        success: true,
        data: { store: updatedStore },
        message: 'Store updated successfully',
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Store update error:', error)
    return NextResponse.json(
      { success: false, error: 'Error updating store' },
      { status: 500 }
    )
  }
}
