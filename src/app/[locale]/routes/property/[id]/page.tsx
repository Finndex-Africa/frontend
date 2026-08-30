import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import PropertyDetailClient from './PropertyDetailClient';
import {
    buildPropertyShareMetadata,
    fetchPropertyForOg,
} from '@/lib/server/listing-open-graph';

type PageProps = {
    params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { id } = await params;
    const property = await fetchPropertyForOg(id);
    if (!property) {
        const tMeta = await getTranslations('metadata');
        return { title: tMeta('propertyFallback') };
    }
    return buildPropertyShareMetadata(property);
}

export default function PropertyDetailPage() {
    return <PropertyDetailClient />;
}
