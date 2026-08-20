"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { buySellApi } from "@/services/api";
import { SafeImage } from "@/components/ui/SafeImage";
import ShareButton from "@/components/ui/ShareButton";
import type { BuySellListing, BuySellCategory } from "@/types/buy-sell";
import { getUserDisplayName } from "@/lib/display-name";

// ─── Category config ────────────────────────────────────────────────────────

const CATEGORIES: {
  value: BuySellCategory | "all";
  label: string;
  icon: string;
  color: string;
  activeColor: string;
}[] = [
  { value: "all", label: "All", icon: "🛍️", color: "bg-gray-100 text-gray-700", activeColor: "bg-gray-900 text-white" },
  { value: "land", label: "Land", icon: "🏞️", color: "bg-green-50 text-green-700", activeColor: "bg-green-600 text-white" },
  { value: "house", label: "Houses", icon: "🏠", color: "bg-blue-50 text-blue-700", activeColor: "bg-blue-600 text-white" },
  { value: "household_item", label: "Household Items", icon: "📦", color: "bg-orange-50 text-orange-700", activeColor: "bg-orange-500 text-white" },
];

const CATEGORY_HERO_CARDS = [
  {
    value: "land" as BuySellCategory,
    label: "Land",
    description: "Residential, commercial, beach & farm land",
    icon: "🏞️",
    image: "/icons/land.png",
    color: "bg-green-50 border-green-100",
    titleColor: "text-green-700",
  },
  {
    value: "house" as BuySellCategory,
    label: "Houses",
    description: "Duplexes, apartments & commercial properties",
    icon: "🏠",
    image: "/icons/house.png",
    color: "bg-blue-50 border-blue-100",
    titleColor: "text-blue-700",
  },
  {
    value: "household_item" as BuySellCategory,
    label: "Household Items",
    description: "Furniture, electronics, kitchen items & more",
    icon: "📦",
    image: "/icons/items.png",
    color: "bg-orange-50 border-orange-100",
    titleColor: "text-orange-600",
  },
];

// ─── Listing card ───────────────────────────────────────────────────────────

