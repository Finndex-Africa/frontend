'use client';

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import ServiceCard, { Service } from "../../../components/domain/ServiceCard";
import SearchBar from "../../../components/ui/SearchBar";
import HeroVerifiedBadge from "../../../components/ui/HeroVerifiedBadge";
import VerifiedTrustedBanner from "../../../components/ui/VerifiedTrustedBanner";
import Pagination from "../../../components/ui/Pagination";
import { servicesApi } from "@/services/api";
import { Service as ApiService } from "@/types/dashboard";
import { getUserFriendlyErrorMessage } from "@/lib/error-messages";

// Adapter function to convert API data to component types
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

function ServicesContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const limit = 20;

    // Search form state
    const [searchLocation, setSearchLocation] = useState('');
    const [searchType, setSearchType] = useState('');
    const [searchServiceName, setSearchServiceName] = useState('');

    // Clear all filters
    const clearAllFilters = () => {
        setSearchLocation('');
        setSearchType('');
        setSearchServiceName('');
        setPage(1);
        router.push('/routes/services');
    };

    // Remove a specific filter
    const removeFilter = (filterName: 'location' | 'category' | 'q') => {
        const params = new URLSearchParams(searchParams.toString());
        params.delete(filterName);

        if (filterName === 'location') setSearchLocation('');
        if (filterName === 'category') setSearchType('');
        if (filterName === 'q') setSearchServiceName('');

        setPage(1);
        const queryString = params.toString();
        router.push(`/routes/services${queryString ? `?${queryString}` : ''}`);
    };

    // Get search parameters
    const locationParam = searchParams.get('location');
    const categoryParam = searchParams.get('category');
    const serviceNameParam = searchParams.get('q');

    // Sync form state with URL params
    useEffect(() => {
        setSearchLocation(locationParam || '');
        setSearchType(categoryParam || '');
        setSearchServiceName(serviceNameParam || '');
    }, [locationParam, categoryParam, serviceNameParam]);

    useEffect(() => {
        setPage(1);
    }, [locationParam, categoryParam, serviceNameParam]);

    useEffect(() => {
        fetchServices();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, locationParam, categoryParam, serviceNameParam]);

    const fetchServices = async () => {
        try {
            setLoading(true);

            const filters: Record<string, unknown> = {
                page,
                limit,
                status: 'active',
                sort: '-createdAt',
            };

            if (locationParam) filters.location = locationParam;
            if (categoryParam) filters.category = categoryParam;
            if (serviceNameParam) filters.q = serviceNameParam;

            const response = await servicesApi.getAll(filters);

            // Handle both response structures:
            // New: { success, data: [...], pagination: {...} }
            // Old: { success, data: { data: [...], pagination: {...} } }
            const servicesData = response.data?.data || response.data;
            const paginationData = response.pagination || response.data?.pagination;

            const adaptedServices = servicesData.map(adaptServiceToCard);
            setServices(adaptedServices);

            // Set total pages from pagination data
            if (paginationData && paginationData.totalPages) {
                setTotalPages(paginationData.totalPages);
            } else {
                setTotalPages(1);
            }
            setError(null);
        } catch (error) {
            console.error('Error fetching services:', error);
            setError(getUserFriendlyErrorMessage(error, 'Failed to load services. Please try again later.'));
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="min-h-screen bg-white">
            {/* Hero Section with Search Overlay */}
            <section className="relative z-20 w-full overflow-visible pb-3 md:h-[400px] md:pb-0">
                <div className="absolute inset-0 overflow-hidden">
                    <Image
                        src="/images/services/cleaning1.jpeg"
                        alt="Services Hero"
                        fill
                        className="object-cover"
                        priority
                    />
                    <div className="absolute inset-0 bg-black/40" />
                </div>
                <div className="relative z-[5] flex flex-col items-center justify-center px-4 pt-20 pb-2 text-center text-white md:h-[400px] md:pt-0 md:pb-0">
                    <h1 className="mb-2 max-w-4xl text-xl font-extrabold leading-tight sm:text-3xl md:mb-4 md:text-5xl">
                        Find Trusted Services
                    </h1>
                    <p className="mb-2 text-sm text-white/90 sm:text-lg md:mb-4 md:text-xl">
                        Connect with verified service providers for all your needs
                    </p>
                    <HeroVerifiedBadge />
                </div>

                <div className="relative z-30 isolate px-4 pb-3 md:absolute md:bottom-0 md:left-0 md:right-0 md:translate-y-1/2 md:pb-0">
                    <div className="container-app max-w-5xl mx-auto">
                        <SearchBar
                            variant="services"
                            initialLocation={locationParam || ''}
                            initialType={categoryParam || ''}
                            initialServiceName={serviceNameParam || ''}
                        />
                    </div>
                </div>
            </section>

            <div className="relative z-0 mt-4 md:mt-28 pb-4">
                <VerifiedTrustedBanner />
            </div>

            {/* Services Grid */}
            <div className="container-app pt-6 pb-8 sm:pb-12 px-4">
                {/* Show active filters */}
                {(locationParam || categoryParam || serviceNameParam) && (
                    <div className="mb-4 sm:mb-6 bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold text-sm sm:text-base text-gray-900">Active Filters:</h3>
                            <button
                                onClick={clearAllFilters}
                                className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 transition-colors"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                Clear All
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {locationParam && (
                                <button
                                    onClick={() => removeFilter('location')}
                                    className="bg-white px-3 py-1 rounded-full text-sm border border-blue-300 flex items-center gap-1.5 hover:bg-blue-100 transition-colors group"
                                >
                                    Location: {locationParam}
                                    <svg className="w-3.5 h-3.5 text-gray-400 group-hover:text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            )}
                            {categoryParam && (
                                <button
                                    onClick={() => removeFilter('category')}
                                    className="bg-white px-3 py-1 rounded-full text-sm border border-blue-300 flex items-center gap-1.5 hover:bg-blue-100 transition-colors group"
                                >
                                    Category: {categoryParam.replace(/_/g, ' ')}
                                    <svg className="w-3.5 h-3.5 text-gray-400 group-hover:text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            )}
                            {serviceNameParam && (
                                <button
                                    onClick={() => removeFilter('q')}
                                    className="bg-white px-3 py-1 rounded-full text-sm border border-blue-300 flex items-center gap-1.5 hover:bg-blue-100 transition-colors group"
                                >
                                    Service: {serviceNameParam}
                                    <svg className="w-3.5 h-3.5 text-gray-400 group-hover:text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {loading && page === 1 ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                ) : error ? (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                        <p className="text-red-600 mb-4 text-sm sm:text-base">{error}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm sm:text-base"
                        >
                            Retry
                        </button>
                    </div>
                ) : services.length === 0 ? (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 sm:p-12 text-center">
                        <p className="text-gray-600 text-base sm:text-lg">No services available at the moment. Check back soon!</p>
                    </div>
                ) : (
                    <>
                        <div className="mb-4 sm:mb-6">
                            <p className="text-gray-600 text-sm sm:text-base">
                                Showing {services.length} services
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-6 gap-y-6 sm:gap-y-10">
                            {services.map((service) => (
                                <ServiceCard key={service.id} service={service} />
                            ))}
                        </div>

                        {/* Pagination */}
                        <Pagination
                            currentPage={page}
                            totalPages={totalPages}
                            onPageChange={handlePageChange}
                        />
                    </>
                )}
            </div>
        </div>
    );
}

export default function ServicesPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-white">
                <div className="flex justify-center items-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            </div>
        }>
            <ServicesContent />
        </Suspense>
    );
}
