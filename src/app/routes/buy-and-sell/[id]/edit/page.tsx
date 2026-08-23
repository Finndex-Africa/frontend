'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import { buySellApi } from '@/services/api';
import { mediaApi } from '@/services/api/media.api';
import { showToast } from '@/lib/toast';
import { getUserFriendlyErrorMessage } from '@/lib/error-messages';
import { geocodeAddress } from '@/lib/google-maps';
import { isAgentLikeUserType } from '@/lib/agent-user-types';
import type {
    BuySellCategory,
    BuySellListing,
    LandSubcategory,
    HouseholdItemSubcategory,
    LandUnit,
    ItemCondition,
} from '@/types/buy-sell';

// ─── Constants ─────────────────────────────────────────────────────────────
const AMENITY_OPTIONS = [
    { value: 'Water', icon: '💧' },
    { value: 'Electricity', icon: '⚡' },
    { value: 'WiFi', icon: '📶' },
    { value: 'Parking', icon: '🚗' },
    { value: 'Security', icon: '🔒' },
    { value: 'Swimming Pool', icon: '🏊' },
    { value: 'Gym', icon: '💪' },
    { value: 'Living Room', icon: '🛋️' },
    { value: 'Porch', icon: '🌿' },
    { value: 'Air Conditioning', icon: '❄️' },
    { value: 'Dining Room', icon: '🍽️' },
    { value: 'Laundry', icon: '🧺' },
    { value: 'Kitchen', icon: '🍳' },
    { value: 'Generator', icon: '⚙️' },
    { value: 'CCTV', icon: '📹' },
    { value: 'Gate', icon: '🚪' },
] as const;

const CATEGORY_LABEL: Record<BuySellCategory, string> = {
    land: 'Land',
    house: 'House',
    household_item: 'Household Item',
};

const CATEGORY_ICON: Record<BuySellCategory, string> = {
    land: '🏞️',
    house: '🏠',
    household_item: '📦',
};

const inputCls = 'w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent';

