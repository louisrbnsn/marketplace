'use client';

import { useState, useEffect } from 'react';
import { hasConsent, saveCookieConsent } from '@/utils/cookies';
import { useCookieConsent } from '@/contexts/CookieContext';

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState({
    necessary: true,
    analytics: false,
    marketing: false,
  });
  const { refreshConsent, showSettings: showFromContext, closeSettings } = useCookieConsent();

  useEffect(() => {
    // Check if user has already given consent
    const consent = hasConsent();
    if (!consent) {
      // Small delay for better UX
      setTimeout(() => setShowBanner(true), 500);
    }
  }, []);

  // Show settings when triggered from footer
  useEffect(() => {
    if (showFromContext) {
      setShowBanner(true);
      setShowSettings(true);
    }
  }, [showFromContext]);

  const handleAcceptAll = () => {
    saveCookieConsent({
      necessary: true,
      analytics: true,
      marketing: true,
    });
    refreshConsent();
    setShowBanner(false);
    setShowSettings(false);
    closeSettings();
    
    // Show confirmation
    console.log('🎉 Thank you! All cookies accepted. Analytics and marketing features are now active.');
  };

  const handleRejectAll = () => {
    saveCookieConsent({
      necessary: true,
      analytics: false,
      marketing: false,
    });
    refreshConsent();
    setShowBanner(false);
    setShowSettings(false);
    closeSettings();
    
    console.log('✅ Only necessary cookies are active.');
  };

  const handleSavePreferences = () => {
    saveCookieConsent(preferences);
    refreshConsent();
    setShowBanner(false);
    setShowSettings(false);
    closeSettings();
    
    const features = [];
    if (preferences.analytics) features.push('Analytics');
    if (preferences.marketing) features.push('Marketing');
    
    console.log(`✅ Preferences saved! Active features: ${features.length > 0 ? features.join(', ') : 'Only necessary cookies'}`);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 pointer-events-none">
      <div className="w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-xl shadow-2xl pointer-events-auto animate-slide-up">
        {!showSettings ? (
          // Main banner
          <div className="p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 text-2xl">🍪</div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-2">
                  We use cookies
                </h3>
                <p className="text-sm text-slate-300 mb-4">
                  We use cookies to enhance your browsing experience, analyze site traffic, 
                  and personalize content. You can choose to accept all cookies or customize 
                  your preferences to control what gets stored on your device.
                </p>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={handleAcceptAll}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                  >
                    Accept All
                  </button>
                  <button
                    onClick={handleRejectAll}
                    className="px-6 py-2.5 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition-colors"
                  >
                    Reject All
                  </button>
                  <button
                    onClick={() => setShowSettings(true)}
                    className="px-6 py-2.5 bg-transparent hover:bg-slate-800 text-slate-300 font-medium rounded-lg border border-slate-600 transition-colors"
                  >
                    Customize
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Settings panel
          <div className="p-6">
            <h3 className="text-xl font-semibold text-white mb-4">
              Cookie Settings
            </h3>
            
            <div className="space-y-4 mb-6">
              {/* Necessary cookies */}
              <div className="flex items-start justify-between p-4 bg-slate-800 rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium text-white mb-1">
                    Necessary Cookies
                  </h4>
                  <p className="text-sm text-slate-400">
                    These cookies are essential for the website to function and cannot be disabled. 
                    They enable core functionality like security, authentication, and navigation.
                  </p>
                </div>
                <div className="flex-shrink-0 ml-4">
                  <div className="px-3 py-1 bg-green-900/30 text-green-400 text-xs font-medium rounded-full border border-green-800">
                    Always Active
                  </div>
                </div>
              </div>

              {/* Analytics cookies */}
              <div className="flex items-start justify-between p-4 bg-slate-800 rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium text-white mb-1 flex items-center gap-2">
                    Analytics Cookies
                    <span className="text-xs text-blue-400 bg-blue-900/30 px-2 py-0.5 rounded-full">
                      Get insights
                    </span>
                  </h4>
                  <p className="text-sm text-slate-400">
                    These cookies help us understand how visitors interact with our website by collecting 
                    and reporting information anonymously. This helps us improve site performance.
                  </p>
                </div>
                <div className="flex-shrink-0 ml-4">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.analytics}
                      onChange={(e) =>
                        setPreferences({ ...preferences, analytics: e.target.checked })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>

              {/* Marketing cookies */}
              <div className="flex items-start justify-between p-4 bg-slate-800 rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium text-white mb-1 flex items-center gap-2">
                    Marketing Cookies
                    <span className="text-xs text-purple-400 bg-purple-900/30 px-2 py-0.5 rounded-full">
                      Personalized
                    </span>
                  </h4>
                  <p className="text-sm text-slate-400">
                    These cookies track your activity to deliver personalized advertisements and content 
                    that match your interests. They may also be used to measure ad campaign effectiveness.
                  </p>
                </div>
                <div className="flex-shrink-0 ml-4">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.marketing}
                      onChange={(e) =>
                        setPreferences({ ...preferences, marketing: e.target.checked })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleSavePreferences}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
              >
                Save Preferences
              </button>
              <button
                onClick={() => setShowSettings(false)}
                className="px-6 py-2.5 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition-colors"
              >
                Back
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
