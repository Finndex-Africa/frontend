import type { Metadata } from 'next';
import PricingPageContent from './PricingPageContent';

export const metadata: Metadata = {
    title: 'Pricing Model | FindAfriq',
    description:
        'Home seeker packages, landlord/agent listing tiers, and service provider subscriptions — transparent USD pricing.',
};

export default function PricingPage() {
    return <PricingPageContent />;
}
