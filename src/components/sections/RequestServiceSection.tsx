'use client';

import { useTranslations } from "next-intl";
import { useState } from 'react';
import RequestServiceModal from '@/components/modals/RequestServiceModal';
import type { ServiceRequestCategory } from '@/services/api/service-requests.api';

interface RequestServiceSectionProps {
    /** Which listing type the visitor came up empty on. */
    category: ServiceRequestCategory;
}

/**
 * Sits at the bottom of the Properties, Services and Buy & Sell pages, just
 * above the footer: the last thing a visitor sees when nothing matched.
 */
export default function RequestServiceSection({ category }: RequestServiceSectionProps) {
    const t = useTranslations("requestService");
    const [open, setOpen] = useState(false);

    return (
        <section className="bg-gray-50 border-t border-gray-200">
            <div className="container-app px-4 py-12 sm:py-16">
                <div className="mx-auto max-w-3xl rounded-2xl bg-white p-7 sm:p-10 text-center shadow-sm ring-1 ring-gray-200">
                    <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-blue-50">
                        <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M11 19a8 8 0 110-16 8 8 0 010 16z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">{t("heading")}</h2>
                    <p className="mt-3 text-gray-600 leading-relaxed">{t("body")}</p>
                    <button
                        type="button"
                        onClick={() => setOpen(true)}
                        className="mt-7 inline-flex items-center justify-center rounded-lg bg-blue-600 px-7 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
                    >
                        {t("cta")}
                    </button>
                </div>
            </div>

            <RequestServiceModal open={open} onClose={() => setOpen(false)} category={category} />
        </section>
    );
}
