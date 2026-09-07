'use client';

import { useTranslations } from "next-intl";
import { useState, useEffect } from 'react';

export default function TestingDisclaimer() {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const appEnv = (process.env.NEXT_PUBLIC_APP_ENV || '').toLowerCase();
        const hostname = window.location.hostname.toLowerCase();

        const isStaging =
            appEnv === 'staging' ||
            hostname.includes('staging') ||
            hostname.includes('localhost') ||
            hostname.includes('127.0.0.1');

        if (!isStaging) return;

        const dismissed = sessionStorage.getItem('testing-disclaimer-dismissed');
        if (!dismissed) {
            setVisible(true);
        }
    }, []);

    const handleDismiss = () => {
        sessionStorage.setItem('testing-disclaimer-dismissed', 'true');
        setVisible(false);
    };

    const t = useTranslations("testingDisclaimer");

    if (!visible) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
                <div className="bg-amber-500 px-6 py-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-bold text-white">{t("title")}</h2>
                    </div>
                </div>

                <div className="px-6 py-6">
                    <p className="text-gray-800 text-base leading-relaxed">
                        {t.rich("welcome", {
                            b: (chunks) => <span className="font-semibold">{chunks}</span>,
                            em: (chunks) => <span className="font-semibold text-amber-600">{chunks}</span>,
                        })}
                    </p>
                    <p className="text-gray-700 text-sm mt-3 leading-relaxed">
                        {t.rich("notReal", {
                            b: (chunks) => <span className="font-semibold">{chunks}</span>,
                        })}
                    </p>
                    <p className="text-gray-500 text-xs mt-4">
                        {t("thanks")}
                    </p>
                </div>

                <div className="px-6 pb-6">
                    <button
                        onClick={handleDismiss}
                        className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-lg transition-colors text-sm"
                    >
                        {t("understood")}
                    </button>
                </div>
            </div>
        </div>
    );
}
