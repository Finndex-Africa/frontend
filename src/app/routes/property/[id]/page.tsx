'use client';

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import MediaCarousel from "@/components/domain/MediaCarousel";
import Button from "@/components/ui/Button";
import MessageThread from "@/components/domain/MessageThread";
import { propertiesApi } from "@/services/api";
import { Property as ApiProperty } from "@/types/dashboard";

// Default images based on property type
const getDefaultImages = (type: string) => {
    const defaultImages: Record<string, string[]> = {
        'Apartment': [
            'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267',
            'https://images.unsplash.com/photo-1502672260066-6bc35f0e1e1e',
            'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267'
        ],
        'House': [
            'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9',
            'https://images.unsplash.com/photo-1600585154340-be6161a56a0c',
            'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c'
        ],
        'Commercial': [
            'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab',
            'https://images.unsplash.com/photo-1497366216548-37526070297c',
            'https://images.unsplash.com/photo-1497366811353-6870744d04b2'
        ],
        'Land': [
            'https://images.unsplash.com/photo-1500382017468-9049fed747ef',
            'https://images.unsplash.com/photo-1500382017468-9049fed747ef',
            'https://images.unsplash.com/photo-1500382017468-9049fed747ef'
        ],
        'Other': [
            'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c',
            'https://images.unsplash.com/photo-1600607687644-aac4c3eac7f4',
            'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3'
        ]
    };
    return defaultImages[type] || defaultImages['Other'];
};

export default function PropertyDetail() {
    const params = useParams();
    const propertyId = params?.id as string;

    const [property, setProperty] = useState<ApiProperty | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (propertyId) {
            fetchProperty();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [propertyId]);

    const fetchProperty = async () => {
        try {
            setLoading(true);
            const { data } = await propertiesApi.getById(propertyId);
            setProperty(data);
            setError(null);
        } catch (error) {
            console.error('Error fetching property:', error);
            setError('Failed to load property details. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error || !property) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center max-w-md">
                    <p className="text-red-600 mb-4">{error || 'Property not found'}</p>
                    <button
                        onClick={() => window.location.href = '/routes/properties'}
                        className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
                    >
                        Back to Properties
                    </button>
                </div>
            </div>
        );
    }

    // Prepare images - use property images or defaults
    const images = property.images && property.images.length > 0
        ? property.images
        : getDefaultImages(property.type);

    const media = images.map(src => ({ type: "image" as const, src }));

    // Prepare amenities/features
    const features = [];
    if (property.bedrooms) features.push({ label: "Bedrooms", desc: `${property.bedrooms} rooms`, icon: "🛏️" });
    if (property.bathrooms) features.push({ label: "Bathrooms", desc: `${property.bathrooms} bathrooms`, icon: "🚿" });
    if (property.area) features.push({ label: "Area", desc: `${property.area} sqm`, icon: "📐" });
    if (property.furnished !== undefined) features.push({ label: "Furnished", desc: property.furnished ? "Fully furnished" : "Unfurnished", icon: "🪑" });

    // Add default features if none provided
    if (features.length < 4) {
        const defaults = [
            { label: "Wi-Fi", desc: "High-speed internet", icon: "📶" },
            { label: "Security", desc: "24/7 security", icon: "🔒" },
            { label: "Parking", desc: "Secure parking", icon: "🚗" },
        ];
        features.push(...defaults.slice(0, 6 - features.length));
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* HERO SECTION */}
            <section className="relative w-full max-w-7xl mx-auto">
                <MediaCarousel media={media} />
            </section>

            {/* MAIN CONTENT */}
            <section className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-10 px-6 py-10">
                {/* LEFT SIDE */}
                <div className="lg:col-span-2 space-y-10">
                    {/* TITLE & BASIC INFO */}
                    <header>
                        <div className="text-sm uppercase text-blue-600 font-semibold tracking-wider">
                            {property.status === 'approved' ? 'For Rent' : (property.status?.toUpperCase() || 'AVAILABLE')}
                        </div>
                        <h1 className="text-4xl font-bold text-gray-900 mt-1">{property.title}</h1>
                        <p className="text-gray-600 text-lg mt-1">{property.location}</p>

                        {property.rating && (
                            <div className="flex items-center gap-2 mt-3">
                                <svg className="w-5 h-5 text-amber-400 fill-current" viewBox="0 0 24 24">
                                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                                </svg>
                                <span className="text-gray-900 font-semibold text-lg">{property.rating.toFixed(1)}</span>
                                {property.reviewCount && (
                                    <span className="text-gray-600 text-sm">({property.reviewCount} reviews)</span>
                                )}
                            </div>
                        )}
                    </header>

                    {/* ABOUT */}
                    <section>
                        <h2 className="text-2xl font-semibold text-gray-900 mb-3">About this place</h2>
                        <p className="text-gray-700 leading-relaxed">
                            {property.description || 'A wonderful property waiting for you to make it your home.'}
                        </p>
                        {property.availableFrom && (
                            <p className="text-gray-600 mt-3">
                                <span className="font-semibold">Available from:</span> {new Date(property.availableFrom).toLocaleDateString()}
                            </p>
                        )}
                    </section>

                    {/* WHAT THIS PLACE OFFERS */}
                    <section>
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">What this place offers</h2>
                        <div className="grid sm:grid-cols-2 gap-5">
                            {features.map((f, i) => (
                                <div
                                    key={i}
                                    className="flex items-center gap-3 p-3 rounded-xl bg-white shadow-sm hover:shadow-md transition-all"
                                >
                                    <div className="text-2xl">{f.icon}</div>
                                    <div>
                                        <div className="font-semibold text-gray-900">{f.label}</div>
                                        <div className="text-sm text-gray-600">{f.desc}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* MAP SECTION */}
                    <section>
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Where you'll be</h2>
                        <div className="w-full h-64 rounded-xl overflow-hidden shadow-sm">
                            <iframe
                                src={`https://www.google.com/maps?q=${encodeURIComponent(property.location)}&output=embed`}
                                width="100%"
                                height="100%"
                                loading="lazy"
                                className="border-0"
                            ></iframe>
                        </div>
                    </section>

                    {/* REVIEWS SECTION */}
                    {property.reviewCount && property.reviewCount > 0 && (
                        <section>
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Guest Reviews</h2>
                            <div className="bg-white p-5 rounded-xl shadow-sm text-center text-gray-600">
                                {property.reviewCount} review{property.reviewCount > 1 ? 's' : ''} available
                            </div>
                        </section>
                    )}
                </div>

                {/* RIGHT SIDE */}
                <aside className="lg:col-span-1">
                    <div className="sticky top-28 space-y-6">
                        {/* PRICING CARD */}
                        <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
                            <div className="flex items-end gap-1 mb-4">
                                <div className="text-4xl font-bold text-gray-900">
                                    ${property.price ? property.price.toLocaleString() : 'Contact for price'}
                                </div>
                                {property.price && (
                                    <span className="text-gray-600 text-base">/{property.priceUnit || 'month'}</span>
                                )}
                            </div>
                            {property.isPremium && (
                                <div className="mb-3 px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm font-semibold inline-block">
                                    Premium Listing
                                </div>
                            )}
                            <Button className="w-full h-12 text-base font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl">
                                Contact Landlord
                            </Button>
                        </div>

                        {/* MESSAGE THREAD */}
                        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                            <MessageThread />
                        </div>
                    </div>
                </aside>
            </section>
        </div>
    );
}
