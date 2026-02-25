import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { stripe } from '@/lib/stripe'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { db } from '@/lib/db'
import { orders, orderItems, users, products } from '@/lib/db/schema'
import { eq, sql } from 'drizzle-orm'
import Stripe from 'stripe'

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = headers().get('stripe-signature')

    if (!signature) {
      return NextResponse.json({ error: 'No signature' }, { status: 400 })
    }

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSuccess(event.data.object as Stripe.PaymentIntent)
        break

      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.PaymentIntent)
        break

      case 'charge.refunded':
        await handleRefund(event.data.object as Stripe.Charge)
        break

      case 'account.updated':
        await handleAccountUpdate(event.data.object as Stripe.Account)
        break

      case 'payment_method.attached':
        console.log('Payment method attached:', event.data.object.id)
        break

      case 'payment_method.detached':
        console.log('Payment method detached:', event.data.object.id)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}

// Handle successful payment
async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
  try {
    const metadata = paymentIntent.metadata
    const orderId = metadata.orderId

    // If we have an orderId, use our new approach
    if (orderId) {
      // Update order status
      await db
        .update(orders)
        .set({
          status: 'completed',
          stripeChargeId: paymentIntent.latest_charge as string,
          completedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(orders.id, orderId))

      // Get order items
      const items = await db
        .select()
        .from(orderItems)
        .where(eq(orderItems.orderId, orderId))

      // Parse order items from metadata for seller distribution
      const orderItemsData = JSON.parse(metadata.orderItems || '[]')

      // Transfer funds to each seller
      for (const itemData of orderItemsData) {
        if (itemData.connectId && itemData.sellerAmount > 0) {
          try {
            const transfer = await stripe.transfers.create({
              amount: itemData.sellerAmount,
              currency: 'eur',
              destination: itemData.connectId,
              transfer_group: orderId,
              metadata: {
                orderId,
                productId: itemData.productId,
                sellerId: itemData.sellerId,
              },
            })

            // Update order item with transfer ID
            const orderItem = items.find((item: any) => item.productId === itemData.productId)
            if (orderItem) {
              await db
                .update(orderItems)
                .set({ stripeTransferId: transfer.id })
                .where(eq(orderItems.id, orderItem.id))
            }

            console.log(`Transfer created: ${transfer.id} for product ${itemData.productId}`)
          } catch (error) {
            console.error(`Failed to transfer to seller for product ${itemData.productId}:`, error)
          }
        }
      }

      // Update product purchase counts
      for (const itemData of orderItemsData) {
        await supabaseAdmin.rpc('increment_purchase_count', {
          product_id: itemData.productId
        })
      }

      console.log('Order completed successfully:', orderId)
    } else {
      // Legacy approach - for backward compatibility
      await handleLegacyPaymentSuccess(paymentIntent)
    }
  } catch (error) {
    console.error('Error handling payment success:', error)
  }
}

