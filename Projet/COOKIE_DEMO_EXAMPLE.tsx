/**
 * Example page to test and demonstrate cookie functionality
 * 
 * To use this page:
 * 1. Copy this file to src/app/cookie-demo/page.tsx
 * 2. Navigate to /cookie-demo in your browser
 * 3. Test cookie functionality interactively
 */

import CookieBenefitsDemo from '@/components/ui/CookieBenefitsDemo';

export default function CookieDemoPage() {
  return (
    <div className="min-h-screen bg-slate-950 py-20">
      <div className="container-custom max-w-5xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            🍪 Cookie System Demo
          </h1>
          <p className="text-xl text-slate-400">
            Test and explore the cookie consent system functionality
          </p>
        </div>

        <div className="space-y-8">
          {/* Main Demo Component */}
          <CookieBenefitsDemo />

          {/* Instructions */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
            <h2 className="text-2xl font-bold text-white mb-4">
              📖 How to Test
            </h2>
            <ol className="space-y-3 text-slate-300">
              <li className="flex items-start gap-3">
                <span className="font-bold text-blue-400">1.</span>
                <span>Accept or reject cookies using the banner (or modify preferences in the footer)</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="font-bold text-blue-400">2.</span>
                <span>Click the "Click Me!" button to see analytics tracking in action</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="font-bold text-blue-400">3.</span>
                <span>Compare personalized vs generic recommendations</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="font-bold text-blue-400">4.</span>
                <span>Open browser console to see tracking logs in real-time</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="font-bold text-blue-400">5.</span>
                <span>Change preferences via footer "Cookie Settings" to see live updates</span>
              </li>
            </ol>
          </div>

          {/* Console Log Examples */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
            <h2 className="text-2xl font-bold text-white mb-4">
              🖥️ Console Logs You'll See
            </h2>
            <div className="space-y-2 font-mono text-sm">
              <div className="bg-slate-900 p-3 rounded border border-slate-700">
                <span className="text-green-400">✅ Analytics enabled</span>
                <span className="text-slate-400"> - Ready to track user behavior</span>
              </div>
              <div className="bg-slate-900 p-3 rounded border border-slate-700">
                <span className="text-purple-400">✅ Marketing enabled</span>
                <span className="text-slate-400"> - Ready to show personalized content</span>
              </div>
              <div className="bg-slate-900 p-3 rounded border border-slate-700">
                <span className="text-blue-400">📊 [Analytics] Event tracked:</span>
                <span className="text-slate-400"> demo_button_click</span>
              </div>
              <div className="bg-slate-900 p-3 rounded border border-slate-700">
                <span className="text-yellow-400">🎯 [Marketing]</span>
                <span className="text-slate-400"> Personalized recommendations enabled</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
