import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'
import { db } from '@/lib/db'
import { paymentMethods, users } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'

/**
 * PUT /api/payment-methods/[id]/default
 * Set a payment method as default
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
    if (authError || !authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const paymentMethodId = params.id

    // Get payment method from database
    const [method] = await db
      .select()
      .from(paymentMethods)
      .where(
        and(
          eq(paymentMethods.id, paymentMethodId),
          eq(paymentMethods.userId, authUser.id)
        )
      )
      .limit(1)

    if (!method) {
      return NextResponse.json(
        { error: 'Payment method not found' },
        { status: 404 }
      )
    }

    // Get user
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, authUser.id))
      .limit(1)

    if (!user?.stripeCustomerId) {
      return NextResponse.json(
        { error: 'User has no Stripe customer ID' },
        { status: 400 }
      )
    }

    // Update default in Stripe
    await stripe.customers.update(user.stripeCustomerId, {
      invoice_settings: {
        default_payment_method: method.stripePaymentMethodId,
      },
    })

    // Unset all other default methods
    await db
      .update(paymentMethods)
      .set({ isDefault: false })
      .where(eq(paymentMethods.userId, authUser.id))

    // Set this one as default
    await db
      .update(paymentMethods)
      .set({ isDefault: true })
      .where(eq(paymentMethods.id, paymentMethodId))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error setting default payment method:', error)
    return NextResponse.json(
      { error: 'Failed to set default payment method' },
      { status: 500 }
    )
  }
}
