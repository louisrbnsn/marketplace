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
    const { fullName } = body

    // Validation
    if (!fullName) {
      return NextResponse.json(
        { success: false, error: 'Name required' },
        { status: 400 }
      )
    }

    // Update user in public.users table
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update({
        full_name: fullName,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)
      .select()
      .single()

    if (updateError) {
      console.error('User update error:', updateError)
      return NextResponse.json(
        { success: false, error: 'Error updating profile' },
        { status: 500 }
      )
    }

    console.log('✅ User updated:', user.email)

    return NextResponse.json(
      {
        success: true,
        data: { user: updatedUser },
        message: 'Profile updated successfully',
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('User update error:', error)
    return NextResponse.json(
      { success: false, error: 'Error updating profile' },
      { status: 500 }
    )
  }
}
