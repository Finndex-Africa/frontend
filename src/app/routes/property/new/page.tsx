'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { propertiesApi } from '@/services/api';
import { mediaApi } from '@/services/api/media.api';

export default function NewPropertyPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        location: '',
        price: '',
        propertyType: 'Apartment',
        bedrooms: '',
        bathrooms: '',
        area: '',
        furnished: false,
    });
    const [amenities, setAmenities] = useState<string[]>([]);
    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
            setFormData(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length + imageFiles.length > 10) {
            alert('You can only upload up to 10 images');
            return;
        }

        setImageFiles(prev => [...prev, ...files]);

        // Create previews
        files.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreviews(prev => [...prev, reader.result as string]);
            };
            reader.readAsDataURL(file);
        });
    };

    const removeImage = (index: number) => {
        setImageFiles(prev => prev.filter((_, i) => i !== index));
        setImagePreviews(prev => prev.filter((_, i) => i !== index));
    };

    const toggleAmenity = (amenity: string) => {
        setAmenities(prev =>
            prev.includes(amenity)
                ? prev.filter(a => a !== amenity)
                : [...prev, amenity]
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Upload images first
            let imageUrls: string[] = [];
            if (imageFiles.length > 0) {
                const uploadedResponses = await Promise.all(
                    imageFiles.map(file => mediaApi.upload(file, 'properties'))
                );
                imageUrls = uploadedResponses.map(response => response.url);
            }

            // Create property
            const propertyData = {
                title: formData.title,
                description: formData.description,
                location: formData.location,
                price: Number(formData.price),
                propertyType: formData.propertyType,
                bedrooms: formData.bedrooms ? Number(formData.bedrooms) : undefined,
                bathrooms: formData.bathrooms ? Number(formData.bathrooms) : undefined,
                area: formData.area ? Number(formData.area) : undefined,
                furnished: formData.furnished,
                images: imageUrls,
                amenities: amenities.length > 0 ? amenities : undefined,
            };

            await propertiesApi.create(propertyData);

            alert('Property created successfully! It will be reviewed by admin.');
            router.push('/routes/my-listings');
        } catch (error: any) {
            console.error('Failed to create property:', error);
            alert(error?.response?.data?.message || 'Failed to create property. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container-app px-4 max-w-4xl mx-auto">
                <div className="mb-8">
                    <button
                        onClick={() => router.back()}
                        className="text-gray-600 hover:text-gray-900 flex items-center gap-2 mb-4"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back
                    </button>
                    <h1 className="text-4xl font-bold text-gray-900">Add New Property</h1>
                    <p className="mt-2 text-gray-600">Create a new property listing</p>
                </div>

                <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-8">
                    {/* Basic Information */}
                    <div className="mb-8">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Property Title <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="e.g., Luxury 3BR Apartment in Westlands"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Description <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    required
                                    rows={4}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Describe your property..."
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Property Type <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="propertyType"
                                        value={formData.propertyType}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="Apartment">Apartment</option>
                                        <option value="House">House</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Location <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="location"
                                        value={formData.location}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="e.g., Westlands, Nairobi"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Monthly Rent (USD) <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        name="price"
                                        value={formData.price}
                                        onChange={handleChange}
                                        required
                                        min="0"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="e.g., 1200"
                                    />
                                </div>

                                <div>
                                    <label className="flex items-center space-x-2 pt-8">
                                        <input
                                            type="checkbox"
                                            name="furnished"
                                            checked={formData.furnished}
                                            onChange={handleChange}
                                            className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                        />
                                        <span className="text-sm font-medium text-gray-700">Furnished</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Property Details */}
                    <div className="mb-8">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Property Details</h2>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Bedrooms
                                </label>
                                <input
                                    type="number"
                                    name="bedrooms"
                                    value={formData.bedrooms}
                                    onChange={handleChange}
                                    min="0"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="e.g., 3"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Bathrooms
                                </label>
                                <input
                                    type="number"
                                    name="bathrooms"
                                    value={formData.bathrooms}
                                    onChange={handleChange}
                                    min="0"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="e.g., 2"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Minutes from main road
                                </label>
                                <input
                                    type="number"
                                    name="area"
                                    value={formData.area}
                                    onChange={handleChange}
                                    min="0"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="e.g., 5"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Amenities */}
                    <div className="mb-8">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Amenities</h2>
                        <p className="text-sm text-gray-600 mb-4">Select the amenities available in this property</p>

                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                            {[
                                { value: 'Water', icon: '💧' },
                                { value: 'Electricity', icon: '⚡' },
                                { value: 'WiFi', icon: '📶' },
                                { value: 'Parking', icon: '🚗' },
                                { value: 'Security', icon: '🔒' },
                                { value: 'Swimming Pool', icon: '🏊' },
                                { value: 'Gym', icon: '💪' },
                                { value: 'Garden', icon: '🌳' },
                                { value: 'Balcony', icon: '🏠' },
                                { value: 'Air Conditioning', icon: '❄️' },
                                { value: 'Heating', icon: '🔥' },
                                { value: 'Laundry', icon: '🧺' },
                                { value: 'Elevator', icon: '🛗' },
                                { value: 'Generator', icon: '⚙️' },
                                { value: 'CCTV', icon: '📹' },
                                { value: 'Gate', icon: '🚪' },
                            ].map((amenity) => (
                                <button
                                    key={amenity.value}
                                    type="button"
                                    onClick={() => toggleAmenity(amenity.value)}
                                    className={`
                                        px-4 py-3 rounded-lg border-2 transition-all text-left flex items-center gap-2
                                        ${amenities.includes(amenity.value)
                                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                                            : 'border-gray-200 hover:border-gray-300 text-gray-700'
                                        }
                                    `}
                                >
                                    <span className="text-xl">{amenity.icon}</span>
                                    <span className="text-sm font-medium">{amenity.value}</span>
                                    {amenities.includes(amenity.value) && (
                                        <svg className="w-5 h-5 ml-auto text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Images */}
                    <div className="mb-8">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Property Images</h2>
                        <p className="text-sm text-gray-600 mb-4">Upload up to 10 images (Max 10MB each)</p>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                            {imagePreviews.map((preview, index) => (
                                <div key={index} className="relative group h-32">
                                    <Image
                                        src={preview}
                                        alt={`Preview ${index + 1}`}
                                        fill
                                        className="object-cover rounded-lg"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeImage(index)}
                                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            ))}

                            {imagePreviews.length < 10 && (
                                <label className="border-2 border-dashed border-gray-300 rounded-lg h-32 flex items-center justify-center cursor-pointer hover:border-blue-500 transition-colors">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        onChange={handleImageChange}
                                        className="hidden"
                                    />
                                    <div className="text-center">
                                        <svg className="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                        </svg>
                                        <span className="text-sm text-gray-600">Add Image</span>
                                    </div>
                                </label>
                            )}
                        </div>
                    </div>

                    {/* Submit Buttons */}
                    <div className="flex items-center gap-4 pt-6 border-t border-gray-200">
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Creating...' : 'Create Property'}
                        </button>
                        <button
                            type="button"
                            onClick={() => router.back()}
                            disabled={loading}
                            className="px-8 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
