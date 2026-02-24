import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function TermsPage() {
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
        <div className="mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            Terms of Service
          </h1>
          <p className="text-slate-400">Last updated: February 20, 2026</p>
        </div>

        {/* Content */}
        <div className="prose prose-invert prose-slate max-w-none">
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-8 space-y-8">
            
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">1. Acceptance of Terms</h2>
              <p className="text-slate-300 leading-relaxed">
                By accessing and using Creator Marketplace ("the Platform"), you agree to be bound by these terms of service. If you do not accept these terms, please do not use the Platform.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">2. Service Description</h2>
              <p className="text-slate-300 leading-relaxed mb-3">
                Creator Marketplace is a marketplace platform that allows:
              </p>
              <ul className="list-disc list-inside text-slate-300 space-y-2">
                <li>Creators to sell their digital products (LUTs, presets, SFX, templates, etc.)</li>
                <li>Buyers to discover and purchase creative resources</li>
                <li>Transaction management through our secure payment partner Stripe</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">3. Account Creation</h2>
              <p className="text-slate-300 leading-relaxed mb-3">
                To use certain features, you must create an account:
              </p>
              <ul className="list-disc list-inside text-slate-300 space-y-2">
                <li>You must be at least 18 years old</li>
                <li>You must provide accurate and up-to-date information</li>
                <li>You are responsible for the confidentiality of your password</li>
                <li>You may not share your account</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">4. For Sellers</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">4.1 Selling Terms</h3>
                  <ul className="list-disc list-inside text-slate-300 space-y-2">
                    <li>You must be the legitimate owner or have the rights to sell the products</li>
                    <li>Products must not infringe copyright</li>
                    <li>Product descriptions must be honest and accurate</li>
                    <li>You accept our 20% commission on each sale</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">4.2 Prohibited Content</h3>
                  <ul className="list-disc list-inside text-slate-300 space-y-2">
                    <li>Illegal, offensive or inappropriate content</li>
                    <li>Malicious software or viruses</li>
                    <li>Counterfeit or pirated products</li>
                    <li>Content violating intellectual property</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">5. For Buyers</h2>
              <ul className="list-disc list-inside text-slate-300 space-y-2">
                <li>Purchases are generally non-refundable once the product is downloaded</li>
                <li>You purchase a usage license, not ownership of the product</li>
                <li>You may not resell or redistribute purchased products</li>
                <li>Usage licenses are defined by each seller</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">6. Payments and Commissions</h2>
              <ul className="list-disc list-inside text-slate-300 space-y-2">
                <li>All payments are processed by Stripe</li>
                <li>A 20% commission is charged on each sale</li>
                <li>Sellers are paid via Stripe Connect</li>
                <li>Stripe transaction fees are the seller's responsibility</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">7. Intellectual Property</h2>
              <p className="text-slate-300 leading-relaxed">
                The Platform and its content (excluding seller products) are protected by copyright. You may not copy, reproduce or distribute our content without authorization.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">8. Termination</h2>
              <p className="text-slate-300 leading-relaxed">
                We reserve the right to suspend or delete your account in case of violation of these terms, without notice or refund.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">9. Limitation of Liability</h2>
              <p className="text-slate-300 leading-relaxed">
                Creator Marketplace acts as an intermediary. We are not responsible for the quality of products sold or disputes between buyers and sellers. The Platform is provided "as is" without warranty.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">10. Modifications</h2>
              <p className="text-slate-300 leading-relaxed">
                We may modify these terms at any time. Changes will take effect upon publication on the Platform. Your continued use constitutes your acceptance of the new terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">11. Applicable Law</h2>
              <p className="text-slate-300 leading-relaxed">
                These terms are governed by French law. Any dispute will be subject to the exclusive jurisdiction of French courts.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">12. Contact</h2>
              <p className="text-slate-300 leading-relaxed">
                For any questions regarding these terms, contact us at: <a href="mailto:legal@creatormarket.com" className="text-blue-400 hover:text-blue-300">legal@creatormarket.com</a>
              </p>
            </section>

          </div>
        </div>
      </div>
    </div>
  )
}
