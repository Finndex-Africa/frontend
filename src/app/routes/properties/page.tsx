'use client';

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import PropertyCard, { Property } from "../../../components/domain/PropertyCard";
import SearchBar from "../../../components/ui/SearchBar";
import HeroVerifiedBadge from "../../../components/ui/HeroVerifiedBadge";
import VerifiedTrustedBanner from "../../../components/ui/VerifiedTrustedBanner";
import Pagination from "../../../components/ui/Pagination";
import { propertiesApi } from "@/services/api";
import { Property as ApiProperty } from "@/types/dashboard";
import { getUserFriendlyErrorMessage } from "@/lib/error-messages";
import { normalizeApiEntityList } from "@/lib/normalize-api-entity";

// Adapter function to convert API data to component types
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
        imageUrls: apiProperty.images?.length ? apiProperty.images : [defaultImage],
        amenities,
        rating: apiProperty.rating ? Number(apiProperty.rating.toFixed(2)) : undefined,
        distance: undefined,
        dates: apiProperty.availableFrom ? `Available from ${new Date(apiProperty.availableFrom).toLocaleDateString()}` : undefined,
        propertyType: propertyType || undefined,
    };
};

function PropertiesContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const limit = 20;

    // Search form state
    const [searchLocation, setSearchLocation] = useState('');
    const [searchType, setSearchType] = useState('');
    const [searchBudget, setSearchBudget] = useState('');

    // Clear all filters
    const clearAllFilters = () => {
        setSearchLocation('');
        setSearchType('');
        setSearchBudget('');
        setPage(1);
        router.push('/routes/properties');
    };

    // Remove a specific filter
    const removeFilter = (filterName: 'location' | 'type' | 'maxPrice') => {
        const params = new URLSearchParams(searchParams.toString());
        params.delete(filterName);

        // Also clear the corresponding form state
        if (filterName === 'location') setSearchLocation('');
        if (filterName === 'type') setSearchType('');
        if (filterName === 'maxPrice') setSearchBudget('');

        setPage(1);
        const queryString = params.toString();
        router.push(`/routes/properties${queryString ? `?${queryString}` : ''}`);
    };

    // Get search parameters
    const locationParam = searchParams.get('location');
    const typeParam = searchParams.get('type');
    const maxPriceParam = searchParams.get('maxPrice');

    // Sync form state with URL params
    useEffect(() => {
        setSearchLocation(locationParam || '');
        setSearchType(typeParam || '');
        setSearchBudget(maxPriceParam || '');
    }, [locationParam, typeParam, maxPriceParam]);

    useEffect(() => {
        setPage(1);
    }, [locationParam, typeParam, maxPriceParam]);

    useEffect(() => {
        fetchProperties();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, locationParam, typeParam, maxPriceParam]);

    const fetchProperties = async () => {
        try {
            setLoading(true);

            const filters: Record<string, unknown> = {
                page,
                limit,
                status: 'approved',
                sort: '-createdAt',
            };

            if (locationParam) filters.location = locationParam;
            if (typeParam) filters.propertyType = typeParam;
            if (maxPriceParam) filters.maxPrice = parseInt(maxPriceParam);

            const response = await propertiesApi.getAll(filters);

            // Handle both response structures:
            // New: { success, data: [...], pagination: {...} }
            // Old: { success, data: { data: [...], pagination: {...} } }
            const propertiesData = normalizeApiEntityList<ApiProperty>(
                response.data?.data || response.data,
            );
            const paginationData = response.pagination || response.data?.pagination;

            const adaptedProperties = propertiesData.map(adaptPropertyToCard);
            setProperties(adaptedProperties);

            // Set total pages from pagination data
            if (paginationData && paginationData.totalPages) {
                setTotalPages(paginationData.totalPages);
            } else {
                setTotalPages(1);
            }
            setError(null);
        } catch (error) {
            console.error('Error fetching properties:', error);
            setError(getUserFriendlyErrorMessage(error, 'Failed to load properties. Please try again later.'));
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
                        src="/images/properties/pexels-photo-323780.jpeg"
                        alt="Properties Hero"
                        fill
                        className="object-cover"
                        priority
                    />
                    <div className="absolute inset-0 bg-black/40" />
                </div>
                <div className="relative z-[5] flex flex-col items-center justify-center px-4 pt-20 pb-2 text-center text-white md:h-[400px] md:pt-0 md:pb-0">
                    <h1 className="mb-2 max-w-4xl text-xl font-extrabold leading-tight sm:text-3xl md:mb-4 md:text-5xl">
                        Find Verified Properties
                    </h1>
                    <p className="mb-2 text-sm text-white/90 sm:text-lg md:mb-4 md:text-xl">
                        Discover the perfect property from our collection of verified listings
                    </p>
                    <HeroVerifiedBadge />
                </div>

                <div className="relative z-30 isolate px-4 pb-3 md:absolute md:bottom-0 md:left-0 md:right-0 md:translate-y-1/2 md:pb-0">
                    <div className="container-app max-w-5xl mx-auto">
                        <SearchBar
                            variant="properties"
                            initialLocation={locationParam || ''}
                            initialType={typeParam || ''}
                            initialBudget={maxPriceParam || ''}
                        />
                    </div>
                </div>
            </section>

            <div className="relative z-0 mt-4 md:mt-28 pb-4">
                <VerifiedTrustedBanner />
            </div>

            {/* Properties Grid */}
            <div className="container-app pt-6 pb-8 sm:pb-12 px-4">
                {/* Show active filters */}
                {(locationParam || typeParam || maxPriceParam) && (
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
                            {typeParam && (
                                <button
                                    onClick={() => removeFilter('type')}
                                    className="bg-white px-3 py-1 rounded-full text-sm border border-blue-300 flex items-center gap-1.5 hover:bg-blue-100 transition-colors group"
                                >
                                    Type: {typeParam}
                                    <svg className="w-3.5 h-3.5 text-gray-400 group-hover:text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            )}
                            {maxPriceParam && (
                                <button
                                    onClick={() => removeFilter('maxPrice')}
                                    className="bg-white px-3 py-1 rounded-full text-sm border border-blue-300 flex items-center gap-1.5 hover:bg-blue-100 transition-colors group"
                                >
                                    Max Budget: ${maxPriceParam}
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
                        <p className="text-red-600 mb-4">{error}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
                        >
                            Retry
                        </button>
                    </div>
                ) : properties.length === 0 ? (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 sm:p-12 text-center">
                        <p className="text-gray-600 text-base sm:text-lg">No properties available at the moment. Check back soon!</p>
                    </div>
                ) : (
                    <>
                        <div className="mb-4 sm:mb-6">
                            <p className="text-gray-600 text-sm sm:text-base">
                                Showing {properties.length} properties
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-6 gap-y-6 sm:gap-y-10">
                            {properties.map((property) => (
                                <PropertyCard key={property.id} p={property} />
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

export default function PropertiesPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-white">
                <div className="flex justify-center items-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            </div>
        }>
            <PropertiesContent />
        </Suspense>
    );
}
