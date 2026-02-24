import { NextRequest, NextResponse } from 'next/server'

// Cette route n'est plus nécessaire - la vérification email est gérée par /auth/callback
// Redirigé vers la page d'accueil
export async function GET(request: NextRequest) {
  return NextResponse.redirect(new URL('/', request.url))
}
