'use client';

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Button from "@/components/ui/Button";
import MediaCarousel from "@/components/domain/MediaCarousel";
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
                            {service.category.replace(/_/g, ' ')}
                        </div>
                        <h1 className="text-4xl font-bold text-gray-900 mt-1">{service.title}</h1>
                        <p className="text-gray-600 text-lg mt-1">{service.location}</p>

                        <div className="flex items-center gap-2 mt-3">
                            {service.rating && (
                                <>
                                    <svg className="w-5 h-5 text-amber-400 fill-current" viewBox="0 0 24 24">
                                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                                    </svg>
                                    <span className="text-gray-900 font-semibold text-lg">{service.rating.toFixed(1)}</span>
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
                        <h2 className="text-2xl font-semibold text-gray-900 mb-3">About this service</h2>
                        <p className="text-gray-700 leading-relaxed">
                            {service.description || 'Professional service with experienced providers.'}
                        </p>
                    </section>

                    {/* SERVICE PROVIDER INFO */}
                    {typeof service.provider === 'object' && service.provider && (
                        <section>
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Provided by</h2>
                            <div className="flex items-center gap-4 bg-white shadow-sm p-4 rounded-xl">
                                <div className="relative w-16 h-16 rounded-full overflow-hidden bg-gray-200">
                                    <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-gray-600">
                                        {service.provider.name?.charAt(0).toUpperCase() || 'P'}
                                    </div>
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <p className="font-semibold text-gray-900 text-lg">
                                            {service.provider.name || 'Service Provider'}
                                        </p>
                                        <span className="bg-blue-100 text-blue-600 text-xs px-2 py-0.5 rounded-full font-medium">
                                            Verified
                                        </span>
                                    </div>
                                    <p className="text-gray-600 text-sm mt-1">
                                        {service.provider.email}
                                    </p>
                                </div>
                            </div>
                        </section>
                    )}

                    {/* MAP SECTION */}
                    <section>
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Service Coverage</h2>
                        <div className="w-full h-64 rounded-xl overflow-hidden shadow-sm">
                            <iframe
                                src={`https://www.google.com/maps?q=${encodeURIComponent(service.location)}&output=embed`}
                                width="100%"
                                height="100%"
                                loading="lazy"
                                className="border-0"
                            ></iframe>
                        </div>
                    </section>
                </div>

                {/* RIGHT SIDE */}
                <aside className="lg:col-span-1">
                    <div className="sticky top-28 space-y-6">
                        {/* BOOKING CARD */}
                        <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
                            <div className="flex items-end gap-1 mb-4">
                                <div className="text-4xl font-bold text-gray-900">
                                    ${service.price ? service.price.toLocaleString() : 'Contact for price'}
                                </div>
                                {service.price && (
                                    <span className="text-gray-600 text-base">/service</span>
                                )}
                            </div>
                            <Button className="w-full h-12 text-base font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl">
                                Book Service
                            </Button>
                            <Button className="w-full h-12 text-base font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl mt-2">
                                Chat with Provider
                            </Button>
                        </div>
                    </div>
                </aside>
            </section>
        </div>
    );
}