// Legacy payment success handler
async function handleLegacyPaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
  try {
    const metadata = paymentIntent.metadata
    const customerId = paymentIntent.customer as string

    // Get buyer user
    const { data: buyers } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('stripe_customer_id', customerId)
      .limit(1)

    const buyer = buyers?.[0]
    if (!buyer) {
      console.error('Buyer not found for customer:', customerId)
      return
    }

    // Check if order already exists
    const { data: existingOrder } = await supabaseAdmin
      .from('orders')
      .select('id')
      .eq('stripe_payment_intent_id', paymentIntent.id)
      .limit(1)
      .single()

    if (existingOrder) {
      console.log('Order already exists for payment intent:', paymentIntent.id)
      return
    }

    // Parse cart items from metadata
    const cartItems: string[] = JSON.parse(metadata.cartItems || '[]')

    if (cartItems.length === 0) {
      console.error('No cart items in payment intent metadata')
      return
    }

    // Get product details
    const { data: productList } = await supabaseAdmin
      .from('products')
      .select('*')
      .in('id', cartItems)

    if (!productList || productList.length === 0) {
      console.error('No products found for cart items')
      return
    }

    // Calculate totals
    const totalAmount = productList.reduce((sum: number, product: any) => sum + product.price, 0)
    const platformFeePercentage = parseInt(process.env.PLATFORM_FEE_PERCENTAGE || '20')
    const platformFee = Math.floor((totalAmount * platformFeePercentage) / 100)

    // Create order
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        buyer_id: buyer.id,
        total_amount: totalAmount,
        platform_fee: platformFee,
        status: 'completed',
        stripe_payment_intent_id: paymentIntent.id,
        stripe_charge_id: paymentIntent.latest_charge as string,
        completed_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (orderError || !order) {
      console.error('Error creating order:', orderError)
      return
    }

    // Create order items
    for (const product of productList) {
      const itemPlatformFee = Math.floor((product.price * platformFeePercentage) / 100)
      const sellerAmount = product.price - itemPlatformFee

      const { data: orderItem } = await supabaseAdmin
        .from('order_items')
        .insert({
          order_id: order.id,
          product_id: product.id,
          seller_id: product.user_id,
          price: product.price,
          platform_fee: itemPlatformFee,
          seller_amount: sellerAmount,
        })
        .select()
        .single()

      // Update product purchase count
      await supabaseAdmin.rpc('increment_purchase_count', {
        product_id: product.id
      })

      // Transfer funds to seller if they have a Stripe Connect account
      const { data: sellers } = await supabaseAdmin
        .from('users')
        .select('stripe_connect_id')
        .eq('id', product.user_id)
        .limit(1)

      const seller = sellers?.[0]
      if (seller?.stripe_connect_id && orderItem) {
        try {
          const transfer = await stripe.transfers.create({
            amount: sellerAmount,
            currency: 'eur',
            destination: seller.stripe_connect_id,
            transfer_group: order.id,
            metadata: {
              orderId: order.id,
              productId: product.id,
            },
          })

          // Update order item with transfer ID
          await supabaseAdmin
            .from('order_items')
            .update({ stripe_transfer_id: transfer.id })
            .eq('id', orderItem.id)
        } catch (error) {
          console.error('Failed to transfer to seller:', error)
        }
      }
    }

    console.log('Legacy order created successfully:', order.id)
  } catch (error) {
    console.error('Error handling legacy payment success:', error)
  }
}

// Handle failed payment
async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  try {
    const orderId = paymentIntent.metadata.orderId

    if (orderId) {
      // Update order status using Drizzle
      await db
        .update(orders)
        .set({
          status: 'failed',
          updatedAt: new Date(),
        })
        .where(eq(orders.id, orderId))
    } else {
      // Legacy approach
      await supabaseAdmin
        .from('orders')
        .update({
          status: 'failed',
          updated_at: new Date().toISOString(),
        })
        .eq('stripe_payment_intent_id', paymentIntent.id)
    }

    console.log('Payment failed for:', paymentIntent.id)
  } catch (error) {
    console.error('Error handling payment failure:', error)
  }
}

// Handle refund
async function handleRefund(charge: Stripe.Charge) {
  try {
    // Update order status
    await supabaseAdmin
      .from('orders')
      .update({
        status: 'refunded',
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_charge_id', charge.id)

    console.log('Refund processed for charge:', charge.id)
  } catch (error) {
    console.error('Error handling refund:', error)
  }
}

// Handle Stripe Connect account updates
async function handleAccountUpdate(account: Stripe.Account) {
  try {
    const accountId = account.id

    // Update user record with account capabilities
    await supabaseAdmin
      .from('users')
      .update({
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_connect_id', accountId)

    console.log('Account updated:', accountId, {
      chargesEnabled: account.charges_enabled,
      payoutsEnabled: account.payouts_enabled,
      detailsSubmitted: account.details_submitted,
    })
  } catch (error) {
    console.error('Error handling account update:', error)
  }
}
