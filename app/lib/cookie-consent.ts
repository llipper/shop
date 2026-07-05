export type CookieConsentValue = "accepted" | "rejected" | "essential";

const STORAGE_KEY = "roccius-cookie-consent";

export function getCookieConsent(): CookieConsentValue | null {
  if (typeof window === "undefined") return null;

  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "accepted" || stored === "rejected" || stored === "essential") {
    return stored;
  }

  return null;
}

export function setCookieConsent(value: CookieConsentValue) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, value);
}

export function hasCookieConsentChoice(): boolean {
  return getCookieConsent() !== null;
}