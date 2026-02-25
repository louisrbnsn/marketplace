import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe, PLATFORM_FEE_PERCENTAGE } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // Get authenticated user
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
    if (authError || !authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get full user data from database
    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUser.id)
      .single()

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const { items, paymentMethodId } = await request.json()
    
    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'No items in cart' }, { status: 400 })
    }

    // Get user's Stripe customer ID or create one
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

      // Update user with Stripe customer ID
      await supabase
        .from('users')
        .update({ stripe_customer_id: stripeCustomerId })
        .eq('id', user.id)
    }

    // Get product details with sellers
    const productIds = items.map((item: any) => item.id)
    
    const { data: validProducts, error: productsError } = await supabase
      .from('products')
      .select(`
        *,
        user:users!products_user_id_fkey (
          id,
          stripe_connect_id,
          email,
          full_name
        )
      `)
      .in('id', productIds)

    if (productsError || !validProducts || validProducts.length === 0) {
      return NextResponse.json({ error: 'No valid products found' }, { status: 400 })
    }

    // Check if all sellers have Stripe Connect setup
    const unconnectedSellers = validProducts.filter(
      (p: any) => !p.user?.stripe_connect_id
    )

    if (unconnectedSellers.length > 0) {
      return NextResponse.json(
        { 
          error: 'Some sellers have not completed their payment setup',
          unconnectedSellers: unconnectedSellers.map((p: any) => ({
            productId: p.id,
            productTitle: p.title,
          }))
        },
        { status: 400 }
      )
    }

    // Calculate total amount and prepare order items
    let totalAmount = 0
    let totalPlatformFee = 0
    const orderItemsData: any[] = []

    for (const product of validProducts) {
      const productPrice = product.price
      const platformFee = Math.round(productPrice * (PLATFORM_FEE_PERCENTAGE / 100))
      const sellerAmount = productPrice - platformFee

      totalAmount += productPrice
      totalPlatformFee += platformFee

      orderItemsData.push({
        productId: product.id,
        sellerId: product.user_id,
        price: productPrice,
        platformFee,
        sellerAmount,
        sellerConnectId: product.user.stripe_connect_id,
      })
    }

    // Create order in database
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        buyer_id: user.id,
        total_amount: totalAmount,
        platform_fee: totalPlatformFee,
        status: 'pending',
      })
      .select()
      .single()

    if (orderError || !order) {
      return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
    }

    // Insert order items
    await supabase
      .from('order_items')
      .insert(
        orderItemsData.map((item) => ({
          order_id: order.id,
          product_id: item.productId,
          seller_id: item.sellerId,
          price: item.price,
          platform_fee: item.platformFee,
          seller_amount: item.sellerAmount,
        }))
      )

    // Prepare payment intent options
    const paymentIntentOptions: any = {
      amount: totalAmount,
      currency: 'eur',
      customer: stripeCustomerId,
      metadata: {
        userId: user.id,
        orderId: order.id,
        orderItems: JSON.stringify(
          orderItemsData.map((item) => ({
            productId: item.productId,
            sellerId: item.sellerId,
            sellerAmount: item.sellerAmount,
            connectId: item.sellerConnectId,
          }))
        ),
      },
    }

    // If payment method provided, use it
    if (paymentMethodId) {
      // Verify payment method belongs to user
      const { data: userPaymentMethod } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('stripe_payment_method_id', paymentMethodId)
        .single()

      if (!userPaymentMethod || userPaymentMethod.user_id !== user.id) {
        return NextResponse.json(
          { error: 'Invalid payment method' },
          { status: 400 }
        )
      }

      paymentIntentOptions.payment_method = paymentMethodId
      paymentIntentOptions.confirm = true
      paymentIntentOptions.off_session = true
    } else {
      // Use automatic payment methods
      paymentIntentOptions.automatic_payment_methods = {
        enabled: true,
      }
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create(paymentIntentOptions)

    // Update order with payment intent ID
    await supabase
      .from('orders')
      .update({ stripe_payment_intent_id: paymentIntent.id })
      .eq('id', order.id)

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      orderId: order.id,
      amount: totalAmount,
      status: paymentIntent.status,
    })
  } catch (error: any) {
    console.error('Error creating checkout:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
