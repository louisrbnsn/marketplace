'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface User {
  id: string
  email: string
  fullName: string
  role: string
  avatar: string | null
  isEmailVerified: boolean
  createdAt: string
  store?: {
    id: string
    name: string
    slug: string
    description: string | null
    logo: string | null
    banner: string | null
    createdAt: string
  } | null
  subscription?: any | null
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  register: (email: string, password: string, fullName: string) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      console.log('🔍 AuthContext: Checking authentication...')
      const response = await fetch('/api/auth/me', {
        credentials: 'include',
        cache: 'no-store',
      })
      
      const data = await response.json()
      console.log('📦 AuthContext: Response:', data)
      
      if (data.success && data.data.user) {
        console.log('✅ AuthContext: User authenticated:', data.data.user.email)
        setUser(data.data.user)
      } else {
        console.log('❌ AuthContext: Not authenticated')
        setUser(null)
      }
    } catch (error) {
      console.error('❌ AuthContext: Error checking auth:', error)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    try {
      console.log('🔐 AuthContext: Logging in...')
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()
      console.log('📦 AuthContext: Login response:', data)

      if (data.success) {
        setUser(data.data.user)
        console.log('✅ AuthContext: Login successful')
        return { success: true }
      } else {
        console.log('❌ AuthContext: Login failed:', data.error)
        return { success: false, error: data.error }
      }
    } catch (error) {
      console.error('❌ AuthContext: Login error:', error)
      return { success: false, error: 'Connection error' }
    }
  }

  const register = async (email: string, password: string, fullName: string) => {
    try {
      console.log('📝 AuthContext: Registering...')
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password, fullName }),
      })

      const data = await response.json()
      console.log('📦 AuthContext: Register response:', data)

      if (data.success) {
        setUser(data.data.user)
        console.log('✅ AuthContext: Registration successful')
        return { success: true }
      } else {
        console.log('❌ AuthContext: Registration failed:', data.error)
        return { success: false, error: data.error }
      }
    } catch (error) {
      console.error('❌ AuthContext: Registration error:', error)
      return { success: false, error: 'Registration error' }
    }
  }

  const logout = async () => {
    try {
      console.log('🚪 AuthContext: Logging out...')
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      })
      setUser(null)
      console.log('✅ AuthContext: Logout successful')
      window.location.href = '/'
    } catch (error) {
      console.error('❌ AuthContext: Logout error:', error)
    }
  }

  const refreshUser = async () => {
    await checkAuth()
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
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
