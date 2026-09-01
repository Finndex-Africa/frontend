import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import PricingPageContent from './PricingPageContent';

export async function generateMetadata() {
    const tMeta = await getTranslations('metadata');
    // Root layout applies the "%s | FindAfriq" title template.
    return { title: tMeta('pricingTitle'), description: tMeta('pricingDesc') };
}

export default function PricingPage() {
    return <PricingPageContent />;
}
