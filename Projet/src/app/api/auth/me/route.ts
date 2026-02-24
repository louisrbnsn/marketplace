import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Get user profile with store and subscription
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select(`
        *,
        store:stores(*),
        subscription:subscriptions(*)
      `)
      .eq('id', user.id)
      .single()

    if (profileError) {
      console.error('Profile fetch error:', profileError)
      return NextResponse.json(
        { success: false, error: 'Error fetching profile' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            fullName: profile?.full_name,
            role: profile?.role || 'user',
            avatar: profile?.avatar,
            bio: profile?.bio,
            website: profile?.website,
            socialLinks: profile?.social_links,
            isEmailVerified: user.email_confirmed_at !== null,
            isSuspended: profile?.is_suspended || false,
            stripeCustomerId: profile?.stripe_customer_id,
            stripeAccountId: profile?.stripe_account_id,
            store: profile?.store,
            subscription: profile?.subscription,
            createdAt: profile?.created_at,
          },
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Get user error:', error)
    return NextResponse.json(
      { success: false, error: 'Error fetching data' },
      { status: 500 }
    )
  }
}
