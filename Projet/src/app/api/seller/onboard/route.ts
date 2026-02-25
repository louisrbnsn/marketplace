import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createConnectAccount, createAccountLink } from '@/lib/stripe'

export const dynamic = 'force-dynamic'

/**
 * POST /api/seller/onboard
 * Create or retrieve Stripe Connect onboarding link
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
    if (authError || !authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user from database
    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUser.id)
      .single()

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const refreshUrl = `${origin}/dashboard/store?onboarding=refresh`
    const returnUrl = `${origin}/dashboard/store?onboarding=complete`

    let stripeConnectId = user.stripe_connect_id

    // Create Connect account if doesn't exist
    if (!stripeConnectId) {
      stripeConnectId = await createConnectAccount(user.email, user.id)
      
      await supabase
        .from('users')
        .update({ stripe_connect_id: stripeConnectId })
        .eq('id', user.id)
    }

    // Create account link
    const accountLinkUrl = await createAccountLink(
      stripeConnectId,
      refreshUrl,
      returnUrl
    )

    return NextResponse.json({
      url: accountLinkUrl,
      accountId: stripeConnectId,
    })
  } catch (error: any) {
    console.error('Error creating onboarding link:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create onboarding link' },
      { status: 500 }
    )
  }
}
