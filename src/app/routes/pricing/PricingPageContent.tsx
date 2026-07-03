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

const LANDLORD_BASIC_ROWS: { ok: boolean; label: string }[] = [
    { ok: true, label: 'Up to 20 property listings' },
    { ok: true, label: 'Listing management dashboard' },
    { ok: true, label: 'Standard search visibility' },
    { ok: true, label: 'Unlimited property inquiries' },
    { ok: true, label: 'Property sharing' },
    { ok: true, label: 'WhatsApp contact integration' },
    { ok: true, label: 'Direct contact with home seekers' },
    { ok: true, label: 'Verified badge' },
    { ok: true, label: 'Email notifications' },
    { ok: true, label: 'Basic customer support' },
    { ok: false, label: 'Featured listings' },
    { ok: false, label: 'Top search placement' },
    { ok: false, label: 'Marketing promotion' },
    { ok: false, label: 'Premium badge' },
];

const LANDLORD_PRO_ROWS: { ok: boolean; label: string }[] = [
    { ok: true, label: 'Up to 40 property listings' },
    { ok: true, label: 'Listing management dashboard' },
    { ok: true, label: 'Standard search visibility' },
    { ok: true, label: 'Unlimited property inquiries' },
    { ok: true, label: 'Property sharing' },
    { ok: true, label: 'WhatsApp contact integration' },
    { ok: true, label: 'Direct contact with home seekers' },
    { ok: true, label: 'Verified badge' },
    { ok: true, label: 'Email notifications' },
    { ok: true, label: 'Featured listings' },
    { ok: true, label: 'Top search placement' },
    { ok: true, label: 'Priority customer support' },
    { ok: false, label: 'Marketing promotion' },
    { ok: false, label: 'Premium badge' },
];

const LANDLORD_PREMIUM_ROWS: { ok: boolean; label: string }[] = [
    { ok: true, label: 'Unlimited property listings' },
    { ok: true, label: 'Listing management dashboard' },
    { ok: true, label: 'Standard search visibility' },
    { ok: true, label: 'Unlimited property inquiries' },
    { ok: true, label: 'Property sharing' },
    { ok: true, label: 'WhatsApp contact integration' },
    { ok: true, label: 'Direct contact with home seekers' },
    { ok: true, label: 'Verified badge' },
    { ok: true, label: 'Email notifications' },
    { ok: true, label: 'Featured listings' },
    { ok: true, label: 'Top search placement' },
    { ok: true, label: 'Premium badge' },
    { ok: true, label: 'Marketing promotion' },
    { ok: true, label: 'Premium support' },
];

function LandlordCards({ onGetStarted }: { onGetStarted: () => void }) {
    return (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            <PricingCard
                name="Basic"
                price="$10"
                priceCaption="Per month. Prices in USD."
                rows={LANDLORD_BASIC_ROWS}
                onGetStarted={onGetStarted}
            />
            <PricingCard
                name="Pro"
                price="$20"
                priceCaption="Per month. Prices in USD."
                rows={LANDLORD_PRO_ROWS}
                onGetStarted={onGetStarted}
            />
            <PricingCard
                name="Premium"
                price="$30"
                priceCaption="Per month. Prices in USD."
                rows={LANDLORD_PREMIUM_ROWS}
                onGetStarted={onGetStarted}
            />
            <CustomPricingCard
                rows={[
                    { ok: true, label: 'Dedicated account manager' },
                    { ok: true, label: 'Banner promotion' },
                    { ok: true, label: 'Platform advertising (Ads)' },
                    { ok: true, label: 'Homepage feature placement' },
                ]}
            />
        </div>
    );
}

const PROVIDER_BASIC_ROWS: { ok: boolean; label: string }[] = [
    { ok: true, label: 'Up to 5 service listings' },
    { ok: true, label: 'Listing management dashboard' },
    { ok: true, label: 'Unlimited service inquiries' },
    { ok: true, label: 'Service sharing' },
    { ok: true, label: 'WhatsApp contact integration' },
    { ok: true, label: 'Direct contact with customers' },
    { ok: true, label: 'Verified business badge' },
    { ok: true, label: 'Standard search visibility' },
    { ok: true, label: 'Email notifications' },
    { ok: true, label: 'Basic support' },
    { ok: false, label: 'Featured service listings' },
    { ok: false, label: 'Top search placement' },
    { ok: false, label: 'Marketing promotion' },
    { ok: false, label: 'Premium badge' },
];

const PROVIDER_PRO_ROWS: { ok: boolean; label: string }[] = [
    { ok: true, label: 'Up to 10 service listings' },
    { ok: true, label: 'Listing management dashboard' },
    { ok: true, label: 'Unlimited service inquiries' },
    { ok: true, label: 'Service sharing' },
    { ok: true, label: 'WhatsApp contact integration' },
    { ok: true, label: 'Direct contact with customers' },
    { ok: true, label: 'Verified business badge' },
    { ok: true, label: 'Standard search visibility' },
    { ok: true, label: 'Email notifications' },
    { ok: true, label: 'Featured service listings' },
    { ok: true, label: 'Top search placement' },
    { ok: true, label: 'Priority support' },
    { ok: false, label: 'Marketing promotion' },
    { ok: false, label: 'Premium badge' },
];

const PROVIDER_PREMIUM_ROWS: { ok: boolean; label: string }[] = [
    { ok: true, label: 'Unlimited service listings' },
    { ok: true, label: 'Listing management dashboard' },
    { ok: true, label: 'Unlimited service inquiries' },
    { ok: true, label: 'Service sharing' },
    { ok: true, label: 'WhatsApp contact integration' },
    { ok: true, label: 'Direct contact with customers' },
    { ok: true, label: 'Verified business badge' },
    { ok: true, label: 'Standard search visibility' },
    { ok: true, label: 'Email notifications' },
    { ok: true, label: 'Featured service listings' },
    { ok: true, label: 'Top search placement' },
    { ok: true, label: 'Premium badge' },
    { ok: true, label: 'Marketing promotion' },
    { ok: true, label: 'Premium support' },
];

function ServiceProviderCards({ onGetStarted }: { onGetStarted: () => void }) {
    return (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            <PricingCard
                name="Basic"
                price="$20"
                priceCaption="Per month. Prices in USD."
                rows={PROVIDER_BASIC_ROWS}
                onGetStarted={onGetStarted}
            />
            <PricingCard
                name="Pro"
                price="$30"
                priceCaption="Per month. Prices in USD."
                rows={PROVIDER_PRO_ROWS}
                onGetStarted={onGetStarted}
            />
            <PricingCard
                name="Premium"
                price="$50"
                priceCaption="Per month. Prices in USD."
                rows={PROVIDER_PREMIUM_ROWS}
                onGetStarted={onGetStarted}
            />
            <CustomPricingCard
                rows={[
                    { ok: true, label: 'Dedicated account manager' },
                    { ok: true, label: 'Banner promotion' },
                    { ok: true, label: 'Platform advertising (Ads)' },
                    { ok: true, label: 'Homepage feature placement' },
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
                    Affordable, flexible monthly subscription plans designed to help you grow your business, increase visibility, and connect with more customers.
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
