import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'Pricing',
    description: 'Findafriq pricing will be published once the structure is finalized.',
    robots: {
        index: false,
        follow: false,
    },
};

export default function PricingPage() {
    return (
        <div className="min-h-[60vh] flex items-center justify-center px-4 py-16">
            <div className="max-w-lg text-center">
                <h1 className="text-3xl font-bold text-gray-900 mb-3">Pricing coming soon</h1>
                <p className="text-gray-600 leading-relaxed mb-8">
                    We&apos;re finalizing the Findafriq pricing structure. This page will be available once pricing is ready.
                </p>
                <Link
                    href="/"
                    className="inline-flex items-center justify-center rounded-lg bg-blue-600 text-white px-6 py-3 text-sm font-semibold hover:bg-blue-700 transition"
                >
                    Back to home
                </Link>
            </div>
        </div>
    );
}
