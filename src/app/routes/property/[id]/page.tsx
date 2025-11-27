'use client';

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import toast, { Toaster } from 'react-hot-toast';
import MediaCarousel from "@/components/domain/MediaCarousel";
import Button from "@/components/ui/Button";
import ChatBox from "@/components/dashboard/ChatBox";
import { propertiesApi } from "@/services/api";
import { Property as ApiProperty } from "@/types/dashboard";
import { apiClient } from "@/lib/api-client";

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
        rentalPeriod: '6',
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
                toast.success('Booking request submitted successfully! The landlord will contact you soon.');
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

            alert('Message sent successfully! The landlord will respond to you soon.');
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
                                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                                            </svg>
                                            Identity Verified
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </section>
                    )}
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

                                {/* Show availability status */}
                                {property.status !== 'approved' && (
                                    <div className="mb-3 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg">
                                        <p className="text-xs font-medium text-amber-800">
                                            {property.status === 'pending' && '⏳ Pending Approval'}
                                            {property.status === 'rejected' && '❌ Not Available'}
                                            {property.status === 'rented' && '🏠 Currently Rented'}
                                            {property.status === 'archived' && '📦 Archived'}
                                        </p>
                                    </div>
                                )}

                                <div className="space-y-2">
                                    {/* Only show Book Now if property is approved */}
                                    {property.status === 'approved' ? (
                                        <Button
                                            className="w-full h-11 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm"
                                            onClick={handleRequestViewing}
                                            disabled={submitting}
                                        >
                                            {currentUser ? '📅 Book Now' : '🔒 Sign in to Book'}
                                        </Button>
                                    ) : (
                                        <div className="w-full h-11 flex items-center justify-center text-sm font-medium text-gray-500 bg-gray-100 rounded-lg border border-gray-200">
                                            Booking Not Available
                                        </div>
                                    )}

                                    <Button
                                        className="w-full h-11 text-sm font-semibold bg-white hover:bg-gray-50 text-gray-900 rounded-lg border-2 border-gray-200"
                                        onClick={handleContactLandlord}
                                        disabled={submitting}
                                    >
                                        {currentUser ? '✉️ Contact Landlord' : '🔒 Sign in to Contact'}
                                    </Button>
                                </div>
                            </div>

                            {/* Message Thread Section */}
                            {currentUser ? (
                                <div className="pt-5">
                                    <ChatBox
                                        userId={currentUser.id}
                                        landlordId={property.landlordId}
                                        propertyId={property._id}
                                    />
                                </div>
                            ) : (
                                <div className="pt-5 text-center">
                                    <p className="text-sm text-gray-600 mb-3">Sign in to message the landlord</p>
                                    <Button
                                        className="w-full h-9 text-sm font-semibold bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-lg"
                                        onClick={() => window.location.href = '/routes/login'}
                                    >
                                        Sign In
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </aside>
            </section>

            {/* Booking Modal */}
            {showBookingModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900">Book This Property</h3>
                                <p className="text-sm text-gray-600 mt-1">Submit your booking request</p>
                            </div>
                            <button
                                onClick={() => setShowBookingModal(false)}
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
                                    📅 Preferred Move-in Date *
                                </label>
                                <input
                                    type="date"
                                    value={bookingData.moveInDate}
                                    onChange={(e) => setBookingData({...bookingData, moveInDate: e.target.value})}
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                    min={new Date().toISOString().split('T')[0]}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    ⏱️ Desired Rental Period
                                </label>
                                <select
                                    value={bookingData.rentalPeriod}
                                    onChange={(e) => setBookingData({...bookingData, rentalPeriod: e.target.value})}
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                >
                                    <option value="1">1 month</option>
                                    <option value="3">3 months</option>
                                    <option value="6">6 months</option>
                                    <option value="12">12 months (1 year)</option>
                                    <option value="24">24 months (2 years)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    📱 Contact Phone *
                                </label>
                                <input
                                    type="tel"
                                    value={bookingData.contactPhone}
                                    onChange={(e) => setBookingData({...bookingData, contactPhone: e.target.value})}
                                    placeholder="+231 886 149 219"
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    💭 Additional Message (Optional)
                                </label>
                                <textarea
                                    rows={4}
                                    value={bookingData.message}
                                    onChange={(e) => setBookingData({...bookingData, message: e.target.value})}
                                    placeholder="Any questions or special requests..."
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
                                />
                            </div>
                            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mt-4">
                                <p className="text-sm text-blue-900">
                                    💡 <span className="font-semibold">Note:</span> The landlord will receive your booking request and contact you to confirm the details.
                                </p>
                            </div>
                            <div className="flex gap-3 pt-4">
                                <Button
                                    className="flex-1 h-12 text-sm font-semibold bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-xl transition-all"
                                    onClick={() => setShowBookingModal(false)}
                                    disabled={submitting}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    className="flex-1 h-12 text-sm font-semibold bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl shadow-lg transition-all disabled:opacity-50"
                                    onClick={handleSubmitBooking}
                                    disabled={submitting}
                                >
                                    {submitting ? 'Submitting...' : 'Submit Booking 📨'}
                                </Button>
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
                                <h3 className="text-2xl font-bold text-gray-900">Contact Landlord</h3>
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
                                    ✅ <span className="font-semibold">Quick Response:</span> Most landlords respond within 24 hours
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
