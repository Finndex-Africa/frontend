'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { usersApi } from '@/services/api/users.api';
import { serviceProvidersApi, ServiceProviderProfile } from '@/services/api/service-providers.api';
import { User } from '@/types/users';

export default function PublicProfileView() {
    const params = useParams();
    const router = useRouter();
    const userId = params?.id as string;

    const [user, setUser] = useState<User | null>(null);
    const [serviceProvider, setServiceProvider] = useState<ServiceProviderProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (userId) {
            fetchUserProfile();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userId]);

    const fetchUserProfile = async () => {
        try {
            setLoading(true);

            // Try to fetch the user profile
            const userResponse = await usersApi.getById(userId);
            if (userResponse.data) {
                setUser(userResponse.data);

                // If user is a service provider, fetch their provider profile
                if (userResponse.data.role === 'service_provider' || userResponse.data.userType === 'service_provider') {
                    try {
                        const providerResponse = await serviceProvidersApi.getByUserId(userId);
                        if (providerResponse.data) {
                            setServiceProvider(providerResponse.data);
                        }
                    } catch (err) {
                        console.error('Failed to fetch service provider profile:', err);
                    }
                }
            }
            setError(null);
        } catch (err: any) {
            console.error('Failed to fetch user profile:', err);
            setError('Failed to load profile. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const getVerificationBadge = () => {
        if (!user) return null;

        if (user.verified) {
            return (
                <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 text-xs px-2.5 py-1 rounded-full font-medium">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                    </svg>
                    Verified
                </span>
            );
        }

        return (
            <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-600 text-xs px-2.5 py-1 rounded-full font-medium">
                Not Verified
            </span>
        );
    };

    const getRoleBadge = () => {
        if (!user) return null;

        const roleConfig: Record<string, { label: string; bg: string; text: string }> = {
            landlord: { label: 'Landlord', bg: 'bg-blue-100', text: 'text-blue-700' },
            provider: { label: 'Service Provider', bg: 'bg-purple-100', text: 'text-purple-700' },
            service_provider: { label: 'Service Provider', bg: 'bg-purple-100', text: 'text-purple-700' },
            agent: { label: 'Agent', bg: 'bg-amber-100', text: 'text-amber-700' },
            seeker: { label: 'Seeker', bg: 'bg-gray-100', text: 'text-gray-700' },
        };

        const role = user.role || user.userType || 'seeker';
        const config = roleConfig[role] || roleConfig.seeker;

        return (
            <span className={`inline-flex items-center ${config.bg} ${config.text} text-xs px-2.5 py-1 rounded-full font-medium`}>
                {config.label}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error || !user) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center max-w-md w-full">
                    <p className="text-red-600 mb-4">{error || 'Profile not found'}</p>
                    <button
                        onClick={() => router.back()}
                        className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6">
                {/* Back Button */}
                <button
                    onClick={() => router.back()}
                    className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back
                </button>

                {/* Profile Header */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    {/* Cover Section */}
                    <div className="h-32 bg-linear-to-r from-blue-600 to-purple-600"></div>

                    {/* Profile Info */}
                    <div className="px-6 pb-6">
                        {/* Avatar */}
                        <div className="flex items-start gap-6 -mt-16 mb-6">
                            <div className="relative">
                                <div className="w-32 h-32 rounded-full overflow-hidden bg-white border-4 border-white shadow-lg">
                                    {user.avatar ? (
                                        <img
                                            src={user.avatar}
                                            alt={`${user.firstName} ${user.lastName}`}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                            <span className="text-4xl font-bold text-white">
                                                {user.firstName?.charAt(0).toUpperCase() || 'U'}
                                            </span>
                                        </div>
                                    )}
                                </div>
                                {user.verified && (
                                    <div className="absolute bottom-2 right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center border-2 border-white">
                                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                                        </svg>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Name and Badges */}
                        <div className="space-y-3">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">
                                    {user.firstName} {user.lastName}
                                </h1>
                                {user.email && (
                                    <p className="text-gray-600 mt-1">{user.email}</p>
                                )}
                            </div>

                            <div className="flex flex-wrap gap-2">
                                {getRoleBadge()}
                                {getVerificationBadge()}
                            </div>

                            {user.phone && (
                                <div className="flex items-center gap-2 text-gray-600">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                    {user.phone}
                                </div>
                            )}

                            {user.createdAt && (
                                <div className="flex items-center gap-2 text-gray-500 text-sm">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    Member since {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Service Provider Details */}
                {serviceProvider && (
                    <div className="mt-6 bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-6">Business Information</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Business Name */}
                            <div>
                                <label className="text-sm font-semibold text-gray-700">Business Name</label>
                                <p className="mt-1 text-gray-900">{serviceProvider.businessName}</p>
                            </div>

                            {/* Location */}
                            <div>
                                <label className="text-sm font-semibold text-gray-700">Location</label>
                                <p className="mt-1 text-gray-900">{serviceProvider.location}</p>
                            </div>

                            {/* Experience */}
                            <div>
                                <label className="text-sm font-semibold text-gray-700">Years of Experience</label>
                                <p className="mt-1 text-gray-900">{serviceProvider.experience} years</p>
                            </div>

                            {/* Verification Status */}
                            <div>
                                <label className="text-sm font-semibold text-gray-700">Verification Status</label>
                                <div className="mt-1">
                                    {serviceProvider.verified ? (
                                        <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 text-sm px-3 py-1 rounded-full font-medium">
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                                            </svg>
                                            Verified Business
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-700 text-sm px-3 py-1 rounded-full font-medium">
                                            Pending Verification
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Rating */}
                            {serviceProvider.rating > 0 && (
                                <div>
                                    <label className="text-sm font-semibold text-gray-700">Rating</label>
                                    <div className="mt-1 flex items-center gap-2">
                                        <div className="flex items-center gap-1">
                                            <svg className="w-5 h-5 text-amber-400 fill-current" viewBox="0 0 24 24">
                                                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                                            </svg>
                                            <span className="text-gray-900 font-semibold">{serviceProvider.rating.toFixed(1)}</span>
                                        </div>
                                        <span className="text-sm text-gray-500">out of 5.0</span>
                                    </div>
                                </div>
                            )}

                            {/* Completed Jobs */}
                            <div>
                                <label className="text-sm font-semibold text-gray-700">Completed Jobs</label>
                                <p className="mt-1 text-gray-900">{serviceProvider.completedJobs} jobs</p>
                            </div>

                            {/* Service Types - Full Width */}
                            <div className="md:col-span-2">
                                <label className="text-sm font-semibold text-gray-700">Services Offered</label>
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {serviceProvider.serviceTypes.map((type) => (
                                        <span
                                            key={type}
                                            className="inline-flex items-center bg-purple-100 text-purple-700 text-sm px-3 py-1 rounded-full font-medium"
                                        >
                                            {type.replace(/_/g, ' ')}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Description - Full Width */}
                            <div className="md:col-span-2">
                                <label className="text-sm font-semibold text-gray-700">About the Business</label>
                                <p className="mt-2 text-gray-600 leading-relaxed">{serviceProvider.description}</p>
                            </div>

                            {/* Contact Information */}
                            <div className="md:col-span-2 pt-4 border-t border-gray-200">
                                <label className="text-sm font-semibold text-gray-700 mb-3 block">Contact Information</label>
                                <div className="flex flex-wrap gap-4">
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                        </svg>
                                        <span>{serviceProvider.phone}</span>
                                    </div>
                                    {serviceProvider.whatsapp && (
                                        <div className="flex items-center gap-2 text-gray-600">
                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                                            </svg>
                                            <span>{serviceProvider.whatsapp}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Additional Info for Landlords/Agents */}
                {!serviceProvider && (user.role === 'landlord' || user.userType === 'landlord') && (
                    <div className="mt-6 bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                        <div className="text-center py-8">
                            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Registered Landlord</h3>
                            <p className="text-gray-600">This user is a verified landlord on Finndex Africa</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
