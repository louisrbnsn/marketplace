'use client'

import Link from 'next/link'
import { Check, Star, Zap, Crown } from 'lucide-react'

export default function PremiumPage() {
  const plans = [
    {
      name: 'Starter',
      price: '9',
      period: '/month',
      description: 'Perfect to get started',
      icon: <Star className="w-6 h-6" />,
      color: 'from-blue-500 to-cyan-500',
      borderColor: 'border-slate-700 hover:border-blue-500/50',
      features: [
        'Reduced commission to 15%',
        'Up to 10 products',
        'Upload up to 50 MB',
        'Basic statistics',
        'Starter Badge',
        'Email support',
        'Access to premium products',
      ],
      cta: 'Get Started',
      popular: false,
    },
    {
      name: 'Creator',
      price: '19',
      period: '/month',
      description: 'Most popular for creators',
      icon: <Zap className="w-6 h-6" />,
      color: 'from-purple-500 to-pink-500',
      borderColor: 'border-purple-500',
      features: [
        'Reduced commission to 10%',
        'Unlimited products',
        'Upload up to 200 MB',
        'Advanced analytics',
        'Creator Badge ⚡',
        'Priority support 24/7',
        'Access to premium products',
        '2 free featured spots/month',
        'Advanced store customization',
        'Early access features',
      ],
      cta: 'Upgrade to Creator',
      popular: true,
    },
    {
      name: 'Business',
      price: '49',
      period: '/month',
      description: 'For professionals',
      icon: <Crown className="w-6 h-6" />,
      color: 'from-amber-500 to-orange-500',
      borderColor: 'border-slate-700 hover:border-amber-500/50',
      features: [
        'Zero commission (0%)',
        'Unlimited products',
        'Upload up to 500 MB',
        'Pro analytics + exports',
        'Business Badge 👑',
        'Dedicated support + calls',
        'Access to premium products',
        '5 free featured spots/month',
        'White-label store',
        'Priority API',
        'Monthly consultation',
        'Affiliate program',
      ],
      cta: 'Upgrade to Business',
      popular: false,
    },
  ]

  const comparisonFeatures = [
    {
      category: 'Sales & Commission',
      features: [
        { name: 'Platform commission', starter: '15%', creator: '10%', business: '0%' },
        { name: 'Number of products', starter: '10', creator: 'Unlimited', business: 'Unlimited' },
        { name: 'Max file size', starter: '50 MB', creator: '200 MB', business: '500 MB' },
      ],
    },
    {
      category: 'Marketing',
      features: [
        { name: 'Free featured spots', starter: '0', creator: '2/month', business: '5/month' },
        { name: 'Special badge', starter: '✓', creator: '⚡', business: '👑' },
        { name: 'Store customization', starter: 'Basic', creator: 'Advanced', business: 'White-label' },
      ],
    },
    {
      category: 'Support & Tools',
      features: [
        { name: 'Support', starter: 'Email', creator: '24/7', business: 'Dedicated' },
        { name: 'Analytics', starter: 'Basic', creator: 'Advanced', business: 'Pro + API' },
        { name: 'Access to premium products', starter: '✓', creator: '✓', business: '✓' },
      ],
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 to-transparent"></div>
        <div className="max-w-7xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-full mb-6">
            <Star className="w-4 h-4 text-purple-400" />
            <span className="text-purple-400 font-semibold">Premium Plans</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
            Choose your{' '}
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-amber-400 text-transparent bg-clip-text">
              ideal plan
            </span>
          </h1>
          <p className="text-xl text-slate-400 mb-4 max-w-3xl mx-auto">
            Reduce your commissions, increase your visibility and access professional tools
          </p>
          <p className="text-sm text-slate-500">
            💳 No commitment • ⚡ Instant activation • ✅ Cancel anytime
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8 items-center">
            {plans.map((plan, index) => (
              <div
                key={index}
                className={`relative bg-slate-800/50 backdrop-blur-sm border-2 rounded-3xl p-8 transition-all duration-300 ${
                  plan.popular 
                    ? 'lg:scale-110 lg:shadow-2xl lg:shadow-purple-500/20 border-purple-500' 
                    : plan.borderColor
                } ${plan.popular ? 'lg:-my-8' : ''}`}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute -top-5 left-1/2 -translate-x-1/2 px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full shadow-lg">
                    <span className="text-white font-bold text-sm">⭐ MOST POPULAR</span>
                  </div>
                )}

                {/* Plan Header */}
                <div className="text-center mb-8">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${plan.color} mb-4`}>
                    <div className="text-white">
                      {plan.icon}
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                  <p className="text-slate-400 text-sm">{plan.description}</p>
                </div>

                {/* Price */}
                <div className="text-center mb-8">
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-5xl font-bold text-white">{plan.price}€</span>
                    <span className="text-slate-400">{plan.period}</span>
                  </div>
                  <p className="text-slate-500 text-sm mt-2">
                    {plan.name === 'Business' ? 'Monthly billing' : 'No commitment'}
                  </p>
                </div>

                {/* CTA Button */}
                <button
                  className={`w-full py-4 px-6 rounded-xl font-semibold transition-all duration-300 mb-8 ${
                    plan.popular
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-lg hover:shadow-purple-500/50 hover:scale-105'
                      : 'bg-slate-700 text-white hover:bg-slate-600'
                  }`}
                >
                  {plan.cta}
                </button>

                {/* Features */}
                <div className="space-y-4">
                  <p className="text-sm font-semibold text-slate-300 uppercase tracking-wide">Included:</p>
                  <ul className="space-y-3">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <Check className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                          plan.popular ? 'text-purple-400' : 'text-slate-400'
                        }`} />
                        <span className="text-slate-300 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          {/* Trust indicators */}
          <div className="mt-12 text-center">
            <p className="text-slate-400 text-sm mb-4">✓ 30-day money-back guarantee • ✓ Secure payment with Stripe</p>
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">
              Detailed comparison
            </h2>
            <p className="text-slate-400">Find the plan that perfectly matches your needs</p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left p-6 text-slate-300 font-semibold">Feature</th>
                    <th className="p-6 text-center">
                      <div className="text-blue-400 font-bold">Starter</div>
                      <div className="text-sm text-slate-500">9€/month</div>
                    </th>
                    <th className="p-6 text-center bg-purple-500/5">
                      <div className="text-purple-400 font-bold flex items-center justify-center gap-2">
                        Creator <Star className="w-4 h-4 fill-purple-400" />
                      </div>
                      <div className="text-sm text-slate-500">19€/month</div>
                    </th>
                    <th className="p-6 text-center">
                      <div className="text-amber-400 font-bold">Business</div>
                      <div className="text-sm text-slate-500">49€/month</div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonFeatures.map((section, sectionIndex) => (
                    <>
                      <tr key={`section-${sectionIndex}`} className="border-t border-slate-700">
                        <td colSpan={4} className="p-4 bg-slate-900/50">
                          <span className="text-white font-semibold text-sm uppercase tracking-wide">
                            {section.category}
                          </span>
                        </td>
                      </tr>
                      {section.features.map((feature, featureIndex) => (
                        <tr key={`feature-${sectionIndex}-${featureIndex}`} className="border-b border-slate-700/50">
                          <td className="p-4 text-slate-300">{feature.name}</td>
                          <td className="p-4 text-center text-slate-400">{feature.starter}</td>
                          <td className="p-4 text-center text-purple-400 bg-purple-500/5 font-semibold">{feature.creator}</td>
                          <td className="p-4 text-center text-amber-400 font-semibold">{feature.business}</td>
                        </tr>
                      ))}
                    </>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">Frequently asked questions</h2>
          <div className="space-y-6">
            {[
              {
                q: 'Can I change plans at any time?',
                a: 'Yes! You can upgrade or downgrade your subscription at any time. Changes take effect immediately.',
              },
              {
                q: 'What happens if I cancel my subscription?',
                a: 'You keep Premium access until the end of your paid period. After that, your account reverts to free mode with the standard 20% commission.',
              },
              {
                q: 'Are the commissions really reduced?',
                a: 'Absolutely! Starter: 15%, Creator: 10%, Business: 0%. You keep more of your earnings with each sale.',
              },
              {
                q: 'Is there a commitment?',
                a: 'No commitment. All our plans are contract-free and you can cancel at any time.',
              },
            ].map((faq, index) => (
              <div key={index} className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
                <h3 className="text-white font-semibold mb-2">{faq.q}</h3>
                <p className="text-slate-400">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="relative bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-amber-500/10 border border-purple-500/20 rounded-3xl p-12 text-center overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent"></div>
            <div className="relative">
              <h2 className="text-4xl font-bold text-white mb-4">
                Ready to boost your income?
              </h2>
              <p className="text-xl text-slate-300 mb-8">
                Join over 500 Premium creators and keep more of your earnings
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-300 hover:scale-105"
                >
                  Create my free account
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center px-8 py-4 bg-slate-700 border border-slate-600 text-white font-semibold rounded-xl hover:bg-slate-600 transition-all duration-300"
                >
                  Contact sales
                </Link>
              </div>
              <p className="text-slate-500 text-sm mt-6">
                🎁 Launch offer: First month at -50% with code LAUNCH50
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
