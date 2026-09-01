'use client';

import { useTranslations } from "next-intl";
import { useState, useEffect } from 'react';

import Image from 'next/image';
import { buySellApi } from '@/services/api';
import { mediaApi } from '@/services/api/media.api';
import { MIN_PROPERTY_LISTING_IMAGES } from '@/lib/property-images';
import { showToast } from '@/lib/toast';
import { useErrorMessage } from "@/lib/error-messages";
import { geocodeAddress } from '@/lib/google-maps';
import { isAgentLikeUserType } from '@/lib/agent-user-types';
import type {
    BuySellCategory,
    LandSubcategory,
    HouseholdItemSubcategory,
    LandUnit,
    ItemCondition,
} from '@/types/buy-sell';

import { useRouter } from '@/i18n/navigation';
import CurrencySelect from "@/components/ui/CurrencySelect";
import { CURRENCY_META, DEFAULT_CURRENCY, type Currency } from "@/lib/currency/config";
// ─── Amenity options (same as property/new) ────────────────────────────────
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

// ─── Category meta ─────────────────────────────────────────────────────────
const CATEGORIES: { value: BuySellCategory; label: string; icon: string; description: string }[] = [
    { value: 'land', label: 'Land', icon: '🏞️', description: 'Residential, commercial, beach or farm land' },
    { value: 'house', label: 'House', icon: '🏠', description: 'Duplex, apartment or commercial property' },
    { value: 'household_item', label: 'Household Item', icon: '📦', description: 'Furniture, electronics, kitchen items & more' },
];

// ─── Default form states ───────────────────────────────────────────────────
const defaultLand = {
    title: '', description: '', price: '', location: '',
    landSize: '', unit: 'acres' as LandUnit,
    landSubcategory: '' as LandSubcategory | '',
    ownershipStatus: '', sellerPhone: '', whatsappNumber: '',
};

const defaultHouse = {
    title: '', description: '', price: '', location: '',
    bedrooms: '', bathrooms: '', propertyType: '',
};

const defaultItem = {
    title: '', description: '', price: '', location: '',
    itemSubcategory: 'furniture' as HouseholdItemSubcategory,
    condition: 'fairly_used' as ItemCondition,
    warranty: false, deliveryAvailable: false,
};

