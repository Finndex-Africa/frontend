'use client';

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import toast, { Toaster } from 'react-hot-toast';
import MediaCarousel from "@/components/domain/MediaCarousel";
import Button from "@/components/ui/Button";
import { MessageCircle, Calendar, Mail, Lock } from 'lucide-react';
import { propertiesApi } from "@/services/api";
import { Property as ApiProperty } from "@/types/dashboard";
import { apiClient } from "@/lib/api-client";
import ChatBox from "@/components/dashboard/ChatBox";
import ReviewsList from "@/components/reviews/ReviewsList";

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
    const [currentUser, setCurrentUser] = useState<{ id: string; firstName?: string; email?: string; phone?: string } | null>(null);
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [showContactModal, setShowContactModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [bookingData, setBookingData] = useState({
        moveInDate: '',
        rentalPeriod: '',
        contactPhone: '',
        message: ''
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

    const handleRequestViewing = () => {
        if (!currentUser) {
            window.location.href = '/routes/login';
            return;
        }
        setShowBookingModal(true);
    };

    const handleContactLandlord = () => {
        if (!currentUser) {
            window.location.href = '/routes/login';
            return;
        }
        setShowContactModal(true);
    };

    const handleSubmitBooking = async () => {
        if (!currentUser || !property || submitting) return;

        // Validate required fields
        if (!bookingData.contactPhone.trim()) {
            toast.error('Please provide your contact phone number');
            return;
        }

        if (!bookingData.moveInDate) {
            toast.error('Please select your preferred move-in date');
            return;
        }

        // Validate date is in the future
        const moveInDate = new Date(bookingData.moveInDate);
        if (moveInDate <= new Date()) {
            toast.error('Move-in date must be in the future');
            return;
        }

        try {
            setSubmitting(true);

            const bookingPayload = {
                serviceId: property._id,
                scheduledDate: new Date(bookingData.moveInDate).toISOString(),
                duration: parseInt(bookingData.rentalPeriod),
                contactPhone: bookingData.contactPhone,
                notes: bookingData.message || `Property rental booking for ${property.title}. Rental period: ${bookingData.rentalPeriod} months.`,
                serviceLocation: property.location,
                serviceAddress: property.location,
                paymentMethod: 'pending'
            };

            console.log('Submitting booking:', bookingPayload);
            const response = await apiClient.post('/bookings', bookingPayload);
            console.log('Booking response:', response);

            if (response.success) {
                const posterType = property.agentId ? 'agent' : 'landlord';
                toast.success(`Booking request submitted successfully! The ${posterType} will contact you soon.`);
                setShowBookingModal(false);
                setBookingData({
                    moveInDate: '',
                    rentalPeriod: '6',
                    contactPhone: currentUser.phone || '',
                    message: ''
                });
            } else {
                throw new Error(response.message || 'Failed to create booking');
            }
        } catch (error: any) {
            console.error('Booking error:', error);
            console.error('Error response:', error?.response?.data);

            // Provide user-friendly error messages
            let errorMessage = 'Failed to submit booking. Please try again.';

            if (error?.response?.data?.message) {
                errorMessage = error.response.data.message;

                // Specific error handling based on backend messages
                if (errorMessage.includes('not available for booking')) {
                    errorMessage = 'This property is not available for booking at this time.';
                } else if (errorMessage.includes('scheduled date') || errorMessage.includes('must be in the future')) {
                    errorMessage = 'Please select a valid move-in date in the future.';
                } else if (errorMessage.includes('Unauthorized') || errorMessage.includes('401')) {
                    errorMessage = 'Your session has expired. Please sign in again.';
                } else if (error?.response?.status === 404) {
                    errorMessage = 'Booking service is temporarily unavailable. Please try again or contact support.';
                }
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
    const statusConfig = {
        pending: { icon: '⏳', text: 'Pending Approval', bg: 'bg-amber-50', border: 'border-amber-200', text_color: 'text-amber-800' },
        rejected: { icon: '❌', text: 'Not Available', bg: 'bg-red-50', border: 'border-red-200', text_color: 'text-red-800' },
        rented: { icon: '🏠', text: 'Currently Rented', bg: 'bg-gray-50', border: 'border-gray-200', text_color: 'text-gray-800' },
        archived: { icon: '📦', text: 'Archived', bg: 'bg-gray-50', border: 'border-gray-200', text_color: 'text-gray-800' },
        suspended: { icon: '⛔', text: 'Temporarily Unavailable', bg: 'bg-orange-50', border: 'border-orange-200', text_color: 'text-orange-800' }
    };
    const handleSendMessage = async (subject: string, message: string) => {
        if (!currentUser || !property || submitting) return;

        try {
            setSubmitting(true);

            const messageData = {
                receiverId: property.landlordId,
                propertyId: property._id,
                subject: subject || `Inquiry about ${property.title}`,
                message: `${message}\n\nFrom: ${currentUser.firstName || 'User'}${currentUser.email ? ` (${currentUser.email})` : ''}`,
            };

            await apiClient.post('/messages/threads', messageData);

            const posterType = property.agentId ? 'agent' : 'landlord';
            alert(`Message sent successfully! The ${posterType} will respond to you soon.`);
            setShowContactModal(false);
        } catch (error: any) {
            console.error('Failed to send message:', error);
            const errorMessage = error?.response?.data?.message || 'Failed to send message. Please try again.';
            alert(errorMessage);
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
    if (property.area) features.push({ label: "Distance", desc: `${property.area} min from main road`, icon: "🚗" });
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
                            {(() => {
                                // Extract owner/agent info
                                let ownerIdValue = '';
                                let ownerName = 'Property Owner';
                                let ownerInitial = 'L';
                                let ownerEmail = '';

                                if (typeof property.landlordId === 'object' && property.landlordId) {
                                    const ownerObj = property.landlordId as any;
                                    ownerIdValue = ownerObj._id || ownerObj.id || '';
                                    ownerEmail = ownerObj.email || '';
                                    ownerName = ownerObj.name || ownerObj.firstName || ownerObj.businessName || ownerEmail || 'Property Owner';
                                    ownerInitial = ownerName.charAt(0).toUpperCase();
                                } else if (typeof property.landlordId === 'string') {
                                    ownerIdValue = property.landlordId;
                                }

                                // Fallback to agentId if landlordId doesn't have data
                                if (!ownerIdValue && property.agentId) {
                                    if (typeof property.agentId === 'object') {
                                        const agentObj = property.agentId as any;
                                        ownerIdValue = agentObj._id || agentObj.id || '';
                                        ownerEmail = agentObj.email || '';
                                        ownerName = agentObj.name || agentObj.firstName || ownerEmail || 'Agent';
                                        ownerInitial = ownerName.charAt(0).toUpperCase();
                                    } else if (typeof property.agentId === 'string') {
                                        ownerIdValue = property.agentId;
                                    }
                                }

                                return (
                                    <>
                                        <h2 className="text-lg font-semibold text-gray-900 mb-4">{ownerName}</h2>
                                        <button
                                            onClick={() => {
                                                const landlordIdValue = typeof property.landlordId === 'string'
                                                    ? property.landlordId
                                                    : (property.landlordId as any)?._id;
                                                if (landlordIdValue) {
                                                    window.location.href = `/routes/profile-view/${landlordIdValue}`;
                                                }
                                            }}
                                            className="w-full flex items-start gap-3 border border-gray-200 p-4 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all cursor-pointer text-left"
                                        >
                                            <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-blue-600 flex-shrink-0">
                                                <div className="w-full h-full flex items-center justify-center text-lg font-bold text-white">
                                                    {ownerInitial}
                                                </div>
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <p className="font-semibold text-gray-900 text-sm">
                                                        {ownerName}
                                                    </p>
                                                    <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-medium">
                                                        Verified
                                                    </span>
                                                </div>
                                                <p className="text-gray-500 text-xs">
                                                    Registered {property.agentId ? 'agent' : 'landlord'} on Finndex Africa
                                                </p>
                                                <div className="flex items-center gap-3 mt-2 text-xs text-gray-600">
                                                    <span className="flex items-center gap-1">
                                                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                                                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                                                        </svg>
                                                        Identity Verified
                                                    </span>
                                                    <span className="flex items-center gap-1 text-blue-600 font-medium">
                                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                        </svg>
                                                        View Profile
                                                    </span>
                                                </div>
                                            </div>
                                        </button>
                                    </>
                                );
                            })()}
                        </section>
                    )}

                    <section>
                        <ReviewsList
                            itemType="property"
                            itemId={propertyId}
                            itemTitle={property?.title}
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
                                    <div className="p-6 bg-gradient-to-br from-blue-50 to-white">
                                        {property.isPremium && (
                                            <div className="mb-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-400 to-amber-500 text-white rounded-full text-xs font-bold shadow-sm">
                                                <span>⭐</span>
                                                <span>Premium Listing</span>
                                            </div>
                                        )}

                                        <div className="flex items-baseline gap-1.5">
                                            <div className="text-4xl font-bold text-gray-900">
                                                ${property.price ? property.price.toLocaleString() : 'Contact'}
                                            </div>
                                            {property.price && (
                                                <span className="text-gray-500 text-base font-medium">/month</span>
                                            )}
                                        </div>

                                        {/* Status Badge */}
                                        {property.status !== 'approved' && statusConfig[property.status] && (
                                            <div className={`mt-4 px-3 py-2.5 ${statusConfig[property.status].bg} border ${statusConfig[property.status].border} rounded-lg`}>
                                                <p className={`text-xs font-semibold ${statusConfig[property.status].text_color} flex items-center gap-2`}>
                                                    <span className="text-base">{statusConfig[property.status].icon}</span>
                                                    {statusConfig[property.status].text}
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="p-6 space-y-3 border-t border-gray-100">
                                        {property.status === 'approved' ? (
                                            <button className="w-full group relative overflow-hidden h-12 text-sm font-semibold bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
                                                onClick={() => handleRequestViewing()}
                                            >
                                                <Calendar className="w-4 h-4" />
                                                <span>{currentUser ? 'Book Viewing Now' : 'Sign in to Book'}</span>
                                                {!currentUser && <Lock className="w-3.5 h-3.5" />}
                                            </button>
                                        ) : (
                                            <div className="w-full h-12 flex items-center justify-center text-sm font-medium text-gray-500 bg-gray-100 rounded-lg border border-gray-200">
                                                Booking Not Available
                                            </div>
                                        )}

                                        <button className="w-full h-12 text-sm font-semibold bg-white hover:bg-gray-50 text-gray-900 rounded-lg border-2 border-gray-300 hover:border-gray-400 transition-all duration-200 flex items-center justify-center gap-2 shadow-sm"
                                            onClick={() => handleContactLandlord()}
                                        >
                                            <Mail className="w-4 h-4" />
                                            <span>
                                                {currentUser
                                                    ? (property.agentId ? 'Contact Agent' : 'Contact Landlord')
                                                    : 'Sign in to Contact'}
                                            </span>
                                            {!currentUser && <Lock className="w-3.5 h-3.5" />}
                                        </button>
                                    </div>

                                    {/* Message Section - Only show if user is not the landlord */}
                                    {!currentUser ? (
                                        <div className="border-t border-gray-100 p-6 text-center bg-gray-50">
                                            <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                                                <MessageCircle className="w-7 h-7 text-gray-500" />
                                            </div>
                                            <p className="text-sm font-medium text-gray-900 mb-2">
                                                Message the {property.agentId ? 'Agent' : 'Landlord'}
                                            </p>
                                            <p className="text-xs text-gray-500 mb-4">Sign in to start a conversation</p>
                                            <button className="w-full h-10 text-sm font-semibold bg-gray-900 hover:bg-gray-800 text-white rounded-lg transition-colors shadow-sm">
                                                Sign In to Chat
                                            </button>
                                        </div>
                                    ) : currentUser ? (
                                        (() => {
                                            // Use landlordId if available, otherwise fall back to agentId
                                            // Handle both populated objects (with _id) and direct string IDs
                                            let landlordIdValue = '';
                                            if (typeof property.landlordId === 'string') {
                                                landlordIdValue = property.landlordId;
                                            } else if (property.landlordId && typeof property.landlordId === 'object' && (property.landlordId as any)._id) {
                                                landlordIdValue = String((property.landlordId as any)._id);
                                            }

                                            let agentIdValue = '';
                                            if (typeof property.agentId === 'string') {
                                                agentIdValue = property.agentId;
                                            } else if (property.agentId && typeof property.agentId === 'object' && (property.agentId as any)._id) {
                                                agentIdValue = String((property.agentId as any)._id);
                                            }

                                            const landlordId = landlordIdValue || agentIdValue;
                                            const isOwnProperty = landlordId === currentUser.id;
                                            // Don't show chat if it's the user's own property
                                            if (isOwnProperty || !landlordId) {
                                                return null;
                                            }

                                            return (
                                                <div className="border-t border-gray-100 p-5">
                                                    <div className="flex items-center gap-3 mb-4">
                                                        <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center">
                                                            <MessageCircle className="w-4.5 h-4.5 text-blue-600" />
                                                        </div>
                                                        <span className="text-sm font-semibold text-gray-900">
                                                            Message {property.agentId ? 'Agent' : 'Landlord'}
                                                        </span>
                                                    </div>
                                                    <ChatBox
                                                        userId={currentUser.id}
                                                        landlordId={landlordId}
                                                        propertyId={propertyId}
                                                    />
                                                </div>
                                            );
                                        })()
                                    ) : null}
                                </div>

                                {/* Info Card */}
                                <div className="mt-4 bg-blue-50 border border-blue-200 rounded-xl p-4">
                                    <p className="text-xs text-blue-900 font-medium">
                                        💡 <span className="font-semibold">Tip:</span> Book a viewing to see this property in person. Response time is usually within 24 hours.
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
                        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 px-4 sm:px-6 py-4 sm:py-5 rounded-t-xl sm:rounded-t-2xl">
                            <div className="flex items-center justify-between">
                                <div className="flex-1 min-w-0 pr-2">
                                    <h3 className="text-lg sm:text-2xl font-bold text-white truncate">Book This Property</h3>
                                    <p className="text-xs sm:text-sm text-blue-100 mt-1">Complete the form to submit your request</p>
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
                            {/* Property Summary Card */}
                            <div className="bg-gradient-to-br from-gray-50 to-blue-50 border border-blue-100 rounded-xl p-3 sm:p-4">
                                <div className="flex items-start gap-2 sm:gap-3">
                                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-600 rounded-lg flex items-center justify-center shrink-0">
                                        <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                        </svg>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-semibold text-gray-900 text-sm truncate">{property?.title}</h4>
                                        <p className="text-xs text-gray-600 mt-1 truncate">{property?.location}</p>
                                        <div className="flex items-center gap-2 mt-2">
                                            <span className="text-base sm:text-lg font-bold text-blue-600">
                                                ${property?.price?.toLocaleString()}
                                            </span>
                                            <span className="text-xs text-gray-500">/{property?.priceUnit || 'month'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Form Fields */}
                            <div className="space-y-4">
                                {/* Move-in Date */}
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-2">
                                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        Preferred Move-in Date
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        value={bookingData.moveInDate}
                                        onChange={(e) => setBookingData({ ...bookingData, moveInDate: e.target.value })}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-gray-300"
                                        min={new Date().toISOString().split('T')[0]}
                                        required
                                    />
                                </div>

                                {/* Rental Period */}
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-2">
                                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        Desired Rental Period
                                    </label>
                                    <select
                                        value={bookingData.rentalPeriod}
                                        onChange={(e) => setBookingData({ ...bookingData, rentalPeriod: e.target.value })}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-gray-300 cursor-pointer"
                                    >
                                        <option value="1">1 month</option>
                                        <option value="3">3 months</option>
                                        <option value="6">6 months</option>
                                        <option value="12">12 months (1 year)</option>
                                        <option value="24">24 months (2 years)</option>
                                    </select>
                                </div>

                                {/* Contact Phone */}
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-2">
                                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-gray-300"
                                        required
                                    />
                                    <p className="text-xs text-gray-500 mt-1.5">We&apos;ll use this number to confirm your booking</p>
                                </div>

                                {/* Additional Message */}
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-2">
                                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                                        </svg>
                                        Additional Message
                                        <span className="text-xs font-normal text-gray-500">(Optional)</span>
                                    </label>
                                    <textarea
                                        rows={4}
                                        value={bookingData.message}
                                        onChange={(e) => setBookingData({ ...bookingData, message: e.target.value })}
                                        placeholder="Share any questions, special requests, or additional information..."
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-gray-300 resize-none"
                                    />
                                </div>
                            </div>

                            {/* Info Alert */}
                            <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-4">
                                <div className="flex items-start gap-3">
                                    <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                    </svg>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-blue-900">What happens next?</p>
                                        <p className="text-sm text-blue-800 mt-1">
                                            The property owner will receive your request and contact you within 24-48 hours to confirm the viewing details.
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
                                    className="w-full sm:flex-[2] h-11 sm:h-12 text-sm font-semibold bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg sm:rounded-xl shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 order-1 sm:order-2"
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
                                            <span>Submit Booking Request</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Contact Modal */}
            {showContactModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900">
                                    Contact {property.agentId ? 'Agent' : 'Landlord'}
                                </h3>
                                <p className="text-sm text-gray-600 mt-1">Send a direct message</p>
                            </div>
                            <button
                                onClick={() => setShowContactModal(false)}
                                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-1 transition-colors"
                                disabled={submitting}
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    📋 Subject
                                </label>
                                <input
                                    type="text"
                                    id="contact-subject"
                                    placeholder="e.g., Questions about the property"
                                    defaultValue={`Inquiry about ${property?.title || 'your property'}`}
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    💬 Your Message
                                </label>
                                <textarea
                                    id="contact-message"
                                    rows={6}
                                    placeholder="Ask about availability, amenities, or request more information..."
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
                                />
                            </div>
                            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                                <p className="text-sm text-green-900">
                                    ✅ <span className="font-semibold">Quick Response:</span> Most {property.agentId ? 'agents' : 'landlords'} respond within 24 hours
                                </p>
                            </div>
                            <div className="flex gap-3 pt-4">
                                <Button
                                    className="flex-1 h-12 text-sm font-semibold bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-xl transition-all"
                                    onClick={() => setShowContactModal(false)}
                                    disabled={submitting}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    className="flex-1 h-12 text-sm font-semibold bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-xl shadow-lg transition-all disabled:opacity-50"
                                    onClick={() => {
                                        const subject = (document.getElementById('contact-subject') as HTMLInputElement)?.value || '';
                                        const message = (document.getElementById('contact-message') as HTMLTextAreaElement)?.value || '';
                                        if (message.trim()) {
                                            handleSendMessage(subject, message);
                                        } else {
                                            alert('Please enter a message before sending.');
                                        }
                                    }}
                                    disabled={submitting}
                                >
                                    {submitting ? 'Sending...' : 'Send Message ✉️'}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
