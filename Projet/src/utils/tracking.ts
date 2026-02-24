import { getCookieConsent } from './cookies';

/**
 * Track a page view (only if analytics cookies are enabled)
 */
export function trackPageView(page: string): void {
  const consent = getCookieConsent();
  
  if (consent?.analytics) {
    console.log('📊 [Analytics] Page view tracked:', page);
    
    // Example: Google Analytics
    // if (typeof window !== 'undefined' && (window as any).gtag) {
    //   (window as any).gtag('event', 'page_view', {
    //     page_path: page,
    //   });
    // }
  }
}

/**
 * Track a custom event (only if analytics cookies are enabled)
 */
export function trackEvent(
  eventName: string,
  properties?: Record<string, any>
): void {
  const consent = getCookieConsent();
  
  if (consent?.analytics) {
    console.log('📊 [Analytics] Event tracked:', eventName, properties);
    
    // Example: Google Analytics
    // if (typeof window !== 'undefined' && (window as any).gtag) {
    //   (window as any).gtag('event', eventName, properties);
    // }
  }
}

/**
 * Track a purchase (only if analytics cookies are enabled)
 */
export function trackPurchase(
  orderId: string,
  value: number,
  currency: string = 'USD'
): void {
  const consent = getCookieConsent();
  
  if (consent?.analytics) {
    console.log('🛒 [Analytics] Purchase tracked:', { orderId, value, currency });
    
    // Example: Google Analytics
    // if (typeof window !== 'undefined' && (window as any).gtag) {
    //   (window as any).gtag('event', 'purchase', {
    //     transaction_id: orderId,
    //     value: value,
    //     currency: currency,
    //   });
    // }
  }
}

/**
 * Show personalized marketing content (only if marketing cookies are enabled)
 */
export function canShowMarketing(): boolean {
  const consent = getCookieConsent();
  return consent?.marketing ?? false;
}

/**
 * Track ad conversion (only if marketing cookies are enabled)
 */
export function trackConversion(conversionId: string, value?: number): void {
  const consent = getCookieConsent();
  
  if (consent?.marketing) {
    console.log('🎯 [Marketing] Conversion tracked:', conversionId, value);
    
    // Example: Facebook Pixel
    // if (typeof window !== 'undefined' && (window as any).fbq) {
    //   (window as any).fbq('track', 'Purchase', {
    //     value: value,
    //     currency: 'USD',
    //   });
    // }
  }
}

/**
 * Example usage with marketing features
 */
export function getRecommendations(): string[] {
  const consent = getCookieConsent();
  
  if (consent?.marketing) {
    console.log('🎯 [Marketing] Personalized recommendations enabled');
    // Return personalized recommendations based on user behavior
    return ['Premium Feature A', 'Special Offer B', 'Limited Deal C'];
  }
  
  // Return generic recommendations
  return ['Popular Item 1', 'Popular Item 2', 'Popular Item 3'];
}
