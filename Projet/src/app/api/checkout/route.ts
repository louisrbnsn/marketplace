import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe, PLATFORM_FEE_PERCENTAGE } from '@/lib/stripe'
import { db } from '@/lib/db'
import { users, paymentMethods, orders, orderItems } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // Get authenticated user
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
    if (authError || !authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get full user data from database
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, authUser.id))
      .limit(1)

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const { items, paymentMethodId } = await request.json()
    
    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'No items in cart' }, { status: 400 })
    }

    // Get user's Stripe customer ID or create one
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

      // Update user with Stripe customer ID
      await db
        .update(users)
        .set({ stripeCustomerId })
        .where(eq(users.id, user.id))
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
    const [order] = await db
      .insert(orders)
      .values({
        buyerId: user.id,
        totalAmount,
        platformFee: totalPlatformFee,
        status: 'pending',
      })
      .returning()

    // Insert order items
    const insertedOrderItems = await db
      .insert(orderItems)
      .values(
        orderItemsData.map((item) => ({
          orderId: order.id,
          productId: item.productId,
          sellerId: item.sellerId,
          price: item.price,
          platformFee: item.platformFee,
          sellerAmount: item.sellerAmount,
        }))
      )
      .returning()

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
      const [userPaymentMethod] = await db
        .select()
        .from(paymentMethods)
        .where(eq(paymentMethods.stripePaymentMethodId, paymentMethodId))
        .limit(1)

      if (!userPaymentMethod || userPaymentMethod.userId !== user.id) {
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
    await db
      .update(orders)
      .set({ stripePaymentIntentId: paymentIntent.id })
      .where(eq(orders.id, order.id))

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
