import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { JWTPayload } from '@/types'

const JWT_SECRET: string = process.env.JWT_SECRET || 'fallback-secret-for-build-only'
const JWT_EXPIRES_IN: string = process.env.JWT_EXPIRES_IN || '7d'

if (!process.env.JWT_SECRET && process.env.NODE_ENV !== 'production') {
  console.warn('⚠️  JWT_SECRET is not defined. Using fallback for development.')
}

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  // 8 rounds for dev (fast), 12 for production (secure)
  const saltRounds = process.env.NODE_ENV === 'production' ? 12 : 8
  const salt = await bcrypt.genSalt(saltRounds)
  return bcrypt.hash(password, salt)
}

/**
 * Compare a password with a hash
 */
export async function comparePassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

/**
 * Generate a JWT token
 */
export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  } as jwt.SignOptions)
}

/**
 * Verify and decode a JWT token
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET as jwt.Secret) as JWTPayload
  } catch (error) {
    return null
  }
}

/**
 * Generate a random token for email verification or password reset
 */
export function generateRandomToken(): string {
  return Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
}
