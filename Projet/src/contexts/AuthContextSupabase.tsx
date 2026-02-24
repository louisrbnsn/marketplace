'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase/client'
import type { AuthUser } from '@/lib/supabase/auth'

interface AuthContextType {
  user: AuthUser | null
  supabaseUser: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, fullName: string) => Promise<void>
  signOut: () => Promise<void>
  refreshUser: () => Promise<void>
  // Aliases for backward compatibility
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, fullName: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [supabaseUser, setSupabaseUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Fetch user profile from public.users table
  const fetchUserProfile = async (userId: string): Promise<AuthUser | null> => {
    try {
      // Requête simplifiée sans subscriptions (table qui n'existe pas)
      const { data, error } = await supabase
        .from('users')
        .select(`
          *,
          store:stores(*)
        `)
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Failed to fetch user profile:', error)
        return null
      }

      if (!data) {
        return null
      }

      return {
        id: data.id,
        email: data.email,
        fullName: data.full_name,
        role: data.role,
        avatar: data.avatar,
        bio: data.bio,
        website: data.website,
        socialLinks: data.social_links,
        isEmailVerified: true, // Supabase handles this
        isSuspended: data.is_suspended,
        stripeCustomerId: data.stripe_customer_id,
        stripeAccountId: data.stripe_connect_id, // Nom correct dans la BDD
        store: Array.isArray(data.store) ? data.store[0] : data.store,
        subscription: null, // Pas de table subscriptions pour le moment
        createdAt: data.created_at,
      }
    } catch (err) {
      return null
    }
  }

  // Initialize auth state
  useEffect(() => {
    let mounted = true

    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session?.user && mounted) {
          setSupabaseUser(session.user)
          const profile = await fetchUserProfile(session.user.id)
          
          if (profile && mounted) {
            setUser(profile)
          } else if (mounted) {
            await supabase.auth.signOut()
          }
        }
      } catch (error) {
        // Silent error handling
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    // Run only once on mount
    initAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return

        if (session?.user) {
          setSupabaseUser(session.user)
          const profile = await fetchUserProfile(session.user.id)
          
          if (profile && mounted) {
            setUser(profile)
          }
        } else {
          setSupabaseUser(null)
          setUser(null)
        }
        
        if (mounted) {
          setLoading(false)
        }
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, []) // Empty dependency array - run only once

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        throw error
      }

      // Update state immediately for faster UI response
      if (data.user) {
        setSupabaseUser(data.user)
        let profile = await fetchUserProfile(data.user.id)
        
        // Si le profil n'existe pas, le créer
        if (!profile) {
          console.log('Missing profile, creating...')
          
          const { error: insertError } = await supabase
            .from('users')
            .insert({
              id: data.user.id,
              email: data.user.email,
              full_name: data.user.user_metadata?.full_name || 'User',
              role: 'buyer',
            })
          
          if (insertError) {
            console.error('Profile creation error:', insertError)
          } else {
            // Récupérer le profil créé
            profile = await fetchUserProfile(data.user.id)
          }
        }
        
        if (profile) {
          setUser(profile)
        }
      }
    } catch (error: any) {
      throw new Error(error.message || 'Failed to sign in')
    }
  }

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
          // Désactiver la confirmation d'email
          emailRedirectTo: undefined,
        },
      })

      if (error) throw error

      // Update state immediately if session is available
      if (data.user && data.session) {
        setSupabaseUser(data.user)
        const profile = await fetchUserProfile(data.user.id)
        if (profile) {
          setUser(profile)
        }
      }
    } catch (error: any) {
      throw new Error(error.message || 'Failed to sign up')
    }
  }

  const signOut = async () => {
    try {
      setSupabaseUser(null)
      setUser(null)
      await supabase.auth.signOut()
      window.location.href = '/'
    } catch (error: any) {
      throw new Error(error.message || 'Failed to sign out')
    }
  }

  const refreshUser = async () => {
    if (supabaseUser) {
      const profile = await fetchUserProfile(supabaseUser.id)
      setUser(profile)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        supabaseUser,
        loading,
        signIn,
        signUp,
        signOut,
        refreshUser,
        // Aliases for backward compatibility
        login: signIn,
        register: signUp,
        logout: signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
