'use client';

import { useCookieConsent } from '@/contexts/CookieContext';
import { trackEvent, canShowMarketing, getRecommendations } from '@/utils/tracking';
import { useEffect, useState } from 'react';

/**
 * Example component showing real benefits of enabled cookies
 * This can be added to any page to demonstrate cookie functionality
 */
export default function CookieBenefitsDemo() {
  const { hasAnalytics, hasMarketing } = useCookieConsent();
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [clicks, setClicks] = useState(0);

  useEffect(() => {
    // Load recommendations based on cookie consent
    setRecommendations(getRecommendations());
  }, [hasMarketing]);

  const handleTestClick = () => {
    setClicks(prev => prev + 1);
    
    // This event will only be tracked if analytics cookies are enabled
    trackEvent('demo_button_click', {
      click_count: clicks + 1,
      feature: 'cookie_demo',
    });
  };

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 space-y-6">
      <div>
        <h3 className="text-xl font-bold text-white mb-2">
          🎁 Cookie Benefits Demo
        </h3>
        <p className="text-sm text-slate-400">
          See what you get when you enable different types of cookies!
        </p>
      </div>

      {/* Analytics Benefits */}
      <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">📊</span>
          <h4 className="font-semibold text-white">Analytics Cookies</h4>
          {hasAnalytics ? (
            <span className="ml-auto px-2 py-1 bg-blue-900/40 text-blue-400 text-xs rounded-full border border-blue-800/50">
              Active
            </span>
          ) : (
            <span className="ml-auto px-2 py-1 bg-slate-700 text-slate-400 text-xs rounded-full">
              Disabled
            </span>
          )}
        </div>
        
        <div className="space-y-3">
          <p className="text-sm text-slate-300">
            {hasAnalytics 
              ? '✅ Your interactions help us improve the site!' 
              : '❌ We cannot track site improvements without your consent.'}
          </p>
          
          <div>
            <button
              onClick={handleTestClick}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Click Me! (Tracked: {clicks})
            </button>
            <p className="text-xs text-slate-400 mt-2">
              {hasAnalytics 
                ? '✓ This click is being tracked to improve user experience' 
                : '✗ This click is not tracked (enable analytics to help us improve)'}
            </p>
          </div>
        </div>
      </div>

      {/* Marketing Benefits */}
      <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">🎯</span>
          <h4 className="font-semibold text-white">Marketing Cookies</h4>
          {hasMarketing ? (
            <span className="ml-auto px-2 py-1 bg-purple-900/40 text-purple-400 text-xs rounded-full border border-purple-800/50">
              Active
            </span>
          ) : (
            <span className="ml-auto px-2 py-1 bg-slate-700 text-slate-400 text-xs rounded-full">
              Disabled
            </span>
          )}
        </div>
        
        <div className="space-y-3">
          <p className="text-sm text-slate-300">
            {hasMarketing 
              ? '✅ Enjoy personalized content and recommendations!' 
              : '❌ You are seeing generic content only.'}
          </p>
          
          <div className="space-y-2">
            <p className="text-xs font-medium text-slate-400">
              {hasMarketing ? 'Personalized for you:' : 'Generic recommendations:'}
            </p>
            {recommendations.map((item, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg border ${
                  hasMarketing
                    ? 'bg-purple-900/20 border-purple-800/50 text-purple-300'
                    : 'bg-slate-800 border-slate-700 text-slate-400'
                }`}
              >
                <div className="flex items-center gap-2">
                  {hasMarketing ? '⭐' : '📦'}
                  <span className="text-sm font-medium">{item}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Combined Benefits */}
      {hasAnalytics && hasMarketing && (
        <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-lg p-4 border border-blue-800/50">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎉</span>
            <div>
              <h4 className="font-semibold text-white">Full Experience Unlocked!</h4>
              <p className="text-sm text-slate-300 mt-1">
                Thank you! You're getting the best personalized experience with helpful analytics.
              </p>
            </div>
          </div>
        </div>
      )}

      {!hasAnalytics && !hasMarketing && (
        <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
          <div className="flex items-center gap-2">
            <span className="text-xl">ℹ️</span>
            <p className="text-sm text-slate-300">
              Enable analytics and marketing cookies to unlock personalized features!
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
