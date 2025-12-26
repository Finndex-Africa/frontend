'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { servicesApi } from '@/services/api';
import { Service as ApiService } from '@/types/dashboard';
import Image from 'next/image';

export default function MyServicesPage() {
    const [services, setServices] = useState<ApiService[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        fetchMyServices();
    }, []);

    const fetchMyServices = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await servicesApi.getMyServices();
            const servicesData = Array.isArray(response.data) ? response.data : [];
            setServices(servicesData);
        } catch (error: any) {
            console.error('Error fetching my services:', error);
            if (error.response?.status === 401 || error.response?.status === 403) {
                setError('Please log in as a service provider to view your services.');
            } else {
                setError('Failed to load your services. Please try again later.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleServiceClick = (serviceId: string) => {
        router.push(`/routes/service/${serviceId}`);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active':
                return 'bg-green-100 text-green-700';
            case 'pending':
                return 'bg-yellow-100 text-yellow-700';
            case 'inactive':
                return 'bg-gray-100 text-gray-700';
            case 'rejected':
                return 'bg-red-100 text-red-700';
            default:
                return 'bg-gray-100 text-gray-700';
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="bg-white rounded-lg shadow-sm p-8 border border-gray-200">
                        <div className="text-center">
                            <svg className="w-16 h-16 mx-auto text-red-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Services</h2>
                            <p className="text-gray-600 mb-6">{error}</p>
                            <button
                                onClick={() => router.push('/routes/login')}
                                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Go to Login
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">My Services</h1>
                            <p className="text-gray-600 mt-2">Manage and track your service listings</p>
                        </div>
                        <button
                            onClick={() => router.push('/routes/dashboard')}
                            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
                        >
                            Create New Service
                        </button>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-white p-4 rounded-lg border border-gray-200">
                            <p className="text-sm text-gray-600">Total Services</p>
                            <p className="text-2xl font-bold text-gray-900">{services.length}</p>
                        </div>
                        <div className="bg-white p-4 rounded-lg border border-gray-200">
                            <p className="text-sm text-gray-600">Active</p>
                            <p className="text-2xl font-bold text-green-600">
                                {services.filter(s => s.status === 'active').length}
                            </p>
                        </div>
                        <div className="bg-white p-4 rounded-lg border border-gray-200">
                            <p className="text-sm text-gray-600">Pending</p>
                            <p className="text-2xl font-bold text-yellow-600">
                                {services.filter(s => s.status === 'pending').length}
                            </p>
                        </div>
                        <div className="bg-white p-4 rounded-lg border border-gray-200">
                            <p className="text-sm text-gray-600">Total Views</p>
                            <p className="text-2xl font-bold text-blue-600">
                                {services.reduce((sum, s) => sum + (s.views || 0), 0)}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Services List */}
                {services.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-sm p-12 text-center border border-gray-200">
                        <svg className="w-20 h-20 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Services Yet</h3>
                        <p className="text-gray-600 mb-6">
                            You haven&apos;t created any services yet. Start by creating your first service listing.
                        </p>
                        <button
                            onClick={() => router.push('/routes/dashboard')}
                            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                        >
                            Create Your First Service
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {services.map((service) => (
                            <div
                                key={service._id}
                                className="bg-white rounded-lg border border-gray-200 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer overflow-hidden"
                                onClick={() => handleServiceClick(service._id)}
                            >
                                <div className="flex flex-col md:flex-row">
                                    {/* Image */}
                                    <div className="relative w-full md:w-64 h-48 md:h-auto shrink-0">
                                        {service.images && service.images.length > 0 ? (
                                            <Image
                                                src={service.images[0]}
                                                alt={service.title}
                                                fill
                                                className="object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                                                <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                </svg>
                                            </div>
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 p-6">
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex-1">
                                                <h3 className="text-xl font-semibold text-gray-900 mb-1">
                                                    {service.title}
                                                </h3>
                                                <p className="text-sm text-gray-600 flex items-center gap-1">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    </svg>
                                                    {service.location}
                                                </p>
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(service.status)}`}>
                                                {service.status.charAt(0).toUpperCase() + service.status.slice(1)}
                                            </span>
                                        </div>

                                        <p className="text-gray-700 mb-4 line-clamp-2">
                                            {service.description}
                                        </p>

                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-6 text-sm text-gray-600">
                                                <span className="flex items-center gap-1">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                    </svg>
                                                    {service.views || 0} views
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <svg className="w-4 h-4 text-yellow-500 fill-current" viewBox="0 0 20 20">
                                                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                                                    </svg>
                                                    {service.rating ? service.rating.toFixed(1) : '0.0'}
                                                </span>
                                                <span className="text-gray-400">|</span>
                                                <span className="capitalize">
                                                    {service.category.replace(/_/g, ' ')}
                                                </span>
                                            </div>

                                            <div className="text-right">
                                                <p className="text-2xl font-bold text-gray-900">
                                                    {formatCurrency(service.price)}
                                                </p>
                                                <p className="text-xs text-gray-600">
                                                    {service.priceUnit || 'per service'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
