'use client';

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Button from "@/components/ui/Button";
import MediaCarousel from "@/components/domain/MediaCarousel";
import MessageThread from "@/components/domain/MessageThread";
import { servicesApi } from "@/services/api";
import { Service as ApiService } from "@/types/dashboard";

// Default images based on service category
const getDefaultImages = (category: string) => {
    const defaultImages: Record<string, string[]> = {
        'electrical': [
            'https://images.unsplash.com/photo-1621905251918-48416bd8575a',
            'https://images.unsplash.com/photo-1621905252507-b35492cc74b4',
            'https://images.unsplash.com/photo-1621905252472-0d7c27a8f8d7'
        ],
        'plumbing': [
            'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39',
            'https://images.unsplash.com/photo-1585704032915-c3400ca199e7',
            'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39'
        ],
        'cleaning': [
            'https://images.unsplash.com/photo-1581578731548-c64695cc6952',
            'https://images.unsplash.com/photo-1563453392212-326f5e854473',
            'https://images.unsplash.com/photo-1628177142898-93e36e4e3a50'
        ],
        'other': [
            'https://images.unsplash.com/photo-1581578731548-c64695cc6952',
            'https://images.unsplash.com/photo-1504309092620-4d0ec726efa4',
            'https://images.unsplash.com/photo-1560518883-ce09059eeffa'
        ]
    };
    return defaultImages[category] || defaultImages['other'];
};

export default function ServiceDetail() {
    const params = useParams();
    const serviceId = params?.id as string;

    const [service, setService] = useState<ApiService | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (serviceId) {
            fetchService();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [serviceId]);

    const fetchService = async () => {
        try {
            setLoading(true);
            const { data } = await servicesApi.getById(serviceId);
            setService(data);
            setError(null);
        } catch (error) {
            console.error('Error fetching service:', error);
            setError('Failed to load service details. Please try again later.');
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

    if (error || !service) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center max-w-md">
                    <p className="text-red-600 mb-4">{error || 'Service not found'}</p>
                    <button
                        onClick={() => window.location.href = '/routes/services'}
                        className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
                    >
                        Back to Services
                    </button>
                </div>
            </div>
        );
    }

    // Prepare images - use service images or defaults
    const images = service.images && service.images.length > 0
        ? service.images
        : getDefaultImages(service.category);

    const media = images.map(src => ({ type: "image" as const, src }));

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
                            {service.category.replace(/_/g, ' ')}
                        </div>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mt-2">{service.title}</h1>
                        <p className="text-gray-600 text-base mt-1">{service.location}</p>

                        <div className="flex items-center gap-2 mt-3">
                            {service.rating && (
                                <>
                                    <svg className="w-4 h-4 text-amber-400 fill-current" viewBox="0 0 24 24">
                                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                                    </svg>
                                    <span className="text-gray-900 font-semibold text-base">{service.rating.toFixed(1)}</span>
                                </>
                            )}
                            {service.status === 'active' && (
                                <span className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full font-medium">
                                    Active
                                </span>
                            )}
                        </div>
                    </header>

                    {/* ABOUT SERVICE */}
                    <section>
                        <h2 className="text-lg font-semibold text-gray-900 mb-3">About this service</h2>
                        <p className="text-gray-600 text-sm leading-relaxed">
                            {service.description || 'Professional service with experienced providers.'}
                        </p>
                    </section>

                    {/* SERVICE PROVIDER INFO */}
                    {typeof service.provider === 'object' && service.provider && (
                        <section>
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Provided by</h2>
                            <div className="flex items-center gap-3 border border-gray-200 p-4 rounded-lg">
                                <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gray-200">
                                    <div className="w-full h-full flex items-center justify-center text-lg font-bold text-gray-600">
                                        {service.provider.name?.charAt(0).toUpperCase() || 'P'}
                                    </div>
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <p className="font-semibold text-gray-900 text-sm">
                                            {service.provider.name || 'Service Provider'}
                                        </p>
                                        <span className="bg-blue-100 text-blue-600 text-xs px-2 py-0.5 rounded-full font-medium">
                                            Verified
                                        </span>
                                    </div>
                                    <p className="text-gray-500 text-xs mt-1">
                                        {service.provider.email}
                                    </p>
                                </div>
                            </div>
                        </section>
                    )}

                    {/* MAP SECTION */}
                    <section>
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Service Coverage</h2>
                        <div className="w-full h-56 rounded-lg overflow-hidden border border-gray-200">
                            <iframe
                                src={`https://www.google.com/maps?q=${encodeURIComponent(service.location)}&output=embed`}
                                width="100%"
                                height="100%"
                                loading="lazy"
                                className="border-0"
                            ></iframe>
                        </div>
                    </section>

                    {/* REVIEWS SECTION */}
                    <section>
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">
                            Customer Reviews
                            {service.rating && (
                                <span className="ml-2 text-sm font-normal text-gray-600">
                                    {service.rating.toFixed(1)} ★
                                </span>
                            )}
                        </h2>

                        {/* Sample Reviews - Replace with actual reviews from API */}
                        <div className="space-y-3">
                            {[
                                {
                                    name: "David Martinez",
                                    date: "1 week ago",
                                    rating: 5,
                                    comment: "Excellent service! Very professional and completed the work on time. Highly recommended for anyone looking for quality service.",
                                    avatar: "https://i.pravatar.cc/150?img=8"
                                },
                                {
                                    name: "Lisa Anderson",
                                    date: "3 weeks ago",
                                    rating: 5,
                                    comment: "Outstanding work! The service provider was knowledgeable, courteous, and went above and beyond. Will definitely use again.",
                                    avatar: "https://i.pravatar.cc/150?img=9"
                                },
                                {
                                    name: "James Wilson",
                                    date: "1 month ago",
                                    rating: 4,
                                    comment: "Great service overall. Very satisfied with the results and the pricing was fair. Minor delay but communicated well.",
                                    avatar: "https://i.pravatar.cc/150?img=13"
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
                        {/* BOOKING CARD */}
                        <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
                            {/* Price Section */}
                            <div className="pb-5 border-b border-gray-200">
                                <div className="flex items-end gap-1 mb-4">
                                    <div className="text-2xl font-bold text-gray-900">
                                        ${service.price ? service.price.toLocaleString() : 'Contact for price'}
                                    </div>
                                    {service.price && (
                                        <span className="text-gray-600 text-sm">/service</span>
                                    )}
                                </div>
                                <Button className="w-full h-11 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
                                    Book Service
                                </Button>
                                <Button className="w-full h-11 text-sm font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg mt-2">
                                    Chat with Provider
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
