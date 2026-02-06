'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useBookmarks } from "@/providers";
import PropertyCard, { Property } from "@/components/domain/PropertyCard";
import ServiceCard, { Service } from "@/components/domain/ServiceCard";
import { propertiesApi, servicesApi } from "@/services/api";
import { Property as ApiProperty, Service as ApiService } from "@/types/dashboard";

const defaultPropertyImage = '/images/properties/pexels-photo-323780.jpeg';

function adaptPropertyToCard(apiProperty: ApiProperty): Property {
    const amenities: string[] = [];
    const bedroomCount = apiProperty.bedrooms != null ? apiProperty.bedrooms : apiProperty.rooms;
    if (bedroomCount != null) {
        amenities.push(`${bedroomCount} bedroom${bedroomCount !== 1 ? 's' : ''}`);
    } else {
        amenities.push('Bedrooms not specified');
    }
    if (apiProperty.bathrooms) {
        amenities.push(`${apiProperty.bathrooms} bathroom${apiProperty.bathrooms > 1 ? 's' : ''}`);
    }
    if (apiProperty.area) {
        amenities.push(`${apiProperty.area} min from main road`);
    }
    if (amenities.length === 0) amenities.push(apiProperty.type);

    return {
        id: apiProperty._id,
        title: apiProperty.title,
        location: apiProperty.location,
        price: `$${apiProperty.price}`,
        imageUrl: apiProperty.images?.[0] || defaultPropertyImage,
        amenities,
        rating: apiProperty.rating ? Number(apiProperty.rating.toFixed(2)) : undefined,
        distance: undefined,
        dates: apiProperty.availableFrom ? `Available from ${new Date(apiProperty.availableFrom).toLocaleDateString()}` : undefined,
    };
}

const defaultServiceImages: Record<string, string> = {
    electrical: '/images/services/electricity1.jpeg',
    plumbing: '/images/services/plumbing1.jpeg',
    cleaning: '/images/services/cleaning1.jpeg',
    painting_decoration: '/images/services/cleaning1.jpeg',
    carpentry_furniture: '/images/services/cleaning1.jpeg',
    moving_logistics: '/images/services/cleaning1.jpeg',
    security_services: '/images/services/cleaning1.jpeg',
    sanitation_services: '/images/services/cleaning1.jpeg',
    maintenance: '/images/services/cleaning1.jpeg',
    other: '/images/services/cleaning1.jpeg',
};

function adaptServiceToCard(apiService: ApiService): Service {
    const tags = [apiService.category.replace(/_/g, ' ')];
    const defaultImage = defaultServiceImages[apiService.category] || defaultServiceImages['other'];
    const provider = typeof apiService.provider === 'object' && apiService.provider
        ? { name: apiService.provider.name || 'Service Provider', photo: undefined }
        : undefined;

    return {
        id: apiService._id,
        name: apiService.title,
        location: apiService.location,
        rating: apiService.rating ? Number(apiService.rating.toFixed(2)) : 0,
        reviews: 0,
        imageUrl: apiService.images?.[0] || defaultImage,
        tags,
        badge: apiService.status === 'active' ? 'VERIFIED' : undefined,
        provider,
    };
}

export default function FavoritesPage() {
    const router = useRouter();
    const { bookmarks } = useBookmarks();
    const [properties, setProperties] = useState<Property[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Only allow logged-in users
    useEffect(() => {
        const token = typeof window !== "undefined" ? (localStorage.getItem("token") || sessionStorage.getItem("token")) : null;
        if (!token) {
            router.replace("/routes/login");
        }
    }, [router]);

    useEffect(() => {
        if (bookmarks.length === 0) {
            setProperties([]);
            setServices([]);
            setLoading(false);
            return;
        }

        let cancelled = false;
        setLoading(true);
        setError(null);

        (async () => {
            const propIds = bookmarks.filter((b) => b.type === 'property').map((b) => b.id);
            const svcIds = bookmarks.filter((b) => b.type === 'service').map((b) => b.id);

            try {
                const [propResults, svcResults] = await Promise.all([
                    Promise.all(propIds.map((id) => propertiesApi.getById(id).then((r) => r.data).catch(() => null))),
                    Promise.all(svcIds.map((id) => servicesApi.getById(id).then((r) => r.data).catch(() => null))),
                ]);

                if (cancelled) return;
                setProperties(propResults.filter((p): p is ApiProperty => p != null).map(adaptPropertyToCard));
                setServices(svcResults.filter((s): s is ApiService => s != null).map(adaptServiceToCard));
            } catch (e) {
                if (!cancelled) setError('Failed to load some saved items.');
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();

        return () => { cancelled = true; };
    }, [bookmarks]);

    const isEmpty = !loading && properties.length === 0 && services.length === 0;

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
                <h1 className="text-2xl sm:text-3xl font-heading font-bold text-gray-900 mb-2">Favorites</h1>
                <p className="text-gray-600 mb-6">
                    Properties and services you&apos;ve saved with the heart button.
                </p>

                {loading && (
                    <div className="flex items-center justify-center py-16">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-blue" />
                    </div>
                )}

                {error && (
                    <p className="text-red-600 mb-4" role="alert">{error}</p>
                )}

                {!loading && isEmpty && (
                    <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
                        <p className="text-gray-500 mb-2">You haven&apos;t saved any items yet.</p>
                        <p className="text-sm text-gray-400">Use the heart on a property or service to add it here.</p>
                    </div>
                )}

                {!loading && !isEmpty && (
                    <div className="space-y-10">
                        {properties.length > 0 && (
                            <section>
                                <h2 className="text-lg font-heading font-bold text-gray-800 mb-4">Saved properties</h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {properties.map((p) => (
                                        <PropertyCard key={p.id} p={p} />
                                    ))}
                                </div>
                            </section>
                        )}
                        {services.length > 0 && (
                            <section>
                                <h2 className="text-lg font-heading font-bold text-gray-800 mb-4">Saved services</h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {services.map((s) => (
                                        <ServiceCard key={s.id} service={s} />
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
