import { supabase } from './client'
import { createClient } from './server'
import type { User } from '@supabase/supabase-js'

export interface AuthUser {
  id: string
  email: string
  fullName: string
  role: string
  avatar: string | null
  bio?: string | null
  website?: string | null
  socialLinks?: any
  isEmailVerified?: boolean
  isSuspended?: boolean
  stripeCustomerId?: string | null
  stripeAccountId?: string | null
  store?: any
  subscription?: any
  createdAt?: string
}

/**
 * Sign up a new user
 */
export async function signUp(
  email: string,
  password: string,
  fullName: string
): Promise<{ user: User | null; error: Error | null }> {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    },
  })

  if (error) {
    return { user: null, error }
  }

  return { user: data.user, error: null }
}

/**
 * Sign in with email and password
 */
export async function signIn(
  email: string,
  password: string
): Promise<{ user: User | null; error: Error | null }> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { user: null, error }
  }

  return { user: data.user, error: null }
}

/**
 * Sign out current user
 */
export async function signOut(): Promise<{ error: Error | null }> {
  const { error } = await supabase.auth.signOut()
  return { error }
}

/**
 * Get current user session (client-side)
 */
export async function getSession() {
  const { data, error } = await supabase.auth.getSession()
  
  if (error || !data.session) {
    return null
  }

  return data.session
}

/**
 * Get current user (client-side)
 */
export async function getCurrentUser(): Promise<User | null> {
  const { data, error } = await supabase.auth.getUser()
  
  if (error || !data.user) {
    return null
  }

  return data.user
}

/**
 * Get current user from server component
 */
export async function getServerUser() {
  const supabase = createClient()
  const { data, error } = await supabase.auth.getUser()
  
  if (error || !data.user) {
    return null
  }

  return data.user
}

/**
 * Get user profile from public.users table
 */
export async function getUserProfile(userId: string): Promise<AuthUser | null> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()

  if (error || !data) {
    return null
  }

  return {
    id: data.id,
    email: data.email,
    fullName: data.full_name,
    role: data.role,
    avatar: data.avatar,
  }
}

/**
 * Update user profile
 */
export async function updateUserProfile(
  userId: string,
  updates: {
    full_name?: string
    avatar?: string
    role?: string
  }
): Promise<{ error: Error | null }> {
  const { error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', userId)

  return { error }
}

/**
 * Send password reset email
 */
export async function resetPassword(email: string): Promise<{ error: Error | null }> {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`,
  })

  return { error }
}

/**
 * Update password
 */
export async function updatePassword(newPassword: string): Promise<{ error: Error | null }> {
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  })

  return { error }
}

/**
 * Check if email exists
 */
export async function emailExists(email: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('users')
    .select('id')
    .eq('email', email)
    .single()

  return !error && !!data
}

/**
 * Subscribe to auth state changes
 */
export function onAuthStateChange(
  callback: (user: User | null) => void
) {
  return supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user ?? null)
  })
}
