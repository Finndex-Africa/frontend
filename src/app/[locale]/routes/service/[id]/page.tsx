import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import ServiceDetailClient from './ServiceDetailClient';
import JsonLd, { listingJsonLd, breadcrumbJsonLd } from '@/components/global/JsonLd';
import type { Locale } from '@/i18n/routing';
import {
    buildServiceShareMetadata,
    fetchServiceForOg,
} from '@/lib/server/listing-open-graph';

type PageProps = {
    params: Promise<{ id: string; locale: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { id, locale } = await params;
    const service = await fetchServiceForOg(id);
    if (!service) {
        const tMeta = await getTranslations('metadata');
        return { title: tMeta('serviceFallback') };
    }
    return buildServiceShareMetadata(service, locale);
}

export default async function ServiceDetailPage({ params }: PageProps) {
    const { id, locale } = await params;
    const service = await fetchServiceForOg(id);
    const lang = locale as Locale;

    return (
        <>
            {service && (
                <>
                    <JsonLd
                        data={listingJsonLd(lang, {
                            id,
                            path: `/routes/service/${id}`,
                            type: 'Service',
                            name: service.title,
                            description: service.description,
                            images: service.images,
                            price: service.price,
                            location: service.location,
                            extra: {
                                ...(service.category ? { serviceType: service.category } : {}),
                                ...(service.location
                                    ? { areaServed: { '@type': 'Place', name: service.location } }
                                    : {}),
                            },
                        })}
                    />
                    <JsonLd
                        data={breadcrumbJsonLd(lang, [
                            { name: 'Home', path: '' },
                            { name: 'Services', path: '/routes/services' },
                            { name: service.title, path: `/routes/service/${id}` },
                        ])}
                    />
                </>
            )}
            <ServiceDetailClient />
        </>
    );
}
