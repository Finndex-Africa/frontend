'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Check, X } from 'lucide-react';
import { LegalContactCard } from '@/components/legal/LegalDocLayout';

type TabId = 'landlord' | 'provider';

const TAB_LABEL: Record<TabId, string> = {
    landlord: 'Landlord/Agent',
    provider: 'Service Providers',
};

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
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
            <div
                className="relative w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl text-center"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
                    <span className="text-3xl">🚧</span>
                </div>
                <h2 className="text-xl font-bold text-gray-900 font-heading">Payment Coming Soon</h2>
                <p className="mt-3 text-sm text-gray-600 leading-relaxed">
                    We are not accepting payment now. Payment integration is coming soon and will be available in a future update.
                </p>
                <button
                    onClick={onClose}
                    className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-brand-blue px-5 py-3 text-sm font-bold text-white shadow-md transition hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/60"
                >
                    Got it
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
    onGetStarted: () => void;
}) {
    return (
        <div className={cardShell}>
            <h3 className="text-center text-xl font-bold font-heading tracking-tight">{name}</h3>
            <div className="my-4 border-t border-white/25" />
            <p className="text-center text-4xl sm:text-[2.75rem] font-extrabold text-brand-yellow leading-none">{price}</p>
            <p className="mt-2 text-center text-xs sm:text-sm text-white/85">{priceCaption}</p>
            <ul className="mt-6 flex-1 space-y-2.5">
                {rows.map((row) => (
                    <FeatureRow key={row.label} ok={row.ok} label={row.label} muted={!row.ok} />
                ))}
            </ul>
            <button
                onClick={onGetStarted}
                className="mt-8 inline-flex w-full items-center justify-center rounded-full bg-brand-yellow px-5 py-3.5 text-center text-sm font-bold text-brand-blue shadow-md transition hover:brightness-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
            >
                Get started
            </button>
        </div>
    );
}

function CustomPricingCard({
    rows,
}: {
    rows: { ok: boolean; label: string }[];
}) {
    return (
        <div className={cardShell}>
            <h3 className="text-center text-xl font-bold font-heading tracking-tight">Custom</h3>
            <div className="my-4 border-t border-white/25" />
            <p className="text-center text-4xl sm:text-[2.75rem] font-extrabold text-brand-yellow leading-none">Custom</p>
            <p className="mt-2 text-center text-xs sm:text-sm text-white/85">Tailored solutions for your unique needs.</p>
            <ul className="mt-6 flex-1 space-y-2.5">
                {rows.map((row) => (
                    <FeatureRow key={row.label} ok={row.ok} label={row.label} muted={!row.ok} />
                ))}
            </ul>
            <Link
                href="/routes/about#contact"
                className="mt-8 inline-flex w-full items-center justify-center rounded-full bg-brand-yellow px-5 py-3.5 text-center text-sm font-bold text-brand-blue shadow-md transition hover:brightness-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
            >
                Contact us
            </Link>
        </div>
    );
}

const LANDLORD_BASIC_EXCLUDED = [
    { ok: false as const, label: 'Top search placement' },
    { ok: false as const, label: 'Marketing promotion' },
    { ok: false as const, label: 'Premium badge' },
];

const LANDLORD_BASE_INCLUDED: { ok: true; label: string }[] = [
    { ok: true, label: 'Property listing' },
    { ok: true, label: 'Property visibility' },
    { ok: true, label: 'Unlimited inquiries' },
    { ok: true, label: 'Direct home seeker contact' },
    { ok: true, label: 'Free account access' },
    { ok: true, label: 'Verification' },
    { ok: true, label: 'Team support' },
];

function LandlordCards({ onGetStarted }: { onGetStarted: () => void }) {
    return (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            <PricingCard
                name="Basic"
                price="$2"
                priceCaption="Per property listing. Prices in USD."
                rows={[...LANDLORD_BASE_INCLUDED, ...LANDLORD_BASIC_EXCLUDED]}
                onGetStarted={onGetStarted}
            />
            <PricingCard
                name="Pro"
                price="$5"
                priceCaption="Per property. Prices in USD."
                rows={[
                    ...LANDLORD_BASE_INCLUDED,
                    { ok: true, label: 'Top search placement (7 days)' },
                    { ok: false, label: 'Marketing promotion' },
                    { ok: false, label: 'Premium badge' },
                ]}
                onGetStarted={onGetStarted}
            />
            <PricingCard
                name="Premium"
                price="$10"
                priceCaption="Per property. Prices in USD."
                rows={[
                    ...LANDLORD_BASE_INCLUDED,
                    { ok: true, label: 'Top search placement (1 month)' },
                    { ok: true, label: 'Marketing promotion (7 days)' },
                    { ok: true, label: 'Premium badge' },
                ]}
                onGetStarted={onGetStarted}
            />
            <CustomPricingCard
                rows={[
                    { ok: true, label: 'Everything in Premium' },
                    { ok: true, label: 'Top search placement (custom)' },
                    { ok: true, label: 'Marketing promotion (custom)' },
                    { ok: true, label: 'Featured listings' },
                    { ok: true, label: 'Priority support' },
                    { ok: true, label: 'Account manager' },
                    { ok: true, label: 'Custom solutions' },
                ]}
            />
        </div>
    );
}

