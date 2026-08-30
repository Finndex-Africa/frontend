import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import ServiceDetailClient from './ServiceDetailClient';
import {
    buildServiceShareMetadata,
    fetchServiceForOg,
} from '@/lib/server/listing-open-graph';

type PageProps = {
    params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { id } = await params;
    const service = await fetchServiceForOg(id);
    if (!service) {
        const tMeta = await getTranslations('metadata');
        return { title: tMeta('serviceFallback') };
    }
    return buildServiceShareMetadata(service);
}

export default function ServiceDetailPage() {
    return <ServiceDetailClient />;
}
