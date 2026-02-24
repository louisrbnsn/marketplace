import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const type = requestUrl.searchParams.get('type') // 'signup' or 'recovery'
  const next = requestUrl.searchParams.get('next') || '/dashboard'

  if (code) {
    const supabase = createClient()
    
    // Exchange the code for a session
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
      console.error('❌ Auth callback error:', error)
      
      // Redirect different based on type
      const errorRedirect = type === 'recovery' 
        ? '/forgot-password?error=Link expired' 
        : '/login?error=Confirmation error'
      
      return NextResponse.redirect(
        new URL(errorRedirect, requestUrl.origin)
      )
    }

    // Successful callback - redirect based on type
    if (type === 'recovery') {
      // Password recovery - redirect to reset password page
      return NextResponse.redirect(
        new URL('/reset-password', requestUrl.origin)
      )
    } else {
      // Email confirmation - redirect to dashboard with verified flag
      return NextResponse.redirect(
        new URL(`${next}?verified=true`, requestUrl.origin)
      )
    }
  }

  // No code present, redirect to home
  return NextResponse.redirect(new URL('/', requestUrl.origin))
}
