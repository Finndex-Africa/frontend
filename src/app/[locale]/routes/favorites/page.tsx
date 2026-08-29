'use client';

import { useState, useEffect, useCallback } from "react";

import PropertyCard, { Property } from "@/components/domain/PropertyCard";
import ServiceCard, { Service } from "@/components/domain/ServiceCard";
import { SafeImage } from "@/components/ui/SafeImage";
import { bookmarksApi, SavedItem } from "@/services/api/bookmarks.api";

import { Link, useRouter } from "@/i18n/navigation";
const defaultPropertyImage = '/images/properties/pexels-photo-323780.jpeg';

function adaptSavedPropertyToCard(item: SavedItem): Property {
    const l = item.listing;
    return {
        id: l._id,
        title: l.title,
        location: l.location,
        price: `$${l.price ?? 0}`,
        imageUrl: l.images?.[0] || defaultPropertyImage,
        imageUrls: l.images?.length ? l.images : [defaultPropertyImage],
        amenities: [],
        rating: l.rating ? Number(l.rating.toFixed(2)) : undefined,
        isBookmarked: true,
    };
}

function adaptSavedServiceToCard(item: SavedItem): Service {
    const l = item.listing;
    const category = l.category ?? 'other';
    const defaultImage = '/images/services/cleaning1.jpeg';
    return {
        id: l._id,
        name: l.title,
        location: l.location,
        rating: l.rating ? Number(l.rating.toFixed(2)) : 0,
        reviews: l.reviewCount ?? 0,
        imageUrl: l.images?.[0] || defaultImage,
        tags: [category.replace(/_/g, ' ')],
        badge: category.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
        isBookmarked: true,
    };
}

/** Buy & Sell card with its own heart button for the favorites page */
function BuySellFavCard({ item, onRemove }: { item: SavedItem; onRemove: () => void }) {
    const [saved, setSaved] = useState(true);
    const [toggling, setToggling] = useState(false);
    const l = item.listing;
    const images = l.images ?? [];
    const categoryLabel =
        l.category === 'land' ? 'Land for Sale' :
        l.category === 'house' ? 'House for Sale' : 'Item for Sale';
    const categoryColor =
        l.category === 'land' ? 'bg-green-100 text-green-700' :
        l.category === 'house' ? 'bg-blue-100 text-blue-700' :
        'bg-orange-100 text-orange-700';

    const handleToggle = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setToggling(true);
        const prev = saved;
        setSaved(!prev);
        try {
            const result = await bookmarksApi.toggle('buy-sell', l._id);
            setSaved(result.bookmarked);
            if (!result.bookmarked) onRemove();
        } catch {
            setSaved(prev);
        } finally {
            setToggling(false);
        }
    };

    return (
        <Link href={`/routes/buy-and-sell/${l._id}`} className="group block">
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-gray-100 mb-2 shadow-sm">
                {images[0] ? (
                    <SafeImage src={images[0]} alt={l.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-3xl text-gray-300">
                        {l.category === 'land' ? '🏞️' : l.category === 'house' ? '🏠' : '📦'}
                    </div>
                )}
                <span className={`absolute top-2 left-2 text-xs font-semibold px-2 py-0.5 rounded-md ${categoryColor}`}>
                    {categoryLabel}
                </span>
                {/* Heart button — matches PropertyCard / ServiceCard style */}
                <button
                    aria-label={saved ? 'Remove from favorites' : 'Save to favorites'}
                    disabled={toggling}
                    onClick={handleToggle}
                    className="absolute top-1.5 right-1.5 p-1 bg-white/10 backdrop-blur-sm rounded-full hover:scale-110 transition-transform disabled:opacity-60"
                >
                    <svg
                        className={`w-4 h-4 ${saved ? 'fill-red-500 stroke-red-500' : 'fill-none stroke-white'}`}
                        strokeWidth={2.5}
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                </button>
            </div>
            <h3 className="text-[12px] sm:text-[14px] font-medium text-gray-900 line-clamp-1">{l.title}</h3>
            <p className="text-[11px] sm:text-[13px] text-gray-500 line-clamp-1">{l.location}</p>
            {l.price != null && (
                <p className="text-[12px] sm:text-[15px] font-semibold text-gray-900 mt-0.5">${l.price.toLocaleString()}</p>
            )}
        </Link>
    );
}

type Tab = 'all' | 'property' | 'service' | 'buy-sell';

