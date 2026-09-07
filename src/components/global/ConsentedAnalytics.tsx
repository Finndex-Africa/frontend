"use client";

import { useEffect, useState } from "react";
import { GoogleAnalytics } from "@next/third-parties/google";
import {
    CONSENT_CHANGED_EVENT,
    hasAnalyticsConsent,
} from "@/lib/consent";

/**
 * Loads Google Analytics only once the visitor has accepted analytics cookies.
 *
 * Two reasons, and the privacy one is the more important:
 *
 *  - Correctness. gtag.js was previously loaded on every page with no
 *    `consent: default` call in front of it, so it initialised — and recorded a
 *    page_view — before anyone had answered the cookie banner. Custom events in
 *    lib/analytics.ts were gated; the automatic pageview was not.
 *  - Weight. gtag.js is ~164 KiB and ~200 ms of main-thread time. Visitors who
 *    decline, or who never touch the banner, now pay none of it.
 *
 * Listens for CONSENT_CHANGED_EVENT so accepting in the banner starts analytics
 * immediately rather than on the next navigation.
 */
export default function ConsentedAnalytics({ gaId }: { gaId: string }) {
    // Always false on the server and on first paint: consent lives in
    // localStorage, and reading it during render would desync hydration.
    const [allowed, setAllowed] = useState(false);

    useEffect(() => {
        const sync = () => setAllowed(hasAnalyticsConsent());
        sync();

        window.addEventListener(CONSENT_CHANGED_EVENT, sync);
        // Consent given in another tab should apply here too.
        window.addEventListener("storage", sync);
        return () => {
            window.removeEventListener(CONSENT_CHANGED_EVENT, sync);
            window.removeEventListener("storage", sync);
        };
    }, []);

    if (!allowed) return null;
    return <GoogleAnalytics gaId={gaId} />;
}
