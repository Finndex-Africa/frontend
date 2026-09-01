'use client';

import { useTranslations } from "next-intl";
import { useState } from 'react';
import { Check, X } from 'lucide-react';
import { LegalContactCard } from '@/components/legal/LegalDocLayout';
import { trackPricingPlanClicked } from '@/lib/analytics';

import { Link } from '@/i18n/navigation';
type TabId = 'landlord' | 'provider';

const TAB_IDS: TabId[] = ['landlord', 'provider'];

const cardShell =
    'flex flex-col rounded-2xl bg-brand-blue text-white p-6 sm:p-7 shadow-xl ring-1 ring-white/15 min-h-[480px]';

function FeatureRow({ ok, label, muted }: { ok: boolean; label: string; muted?: boolean }) {
    return (
        <li className={`flex items-start gap-2.5 text-sm leading-snug ${muted || !ok ? 'text-white/45' : 'text-white/95'}`}>
            <span className="mt-0.5 shrink-0" aria-hidden>
                {ok ? (
                    <Check className="h-4 w-4 text-white" strokeWidth={2.5} />
                ) : (
                    <X className="h-4 w-4 text-red-300/90" strokeWidth={2.5} />
                )}
            </span>
            <span>{label}</span>
        </li>
    );
}

function ComingSoonModal({ onClose }: { onClose: () => void }) {
    const t = useTranslations("pricingPage");
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
            <div
                className="relative w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl text-center"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
                    <span className="text-3xl">🚧</span>
                </div>
                <h2 className="text-xl font-bold text-gray-900 font-heading">{t("paymentComingSoon")}</h2>
                <p className="mt-3 text-sm text-gray-600 leading-relaxed">
                    {t("paymentComingSoonBody")}
                </p>
                <button
                    onClick={onClose}
                    className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-brand-blue px-5 py-3 text-sm font-bold text-white shadow-md transition hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/60"
                >
                    {t("gotIt")}
                </button>
            </div>
        </div>
    );
}

function PricingCard({
    name,
    price,
    priceCaption,
    rows,
    onGetStarted,
}: {
    name: string;
    price: string;
    priceCaption: string;
    rows: { ok: boolean; label: string }[];
    onGetStarted: (plan: string) => void;
}) {
    const t = useTranslations("pricingPage");
    const tFeat = useTranslations("pricingPage.features");
    return (
        <div className={cardShell}>
            <h3 className="text-center text-xl font-bold font-heading tracking-tight">{name}</h3>
            <div className="my-4 border-t border-white/25" />
            <p className="text-center text-4xl sm:text-[2.75rem] font-extrabold text-brand-yellow leading-none">{price}</p>
            <p className="mt-2 text-center text-xs sm:text-sm text-white/85">{priceCaption}</p>
            <ul className="mt-6 flex-1 space-y-2.5">
                {rows.map((row) => (
                    <FeatureRow key={row.label} ok={row.ok} label={tFeat(row.label)} muted={!row.ok} />
                ))}
            </ul>
            <button
                onClick={() => onGetStarted(name)}
                className="mt-8 inline-flex w-full items-center justify-center rounded-full bg-brand-yellow px-5 py-3.5 text-center text-sm font-bold text-brand-blue shadow-md transition hover:brightness-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
            >
                {t("getStarted")}
            </button>
        </div>
    );
}

function CustomPricingCard({
    rows,
}: {
    rows: { ok: boolean; label: string }[];
}) {
    const t = useTranslations("pricingPage");
    const tFeat = useTranslations("pricingPage.features");
    return (
        <div className={cardShell}>
            <h3 className="text-center text-xl font-bold font-heading tracking-tight">{t("custom")}</h3>
            <div className="my-4 border-t border-white/25" />
            <p className="text-center text-4xl sm:text-[2.75rem] font-extrabold text-brand-yellow leading-none">{t("custom")}</p>
            <p className="mt-2 text-center text-xs sm:text-sm text-white/85">Tailored solutions for your unique needs.</p>
            <ul className="mt-6 flex-1 space-y-2.5">
                {rows.map((row) => (
                    <FeatureRow key={row.label} ok={row.ok} label={tFeat(row.label)} muted={!row.ok} />
                ))}
            </ul>
            <Link
                href="/routes/about#contact"
                className="mt-8 inline-flex w-full items-center justify-center rounded-full bg-brand-yellow px-5 py-3.5 text-center text-sm font-bold text-brand-blue shadow-md transition hover:brightness-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
            >
                {t("contactUs")}
            </Link>
        </div>
    );
}

const LANDLORD_BASIC_ROWS: { ok: boolean; label: string }[] = [
    { ok: true, label: 'up_to_20_property_listings' },
    { ok: true, label: 'listing_management_dashboard' },
    { ok: true, label: 'standard_search_visibility' },
    { ok: true, label: 'unlimited_property_inquiries' },
    { ok: true, label: 'property_sharing' },
    { ok: true, label: 'whatsapp_contact_integration' },
    { ok: true, label: 'direct_contact_with_seekers' },
    { ok: true, label: 'verified_badge' },
    { ok: true, label: 'email_notifications' },
    { ok: true, label: 'basic_customer_support' },
    { ok: false, label: 'featured_listings' },
    { ok: false, label: 'top_search_placement' },
    { ok: false, label: 'marketing_promotion' },
    { ok: false, label: 'premium_badge' },
];