export default function FavoritesPage() {
    const router = useRouter();
    const [items, setItems] = useState<SavedItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<Tab>('all');

    const fetchItems = useCallback(() => {
        const token = typeof window !== "undefined"
            ? (localStorage.getItem("token") || sessionStorage.getItem("token"))
            : null;
        if (!token) { router.replace("/routes/login"); return; }

        setLoading(true);
        setError(null);
        bookmarksApi.getAll()
            .then(data => setItems(data))
            .catch(() => setError('Failed to load saved items. Please try again.'))
            .finally(() => setLoading(false));
    }, [router]);

    useEffect(() => {
        fetchItems();
    }, [fetchItems]);

    /** Remove one item from local state — called after unbookmark so list stays fresh */
    const removeItem = useCallback((bookmarkId: string) => {
        setItems(prev => prev.filter(i => i.bookmarkId !== bookmarkId));
    }, []);

    const filtered = activeTab === 'all' ? items : items.filter(i => i.type === activeTab);

    const properties = filtered.filter(i => i.type === 'property');
    const services = filtered.filter(i => i.type === 'service');
    const buySell = filtered.filter(i => i.type === 'buy-sell');

    const countFor = (t: Tab) => t === 'all' ? items.length : items.filter(i => i.type === t).length;

    const isEmpty = !loading && filtered.length === 0;

    const tabs: { key: Tab; label: string }[] = [
        { key: 'all', label: 'All' },
        { key: 'property', label: 'Properties' },
        { key: 'service', label: 'Services' },
        { key: 'buy-sell', label: 'Buy & Sell' },
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">Favorites</h1>
                <p className="text-gray-500 text-sm mb-6">
                    Listings you&apos;ve saved with the heart button — across properties, services and buy &amp; sell.
                </p>

                {/* Tabs */}
                <div className="flex gap-2 mb-6 flex-wrap">
                    {tabs.map(tab => {
                        const count = countFor(tab.key);
                        const active = activeTab === tab.key;
                        return (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                                    active
                                        ? 'bg-blue-600 text-white border-blue-600'
                                        : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600'
                                }`}
                            >
                                {tab.label}
                                {count > 0 && (
                                    <span className={`text-xs font-semibold rounded-full px-1.5 py-0.5 ${
                                        active ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
                                    }`}>
                                        {count}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>

                {loading && (
                    <div className="flex items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
                    </div>
                )}

                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-600 mb-4">{error}</div>
                )}

                {!loading && isEmpty && (
                    <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
                        <div className="text-4xl mb-3">🤍</div>
                        <p className="text-gray-700 font-medium mb-1">No saved items yet</p>
                        <p className="text-sm text-gray-400 mb-6">
                            {activeTab === 'all'
                                ? "Tap the heart on any listing to save it here."
                                : `You haven't saved any ${activeTab === 'buy-sell' ? 'buy & sell' : activeTab} listings yet.`}
                        </p>
                        <Link href="/" className="inline-block bg-blue-600 text-white text-sm font-semibold px-6 py-2.5 rounded-lg hover:bg-blue-700 transition-colors">
                            Explore listings
                        </Link>
                    </div>
                )}

                {!loading && !isEmpty && (
                    <div className="space-y-10">
                        {properties.length > 0 && (
                            <section>
                                <h2 className="text-base font-semibold text-gray-700 mb-4 flex items-center gap-2">
                                    Saved Properties
                                    <span className="text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded-full">{properties.length}</span>
                                </h2>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-3 gap-y-6 sm:gap-x-4 sm:gap-y-8">
                                    {properties.map(item => (
                                        <PropertyCard
                                            key={item.bookmarkId}
                                            p={adaptSavedPropertyToCard(item)}
                                            compact
                                            onUnbookmark={() => removeItem(item.bookmarkId)}
                                        />
                                    ))}
                                </div>
                            </section>
                        )}

                        {services.length > 0 && (
                            <section>
                                <h2 className="text-base font-semibold text-gray-700 mb-4 flex items-center gap-2">
                                    Saved Services
                                    <span className="text-xs font-medium bg-purple-50 text-purple-700 border border-purple-100 px-2 py-0.5 rounded-full">{services.length}</span>
                                </h2>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-3 gap-y-6 sm:gap-x-4 sm:gap-y-8">
                                    {services.map(item => (
                                        <ServiceCard
                                            key={item.bookmarkId}
                                            service={adaptSavedServiceToCard(item)}
                                            compact
                                            onUnbookmark={() => removeItem(item.bookmarkId)}
                                        />
                                    ))}
                                </div>
                            </section>
                        )}

                        {buySell.length > 0 && (
                            <section>
                                <h2 className="text-base font-semibold text-gray-700 mb-4 flex items-center gap-2">
                                    Saved Buy &amp; Sell
                                    <span className="text-xs font-medium bg-orange-50 text-orange-700 border border-orange-100 px-2 py-0.5 rounded-full">{buySell.length}</span>
                                </h2>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-3 gap-y-6 sm:gap-x-4 sm:gap-y-8">
                                    {buySell.map(item => (
                                        <BuySellFavCard
                                            key={item.bookmarkId}
                                            item={item}
                                            onRemove={() => removeItem(item.bookmarkId)}
                                        />
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
