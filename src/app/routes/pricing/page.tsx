import type { Metadata } from 'next';
import Link from 'next/link';
import { BulletList, LegalContactCard, LegalDocLayout, LegalSection } from '../../../components/legal/LegalDocLayout';

export const metadata: Metadata = {
    title: 'Pricing Model | FindAfriq',
    description: 'Property listing packages, home seeker authorization fees, and service provider subscriptions.',
};

export default function PricingPage() {
    return (
        <LegalDocLayout
            title="FindAfriq Pricing Model"
            subtitle="Transparent pricing for landlords, agents, home seekers, and service providers."
        >
            <LegalSection title="1. Property posting packages (landlords & agents)">
                <p className="text-gray-600 text-sm mb-4">Per property. Prices in USD.</p>
                <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm ring-1 ring-gray-100">
                    <table className="min-w-full text-left text-sm">
                        <thead>
                            <tr className="border-b border-gray-200 bg-blue-50/80">
                                <th className="px-4 py-3 font-semibold text-gray-900">Package</th>
                                <th className="px-4 py-3 font-semibold text-gray-900">Price (USD)</th>
                                <th className="px-4 py-3 font-semibold text-gray-900">Features included</th>
                                <th className="px-4 py-3 font-semibold text-gray-900">Deadline</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            <tr className="hover:bg-gray-50/80">
                                <td className="px-4 py-3 font-medium text-gray-900">Basic</td>
                                <td className="px-4 py-3 text-gray-800">$2</td>
                                <td className="px-4 py-3 text-gray-700">Property listing only</td>
                                <td className="px-4 py-3 text-gray-700">Unlimited</td>
                            </tr>
                            <tr className="hover:bg-gray-50/80">
                                <td className="px-4 py-3 font-medium text-gray-900">Pro</td>
                                <td className="px-4 py-3 text-gray-800">$5</td>
                                <td className="px-4 py-3 text-gray-700">Listing + top feature placement</td>
                                <td className="px-4 py-3 text-gray-700">—</td>
                            </tr>
                            <tr className="hover:bg-gray-50/80">
                                <td className="px-4 py-3 font-medium text-gray-900">Premium</td>
                                <td className="px-4 py-3 text-gray-800">$10</td>
                                <td className="px-4 py-3 text-gray-700">Listing + top feature + marketing promotion</td>
                                <td className="px-4 py-3 text-gray-700">—</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </LegalSection>

            <LegalSection title="2. Agent platform authorization fee (home seekers)">
                <p className="text-gray-700 mb-2">
                    One-time platform authorization fee per property transaction category, based on property size. Access
                    periods may be offered as <span className="font-medium text-gray-900">7 days</span> or{' '}
                    <span className="font-medium text-gray-900">1 month</span> depending on the product you select at
                    checkout.
                </p>
                <p className="text-sm text-gray-600 mb-4">
                    Home seekers pay agents directly. The platform does not collect rental commissions. The authorization
                    fee is a fixed amount based on property size.
                </p>
                <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm ring-1 ring-gray-100">
                    <table className="min-w-full text-left text-sm">
                        <thead>
                            <tr className="border-b border-gray-200 bg-blue-50/80">
                                <th className="px-4 py-3 font-semibold text-gray-900">Property size</th>
                                <th className="px-4 py-3 font-semibold text-gray-900">Authorization fee (USD)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            <tr className="hover:bg-gray-50/80">
                                <td className="px-4 py-3 text-gray-800">1–2 rooms</td>
                                <td className="px-4 py-3 font-medium text-gray-900">$20</td>
                            </tr>
                            <tr className="hover:bg-gray-50/80">
                                <td className="px-4 py-3 text-gray-800">3–4 rooms</td>
                                <td className="px-4 py-3 font-medium text-gray-900">$30</td>
                            </tr>
                            <tr className="hover:bg-gray-50/80">
                                <td className="px-4 py-3 text-gray-800">5+ rooms</td>
                                <td className="px-4 py-3 font-medium text-gray-900">$40</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </LegalSection>

            <LegalSection title="3. Service provider subscription plans">
                <p className="text-gray-600 text-sm mb-4">Subscription-based. Prices in USD.</p>
                <div className="grid gap-6 lg:grid-cols-2">
                    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm ring-1 ring-gray-100 lg:col-span-2">
                        <table className="min-w-full text-left text-sm">
                            <thead>
                                <tr className="border-b border-gray-200 bg-blue-50/80">
                                    <th className="px-4 py-3 font-semibold text-gray-900">Package</th>
                                    <th className="px-4 py-3 font-semibold text-gray-900">Price (USD)</th>
                                    <th className="px-4 py-3 font-semibold text-gray-900">Duration</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                <tr className="hover:bg-gray-50/80">
                                    <td className="px-4 py-3 font-medium text-gray-900">Basic</td>
                                    <td className="px-4 py-3 text-gray-800">$10</td>
                                    <td className="px-4 py-3 text-gray-700">2 months</td>
                                </tr>
                                <tr className="hover:bg-gray-50/80">
                                    <td className="px-4 py-3 font-medium text-gray-900">Pro</td>
                                    <td className="px-4 py-3 text-gray-800">$25</td>
                                    <td className="px-4 py-3 text-gray-700">2 months</td>
                                </tr>
                                <tr className="hover:bg-gray-50/80">
                                    <td className="px-4 py-3 font-medium text-gray-900">Premium</td>
                                    <td className="px-4 py-3 text-gray-800">$50</td>
                                    <td className="px-4 py-3 text-gray-700">2 months</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-6 ring-1 ring-blue-100 lg:col-span-2">
                        <p className="text-sm font-semibold text-blue-900">Subscription benefits</p>
                        <div className="mt-3">
                            <BulletList
                                items={[
                                    'Business profile listing',
                                    'Direct customer inquiries',
                                    'Verified provider badge',
                                    'Access to platform housing clients',
                                ]}
                            />
                            </div>
                    </div>
                </div>
            </LegalSection>

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

            <LegalContactCard />
        </LegalDocLayout>
    );
}
