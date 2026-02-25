import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'

export const dynamic = 'force-dynamic'

/**
 * POST /api/payment-methods/setup-intent
 * Create a setup intent for adding a new payment method
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

    // Ensure user has a Stripe customer ID
    let stripeCustomerId = user.stripe_customer_id

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.full_name,
        metadata: {
          userId: user.id,
        },
      })

      stripeCustomerId = customer.id

      await supabase
        .from('users')
        .update({ stripe_customer_id: stripeCustomerId })
        .eq('id', user.id)
    }

    // Create setup intent
    const setupIntent = await stripe.setupIntents.create({
      customer: stripeCustomerId,
      payment_method_types: ['card'],
      usage: 'off_session',
    })

    return NextResponse.json({
      clientSecret: setupIntent.client_secret,
    })
  } catch (error: any) {
    console.error('Error creating setup intent:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create setup intent' },
      { status: 500 }
    )
  }
}
