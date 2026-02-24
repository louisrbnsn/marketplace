'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Lock, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [hasSession, setHasSession] = useState<boolean | null>(null)

  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Check if we have a recovery session
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setHasSession(!!session)
    }
    checkSession()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (formData.password.length < 6) {
      setError('Password must contain at least 6 characters')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ password: formData.password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'An error occurred')
      }

      setSuccess(true)
      setTimeout(() => {
        router.push('/login')
      }, 3000)
    } catch (error: any) {
      setError(error.message || 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 py-12 px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500/20 border border-green-500/30 rounded-2xl mb-4">
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Password Reset</h1>
            <p className="text-slate-400">Your password has been successfully changed</p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-8 shadow-xl text-center">
            <p className="text-slate-300 mb-2">
              Redirecting to login page...
            </p>
            <div className="flex justify-center">
              <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Checking session status
  if (hasSession === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
      </div>
    )
  }

  // No recovery session
  if (hasSession === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 py-12 px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-500/20 border border-red-500/30 rounded-2xl mb-4">
              <AlertCircle className="w-8 h-8 text-red-400" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Invalid Link</h1>
            <p className="text-slate-400">This link is not valid or has expired</p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-8 shadow-xl text-center">
            <p className="text-slate-300 mb-6">
              Please request a new reset link
            </p>
            <Link href="/forgot-password">
              <button className="w-full py-3 px-6 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-300">
                Request a new link
              </button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 py-12 px-4">
      <div className="w-full max-w-md">
        {/* Logo/Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl mb-4">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">New Password</h1>
          <p className="text-slate-400">Create your new password</p>
        </div>

        {/* Card */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-8 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm animate-slide-down">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-slate-300">
                New password
              </label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required
                disabled={isLoading}
                minLength={6}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <p className="text-xs text-slate-500">Minimum 6 characters</p>
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium text-slate-300">
                Confirm password
              </label>
              <input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData({ ...formData, confirmPassword: e.target.value })
                }
                required
                disabled={isLoading}
                minLength={6}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-6 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Resetting...</span>
                </>
              ) : (
                <>
                  <Lock className="w-5 h-5" />
                  <span>Reset password</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm">
            <Link href="/login" className="text-slate-400 hover:text-white transition-colors">
              Back to login
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