export default function NewBuySellPage() {
    // One currency per listing: the seller prices in a single currency and the
    // agent fee follows it, so there is nothing to reconcile at submit time.
    const [currency, setCurrency] = useState<Currency>(DEFAULT_CURRENCY);
  const t_hints = useTranslations("hints");
  const errorMessage = useErrorMessage();
  const t = useTranslations("forms");
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    // Category selection
    const [selectedCategory, setSelectedCategory] = useState<BuySellCategory | null>(null);

    // Per-category form data
    const [landData, setLandData] = useState(defaultLand);
    const [houseData, setHouseData] = useState(defaultHouse);
    const [itemData, setItemData] = useState(defaultItem);

    // House amenities
    const [amenities, setAmenities] = useState<string[]>([]);

    // Images (shared)
    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);

    // Agent fee
    const [canSetAgentFee, setCanSetAgentFee] = useState(false);
    const [agentFee, setAgentFee] = useState('');

    // Auth guard
    useEffect(() => {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        if (!token) router.push('/routes/login');
        const user = localStorage.getItem('user') || sessionStorage.getItem('user');
        if (user) {
            try {
                const userData = JSON.parse(user);
                setCanSetAgentFee(isAgentLikeUserType(userData.userType || userData.role));
            } catch { /* ignore */ }
        }
    }, [router]);

    // ── Image handlers ──────────────────────────────────────────────────────
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length + imageFiles.length > 10) {
            showToast.warning(t("maxImages"));
            return;
        }
        setImageFiles(prev => [...prev, ...files]);
        files.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => setImagePreviews(prev => [...prev, reader.result as string]);
            reader.readAsDataURL(file);
        });
    };

    const removeImage = (index: number) => {
        setImageFiles(prev => prev.filter((_, i) => i !== index));
        setImagePreviews(prev => prev.filter((_, i) => i !== index));
    };

    const toggleAmenity = (amenity: string) => {
        setAmenities(prev =>
            prev.includes(amenity) ? prev.filter(a => a !== amenity) : [...prev, amenity],
        );
    };

    // ── Category reset ──────────────────────────────────────────────────────
    const handleCategorySelect = (cat: BuySellCategory) => {
        setSelectedCategory(cat);
        setFormError(null);
        setImageFiles([]);
        setImagePreviews([]);
        setAmenities([]);
        setLandData(defaultLand);
        setHouseData(defaultHouse);
        setItemData(defaultItem);
    };

    // ── Submit ──────────────────────────────────────────────────────────────
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCategory) return;

        if (imageFiles.length < MIN_PROPERTY_LISTING_IMAGES) {
            showToast.error(`Please upload at least ${MIN_PROPERTY_LISTING_IMAGES} images before posting your listing.`);
            return;
        }

        // Agent fee is mandatory for agents / real estate agencies
        if (canSetAgentFee && !agentFee) {
            showToast.error(t("agentFeeRequiredLong"));
            return;
        }

        setLoading(true);
        setFormError(null);

        try {
            // Upload images
            let imageUrls: string[] = [];
            if (imageFiles.length > 0) {
                const uploaded = await Promise.all(
                    imageFiles.map(file => mediaApi.upload(file, 'buy-sell')),
                );
                imageUrls = uploaded.map(r => r.url);
            }

            if (selectedCategory === 'land') {
                if (!landData.landSize || !landData.ownershipStatus || !landData.sellerPhone) {
                    showToast.error(t("landFieldsRequired"));
                    setLoading(false);
                    return;
                }
                const mapCoordinates = await geocodeAddress(landData.location);
                await buySellApi.create({
                    category: 'land',
                    title: landData.title,
                    description: landData.description,
                    price: Number(landData.price),
                    currency,
                    location: landData.location,
                    images: imageUrls,
                    landSize: Number(landData.landSize),
                    unit: landData.unit,
                    ownershipStatus: landData.ownershipStatus,
                    sellerPhone: landData.sellerPhone,
                    ...(landData.landSubcategory ? { landSubcategory: landData.landSubcategory as LandSubcategory } : {}),
                    ...(landData.whatsappNumber ? { whatsappNumber: landData.whatsappNumber } : {}),
                    ...(mapCoordinates ? { mapCoordinates } : {}),
                    ...(canSetAgentFee && agentFee ? { agentFee: Number(agentFee) } : {}),
                } as any);
            } else if (selectedCategory === 'house') {
                if (!houseData.bedrooms || !houseData.bathrooms || !houseData.propertyType) {
                    showToast.error(t("houseFieldsRequired"));
                    setLoading(false);
                    return;
                }
                const mapCoordinates = await geocodeAddress(houseData.location);
                const amenitiesPayload = amenities.length > 0
                    ? amenities.map(label => {
                        const opt = AMENITY_OPTIONS.find(a => a.value === label);
                        return { icon: opt?.icon ?? '•', label };
                    })
                    : undefined;
                await buySellApi.create({
                    category: 'house',
                    title: houseData.title,
                    description: houseData.description,
                    price: Number(houseData.price),
                    currency,
                    location: houseData.location,
                    images: imageUrls,
                    bedrooms: Number(houseData.bedrooms),
                    bathrooms: Number(houseData.bathrooms),
                    propertyType: houseData.propertyType,
                    ...(amenitiesPayload ? { amenities: amenitiesPayload } : {}),
                    ...(mapCoordinates ? { mapCoordinates } : {}),
                    ...(canSetAgentFee && agentFee ? { agentFee: Number(agentFee) } : {}),
                } as any);
            } else if (selectedCategory === 'household_item') {
                const mapCoordinates = await geocodeAddress(itemData.location);
                await buySellApi.create({
                    category: 'household_item',
                    title: itemData.title,
                    description: itemData.description,
                    price: Number(itemData.price),
                    currency,
                    location: itemData.location,
                    images: imageUrls,
                    itemSubcategory: itemData.itemSubcategory,
                    condition: itemData.condition,
                    warranty: itemData.warranty,
                    deliveryAvailable: itemData.deliveryAvailable,
                    ...(mapCoordinates ? { mapCoordinates } : {}),
                    ...(canSetAgentFee && agentFee ? { agentFee: Number(agentFee) } : {}),
                } as any);
            }

            showToast.success(t("listingCreated"));
            router.push('/routes/my-listings');
        } catch (error: any) {
            console.error('Failed to create buy & sell listing:', error);
            const msg = errorMessage(error, "createListing");
            setFormError(msg);
            showToast.error(msg);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } finally {
            setLoading(false);
        }
    };

    // ── Shared: image section ───────────────────────────────────────────────
    const agentFeeJsx = canSetAgentFee ? (
        <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50/50 p-4 mb-8">
            <h3 className="text-sm font-semibold text-gray-900 mb-1">Agent Fee</h3>
            <p className="text-xs text-gray-600 mb-3">
                {t("agentFeeHelpBuyers")}
            </p>
            <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Agent Fee ({CURRENCY_META[currency].label}) <span className="text-red-500">*</span>
            </label>
            <input
                type="number"
                value={agentFee}
                onChange={e => setAgentFee(e.target.value)}
                required
                min="0"
                step="0.01"
                className="w-full max-w-xs px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={t_hints("e_g_500")}
            />
        </div>
    ) : null;

    const ImageSection = () => (
        <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Images</h2>
            <p className="text-sm text-gray-600 mb-4">
                Upload at least {MIN_PROPERTY_LISTING_IMAGES} images (required) and up to 10 (Max 10MB each)
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative group h-32">
                        <Image src={preview} alt={`Preview ${index + 1}`} fill className="object-cover rounded-lg" />
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
                        <input type="file" accept="image/*" multiple onChange={handleImageChange} className="hidden" />
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

    // ── Submit row ──────────────────────────────────────────────────────────
    const SubmitRow = () => (
        <div className="flex items-center gap-4 pt-6 border-t border-gray-200">
            <button
                type="submit"
                disabled={loading || imageFiles.length < MIN_PROPERTY_LISTING_IMAGES}
                className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
                {loading ? 'Creating...' : 'Create Listing'}
            </button>
            <button
                type="button"
                onClick={() => router.back()}
                disabled={loading}
                className="px-8 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {t("cancel")}
            </button>
        </div>
    );

    // ── Common input className ──────────────────────────────────────────────
    const inputCls = 'w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent';

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
                    <h1 className="text-4xl font-bold text-gray-900">Create Buy &amp; Sell Listing</h1>
                    <p className="mt-2 text-gray-600">List land, a house, or a household item for sale</p>
                </div>

                {/* ── Step 0: Category selection ─────────────────────────── */}
                <div className="bg-white rounded-lg shadow-sm p-8 mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">What are you selling?</h2>
                    <p className="text-sm text-gray-600 mb-6">Select a category to get started</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {CATEGORIES.map(cat => (
                            <button
                                key={cat.value}
                                type="button"
                                onClick={() => handleCategorySelect(cat.value)}
                                className={`
                                    flex flex-col items-center text-center p-6 rounded-xl border-2 transition-all
                                    ${selectedCategory === cat.value
                                        ? 'border-blue-600 bg-blue-50 shadow-sm'
                                        : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                                    }
                                `}
                            >
                                <span className="text-4xl mb-3">{cat.icon}</span>
                                <span className={`text-base font-semibold mb-1 ${selectedCategory === cat.value ? 'text-blue-700' : 'text-gray-900'}`}>
                                    {cat.label}
                                </span>
                                <span className="text-xs text-gray-500">{cat.description}</span>
                                {selectedCategory === cat.value && (
                                    <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-blue-600">
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                        {t("selected")}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* ── Step 1: Category-specific form ────────────────────── */}
                {selectedCategory && (
                    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-8">

                        {/* Error banner */}
                        {formError && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                                <svg className="w-5 h-5 text-red-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <div className="flex-1">
                                    <p className="text-sm font-semibold text-red-800 mb-0.5">Unable to create listing</p>
                                    <p className="text-sm text-red-700">{formError}</p>
                                </div>
                                <button type="button" onClick={() => setFormError(null)} className="text-red-400 hover:text-red-600 p-0.5">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        )}

                        {/* ══════════════════════════════════════════════════
                            LAND FORM
                        ══════════════════════════════════════════════════ */}
                        {selectedCategory === 'land' && (
                            <>
                                {/* Basic info */}
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
                                                placeholder={t_hints("e_g_prime_residential_land_in_monrovia")}
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
                                                placeholder={t("describeLand")}
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Price ({CURRENCY_META[currency].label}) <span className="text-red-500">*</span>
                                                </label>
                                                <div className="flex gap-2">
                                                <input
                                                    type="number" required min="0"
                                                    value={landData.price}
                                                    onChange={e => setLandData(p => ({ ...p, price: e.target.value }))}
                                                    className={`${inputCls} flex-1 min-w-0`}
                                                    placeholder={t_hints("e_g_25000")}
                                                />
                                                <CurrencySelect
                                                    value={currency}
                                                    onChange={setCurrency}
                                                />
                                                </div>
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
                                                    placeholder={t_hints("e_g_old_road_monrovia")}
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
                                                    placeholder={t_hints("e_g_5")}
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
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    {t("subcategory")}
                                                </label>
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
                                                placeholder={t_hints("e_g_c_of_o_survey_plan_deed_of_assignmen")}
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
                                                    placeholder={t_hints("e_g_250_700_000_000")}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    {t("whatsappNumber")}
                                                </label>
                                                <input
                                                    type="tel"
                                                    value={landData.whatsappNumber}
                                                    onChange={e => setLandData(p => ({ ...p, whatsappNumber: e.target.value }))}
                                                    className={inputCls}
                                                    placeholder={t_hints("e_g_250_700_000_000")}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {agentFeeJsx}
                                <ImageSection />
                                <SubmitRow />
                            </>
                        )}

                        {/* ══════════════════════════════════════════════════
                            HOUSE FORM
                        ══════════════════════════════════════════════════ */}
                        {selectedCategory === 'house' && (
                            <>
                                {/* Basic info */}
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
                                                placeholder={t_hints("e_g_modern_4_bedroom_duplex_for_sale")}
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
                                                placeholder={t("describeHouse")}
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Price ({CURRENCY_META[currency].label}) <span className="text-red-500">*</span>
                                                </label>
                                                <div className="flex gap-2">
                                                <input
                                                    type="number" required min="0"
                                                    value={houseData.price}
                                                    onChange={e => setHouseData(p => ({ ...p, price: e.target.value }))}
                                                    className={`${inputCls} flex-1 min-w-0`}
                                                    placeholder={t_hints("e_g_120000")}
                                                />
                                                <CurrencySelect
                                                    value={currency}
                                                    onChange={setCurrency}
                                                />
                                                </div>
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
                                                    placeholder={t_hints("e_g_sinkor_monrovia")}
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
                                                    placeholder={t_hints("e_g_4")}
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
                                                    placeholder={t_hints("e_g_3")}
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
                                                    placeholder={t_hints("e_g_duplex_bungalow")}
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

                                {agentFeeJsx}
                                <ImageSection />
                                <SubmitRow />
                            </>
                        )}

                        {/* ══════════════════════════════════════════════════
                            HOUSEHOLD ITEM FORM
                        ══════════════════════════════════════════════════ */}
                        {selectedCategory === 'household_item' && (
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
                                                placeholder={t_hints("e_g_leather_sofa_set")}
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
                                                    Price ({CURRENCY_META[currency].label}) <span className="text-red-500">*</span>
                                                </label>
                                                <div className="flex gap-2">
                                                <input
                                                    type="number" required min="0"
                                                    value={itemData.price}
                                                    onChange={e => setItemData(p => ({ ...p, price: e.target.value }))}
                                                    className={`${inputCls} flex-1 min-w-0`}
                                                    placeholder={t_hints("e_g_350")}
                                                />
                                                <CurrencySelect
                                                    value={currency}
                                                    onChange={setCurrency}
                                                />
                                                </div>
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
                                                    placeholder={t_hints("e_g_congo_town_monrovia")}
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
                                                placeholder={t("describeItem")}
                                            />
                                        </div>

                                        {/* Toggles */}
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

                                {agentFeeJsx}
                                <ImageSection />
                                <SubmitRow />
                            </>
                        )}
                    </form>
                )}
            </div>
        </div>
    );
}
