import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function PrivacyPage() {
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
            Privacy Policy
          </h1>
          <p className="text-slate-400">Last updated: February 20, 2026</p>
        </div>

        {/* Content */}
        <div className="prose prose-invert prose-slate max-w-none">
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-8 space-y-8">
            
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">1. Introduction</h2>
              <p className="text-slate-300 leading-relaxed">
                Creator Marketplace ("we", "our") is committed to protecting your privacy. This privacy policy explains how we collect, use and protect your personal data in accordance with GDPR (General Data Protection Regulation).
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">2. Data Collected</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">2.1 Identification Information</h3>
                  <ul className="list-disc list-inside text-slate-300 space-y-2">
                    <li>Full name</li>
                    <li>Email address</li>
                    <li>Password (encrypted)</li>
                    <li>Profile picture (optional)</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">2.2 Store Data (for sellers)</h3>
                  <ul className="list-disc list-inside text-slate-300 space-y-2">
                    <li>Store name</li>
                    <li>Description and logo</li>
                    <li>Social media links</li>
                    <li>Stripe Connect payment information</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">2.3 Transaction Data</h3>
                  <ul className="list-disc list-inside text-slate-300 space-y-2">
                    <li>Purchase and sales history</li>
                    <li>Transaction amounts</li>
                    <li>Order dates and details</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">2.4 Technical Data</h3>
                  <ul className="list-disc list-inside text-slate-300 space-y-2">
                    <li>IP address</li>
                    <li>Browser type</li>
                    <li>Pages visited</li>
                    <li>Cookies and session data</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">3. Data Usage</h2>
              <p className="text-slate-300 leading-relaxed mb-3">We use your data to:</p>
              <ul className="list-disc list-inside text-slate-300 space-y-2">
                <li>Manage your account and authentication</li>
                <li>Process your transactions and payments</li>
                <li>Display your products and store</li>
                <li>Send you important notifications (orders, payments)</li>
                <li>Improve our services and user experience</li>
                <li>Prevent fraud and ensure security</li>
                <li>Comply with our legal obligations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">4. Data Sharing</h2>
              <p className="text-slate-300 leading-relaxed mb-3">We share your data only in the following cases:</p>
              <ul className="list-disc list-inside text-slate-300 space-y-2">
                <li><strong className="text-white">Stripe:</strong> For payment processing (subject to their own privacy policy)</li>
                <li><strong className="text-white">Public information:</strong> Store name, products, reviews are publicly visible</li>
                <li><strong className="text-white">Legal obligations:</strong> If required by law or a competent authority</li>
              </ul>
              <p className="text-slate-300 leading-relaxed mt-3">
                We never sell your personal data to third parties.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">5. Cookies</h2>
              <p className="text-slate-300 leading-relaxed mb-3">
                We use cookies for:
              </p>
              <ul className="list-disc list-inside text-slate-300 space-y-2">
                <li><strong className="text-white">Essential cookies:</strong> Authentication and cart (mandatory)</li>
                <li><strong className="text-white">Analytics cookies:</strong> Usage statistics (with your consent)</li>
                <li><strong className="text-white">Preference cookies:</strong> Remember your choices (with your consent)</li>
              </ul>
              <p className="text-slate-300 leading-relaxed mt-3">
                You can manage cookies in your browser settings.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">6. Data Security</h2>
              <p className="text-slate-300 leading-relaxed">
                We implement technical and organizational security measures to protect your data:
              </p>
              <ul className="list-disc list-inside text-slate-300 space-y-2 mt-3">
                <li>Password encryption (bcrypt)</li>
                <li>HTTPS/SSL connections</li>
                <li>Secure storage on protected servers</li>
                <li>Limited access to personal data</li>
                <li>Regular backups</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">7. Your Rights (GDPR)</h2>
              <p className="text-slate-300 leading-relaxed mb-3">
                In accordance with GDPR, you have the following rights:
              </p>
              <ul className="list-disc list-inside text-slate-300 space-y-2">
                <li><strong className="text-white">Right of access:</strong> View your personal data</li>
                <li><strong className="text-white">Right to rectification:</strong> Correct inaccurate data</li>
                <li><strong className="text-white">Right to erasure:</strong> Delete your data ("right to be forgotten")</li>
                <li><strong className="text-white">Right to portability:</strong> Retrieve your data in a structured format</li>
                <li><strong className="text-white">Right to object:</strong> Oppose the processing of your data</li>
                <li><strong className="text-white">Right to restriction:</strong> Limit processing in certain cases</li>
              </ul>
              <p className="text-slate-300 leading-relaxed mt-3">
                To exercise these rights, contact us at: <a href="mailto:privacy@creatormarket.com" className="text-blue-400 hover:text-blue-300">privacy@creatormarket.com</a>
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">8. Data Retention</h2>
              <ul className="list-disc list-inside text-slate-300 space-y-2">
                <li><strong className="text-white">Active account:</strong> As long as your account exists</li>
                <li><strong className="text-white">Transaction data:</strong> 10 years for tax obligations</li>
                <li><strong className="text-white">Security logs:</strong> 12 months</li>
                <li><strong className="text-white">Deleted account:</strong> 30 days then permanent deletion (except legal obligations)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">9. International Transfers</h2>
              <p className="text-slate-300 leading-relaxed">
                Your data is mainly stored in the European Union. If transfers to third countries are necessary (e.g. Stripe in the USA), we ensure that they comply with appropriate GDPR safeguards.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">10. Minors</h2>
              <p className="text-slate-300 leading-relaxed">
                Our service is intended for people aged 18 and over. We do not knowingly collect data from users under 18 years of age.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">11. Modifications</h2>
              <p className="text-slate-300 leading-relaxed">
                We may modify this privacy policy. Any changes will be posted on this page with a new update date. Significant changes will be notified to you by email.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">12. Contact</h2>
              <p className="text-slate-300 leading-relaxed">
                For any questions regarding this policy or your personal data:
              </p>
              <ul className="list-none text-slate-300 space-y-2 mt-3">
                <li>📧 Email: <a href="mailto:privacy@creatormarket.com" className="text-blue-400 hover:text-blue-300">privacy@creatormarket.com</a></li>
                <li>📄 DPO (Data Protection Officer): <a href="mailto:dpo@creatormarket.com" className="text-blue-400 hover:text-blue-300">dpo@creatormarket.com</a></li>
              </ul>
              <p className="text-slate-300 leading-relaxed mt-4">
                You also have the right to file a complaint with the CNIL (Commission Nationale de l'Informatique et des Libertés): <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">www.cnil.fr</a>
              </p>
            </section>

          </div>
        </div>
      </div>
    </div>
  )
}
