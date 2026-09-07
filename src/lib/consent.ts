/**
 * Single source of truth for cookie-consent state.
 *
 * Previously the consent key and its shape were re-declared in both
 * lib/analytics.ts and components/global/CookieConsent.tsx. Now that whether
 * analytics loads at all depends on this value, a third copy drifting out of
 * step would silently disable tracking, so it lives in one place.
 */

export const CONSENT_KEY = "findafriq_cookie_consent";
export const CONSENT_VERSION = "1";

/** Dispatched on `window` when the visitor saves a consent choice. */
export const CONSENT_CHANGED_EVENT = "findafriq:consent-changed";

export type ConsentState = {
    necessary: true;
    analytics: boolean;
    marketing: boolean;
    preferences: boolean;
};

export type StoredConsent = ConsentState & {
    version?: string;
    timestamp?: number;
};

/** Reads stored consent, or null when absent, unparseable, or from an old version. */
export function readConsent(): StoredConsent | null {
    if (typeof window === "undefined") return null;
    try {
        const stored = localStorage.getItem(CONSENT_KEY);
        if (!stored) return null;
        const parsed = JSON.parse(stored) as StoredConsent;
        if (parsed?.version !== CONSENT_VERSION) return null;
        return parsed;
    } catch {
        return null;
    }
}

/** True only when the visitor has actively accepted analytics cookies. */
export function hasAnalyticsConsent(): boolean {
    return readConsent()?.analytics === true;
}

/** Persists a choice and notifies listeners in this tab. */
export function writeConsent(consent: ConsentState): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(
        CONSENT_KEY,
        JSON.stringify({ ...consent, version: CONSENT_VERSION, timestamp: Date.now() }),
    );
    // `storage` only fires in *other* tabs, so this tab needs its own signal.
    window.dispatchEvent(new Event(CONSENT_CHANGED_EVENT));
}
