"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { buySellApi } from "@/services/api";
import { SafeImage } from "@/components/ui/SafeImage";
import ShareButton from "@/components/ui/ShareButton";
import SearchBar from "@/components/ui/SearchBar";
import { bookmarksApi } from "@/services/api/bookmarks.api";
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

  // ── Bookmark state ──────────────────────────────────────────────────────
  // isBookmarked is pre-resolved by the parent (bulk fetch) — same pattern as PropertyCard
  const [saved, setSaved] = useState(listing.isBookmarked ?? false);
  const [toggling, setToggling] = useState(false);

  // Sync when parent updates isBookmarked (e.g. after bulk fetch resolves)
  useEffect(() => {
    if (listing.isBookmarked !== undefined) setSaved(listing.isBookmarked);
  }, [listing.isBookmarked]);

  const handleToggleSave = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!token) { window.location.href = "/routes/login"; return; }
    setToggling(true);
    const prev = saved;
    setSaved(!prev);
    try {
      const result = await bookmarksApi.toggle("buy-sell", listing._id);
      setSaved(result.bookmarked);
    } catch {
      setSaved(prev);
    } finally {
      setToggling(false);
    }
  }, [listing._id, saved]);
  // ───────────────────────────────────────────────────────────────────────

  const categoryLabel =
    listing.category === "land"
      ? "Land for Sale"
      : listing.category === "house"
        ? "House for Sale"
        : "Item for Sale";

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
        {/* Action buttons — heart + share */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5">
          {/* Heart / favorite */}
          <button
            aria-label={saved ? "Remove from favorites" : "Save to favorites"}
            disabled={toggling}
            onClick={handleToggleSave}
            className="p-1.5 bg-white/15 backdrop-blur-sm rounded-full hover:scale-110 transition-transform disabled:opacity-60"
          >
            <svg
              className={`w-4 h-4 ${saved ? "fill-red-500 stroke-red-500" : "fill-none stroke-white"}`}
              strokeWidth={2.5}
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
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
        {(listing as any).agentFee != null && (
          <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 px-2 py-1 rounded-md mt-2">
            Agent fee: ${(listing as any).agentFee.toLocaleString()}
          </p>
        )}
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

// ─── Pagination ─────────────────────────────────────────────────────────────

function Pagination({ page, totalPages, onPage }: { page: number; totalPages: number; onPage: (p: number) => void }) {
  if (totalPages <= 1) return null;

  const pages: (number | "…")[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (page > 3) pages.push("…");
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i);
    if (page < totalPages - 2) pages.push("…");
    pages.push(totalPages);
  }

  return (
    <div className="flex items-center justify-center gap-1 mt-10 flex-wrap">
      <button
        onClick={() => onPage(page - 1)}
        disabled={page === 1}
        className="px-3 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        ← Previous
      </button>
      {pages.map((p, i) =>
        p === "…" ? (
          <span key={`ellipsis-${i}`} className="px-2 text-gray-400 text-sm">…</span>
        ) : (
          <button
            key={p}
            onClick={() => onPage(p as number)}
            className={`min-w-[36px] h-9 rounded-lg border text-sm font-medium transition-colors ${
              p === page
                ? "bg-blue-600 text-white border-blue-600"
                : "border-gray-200 text-gray-700 hover:bg-gray-50"
            }`}
          >
            {p}
          </button>
        )
      )}
      <button
        onClick={() => onPage(page + 1)}
        disabled={page === totalPages}
        className="px-3 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        Next →
      </button>
    </div>
  );
}

// ─── Main component ─────────────────────────────────────────────────────────

