'use client';

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import toast, { Toaster } from 'react-hot-toast';
import MediaCarousel from "@/components/domain/MediaCarousel";
import { servicesApi } from "@/services/api";
import { Service as ApiService } from "@/types/dashboard";
import { apiClient } from "@/lib/api-client";
import { MessageCircle, Calendar, Mail, Lock } from 'lucide-react';
import ChatBox from "@/components/dashboard/ChatBox";
import ReviewsList from "@/components/reviews/ReviewsList";

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
    const [currentUser, setCurrentUser] = useState<{ id: string; firstName?: string; email?: string; phone?: string } | null>(null);
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [bookingData, setBookingData] = useState({
        scheduledDate: '',
        duration: '2',
        contactPhone: '',
        serviceLocation: '',
        notes: ''
    });

    useEffect(() => {
        // Get current user from storage
        const userStr = localStorage.getItem('user') || sessionStorage.getItem('user');
        if (userStr) {
            try {
                const userData = JSON.parse(userStr);
                setCurrentUser({
                    id: userData._id || userData.id,
                    firstName: userData.firstName,
                    email: userData.email,
                    phone: userData.phone
                });
                // Pre-fill phone if available
                if (userData.phone) {
                    setBookingData(prev => ({ ...prev, contactPhone: userData.phone }));
                }
            } catch (e) {
                console.error('Failed to parse user data:', e);
            }
        }

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

    const handleBookService = () => {
        if (!currentUser) {
            window.location.href = '/routes/login';
            return;
        }
        setShowBookingModal(true);
    };

    const handleSubmitBooking = async () => {
        if (!currentUser || !service || submitting) return;

        // Validate required fields
        if (!bookingData.contactPhone.trim()) {
            toast.error('Please provide your contact phone number');
            return;
        }

        if (!bookingData.scheduledDate) {
            toast.error('Please select your preferred service date');
            return;
        }

        if (!bookingData.serviceLocation.trim()) {
            toast.error('Please provide the service location');
            return;
        }

        // Validate date is in the future
        const scheduledDate = new Date(bookingData.scheduledDate);
        if (scheduledDate <= new Date()) {
            toast.error('Service date must be in the future');
            return;
        }

        try {
            setSubmitting(true);

            const bookingPayload = {
                serviceId: service._id,
                scheduledDate: new Date(bookingData.scheduledDate).toISOString(),
                duration: parseInt(bookingData.duration),
                contactPhone: bookingData.contactPhone,
                serviceLocation: bookingData.serviceLocation,
                serviceAddress: bookingData.serviceLocation,
                notes: bookingData.notes || `Service booking for ${service.title}. Duration: ${bookingData.duration} hours.`,
                paymentMethod: 'pending'
            };

            const response = await apiClient.post('/bookings', bookingPayload);

            if (response.success) {
                toast.success('Service booking submitted successfully! The provider will contact you soon.');
                setShowBookingModal(false);
                setBookingData({
                    scheduledDate: '',
                    duration: '2',
                    contactPhone: currentUser.phone || '',
                    serviceLocation: '',
                    notes: ''
                });
            } else {
                throw new Error(response.message || 'Failed to create booking');
            }
        } catch (error: any) {
            console.error('Booking error:', error);
            console.error('Error response:', error?.response?.data);

            let errorMessage = 'Failed to submit booking. Please try again.';

            if (error?.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error?.response?.status === 401) {
                errorMessage = 'Your session has expired. Please sign in again.';
            } else if (error?.response?.status === 404) {
                errorMessage = 'Booking service is temporarily unavailable. Please try again or contact support.';
            }

            toast.error(errorMessage);
        } finally {
            setSubmitting(false);
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
            <Toaster position="top-center" />
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
                        {service.rating && (
                            <div className="flex items-center gap-2 mt-3">
                                <svg className="w-4 h-4 text-amber-400 fill-current" viewBox="0 0 24 24">
                                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                                </svg>
                                <span className="text-gray-900 font-semibold text-base">{service.rating.toFixed(1)}</span>
                                {service.status === 'active' && (
                                    <span className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full font-medium">
                                        Active
                                    </span>
                                )}
                            </div>
                        )}
                    </header>

                    {/* ABOUT SERVICE */}
                    <section>
                        <h2 className="text-lg font-semibold text-gray-900 mb-3">About this service</h2>
                        <p className="text-gray-600 text-sm leading-relaxed">
                            {service.description || 'Professional service with experienced providers.'}
                        </p>
                    </section>

                    {/* SERVICE PROVIDER INFO */}
                    <section>
                        {(() => {
                            // Extract provider ID from service object
                            let providerIdValue = '';
                            let providerName = 'Service Provider';
                            let providerEmail = '';
                            let providerAvatar = '';

                            // Try to get provider from service.providerId first
                            if (typeof (service as any).providerId === 'object' && (service as any).providerId) {
                                const providerObj = (service as any).providerId;
                                providerIdValue = providerObj._id || providerObj.id || '';
                                providerEmail = providerObj.email || '';
                                providerName = providerObj.name || providerObj.firstName || providerObj.businessName || providerEmail || 'Service Provider';
                                providerAvatar = providerObj.avatar || '';
                            } else if (typeof (service as any).providerId === 'string') {
                                providerIdValue = (service as any).providerId;
                            }

                            // Fallback to service.provider if providerId is not available
                            if (!providerIdValue && (service as any).provider) {
                                if (typeof (service as any).provider === 'object') {
                                    const providerObj = (service as any).provider;
                                    providerIdValue = providerObj._id || providerObj.id || '';
                                    providerEmail = providerObj.email || '';
                                    providerName = providerObj.name || providerObj.firstName || providerObj.businessName || providerEmail || 'Service Provider';
                                    providerAvatar = providerObj.avatar || '';
                                } else if (typeof (service as any).provider === 'string') {
                                    providerIdValue = (service as any).provider;
                                }
                            }

                            // Fallback to agentId if provider is not available
                            if (!providerIdValue && (service as any).agentId) {
                                if (typeof (service as any).agentId === 'object') {
                                    const agentObj = (service as any).agentId;
                                    providerIdValue = agentObj._id || agentObj.id || '';
                                    providerEmail = agentObj.email || '';
                                    providerName = agentObj.name || agentObj.firstName || providerEmail || 'Agent';
                                    providerAvatar = agentObj.avatar || '';
                                } else if (typeof (service as any).agentId === 'string') {
                                    providerIdValue = (service as any).agentId;
                                }
                            }

                            // Fallback to landlordId if still no provider
                            if (!providerIdValue && (service as any).landlordId) {
                                if (typeof (service as any).landlordId === 'object') {
                                    const landlordObj = (service as any).landlordId;
                                    providerIdValue = landlordObj._id || landlordObj.id || '';
                                    providerEmail = landlordObj.email || '';
                                    providerName = landlordObj.name || landlordObj.firstName || providerEmail || 'Service Provider';
                                    providerAvatar = landlordObj.avatar || '';
                                } else if (typeof (service as any).landlordId === 'string') {
                                    providerIdValue = (service as any).landlordId;
                                }
                            }

                            return (
                                <>
                                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Managed By</h2>
                                    <div className="w-full border border-gray-200 rounded-lg overflow-hidden">
                                        <button
                                            onClick={() => {
                                                if (providerIdValue) {
                                                    window.location.href = `/routes/profile-view/${providerIdValue}`;
                                                } else {
                                                    console.warn('No provider ID available');
                                                }
                                            }}
                                            disabled={!providerIdValue}
                                            className={`w-full flex items-start gap-3 p-4 transition-all text-left ${providerIdValue
                                                ? 'hover:border-purple-400 hover:bg-purple-50 cursor-pointer'
                                                : 'bg-gray-50 cursor-not-allowed opacity-75'
                                                }`}
                                        >
                                            {providerAvatar ? (
                                                <div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0 border-2 border-gray-200">
                                                    <img
                                                        src={providerAvatar}
                                                        alt={providerName}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-purple-500 to-purple-600 flex-shrink-0">
                                                    <div className="w-full h-full flex items-center justify-center text-lg font-bold text-white">
                                                        {providerName.charAt(0).toUpperCase()}
                                                    </div>
                                                </div>
                                            )}
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <p className="font-semibold text-gray-900 text-sm">
                                                        {providerName}
                                                    </p>
                                                    {service.verified && (
                                                        <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-medium">
                                                            Verified
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-gray-500 text-xs">
                                                    {providerIdValue ? 'Registered service provider on Finndex Africa' : 'Provider information not available'}
                                                </p>
                                                {providerEmail && (
                                                    <p className="text-gray-500 text-xs mt-1 flex items-center gap-1">
                                                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                            <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                                                            <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                                                        </svg>
                                                        {providerEmail}
                                                    </p>
                                                )}
                                                {providerIdValue && (
                                                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-600">
                                                        <span className="flex items-center gap-1">
                                                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                                                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                                                            </svg>
                                                            Identity Verified
                                                        </span>
                                                        <span className="flex items-center gap-1 text-purple-600 font-medium">
                                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                            </svg>
                                                            View Full Profile
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </button>
                                    </div>
                                </>
                            );
                        })()}
                    </section>

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
                        <ReviewsList
                            itemType="service"
                            itemId={serviceId}
                            itemTitle={service?.title}
                        />
                    </section>
                </div>

                {/* RIGHT SIDE */}
                <div className="min-h-screen">
                    <div className="max-w-sm mx-auto">
                        <aside>
                            <div className="sticky top-24">
                                {/* CONTACT CARD */}
                                <div className="bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden">
                                    {/* Price Section */}
                                    <div className="p-6 bg-linear-to-br from-blue-50 to-white">
                                        <div className="flex items-baseline gap-1.5">
                                            <div className="text-4xl font-bold text-gray-900">
                                                {service.price ? `$${service.price.toLocaleString()}` : 'Contact for Price'}
                                            </div>
                                            {service.price && service.priceUnit && (
                                                <span className="text-gray-500 text-base font-medium">
                                                    /{service.priceUnit}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="p-6 space-y-3 border-t border-gray-100">
                                        {service.status === 'active' ? (
                                            <button className="w-full group relative overflow-hidden h-12 text-sm font-semibold bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
                                                onClick={() => handleBookService()}
                                            >
                                                <Calendar className="w-4 h-4" />
                                                <span>{currentUser ? 'Request Service' : 'Sign in to Request'}</span>
                                                {!currentUser && <Lock className="w-3.5 h-3.5" />}
                                            </button>
                                        ) : (
                                            <div className="w-full h-12 flex items-center justify-center text-sm font-medium text-gray-500 bg-gray-100 rounded-lg border border-gray-200">
                                                Service Not Available
                                            </div>
                                        )}

                                        <button className="w-full h-12 text-sm font-semibold bg-white hover:bg-gray-50 text-gray-900 rounded-lg border-2 border-gray-300 hover:border-gray-400 transition-all duration-200 flex items-center justify-center gap-2 shadow-sm"
                                            onClick={() => handleBookService()}
                                        >
                                            <Mail className="w-4 h-4" />
                                            <span>{currentUser ? 'Contact Service Provider' : 'Sign in to Contact'}</span>
                                            {!currentUser && <Lock className="w-3.5 h-3.5" />}
                                        </button>
                                    </div>

                                    {/* Message Section - Only show if user is not the service provider */}
                                    {!currentUser ? (
                                        <div className="border-t border-gray-100 p-6 text-center bg-gray-50">
                                            <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                                                <MessageCircle className="w-7 h-7 text-gray-500" />
                                            </div>
                                            <p className="text-sm font-medium text-gray-900 mb-2">Message the Service Provider</p>
                                            <p className="text-xs text-gray-500 mb-4">Sign in to start a conversation</p>
                                            <button className="w-full h-10 text-sm font-semibold bg-gray-900 hover:bg-gray-800 text-white rounded-lg transition-colors shadow-sm">
                                                Sign In to Chat
                                            </button>
                                        </div>
                                    ) : currentUser ? (
                                        (() => {
                                            // Use providerId if available, otherwise fall back to provider, agentId or landlordId
                                            // Handle both populated objects (with _id) and direct string IDs
                                            let providerIdValue = '';

                                            // Check providerId first
                                            if (typeof (service as any).providerId === 'string') {
                                                providerIdValue = (service as any).providerId;
                                            } else if ((service as any).providerId && typeof (service as any).providerId === 'object' && (service as any).providerId._id) {
                                                providerIdValue = String((service as any).providerId._id);
                                            }

                                            // Fallback to provider
                                            if (!providerIdValue) {
                                                if (typeof (service as any).provider === 'string') {
                                                    providerIdValue = (service as any).provider;
                                                } else if ((service as any).provider && typeof (service as any).provider === 'object' && (service as any).provider._id) {
                                                    providerIdValue = String((service as any).provider._id);
                                                }
                                            }

                                            let agentIdValue = '';
                                            if (typeof (service as any).agentId === 'string') {
                                                agentIdValue = (service as any).agentId;
                                            } else if ((service as any).agentId && typeof (service as any).agentId === 'object' && (service as any).agentId._id) {
                                                agentIdValue = String((service as any).agentId._id);
                                            }

                                            let landlordIdValue = '';
                                            if (typeof (service as any).landlordId === 'string') {
                                                landlordIdValue = (service as any).landlordId;
                                            } else if ((service as any).landlordId && typeof (service as any).landlordId === 'object' && (service as any).landlordId._id) {
                                                landlordIdValue = String((service as any).landlordId._id);
                                            }

                                            const providerId = providerIdValue || agentIdValue || landlordIdValue;
                                            const isOwnService = providerId === currentUser.id;
                                            // Don't show chat if it's the user's own service
                                            if (isOwnService || !providerId) {
                                                return null;
                                            }

                                            return (
                                                <div className="border-t border-gray-100 p-5">
                                                    <div className="flex items-center gap-3 mb-4">
                                                        <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center">
                                                            <MessageCircle className="w-4.5 h-4.5 text-blue-600" />
                                                        </div>
                                                        <span className="text-sm font-semibold text-gray-900">
                                                            Message Provider
                                                        </span>
                                                    </div>
                                                    <ChatBox
                                                        userId={currentUser.id}
                                                        landlordId={providerId}
                                                        propertyId={serviceId}
                                                    />
                                                </div>
                                            );
                                        })()
                                    ) : null}
                                </div>

                                {/* Info Card */}
                                <div className="mt-4 bg-blue-50 border border-blue-200 rounded-xl p-4">
                                    <p className="text-xs text-blue-900 font-medium">
                                        💡 <span className="font-semibold">Tip:</span> Contact the service provider to discuss your requirements. Response time is usually within 24 hours.
                                    </p>
                                </div>
                            </div>
                        </aside>
                    </div>
                </div>
            </section>

            {/* Booking Modal */}
            {showBookingModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
                    <div className="bg-white rounded-xl sm:rounded-2xl max-w-lg w-full shadow-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
                        {/* Header with gradient */}
                        <div className="sticky top-0 bg-gradient-to-r from-green-600 to-teal-600 px-4 sm:px-6 py-4 sm:py-5 rounded-t-xl sm:rounded-t-2xl">
                            <div className="flex items-center justify-between">
                                <div className="flex-1 min-w-0 pr-2">
                                    <h3 className="text-lg sm:text-2xl font-bold text-white truncate">Book This Service</h3>
                                    <p className="text-xs sm:text-sm text-green-100 mt-1">Complete the form to request this service</p>
                                </div>
                                <button
                                    onClick={() => setShowBookingModal(false)}
                                    className="text-white/80 hover:text-white hover:bg-white/10 rounded-full p-2 transition-all ml-4"
                                    disabled={submitting}
                                    aria-label="Close modal"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {/* Form Content */}
                        <div className="p-4 sm:p-6 space-y-4 sm:space-y-5">
                            {/* Service Summary Card */}
                            <div className="bg-gradient-to-br from-gray-50 to-green-50 border border-green-100 rounded-xl p-3 sm:p-4">
                                <div className="flex items-start gap-2 sm:gap-3">
                                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-600 rounded-lg flex items-center justify-center shrink-0">
                                        <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-semibold text-gray-900 text-sm truncate">{service?.title}</h4>
                                        <p className="text-xs text-gray-600 mt-1 truncate">{service?.category.replace(/_/g, ' ')}</p>
                                        {service?.price && (
                                            <div className="flex items-center gap-2 mt-2">
                                                <span className="text-base sm:text-lg font-bold text-green-600">
                                                    ${service.price.toLocaleString()}
                                                </span>
                                                <span className="text-xs text-gray-500">
                                                    /{service.priceUnit || 'service'}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Form Fields */}
                            <div className="space-y-4">
                                {/* Service Date & Time */}
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-2">
                                        <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        Preferred Service Date & Time
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="datetime-local"
                                        value={bookingData.scheduledDate}
                                        onChange={(e) => setBookingData({ ...bookingData, scheduledDate: e.target.value })}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all hover:border-gray-300"
                                        min={new Date().toISOString().slice(0, 16)}
                                        required
                                    />
                                </div>

                                {/* Duration */}
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-2">
                                        <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        Estimated Duration (hours)
                                    </label>
                                    <select
                                        value={bookingData.duration}
                                        onChange={(e) => setBookingData({ ...bookingData, duration: e.target.value })}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all hover:border-gray-300 cursor-pointer"
                                    >
                                        <option value="1">1 hour</option>
                                        <option value="2">2 hours</option>
                                        <option value="3">3 hours</option>
                                        <option value="4">4 hours</option>
                                        <option value="6">6 hours</option>
                                        <option value="8">8 hours (Full day)</option>
                                    </select>
                                </div>

                                {/* Service Location */}
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-2">
                                        <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        Service Location / Address
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={bookingData.serviceLocation}
                                        onChange={(e) => setBookingData({ ...bookingData, serviceLocation: e.target.value })}
                                        placeholder="Enter complete address where service is needed"
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all hover:border-gray-300"
                                        required
                                    />
                                    <p className="text-xs text-gray-500 mt-1.5">Provide the exact location where the service will be performed</p>
                                </div>

                                {/* Contact Phone */}
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-2">
                                        <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                        </svg>
                                        Contact Phone
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="tel"
                                        value={bookingData.contactPhone}
                                        onChange={(e) => setBookingData({ ...bookingData, contactPhone: e.target.value })}
                                        placeholder="+231 886 149 219"
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all hover:border-gray-300"
                                        required
                                    />
                                    <p className="text-xs text-gray-500 mt-1.5">Service provider will call to confirm details</p>
                                </div>

                                {/* Additional Notes */}
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-2">
                                        <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                                        </svg>
                                        Additional Notes
                                        <span className="text-xs font-normal text-gray-500">(Optional)</span>
                                    </label>
                                    <textarea
                                        rows={4}
                                        value={bookingData.notes}
                                        onChange={(e) => setBookingData({ ...bookingData, notes: e.target.value })}
                                        placeholder="Describe your requirements, any special instructions, or questions..."
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all hover:border-gray-300 resize-none"
                                    />
                                </div>
                            </div>

                            {/* Info Alert */}
                            <div className="bg-green-50 border-l-4 border-green-500 rounded-lg p-4">
                                <div className="flex items-start gap-3">
                                    <svg className="w-5 h-5 text-green-600 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                    </svg>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-green-900">What happens next?</p>
                                        <p className="text-sm text-green-800 mt-1">
                                            The service provider will review your request and contact you within 12-24 hours to confirm availability and finalize the details.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer Actions */}
                        <div className="sticky bottom-0 bg-gray-50 px-4 sm:px-6 py-3 sm:py-4 rounded-b-xl sm:rounded-b-2xl border-t border-gray-200">
                            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                                <button
                                    className="w-full sm:flex-1 h-11 sm:h-12 text-sm font-semibold bg-white hover:bg-gray-100 text-gray-700 rounded-lg sm:rounded-xl border-2 border-gray-300 transition-all order-2 sm:order-1"
                                    onClick={() => setShowBookingModal(false)}
                                    disabled={submitting}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="w-full sm:flex-[2] h-11 sm:h-12 text-sm font-semibold bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white rounded-lg sm:rounded-xl shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 order-1 sm:order-2"
                                    onClick={handleSubmitBooking}
                                    disabled={submitting}
                                >
                                    {submitting ? (
                                        <>
                                            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            <span>Submitting...</span>
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            <span>Submit Service Request</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
