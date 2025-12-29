'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { servicesApi } from '@/services/api';
import { mediaApi } from '@/services/api/media.api';
import { Service as ApiService } from '@/types/dashboard';
import Image from 'next/image';
import { ServiceForm } from '@/components/dashboard/ServiceForm';
import { useToast } from '@/components/ui/Toast';

type ModalMode = 'create' | 'edit' | 'view' | null;

export default function MyServicesPage() {
    const { push: showToast } = useToast();
    const [services, setServices] = useState<ApiService[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [modalMode, setModalMode] = useState<ModalMode>(null);
    const [selectedService, setSelectedService] = useState<ApiService | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
    const [unpublishConfirm, setUnpublishConfirm] = useState<ApiService | null>(null);
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

    const handleCreateService = async (values: any, files: File[]) => {
        try {
            setSubmitting(true);

            // Step 1: Create service without images
            const response = await servicesApi.create(values);
            const createdService = response.data;

            // Step 2: Upload images if any
            if (files.length > 0) {
                const uploadedUrls: string[] = [];
                for (const file of files) {
                    try {
                        const uploadResponse = await mediaApi.upload(file, 'services', createdService._id);
                        uploadedUrls.push(uploadResponse.url);
                    } catch (error) {
                        console.error('Failed to upload image:', error);
                    }
                }

                // Step 3: Update service with image URLs
                if (uploadedUrls.length > 0) {
                    await servicesApi.update(createdService._id, {
                        images: uploadedUrls,
                    });
                }
            }

            setModalMode(null);
            fetchMyServices();
            showToast({
                title: 'Success!',
                description: 'Service created successfully',
                variant: 'success'
            });
        } catch (error: any) {
            console.error('Failed to create service:', error);
            showToast({
                title: 'Error',
                description: error.response?.data?.message || 'Failed to create service',
                variant: 'error'
            });
        } finally {
            setSubmitting(false);
        }
    };

    const handleUpdateService = async (values: any, files: File[]) => {
        if (!selectedService) return;

        try {
            setSubmitting(true);

            // Upload new images if any
            const newImageUrls: string[] = [];
            if (files.length > 0) {
                for (const file of files) {
                    try {
                        const uploadResponse = await mediaApi.upload(file, 'services', selectedService._id);
                        newImageUrls.push(uploadResponse.url);
                    } catch (error) {
                        console.error('Failed to upload image:', error);
                    }
                }
            }

            // Combine existing images (from form) with newly uploaded ones
            const existingImages = values.existingImages || [];
            const updatedImages = [
                ...existingImages,
                ...newImageUrls
            ];

            // Remove existingImages from values before sending to API
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { existingImages: _, ...serviceData } = values;

            // Update service - Backend will automatically reset to pending if service was verified
            const response = await servicesApi.update(selectedService._id, {
                ...serviceData,
                images: updatedImages,
            });

            // Update local state with the response data
            const updatedService = response.data;
            setServices(services.map(s =>
                s._id === selectedService._id ? updatedService : s
            ));

            setModalMode(null);
            setSelectedService(null);

            // Check if service was reset to pending (was verified before)
            const wasVerified = selectedService.verified && selectedService.verificationStatus === 'verified';
            const nowPending = updatedService.verificationStatus === 'pending';

            showToast({
                title: 'Success!',
                description: wasVerified && nowPending
                    ? 'Service updated! It will need admin approval before going live again.'
                    : 'Service updated successfully',
                variant: 'success'
            });
        } catch (error: any) {
            console.error('Failed to update service:', error);
            showToast({
                title: 'Error',
                description: error.response?.data?.message || 'Failed to update service',
                variant: 'error'
            });
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteService = async (serviceId: string) => {
        try {
            await servicesApi.delete(serviceId);
            setDeleteConfirm(null);
            fetchMyServices();
            showToast({
                title: 'Success!',
                description: 'Service deleted successfully',
                variant: 'success'
            });
        } catch (error: any) {
            console.error('Failed to delete service:', error);
            showToast({
                title: 'Error',
                description: error.response?.data?.message || 'Failed to delete service',
                variant: 'error'
            });
        }
    };

    const handleUnpublish = async () => {
        if (!unpublishConfirm) return;

        try {
            await servicesApi.unpublish(unpublishConfirm._id);

            // Update local state
            setServices(services.map(s =>
                s._id === unpublishConfirm._id
                    ? { ...s, status: 'inactive' }
                    : s
            ));

            setUnpublishConfirm(null);
            showToast({
                title: 'Success!',
                description: 'Service unpublished successfully',
                variant: 'success'
            });
        } catch (error: any) {
            console.error('Failed to unpublish service:', error);
            showToast({
                title: 'Error',
                description: error.response?.data?.message || 'Failed to unpublish service',
                variant: 'error'
            });
        }
    };

    const handleServiceClick = (service: ApiService) => {
        setSelectedService(service);
        setModalMode('view');
    };

    const handleEditClick = (e: React.MouseEvent, service: ApiService) => {
        e.stopPropagation();
        setSelectedService(service);
        setModalMode('edit');
    };

    const handleDeleteClick = (e: React.MouseEvent, serviceId: string) => {
        e.stopPropagation();
        setDeleteConfirm(serviceId);
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
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                        <div>
                            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-900 bg-clip-text text-transparent">
                                My Services
                            </h1>
                            <p className="text-gray-600 mt-2 text-sm sm:text-base">Manage and track your service listings</p>
                        </div>
                        <button
                            onClick={() => setModalMode('create')}
                            className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-semibold shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 flex items-center justify-center gap-2 group"
                        >
                            <svg className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Create New Service
                        </button>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 group">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-sm text-gray-600 font-medium">Total Services</p>
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </div>
                            </div>
                            <p className="text-3xl font-bold text-gray-900">{services.length}</p>
                        </div>
                        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 group">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-sm text-gray-600 font-medium">Active</p>
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            </div>
                            <p className="text-3xl font-bold text-green-600">
                                {services.filter(s => s.status === 'active').length}
                            </p>
                        </div>
                        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 group">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-sm text-gray-600 font-medium">Pending</p>
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-50 to-yellow-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                                    <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            </div>
                            <p className="text-3xl font-bold text-yellow-600">
                                {services.filter(s => s.status === 'pending').length}
                            </p>
                        </div>
                        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 group">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-sm text-gray-600 font-medium">Total Views</p>
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                </div>
                            </div>
                            <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                                {services.reduce((sum, s) => sum + (s.views || 0), 0)}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Services List */}
                {services.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-lg p-12 sm:p-16 text-center border border-gray-100">
                        <div className="max-w-md mx-auto">
                            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
                                <svg className="w-12 h-12 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-3">No Services Yet</h3>
                            <p className="text-gray-600 mb-8 text-sm sm:text-base">
                                You haven&apos;t created any services yet. Start by creating your first service listing to reach more customers.
                            </p>
                            <button
                                onClick={() => setModalMode('create')}
                                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-semibold shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 inline-flex items-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Create Your First Service
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-5">
                        {services.map((service) => (
                            <div
                                key={service._id}
                                className="bg-white rounded-2xl border border-gray-100 hover:border-blue-300 hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden group"
                                onClick={() => handleServiceClick(service)}
                            >
                                <div className="flex flex-col md:flex-row">
                                    {/* Image */}
                                    <div className="relative w-full md:w-72 h-56 md:h-auto shrink-0 overflow-hidden">
                                        {service.images && service.images.length > 0 ? (
                                            <Image
                                                src={service.images[0]}
                                                alt={service.title}
                                                fill
                                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center">
                                                <svg className="w-16 h-16 text-white opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                </svg>
                                            </div>
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 p-6 sm:p-8">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex-1">
                                                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                                                    {service.title}
                                                </h3>
                                                <p className="text-sm text-gray-600 flex items-center gap-1.5">
                                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    </svg>
                                                    {service.location}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2 ml-4">
                                                <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${getStatusColor(service.status || 'pending')} shadow-sm`}>
                                                    {service.status ? service.status.charAt(0).toUpperCase() + service.status.slice(1) : 'Pending'}
                                                </span>
                                            </div>
                                        </div>

                                        <p className="text-gray-600 mb-6 line-clamp-2 text-sm sm:text-base leading-relaxed">
                                            {service.description}
                                        </p>

                                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                            <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-sm text-gray-600">
                                                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 rounded-lg">
                                                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                    </svg>
                                                    <span className="font-medium">{service.views || 0}</span>
                                                </span>
                                                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-50 rounded-lg">
                                                    <svg className="w-4 h-4 text-yellow-500 fill-current" viewBox="0 0 20 20">
                                                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                                                    </svg>
                                                    <span className="font-medium text-yellow-700">{service.rating ? service.rating.toFixed(1) : '0.0'}</span>
                                                </span>
                                                <span className="px-3 py-1.5 bg-blue-50 rounded-lg capitalize font-medium text-blue-700">
                                                    {service.category ? service.category.replace(/_/g, ' ') : 'Uncategorized'}
                                                </span>
                                            </div>

                                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full">
                                                <div className="text-left sm:text-right flex-1 sm:flex-none">
                                                    <p className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                                        {service.price ? formatCurrency(service.price) : 'Contact for Price'}
                                                    </p>
                                                    {service.price && (
                                                        <p className="text-xs text-gray-500 font-medium">
                                                            {service.priceUnit || 'per service'}
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2 w-full sm:w-auto">
                                                    <button
                                                        onClick={(e) => handleEditClick(e, service)}
                                                        className="p-2.5 text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200 hover:scale-110 border border-blue-200"
                                                        title="Edit service"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                        </svg>
                                                    </button>
                                                    {service.status === 'active' && (
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setUnpublishConfirm(service);
                                                            }}
                                                            className="p-2.5 text-orange-600 hover:bg-orange-50 rounded-xl transition-all duration-200 hover:scale-110 border border-orange-200"
                                                            title="Unpublish service"
                                                        >
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                                            </svg>
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={(e) => handleDeleteClick(e, service._id)}
                                                        className="p-2.5 text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 hover:scale-110 border border-red-200"
                                                        title="Delete service"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Create/Edit Modal */}
            {(modalMode === 'create' || modalMode === 'edit') && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden animate-slideUp">
                        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 px-6 sm:px-8 py-5 flex items-center justify-between z-10 shadow-lg">
                            <div>
                                <h2 className="text-2xl sm:text-3xl font-bold text-white">
                                    {modalMode === 'create' ? 'Create New Service' : 'Edit Service'}
                                </h2>
                                <p className="text-blue-100 text-sm mt-1">
                                    {modalMode === 'create' ? 'Fill in the details to list your service' : 'Update your service information'}
                                </p>
                            </div>
                            <button
                                onClick={() => {
                                    setModalMode(null);
                                    setSelectedService(null);
                                }}
                                className="text-white/80 hover:text-white hover:bg-white/20 p-2 rounded-xl transition-all duration-200"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="p-6 sm:p-8 overflow-y-auto max-h-[calc(90vh-100px)]">
                            <ServiceForm
                                initialValues={modalMode === 'edit' ? selectedService || undefined : undefined}
                                onSubmit={modalMode === 'create' ? handleCreateService : handleUpdateService}
                                onCancel={() => {
                                    setModalMode(null);
                                    setSelectedService(null);
                                }}
                                loading={submitting}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* View Modal */}
            {modalMode === 'view' && selectedService && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden animate-slideUp">
                        <div className="sticky top-0 bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 px-6 sm:px-8 py-5 flex items-center justify-between z-10 shadow-lg">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                </div>
                                <div>
                                    <h2 className="text-2xl sm:text-3xl font-bold text-white">Service Details</h2>
                                    <p className="text-white/70 text-sm">Complete information about your service</p>
                                </div>
                            </div>
                            <button
                                onClick={() => {
                                    setModalMode(null);
                                    setSelectedService(null);
                                }}
                                className="text-white/80 hover:text-white hover:bg-white/20 p-2 rounded-xl transition-all duration-200"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="p-6 sm:p-8 overflow-y-auto max-h-[calc(90vh-140px)]">
                            {/* Images */}
                            {selectedService.images && selectedService.images.length > 0 && (
                                <div className="mb-6 grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {selectedService.images.map((img, idx) => (
                                        <div key={idx} className="relative h-48 rounded-lg overflow-hidden">
                                            <Image src={img} alt={`Service image ${idx + 1}`} fill className="object-cover" />
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Details */}
                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{selectedService.title}</h3>
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(selectedService.status || 'pending')}`}>
                                        {selectedService.status ? selectedService.status.charAt(0).toUpperCase() + selectedService.status.slice(1) : 'Pending'}
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-600">Category</p>
                                        <p className="font-semibold capitalize">{selectedService.category ? selectedService.category.replace(/_/g, ' ') : 'Uncategorized'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Location</p>
                                        <p className="font-semibold">{selectedService.location}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Price</p>
                                        <p className="font-semibold">{selectedService.price ? formatCurrency(selectedService.price) : 'Contact for Price'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Rating</p>
                                        <p className="font-semibold">{selectedService.rating?.toFixed(1) || '0.0'} ⭐</p>
                                    </div>
                                </div>

                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Description</p>
                                    <p className="text-gray-700">{selectedService.description}</p>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex flex-col sm:flex-row gap-3 mt-8 pt-6 border-t-2 border-gray-100">
                                <button
                                    onClick={() => setModalMode('edit')}
                                    className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3.5 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-semibold shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 flex items-center justify-center gap-2"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                    Edit Service
                                </button>
                                <button
                                    onClick={() => {
                                        setModalMode(null);
                                        setDeleteConfirm(selectedService._id);
                                    }}
                                    className="flex-1 bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-3.5 rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-200 font-semibold shadow-lg shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/40 flex items-center justify-center gap-2"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                    Delete Service
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteConfirm && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 animate-slideUp">
                        <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center">
                            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-3 text-center">Delete Service?</h3>
                        <p className="text-gray-600 mb-8 text-center">
                            Are you sure you want to delete this service? This action cannot be undone and all associated data will be permanently removed.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <button
                                onClick={() => setDeleteConfirm(null)}
                                className="flex-1 bg-gray-100 text-gray-700 px-6 py-3.5 rounded-xl hover:bg-gray-200 transition-all duration-200 font-semibold border-2 border-gray-200"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleDeleteService(deleteConfirm)}
                                className="flex-1 bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-3.5 rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-200 font-semibold shadow-lg shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/40 flex items-center justify-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                Delete Permanently
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Unpublish Confirmation Modal */}
            {unpublishConfirm && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 animate-slideUp">
                        <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center">
                            <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                            </svg>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-3 text-center">Unpublish Service?</h3>
                        <p className="text-gray-600 mb-2 text-center font-medium">
                            {unpublishConfirm.title}
                        </p>
                        <p className="text-gray-500 mb-8 text-center text-sm">
                            This will remove the service from public listings. You can reactivate it later by editing and resubmitting.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <button
                                onClick={() => setUnpublishConfirm(null)}
                                className="flex-1 bg-gray-100 text-gray-700 px-6 py-3.5 rounded-xl hover:bg-gray-200 transition-all duration-200 font-semibold border-2 border-gray-200"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUnpublish}
                                className="flex-1 bg-gradient-to-r from-orange-600 to-orange-700 text-white px-6 py-3.5 rounded-xl hover:from-orange-700 hover:to-orange-800 transition-all duration-200 font-semibold shadow-lg shadow-orange-500/30 hover:shadow-xl hover:shadow-orange-500/40 flex items-center justify-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                </svg>
                                Unpublish
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
