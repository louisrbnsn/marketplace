import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

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
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, authUser.id))
      .limit(1)

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Ensure user has a Stripe customer ID
    let stripeCustomerId = user.stripeCustomerId

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.fullName,
        metadata: {
          userId: user.id,
        },
      })

      stripeCustomerId = customer.id

      await db
        .update(users)
        .set({ stripeCustomerId })
        .where(eq(users.id, user.id))
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
