import Link from 'next/link'
import { ArrowRight, Star, Shield, Zap, Users, TrendingUp, Award, Sparkles, Download, Eye } from 'lucide-react'
import FadeInOnScroll from '@/components/ui/FadeInOnScroll'

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 md:py-32">
        {/* Animated background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse-slow"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="container-custom relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full mb-8 animate-fade-in">
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span className="text-blue-400 text-sm font-medium">The Creator Marketplace</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight animate-slide-up">
              <span className="text-white">Find exceptional</span>
              <span className="block mt-2 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 text-transparent bg-clip-text">
                resources
              </span>
            </h1>
            
            <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: '0.1s' }}>
              The largest marketplace for premium content for creators: LUTs, Presets, SFX, Templates and much more.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <Link 
                href="/products"
                className="group inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-xl hover:shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 hover:scale-105"
              >
                Discover products
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link 
                href="/register"
                className="inline-flex items-center justify-center px-8 py-4 bg-slate-800 border border-slate-700 text-white font-semibold rounded-xl hover:bg-slate-700 hover:border-slate-600 transition-all duration-300"
              >
                Become a seller
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 mt-20 max-w-3xl mx-auto animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 hover:border-blue-500/50 transition-colors">
                <div className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 text-transparent bg-clip-text">
                  €2.3M+
                </div>
                <div className="text-slate-400 text-sm mt-2">Sales processed</div>
              </div>
              <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 hover:border-purple-500/50 transition-colors">
                <div className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 text-transparent bg-clip-text">
                  78K+
                </div>
                <div className="text-slate-400 text-sm mt-2">Total purchases</div>
              </div>
              <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 hover:border-pink-500/50 transition-colors">
                <div className="text-4xl font-bold bg-gradient-to-r from-pink-400 to-orange-400 text-transparent bg-clip-text">
                  42K+
                </div>
                <div className="text-slate-400 text-sm mt-2">Products</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 relative">
        <div className="container-custom">
          <FadeInOnScroll>
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Why <span className="bg-gradient-to-r from-blue-400 to-purple-400 text-transparent bg-clip-text">choose us?</span>
              </h2>
              <p className="text-xl text-slate-400 max-w-2xl mx-auto">
                A platform designed by creators, for creators
              </p>
            </div>
          </FadeInOnScroll>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FadeInOnScroll delay={100}>
              <div className="group bg-slate-800/50 backdrop-blur-sm border border-slate-700 p-8 rounded-2xl hover:border-blue-500/50 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <Zap className="h-7 w-7 text-white" />
                </div>
                <h3 className="font-bold text-xl text-white mb-2">Ultra Fast</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Instant download after purchase. Start creating in seconds.
                </p>
              </div>
            </FadeInOnScroll>

            <FadeInOnScroll delay={200}>
              <div className="group bg-slate-800/50 backdrop-blur-sm border border-slate-700 p-8 rounded-2xl hover:border-green-500/50 hover:shadow-xl hover:shadow-green-500/10 transition-all duration-300">
                <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <Shield className="h-7 w-7 text-white" />
                </div>
                <h3 className="font-bold text-xl text-white mb-2">100% Secure</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Encrypted payments via Stripe. Your data is always protected.
                </p>
              </div>
            </FadeInOnScroll>

            <FadeInOnScroll delay={300}>
              <div className="group bg-slate-800/50 backdrop-blur-sm border border-slate-700 p-8 rounded-2xl hover:border-purple-500/50 hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <TrendingUp className="h-7 w-7 text-white" />
                </div>
                <h3 className="font-bold text-xl text-white mb-2">High Earnings</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  80% of your sales go to you. Lowest commission in the market.
                </p>
              </div>
            </FadeInOnScroll>

            <FadeInOnScroll delay={400}>
              <div className="group bg-slate-800/50 backdrop-blur-sm border border-slate-700 p-8 rounded-2xl hover:border-orange-500/50 hover:shadow-xl hover:shadow-orange-500/10 transition-all duration-300">
                <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <Users className="h-7 w-7 text-white" />
                </div>
                <h3 className="font-bold text-xl text-white mb-2">24/7 Support</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  A dedicated team available at any time to help you.
                </p>
              </div>
            </FadeInOnScroll>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 relative">
        <div className="container-custom max-w-4xl">
          <FadeInOnScroll>
            <h2 className="text-4xl md:text-5xl font-bold text-center text-white mb-16">
              Frequently Asked <span className="bg-gradient-to-r from-blue-400 to-purple-400 text-transparent bg-clip-text">Questions</span>
            </h2>
          </FadeInOnScroll>

          <div className="space-y-4">
            <FadeInOnScroll delay={50}>
              <details className="group bg-slate-800/50 backdrop-blur-sm border border-slate-700 p-6 rounded-xl hover:border-slate-600 transition-colors">
              <summary className="font-semibold text-lg text-white cursor-pointer flex items-center justify-between">
                What is Creator Marketplace?
                <span className="text-slate-400 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="mt-4 text-slate-400 leading-relaxed">
                Creator Marketplace is the largest platform where you can buy and sell
                digital creations. We connect creators with buyers in a
                secure and trusted environment.
              </p>
            </details>
            </FadeInOnScroll>

            <FadeInOnScroll delay={100}>
            <details className="group bg-slate-800/50 backdrop-blur-sm border border-slate-700 p-6 rounded-xl hover:border-slate-600 transition-colors">
              <summary className="font-semibold text-lg text-white cursor-pointer flex items-center justify-between">
                How does it work?
                <span className="text-slate-400 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="mt-4 text-slate-400 leading-relaxed">
                You buy content on our marketplace and add it directly to your
                projects. Our platform provides secure transactions,
                instant downloads and detailed product information.
              </p>
              </details>
            </FadeInOnScroll>

            <FadeInOnScroll delay={150}>
              <details className="group bg-slate-800/50 backdrop-blur-sm border border-slate-700 p-6 rounded-xl hover:border-slate-600 transition-colors">
                <summary className="font-semibold text-lg text-white cursor-pointer flex items-center justify-between">
                  How do I sell on Creator Marketplace?
                <span className="text-slate-400 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="mt-4 text-slate-400 leading-relaxed">
                Click on &quot;Open a store&quot;, complete our seller registration
                process, and start uploading your creations! Our simplified process makes
                setting up your store easy.
              </p>
              </details>
            </FadeInOnScroll>

            <FadeInOnScroll delay={200}>
              <details className="group bg-slate-800/50 backdrop-blur-sm border border-slate-700 p-6 rounded-xl hover:border-slate-600 transition-colors">
                <summary className="font-semibold text-lg text-white cursor-pointer flex items-center justify-between">
                  What are the fees?
                <span className="text-slate-400 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="mt-4 text-slate-400 leading-relaxed">
                Creator Marketplace takes a 20% commission on each sale. No setup fees,
                no mandatory subscription, no hidden fees. You keep 80% of your revenue.
              </p>
              </details>
            </FadeInOnScroll>

            <FadeInOnScroll delay={250}>
              <details className="group bg-slate-800/50 backdrop-blur-sm border border-slate-700 p-6 rounded-xl hover:border-slate-600 transition-colors">
                <summary className="font-semibold text-lg text-white cursor-pointer flex items-center justify-between">
                  Where can I get help?
                <span className="text-slate-400 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="mt-4 text-slate-400 leading-relaxed">
                Support is available via our live chat on the site and our
                comprehensive knowledge base. Our team usually responds within 2 hours.
              </p>
              </details>
            </FadeInOnScroll>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
        </div>
        
        <div className="container-custom text-center relative z-10">
          <FadeInOnScroll>
            <div className="max-w-3xl mx-auto bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-3xl p-12">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Award className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Ready to get started?
              </h2>
              <p className="text-xl text-slate-300 mb-10">
                Join thousands of creators who trust Creator Marketplace
                to monetize their content
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link 
                  href="/register"
                  className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-xl hover:shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 hover:scale-105"
                >
                  Create a free account
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                <Link 
                  href="/products"
                  className="inline-flex items-center justify-center px-8 py-4 bg-slate-700 border border-slate-600 text-white font-semibold rounded-xl hover:bg-slate-600 transition-all duration-300"
                >
                  Explore products
                </Link>
              </div>
            </div>
          </FadeInOnScroll>
        </div>
      </section>
    </div>
  )
}