export default function EditBuySellPage() {
    const router = useRouter();
    const params = useParams();
    const listingId = params?.id as string;

    // Page state
    const [fetchLoading, setFetchLoading] = useState(true);
    const [fetchError, setFetchError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    // Listing meta
    const [category, setCategory] = useState<BuySellCategory | null>(null);

    // ── Land form state ────────────────────────────────────────────────────
    const [landData, setLandData] = useState({
        title: '', description: '', price: '', location: '',
        landSize: '', unit: 'acres' as LandUnit,
        landSubcategory: '' as LandSubcategory | '',
        ownershipStatus: '', sellerPhone: '', whatsappNumber: '',
    });

    // ── House form state ───────────────────────────────────────────────────
    const [houseData, setHouseData] = useState({
        title: '', description: '', price: '', location: '',
        bedrooms: '', bathrooms: '', propertyType: '',
    });
    const [amenities, setAmenities] = useState<string[]>([]);

    // ── Item form state ────────────────────────────────────────────────────
    const [itemData, setItemData] = useState({
        title: '', description: '', price: '', location: '',
        itemSubcategory: 'furniture' as HouseholdItemSubcategory,
        condition: 'fairly_used' as ItemCondition,
        warranty: false, deliveryAvailable: false,
    });

    // ── Image state: existing URLs + new file uploads ──────────────────────
    const [existingImages, setExistingImages] = useState<string[]>([]); // URLs kept from original
    const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
    const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);

    // ── Agent fee ──────────────────────────────────────────────────────────
    const [canSetAgentFee, setCanSetAgentFee] = useState(false);
    const [agentFee, setAgentFee] = useState('');

    // ── Auth guard ─────────────────────────────────────────────────────────
    useEffect(() => {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        if (!token) { router.push('/routes/login'); return; }
        const user = localStorage.getItem('user') || sessionStorage.getItem('user');
        if (user) {
            try {
                const userData = JSON.parse(user);
                setCanSetAgentFee(isAgentLikeUserType(userData.userType || userData.role));
            } catch { /* ignore */ }
        }
    }, [router]);

    // ── Fetch listing and populate form ───────────────────────────────────
    const populateForm = useCallback((listing: BuySellListing) => {
        setCategory(listing.category);
        setExistingImages(listing.images ?? []);
        if ((listing as any).agentFee != null) setAgentFee(String((listing as any).agentFee));

        if (listing.category === 'land') {
            setLandData({
                title: listing.title ?? '',
                description: listing.description ?? '',
                price: listing.price?.toString() ?? '',
                location: listing.location ?? '',
                landSize: listing.landSize?.toString() ?? '',
                unit: (listing.unit as LandUnit) ?? 'acres',
                landSubcategory: (listing.landSubcategory as LandSubcategory | '') ?? '',
                ownershipStatus: listing.ownershipStatus ?? '',
                sellerPhone: listing.sellerPhone ?? '',
                whatsappNumber: listing.whatsappNumber ?? '',
            });
        } else if (listing.category === 'house') {
            setHouseData({
                title: listing.title ?? '',
                description: listing.description ?? '',
                price: listing.price?.toString() ?? '',
                location: listing.location ?? '',
                bedrooms: listing.bedrooms?.toString() ?? '',
                bathrooms: listing.bathrooms?.toString() ?? '',
                propertyType: listing.propertyType ?? '',
            });
            // Restore amenities
            const savedAmenities = (listing.amenities ?? []).map((a: { label: string }) => a.label);
            setAmenities(savedAmenities);
        } else if (listing.category === 'household_item') {
            setItemData({
                title: listing.title ?? '',
                description: listing.description ?? '',
                price: listing.price?.toString() ?? '',
                location: listing.location ?? '',
                itemSubcategory: (listing.itemSubcategory as HouseholdItemSubcategory) ?? 'furniture',
                condition: (listing.condition as ItemCondition) ?? 'fairly_used',
                warranty: listing.warranty ?? false,
                deliveryAvailable: listing.deliveryAvailable ?? false,
            });
        }
    }, []);

    useEffect(() => {
        if (!listingId) return;
        setFetchLoading(true);
        setFetchError(null);
        buySellApi.getById(listingId)
            .then(res => {
                const listing = res.data ?? (res as unknown as BuySellListing);
                if (!listing) throw new Error('Listing not found');
                populateForm(listing);
            })
            .catch(err => {
                setFetchError(getUserFriendlyErrorMessage(err, 'Failed to load listing.'));
            })
            .finally(() => setFetchLoading(false));
    }, [listingId, populateForm]);

    // ── Image handlers ─────────────────────────────────────────────────────
    const handleNewImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        const totalAfter = existingImages.length + newImageFiles.length + files.length;
        if (totalAfter > 10) {
            showToast.warning('You can upload a maximum of 10 images total.');
            return;
        }
        setNewImageFiles(prev => [...prev, ...files]);
        files.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => setNewImagePreviews(prev => [...prev, reader.result as string]);
            reader.readAsDataURL(file);
        });
    };

    const removeExistingImage = (index: number) => {
        setExistingImages(prev => prev.filter((_, i) => i !== index));
    };

    const removeNewImage = (index: number) => {
        setNewImageFiles(prev => prev.filter((_, i) => i !== index));
        setNewImagePreviews(prev => prev.filter((_, i) => i !== index));
    };

    const toggleAmenity = (amenity: string) => {
        setAmenities(prev =>
            prev.includes(amenity) ? prev.filter(a => a !== amenity) : [...prev, amenity],
        );
    };

    // ── Submit ─────────────────────────────────────────────────────────────
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!category || !listingId) return;

        const totalImages = existingImages.length + newImageFiles.length;
        if (totalImages < 1) {
            showToast.error('Please keep at least 1 image on the listing.');
            return;
        }

        setSaving(true);
        setFormError(null);

        try {
            // Upload only new files
            let newUrls: string[] = [];
            if (newImageFiles.length > 0) {
                const uploaded = await Promise.all(
                    newImageFiles.map(file => mediaApi.upload(file, 'buy-sell')),
                );
                newUrls = uploaded.map(r => r.url);
            }

            const allImages = [...existingImages, ...newUrls];

            // Build payload as Record to avoid TS union narrowing on UpdateBuySellDto
            let updatePayload: Record<string, unknown> = {};

            if (category === 'land') {
                if (!landData.landSize || !landData.ownershipStatus || !landData.sellerPhone) {
                    showToast.error('Please fill in all required land fields.');
                    setSaving(false);
                    return;
                }
                const mapCoordinates = await geocodeAddress(landData.location);
                updatePayload = {
                    title: landData.title,
                    description: landData.description,
                    price: Number(landData.price),
                    location: landData.location,
                    images: allImages,
                    landSize: Number(landData.landSize),
                    unit: landData.unit,
                    ownershipStatus: landData.ownershipStatus,
                    sellerPhone: landData.sellerPhone,
                    ...(landData.landSubcategory ? { landSubcategory: landData.landSubcategory } : {}),
                    ...(landData.whatsappNumber ? { whatsappNumber: landData.whatsappNumber } : {}),
                    ...(mapCoordinates ? { mapCoordinates } : {}),
                    ...(canSetAgentFee && agentFee ? { agentFee: Number(agentFee) } : {}),
                };
            } else if (category === 'house') {
                if (!houseData.bedrooms || !houseData.bathrooms || !houseData.propertyType) {
                    showToast.error('Please fill in all required house fields.');
                    setSaving(false);
                    return;
                }
                const mapCoordinates = await geocodeAddress(houseData.location);
                const amenitiesPayload = amenities.map(label => {
                    const opt = AMENITY_OPTIONS.find(a => a.value === label);
                    return { icon: opt?.icon ?? '•', label };
                });
                updatePayload = {
                    title: houseData.title,
                    description: houseData.description,
                    price: Number(houseData.price),
                    location: houseData.location,
                    images: allImages,
                    bedrooms: Number(houseData.bedrooms),
                    bathrooms: Number(houseData.bathrooms),
                    propertyType: houseData.propertyType,
                    amenities: amenitiesPayload,
                    ...(mapCoordinates ? { mapCoordinates } : {}),
                    ...(canSetAgentFee && agentFee ? { agentFee: Number(agentFee) } : {}),
                };
            } else if (category === 'household_item') {
                const mapCoordinates = await geocodeAddress(itemData.location);
                updatePayload = {
                    title: itemData.title,
                    description: itemData.description,
                    price: Number(itemData.price),
                    location: itemData.location,
                    images: allImages,
                    itemSubcategory: itemData.itemSubcategory,
                    condition: itemData.condition,
                    warranty: itemData.warranty,
                    deliveryAvailable: itemData.deliveryAvailable,
                    ...(mapCoordinates ? { mapCoordinates } : {}),
                };
            }

            if (Object.keys(updatePayload).length > 0) {
                await buySellApi.update(listingId, updatePayload as import('@/types/buy-sell').UpdateBuySellDto);
            }

            showToast.success('Listing updated! Changes will be reviewed before going live.');
            router.push('/routes/my-listings');
        } catch (error: unknown) {
            const msg = getUserFriendlyErrorMessage(error, 'Failed to update listing. Please try again.');
            setFormError(msg);
            showToast.error(msg);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } finally {
            setSaving(false);
        }
    };

    // ── Agent fee section ──────────────────────────────────────────────────
    const AgentFeeSection = () => canSetAgentFee ? (
        <div className="mb-8 p-6 bg-amber-50 border border-amber-200 rounded-xl">
            <h2 className="text-lg font-semibold text-amber-800 mb-1 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Agent Fee (Optional)
            </h2>
            <p className="text-sm text-amber-700 mb-4">As an agent or real estate agency, you can set an access fee for this listing.</p>
            <div className="relative max-w-xs">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">$</span>
                <input
                    type="number"
                    value={agentFee}
                    onChange={e => setAgentFee(e.target.value)}
                    min={0}
                    placeholder="e.g. 500"
                    className="w-full pl-7 pr-4 py-3 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent bg-white"
                />
            </div>
        </div>
    ) : null;

    // ── Image section (shared between all categories) ──────────────────────
    const ImageSection = () => {
        const totalImages = existingImages.length + newImageFiles.length;
        return (
            <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-1">Images</h2>
                <p className="text-sm text-gray-500 mb-4">
                    {totalImages} / 10 images &mdash; Remove existing ones or add new ones (max 10MB each)
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    {/* Existing images */}
                    {existingImages.map((url, index) => (
                        <div key={`existing-${index}`} className="relative group h-32">
                            <Image src={url} alt={`Image ${index + 1}`} fill className="object-cover rounded-lg" />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 rounded-lg transition-colors" />
                            <button
                                type="button"
                                onClick={() => removeExistingImage(index)}
                                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                            <span className="absolute bottom-1 left-1 bg-black/50 text-white text-[10px] px-1.5 py-0.5 rounded">
                                Saved
                            </span>
                        </div>
                    ))}

                    {/* New image previews */}
                    {newImagePreviews.map((preview, index) => (
                        <div key={`new-${index}`} className="relative group h-32">
                            <Image src={preview} alt={`New ${index + 1}`} fill className="object-cover rounded-lg" />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 rounded-lg transition-colors" />
                            <button
                                type="button"
                                onClick={() => removeNewImage(index)}
                                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                            <span className="absolute bottom-1 left-1 bg-blue-500/80 text-white text-[10px] px-1.5 py-0.5 rounded">
                                New
                            </span>
                        </div>
                    ))}

                    {/* Add more */}
                    {totalImages < 10 && (
                        <label className="border-2 border-dashed border-gray-300 rounded-lg h-32 flex items-center justify-center cursor-pointer hover:border-blue-500 transition-colors">
                            <input type="file" accept="image/*" multiple onChange={handleNewImageChange} className="hidden" />
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
        );
    };

    const SubmitRow = () => (
        <div className="flex items-center gap-4 pt-6 border-t border-gray-200">
            <button
                type="submit"
                disabled={saving}
                className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
            >
                {saving && (
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                )}
                {saving ? 'Saving…' : 'Save Changes'}
            </button>
            <button
                type="button"
                onClick={() => router.back()}
                disabled={saving}
                className="px-8 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
                Cancel
            </button>
        </div>
    );

    // ── Loading state ──────────────────────────────────────────────────────
    if (fetchLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <svg className="animate-spin h-10 w-10 text-blue-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <p className="text-gray-500">Loading listing…</p>
                </div>
            </div>
        );
    }

    if (fetchError || !category) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="text-center max-w-sm">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center text-3xl">⚠️</div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Could not load listing</h2>
                    <p className="text-gray-500 mb-6">{fetchError ?? 'This listing does not exist or you do not have permission to edit it.'}</p>
                    <button
                        onClick={() => router.push('/routes/my-listings')}
                        className="px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Back to My Listings
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container-app px-4 max-w-4xl mx-auto">

                {/* Page header */}
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
                    <h1 className="text-4xl font-bold text-gray-900">Edit Listing</h1>
                    <p className="mt-2 text-gray-600">Update your listing details below</p>
                </div>

                {/* Category badge (locked) */}
                <div className="bg-white rounded-lg shadow-sm p-5 mb-6 flex items-center gap-3">
                    <span className="text-3xl">{CATEGORY_ICON[category]}</span>
                    <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Category</p>
                        <p className="text-lg font-bold text-gray-900">{CATEGORY_LABEL[category]}</p>
                    </div>
                    <span className="ml-auto text-xs bg-gray-100 text-gray-500 px-3 py-1.5 rounded-full font-medium">Cannot be changed</span>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-8">

                    {/* Error banner */}
                    {formError && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                            <svg className="w-5 h-5 text-red-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div className="flex-1">
                                <p className="text-sm font-semibold text-red-800 mb-0.5">Unable to save changes</p>
                                <p className="text-sm text-red-700">{formError}</p>
                            </div>
                            <button type="button" onClick={() => setFormError(null)} className="text-red-400 hover:text-red-600 p-0.5">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    )}

                    {/* ══ LAND ══ */}
                    {category === 'land' && (
                        <>
                            <div className="mb-8">
                                <h2 className="text-xl font-semibold text-gray-900 mb-4">Land Details</h2>
                                <div className="space-y-4">

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Title <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text" required
                                            value={landData.title}
                                            onChange={e => setLandData(p => ({ ...p, title: e.target.value }))}
                                            className={inputCls}
                                            placeholder="e.g., Prime Residential Land in Monrovia"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Description <span className="text-red-500">*</span>
                                        </label>
                                        <textarea
                                            required rows={4}
                                            value={landData.description}
                                            onChange={e => setLandData(p => ({ ...p, description: e.target.value }))}
                                            className={inputCls}
                                            placeholder="Describe the land, surroundings, access roads..."
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Price (USD) <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="number" required min="0"
                                                value={landData.price}
                                                onChange={e => setLandData(p => ({ ...p, price: e.target.value }))}
                                                className={inputCls}
                                                placeholder="e.g., 25000"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Location <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text" required
                                                value={landData.location}
                                                onChange={e => setLandData(p => ({ ...p, location: e.target.value }))}
                                                className={inputCls}
                                                placeholder="e.g., Old Road, Monrovia"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Land Size <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="number" required min="0"
                                                value={landData.landSize}
                                                onChange={e => setLandData(p => ({ ...p, landSize: e.target.value }))}
                                                className={inputCls}
                                                placeholder="e.g., 5"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Unit <span className="text-red-500">*</span>
                                            </label>
                                            <select
                                                required
                                                value={landData.unit}
                                                onChange={e => setLandData(p => ({ ...p, unit: e.target.value as LandUnit }))}
                                                className={inputCls}
                                            >
                                                <option value="acres">Acres</option>
                                                <option value="lots">Lots</option>
                                                <option value="square_feet">Square Feet</option>
                                                <option value="square_meters">Square Meters</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Subcategory</label>
                                            <select
                                                value={landData.landSubcategory}
                                                onChange={e => setLandData(p => ({ ...p, landSubcategory: e.target.value as LandSubcategory | '' }))}
                                                className={inputCls}
                                            >
                                                <option value="">Select (optional)</option>
                                                <option value="residential">Residential</option>
                                                <option value="commercial">Commercial</option>
                                                <option value="beach">Beach</option>
                                                <option value="farm">Farm</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Ownership Status <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text" required
                                            value={landData.ownershipStatus}
                                            onChange={e => setLandData(p => ({ ...p, ownershipStatus: e.target.value }))}
                                            className={inputCls}
                                            placeholder="e.g., C of O, Survey Plan, Deed of Assignment"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Seller Phone <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="tel" required
                                                value={landData.sellerPhone}
                                                onChange={e => setLandData(p => ({ ...p, sellerPhone: e.target.value }))}
                                                className={inputCls}
                                                placeholder="e.g., +231 886 149 219"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">WhatsApp Number</label>
                                            <input
                                                type="tel"
                                                value={landData.whatsappNumber}
                                                onChange={e => setLandData(p => ({ ...p, whatsappNumber: e.target.value }))}
                                                className={inputCls}
                                                placeholder="e.g., +231 886 149 219"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <AgentFeeSection />
                            <ImageSection />
                            <SubmitRow />
                        </>
                    )}

                    {/* ══ HOUSE ══ */}
                    {category === 'house' && (
                        <>
                            <div className="mb-8">
                                <h2 className="text-xl font-semibold text-gray-900 mb-4">House Details</h2>
                                <div className="space-y-4">

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Title <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text" required
                                            value={houseData.title}
                                            onChange={e => setHouseData(p => ({ ...p, title: e.target.value }))}
                                            className={inputCls}
                                            placeholder="e.g., Modern 4-Bedroom Duplex for Sale"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Description <span className="text-red-500">*</span>
                                        </label>
                                        <textarea
                                            required rows={4}
                                            value={houseData.description}
                                            onChange={e => setHouseData(p => ({ ...p, description: e.target.value }))}
                                            className={inputCls}
                                            placeholder="Describe the property, features, and surroundings..."
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Price (USD) <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="number" required min="0"
                                                value={houseData.price}
                                                onChange={e => setHouseData(p => ({ ...p, price: e.target.value }))}
                                                className={inputCls}
                                                placeholder="e.g., 120000"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Location <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text" required
                                                value={houseData.location}
                                                onChange={e => setHouseData(p => ({ ...p, location: e.target.value }))}
                                                className={inputCls}
                                                placeholder="e.g., Sinkor, Monrovia"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Bedrooms <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="number" required min="0"
                                                value={houseData.bedrooms}
                                                onChange={e => setHouseData(p => ({ ...p, bedrooms: e.target.value }))}
                                                className={inputCls}
                                                placeholder="e.g., 4"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Bathrooms <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="number" required min="0"
                                                value={houseData.bathrooms}
                                                onChange={e => setHouseData(p => ({ ...p, bathrooms: e.target.value }))}
                                                className={inputCls}
                                                placeholder="e.g., 3"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Property Type <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text" required
                                                value={houseData.propertyType}
                                                onChange={e => setHouseData(p => ({ ...p, propertyType: e.target.value }))}
                                                className={inputCls}
                                                placeholder="e.g., Duplex, Bungalow"
                                            />
                                        </div>
                                    </div>

                                </div>
                            </div>

                            {/* Amenities */}
                            <div className="mb-8">
                                <h2 className="text-xl font-semibold text-gray-900 mb-4">Amenities</h2>
                                <p className="text-sm text-gray-600 mb-4">Select the amenities available in this property</p>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                    {AMENITY_OPTIONS.map(amenity => (
                                        <button
                                            key={amenity.value}
                                            type="button"
                                            onClick={() => toggleAmenity(amenity.value)}
                                            className={`
                                                px-4 py-3 rounded-lg border-2 transition-all text-left flex items-center gap-2
                                                ${amenities.includes(amenity.value)
                                                    ? 'border-[#ffcc00] bg-[#ffcc00]/15 text-gray-900'
                                                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                                                }
                                            `}
                                        >
                                            <span className="text-xl">{amenity.icon}</span>
                                            <span className="text-sm font-medium">{amenity.value}</span>
                                            {amenities.includes(amenity.value) && (
                                                <svg className="w-5 h-5 ml-auto text-[#ffcc00]" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <AgentFeeSection />
                            <ImageSection />
                            <SubmitRow />
                        </>
                    )}

                    {/* ══ HOUSEHOLD ITEM ══ */}
                    {category === 'household_item' && (
                        <>
                            <div className="mb-8">
                                <h2 className="text-xl font-semibold text-gray-900 mb-4">Item Details</h2>
                                <div className="space-y-4">

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Item Name <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text" required
                                            value={itemData.title}
                                            onChange={e => setItemData(p => ({ ...p, title: e.target.value }))}
                                            className={inputCls}
                                            placeholder="e.g., Leather Sofa Set"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Category <span className="text-red-500">*</span>
                                            </label>
                                            <select
                                                required
                                                value={itemData.itemSubcategory}
                                                onChange={e => setItemData(p => ({ ...p, itemSubcategory: e.target.value as HouseholdItemSubcategory }))}
                                                className={inputCls}
                                            >
                                                <option value="furniture">Furniture</option>
                                                <option value="electronics">Electronics</option>
                                                <option value="kitchen_item">Kitchen Item</option>
                                                <option value="office_equipment">Office Equipment</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Condition <span className="text-red-500">*</span>
                                            </label>
                                            <div className="flex gap-3 pt-1">
                                                {(['fairly_used', 'new'] as ItemCondition[]).map(cond => (
                                                    <button
                                                        key={cond}
                                                        type="button"
                                                        onClick={() => setItemData(p => ({ ...p, condition: cond }))}
                                                        className={`
                                                            flex-1 py-3 px-4 rounded-lg border-2 text-sm font-medium transition-all
                                                            ${itemData.condition === cond
                                                                ? 'border-blue-600 bg-blue-50 text-blue-700'
                                                                : 'border-gray-200 text-gray-700 hover:border-gray-300'
                                                            }
                                                        `}
                                                    >
                                                        {cond === 'new' ? 'New' : 'Fairly Used'}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Price (USD) <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="number" required min="0"
                                                value={itemData.price}
                                                onChange={e => setItemData(p => ({ ...p, price: e.target.value }))}
                                                className={inputCls}
                                                placeholder="e.g., 350"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Location <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text" required
                                                value={itemData.location}
                                                onChange={e => setItemData(p => ({ ...p, location: e.target.value }))}
                                                className={inputCls}
                                                placeholder="e.g., Congo Town, Monrovia"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Description <span className="text-red-500">*</span>
                                        </label>
                                        <textarea
                                            required rows={4}
                                            value={itemData.description}
                                            onChange={e => setItemData(p => ({ ...p, description: e.target.value }))}
                                            className={inputCls}
                                            placeholder="Describe the item, its condition, any defects..."
                                        />
                                    </div>

                                    <div className="flex flex-col sm:flex-row gap-4">
                                        <label className="flex items-center gap-3 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={itemData.warranty}
                                                onChange={e => setItemData(p => ({ ...p, warranty: e.target.checked }))}
                                                className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                            />
                                            <span className="text-sm font-medium text-gray-700">Warranty included</span>
                                        </label>
                                        <label className="flex items-center gap-3 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={itemData.deliveryAvailable}
                                                onChange={e => setItemData(p => ({ ...p, deliveryAvailable: e.target.checked }))}
                                                className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                            />
                                            <span className="text-sm font-medium text-gray-700">Delivery available</span>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <AgentFeeSection />
                            <ImageSection />
                            <SubmitRow />
                        </>
                    )}
                </form>
            </div>
        </div>
    );
}
