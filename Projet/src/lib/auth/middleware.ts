import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { JWTPayload, UserRole } from '@/types'

/**
 * Get the current user from the request
 */
export function getCurrentUser(request: NextRequest): JWTPayload | null {
  try {
    const token = request.cookies.get('token')?.value

    if (!token) {
      return null
    }

    return verifyToken(token)
  } catch (error) {
    return null
  }
}

/**
 * Middleware to require authentication
 */
export function requireAuth(handler: Function) {
  return async (request: NextRequest) => {
    const user = getCurrentUser(request)

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Attach user to request for use in handler
    ;(request as any).user = user

    return handler(request)
  }
}

/**
 * Middleware to require specific roles
 */
export function requireRole(roles: UserRole[]) {
  return (handler: Function) => {
    return async (request: NextRequest) => {
      const user = getCurrentUser(request)

      if (!user) {
        return NextResponse.json(
          { success: false, error: 'Authentication required' },
          { status: 401 }
        )
      }

      if (!roles.includes(user.role)) {
        return NextResponse.json(
          { success: false, error: 'Insufficient permissions' },
          { status: 403 }
        )
      }

      ;(request as any).user = user

      return handler(request)
    }
  }
}

/**
 * Get user from request (for use in API routes)
 */
export function getUserFromRequest(request: NextRequest): JWTPayload | null {
  return getCurrentUser(request)
}
