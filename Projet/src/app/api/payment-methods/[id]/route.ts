import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'
import { db } from '@/lib/db'
import { paymentMethods, users } from '@/lib/db/schema'
import { eq, and, sql } from 'drizzle-orm'

/**
 * DELETE /api/payment-methods/[id]
 * Delete a payment method
 */
export async function DELETE(
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

    // Detach payment method from Stripe
    try {
      await stripe.paymentMethods.detach(method.stripePaymentMethodId)
    } catch (stripeError: any) {
      // If payment method is already detached or doesn't exist in Stripe, continue
      console.log('Stripe error:', stripeError.message)
    }

    // If this was the default method, set another one as default
    if (method.isDefault) {
      const otherMethods = await db
        .select()
        .from(paymentMethods)
        .where(
          and(
            eq(paymentMethods.userId, authUser.id),
            sql`${paymentMethods.id} != ${paymentMethodId}`
          )
        )
        .limit(1)

      if (otherMethods.length > 0) {
        await db
          .update(paymentMethods)
          .set({ isDefault: true })
          .where(eq(paymentMethods.id, otherMethods[0].id))

        // Update default in Stripe
        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.id, authUser.id))
          .limit(1)

        if (user?.stripeCustomerId) {
          await stripe.customers.update(user.stripeCustomerId, {
            invoice_settings: {
              default_payment_method: otherMethods[0].stripePaymentMethodId,
            },
          })
        }
      }
    }

    // Delete from database
    await db
      .delete(paymentMethods)
      .where(eq(paymentMethods.id, paymentMethodId))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting payment method:', error)
    return NextResponse.json(
      { error: 'Failed to delete payment method' },
      { status: 500 }
    )
  }
}
