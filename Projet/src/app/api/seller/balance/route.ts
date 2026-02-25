import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'

export const dynamic = 'force-dynamic'

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
    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUser.id)
      .single()

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get balance from database (sum of all completed order items)
    const { data: totalData } = await supabase
      .from('order_items')
      .select('seller_amount')
      .eq('seller_id', authUser.id)

    const totalEarnings = totalData?.reduce((sum, item) => sum + (item.seller_amount || 0), 0) || 0
    const totalSales = totalData?.length || 0

    // Get pending balance (items without transfer ID)
    const { data: pendingData } = await supabase
      .from('order_items')
      .select('seller_amount')
      .eq('seller_id', authUser.id)
      .is('stripe_transfer_id', null)

    const pendingAmount = pendingData?.reduce((sum, item) => sum + (item.seller_amount || 0), 0) || 0
    const pendingSales = pendingData?.length || 0

    // Get available balance from Stripe if connected
    let stripeBalance = null
    if (user.stripe_connect_id) {
      try {
        const balance = await stripe.balance.retrieve({
          stripeAccount: user.stripe_connect_id,
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
