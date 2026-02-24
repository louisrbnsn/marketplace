'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, ChevronDown, ChevronUp } from 'lucide-react'

const faqData = [
  {
    category: 'General',
    questions: [
      {
        q: 'What is Creator Marketplace?',
        a: 'Creator Marketplace is a platform that allows content creators to sell their digital products (LUTs, presets, SFX, templates, etc.) and buyers to discover professional quality resources.',
      },
      {
        q: 'How do I create an account?',
        a: 'Click on "Sign Up" at the top of the page, fill out the form with your email and password. You will receive a confirmation email to activate your account.',
      },
      {
        q: 'Is it free?',
        a: 'Creating an account is free. For sellers, we take a 20% commission on each sale. Buyers only pay the product price.',
      },
    ],
  },
  {
    category: 'For buyers',
    questions: [
      {
        q: 'How do I buy a product?',
        a: 'Browse products, add them to your cart, then click "Checkout". You will be redirected to secure Stripe payment. After payment, you will receive a download link by email.',
      },
      {
        q: 'What payment methods do you accept?',
        a: 'We accept all credit cards (Visa, Mastercard, American Express) through our secure payment partner Stripe.',
      },
      {
        q: 'Can I get a refund?',
        a: 'Digital products are generally not refundable once downloaded. Contact us if you encounter a technical problem with a product.',
      },
      {
        q: 'Where can I find my purchases?',
        a: 'Log in to your account and go to "My Profile". You will find the history of your purchases and download links there.',
      },
    ],
  },
  {
    category: 'For sellers',
    questions: [
      {
        q: 'How do I start selling?',
        a: 'After creating your account, go to your dashboard and create your store. Once validated, you can add your products.',
      },
      {
        q: 'What types of products can I sell?',
        a: 'You can sell LUTs, Lightroom/Camera Raw presets, sound effects, templates (After Effects, Premiere Pro), overlays, packs and other digital resources.',
      },
      {
        q: 'What is the commission?',
        a: 'We take a 20% commission on each sale. You receive 80% of the sale price directly to your Stripe Connect account.',
      },
      {
        q: 'When do I get paid?',
        a: 'Payments are automatically transferred to your Stripe Connect account according to their payment schedule (typically within 2-7 days).',
      },
      {
        q: 'How do I set my prices?',
        a: 'You are free to set your prices. Analyze the market and competition to offer competitive prices. You can also offer free products.',
      },
    ],
  },
  {
    category: 'Premium',
    questions: [
      {
        q: 'What is Premium status?',
        a: 'Premium status gives access to exclusive products reserved for Premium members, special discounts and other benefits.',
      },
      {
        q: 'How much does Premium cost?',
        a: 'Premium subscription costs 9.99€/month or 99€/year (save 17%).',
      },
      {
        q: 'Can I cancel my subscription?',
        a: 'Yes, you can cancel your subscription at any time from your profile. You will keep Premium access until the end of the paid period.',
      },
    ],
  },
  {
    category: 'Technical',
    questions: [
      {
        q: 'What file formats are accepted?',
        a: 'For products: .cube (LUTs), .xmp/.lrtemplate (Presets), .wav/.mp3 (Audio), .aep/.prproj (Templates), .zip (Packs). For images: JPG, PNG, WebP.',
      },
      {
        q: 'What is the maximum file size?',
        a: 'The maximum size is 500 MB per file. For larger files, compress them to .zip.',
      },
      {
        q: 'I have a problem with a download',
        a: 'Check your internet connection and try again. If the problem persists, contact our support with the order number.',
      },
    ],
  },
]

export default function FAQPage() {
  const [openItems, setOpenItems] = useState<string[]>([])

  const toggleItem = (id: string) => {
    setOpenItems(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    )
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
          <h1 className="text-5xl font-bold text-white mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-slate-400 text-lg">
            Find quick answers to your questions
          </p>
        </div>

        {/* FAQ Sections */}
        <div className="space-y-8">
          {faqData.map((section, sectionIndex) => (
            <div key={sectionIndex}>
              <h2 className="text-2xl font-bold text-white mb-4">
                {section.category}
              </h2>
              <div className="space-y-3">
                {section.questions.map((item, itemIndex) => {
                  const id = `${sectionIndex}-${itemIndex}`
                  const isOpen = openItems.includes(id)

                  return (
                    <div
                      key={id}
                      className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl overflow-hidden hover:border-blue-500/50 transition-all"
                    >
                      <button
                        onClick={() => toggleItem(id)}
                        className="w-full px-6 py-4 flex items-center justify-between text-left"
                      >
                        <span className="font-semibold text-white pr-4">
                          {item.q}
                        </span>
                        {isOpen ? (
                          <ChevronUp className="w-5 h-5 text-blue-400 flex-shrink-0" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-slate-400 flex-shrink-0" />
                        )}
                      </button>
                      {isOpen && (
                        <div className="px-6 pb-4 text-slate-300 leading-relaxed">
                          {item.a}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Contact CTA */}
        <div className="mt-16 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-2xl p-8 text-center">
          <h3 className="text-2xl font-bold text-white mb-3">
            Can't find your answer?
          </h3>
          <p className="text-slate-400 mb-6">
            Our team is here to help you
          </p>
          <Link
            href="/contact"
            className="inline-block px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-blue-500/50 transition-all"
          >
            Contact us
          </Link>
        </div>
      </div>
    </div>
  )
}
