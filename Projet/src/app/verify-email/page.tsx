'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Mail, ArrowRight } from 'lucide-react'

export default function VerifyEmailPage() {
  const router = useRouter()

  // Auto-redirect to dashboard after 10 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/dashboard')
    }, 10000)

    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 py-12 px-4">
      <div className="max-w-md w-full">
        {/* Icon */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full mb-6">
            <Mail className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-3">Verify your email</h1>
          <p className="text-slate-400 text-lg">
            A confirmation email has been sent
          </p>
        </div>

        {/* Card */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-8 shadow-xl">
          <div className="space-y-6">
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
              <p className="text-slate-300 text-sm leading-relaxed">
                📧 <strong className="text-white">Check your mailbox</strong> and click on the confirmation link to activate all features of your account.
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-3 text-sm text-slate-400">
                <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs text-slate-300">1</span>
                </div>
                <p>Look for an email from <strong className="text-slate-300">noreply@supabase.io</strong></p>
              </div>
              <div className="flex items-start gap-3 text-sm text-slate-400">
                <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs text-slate-300">2</span>
                </div>
                <p>Click on the button <strong className="text-slate-300">Confirm your email</strong></p>
              </div>
              <div className="flex items-start gap-3 text-sm text-slate-400">
                <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs text-slate-300">3</span>
                </div>
                <p>You will be automatically redirected to the dashboard</p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-700">
              <Link
                href="/dashboard"
                className="w-full py-3 px-6 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2"
              >
                <span>Go to dashboard</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <p className="text-xs text-slate-500 text-center mt-3">
                You can use the application right now
              </p>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="mt-6 text-center">
          <p className="text-sm text-slate-500">
            Didn&apos;t receive the email? Check your spam or{' '}
            <Link href="/dashboard" className="text-blue-400 hover:text-blue-300 font-medium">
              go to dashboard
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
