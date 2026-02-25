import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'

/**
 * GET /api/seller/dashboard
 * Create a Stripe Express Dashboard login link
 */
export async function GET() {
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

    if (!user.stripe_connect_id) {
      return NextResponse.json(
        { error: 'No Stripe Connect account found' },
        { status: 400 }
      )
    }

    // Create login link
    const loginLink = await stripe.accounts.createLoginLink(user.stripe_connect_id)

    return NextResponse.json({
      url: loginLink.url,
    })
  } catch (error: any) {
    console.error('Error creating dashboard link:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create dashboard link' },
      { status: 500 }
    )
  }
}