export default function BuyAndSellPageContent() {
  const [listings, setListings] = useState<BuySellListing[]>([]);
  const searchParams = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Filter state — initialised from URL params so SearchBar navigation works
  const [activeCategory, setActiveCategory] = useState<BuySellCategory | "all">(
    () => (searchParams.get("category") as BuySellCategory) || "all"
  );
  const [locationFilter, setLocationFilter] = useState(() => searchParams.get("location") ?? "");
  const [maxBudget, setMaxBudget] = useState<number | undefined>(
    () => (searchParams.get("maxBudget") ? Number(searchParams.get("maxBudget")) : undefined)
  );

  // Keep filter state in sync when URL params change (e.g. user navigates via SearchBar)
  useEffect(() => {
    setActiveCategory((searchParams.get("category") as BuySellCategory) || "all");
    setLocationFilter(searchParams.get("location") ?? "");
    setMaxBudget(searchParams.get("maxBudget") ? Number(searchParams.get("maxBudget")) : undefined);
    setPage(1);
  }, [searchParams]);

  const fetchListings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = typeof window !== "undefined"
        ? (localStorage.getItem("token") || sessionStorage.getItem("token"))
        : null;

      // Fetch listings + saved IDs in parallel (one bulk call, not one per card)
      const [res, savedItems] = await Promise.allSettled([
        buySellApi.getAll({
          page,
          limit: 20,
          status: "approved",
          ...(activeCategory !== "all" ? { category: activeCategory } : {}),
          ...(locationFilter ? { location: locationFilter } : {}),
          ...(maxBudget ? { maxPrice: maxBudget } : {}),
        }),
        token ? bookmarksApi.getAll("buy-sell") : Promise.resolve([]),
      ]);

      const items = res.status === "fulfilled" ? (res.value.data ?? []) : [];
      const saved = savedItems.status === "fulfilled" ? savedItems.value : [];
      const savedSet = new Set(saved.map((s) => s.listing._id));

      // Merge isBookmarked into each listing — same as how propertiesApi/servicesApi work
      setListings(items.map((l) => ({ ...l, isBookmarked: savedSet.has(l._id) })));
      setTotalPages(res.status === "fulfilled" ? (res.value.pagination?.totalPages ?? 1) : 1);
      if (res.status === "rejected") setError("Failed to load listings. Please try again.");
    } catch {
      setError("Failed to load listings. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [page, activeCategory, locationFilter, maxBudget]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  const handleCategoryChange = (cat: BuySellCategory | "all") => {
    setActiveCategory(cat);
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative z-20 w-full overflow-visible pb-3 md:h-[400px] md:pb-0">
        {/* Background image */}
        <div className="absolute inset-0 overflow-hidden">
          <Image
            src="/images/buysell/bg.jpeg"
            alt="Buy & Sell Marketplace"
            fill
            className="object-cover object-center"
            priority
          />
          <div className="absolute inset-0 bg-black/50" />
        </div>

        <div className="relative z-[5] flex flex-col md:h-[400px]">
          {/* Hero text + desktop search */}
          <div className="flex flex-col items-center justify-center px-4 pt-20 pb-4 text-center text-white md:flex-1 md:pt-0 md:pb-0">
            <span className="inline-block bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full mb-3 uppercase tracking-wide border border-white/30">
              Marketplace
            </span>
            <h1 className="max-w-3xl mx-auto font-extrabold drop-shadow-lg text-2xl leading-snug sm:text-3xl sm:leading-snug md:text-5xl md:leading-tight mb-3">
              Buy &amp; Sell on FindAfriq
            </h1>
            <p className="text-white/80 text-sm sm:text-base mb-6 max-w-xl">
              Land, houses, and fairly used household items — all in one trusted marketplace.
            </p>

            {/* Desktop search (in hero) */}
            <div className="mx-auto mt-2 hidden w-full max-w-3xl md:block">
              <SearchBar
                variant="buy-sell"
                initialLocation={locationFilter}
                initialType={activeCategory !== "all" ? activeCategory : ""}
                initialBudget={maxBudget ? String(maxBudget) : ""}
              />
            </div>
          </div>

          {/* Mobile search (below hero text) */}
          <div className="relative z-30 isolate mt-2 px-4 pb-3 md:hidden">
            <div className="container-app max-w-5xl mx-auto">
              <SearchBar
                variant="buy-sell"
                initialLocation={locationFilter}
                initialType={activeCategory !== "all" ? activeCategory : ""}
                initialBudget={maxBudget ? String(maxBudget) : ""}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Active filter chips */}
      {(locationFilter || maxBudget || activeCategory !== "all") && (
        <div className="container-app px-4 pt-4">
          <div className="flex flex-wrap gap-2">
            {locationFilter && (
              <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 border border-blue-200 text-xs px-2.5 py-1 rounded-full">
                📍 {locationFilter}
                <button type="button" onClick={() => { setLocationFilter(""); setPage(1); }} className="ml-1 text-blue-400 hover:text-blue-700">×</button>
              </span>
            )}
            {activeCategory !== "all" && (
              <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 border border-blue-200 text-xs px-2.5 py-1 rounded-full">
                {activeCategory === "land" ? "🏞️ Land" : activeCategory === "house" ? "🏠 House" : "📦 Household Item"}
                <button type="button" onClick={() => { handleCategoryChange("all"); }} className="ml-1 text-blue-400 hover:text-blue-700">×</button>
              </span>
            )}
            {maxBudget && (
              <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 border border-blue-200 text-xs px-2.5 py-1 rounded-full">
                💰 Max ${maxBudget.toLocaleString()}
                <button type="button" onClick={() => { setMaxBudget(undefined); setPage(1); }} className="ml-1 text-blue-400 hover:text-blue-700">×</button>
              </span>
            )}
            <button
              type="button"
              onClick={() => { setActiveCategory("all"); setLocationFilter(""); setMaxBudget(undefined); setPage(1); }}
              className="text-gray-500 hover:text-gray-700 text-xs underline"
            >
              Clear all
            </button>
          </div>
        </div>
      )}

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

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-3 gap-y-6 sm:gap-x-4 sm:gap-y-8">
            {Array.from({ length: 10 }).map((_, i) => <SkeletonCard key={i} />)}
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
              {(locationFilter || maxBudget || activeCategory !== "all")
                ? "No results match your filters. Try adjusting your search."
                : "No listings in this category yet. Check back soon."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-3 gap-y-6 sm:gap-x-4 sm:gap-y-8">
            {listings.map(listing => (
              <BuySellCard key={listing._id} listing={listing} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && !error && (
          <Pagination page={page} totalPages={totalPages} onPage={p => { setPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); }} />
        )}
      </section>

    </div>
  );
}