const LANDLORD_PRO_ROWS: { ok: boolean; label: string }[] = [
    { ok: true, label: 'up_to_40_property_listings' },
    { ok: true, label: 'listing_management_dashboard' },
    { ok: true, label: 'standard_search_visibility' },
    { ok: true, label: 'unlimited_property_inquiries' },
    { ok: true, label: 'property_sharing' },
    { ok: true, label: 'whatsapp_contact_integration' },
    { ok: true, label: 'direct_contact_with_seekers' },
    { ok: true, label: 'verified_badge' },
    { ok: true, label: 'email_notifications' },
    { ok: true, label: 'featured_listings' },
    { ok: true, label: 'top_search_placement' },
    { ok: true, label: 'priority_customer_support' },
    { ok: false, label: 'marketing_promotion' },
    { ok: false, label: 'premium_badge' },
];

const LANDLORD_PREMIUM_ROWS: { ok: boolean; label: string }[] = [
    { ok: true, label: 'unlimited_property_listings' },
    { ok: true, label: 'listing_management_dashboard' },
    { ok: true, label: 'standard_search_visibility' },
    { ok: true, label: 'unlimited_property_inquiries' },
    { ok: true, label: 'property_sharing' },
    { ok: true, label: 'whatsapp_contact_integration' },
    { ok: true, label: 'direct_contact_with_seekers' },
    { ok: true, label: 'verified_badge' },
    { ok: true, label: 'email_notifications' },
    { ok: true, label: 'featured_listings' },
    { ok: true, label: 'top_search_placement' },
    { ok: true, label: 'premium_badge' },
    { ok: true, label: 'marketing_promotion' },
    { ok: true, label: 'premium_support' },
];

function LandlordCards({ onGetStarted }: { onGetStarted: (plan: string) => void }) {
    const t = useTranslations("pricingPage");
    const tFeat = useTranslations("pricingPage.features");
    return (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            <PricingCard
                name={t("basic")}
                price="$10"
                priceCaption={t("perMonth")}
                rows={LANDLORD_BASIC_ROWS}
                onGetStarted={onGetStarted}
            />
            <PricingCard
                name={t("pro")}
                price="$20"
                priceCaption={t("perMonth")}
                rows={LANDLORD_PRO_ROWS}
                onGetStarted={onGetStarted}
            />
            <PricingCard
                name={t("premium")}
                price="$30"
                priceCaption={t("perMonth")}
                rows={LANDLORD_PREMIUM_ROWS}
                onGetStarted={onGetStarted}
            />
            <CustomPricingCard
                rows={[
                    { ok: true, label: 'dedicated_account_manager' },
                    { ok: true, label: 'banner_promotion' },
                    { ok: true, label: 'platform_advertising_ads' },
                    { ok: true, label: 'homepage_feature_placement' },
                ]}
            />
        </div>
    );
}

const PROVIDER_BASIC_ROWS: { ok: boolean; label: string }[] = [
    { ok: true, label: 'up_to_5_service_listings' },
    { ok: true, label: 'listing_management_dashboard' },
    { ok: true, label: 'unlimited_service_inquiries' },
    { ok: true, label: 'service_sharing' },
    { ok: true, label: 'whatsapp_contact_integration' },
    { ok: true, label: 'direct_contact_with_customers' },
    { ok: true, label: 'verified_business_badge' },
    { ok: true, label: 'standard_search_visibility' },
    { ok: true, label: 'email_notifications' },
    { ok: true, label: 'basic_support' },
    { ok: false, label: 'featured_service_listings' },
    { ok: false, label: 'top_search_placement' },
    { ok: false, label: 'marketing_promotion' },
    { ok: false, label: 'premium_badge' },
];

const PROVIDER_PRO_ROWS: { ok: boolean; label: string }[] = [
    { ok: true, label: 'up_to_10_service_listings' },
    { ok: true, label: 'listing_management_dashboard' },
    { ok: true, label: 'unlimited_service_inquiries' },
    { ok: true, label: 'service_sharing' },
    { ok: true, label: 'whatsapp_contact_integration' },
    { ok: true, label: 'direct_contact_with_customers' },
    { ok: true, label: 'verified_business_badge' },
    { ok: true, label: 'standard_search_visibility' },
    { ok: true, label: 'email_notifications' },
    { ok: true, label: 'featured_service_listings' },
    { ok: true, label: 'top_search_placement' },
    { ok: true, label: 'priority_support' },
    { ok: false, label: 'marketing_promotion' },
    { ok: false, label: 'premium_badge' },
];

