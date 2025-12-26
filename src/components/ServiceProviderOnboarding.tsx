'use client';

import { useState } from 'react';
import { serviceProvidersApi, type OnboardProviderDto } from '@/services/api/service-providers.api';

interface ServiceProviderOnboardingProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const SERVICE_TYPES = [
    { value: 'cleaning', label: 'Cleaning Services', icon: '🧹' },
    { value: 'plumbing', label: 'Plumbing', icon: '🔧' },
    { value: 'electrical', label: 'Electrical', icon: '⚡' },
    { value: 'painting_decoration', label: 'Painting & Decoration', icon: '🎨' },
    { value: 'carpentry_furniture', label: 'Carpentry & Furniture', icon: '🪑' },
    { value: 'moving_logistics', label: 'Moving & Logistics', icon: '🚚' },
    { value: 'security_services', label: 'Security Services', icon: '🛡️' },
    { value: 'sanitation_services', label: 'Sanitation Services', icon: '🗑️' },
];

export default function ServiceProviderOnboarding({ isOpen, onClose, onSuccess }: ServiceProviderOnboardingProps) {
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState<OnboardProviderDto>({
        businessName: '',
        serviceTypes: [],
        location: '',
        phone: '',
        whatsapp: '',
        experience: 0,
        certifications: [],
        description: '',
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const toggleServiceType = (type: string) => {
        setFormData(prev => ({
            ...prev,
            serviceTypes: prev.serviceTypes.includes(type)
                ? prev.serviceTypes.filter(t => t !== type)
                : [...prev.serviceTypes, type]
        }));
    };

    const handleNext = () => {
        setError('');

        // Validation for each step
        if (step === 1) {
            if (!formData.businessName.trim()) {
                setError('Please enter your business name');
                return;
            }
        } else if (step === 2) {
            if (formData.serviceTypes.length === 0) {
                setError('Please select at least one service type');
                return;
            }
        } else if (step === 3) {
            if (!formData.location.trim()) {
                setError('Please enter your location');
                return;
            }
            if (!formData.phone.trim()) {
                setError('Please enter your phone number');
                return;
            }
        }

        setStep(prev => prev + 1);
    };

    const handleBack = () => {
        setError('');
        setStep(prev => prev - 1);
    };

    const handleSubmit = async () => {
        setError('');

        if (!formData.description.trim()) {
            setError('Please provide a description of your services');
            return;
        }

        if (formData.experience < 0) {
            setError('Please enter your years of experience');
            return;
        }

        try {
            setIsSubmitting(true);
            await serviceProvidersApi.onboard(formData);
            onSuccess();
        } catch (err: any) {
            console.error('Onboarding failed:', err);
            setError(err.response?.data?.message || 'Failed to create your business profile. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    const totalSteps = 4;
    const progress = (step / totalSteps) * 100;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
            <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden animate-slideUp">
                {/* Header */}
                <div className="px-8 pt-8 pb-6 border-b border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-2xl font-bold text-gray-900">Set Up Your Business Profile</h2>
                        <button
                            onClick={onClose}
                            className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
                        >
                            <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Progress Bar */}
                    <div className="relative">
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-purple-600 to-pink-600 transition-all duration-300 ease-out"
                                style={{ width: `${progress}%` }}
                            ></div>
                        </div>
                        <p className="text-sm text-gray-600 mt-2">Step {step} of {totalSteps}</p>
                    </div>
                </div>

                {/* Content */}
                <div className="px-8 py-6 overflow-y-auto max-h-[calc(90vh-240px)]">
                    {error && (
                        <div className="mb-6 bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded">
                            <p className="text-sm">{error}</p>
                        </div>
                    )}

                    {/* Step 1: Business Name */}
                    {step === 1 && (
                        <div className="space-y-6 animate-fadeIn">
                            <div className="text-center mb-8">
                                <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <span className="text-4xl">🏢</span>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">What&apos;s your business name?</h3>
                                <p className="text-gray-600">This will be displayed to customers when they view your services</p>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Business Name *</label>
                                <input
                                    type="text"
                                    name="businessName"
                                    value={formData.businessName}
                                    onChange={handleInputChange}
                                    placeholder="e.g., Best Cleaners Ltd"
                                    className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-lg"
                                    autoFocus
                                />
                            </div>
                        </div>
                    )}

                    {/* Step 2: Service Types */}
                    {step === 2 && (
                        <div className="space-y-6 animate-fadeIn">
                            <div className="text-center mb-8">
                                <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <span className="text-4xl">🛠️</span>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">What services do you offer?</h3>
                                <p className="text-gray-600">Select all that apply. You can always update this later.</p>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                {SERVICE_TYPES.map((service) => (
                                    <button
                                        key={service.value}
                                        onClick={() => toggleServiceType(service.value)}
                                        className={`p-4 rounded-xl border-2 transition-all text-left ${
                                            formData.serviceTypes.includes(service.value)
                                                ? 'border-purple-600 bg-purple-50 ring-2 ring-purple-600'
                                                : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="text-2xl">{service.icon}</span>
                                            <span className="font-medium text-gray-900">{service.label}</span>
                                        </div>
                                        {formData.serviceTypes.includes(service.value) && (
                                            <div className="mt-2">
                                                <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Step 3: Contact & Location */}
                    {step === 3 && (
                        <div className="space-y-6 animate-fadeIn">
                            <div className="text-center mb-8">
                                <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <span className="text-4xl">📍</span>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Where are you located?</h3>
                                <p className="text-gray-600">Help customers find and contact you easily</p>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Location *</label>
                                <input
                                    type="text"
                                    name="location"
                                    value={formData.location}
                                    onChange={handleInputChange}
                                    placeholder="e.g., Nairobi, Kenya"
                                    className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number *</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    placeholder="+254..."
                                    className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">WhatsApp (Optional)</label>
                                <input
                                    type="tel"
                                    name="whatsapp"
                                    value={formData.whatsapp}
                                    onChange={handleInputChange}
                                    placeholder="+254..."
                                    className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                />
                            </div>
                        </div>
                    )}

                    {/* Step 4: Experience & Description */}
                    {step === 4 && (
                        <div className="space-y-6 animate-fadeIn">
                            <div className="text-center mb-8">
                                <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <span className="text-4xl">✨</span>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Tell us about your experience</h3>
                                <p className="text-gray-600">This helps customers trust and choose your services</p>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Years of Experience *</label>
                                <input
                                    type="number"
                                    name="experience"
                                    value={formData.experience}
                                    onChange={handleInputChange}
                                    min="0"
                                    placeholder="e.g., 5"
                                    className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Business Description *</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    rows={5}
                                    placeholder="Tell customers about your services, expertise, and what makes your business special..."
                                    className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
                                />
                                <p className="text-sm text-gray-500 mt-2">{formData.description.length} characters</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-8 py-6 border-t border-gray-200 bg-gray-50">
                    <div className="flex items-center justify-between gap-4">
                        <button
                            onClick={step === 1 ? onClose : handleBack}
                            disabled={isSubmitting}
                            className="px-6 py-3 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-all disabled:opacity-50"
                        >
                            {step === 1 ? 'Cancel' : 'Back'}
                        </button>

                        {step < totalSteps ? (
                            <button
                                onClick={handleNext}
                                className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl"
                            >
                                Continue
                            </button>
                        ) : (
                            <button
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 flex items-center gap-2"
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                                        Creating Profile...
                                    </>
                                ) : (
                                    <>
                                        Complete Setup
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
