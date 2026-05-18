'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Check, X } from 'lucide-react';
import { LegalContactCard } from '@/components/legal/LegalDocLayout';

type TabId = 'seeker' | 'landlord' | 'provider';

const TAB_LABEL: Record<TabId, string> = {
    seeker: 'Home Seeker',
    landlord: 'Landlord/Agent',
    provider: 'Service Providers',
};

const cardShell =
    'flex flex-col rounded-2xl bg-[#153885] text-white p-6 sm:p-7 shadow-xl ring-1 ring-white/15 min-h-[480px]';

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

function PricingCard({
    name,
    price,
    priceCaption,
    rows,
}: {
    name: string;
    price: string;
    priceCaption: string;
    rows: { ok: boolean; label: string }[];
}) {
    return (
        <div className={cardShell}>
            <h3 className="text-center text-xl font-bold font-heading tracking-tight">{name}</h3>
            <div className="my-4 border-t border-white/25" />
            <p className="text-center text-4xl sm:text-[2.75rem] font-extrabold text-[#FFCC00] leading-none">{price}</p>
            <p className="mt-2 text-center text-xs sm:text-sm text-white/85">{priceCaption}</p>
            <ul className="mt-6 flex-1 space-y-2.5">
                {rows.map((row) => (
                    <FeatureRow key={row.label} ok={row.ok} label={row.label} muted={!row.ok} />
                ))}
            </ul>
            <Link
                href="/routes/login"
                className="mt-8 inline-flex w-full items-center justify-center rounded-full bg-[#FFCC00] px-5 py-3.5 text-center text-sm font-bold text-[#0a1628] shadow-md transition hover:bg-[#ffd633] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
            >
                Get started
            </Link>
        </div>
    );
}

const SEEKER_SHARED: { ok: true; label: string }[] = [
    { ok: true, label: 'Contact providers directly' },
    { ok: true, label: 'Access to agent listings' },
    { ok: true, label: 'Unlimited searches' },
    { ok: true, label: 'Free account access' },
    { ok: true, label: 'Save favorite listings' },
    { ok: true, label: 'One-time authorization' },
    { ok: true, label: 'Secure property access' },
    { ok: true, label: 'Verification' },
    { ok: true, label: 'Team support' },
];

function HomeSeekerCards() {
    return (
        <div className="grid gap-6 md:grid-cols-3">
            <PricingCard
                name="Basic"
                price="$20"
                priceCaption="Per property. Access fee (1–2 rooms). Prices in USD."
                rows={[{ ok: true, label: 'Access fee (1–2 rooms)' }, ...SEEKER_SHARED]}
            />
            <PricingCard
                name="Pro"
                price="$30"
                priceCaption="Per property. Access fee (3–4 rooms). Prices in USD."
                rows={[{ ok: true, label: 'Access fee (3–4 rooms)' }, ...SEEKER_SHARED]}
            />
            <PricingCard
                name="Premium"
                price="$40"
                priceCaption="Per property. Access fee (5+ rooms). Prices in USD."
                rows={[{ ok: true, label: 'Access fee (5+ rooms)' }, ...SEEKER_SHARED]}
            />
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

function LandlordCards() {
    return (
        <div className="grid gap-6 md:grid-cols-3">
            <PricingCard
                name="Basic"
                price="$2"
                priceCaption="Per property listing. Prices in USD."
                rows={[...LANDLORD_BASE_INCLUDED, ...LANDLORD_BASIC_EXCLUDED]}
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

function ServiceProviderCards() {
    return (
        <div className="grid gap-6 md:grid-cols-3">
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
            />
        </div>
    );
}

export default function PricingPageContent() {
    const [tab, setTab] = useState<TabId>('seeker');

    const headings: Record<TabId, string> = {
        seeker: 'Home Seeker Packages and Pricing',
        landlord: 'Landlord/Agent Packages and Pricing',
        provider: 'Service Provider Packages and Pricing',
    };

    return (
        <div className="min-h-screen bg-[#eef2ff]">
            <header className="relative px-4 pt-12 pb-10 sm:pt-16 sm:pb-12 text-center">
                <h1 className="text-3xl sm:text-4xl md:text-[2.35rem] font-extrabold text-[#153885] tracking-tight font-heading px-2">
                    {headings[tab]}
                </h1>
                <p className="mt-3 max-w-2xl mx-auto text-sm sm:text-base text-gray-700 leading-relaxed">
                    Transparent pricing for home seekers, landlords/agents, and service providers.
                </p>

                <div className="mt-8 flex justify-center px-2">
                    <div
                        className="inline-flex flex-wrap justify-center gap-1 rounded-full bg-white p-1.5 shadow-md ring-1 ring-[#153885]/15"
                        role="tablist"
                        aria-label="Pricing audience"
                    >
                        {(Object.keys(TAB_LABEL) as TabId[]).map((id) => (
                            <button
                                key={id}
                                type="button"
                                role="tab"
                                aria-selected={tab === id}
                                className={`rounded-full px-4 py-2.5 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#153885]/40 ${
                                    tab === id
                                        ? 'bg-[#153885] text-white shadow-sm'
                                        : 'text-[#153885] hover:bg-[#eef2ff]'
                                }`}
                                onClick={() => setTab(id)}
                            >
                                {TAB_LABEL[id]}
                            </button>
                        ))}
                    </div>
                </div>
            </header>

            <div className="container-app px-4 pb-14 sm:pb-16 max-w-6xl mx-auto space-y-12">
                <div role="tabpanel">
                    {tab === 'seeker' && <HomeSeekerCards />}
                    {tab === 'landlord' && <LandlordCards />}
                    {tab === 'provider' && <ServiceProviderCards />}
                </div>

                <div className="rounded-2xl border border-gray-200 bg-slate-900 p-6 sm:p-8 text-white shadow-lg">
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