const PROVIDER_PREMIUM_ROWS: { ok: boolean; label: string }[] = [
    { ok: true, label: 'unlimited_service_listings' },
    { ok: true, label: 'listing_management_dashboard' },
    { ok: true, label: 'unlimited_service_inquiries' },
    { ok: true, label: 'service_sharing' },
    { ok: true, label: 'whatsapp_contact_integration' },
    { ok: true, label: 'direct_contact_with_customers' },
    { ok: true, label: 'verified_business_badge' },
    { ok: true, label: 'standard_search_visibility' },
    { ok: true, label: 'email_notifications' },
    { ok: true, label: 'featured_service_listings' },
    { ok: true, label: 'top_search_placement' },
    { ok: true, label: 'premium_badge' },
    { ok: true, label: 'marketing_promotion' },
    { ok: true, label: 'premium_support' },
];

function ServiceProviderCards({ onGetStarted }: { onGetStarted: (plan: string) => void }) {
    const t = useTranslations("pricingPage");
    const tFeat = useTranslations("pricingPage.features");
    return (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            <PricingCard
                name={t("basic")}
                price="$20"
                priceCaption={t("perMonth")}
                rows={PROVIDER_BASIC_ROWS}
                onGetStarted={onGetStarted}
            />
            <PricingCard
                name={t("pro")}
                price="$30"
                priceCaption={t("perMonth")}
                rows={PROVIDER_PRO_ROWS}
                onGetStarted={onGetStarted}
            />
            <PricingCard
                name={t("premium")}
                price="$50"
                priceCaption={t("perMonth")}
                rows={PROVIDER_PREMIUM_ROWS}
                onGetStarted={onGetStarted}
            />
            <CustomPricingCard
                rows={[
                    { ok: true, label: 'dedicated_account_manager' },
                    { ok: true, label: 'banner_promotion' },
                    { ok: true, label: 'platform_advertising_ads' },
                    { ok: true, label: 'homepage_feature_placement' },
                ]}
            />
        </div>
    );
}

export default function PricingPageContent() {
    const t = useTranslations("pricingPage");
    const tFeat = useTranslations("pricingPage.features");
    const [tab, setTab] = useState<TabId>('landlord');
    const [showModal, setShowModal] = useState(false);

    const handleGetStarted = (plan: string) => {
        trackPricingPlanClicked({ plan, audience: tab });
        setShowModal(true);
    };

    const headings: Record<TabId, string> = {
        landlord: t('landlordHeading'),
        provider: t('providerHeading'),
    };

    return (
        <div className="min-h-screen bg-blue-50">
            {showModal && <ComingSoonModal onClose={() => setShowModal(false)} />}

            <header className="relative px-4 pt-12 pb-10 sm:pt-16 sm:pb-12 text-center">
                <h1 className="text-3xl sm:text-4xl md:text-[2.35rem] font-extrabold text-brand-blue tracking-tight font-heading px-2">
                    {headings[tab]}
                </h1>
                <p className="mt-3 max-w-2xl mx-auto text-sm sm:text-base text-gray-700 leading-relaxed">
                    Affordable, flexible monthly subscription plans designed to help you grow your business, increase visibility, and connect with more customers.
                </p>

                <div className="mt-8 flex justify-center px-2">
                    <div
                        className="inline-flex flex-wrap justify-center gap-1 rounded-full bg-white p-1.5 shadow-md ring-1 ring-brand-blue/15"
                        role="tablist"
                        aria-label={t("pricingAudience")}
                    >
                        {TAB_IDS.map((id) => (
                            <button
                                key={id}
                                type="button"
                                role="tab"
                                aria-selected={tab === id}
                                className={`rounded-full px-4 py-2.5 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/40 ${
                                    tab === id
                                        ? 'bg-brand-blue text-white shadow-sm'
                                        : 'text-brand-blue hover:bg-blue-50'
                                }`}
                                onClick={() => setTab(id)}
                            >
                                {id === 'landlord' ? t('landlordTab') : t('providerTab')}
                            </button>
                        ))}
                    </div>
                </div>
            </header>

            <div className="container-app px-4 pb-14 sm:pb-16 max-w-7xl mx-auto space-y-12">
                <div role="tabpanel">
                    {tab === 'landlord' && <LandlordCards onGetStarted={handleGetStarted} />}
                    {tab === 'provider' && <ServiceProviderCards onGetStarted={handleGetStarted} />}
                </div>

                <div className="rounded-2xl border border-brand-blue/20 bg-brand-blue p-6 sm:p-8 text-white shadow-lg">
                    <p className="text-lg font-bold font-heading">Need help choosing?</p>
                    <p className="mt-2 text-sm text-white/80">
                        {t("helpBody")}
                    </p>
                    <div className="mt-5 flex flex-wrap gap-3">
                        <Link
                            href="/routes/help"
                            className="inline-flex items-center justify-center rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-slate-900 hover:bg-white/90"
                        >
                            {t("helpCenter")}
                        </Link>
                        <Link
                            href="/routes/about#contact"
                            className="inline-flex items-center justify-center rounded-lg bg-white/10 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/15"
                        >
                            {t("contactUs")}
                        </Link>
                    </div>
                </div>

                <div className="max-w-4xl mx-auto">
                    <LegalContactCard />
                </div>
            </div>
        </div>
    );
}
