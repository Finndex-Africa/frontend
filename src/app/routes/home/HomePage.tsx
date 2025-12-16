"use client";
import { useState, useEffect } from "react";
import PropertyCard, { Property } from "../../../components/domain/PropertyCard";
import ServiceCard, { Service } from "../../../components/domain/ServiceCard";
import SearchBar from "../../../components/ui/SearchBar";
import AdvertisementBanner from "../../../components/ui/AdvertisementBanner";
import TestimonialsSection from "../../../components/ui/TestimonialsSection";
import PartnerLogos from "../../../components/ui/PartnerLogos";
import Image from "next/image";
import { useRouter, useSearchParams } from 'next/navigation';
import { propertiesApi, servicesApi } from "@/services/api";
import { Property as ApiProperty, Service as ApiService } from "@/types/dashboard";
import { useAuth } from "@/providers";

const partnerLogos = [
    { name: "Orange Foundation", logoUrl: "/images/partners/55e811dd-e77f-415c-bd80-073b2fa9b71c.png" },
    { name: "MoMo Real Estate", logoUrl: "/images/partners/55ff3a0b-04aa-4fd0-93cf-4f36216d6b92.png" },
    { name: "Orange Digital Center", logoUrl: "/images/partners/aeb9e930-3e9d-4c77-9f7e-052508497447.png" },
    { name: "Partner 4", logoUrl: "/images/partners/e42bd8f1-69be-442e-9220-24d00ec46d8b.png" },
];

// Adapter functions to convert API data to component types
const adaptPropertyToCard = (apiProperty: ApiProperty): Property => {
    const amenities = [];

    // Build amenities array from property data
    if (apiProperty.bedrooms) {
        amenities.push(`${apiProperty.bedrooms} bedroom${apiProperty.bedrooms > 1 ? 's' : ''}`);
    }
    if (apiProperty.bathrooms) {
        amenities.push(`${apiProperty.bathrooms} bathroom${apiProperty.bathrooms > 1 ? 's' : ''}`);
    }
    if (apiProperty.area) {
        amenities.push(`${apiProperty.area} sqm`);
    }

    // Fallback to a default if no amenities
    if (amenities.length === 0) {
        amenities.push(apiProperty.type);
    }

    // Default placeholder image based on property type
    const defaultImages: Record<string, string> = {
        'Apartment': 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267',
        'House': 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9',
        'Commercial': 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab',
        'Land': 'https://images.unsplash.com/photo-1500382017468-9049fed747ef',
        'Other': 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c'
    };

    const defaultImage = defaultImages[apiProperty.type] || defaultImages['Other'];

    return {
        id: apiProperty._id,
        title: apiProperty.title,
        location: apiProperty.location,
        price: `$${apiProperty.price}`,
        imageUrl: apiProperty.images?.[0] || defaultImage,
        amenities,
        rating: apiProperty.rating ? Number(apiProperty.rating.toFixed(2)) : undefined,
        distance: undefined,
        dates: apiProperty.availableFrom ? `Available from ${new Date(apiProperty.availableFrom).toLocaleDateString()}` : undefined
    };
};

const adaptServiceToCard = (apiService: ApiService): Service => {
    // Extract tags from category and description
    const tags = [apiService.category.replace(/_/g, ' ')];

    // Default placeholder images for different service categories
    const defaultServiceImages: Record<string, string> = {
        'electrical': 'https://images.unsplash.com/photo-1621905251918-48416bd8575a',
        'plumbing': 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39',
        'cleaning': 'https://images.unsplash.com/photo-1581578731548-c64695cc6952',
        'painting_decoration': 'https://images.unsplash.com/photo-1562259949-e8e7689d7828',
        'carpentry_furniture': 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7',
        'moving_logistics': 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf',
        'security_services': 'https://images.unsplash.com/photo-1557597774-9d273605dfa9',
        'sanitation_services': 'https://images.unsplash.com/photo-1628177142898-93e36e4e3a50',
        'maintenance': 'https://images.unsplash.com/photo-1504309092620-4d0ec726efa4',
        'other': 'https://images.unsplash.com/photo-1581578731548-c64695cc6952'
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
        badge: apiService.status === 'active' ? 'VERIFIED' : undefined,
        provider
    };
};

export default function HomePage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { setRole } = useAuth();
    const [properties, setProperties] = useState<Property[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [loadingProperties, setLoadingProperties] = useState(true);
    const [loadingServices, setLoadingServices] = useState(true);
    const [propertiesError, setPropertiesError] = useState<string | null>(null);
    const [servicesError, setServicesError] = useState<string | null>(null);

    // Handle logout from dashboard
    useEffect(() => {
        const isLogout = searchParams.get('logout') === 'true';
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
            const url = new URL(window.location.href);
            url.searchParams.delete('logout');
            window.history.replaceState({}, '', url.toString());
        }
    }, [searchParams, setRole]);

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
        } catch (err) {
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
                setPropertiesError('Failed to load properties. Please try again later.');
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
                    limit: 10,
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
                setServicesError('Failed to load services. Please try again later.');
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
            {/* Hero Section with Search Overlay */}
            <section className="relative h-[600px] sm:h-[650px] md:h-[700px] w-full overflow-visible">
                <div className="absolute inset-0 overflow-hidden">
                    <Image
                        src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c"
                        alt="Hero"
                        fill
                        className="object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50" />
                </div>
                <div className="relative z-[5] h-full flex flex-col items-center justify-center text-center text-white px-4 pb-32">
                    <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold max-w-4xl leading-tight mb-3 sm:mb-4 drop-shadow-lg">
                        Discover the Perfect Homes and Services Tailored to your lifestyle
                    </h1>
                </div>

                {/* Search Bar Overlay - positioned to overlap */}
                <div className="absolute bottom-0 left-0 right-0 translate-y-1/3 z-[10] px-4">
                    <div className="w-full max-w-5xl mx-auto">
                        <SearchBar />
                    </div>
                </div>
            </section>

            {/* Trusted Partners Section */}
            <section className="container-app pt-32 pb-12">
                <h2 className="text-2xl font-bold text-center mb-8">
                    Trusted <span className="text-blue-500">Partners</span>
                </h2>
                <PartnerLogos partners={partnerLogos} />
            </section>

            {/* Property Grid */}
            <div className="container-app py-12">
                <h2 className="text-2xl font-semibold text-gray-900 mb-8">
                    Explore available homes
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
                        Continue exploring homes
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
        </div>
    );
}
