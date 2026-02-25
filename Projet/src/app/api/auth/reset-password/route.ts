import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json()

    if (!password) {
      return NextResponse.json(
        { error: 'Password required' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must contain at least 6 characters' },
        { status: 400 }
      )
    }

    const supabase = createClient()

    // Vérifier qu'on a une session de récupération active
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Invalid or expired recovery session' },
        { status: 401 }
      )
    }

    // Mettre à jour le mot de passe
    const { error: updateError } = await supabase.auth.updateUser({
      password: password
    })

    if (updateError) {
      console.error('❌ Update password error:', updateError)
      return NextResponse.json(
        { error: updateError.message || 'Error updating password' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Password reset successfully',
    })
  } catch (error: any) {
    console.error('❌ Reset password error:', error)
    return NextResponse.json(
      { error: 'Error during password reset' },
      { status: 500 }
    )
  }
}
