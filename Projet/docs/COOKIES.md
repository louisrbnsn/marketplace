# Cookie System Documentation

## Overview

The website uses a GDPR-compliant cookie consent system that allows users to control their privacy preferences.

## Cookie Types

### 1. Necessary Cookies
- **Status**: Always active
- **Purpose**: Essential for website functionality
- **Examples**: Authentication, session management, security

### 2. Analytics Cookies
- **Status**: Optional (user consent required)
- **Purpose**: Understand how visitors interact with the website
- **Benefits**: 
  - Track page views
  - Measure site performance
  - Understand user behavior patterns
  - Improve user experience

### 3. Marketing Cookies
- **Status**: Optional (user consent required)
- **Purpose**: Deliver personalized content and advertisements
- **Benefits**:
  - Personalized recommendations
  - Targeted advertising
  - Special offers based on interests

## Technical Implementation

### Files Structure

```
src/
├── contexts/
│   └── CookieContext.tsx          # Global cookie state management
├── components/
│   └── ui/
│       ├── CookieConsent.tsx      # Cookie banner component
│       └── CookieBenefitsDemo.tsx # Demo component (optional usage)
├── utils/
│   ├── cookies.ts                 # Cookie utilities
│   └── tracking.ts                # Analytics & marketing functions
```

### Usage Examples

#### Check if user has consented to analytics
```typescript
import { useCookieConsent } from '@/contexts/CookieContext';

function MyComponent() {
  const { hasAnalytics, hasMarketing } = useCookieConsent();
  
  if (hasAnalytics) {
    // Track user interaction
    trackEvent('button_click', { feature: 'xyz' });
  }
  
  if (hasMarketing) {
    // Show personalized content
    const recommendations = getRecommendations();
  }
}
```

#### Track events
```typescript
import { trackEvent, trackPageView, trackPurchase } from '@/utils/tracking';

// Track page view (respects user consent)
trackPageView('/products');

// Track custom event
trackEvent('product_view', { 
  product_id: '123',
  category: 'presets' 
});

// Track purchase
trackPurchase('order_123', 49.99, 'USD');
```

#### Get personalized recommendations
```typescript
import { getRecommendations } from '@/utils/tracking';

// Returns personalized items if marketing cookies enabled
// Otherwise returns generic recommendations
const items = getRecommendations();
```

### Cookie Management

Users can manage their cookie preferences at any time by:
1. Clicking "Cookie Settings" in the footer
2. Adjusting their preferences
3. Saving their choices

Preferences are stored for 365 days.

## Integration with Third-Party Services

### Google Analytics (Example)
To integrate Google Analytics, uncomment the code in `src/contexts/CookieContext.tsx`:

```typescript
// Load Google Analytics only if user consented
useEffect(() => {
  if (hasAnalytics && typeof window !== 'undefined') {
    const script = document.createElement('script');
    script.src = `https://www.googletagmanager.com/gtag/js?id=YOUR_GA_ID`;
    script.async = true;
    document.head.appendChild(script);
    
    window.dataLayer = window.dataLayer || [];
    function gtag(...args: any[]) {
      window.dataLayer.push(arguments);
    }
    gtag('js', new Date());
    gtag('config', 'YOUR_GA_ID');
  }
}, [hasAnalytics]);
```

### Facebook Pixel (Example)
Similar approach for Facebook Pixel when marketing cookies are enabled.

## Console Logs

For testing purposes, the system logs to console when:
- ✅ Analytics cookies are enabled
- ✅ Marketing cookies are enabled
- 📊 Events are tracked
- 🎯 Conversions are recorded
- 🛒 Purchases are tracked

## Demo Component

A demo component (`CookieBenefitsDemo`) is available to showcase the benefits of enabling different cookie types. 

To use it on any page:
```typescript
import CookieBenefitsDemo from '@/components/ui/CookieBenefitsDemo';

<CookieBenefitsDemo />
```

This component shows:
- Live cookie status
- Interactive tracking demo
- Personalized vs generic recommendations
- Benefits of each cookie type

## Privacy Compliance

- ✅ GDPR compliant
- ✅ User has full control
- ✅ No tracking without consent (except necessary cookies)
- ✅ Easy to manage preferences
- ✅ Clear explanation of each cookie type
- ✅ 365-day consent storage
