import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Check if email is already verified
    if (user.email_confirmed_at) {
      return NextResponse.json(
        { success: false, error: 'Email already verified' },
        { status: 400 }
      )
    }

    // ⚠️ TEMPORARY: Email disabled to avoid rate limit
    // TODO: Re-enable when ready for production or configure custom SMTP
    console.log('📧 Verification email request for:', user.email)
    console.log('📧 Email sending DISABLED (rate limit protection)')
    console.log('💡 Tip: Use Inbucket at localhost:54324/monitor or configure custom SMTP')

    // Resend verification email using Supabase
    // const { error: resendError } = await supabase.auth.resend({
    //   type: 'signup',
    //   email: user.email!,
    //   options: {
    //     emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`,
    //   }
    // })

    // if (resendError) {
    //   console.error('❌ Resend verification error:', resendError)
    //   return NextResponse.json(
    //     { success: false, error: resendError.message || 'Error sending email' },
    //     { status: 500 }
    //   )
    // }

    // console.log('✅ Verification email resent to:', user.email)

    return NextResponse.json(
      {
        success: true,
        message: '✅ [TEST MODE] Email disabled - see console',
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('❌ Resend verification error:', error)
    return NextResponse.json(
      { success: false, error: 'Error sending email' },
      { status: 500 }
    )
  }
}
