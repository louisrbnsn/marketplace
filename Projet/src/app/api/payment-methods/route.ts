import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'

export const dynamic = 'force-dynamic'

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
    const { data: methods } = await supabase
      .from('payment_methods')
      .select('*')
      .eq('user_id', authUser.id)
      .order('created_at')

    return NextResponse.json({ paymentMethods: methods || [] })
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

    // Attach payment method to customer
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: stripeCustomerId,
    })

    // Get payment method details from Stripe
    const stripePaymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId)

    // Check if this is the first payment method
    const { data: existingMethods } = await supabase
      .from('payment_methods')
      .select('*')
      .eq('user_id', user.id)

    const isFirstMethod = !existingMethods || existingMethods.length === 0

    // If this is the first method, set it as default in Stripe
    if (isFirstMethod) {
      await stripe.customers.update(stripeCustomerId, {
        invoice_settings: {
          default_payment_method: paymentMethodId,
        },
      })
    }

    // Save payment method to database
    const { data: newPaymentMethod } = await supabase
      .from('payment_methods')
      .insert({
        user_id: user.id,
        stripe_payment_method_id: paymentMethodId,
        type: stripePaymentMethod.type,
        card_brand: stripePaymentMethod.card?.brand,
        card_last4: stripePaymentMethod.card?.last4,
        card_exp_month: stripePaymentMethod.card?.exp_month,
        card_exp_year: stripePaymentMethod.card?.exp_year,
        is_default: isFirstMethod,
      })
      .select()
      .single()

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
