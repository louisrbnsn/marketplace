import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendResetPasswordEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 })
    }

    const supabase = createClient()

    // Vérifier si l'utilisateur existe
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, email')
      .eq('email', email)
      .single()

    // Pour la sécurité, on renvoie toujours le même message même si l'email n'existe pas
    if (userError || !userData) {
      console.log('⚠️ Email non trouvé:', email)
      // On retourne quand même un succès pour des raisons de sécurité
      return NextResponse.json({
        success: true,
        message: 'If this email exists, you will receive a reset link.',
      })
    }

    // Utiliser Supabase Auth pour gérer le reset de mot de passe
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/callback?type=recovery`,
    })

    if (error) {
      console.error('❌ Reset password error:', error)
    } else {
      console.log('✅ Reset password email sent by Supabase to:', email)
    }

    return NextResponse.json({
      success: true,
      message: 'If this email exists, you will receive a reset link.',
    })
  } catch (error: any) {
    console.error('❌ Forgot password error:', error)
    return NextResponse.json(
      { error: 'Error sending email' },
      { status: 500 }
    )
  }
}
