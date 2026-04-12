"use client";
import { useState, useEffect } from "react";
import PropertyCard, { Property } from "../../../components/domain/PropertyCard";
import ServiceCard, { Service } from "../../../components/domain/ServiceCard";
import SearchBar from "../../../components/ui/SearchBar";
import AdvertisementBanner from "../../../components/ui/AdvertisementBanner";
import TestimonialsSection from "../../../components/ui/TestimonialsSection";
import PartnerLogos from "../../../components/ui/PartnerLogos";

import Image from "next/image";
import { useRouter } from 'next/navigation';
import { propertiesApi, servicesApi } from "@/services/api";
import { getUserFriendlyErrorMessage } from "@/lib/error-messages";
import { Property as ApiProperty, Service as ApiService } from "@/types/dashboard";
import { useAuth } from "@/providers";

const partnerLogos = [
    { name: "Partner 1", logoUrl: "/images/partners/partner1.jpeg" },
    { name: "Partner 2", logoUrl: "/images/partners/partner2.jpeg" },
    { name: "Partner 3", logoUrl: "/images/partners/partner3.jpeg" },
    { name: "Partner 4", logoUrl: "/images/partners/partner4.jpeg" },
    { name: "Partner 5", logoUrl: "/images/partners/partner5.jpeg" },
    { name: "Partner 6", logoUrl: "/images/partners/partner6.jpeg" },
];

// Adapter functions to convert API data to component types
const adaptPropertyToCard = (apiProperty: ApiProperty): Property => {
    const amenities = [];

    // Build amenities array from property data (use rooms as fallback when bedrooms missing)
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

    // Fallback to a default if no amenities
    if (amenities.length === 0) {
        amenities.push(apiProperty.type);
    }

    const defaultImage = '/images/properties/pexels-photo-323780.jpeg';

    const propertyType = apiProperty.propertyType || apiProperty.type || '';
    return {
        id: apiProperty._id,
        title: apiProperty.title,
        location: apiProperty.location,
        price: `$${apiProperty.price}`,
        imageUrl: apiProperty.images?.[0] || defaultImage,
        amenities,
        rating: apiProperty.rating ? Number(apiProperty.rating.toFixed(2)) : undefined,
        distance: undefined,
        dates: apiProperty.availableFrom ? `Available from ${new Date(apiProperty.availableFrom).toLocaleDateString()}` : undefined,
        propertyType: propertyType || undefined,
    };
};

const adaptServiceToCard = (apiService: ApiService): Service => {
    // Extract tags from category and description
    const tags = [apiService.category.replace(/_/g, ' ')];

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
    const defaultImage = defaultServiceImages[apiService.category] || defaultServiceImages['other'];

    // Extract provider info if available
    const provider = typeof apiService.provider === 'object' && apiService.provider
        ? {
            name: apiService.provider.name || 'Service Provider',
            photo: undefined // Backend would need to provide this
        }
        : undefined;

    return {
        id: apiService._id,
        name: apiService.title,
        location: apiService.location,
        rating: apiService.rating ? Number(apiService.rating.toFixed(2)) : 0,
        reviews: 0, // API doesn't provide review count yet
        imageUrl: apiService.images?.[0] || defaultImage,
        tags,
        badge: apiService.category ? apiService.category.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : undefined,
        provider
    };
};

