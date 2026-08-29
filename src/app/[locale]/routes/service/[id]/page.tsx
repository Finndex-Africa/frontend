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
        return { title: 'Service | FindAfriq' };
    }
    return buildServiceShareMetadata(service);
}

export default function ServiceDetailPage() {
    return <ServiceDetailClient />;
}
