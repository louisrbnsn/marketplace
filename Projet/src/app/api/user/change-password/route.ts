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
    const { currentPassword, newPassword } = body

    // Validation
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { success: false, error: 'All fields are required' },
        { status: 400 }
      )
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Password must contain at least 6 characters' },
        { status: 400 }
      )
    }

    // Verify current password by trying to sign in
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email!,
      password: currentPassword,
    })

    if (signInError) {
      return NextResponse.json(
        { success: false, error: 'Current password is incorrect' },
        { status: 400 }
      )
    }

    // Update password using Supabase Auth
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    })

    if (updateError) {
      console.error('Password update error:', updateError)
      return NextResponse.json(
        { success: false, error: 'Error changing password' },
        { status: 500 }
      )
    }

    console.log('✅ Password updated for user:', user.email)

    return NextResponse.json(
      {
        success: true,
        message: 'Password changed successfully',
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Password change error:', error)
    return NextResponse.json(
      { success: false, error: 'Error changing password' },
      { status: 500 }
    )
  }
}
