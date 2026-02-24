/**
 * Utilitaires pour la gestion des cookies
 */

export const COOKIE_CONSENT_NAME = 'cookie_consent';
export const COOKIE_CONSENT_DURATION = 365; // jours

export type CookieConsent = {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  timestamp: number;
};

/**
 * Définit un cookie
 */
export function setCookie(name: string, value: string, days: number): void {
  if (typeof window === 'undefined') return;
  
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
}

/**
 * Récupère un cookie par son nom
 */
export function getCookie(name: string): string | null {
  if (typeof window === 'undefined') return null;
  
  const nameEQ = name + '=';
  const cookies = document.cookie.split(';');
  
  for (let i = 0; i < cookies.length; i++) {
    let cookie = cookies[i];
    while (cookie.charAt(0) === ' ') {
      cookie = cookie.substring(1, cookie.length);
    }
    if (cookie.indexOf(nameEQ) === 0) {
      return cookie.substring(nameEQ.length, cookie.length);
    }
  }
  return null;
}

/**
 * Supprime un cookie
 */
export function deleteCookie(name: string): void {
  if (typeof window === 'undefined') return;
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
}

/**
 * Récupère le consentement des cookies
 */
export function getCookieConsent(): CookieConsent | null {
  const consent = getCookie(COOKIE_CONSENT_NAME);
  if (!consent) return null;
  
  try {
    return JSON.parse(decodeURIComponent(consent));
  } catch {
    return null;
  }
}

/**
 * Enregistre le consentement des cookies
 */
export function saveCookieConsent(consent: Omit<CookieConsent, 'timestamp'>): void {
  const consentData: CookieConsent = {
    ...consent,
    timestamp: Date.now(),
  };
  
  setCookie(
    COOKIE_CONSENT_NAME,
    encodeURIComponent(JSON.stringify(consentData)),
    COOKIE_CONSENT_DURATION
  );
}

/**
 * Vérifie si l'utilisateur a donné son consentement
 */
export function hasConsent(): boolean {
  return getCookieConsent() !== null;
}
