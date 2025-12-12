'use client';

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import PropertyCard, { Property } from "../../../components/domain/PropertyCard";
import Pagination from "../../../components/ui/Pagination";
import { propertiesApi } from "@/services/api";
import { Property as ApiProperty } from "@/types/dashboard";

// Adapter function to convert API data to component types
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

function PropertiesContent() {
    const searchParams = useSearchParams();
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

    // Get search parameters
    const locationParam = searchParams.get('location');
    const typeParam = searchParams.get('type');
    const maxPriceParam = searchParams.get('maxPrice');

    useEffect(() => {
        fetchProperties();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, searchLocation, searchType, searchBudget, locationParam, typeParam, maxPriceParam]);

    const fetchProperties = async () => {
        try {
            setLoading(true);

            // Build filters object with search params
            const filters: any = {
                page,
                limit,
                status: 'approved',
                sort: '-createdAt'  // Sort by most recent first
            };

            // Add search form filters
            if (searchLocation.trim()) {
                filters.location = searchLocation.trim();
            }
            if (searchType) {
                filters.type = searchType;
            }
            if (searchBudget) {
                filters.maxPrice = parseInt(searchBudget);
            }

            // Add URL search parameters if they exist (these override form filters)
            if (locationParam) filters.location = locationParam;
            if (typeParam) filters.type = typeParam;
            if (maxPriceParam) filters.maxPrice = parseInt(maxPriceParam);

            const response = await propertiesApi.getAll(filters);

            // Handle both response structures
            const propertiesData = response.data?.data || response.data;
            const paginationData = response.data?.pagination;

            const adaptedProperties = propertiesData.map(adaptPropertyToCard);
            setProperties(adaptedProperties);

            // Set total pages from pagination data
            if (paginationData) {
                setTotalPages(paginationData.totalPages || 1);
            }
            if (!paginationData) {
                setTotalPages(1);
            }
            setError(null);
        } catch (error) {
            console.error('Error fetching properties:', error);
            setError('Failed to load properties. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1); // Reset to first page when searching
    };

    const handleLocationChange = (value: string) => {
        setSearchLocation(value);
        setPage(1); // Reset to first page
    };

    const handleTypeChange = (value: string) => {
        setSearchType(value);
        setPage(1); // Reset to first page
    };

    const handleBudgetChange = (value: string) => {
        setSearchBudget(value);
        setPage(1); // Reset to first page
    };

    return (
        <div className="min-h-screen bg-white">
            {/* Hero Section with Search Overlay */}
            <section className="relative h-[400px] w-full overflow-visible">
                <div className="absolute inset-0 overflow-hidden">
                    <Image
                        src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1600"
                        alt="Properties Hero"
                        fill
                        className="object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40" />
                </div>
                <div className="relative z-[5] h-full flex flex-col items-center justify-center text-center text-white px-4">
                    <h1 className="text-3xl md:text-5xl font-extrabold max-w-4xl leading-tight mb-4">
                        Find Verified Homes
                    </h1>
                    <p className="text-xl text-white/90 mb-8">
                        Discover your perfect home from our collection of verified properties
                    </p>
                </div>

                {/* Search Bar Overlay - positioned to overlap */}
                <div className="absolute bottom-0 left-0 right-0 translate-y-1/2 z-[10] px-4">
                    <div className="container-app max-w-5xl mx-auto">
                        <form onSubmit={handleSearch} className="bg-gray-50 rounded-2xl shadow-xl p-6">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                                {/* Location */}
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        Location
                                    </label>
                                    <input
                                        type="text"
                                        value={searchLocation}
                                        onChange={(e) => handleLocationChange(e.target.value)}
                                        placeholder="Search location"
                                        className="w-full h-12 px-4 border border-gray-300 rounded-lg text-gray-600 bg-white placeholder-gray-400 hover:border-gray-400 transition-colors focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    />
                                </div>

                                {/* Property Type */}
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                        </svg>
                                        Property Type
                                    </label>
                                    <select
                                        value={searchType}
                                        onChange={(e) => handleTypeChange(e.target.value)}
                                        className="w-full h-12 px-4 pr-10 border border-gray-300 rounded-lg text-gray-600 bg-white appearance-none cursor-pointer hover:border-gray-400 transition-colors focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    >
                                        <option value="">Select type</option>
                                        <option value="Apartment">Apartment</option>
                                        <option value="House">House</option>
                                        <option value="Commercial">Commercial</option>
                                        <option value="Land">Land</option>
                                    </select>
                                </div>

                                {/* Budget */}
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        Budget
                                    </label>
                                    <input
                                        type="number"
                                        value={searchBudget}
                                        onChange={(e) => handleBudgetChange(e.target.value)}
                                        placeholder="Determine Your Budget"
                                        className="w-full h-12 px-4 border border-gray-300 rounded-lg text-gray-600 bg-white placeholder-gray-400 hover:border-gray-400 transition-colors focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    />
                                </div>

                                {/* Search Button */}
                                <div>
                                    <button type="submit" className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors shadow-md hover:shadow-lg">
                                        Search
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </section>

            {/* Properties Grid */}
            <div className="container-app pt-32 pb-12">
                {/* Show active filters */}
                {(locationParam || typeParam || maxPriceParam) && (
                    <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h3 className="font-semibold text-gray-900 mb-2">Active Filters:</h3>
                        <div className="flex flex-wrap gap-2">
                            {locationParam && (
                                <span className="bg-white px-3 py-1 rounded-full text-sm border border-blue-300">
                                    Location: {locationParam}
                                </span>
                            )}
                            {typeParam && (
                                <span className="bg-white px-3 py-1 rounded-full text-sm border border-blue-300">
                                    Type: {typeParam}
                                </span>
                            )}
                            {maxPriceParam && (
                                <span className="bg-white px-3 py-1 rounded-full text-sm border border-blue-300">
                                    Max Budget: ${maxPriceParam}
                                </span>
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
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
                        <p className="text-gray-600 text-lg">No properties available at the moment. Check back soon!</p>
                    </div>
                ) : (
                    <>
                        <div className="mb-6">
                            <p className="text-gray-600">
                                Showing {properties.length} properties
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-6 gap-y-10">
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
