'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { usersApi } from '@/services/api/users.api';
import { mediaApi } from '@/services/api/media.api';
import { serviceProvidersApi, type ServiceProviderProfile, type UpdateProviderDto } from '@/services/api/service-providers.api';
import ServiceProviderOnboarding from '@/components/ServiceProviderOnboarding';

export default function ProfilePage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [showOnboardingModal, setShowOnboardingModal] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Service provider state
    const [providerProfile, setProviderProfile] = useState<ServiceProviderProfile | null>(null);
    const [isEditingProvider, setIsEditingProvider] = useState(false);

    // Form states
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        phone: '',
        avatar: '',
    });

    // Provider form states
    const [providerFormData, setProviderFormData] = useState<UpdateProviderDto>({
        businessName: '',
        serviceTypes: [],
        location: '',
        phone: '',
        whatsapp: '',
        experience: 0,
        certifications: [],
        description: '',
        logoUrl: '',
        imageUrl: '',
    });

    // Password form states
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        const loadUserData = async () => {
            // Check if user is logged in
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            if (!token) {
                router.push('/routes/login');
                return;
            }

            // Get user data from localStorage
            const userData = localStorage.getItem('user') || sessionStorage.getItem('user');
            if (userData) {
                const parsedUser = JSON.parse(userData);
                setUser(parsedUser);
                setFormData({
                    firstName: parsedUser.firstName || '',
                    lastName: parsedUser.lastName || '',
                    phone: parsedUser.phone || '',
                    avatar: parsedUser.avatar || '',
                });

                // Fetch service provider profile if user is a service provider
                if (parsedUser.role === 'provider' || parsedUser.userType === 'service_provider') {
                    try {
                        const response = await serviceProvidersApi.getMyProfile();
                        if (response.data) {
                            setProviderProfile(response.data);
                            setProviderFormData({
                                businessName: response.data.businessName || '',
                                serviceTypes: response.data.serviceTypes || [],
                                location: response.data.location || '',
                                phone: response.data.phone || '',
                                whatsapp: response.data.whatsapp || '',
                                experience: response.data.experience || 0,
                                certifications: response.data.certifications || [],
                                description: response.data.description || '',
                                logoUrl: response.data.logoUrl || '',
                                imageUrl: response.data.imageUrl || '',
                            });
                        }
                    } catch (error) {
                        console.error('Failed to fetch service provider profile:', error);
                    }
                }
            }
            setIsLoading(false);
        };

        loadUserData();
    }, [router]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            setError('Please select an image file');
            return;
        }

        // Validate file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
            setError('Image size must be less than 5MB');
            return;
        }

        try {
            setUploadingImage(true);
            setError('');

            const response = await mediaApi.upload(file, 'users', user._id);
            setFormData(prev => ({ ...prev, avatar: response.url }));
            setSuccess('Profile image uploaded successfully');
        } catch (err) {
            console.error('Image upload failed:', err);
            setError('Failed to upload image. Please try again.');
        } finally {
            setUploadingImage(false);
        }
    };

    const handleSaveProfile = async () => {
        try {
            setIsSaving(true);
            setError('');
            setSuccess('');

            const response = await usersApi.updateProfile({
                firstName: formData.firstName,
                lastName: formData.lastName,
                phone: formData.phone,
                avatar: formData.avatar,
            });

            // Update localStorage with new data
            const updatedUser = { ...user, ...response.data };
            const storage = localStorage.getItem('user') ? localStorage : sessionStorage;
            storage.setItem('user', JSON.stringify(updatedUser));
            setUser(updatedUser);

            setSuccess('Profile updated successfully!');
            setIsEditing(false);
        } catch (err: any) {
            console.error('Profile update failed:', err);
            setError(err.response?.data?.message || 'Failed to update profile. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setError('New passwords do not match');
            return;
        }

        if (passwordData.newPassword.length < 8) {
            setError('Password must be at least 8 characters long');
            return;
        }

        try {
            setIsSaving(true);
            await usersApi.changePassword({
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword,
            });

            setSuccess('Password changed successfully!');
            setShowPasswordModal(false);
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err: any) {
            console.error('Password change failed:', err);
            setError(err.response?.data?.message || 'Failed to change password. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
        setFormData({
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            phone: user.phone || '',
            avatar: user.avatar || '',
        });
        setError('');
        setSuccess('');
    };

    const handleOnboardingSuccess = async () => {
        setShowOnboardingModal(false);
        setSuccess('Business profile created successfully! 🎉');

        // Reload provider profile
        try {
            const response = await serviceProvidersApi.getMyProfile();
            if (response.data) {
                setProviderProfile(response.data);
                setProviderFormData({
                    businessName: response.data.businessName || '',
                    serviceTypes: response.data.serviceTypes || [],
                    location: response.data.location || '',
                    phone: response.data.phone || '',
                    whatsapp: response.data.whatsapp || '',
                    experience: response.data.experience || 0,
                    certifications: response.data.certifications || [],
                    description: response.data.description || '',
                    logoUrl: response.data.logoUrl || '',
                    imageUrl: response.data.imageUrl || '',
                });
            }
        } catch (error) {
            console.error('Failed to fetch updated provider profile:', error);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50 py-8">
            <div className="container-app px-4 max-w-5xl mx-auto">
                {/* Alert Messages */}
                {error && (
                    <div className="mb-6 bg-red-50 border-l-4 border-red-500 text-red-700 px-6 py-4 rounded-lg shadow-sm flex items-start gap-3 animate-slideDown">
                        <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        <span>{error}</span>
                    </div>
                )}
                {success && (
                    <div className="mb-6 bg-green-50 border-l-4 border-green-500 text-green-700 px-6 py-4 rounded-lg shadow-sm flex items-start gap-3 animate-slideDown">
                        <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span>{success}</span>
                    </div>
                )}

                <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                    {/* Profile Header */}
                    <div className="relative h-48 bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 overflow-hidden">
                        {/* Decorative Pattern */}
                        <div className="absolute inset-0 opacity-10">
                            <div className="absolute top-0 left-0 w-full h-full" style={{
                                backgroundImage: 'radial-gradient(circle at 20px 20px, white 2px, transparent 0)',
                                backgroundSize: '40px 40px'
                            }}></div>
                        </div>

                        {isEditing && (
                            <div className="absolute top-6 right-6 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full text-white text-sm font-medium border border-white/30 flex items-center gap-2 animate-fadeIn">
                                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                                Editing Mode
                            </div>
                        )}

                        {/* Edit Button - Positioned in header */}
                        {!isEditing && (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="absolute top-6 right-6 px-5 py-2.5 bg-white text-blue-600 font-semibold rounded-full hover:bg-blue-50 transition-all flex items-center gap-2 shadow-lg hover:shadow-xl"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                Edit Profile
                            </button>
                        )}
                    </div>

                    <div className="px-8 pb-8">
                        {/* Avatar and Name */}
                        <div className="flex flex-col md:flex-row md:items-end md:justify-between -mt-16 mb-8">
                            <div className="flex flex-col md:flex-row items-center md:items-end gap-6 mb-6 md:mb-0">
                                <div className="relative group">
                                    <div className="w-32 h-32 rounded-2xl bg-white border-4 border-white shadow-2xl flex items-center justify-center text-5xl font-bold text-blue-600 overflow-hidden transition-transform group-hover:scale-105">
                                        {formData.avatar ? (
                                            <Image
                                                src={formData.avatar}
                                                alt="Profile"
                                                fill
                                                className="object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white">
                                                {formData.firstName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
                                            </div>
                                        )}
                                    </div>
                                    {isEditing && (
                                        <button
                                            onClick={() => fileInputRef.current?.click()}
                                            disabled={uploadingImage}
                                            className="absolute -bottom-2 -right-2 bg-blue-600 text-white p-3 rounded-xl shadow-lg hover:bg-blue-700 transition-all disabled:bg-gray-400 hover:scale-110"
                                        >
                                            {uploadingImage ? (
                                                <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                                            ) : (
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                            )}
                                        </button>
                                    )}
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        className="hidden"
                                    />
                                </div>
                                <div className="text-center md:text-left">
                                    {!isEditing ? (
                                        <>
                                            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-1">
                                                {user?.firstName && user?.lastName
                                                    ? `${user.firstName} ${user.lastName}`
                                                    : user?.email?.split('@')[0] || 'User'}
                                            </h1>
                                            <div className="flex items-center justify-center md:justify-start gap-2 text-gray-600">
                                                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium capitalize">
                                                    {user?.role?.replace('_', ' ') || 'User'}
                                                </span>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="flex flex-col sm:flex-row gap-3 mt-2">
                                            <input
                                                type="text"
                                                name="firstName"
                                                value={formData.firstName}
                                                onChange={handleInputChange}
                                                placeholder="First Name"
                                                className="px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                            />
                                            <input
                                                type="text"
                                                name="lastName"
                                                value={formData.lastName}
                                                onChange={handleInputChange}
                                                placeholder="Last Name"
                                                className="px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Profile Info */}
                        <div className="space-y-8">
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
                                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
                                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    </div>
                                    Account Information
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="group">
                                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                                            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                            </svg>
                                            Email Address
                                        </label>
                                        <div className="flex items-center gap-3 px-4 py-3.5 bg-white border-2 border-gray-200 rounded-xl group-hover:border-blue-300 transition-colors">
                                            <span className="text-gray-700 font-medium">{user?.email || 'Not provided'}</span>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                            </svg>
                                            Email cannot be changed
                                        </p>
                                    </div>

                                    <div className="group">
                                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                                            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                            </svg>
                                            Phone Number
                                        </label>
                                        {isEditing ? (
                                            <input
                                                type="tel"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleInputChange}
                                                placeholder="+234..."
                                                className="w-full px-4 py-3.5 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                            />
                                        ) : (
                                            <div className="flex items-center gap-3 px-4 py-3.5 bg-white border-2 border-gray-200 rounded-xl group-hover:border-blue-300 transition-colors">
                                                <span className="text-gray-700 font-medium">{user?.phone || 'Not provided'}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="group">
                                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                                            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                            </svg>
                                            Account Type
                                        </label>
                                        <div className="flex items-center gap-3 px-4 py-3.5 bg-white border-2 border-gray-200 rounded-xl group-hover:border-blue-300 transition-colors">
                                            <span className="text-gray-700 font-medium capitalize">
                                                {user?.role?.replace('_', ' ') || 'Not specified'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="group">
                                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                                            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            Member Since
                                        </label>
                                        <div className="flex items-center gap-3 px-4 py-3.5 bg-white border-2 border-gray-200 rounded-xl group-hover:border-blue-300 transition-colors">
                                            <span className="text-gray-700 font-medium">
                                                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
                                                    month: 'long',
                                                    year: 'numeric'
                                                }) : 'N/A'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Service Provider Business Details */}
                            {(user?.role === 'provider' || user?.userType === 'service_provider') && (
                                providerProfile ? (
                                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center">
                                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                </svg>
                                            </div>
                                            Business Information
                                        </h3>
                                        {!isEditingProvider && (
                                            <button
                                                onClick={() => setIsEditingProvider(true)}
                                                className="px-4 py-2 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-all flex items-center gap-2"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                                Edit Business Info
                                            </button>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="group">
                                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                                                <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                </svg>
                                                Business Name
                                            </label>
                                            {isEditingProvider ? (
                                                <input
                                                    type="text"
                                                    value={providerFormData.businessName}
                                                    onChange={(e) => setProviderFormData(prev => ({ ...prev, businessName: e.target.value }))}
                                                    className="w-full px-4 py-3.5 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                                />
                                            ) : (
                                                <div className="flex items-center gap-3 px-4 py-3.5 bg-white border-2 border-gray-200 rounded-xl group-hover:border-purple-300 transition-colors">
                                                    <span className="text-gray-700 font-medium">{providerProfile.businessName}</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="group">
                                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                                                <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                                Location
                                            </label>
                                            {isEditingProvider ? (
                                                <input
                                                    type="text"
                                                    value={providerFormData.location}
                                                    onChange={(e) => setProviderFormData(prev => ({ ...prev, location: e.target.value }))}
                                                    className="w-full px-4 py-3.5 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                                />
                                            ) : (
                                                <div className="flex items-center gap-3 px-4 py-3.5 bg-white border-2 border-gray-200 rounded-xl group-hover:border-purple-300 transition-colors">
                                                    <span className="text-gray-700 font-medium">{providerProfile.location}</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="group">
                                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                                                <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                                </svg>
                                                Years of Experience
                                            </label>
                                            {isEditingProvider ? (
                                                <input
                                                    type="number"
                                                    value={providerFormData.experience}
                                                    onChange={(e) => setProviderFormData(prev => ({ ...prev, experience: parseInt(e.target.value) || 0 }))}
                                                    className="w-full px-4 py-3.5 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                                />
                                            ) : (
                                                <div className="flex items-center gap-3 px-4 py-3.5 bg-white border-2 border-gray-200 rounded-xl group-hover:border-purple-300 transition-colors">
                                                    <span className="text-gray-700 font-medium">{providerProfile.experience} years</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="group">
                                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                                                <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                                                </svg>
                                                Verification Status
                                            </label>
                                            <div className="flex items-center gap-3 px-4 py-3.5 bg-white border-2 border-gray-200 rounded-xl group-hover:border-purple-300 transition-colors">
                                                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                                    providerProfile.verified
                                                        ? 'bg-green-100 text-green-700'
                                                        : providerProfile.verificationStatus === 'pending_verification'
                                                        ? 'bg-yellow-100 text-yellow-700'
                                                        : 'bg-gray-100 text-gray-700'
                                                }`}>
                                                    {providerProfile.verified ? 'Verified' : providerProfile.verificationStatus?.replace('_', ' ')}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="group col-span-1 md:col-span-2">
                                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                                                <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                                </svg>
                                                Service Types
                                            </label>
                                            <div className="flex flex-wrap gap-2 px-4 py-3.5 bg-white border-2 border-gray-200 rounded-xl group-hover:border-purple-300 transition-colors">
                                                {providerProfile.serviceTypes?.map((service, index) => (
                                                    <span key={index} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium capitalize">
                                                        {service.replace('_', ' ')}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="group col-span-1 md:col-span-2">
                                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                                                <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                                </svg>
                                                Description
                                            </label>
                                            {isEditingProvider ? (
                                                <textarea
                                                    value={providerFormData.description}
                                                    onChange={(e) => setProviderFormData(prev => ({ ...prev, description: e.target.value }))}
                                                    rows={4}
                                                    className="w-full px-4 py-3.5 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
                                                />
                                            ) : (
                                                <div className="px-4 py-3.5 bg-white border-2 border-gray-200 rounded-xl group-hover:border-purple-300 transition-colors">
                                                    <p className="text-gray-700">{providerProfile.description}</p>
                                                </div>
                                            )}
                                        </div>

                                        <div className="group">
                                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                                                <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                                </svg>
                                                Rating
                                            </label>
                                            <div className="flex items-center gap-3 px-4 py-3.5 bg-white border-2 border-gray-200 rounded-xl group-hover:border-purple-300 transition-colors">
                                                <span className="text-2xl font-bold text-yellow-500">{providerProfile.rating.toFixed(1)}</span>
                                                <span className="text-gray-600">/ 5.0</span>
                                            </div>
                                        </div>

                                        <div className="group">
                                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                                                <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                Completed Jobs
                                            </label>
                                            <div className="flex items-center gap-3 px-4 py-3.5 bg-white border-2 border-gray-200 rounded-xl group-hover:border-purple-300 transition-colors">
                                                <span className="text-2xl font-bold text-green-600">{providerProfile.completedJobs}</span>
                                                <span className="text-gray-600">jobs</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Provider Edit Actions */}
                                    {isEditingProvider && (
                                        <div className="flex items-center justify-end gap-4 pt-6 mt-6 border-t border-purple-200">
                                            <button
                                                onClick={() => {
                                                    setIsEditingProvider(false);
                                                    // Reset form data
                                                    if (providerProfile) {
                                                        setProviderFormData({
                                                            businessName: providerProfile.businessName || '',
                                                            serviceTypes: providerProfile.serviceTypes || [],
                                                            location: providerProfile.location || '',
                                                            phone: providerProfile.phone || '',
                                                            whatsapp: providerProfile.whatsapp || '',
                                                            experience: providerProfile.experience || 0,
                                                            certifications: providerProfile.certifications || [],
                                                            description: providerProfile.description || '',
                                                            logoUrl: providerProfile.logoUrl || '',
                                                            imageUrl: providerProfile.imageUrl || '',
                                                        });
                                                    }
                                                }}
                                                disabled={isSaving}
                                                className="px-8 py-3 text-gray-700 bg-white border-2 border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all font-semibold disabled:opacity-50 shadow-sm"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={async () => {
                                                    if (!providerProfile) return;
                                                    try {
                                                        setIsSaving(true);
                                                        setError('');
                                                        setSuccess('');

                                                        const response = await serviceProvidersApi.update(providerProfile._id, providerFormData);
                                                        setProviderProfile(response.data);
                                                        setSuccess('Business information updated successfully!');
                                                        setIsEditingProvider(false);
                                                    } catch (err: any) {
                                                        console.error('Provider update failed:', err);
                                                        setError(err.response?.data?.message || 'Failed to update business information.');
                                                    } finally {
                                                        setIsSaving(false);
                                                    }
                                                }}
                                                disabled={isSaving}
                                                className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all font-semibold disabled:opacity-50 flex items-center gap-2 shadow-lg hover:shadow-xl"
                                            >
                                                {isSaving ? (
                                                    <>
                                                        <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                                                        Saving...
                                                    </>
                                                ) : (
                                                    <>
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                        Save Changes
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    )}
                                </div>
                                ) : (
                                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100">
                                        <div className="text-center py-8">
                                            <div className="w-20 h-20 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-4">
                                                <svg className="w-10 h-10 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                </svg>
                                            </div>
                                            <h3 className="text-xl font-bold text-gray-900 mb-2">Complete Your Business Profile</h3>
                                            <p className="text-gray-600 mb-6 max-w-md mx-auto">
                                                You haven&apos;t set up your service provider business profile yet. Complete your profile to start receiving service requests and showcase your business.
                                            </p>
                                            <button
                                                onClick={() => setShowOnboardingModal(true)}
                                                className="px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-all inline-flex items-center gap-2"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                                </svg>
                                                Set Up Business Profile
                                            </button>
                                        </div>
                                    </div>
                                )
                            )}

                            {/* Security Section */}
                            <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-2xl p-6 border border-gray-200">
                                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center">
                                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </svg>
                                    </div>
                                    Security Settings
                                </h3>
                                <button
                                    onClick={() => setShowPasswordModal(true)}
                                    className="w-full flex items-center justify-between gap-4 px-6 py-4 bg-white border-2 border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all group"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                                            </svg>
                                        </div>
                                        <div className="text-left">
                                            <p className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">Change Password</p>
                                            <p className="text-sm text-gray-600">Update your password to keep your account secure</p>
                                        </div>
                                    </div>
                                    <svg className="w-6 h-6 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                            </div>

                            {/* Action Buttons */}
                            {isEditing && (
                                <div className="flex items-center justify-end gap-4 pt-6">
                                    <button
                                        onClick={handleCancel}
                                        disabled={isSaving}
                                        className="px-8 py-3 text-gray-700 bg-white border-2 border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all font-semibold disabled:opacity-50 shadow-sm"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSaveProfile}
                                        disabled={isSaving}
                                        className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all font-semibold disabled:opacity-50 flex items-center gap-2 shadow-lg hover:shadow-xl"
                                    >
                                        {isSaving ? (
                                            <>
                                                <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                                                Saving Changes...
                                            </>
                                        ) : (
                                            <>
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                                Save Changes
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Change Password Modal */}
            {showPasswordModal && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
                    onClick={() => setShowPasswordModal(false)}
                >
                    <div
                        className="bg-white rounded-2xl shadow-2xl max-w-md w-full"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="border-b border-gray-200 px-6 py-4">
                            <h3 className="text-xl font-bold text-gray-900">Change Password</h3>
                            <p className="text-sm text-gray-600 mt-1">Enter your current password and a new password</p>
                        </div>

                        <form onSubmit={handleChangePassword} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                                <input
                                    type="password"
                                    name="currentPassword"
                                    value={passwordData.currentPassword}
                                    onChange={handlePasswordChange}
                                    required
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                                <input
                                    type="password"
                                    name="newPassword"
                                    value={passwordData.newPassword}
                                    onChange={handlePasswordChange}
                                    required
                                    minLength={8}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <p className="text-xs text-gray-500 mt-1">Minimum 8 characters</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={passwordData.confirmPassword}
                                    onChange={handlePasswordChange}
                                    required
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowPasswordModal(false)}
                                    disabled={isSaving}
                                    className="px-6 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
                                >
                                    {isSaving ? 'Changing...' : 'Change Password'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Service Provider Onboarding Modal */}
            <ServiceProviderOnboarding
                isOpen={showOnboardingModal}
                onClose={() => setShowOnboardingModal(false)}
                onSuccess={handleOnboardingSuccess}
            />
        </div>
    );
}