function BuySellCard({ listing }: { listing: BuySellListing }) {
  const seller =
    typeof listing.sellerId === "object" ? listing.sellerId : null;
  const sellerName = seller
    ? getUserDisplayName(seller as unknown as Record<string, unknown>, "Seller")
    : "Seller";
  const images = listing.images?.length ? listing.images : [];
  const firstImage = images[0];

  const categoryLabel =
    listing.category === "land"
      ? "Land"
      : listing.category === "house"
        ? "House"
        : "Item";

  const categoryColor =
    listing.category === "land"
      ? "bg-green-100 text-green-700"
      : listing.category === "house"
        ? "bg-blue-100 text-blue-700"
        : "bg-orange-100 text-orange-700";

  const subtitle =
    listing.category === "land"
      ? listing.landSize != null && listing.unit
        ? `${listing.landSize} ${listing.unit.replace("_", " ")}`
        : null
      : listing.category === "house"
        ? listing.bedrooms != null && listing.bathrooms != null
          ? `${listing.bedrooms} bed · ${listing.bathrooms} bath`
          : null
        : listing.condition
          ? listing.condition === "fairly_used"
            ? "Fairly Used"
            : "New"
          : null;

  return (
    <Link
      href={`/routes/buy-and-sell/${listing._id}`}
      className="group block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
    >
      {/* Image */}
      <div className="relative aspect-4/3 bg-gray-100 overflow-hidden">
        {firstImage ? (
          <SafeImage
            src={firstImage}
            alt={listing.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-4xl text-gray-300">
            {listing.category === "land" ? "🏞️" : listing.category === "house" ? "🏠" : "📦"}
          </div>
        )}
        {/* Category badge */}
        <span className={`absolute top-3 left-3 text-xs font-semibold px-2.5 py-1 rounded-md ${categoryColor}`}>
          {categoryLabel}
        </span>
        {/* Share button */}
        <div className="absolute top-3 right-3">
          <ShareButton
            compact
            dropdownRight
            url={`/routes/buy-and-sell/${listing._id}`}
            title={listing.title}
            text={`Check out this listing: ${listing.title} in ${listing.location}`}
          />
        </div>
        {/* Image count */}
        {images.length > 1 && (
          <span className="absolute bottom-3 right-3 bg-black/50 text-white text-xs px-2 py-0.5 rounded-full">
            +{images.length - 1}
          </span>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2 mb-1">
          {listing.title}
        </h3>
        <p className="text-xs text-gray-500 line-clamp-1 mb-1">📍 {listing.location}</p>
        {subtitle && (
          <p className="text-xs text-gray-500 mb-2">{subtitle}</p>
        )}
        <div className="flex items-center justify-between mt-2">
          <span className="text-base font-bold text-gray-900">
            ${listing.price.toLocaleString()}
          </span>
          {listing.isPremium && (
            <span className="text-xs font-semibold text-yellow-700 bg-yellow-50 border border-yellow-200 px-2 py-0.5 rounded-full">
              Featured
            </span>
          )}
        </div>
        <p className="text-xs text-gray-400 mt-2 truncate">By {sellerName}</p>
      </div>
    </Link>
  );
}

// ─── Skeleton card ──────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
      <div className="aspect-4/3 bg-gray-200" />
      <div className="p-4 space-y-2">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-100 rounded w-1/2" />
        <div className="h-4 bg-gray-200 rounded w-1/3 mt-2" />
      </div>
    </div>
  );
}

// ─── Main component ─────────────────────────────────────────────────────────

export default function BuyAndSellPageContent() {
  const [listings, setListings] = useState<BuySellListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<BuySellCategory | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchListings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await buySellApi.getAll({
        page,
        limit: 12,
        status: "approved",
        ...(activeCategory !== "all" ? { category: activeCategory } : {}),
        ...(searchQuery ? { q: searchQuery } : {}),
      });
      setListings(res.data ?? []);
      setTotalPages(res.pagination?.totalPages ?? 1);
    } catch {
      setError("Failed to load listings. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [page, activeCategory, searchQuery]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  const handleCategoryChange = (cat: BuySellCategory | "all") => {
    setActiveCategory(cat);
    setPage(1);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(searchInput.trim());
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="bg-blue-600 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_top_right,var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
        <div className="relative container-app px-4 py-14 sm:py-20">
          <div className="max-w-2xl">
            <span className="inline-block bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full mb-4 uppercase tracking-wide border border-white/30">
              Marketplace
            </span>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
              Buy &amp; Sell on <span className="text-yellow-300">FindAfriq</span>
            </h1>
            <p className="text-white/80 text-base sm:text-lg mb-8">
              Land, houses, and fairly used household items — all in one trusted marketplace.
            </p>

            {/* Search */}
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="flex-1 relative">
                <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  value={searchInput}
                  onChange={e => setSearchInput(e.target.value)}
                  placeholder="Search land, houses, items..."
                  className="w-full pl-10 pr-4 py-3 rounded-lg text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
              </div>
              <button
                type="submit"
                className="px-5 py-3 bg-yellow-400 hover:bg-yellow-300 text-blue-900 font-semibold rounded-lg text-sm transition-colors"
              >
                Search
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* ── Browse by Category cards ──────────────────────────────────────── */}
      <section className="container-app px-4 py-10">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Browse by Category</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {CATEGORY_HERO_CARDS.map(cat => (
            <button
              key={cat.value}
              type="button"
              onClick={() => handleCategoryChange(cat.value)}
              className={`rounded-2xl border p-5 flex flex-row items-start gap-4 text-left transition-all hover:shadow-sm ${cat.color} ${activeCategory === cat.value ? "ring-2 ring-blue-500" : ""}`}
            >
              <div className="w-16 h-16 shrink-0">
                <Image src={cat.image} alt={cat.label} width={64} height={64} className="object-contain w-full h-full" />
              </div>
              <div className="flex flex-col gap-1 pt-1">
                <h3 className={`font-bold text-base ${cat.titleColor}`}>{cat.label}</h3>
                <p className="text-sm text-gray-600">{cat.description}</p>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* ── Listings ─────────────────────────────────────────────────────── */}
      <section className="container-app px-4 pb-16">

        {/* Filter tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {CATEGORIES.map(cat => (
            <button
              key={cat.value}
              type="button"
              onClick={() => handleCategoryChange(cat.value)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-colors border ${
                activeCategory === cat.value
                  ? `${cat.activeColor} border-transparent`
                  : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
              }`}
            >
              <span>{cat.icon}</span>
              {cat.label}
            </button>
          ))}
        </div>

        {/* Active search indicator */}
        {searchQuery && (
          <div className="flex items-center gap-2 mb-4 text-sm text-gray-600">
            <span>Results for <strong>&ldquo;{searchQuery}&rdquo;</strong></span>
            <button
              type="button"
              onClick={() => { setSearchQuery(""); setSearchInput(""); setPage(1); }}
              className="text-blue-600 hover:underline"
            >
              Clear
            </button>
          </div>
        )}

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <p className="text-gray-500 mb-4">{error}</p>
            <button
              onClick={fetchListings}
              className="bg-blue-600 text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">
              {activeCategory === "land" ? "🏞️" : activeCategory === "house" ? "🏠" : activeCategory === "household_item" ? "📦" : "🛍️"}
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No listings found</h3>
            <p className="text-gray-500 text-sm">
              {searchQuery
                ? `No results for "${searchQuery}". Try a different search.`
                : "No listings in this category yet. Check back soon."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {listings.map(listing => (
              <BuySellCard key={listing._id} listing={listing} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && !error && totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-10">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <span className="text-sm text-gray-500">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </section>

    </div>
  );
}
