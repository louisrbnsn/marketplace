'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getCookieConsent, CookieConsent } from '@/utils/cookies';

type CookieContextType = {
  consent: CookieConsent | null;
  hasAnalytics: boolean;
  hasMarketing: boolean;
  refreshConsent: () => void;
  showSettings: boolean;
  openSettings: () => void;
  closeSettings: () => void;
};

const CookieContext = createContext<CookieContextType | undefined>(undefined);

export function CookieProvider({ children }: { children: ReactNode }) {
  const [consent, setConsent] = useState<CookieConsent | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  const loadConsent = () => {
    const currentConsent = getCookieConsent();
    setConsent(currentConsent);
  };

  useEffect(() => {
    loadConsent();
  }, []);

  const hasAnalytics = consent?.analytics ?? false;
  const hasMarketing = consent?.marketing ?? false;

  // Load Google Analytics if user consented
  useEffect(() => {
    if (hasAnalytics && typeof window !== 'undefined') {
      // Example: Load Google Analytics
      console.log('✅ Analytics enabled - Ready to track user behavior');
      
      // You can add your Google Analytics code here
      // Example:
      // const script = document.createElement('script');
      // script.src = `https://www.googletagmanager.com/gtag/js?id=YOUR_GA_ID`;
      // script.async = true;
      // document.head.appendChild(script);
      
      // window.dataLayer = window.dataLayer || [];
      // function gtag(...args: any[]) {
      //   window.dataLayer.push(arguments);
      // }
      // gtag('js', new Date());
      // gtag('config', 'YOUR_GA_ID');
    }
  }, [hasAnalytics]);

  // Load Marketing tools if user consented
  useEffect(() => {
    if (hasMarketing && typeof window !== 'undefined') {
      console.log('✅ Marketing enabled - Ready to show personalized content');
      
      // You can add Facebook Pixel, LinkedIn Insight, etc.
      // Example for Facebook Pixel:
      // !function(f,b,e,v,n,t,s) {
      //   if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      //   n.callMethod.apply(n,arguments):n.queue.push(arguments)};
      //   if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
      //   n.queue=[];t=b.createElement(e);t.async=!0;
      //   t.src=v;s=b.getElementsByTagName(e)[0];
      //   s.parentNode.insertBefore(t,s)
      // }(window, document,'script','https://connect.facebook.net/en_US/fbevents.js');
      // fbq('init', 'YOUR_PIXEL_ID');
      // fbq('track', 'PageView');
    }
  }, [hasMarketing]);

  return (
    <CookieContext.Provider
      value={{
        consent,
        hasAnalytics,
        hasMarketing,
        refreshConsent: loadConsent,
        showSettings,
        openSettings: () => setShowSettings(true),
        closeSettings: () => setShowSettings(false),
      }}
    >
      {children}
    </CookieContext.Provider>
  );
}

export function useCookieConsent() {
  const context = useContext(CookieContext);
  if (context === undefined) {
    throw new Error('useCookieConsent must be used within a CookieProvider');
  }
  return context;
}
