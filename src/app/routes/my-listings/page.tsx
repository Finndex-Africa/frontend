'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { propertiesApi } from '@/services/api';
import { Property as ApiProperty } from '@/types/dashboard';
import Image from 'next/image';

// Property edit modal component
function EditPropertyModal({ property, isOpen, onClose, onSave }: { property: ApiProperty | null; isOpen: boolean; onClose: () => void; onSave: (data: Partial<ApiProperty>) => Promise<void> }) {
    const [formData, setFormData] = useState<Partial<ApiProperty>>({});
    const [loading, setLoading] = useState(false);
    const [images, setImages] = useState<string[]>([]);
    const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);

    useEffect(() => {
        if (property) {
            // Format dates for input fields (YYYY-MM-DD format)
            const formatDate = (date: any) => {
                if (!date) return '';
                try {
                    const d = new Date(date);
                    if (isNaN(d.getTime())) return '';

                    const year = d.getFullYear();
                    const month = String(d.getMonth() + 1).padStart(2, '0');
                    const day = String(d.getDate()).padStart(2, '0');
                    return `${year}-${month}-${day}`;
                } catch (e) {
                    console.error('Date formatting error:', e);
                    return '';
                }
            };

            const formattedAvailableFrom = formatDate(property.availableFrom);
            const formattedAvailableTo = formatDate(property.availableTo);

            console.log('Property data:', property);
            console.log('Property type field:', property.type);
            console.log('Property propertyType field:', property.propertyType);
            console.log('Formatted dates:', {
                availableFrom: property.availableFrom,
                availableTo: property.availableTo,
                formattedFrom: formattedAvailableFrom,
                formattedTo: formattedAvailableTo
            });

            setFormData({
                title: property.title || '',
                description: property.description || '',
                location: property.location || '',
                price: property.price || 0,
                propertyType: property.propertyType || property.type || '',
                bedrooms: property.bedrooms || 0,
                bathrooms: property.bathrooms || 0,
                area: property.area || 0,
                furnished: property.furnished || false,
                availableFrom: formattedAvailableFrom,
                availableTo: formattedAvailableTo,
            });
            setImages(property.images || []);
            setNewImageFiles([]);
            setImagePreviews([]);
        }
    }, [property]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type: inputType } = e.target;
        const val = inputType === 'checkbox' ? (e.target as HTMLInputElement).checked : (inputType === 'number' ? (value === '' ? undefined : Number(value)) : value);
        setFormData(prev => ({ ...prev, [name]: val }));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        const totalImages = images.length + newImageFiles.length + files.length;

        if (totalImages > 10) {
            alert('You can only have up to 10 images total');
            return;
        }

        setNewImageFiles(prev => [...prev, ...files]);

        // Create previews for new files
        files.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreviews(prev => [...prev, reader.result as string]);
            };
            reader.readAsDataURL(file);
        });
    };

    const removeExistingImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index));
    };

    const removeNewImage = (index: number) => {
        setNewImageFiles(prev => prev.filter((_, i) => i !== index));
        setImagePreviews(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Upload new images if any
            let finalImages = [...images];
            if (newImageFiles.length > 0) {
                // Import mediaApi for image upload
                const { mediaApi } = await import('@/services/api/media.api');

                const uploadedResponses = await Promise.all(
                    newImageFiles.map(file => mediaApi.upload(file, 'properties'))
                );
                const uploadedUrls = uploadedResponses.map(response => response.url);
                finalImages = [...finalImages, ...uploadedUrls];
            }

            // Prepare data for submission - map field names to backend expectations
            // IMPORTANT: Always include these required fields:
            // title, description, location, price, propertyType, furnished
            const submitData: Record<string, any> = {
                title: formData.title || '',
                description: formData.description || '',
                location: formData.location || '',
                price: formData.price ? Number(formData.price) : 0,
                propertyType: formData.propertyType || '',
                furnished: formData.furnished === undefined ? false : formData.furnished, // Always include furnished
            };

            // Add optional fields if they have values
            if (formData.bedrooms !== undefined && formData.bedrooms !== null) {
                submitData.rooms = Number(formData.bedrooms);
            }
            if (formData.bathrooms !== undefined && formData.bathrooms !== null) {
                submitData.bathrooms = Number(formData.bathrooms);
            }
            if (formData.area) {
                submitData.area = Number(formData.area);
            }
            if (formData.availableFrom) {
                submitData.availableFrom = new Date(formData.availableFrom).toISOString();
            }
            if (formData.availableTo) {
                submitData.availableTo = new Date(formData.availableTo).toISOString();
            }
            if (finalImages.length > 0) {
                submitData.images = finalImages;
            }

            console.log('Submitting data:', submitData);
            await onSave(submitData);
            onClose();
        } catch (error: any) {
            console.error('Failed to save property:', error);
            const errorMsg = error?.response?.data?.message || error?.message || 'Failed to save property. Please try again.';
            alert(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen || !property) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[95vh] flex flex-col shadow-2xl animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 flex justify-between items-center rounded-t-2xl flex-shrink-0">
                    <h2 className="text-2xl font-bold text-white">Edit Property</h2>
                    <button
                        onClick={onClose}
                        className="text-white hover:bg-blue-800 p-2 rounded-lg transition-colors"
                        disabled={loading}
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Form - Scrollable */}
                <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto flex-1">
                    {/* Image Section */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">Property Images</label>
                        <p className="text-xs text-gray-600 mb-4">Upload up to 10 images (Max 10MB each)</p>

                        <div className="grid grid-cols-3 gap-4">
                            {/* Existing Images */}
                            {images.map((img, index) => (
                                <div key={`existing-${index}`} className="relative group">
                                    <div className="relative h-32 bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-200">
                                        <Image
                                            src={img}
                                            alt={`Property image ${index + 1}`}
                                            fill
                                            className="object-cover"
                                        />
                                        {index === 0 && (
                                            <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs font-semibold px-2 py-1 rounded shadow">
                                                Primary
                                            </div>
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => removeExistingImage(index)}
                                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            ))}

                            {/* New Image Previews */}
                            {imagePreviews.map((preview, index) => (
                                <div key={`new-${index}`} className="relative group">
                                    <div className="relative h-32 bg-gray-100 rounded-lg overflow-hidden border-2 border-green-400">
                                        <Image
                                            src={preview}
                                            alt={`New image ${index + 1}`}
                                            fill
                                            className="object-cover"
                                        />
                                        <div className="absolute top-2 left-2 bg-green-500 text-white text-xs font-semibold px-2 py-1 rounded shadow">
                                            New
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => removeNewImage(index)}
                                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            ))}

                            {/* Add Image Button */}
                            {(images.length + newImageFiles.length) < 10 && (
                                <label className="relative h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        onChange={handleImageChange}
                                        className="hidden"
                                    />
                                    <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    <span className="text-sm text-gray-600 font-medium">Add Images</span>
                                    <span className="text-xs text-gray-500 mt-1">{10 - images.length - newImageFiles.length} left</span>
                                </label>
                            )}
                        </div>
                    </div>

                    <hr className="border-gray-200" />

                    {/* Title & Location */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Title</label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title || ''}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Property title"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Location</label>
                            <input
                                type="text"
                                name="location"
                                value={formData.location || ''}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="City, Area, Country"
                                required
                            />
                        </div>
                    </div>

                    {/* Price & Type */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Price</label>
                            <div className="flex items-center">
                                <span className="text-gray-500 mr-2">$</span>
                                <input
                                    type="number"
                                    name="price"
                                    value={formData.price || ''}
                                    onChange={handleChange}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="0"
                                    required
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Property Type</label>
                            <select
                                name="propertyType"
                                value={formData.propertyType || ''}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                            >
                                <option value="">Select Type</option>
                                <option value="Apartment">Apartment</option>
                                <option value="House">House</option>
                            </select>
                        </div>
                    </div>

                    {/* Bedrooms & Bathrooms & Area */}
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Bedrooms</label>
                            <input
                                type="number"
                                name="bedrooms"
                                value={formData.bedrooms || ''}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="0"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Bathrooms</label>
                            <input
                                type="number"
                                name="bathrooms"
                                value={formData.bathrooms || ''}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="0"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Area (sqm)</label>
                            <input
                                type="number"
                                name="area"
                                value={formData.area || ''}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="0"
                            />
                        </div>
                    </div>

                    {/* Furnished Checkbox */}
                    <div className="flex items-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <input
                            type="checkbox"
                            name="furnished"
                            checked={formData.furnished || false}
                            onChange={handleChange}
                            className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                        />
                        <label className="ml-3 text-sm font-semibold text-gray-700">This property is furnished</label>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                        <textarea
                            name="description"
                            value={formData.description || ''}
                            onChange={handleChange}
                            rows={4}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                            placeholder="Describe your property..."
                        />
                    </div>

                    {/* Available Dates */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Available From</label>
                            <input
                                type="date"
                                name="availableFrom"
                                value={formData.availableFrom || ''}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Available To</label>
                            <input
                                type="date"
                                name="availableTo"
                                value={formData.availableTo || ''}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>
                </form>

                {/* Footer */}
                <div className="bg-gray-50 border-t border-gray-200 p-6 flex gap-3 rounded-b-2xl flex-shrink-0">
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="flex-1 px-6 py-3 text-gray-700 bg-white border-2 border-gray-300 hover:bg-gray-100 rounded-lg font-semibold transition-colors disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="flex-1 px-6 py-3 text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (newImageFiles.length > 0 ? 'Uploading images...' : 'Saving changes...') : 'Save Changes'}
                    </button>
                </div>
            </div>
        </div>
    );
}

// Property detail modal component
function PropertyModal({ property, isOpen, onClose }: { property: ApiProperty | null; isOpen: boolean; onClose: () => void }) {
    if (!isOpen || !property) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-900">{property.title}</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Image */}
                    {property.images && property.images.length > 0 && (
                        <div className="relative w-full h-64 rounded-lg overflow-hidden bg-gray-100">
                            <Image
                                src={property.images[0]}
                                alt={property.title}
                                fill
                                className="object-cover"
                            />
                        </div>
                    )}

                    {/* Info Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-semibold text-gray-500 uppercase">Location</label>
                            <p className="text-gray-900 font-medium">{property.location}</p>
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-gray-500 uppercase">Price</label>
                            <p className="text-2xl font-bold text-blue-600">${property.price}</p>
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-gray-500 uppercase">Type</label>
                            <p className="text-gray-900 font-medium">{property.type}</p>
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-gray-500 uppercase">Status</label>
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${property.status === 'approved' ? 'bg-green-100 text-green-800' :
                                property.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                    property.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                        'bg-gray-100 text-gray-800'
                                }`}>
                                {property.status.charAt(0).toUpperCase() + property.status.slice(1)}
                            </span>
                        </div>
                    </div>

                    {/* Amenities */}
                    <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase block mb-3">Amenities</label>
                        <div className="grid grid-cols-2 gap-3">
                            {property.bedrooms && <div className="flex items-center text-gray-700 text-sm"><span className="font-semibold mr-2">🛏️</span>{property.bedrooms} Bedroom{property.bedrooms > 1 ? 's' : ''}</div>}
                            {property.bathrooms && <div className="flex items-center text-gray-700 text-sm"><span className="font-semibold mr-2">🚿</span>{property.bathrooms} Bathroom{property.bathrooms > 1 ? 's' : ''}</div>}
                            {property.area && <div className="flex items-center text-gray-700 text-sm"><span className="font-semibold mr-2">📐</span>{property.area} sqm</div>}
                            {property.furnished && <div className="flex items-center text-gray-700 text-sm"><span className="font-semibold mr-2">🛋️</span>Furnished</div>}
                        </div>
                    </div>

                    {/* Description */}
                    {property.description && (
                        <div>
                            <label className="text-xs font-semibold text-gray-500 uppercase block mb-2">Description</label>
                            <p className="text-gray-700 text-sm leading-relaxed">{property.description}</p>
                        </div>
                    )}

                    {/* Availability */}
                    <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                        {property.availableFrom && (
                            <div>
                                <label className="text-xs font-semibold text-gray-500 uppercase">Available From</label>
                                <p className="text-gray-900 font-medium">{new Date(property.availableFrom).toLocaleDateString()}</p>
                            </div>
                        )}
                        {property.availableTo && (
                            <div>
                                <label className="text-xs font-semibold text-gray-500 uppercase">Available To</label>
                                <p className="text-gray-900 font-medium">{new Date(property.availableTo).toLocaleDateString()}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-4">
                    <button
                        onClick={onClose}
                        className="w-full px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg font-medium transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function MyListingsPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [properties, setProperties] = useState<ApiProperty[]>([]);
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [error, setError] = useState<string | null>(null);
    const [selectedProperty, setSelectedProperty] = useState<ApiProperty | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [selectedEditProperty, setSelectedEditProperty] = useState<ApiProperty | null>(null);
    const [showEditModal, setShowEditModal] = useState(false);

    useEffect(() => {
        // Check if user is logged in and has appropriate role
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        if (!token) {
            router.push('/routes/login');
            return;
        }

        const user = localStorage.getItem('user') || sessionStorage.getItem('user');
        if (user) {
            try {
                const userData = JSON.parse(user);
                // Only landlords and agents can have listings
                if (userData.userType !== 'agent' && userData.userType !== 'landlord') {
                    router.push('/');
                    return;
                }
            } catch (e) {
                console.error('Failed to parse user data:', e);
            }
        }

        fetchProperties();
    }, [router]);

    const fetchProperties = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await propertiesApi.getMyProperties();
            setProperties(response.data || []);
        } catch (err) {
            console.error('Failed to fetch properties:', err);
            setError('Failed to load your listings. Please try again later.');
            setProperties([]);
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            pending: 'bg-yellow-100 text-yellow-800',
            approved: 'bg-green-100 text-green-800',
            rejected: 'bg-red-100 text-red-800',
            archived: 'bg-gray-100 text-gray-800',
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    const filteredProperties = statusFilter === 'all'
        ? properties
        : properties.filter(p => p.status === statusFilter);

    const handleView = (property: ApiProperty) => {
        setSelectedProperty(property);
        setShowModal(true);
    };

    const handleEdit = (property: ApiProperty) => {
        setSelectedEditProperty(property);
        setShowEditModal(true);
    };

    const handleSaveProperty = async (submitData: Record<string, any>) => {
        if (!selectedEditProperty?._id) return;

        try {
            // Remove images if they're base64 (not uploaded to server yet)
            // Only send images if they're different from the original
            if (submitData.images && submitData.images.length > 0) {
                const hasBase64 = submitData.images.some((img: string) => img.startsWith('data:'));
                if (hasBase64) {
                    console.warn('Cannot save base64 images directly. Images must be uploaded via file upload.');
                    // Remove base64 images from submission for now
                    delete submitData.images;
                }
            }

            console.log('Final submit data:', submitData);

            // Call API to update property
            const response = await propertiesApi.update(selectedEditProperty._id, submitData);
            console.log('Update response:', response);

            // Update local state
            setProperties(properties.map(p =>
                p._id === selectedEditProperty._id
                    ? { ...p, ...submitData }
                    : p
            ));

            setShowEditModal(false);
            setSelectedEditProperty(null);
        } catch (err: any) {
            console.error('Failed to update property:', err);
            const errorMessage = err?.response?.data?.message || err?.message || 'Failed to save property. Please try again.';
            alert(errorMessage);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading your listings...</p>
                </div>
            </div>
        );
    }

    const stats = {
        total: properties.length,
        approved: properties.filter(p => p.status === 'approved').length,
        pending: properties.filter(p => p.status === 'pending').length,
        rejected: properties.filter(p => p.status === 'rejected').length,
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header with Stats */}
                <div className="mb-10">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
                        <div>
                            <h1 className="text-4xl font-bold text-gray-900 mb-2">My Listings</h1>
                            <p className="text-lg text-gray-600">Manage and track your property portfolio</p>
                        </div>
                        <button
                            onClick={() => router.push('/routes/property/new')}
                            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Add New Listing
                        </button>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-white rounded-xl p-5 shadow-md border border-gray-100">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600 mb-1">Total Properties</p>
                                    <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                                </div>
                                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl p-5 shadow-md border border-gray-100">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600 mb-1">Live</p>
                                    <p className="text-3xl font-bold text-green-600">{stats.approved}</p>
                                </div>
                                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl p-5 shadow-md border border-gray-100">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600 mb-1">Pending Review</p>
                                    <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
                                </div>
                                <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                                    <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl p-5 shadow-md border border-gray-100">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600 mb-1">Rejected</p>
                                    <p className="text-3xl font-bold text-red-600">{stats.rejected}</p>
                                </div>
                                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="mb-6 p-5 bg-red-50 border-l-4 border-red-500 rounded-lg shadow-sm">
                        <div className="flex items-center">
                            <svg className="w-5 h-5 text-red-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-red-700 font-medium">{error}</p>
                        </div>
                    </div>
                )}

                {/* Filter Tabs */}
                <div className="mb-8 bg-white rounded-xl shadow-md p-2 inline-flex gap-2">
                    {['all', 'pending', 'approved', 'rejected', 'archived'].map((status) => {
                        const count = status === 'all'
                            ? properties.length
                            : properties.filter(p => p.status === status).length;

                        return (
                            <button
                                key={status}
                                onClick={() => setStatusFilter(status)}
                                className={`px-5 py-2.5 font-semibold text-sm rounded-lg whitespace-nowrap transition-all duration-200 ${
                                    statusFilter === status
                                        ? 'bg-blue-600 text-white shadow-md'
                                        : 'text-gray-600 hover:bg-gray-100'
                                }`}
                            >
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-bold ${
                                    statusFilter === status
                                        ? 'bg-blue-500 text-white'
                                        : 'bg-gray-200 text-gray-700'
                                }`}>
                                    {count}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* Properties Grid */}
                {filteredProperties.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-lg p-16 text-center">
                        <div className="max-w-md mx-auto">
                            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">
                                {statusFilter === 'all' ? 'No listings yet' : `No ${statusFilter} listings`}
                            </h3>
                            <p className="text-gray-600 mb-8">
                                {statusFilter === 'all'
                                    ? 'Start building your property portfolio by creating your first listing'
                                    : `You don't have any ${statusFilter} properties at the moment`
                                }
                            </p>
                            {statusFilter === 'all' && (
                                <button
                                    onClick={() => router.push('/routes/property/new')}
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all duration-200"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    Create Your First Listing
                                </button>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredProperties.map((property) => (
                            <div
                                key={property._id}
                                className="bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden group cursor-pointer border border-gray-100"
                            >
                                {/* Image */}
                                <div className="relative h-56 bg-gradient-to-br from-gray-200 to-gray-300 overflow-hidden">
                                    {property.images && property.images.length > 0 ? (
                                        <Image
                                            src={property.images[0]}
                                            alt={property.title}
                                            fill
                                            className="object-cover group-hover:scale-110 transition-transform duration-500"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                    )}
                                    {/* Status Badge - Floating */}
                                    <div className="absolute top-4 right-4">
                                        <span className={`px-3 py-1.5 rounded-full text-xs font-bold shadow-lg backdrop-blur-sm ${getStatusColor(property.status)}`}>
                                            {property.status.charAt(0).toUpperCase() + property.status.slice(1)}
                                        </span>
                                    </div>
                                    {/* Image count badge */}
                                    {property.images && property.images.length > 1 && (
                                        <div className="absolute bottom-4 left-4 bg-black bg-opacity-60 text-white px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm">
                                            <svg className="w-3 h-3 inline mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                                            </svg>
                                            {property.images.length}
                                        </div>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="p-5">
                                    <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 min-h-[3.5rem]">
                                        {property.title}
                                    </h3>

                                    <div className="flex items-center text-sm text-gray-600 mb-4">
                                        <svg className="w-4 h-4 mr-1.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        <span className="line-clamp-1">{property.location}</span>
                                    </div>

                                    {/* Amenities */}
                                    <div className="flex flex-wrap gap-3 mb-4 pb-4 border-b border-gray-100">
                                        {property.bedrooms && (
                                            <div className="flex items-center text-sm text-gray-700">
                                                <span className="text-base mr-1.5">🛏️</span>
                                                <span className="font-medium">{property.bedrooms} bed{property.bedrooms > 1 ? 's' : ''}</span>
                                            </div>
                                        )}
                                        {property.bathrooms && (
                                            <div className="flex items-center text-sm text-gray-700">
                                                <span className="text-base mr-1.5">🚿</span>
                                                <span className="font-medium">{property.bathrooms} bath{property.bathrooms > 1 ? 's' : ''}</span>
                                            </div>
                                        )}
                                        {property.area && (
                                            <div className="flex items-center text-sm text-gray-700">
                                                <span className="text-base mr-1.5">📐</span>
                                                <span className="font-medium">{property.area} sqm</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Price */}
                                    <div className="mb-5">
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-2xl font-bold text-gray-900">${property.price}</span>
                                            <span className="text-sm text-gray-500 font-medium">/month</span>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => handleView(property)}
                                            className="flex-1 px-4 py-2.5 text-sm font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors duration-200"
                                        >
                                            View Details
                                        </button>
                                        <button
                                            onClick={() => handleEdit(property)}
                                            className="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors duration-200"
                                        >
                                            Edit
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Property Modal */}
            <PropertyModal
                property={selectedProperty}
                isOpen={showModal}
                onClose={() => setShowModal(false)}
            />

            {/* Edit Property Modal */}
            <EditPropertyModal
                property={selectedEditProperty}
                isOpen={showEditModal}
                onClose={() => setShowEditModal(false)}
                onSave={handleSaveProperty}
            />
        </div>
    );
}
