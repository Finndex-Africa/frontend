import type { Metadata } from 'next';
import PropertyDetailClient from './PropertyDetailClient';
import JsonLd, { listingJsonLd, breadcrumbJsonLd } from '@/components/global/JsonLd';
import type { Locale } from '@/i18n/routing';
import {
    buildPropertyShareMetadata,
    fetchPropertyForOg,
} from '@/lib/server/listing-open-graph';

type PageProps = {
    params: Promise<{ id: string; locale: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { id, locale } = await params;
    const property = await fetchPropertyForOg(id);
    if (!property) {
        return { title: 'Property | FindAfriq' };
    }
    return buildPropertyShareMetadata(property, locale);
}

export default async function PropertyDetailPage({ params }: PageProps) {
    const { id, locale } = await params;
    // Re-uses the request the metadata call already made, so this costs nothing
    // extra — Next dedupes identical fetches within a render.
    const property = await fetchPropertyForOg(id);
    const lang = locale as Locale;

    return (
        <>
            {property && (
                <>
                    <JsonLd
                        data={listingJsonLd(lang, {
                            id,
                            path: `/routes/property/${id}`,
                            // "Accommodation" is the schema.org type for a rentable
                            // place to stay; Product would misdescribe a tenancy.
                            type: 'Accommodation',
                            name: property.title,
                            description: property.description,
                            images: property.images,
                            price: property.price,
                            location: property.location,
                            extra: {
                                ...(property.bedrooms != null || property.rooms != null
                                    ? { numberOfBedrooms: property.bedrooms ?? property.rooms }
                                    : {}),
                                ...(property.bathrooms != null
                                    ? { numberOfBathroomsTotal: property.bathrooms }
                                    : {}),
                            },
                        })}
                    />
                    <JsonLd
                        data={breadcrumbJsonLd(lang, [
                            { name: 'Home', path: '' },
                            { name: 'Properties', path: '/routes/properties' },
                            { name: property.title, path: `/routes/property/${id}` },
                        ])}
                    />
                </>
            )}
            <PropertyDetailClient />
        </>
    );
}
