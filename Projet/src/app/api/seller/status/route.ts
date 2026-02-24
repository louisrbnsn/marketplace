import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

/**
 * GET /api/seller/status
 * Get Stripe Connect account status
 */
export async function GET() {
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

    if (!user.stripeConnectId) {
      return NextResponse.json({
        connected: false,
        detailsSubmitted: false,
        chargesEnabled: false,
        payoutsEnabled: false,
      })
    }

    // Get account details from Stripe
    const account = await stripe.accounts.retrieve(user.stripeConnectId)

    return NextResponse.json({
      connected: true,
      detailsSubmitted: account.details_submitted,
      chargesEnabled: account.charges_enabled,
      payoutsEnabled: account.payouts_enabled,
      requirements: account.requirements,
      country: account.country,
      defaultCurrency: account.default_currency,
    })
  } catch (error: any) {
    console.error('Error fetching seller status:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch seller status' },
      { status: 500 }
    )
  }
}