const PROVIDER_COMMON_INCLUDED = [
    'Business profile',
    'Customer inquiries',
    'Service visibility',
    'Free account access',
    'Verification',
    'Team support',
];

function ServiceProviderCards({ onGetStarted }: { onGetStarted: () => void }) {
    return (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            <PricingCard
                name="Basic"
                price="$10"
                priceCaption="Monthly subscription-based. Prices in USD."
                rows={[
                    { ok: true, label: 'Services listing (3 services)' },
                    ...PROVIDER_COMMON_INCLUDED.map((label) => ({ ok: true as const, label })),
                    { ok: false, label: 'Top search placement (1 month)' },
                    { ok: false, label: 'Marketing promotion (7 days)' },
                    { ok: false, label: 'Premium badge' },
                ]}
                onGetStarted={onGetStarted}
            />
            <PricingCard
                name="Pro"
                price="$30"
                priceCaption="Monthly subscription-based. Prices in USD."
                rows={[
                    { ok: true, label: 'Services listing (5 services)' },
                    ...PROVIDER_COMMON_INCLUDED.map((label) => ({ ok: true as const, label })),
                    { ok: true, label: 'Top search placement (1 month)' },
                    { ok: false, label: 'Marketing promotion (7 days)' },
                    { ok: false, label: 'Premium badge' },
                ]}
                onGetStarted={onGetStarted}
            />
            <PricingCard
                name="Premium"
                price="$50"
                priceCaption="Monthly subscription-based. Prices in USD."
                rows={[
                    { ok: true, label: 'Services listing (5+ services)' },
                    ...PROVIDER_COMMON_INCLUDED.map((label) => ({ ok: true as const, label })),
                    { ok: true, label: 'Top search placement (1 month)' },
                    { ok: true, label: 'Marketing promotion (7 days)' },
                    { ok: true, label: 'Premium badge' },
                ]}
                onGetStarted={onGetStarted}
            />
            <CustomPricingCard
                rows={[
                    { ok: true, label: 'Services listing (custom)' },
                    ...PROVIDER_COMMON_INCLUDED.map((label) => ({ ok: true as const, label })),
                    { ok: true, label: 'Top search placement (custom)' },
                    { ok: true, label: 'Marketing promotion (custom)' },
                    { ok: true, label: 'Premium badge' },
                ]}
            />
        </div>
    );
}

export default function PricingPageContent() {
    const [tab, setTab] = useState<TabId>('landlord');
    const [showModal, setShowModal] = useState(false);

    const headings: Record<TabId, string> = {
        landlord: 'Landlord/Agent Packages and Pricing',
        provider: 'Service Provider Packages and Pricing',
    };

    return (
        <div className="min-h-screen bg-blue-50">
            {showModal && <ComingSoonModal onClose={() => setShowModal(false)} />}

            <header className="relative px-4 pt-12 pb-10 sm:pt-16 sm:pb-12 text-center">
                <h1 className="text-3xl sm:text-4xl md:text-[2.35rem] font-extrabold text-brand-blue tracking-tight font-heading px-2">
                    {headings[tab]}
                </h1>
                <p className="mt-3 max-w-2xl mx-auto text-sm sm:text-base text-gray-700 leading-relaxed">
                    Transparent pricing for landlords/agents and service providers.
                </p>

                <div className="mt-8 flex justify-center px-2">
                    <div
                        className="inline-flex flex-wrap justify-center gap-1 rounded-full bg-white p-1.5 shadow-md ring-1 ring-brand-blue/15"
                        role="tablist"
                        aria-label="Pricing audience"
                    >
                        {(Object.keys(TAB_LABEL) as TabId[]).map((id) => (
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
                                {TAB_LABEL[id]}
                            </button>
                        ))}
                    </div>
                </div>
            </header>

            <div className="container-app px-4 pb-14 sm:pb-16 max-w-7xl mx-auto space-y-12">
                <div role="tabpanel">
                    {tab === 'landlord' && <LandlordCards onGetStarted={() => setShowModal(true)} />}
                    {tab === 'provider' && <ServiceProviderCards onGetStarted={() => setShowModal(true)} />}
                </div>

                <div className="rounded-2xl border border-brand-blue/20 bg-brand-blue p-6 sm:p-8 text-white shadow-lg">
                    <p className="text-lg font-bold font-heading">Need help choosing?</p>
                    <p className="mt-2 text-sm text-white/80">
                        We can walk you through listing packages, authorization fees, and provider subscriptions.
                    </p>
                    <div className="mt-5 flex flex-wrap gap-3">
                        <Link
                            href="/routes/help"
                            className="inline-flex items-center justify-center rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-slate-900 hover:bg-white/90"
                        >
                            Help center
                        </Link>
                        <Link
                            href="/routes/about#contact"
                            className="inline-flex items-center justify-center rounded-lg bg-white/10 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/15"
                        >
                            Contact us
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
