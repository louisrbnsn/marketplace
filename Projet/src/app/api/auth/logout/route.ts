import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    
    await supabase.auth.signOut()

    return NextResponse.json(
      {
        success: true,
        message: 'Logout successful',
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { success: false, error: 'Error during logout' },
      { status: 500 }
    )
  }
}
