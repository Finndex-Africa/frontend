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
        <div className="min-h-screen bg-white">
            {/* HERO SECTION */}
            <section className="relative w-full max-w-6xl mx-auto px-6 pt-6">
                <MediaCarousel media={media} />
            </section>

            {/* MAIN CONTENT */}
            <section className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 px-6 py-8">
                {/* LEFT SIDE */}
                <div className="lg:col-span-2 space-y-8">
                    {/* TITLE & BASIC INFO */}
                    <header>
                        <div className="text-xs uppercase text-blue-600 font-semibold tracking-wide">
                            {property.status === 'approved' ? 'For Rent' : (property.status?.toUpperCase() || 'AVAILABLE')}
                        </div>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mt-2">{property.title}</h1>
                        <p className="text-gray-600 text-base mt-1">{property.location}</p>

                        {property.rating && (
                            <div className="flex items-center gap-2 mt-3">
                                <svg className="w-4 h-4 text-amber-400 fill-current" viewBox="0 0 24 24">
                                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                                </svg>
                                <span className="text-gray-900 font-semibold text-base">{property.rating.toFixed(1)}</span>
                                {property.reviewCount && (
                                    <span className="text-gray-600 text-sm">({property.reviewCount} reviews)</span>
                                )}
                            </div>
                        )}
                    </header>

                    {/* ABOUT */}
                    <section>
                        <h2 className="text-lg font-semibold text-gray-900 mb-3">About this place</h2>
                        <p className="text-gray-600 text-sm leading-relaxed">
                            {property.description || 'A wonderful property waiting for you to make it your home.'}
                        </p>
                        {property.availableFrom && (
                            <p className="text-gray-600 text-sm mt-3">
                                <span className="font-semibold">Available from:</span> {new Date(property.availableFrom).toLocaleDateString()}
                            </p>
                        )}
                    </section>

                    {/* WHAT THIS PLACE OFFERS */}
                    <section>
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">What this place offers</h2>
                        <div className="grid sm:grid-cols-2 gap-3">
                            {features.map((f, i) => (
                                <div
                                    key={i}
                                    className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-gray-300 transition-all"
                                >
                                    <div className="text-xl">{f.icon}</div>
                                    <div>
                                        <div className="font-medium text-gray-900 text-sm">{f.label}</div>
                                        <div className="text-xs text-gray-500">{f.desc}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* MAP SECTION */}
                    <section>
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Where you&apos;ll be</h2>
                        <div className="w-full h-56 rounded-lg overflow-hidden border border-gray-200">
                            <iframe
                                src={`https://www.google.com/maps?q=${encodeURIComponent(property.location)}&output=embed`}
                                width="100%"
                                height="100%"
                                loading="lazy"
                                className="border-0"
                            ></iframe>
                        </div>
                    </section>

                    {/* LANDLORD/AGENT INFO */}
                    {property.landlordId && (
                        <section>
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Managed by</h2>
                            <div className="flex items-start gap-3 border border-gray-200 p-4 rounded-lg">
                                <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-blue-600 flex-shrink-0">
                                    <div className="w-full h-full flex items-center justify-center text-lg font-bold text-white">
                                        L
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <p className="font-semibold text-gray-900 text-sm">
                                            Property Owner
                                        </p>
                                        <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-medium">
                                            Verified
                                        </span>
                                    </div>
                                    <p className="text-gray-500 text-xs">Registered landlord on Finndex Africa</p>
                                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-600">
                                        <span className="flex items-center gap-1">
                                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                                            </svg>
                                            Identity Verified
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </section>
                    )}

                    {/* REVIEWS SECTION */}
                    <section>
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">
                            Guest Reviews
                            {property.rating && (
                                <span className="ml-2 text-sm font-normal text-gray-600">
                                    {property.rating.toFixed(1)} ★ ({property.reviewCount || 0} reviews)
                                </span>
                            )}
                        </h2>

                        {/* Sample Reviews - Replace with actual reviews from API */}
                        <div className="space-y-3">
                            {[
                                {
                                    name: "Sarah Johnson",
                                    date: "2 weeks ago",
                                    rating: 5,
                                    comment: "Amazing property! The location is perfect and the landlord was very responsive to all our queries. Highly recommended!",
                                    avatar: "https://i.pravatar.cc/150?img=1"
                                },
                                {
                                    name: "Michael Chen",
                                    date: "1 month ago",
                                    rating: 4,
                                    comment: "Great place to live. Clean, well-maintained, and in a safe neighborhood. Would definitely rent again.",
                                    avatar: "https://i.pravatar.cc/150?img=12"
                                },
                                {
                                    name: "Emma Williams",
                                    date: "2 months ago",
                                    rating: 5,
                                    comment: "Exceeded our expectations! The property looks even better in person. Very happy with our choice.",
                                    avatar: "https://i.pravatar.cc/150?img=5"
                                }
                            ].map((review, index) => (
                                <div key={index} className="border border-gray-200 p-4 rounded-lg">
                                    <div className="flex items-start gap-3">
                                        <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                                            <img src={review.avatar} alt={review.name} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-1">
                                                <div>
                                                    <p className="font-semibold text-gray-900 text-sm">{review.name}</p>
                                                    <p className="text-xs text-gray-500">{review.date}</p>
                                                </div>
                                                <div className="flex items-center gap-0.5">
                                                    {[...Array(review.rating)].map((_, i) => (
                                                        <svg key={i} className="w-3 h-3 text-amber-400 fill-current" viewBox="0 0 24 24">
                                                            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                                                        </svg>
                                                    ))}
                                                </div>
                                            </div>
                                            <p className="text-gray-600 text-sm leading-relaxed">{review.comment}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                {/* RIGHT SIDE */}
                <aside className="lg:col-span-1">
                    <div className="sticky top-24">
                        {/* CONTACT CARD */}
                        <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
                            {/* Price Section */}
                            <div className="pb-5 border-b border-gray-200">
                                <div className="flex items-end gap-1 mb-4">
                                    <div className="text-2xl font-bold text-gray-900">
                                        ${property.price ? property.price.toLocaleString() : 'Contact for price'}
                                    </div>
                                    {property.price && (
                                        <span className="text-gray-600 text-sm">/{property.priceUnit || 'month'}</span>
                                    )}
                                </div>
                                {property.isPremium && (
                                    <div className="mb-3 px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-semibold inline-block">
                                        Premium Listing
                                    </div>
                                )}
                                <Button className="w-full h-11 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
                                    Contact Landlord
                                </Button>
                            </div>

                            {/* Message Thread Section */}
                            <div className="pt-5">
                                <MessageThread />
                            </div>
                        </div>
                    </div>
                </aside>
            </section>
        </div>
    );
}
