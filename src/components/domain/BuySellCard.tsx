'use client';

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { SafeImage } from "@/components/ui/SafeImage";
import ShareButton from "@/components/ui/ShareButton";
import { bookmarksApi } from "@/services/api/bookmarks.api";
import type { BuySellListing } from "@/types/buy-sell";
import { getUserDisplayName } from "@/lib/display-name";

import { Link } from "@/i18n/navigation";
export default function BuySellCard({ listing }: { listing: BuySellListing }) {
  const t = useTranslations("buySellCard");
  const seller = typeof listing.sellerId === "object" ? listing.sellerId : null;
  const sellerName = seller
    ? getUserDisplayName(seller as unknown as Record<string, unknown>, "Seller")
    : "Seller";
  const images = listing.images?.length ? listing.images : [];
  const firstImage = images[0];

  // ── Bookmark ──────────────────────────────────────────────────────────────
  const [saved, setSaved] = useState(listing.isBookmarked ?? false);
  const [toggling, setToggling] = useState(false);

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
  // ─────────────────────────────────────────────────────────────────────────

  const categoryLabel =
    listing.category === "land" ? t("landForSale") :
    listing.category === "house" ? t("houseForSale") : t("itemForSale");

  const categoryColor =
    listing.category === "land" ? "bg-green-100 text-green-700" :
    listing.category === "house" ? "bg-blue-100 text-blue-700" :
    "bg-orange-100 text-orange-700";

  const subtitle =
    listing.category === "land"
      ? listing.landSize != null && listing.unit
        ? t("landSize", {
            size: listing.landSize,
            unit: t.has(`units.${listing.unit}`)
              ? t(`units.${listing.unit}`, { count: listing.landSize })
              : listing.unit.replace(/_/g, " "),
          })
        : null
      : listing.category === "house"
        ? listing.bedrooms != null && listing.bathrooms != null
          ? t("bedBath", { bedrooms: listing.bedrooms, bathrooms: listing.bathrooms })
          : null
        : listing.condition
          ? listing.condition === "fairly_used" ? t("fairlyUsed") : t("new")
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

      {/* Info — agent fee intentionally omitted (shown only on detail page) */}
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
              {t("featured")}
            </span>
          )}
        </div>
        <p className="text-xs text-gray-400 mt-2 truncate">{t("bySeller", { seller: sellerName })}</p>
      </div>
    </Link>
  );
}
