import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'

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
    const { data: method } = await supabase
      .from('payment_methods')
      .select('*')
      .eq('id', paymentMethodId)
      .eq('user_id', authUser.id)
      .single()

    if (!method) {
      return NextResponse.json(
        { error: 'Payment method not found' },
        { status: 404 }
      )
    }

    // Get user
    const { data: user } = await supabase
      .from('users')
      .select('stripe_customer_id')
      .eq('id', authUser.id)
      .single()

    if (!user?.stripe_customer_id) {
      return NextResponse.json(
        { error: 'User has no Stripe customer ID' },
        { status: 400 }
      )
    }

    // Update default in Stripe
    await stripe.customers.update(user.stripe_customer_id, {
      invoice_settings: {
        default_payment_method: method.stripe_payment_method_id,
      },
    })

    // Unset all other default methods
    await supabase
      .from('payment_methods')
      .update({ is_default: false })
      .eq('user_id', authUser.id)

    // Set this one as default
    await supabase
      .from('payment_methods')
      .update({ is_default: true })
      .eq('id', paymentMethodId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error setting default payment method:', error)
    return NextResponse.json(
      { error: 'Failed to set default payment method' },
      { status: 500 }
    )
  }
}
