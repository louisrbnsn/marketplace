import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'
import { db } from '@/lib/db'
import { users, orderItems } from '@/lib/db/schema'
import { eq, and, sql } from 'drizzle-orm'

/**
 * GET /api/seller/balance
 * Get seller's balance and earnings information
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

    // Get balance from database (sum of all completed order items)
    const result = await db
      .select({
        totalEarnings: sql<number>`COALESCE(SUM(${orderItems.sellerAmount}), 0)`,
        totalSales: sql<number>`COUNT(*)`,
      })
      .from(orderItems)
      .where(eq(orderItems.sellerId, authUser.id))

    const { totalEarnings = 0, totalSales = 0 } = result[0] || {}

    // Get pending balance (items without transfer ID)
    const pendingResult = await db
      .select({
        pendingAmount: sql<number>`COALESCE(SUM(${orderItems.sellerAmount}), 0)`,
        pendingSales: sql<number>`COUNT(*)`,
      })
      .from(orderItems)
      .where(
        and(
          eq(orderItems.sellerId, authUser.id),
          sql`${orderItems.stripeTransferId} IS NULL`
        )
      )

    const { pendingAmount = 0, pendingSales = 0 } = pendingResult[0] || {}

    // Get available balance from Stripe if connected
    let stripeBalance = null
    if (user.stripeConnectId) {
      try {
        const balance = await stripe.balance.retrieve({
          stripeAccount: user.stripeConnectId,
        })
        stripeBalance = {
          available: balance.available,
          pending: balance.pending,
        }
      } catch (error) {
        console.error('Error fetching Stripe balance:', error)
      }
    }

    return NextResponse.json({
      totalEarnings,
      totalSales,
      pendingAmount,
      pendingSales,
      availableAmount: totalEarnings - pendingAmount,
      stripeBalance,
      currency: 'eur',
    })
  } catch (error: any) {
    console.error('Error fetching seller balance:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch seller balance' },
      { status: 500 }
    )
  }
}
