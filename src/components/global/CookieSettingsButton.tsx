'use client';

import { useTranslations } from 'next-intl';

import { openConsentPreferences } from '@/lib/consent';

/**
 * Re-opens the cookie banner so a visitor can change or withdraw consent.
 *
 * Withdrawing has to be as easy as giving, and the Cookie Policy tells people
 * this link exists, so it is a real control rather than a link to the policy.
 */
export default function CookieSettingsButton() {
    const t = useTranslations('footer');

    return (
        <button
            type="button"
            onClick={openConsentPreferences}
            className="text-left hover:text-gray-900 transition-colors underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 rounded-sm"
        >
            {t('cookieSettings')}
        </button>
    );
}
