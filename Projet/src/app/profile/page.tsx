'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { User, Mail, Shield, ArrowLeft, Loader2, Save, Key, Check, X, Crown, Zap, Star, ArrowUpRight } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContextSupabase'
import { getPlanName, getPlanColor, getUploadLimit, getCommissionRate, formatFileSize } from '@/utils/helpers'

export default function ProfilePage() {
  const router = useRouter()
  const { user, loading, refreshUser } = useAuth()
  const [activeTab, setActiveTab] = useState<'info' | 'password'>('info')
  
  // Profile form
  const [profileData, setProfileData] = useState({
    fullName: '',
    email: '',
  })
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileSuccess, setProfileSuccess] = useState(false)
  const [profileError, setProfileError] = useState('')

  // Password form
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordSuccess, setPasswordSuccess] = useState(false)
  const [passwordError, setPasswordError] = useState('')

  // Email verification
  const [verificationLoading, setVerificationLoading] = useState(false)
  const [verificationSuccess, setVerificationSuccess] = useState(false)
  const [verificationError, setVerificationError] = useState('')

  useEffect(() => {
    // Don't redirect to login - let middleware handle auth
    if (user) {
      setProfileData({
        fullName: user.fullName,
        email: user.email,
      })
    }
  }, [user])

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setProfileLoading(true)
    setProfileError('')
    setProfileSuccess(false)

    try {
      const response = await fetch('/api/user/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(profileData),
      })

      const data = await response.json()

      if (data.success) {
        setProfileSuccess(true)
        await refreshUser()
        setTimeout(() => setProfileSuccess(false), 3000)
      } else {
        setProfileError(data.error || 'Error updating profile')
      }
    } catch (error) {
      setProfileError('An error occurred')
    } finally {
      setProfileLoading(false)
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordLoading(true)
    setPasswordError('')
    setPasswordSuccess(false)

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('Passwords do not match')
      setPasswordLoading(false)
      return
    }

    if (passwordData.newPassword.length < 8) {
      setPasswordError('Password must contain at least 8 characters')
      setPasswordLoading(false)
      return
    }

    try {
      const response = await fetch('/api/user/change-password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setPasswordSuccess(true)
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        })
        setTimeout(() => setPasswordSuccess(false), 3000)
      } else {
        setPasswordError(data.error || 'Error changing password')
      }
    } catch (error) {
      setPasswordError('An error occurred')
    } finally {
      setPasswordLoading(false)
    }
  }

  const handleResendVerification = async () => {
    setVerificationLoading(true)
    setVerificationError('')
    setVerificationSuccess(false)

    try {
      const response = await fetch('/api/user/resend-verification', {
        method: 'POST',
        credentials: 'include',
      })

      const data = await response.json()

      if (data.success) {
        setVerificationSuccess(true)
        // In development, show the link in console
        if (data.verificationUrl) {
          console.log('🔗 Verification link:', data.verificationUrl)
        }
        setTimeout(() => setVerificationSuccess(false), 5000)
      } else {
        setVerificationError(data.error || 'Error sending email')
      }
    } catch (error) {
      setVerificationError('An error occurred')
    } finally {
      setVerificationLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading...</p>
        </div>
      </div>
    )
  }

  // Si pas d'utilisateur après le chargement, ne rien afficher (le useEffect redirige)
  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 py-12">
      <div className="container-custom max-w-4xl">
        {/* Back button */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to dashboard
        </Link>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Account Settings</h1>
          <p className="text-slate-400">Manage your personal information and security</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('info')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${
              activeTab === 'info'
                ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                : 'bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Information
            </div>
          </button>
          <button
            onClick={() => setActiveTab('password')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${
              activeTab === 'password'
                ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                : 'bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center gap-2">
              <Key className="w-4 h-4" />
              Password
            </div>
          </button>
        </div>

        {/* Subscription Section */}
        <div className="mb-6">
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getPlanColor(user.role)} flex items-center justify-center`}>
                    {user.role === 'business' && <Crown className="w-6 h-6 text-white" />}
                    {user.role === 'premium' && <Zap className="w-6 h-6 text-white" />}
                    {user.role === 'starter' && <Star className="w-6 h-6 text-white" />}
                    {user.role === 'user' && <User className="w-6 h-6 text-white" />}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">
                      Plan {getPlanName(user.role)}
                    </h3>
                    <p className="text-slate-400 text-sm">
                      {user.role === 'user' ? 'Free account' : 'Active subscription'}
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="bg-slate-900/50 rounded-lg p-3">
                    <div className="text-slate-400 text-xs mb-1">Commission</div>
                    <div className="text-white font-bold text-lg">{getCommissionRate(user.role)}%</div>
                  </div>
                  <div className="bg-slate-900/50 rounded-lg p-3">
                    <div className="text-slate-400 text-xs mb-1">Max upload</div>
                    <div className="text-white font-bold text-lg">{formatFileSize(getUploadLimit(user.role))}</div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                {user.role === 'user' && (
                  <Link
                    href="/premium"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-purple-500/50 transition-all"
                  >
                    Go Premium
                    <ArrowUpRight className="w-4 h-4" />
                  </Link>
                )}
                {(user.role === 'starter' || user.role === 'premium') && (
                  <>
                    <Link
                      href="/premium"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-amber-500/50 transition-all whitespace-nowrap"
                    >
                      Upgrade
                      <ArrowUpRight className="w-4 h-4" />
                    </Link>
                    <button className="px-6 py-2 text-slate-400 hover:text-white text-sm transition-colors">
                      Manage subscription
                    </button>
                  </>
                )}
                {user.role === 'business' && (
                  <div className="text-right">
                    <div className="text-green-400 font-semibold text-sm mb-1">✓ Maximum plan</div>
                    <button className="text-slate-400 hover:text-white text-sm transition-colors">
                      Manage subscription
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Email Verification Warning */}
        {!user.isEmailVerified && (
          <div className="bg-orange-500/10 border border-orange-500/20 text-orange-400 p-6 rounded-2xl mb-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Mail className="w-5 h-5" />
                  <h3 className="font-semibold">Email not verified</h3>
                </div>
                <p className="text-sm text-orange-300 mb-4">
                  Please verify your email address to access all platform features.
                  {verificationSuccess && (
                    <span className="block mt-2 text-green-400 font-medium">
                      ✓ Email sent! Check your inbox.
                    </span>
                  )}
                  {verificationError && (
                    <span className="block mt-2 text-red-400 font-medium">
                      ✗ {verificationError}
                    </span>
                  )}
                </p>
                <button
                  onClick={handleResendVerification}
                  disabled={verificationLoading || verificationSuccess}
                  className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {verificationLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Sending...
                    </>
                  ) : verificationSuccess ? (
                    <>
                      <Check className="w-4 h-4" />
                      Email sent
                    </>
                  ) : (
                    'Resend verification email'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Profile Info Tab */}
        {activeTab === 'info' && (
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-white mb-6">Personal Information</h2>
            
            <form onSubmit={handleProfileSubmit} className="space-y-6">
              {profileSuccess && (
                <div className="bg-green-500/10 border border-green-500/20 text-green-400 p-4 rounded-xl text-sm flex items-center gap-2">
                  <Check className="w-5 h-5" />
                  Profile updated successfully
                </div>
              )}
              
              {profileError && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm flex items-center gap-2">
                  <X className="w-5 h-5" />
                  {profileError}
                </div>
              )}

              {/* Full Name */}
              <div className="space-y-2">
                <label htmlFor="fullName" className="text-sm font-medium text-slate-300">
                  Full Name
                </label>
                <input
                  id="fullName"
                  type="text"
                  value={profileData.fullName}
                  onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                  required
                  disabled={profileLoading}
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50"
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-slate-300">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  required
                  disabled={profileLoading}
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50"
                />
                {!user?.isEmailVerified && (
                  <p className="text-xs text-orange-400">
                    ⚠️ Email not verified - A verification link will be sent after update
                  </p>
                )}
              </div>

              {/* User Info */}
              <div className="bg-slate-900/50 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Role</span>
                  <span className="text-white font-medium capitalize">{user?.role}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Member since</span>
                  <span className="text-white font-medium">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US') : 'N/A'}
                  </span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={profileLoading}
                className="w-full py-3 px-6 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
              >
                {profileLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    <span>Save changes</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* Password Tab */}
        {activeTab === 'password' && (
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-white mb-6">Change Password</h2>
            
            <form onSubmit={handlePasswordSubmit} className="space-y-6">
              {passwordSuccess && (
                <div className="bg-green-500/10 border border-green-500/20 text-green-400 p-4 rounded-xl text-sm flex items-center gap-2">
                  <Check className="w-5 h-5" />
                  Password changed successfully
                </div>
              )}
              
              {passwordError && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm flex items-center gap-2">
                  <X className="w-5 h-5" />
                  {passwordError}
                </div>
              )}

              {/* Current Password */}
              <div className="space-y-2">
                <label htmlFor="currentPassword" className="text-sm font-medium text-slate-300">
                  Current password
                </label>
                <input
                  id="currentPassword"
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  required
                  disabled={passwordLoading}
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50"
                />
              </div>

              {/* New Password */}
              <div className="space-y-2">
                <label htmlFor="newPassword" className="text-sm font-medium text-slate-300">
                  New password
                </label>
                <input
                  id="newPassword"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  required
                  minLength={8}
                  disabled={passwordLoading}
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50"
                />
                <p className="text-xs text-slate-500">Minimum 8 characters</p>
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-sm font-medium text-slate-300">
                  Confirm new password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  required
                  minLength={8}
                  disabled={passwordLoading}
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={passwordLoading}
                className="w-full py-3 px-6 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
              >
                {passwordLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Changing...</span>
                  </>
                ) : (
                  <>
                    <Key className="w-5 h-5" />
                    <span>Change password</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
