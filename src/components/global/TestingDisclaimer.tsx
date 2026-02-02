'use client';

import { useState, useEffect } from 'react';

export default function TestingDisclaimer() {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const dismissed = sessionStorage.getItem('testing-disclaimer-dismissed');
        if (!dismissed) {
            setVisible(true);
        }
    }, []);

    const handleDismiss = () => {
        sessionStorage.setItem('testing-disclaimer-dismissed', 'true');
        setVisible(false);
    };

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
                        <h2 className="text-xl font-bold text-white">Testing Mode</h2>
                    </div>
                </div>

                <div className="px-6 py-6">
                    <p className="text-gray-800 text-base leading-relaxed">
                        Welcome to <span className="font-semibold">Finndex Africa</span>. This platform is currently in <span className="font-semibold text-amber-600">testing</span>.
                    </p>
                    <p className="text-gray-700 text-sm mt-3 leading-relaxed">
                        <span className="font-semibold">Properties and services shown on this site are not real.</span> All listings are for demonstration only. We have been receiving enquiries about them please do not make enquiries or transactions based on the content shown.
                    </p>
                    <p className="text-gray-500 text-xs mt-4">
                        Thank you for helping us test and improve the platform.
                    </p>
                </div>

                <div className="px-6 pb-6">
                    <button
                        onClick={handleDismiss}
                        className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-lg transition-colors text-sm"
                    >
                        I Understand
                    </button>
                </div>
            </div>
        </div>
    );
}
