'use client';

import { useTranslations } from 'next-intl';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Cookie, ChevronDown, ChevronUp } from 'lucide-react';

import { Link } from '@/i18n/navigation';
type ConsentState = {
    necessary: true;
    analytics: boolean;
    marketing: boolean;
    preferences: boolean;
};

const CONSENT_KEY = 'findafriq_cookie_consent';
const CONSENT_VERSION = '1';

function updateGAConsent(consentData: ConsentState) {
    if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;
    window.gtag('consent', 'update', {
        analytics_storage: consentData.analytics ? 'granted' : 'denied',
        ad_storage: consentData.marketing ? 'granted' : 'denied',
    });
}

export default function CookieConsent() {
    const [visible, setVisible] = useState(false);
    const [showDetails, setShowDetails] = useState(false);
    const [consent, setConsent] = useState<ConsentState>({
        necessary: true,
        analytics: false,
        marketing: false,
        preferences: false,
    });

    useEffect(() => {
        const stored = localStorage.getItem(CONSENT_KEY);
        if (!stored) {
            // Slight delay so it doesn't flash immediately on load
            const timer = setTimeout(() => setVisible(true), 800);
            return () => clearTimeout(timer);
        }
        try {
            const parsed = JSON.parse(stored);
            if (parsed.version !== CONSENT_VERSION) {
                // Consent version changed — re-ask
                const timer = setTimeout(() => setVisible(true), 800);
                return () => clearTimeout(timer);
            }
            // Restore GA consent state on page load
            updateGAConsent(parsed as ConsentState);
        } catch {
            const timer = setTimeout(() => setVisible(true), 800);
            return () => clearTimeout(timer);
        }
    }, []);

    const saveConsent = (consentData: ConsentState) => {
        localStorage.setItem(
            CONSENT_KEY,
            JSON.stringify({ ...consentData, version: CONSENT_VERSION, timestamp: Date.now() })
        );
        updateGAConsent(consentData);
        setVisible(false);
    };

    const handleAcceptAll = () => {
        const all: ConsentState = { necessary: true, analytics: true, marketing: true, preferences: true };
        setConsent(all);
        saveConsent(all);
    };

    const handleRejectAll = () => {
        const none: ConsentState = { necessary: true, analytics: false, marketing: false, preferences: false };
        setConsent(none);
        saveConsent(none);
    };

    const handleSavePreferences = () => {
        saveConsent(consent);
    };

    const t = useTranslations('cookies');

    const cookieCategories = [
        {
            key: 'necessary' as const,
            label: t('necessaryLabel'),
            description: t('necessaryDesc'),
            required: true,
        },
        {
            key: 'analytics' as const,
            label: t('analyticsLabel'),
            description: t('analyticsDesc'),
            required: false,
        },
        {
            key: 'preferences' as const,
            label: t('preferencesLabel'),
            description: t('preferencesDesc'),
            required: false,
        },
        {
            key: 'marketing' as const,
            label: t('marketingLabel'),
            description: t('marketingDesc'),
            required: false,
        },
    ];

    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    className="fixed bottom-0 left-0 right-0 z-9999 p-4 md:p-6"
                    role="dialog"
                    aria-label="Cookie consent"
                    aria-modal="false"
                >
                    {/* Backdrop blur strip */}
                    <div className="max-w-4xl mx-auto">
                        <div className="bg-white rounded-2xl shadow-2xl shadow-black/15 border border-gray-100 overflow-hidden">
                            {/* Main banner */}
                            <div className="p-5 md:p-6">
                                <div className="flex items-start gap-4">
                                    <div className="shrink-0 w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                                        <Cookie className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-base font-semibold text-gray-900 mb-1">
                                            {t('title')}
                                        </h3>
                                        <p className="text-sm text-gray-600 leading-relaxed">
                                            {t('body')}{' '}
                                            {/*
                                              "Learn more" on its own is on
                                              Lighthouse's generic link-text
                                              blocklist and tells a crawler or a
                                              screen reader nothing about the
                                              destination. The aria-label is what
                                              both actually read; it still starts
                                              with the visible text, so it meets
                                              WCAG 2.5.3 (Label in Name).
                                            */}
                                            <Link
                                                href="/routes/privacy"
                                                aria-label={t('learnMoreLabel')}
                                                className="text-blue-600 hover:underline font-medium"
                                            >
                                                {t('learnMore')}
                                            </Link>
                                        </p>
                                    </div>
                                    <button
                                        onClick={handleRejectAll}
                                        className="shrink-0 p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                                        aria-label={t('rejectAll')}
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>

                                {/* Action buttons */}
                                <div className="mt-4 flex flex-wrap items-center gap-2 md:gap-3">
                                    <button
                                        onClick={handleAcceptAll}
                                        className="px-5 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
                                    >
                                        {t('acceptAll')}
                                    </button>
                                    <button
                                        onClick={handleRejectAll}
                                        className="px-5 py-2 bg-gray-100 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-200 transition-colors"
                                    >
                                        {t('rejectAll')}
                                    </button>
                                    <button
                                        onClick={() => setShowDetails(!showDetails)}
                                        className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1.5 rounded-xl hover:bg-blue-50 transition-colors"
                                    >
                                        {t('managePreferences')}
                                        {showDetails ? (
                                            <ChevronUp className="w-4 h-4" />
                                        ) : (
                                            <ChevronDown className="w-4 h-4" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Preferences panel */}
                            <AnimatePresence>
                                {showDetails && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.25 }}
                                        className="overflow-hidden border-t border-gray-100"
                                    >
                                        <div className="p-5 md:p-6 space-y-3">
                                            <p className="text-xs text-gray-500 mb-4">
                                                {t('manageIntro')}
                                            </p>
                                            {cookieCategories.map((cat) => (
                                                <div
                                                    key={cat.key}
                                                    className="flex items-start justify-between gap-4 p-3.5 rounded-xl bg-gray-50 border border-gray-100"
                                                >
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-0.5">
                                                            <span className="text-sm font-semibold text-gray-800">
                                                                {cat.label}
                                                            </span>
                                                            {cat.required && (
                                                                <span className="text-[10px] font-medium text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-md border border-blue-100">
                                                                    Always on
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-xs text-gray-500 leading-relaxed">
                                                            {cat.description}
                                                        </p>
                                                    </div>
                                                    <label className="relative shrink-0 mt-0.5 cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            className="sr-only peer"
                                                            checked={consent[cat.key]}
                                                            disabled={cat.required}
                                                            onChange={(e) =>
                                                                !cat.required &&
                                                                setConsent((prev) => ({
                                                                    ...prev,
                                                                    [cat.key]: e.target.checked,
                                                                }))
                                                            }
                                                        />
                                                        <div className="w-10 h-5 bg-gray-200 rounded-full peer-checked:bg-blue-600 peer-disabled:opacity-60 transition-colors" />
                                                        <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform peer-checked:translate-x-5" />
                                                    </label>
                                                </div>
                                            ))}
                                            <button
                                                onClick={handleSavePreferences}
                                                className="mt-2 w-full md:w-auto px-6 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors"
                                            >
                                                {t('savePreferences')}
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
