'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Mail, MessageSquare, Send, Check, X } from 'lucide-react'

export default function ContactPage() {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)

    // Simulation of sending (to be implemented with a real API)
    setTimeout(() => {
      setSuccess(true)
      setLoading(false)
      setFormData({ name: '', email: '', subject: '', message: '' })
    }, 1500)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 py-12">
      <div className="container-custom max-w-4xl">
        {/* Back button */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">Contact us</h1>
          <p className="text-slate-400 text-lg">
            A question? A problem? Our team responds within 24 hours
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {/* Info Cards */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 text-center">
            <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Mail className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="font-semibold text-white mb-2">Email</h3>
            <p className="text-sm text-slate-400">support@creatormarket.com</p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 text-center">
            <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="font-semibold text-white mb-2">Live chat</h3>
            <p className="text-sm text-slate-400">Mon-Fri 9am-6pm</p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 text-center">
            <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Check className="w-6 h-6 text-green-400" />
            </div>
            <h3 className="font-semibold text-white mb-2">Fast response</h3>
            <p className="text-sm text-slate-400">Within 24 business hours</p>
          </div>
        </div>

        {/* Contact Form */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-white mb-6">Send us a message</h2>

          {success && (
            <div className="bg-green-500/10 border border-green-500/20 text-green-400 p-4 rounded-xl text-sm flex items-center gap-2 mb-6">
              <Check className="w-5 h-5" />
              Message sent successfully! We will respond to you as soon as possible.
            </div>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm flex items-center gap-2 mb-6">
              <X className="w-5 h-5" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Name */}
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium text-slate-300">
                  Full name <span className="text-red-400">*</span>
                </label>
                <input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  disabled={loading}
                  placeholder="John Doe"
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50"
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-slate-300">
                  Email <span className="text-red-400">*</span>
                </label>
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  disabled={loading}
                  placeholder="john@example.com"
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50"
                />
              </div>
            </div>

            {/* Subject */}
            <div className="space-y-2">
              <label htmlFor="subject" className="text-sm font-medium text-slate-300">
                Subject <span className="text-red-400">*</span>
              </label>
              <input
                id="subject"
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                required
                disabled={loading}
                placeholder="How can I help you?"
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50"
              />
            </div>

            {/* Message */}
            <div className="space-y-2">
              <label htmlFor="message" className="text-sm font-medium text-slate-300">
                Message <span className="text-red-400">*</span>
              </label>
              <textarea
                id="message"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                required
                rows={6}
                disabled={loading}
                placeholder="Describe your request in detail..."
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50 resize-none"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Send message
                </>
              )}
            </button>
          </form>
        </div>

        {/* FAQ Link */}
        <div className="mt-8 text-center">
          <p className="text-slate-400 mb-4">Check our FAQ first, you might find your answer there!</p>
          <Link
            href="/faq"
            className="text-blue-400 hover:text-blue-300 font-semibold transition-colors"
          >
            View FAQ →
          </Link>
        </div>
      </div>
    </div>
  )
}