export default function HomePage() {
    const router = useRouter();
    const { setRole } = useAuth();
    const [properties, setProperties] = useState<Property[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [loadingProperties, setLoadingProperties] = useState(true);
    const [loadingServices, setLoadingServices] = useState(true);
    const [propertiesError, setPropertiesError] = useState<string | null>(null);
    const [servicesError, setServicesError] = useState<string | null>(null);

    // Handle logout from dashboard
    useEffect(() => {
        if (typeof window === 'undefined') return;
        const url = new URL(window.location.href);
        const isLogout = url.searchParams.get('logout') === 'true';
        if (isLogout) {
            console.log('🚪 Logout request from dashboard');
            // Clear all auth storage
            localStorage.removeItem('token');
            localStorage.removeItem('authToken'); // legacy cleanup
            localStorage.removeItem('user');
            sessionStorage.removeItem('token');
            sessionStorage.removeItem('authToken'); // legacy cleanup
            sessionStorage.removeItem('user');
            setRole('guest');

            // Remove logout parameter from URL
            url.searchParams.delete('logout');
            window.history.replaceState({}, '', url.toString());
        }
    }, [setRole]);

    // On mount, print any persistent debug logs (helpful after redirects)
    useEffect(() => {
        try {
            // dynamic import to avoid bundling in production vendor churn
            import('@/utils/persistentLogger').then((mod) => {
                const logs = mod.getLogs();
                if (logs && logs.length) {
                    // Print compact summary to console
                    console.groupCollapsed(`Persistent logs (${logs.length})`);
                    logs.slice(-50).forEach((l: any) => console.log(l.ts, l.level, l.message, l.meta));
                    console.groupEnd();
                }
            });
        } catch {
            // ignore
        }
    }, []);

    useEffect(() => {
        // Fetch properties from API
        const fetchProperties = async () => {
            try {
                setLoadingProperties(true);
                const response = await propertiesApi.getAll({
                    page: 1,
                    limit: 15,
                    status: 'approved',
                    sort: '-createdAt'  // Sort by most recent first
                });
                // Handle both response structures: response.data.data or response.data
                const propertiesData = response.data?.data || response.data;
                const adaptedProperties = propertiesData.map(adaptPropertyToCard);
                setProperties(adaptedProperties);
                setPropertiesError(null);
            } catch (error: any) {
                console.error('Error fetching properties:', error);
                console.error('Error details:', error?.response?.data || error?.message);
                setPropertiesError(getUserFriendlyErrorMessage(error, 'Failed to load properties. Please try again later.'));
                setProperties([]);
            } finally {
                setLoadingProperties(false);
            }
        };

        // Fetch services from API
        const fetchServices = async () => {
            try {
                setLoadingServices(true);
                const response = await servicesApi.getAll({
                    page: 1,
                    limit: 15,
                    status: 'active',
                    sort: '-createdAt'  // Sort by most recent first
                });
                // Handle both response structures: response.data.data or response.data
                const servicesData = response.data?.data || response.data;
                const adaptedServices = servicesData.map(adaptServiceToCard);
                setServices(adaptedServices);
                setServicesError(null);
            } catch (error) {
                console.error('Error fetching services:', error);
                setServicesError(getUserFriendlyErrorMessage(error, 'Failed to load services. Please try again later.'));
                setServices([]);
            } finally {
                setLoadingServices(false);
            }
        };

        fetchProperties();
        fetchServices();
    }, []);
    return (
        <div className="min-h-screen bg-white">
            {/* Hero — fixed image heights (same as Properties); mobile: stacked headline + search with extra gap; md+: unchanged overlap */}
            <section className="relative h-[500px] sm:h-[450px] md:h-[400px] w-full overflow-visible pb-32 sm:pb-20 md:pb-0">
                <div className="absolute inset-0 overflow-hidden h-[300px] sm:h-[350px] md:h-[400px]">
                    <Image
                        src="/images/properties/pexels-photo-323780.jpeg"
                        alt="Hero"
                        fill
                        className="object-cover"
                        priority
                    />
                    <div className="absolute inset-0 bg-black/40" />
                </div>

                <div className="relative z-[5] flex flex-col md:block md:h-[400px]">
                    <div className="px-4 pt-8 pb-5 sm:pt-10 sm:pb-6 text-center text-white md:absolute md:inset-0 md:flex md:items-center md:justify-center md:pt-0 md:pb-0 md:px-4">
                        <h1 className="text-2xl sm:text-3xl md:text-5xl font-extrabold max-w-4xl mx-auto leading-tight drop-shadow-lg">
                            Find Verified Properties and Trusted Service Providers
                        </h1>
                    </div>

                    {/* Mobile: margin-top pushes search below headline (no overlap); md+: same as Properties — no extra margin */}
                    <div className="relative z-10 mt-6 sm:mt-8 px-4 pb-6 sm:pb-8 md:mt-0 md:pb-0 md:absolute md:bottom-0 md:left-0 md:right-0 md:translate-y-1/2">
                        <div className="container-app max-w-5xl mx-auto">
                            <SearchBar />
                        </div>
                    </div>
                </div>
            </section>

            {/* Trusted by Leading Organizations and Service Providers - disabled for now */}
            {false && (
                <section className="container-app pt-40 sm:pt-44 md:pt-48 pb-6">
                    <h2 className="text-xl sm:text-2xl font-bold text-center mb-4 sm:mb-6 px-4">
                        Trusted by Leading Organizations and Service Providers
                    </h2>
                    <PartnerLogos partners={partnerLogos} />
                </section>
            )}

            {/* Spacer — matches top padding after hero on Properties page */}
            <div className="pt-8 sm:pt-12 md:pt-32" aria-hidden="true" />

            {/* Property Grid */}
            <div className="container-app py-12">
                <h2 className="text-2xl font-semibold text-gray-900 mb-8">
                    Explore available properties
                </h2>
                {loadingProperties ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 "></div>
                    </div>
                ) : propertiesError ? (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                        <p className="text-red-600 mb-4">{propertiesError}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
                        >
                            Retry
                        </button>
                    </div>
                ) : properties.length === 0 ? (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
                        <p className="text-gray-600 text-lg">No properties available at the moment. Check back soon!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-6 gap-y-10">
                        {properties.map((property) => (
                            <PropertyCard key={property.id} p={property} />
                        ))}
                    </div>
                )}
            </div>

            {/* Continue exploring section */}
            <div>
                <div className="container-app py-12">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-8">
                        Continue exploring properties
                    </h2>
                    <button className="cursor-pointer bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors"
                        onClick={() => router.push('/routes/properties')}
                    >
                        Show more
                    </button>
                </div>
            </div>

            {/* Advertisement Banner */}
            <AdvertisementBanner />

            {/* Services Section */}
            <div className="container-app py-12">
                <h2 className="text-2xl font-semibold text-gray-900 mb-8">
                    Explore trusted service providers
                </h2>
                {loadingServices ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                    </div>
                ) : servicesError ? (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                        <p className="text-red-600 mb-4">{servicesError}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors shadow-md"
                        >
                            Retry
                        </button>
                    </div>
                ) : services.length === 0 ? (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
                        <p className="text-gray-600 text-lg">No services available at the moment. Check back soon!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-6 gap-y-10">
                        {services.map((service) => (
                            <ServiceCard key={service.id} service={service} />
                        ))}
                    </div>
                )}
            </div>

            {/* Continue exploring services */}
            <div>
                <div className="container-app py-12">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-8">
                        More services to explore
                    </h2>
                    <button className="cursor-pointer bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors"
                        onClick={() => router.push('/routes/services')}
                    >
                        Show more services
                    </button>
                </div>
            </div>

            {/* Testimonials Section */}
            <TestimonialsSection />

            {/* CTA - Join Us on Our Journey */}
            <section className="bg-blue-600 py-16 text-white text-center">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">Join Us on Our Journey</h2>
                <p className="text-lg md:text-xl max-w-2xl mx-auto mb-6">
                    Whether you&apos;re looking for services or want to provide your expertise, we welcome you to be part of our growing community.
                </p>
                <a
                    href="/routes/login"
                    className="inline-block bg-white text-blue-600 font-semibold px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors"
                >
                    Get Started
                </a>
            </section>
        </div>
    );
}
