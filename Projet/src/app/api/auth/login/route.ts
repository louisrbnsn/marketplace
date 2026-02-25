import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { loginSchema } from '@/utils/validation'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const validatedData = loginSchema.parse(body)

    // Create Supabase client
    const supabase = createClient()

    // Sign in with Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email: validatedData.email,
      password: validatedData.password,
    })

    if (error) {
      console.error('Login error:', error)
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    if (!data.user) {
      return NextResponse.json(
        { success: false, error: 'Login failed' },
        { status: 401 }
      )
    }

    // Get user profile from public.users table
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single()

    if (profileError) {
      console.error('Profile fetch error:', profileError)
    }

    // Check if user is suspended
    if (profile?.is_suspended) {
      await supabase.auth.signOut()
      return NextResponse.json(
        {
          success: false,
          error: 'Your account has been suspended. Contact support.',
        },
        { status: 403 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          user: {
            id: data.user.id,
            email: data.user.email,
            fullName: profile?.full_name || data.user.email,
            role: profile?.role || 'user',
            avatar: profile?.avatar,
            isEmailVerified: true, // TEMPORAIRE : Désactivé pour tests
          },
        },
        message: 'Login successful',
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Login error:', error)

    if (error.name === 'ZodError') {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid data',
          details: error.errors,
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Error during login' },
      { status: 500 }
    )
  }
}
