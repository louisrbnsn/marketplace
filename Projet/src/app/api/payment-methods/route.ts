import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'
import { db } from '@/lib/db'
import { paymentMethods, users } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'

/**
 * GET /api/payment-methods
 * List all payment methods for the authenticated user
 */
export async function GET() {
  try {
    const supabase = createClient()
    
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
    if (authError || !authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get payment methods from database
    const methods = await db
      .select()
      .from(paymentMethods)
      .where(eq(paymentMethods.userId, authUser.id))
      .orderBy(paymentMethods.createdAt)

    return NextResponse.json({ paymentMethods: methods })
  } catch (error) {
    console.error('Error fetching payment methods:', error)
    return NextResponse.json(
      { error: 'Failed to fetch payment methods' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/payment-methods
 * Add a new payment method (credit card) for the authenticated user
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
    if (authError || !authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { paymentMethodId } = await request.json()

    if (!paymentMethodId) {
      return NextResponse.json(
        { error: 'Payment method ID is required' },
        { status: 400 }
      )
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

    // Attach payment method to customer
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: stripeCustomerId,
    })

    // Get payment method details from Stripe
    const stripePaymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId)

    // Check if this is the first payment method
    const existingMethods = await db
      .select()
      .from(paymentMethods)
      .where(eq(paymentMethods.userId, user.id))

    const isFirstMethod = existingMethods.length === 0

    // If this is the first method, set it as default in Stripe
    if (isFirstMethod) {
      await stripe.customers.update(stripeCustomerId, {
        invoice_settings: {
          default_payment_method: paymentMethodId,
        },
      })
    }

    // Save payment method to database
    const [newPaymentMethod] = await db
      .insert(paymentMethods)
      .values({
        userId: user.id,
        stripePaymentMethodId: paymentMethodId,
        type: stripePaymentMethod.type,
        cardBrand: stripePaymentMethod.card?.brand,
        cardLast4: stripePaymentMethod.card?.last4,
        cardExpMonth: stripePaymentMethod.card?.exp_month,
        cardExpYear: stripePaymentMethod.card?.exp_year,
        isDefault: isFirstMethod,
      })
      .returning()

    return NextResponse.json({
      success: true,
      paymentMethod: newPaymentMethod,
    })
  } catch (error: any) {
    console.error('Error adding payment method:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to add payment method' },
      { status: 500 }
    )
  }
}
