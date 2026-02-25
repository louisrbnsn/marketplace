import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { registerSchema } from '@/utils/validation'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const validatedData = registerSchema.parse(body)

    // Create Supabase client
    const supabase = createClient()

    // Sign up with Supabase Auth
    // TEMPORAIRE : emailRedirectTo désactivé pour tester sans confirmation d'email
    const { data, error } = await supabase.auth.signUp({
      email: validatedData.email,
      password: validatedData.password,
      options: {
        data: {
          full_name: validatedData.fullName,
        },
        emailRedirectTo: undefined, // Désactive l'envoi d'email de confirmation
      },
    })

    if (error) {
      console.error('Register error:', error)
      
      if (error.message.includes('User already registered')) {
        return NextResponse.json(
          { success: false, error: 'This email is already in use' },
          { status: 400 }
        )
      }

      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      )
    }

    if (!data.user) {
      return NextResponse.json(
        { success: false, error: "Account creation failed" },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          user: {
            id: data.user.id,
            email: data.user.email,
            fullName: validatedData.fullName,
            role: 'buyer',
          },
        },
        message: 'Account created successfully! You can now log in.',
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Register error:', error)

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
      { success: false, error: 'Error during account creation' },
      { status: 500 }
    )
  }
}
