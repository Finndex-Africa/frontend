"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import { Lock, MessageCircle } from "lucide-react";
import MediaCarousel from "@/components/domain/MediaCarousel";
import ShareButton from "@/components/ui/ShareButton";
import ChatBox from "@/components/dashboard/ChatBox";
import ReviewsList from "@/components/reviews/ReviewsList";
import { bookmarksApi } from "@/services/api/bookmarks.api";
import { buySellApi } from "@/services/api/buy-sell.api";
import { messagesApi } from "@/services/api";
import { apiClient } from "@/lib/api-client";
import { BuySellListing, BuySellSeller } from "@/types/buy-sell";
import { getUserFriendlyErrorMessage } from "@/lib/error-messages";
import { getUserDisplayName } from "@/lib/display-name";
import { isUserVerifiedByAdmin } from "@/lib/user-verification";
import { buildGoogleMapsEmbedUrlAsync } from "@/lib/google-maps";

// ─── Helpers ────────────────────────────────────────────────────────────────

const CATEGORY_LABEL: Record<string, string> = {
  land: "Land",
  house: "House",
  household_item: "Household Item",
};

const SUBCATEGORY_LABEL: Record<string, string> = {
  // Land
  residential: "Residential",
  commercial: "Commercial",
  beach: "Beach",
  farm: "Farm",
  // House
  duplex: "Duplex",
  apartment: "Apartment",
  // Household item
  furniture: "Furniture",
  electronics: "Electronics",
  kitchen_item: "Kitchen Item",
  office_equipment: "Office Equipment",
};

const UNIT_LABEL: Record<string, string> = {
  acres: "Acres",
  lots: "Lots",
  square_feet: "Sq ft",
  square_meters: "Sq m",
};

const CATEGORY_COLOR: Record<string, string> = {
  land: "bg-emerald-100 text-emerald-700",
  house: "bg-blue-100 text-blue-700",
  household_item: "bg-purple-100 text-purple-700",
};

function resolveSeller(listing: BuySellListing): BuySellSeller | null {
  if (!listing.sellerId) return null;
  if (typeof listing.sellerId === "object") return listing.sellerId;
  return null;
}

function getSellerPhone(listing: BuySellListing): string {
  // land listings expose sellerPhone / whatsappNumber at root
  if (listing.sellerPhone) return listing.sellerPhone;
  if (listing.whatsappNumber) return listing.whatsappNumber;
  const seller = resolveSeller(listing);
  return seller?.phone || "";
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 border-l-4 border-l-[#ffcc00] hover:border-[#ffcc00]/40 transition-all">
      <span className="text-xl leading-none">{icon}</span>
      <div>
        <div className="font-medium text-gray-900 text-sm">{label}</div>
        <div className="text-xs text-gray-500">{value}</div>
      </div>
    </div>
  );
}

function StatusBanner({ status }: { status: string }) {
  const config: Record<
    string,
    { icon: string; text: string; bg: string; border: string; color: string }
  > = {
    pending: {
      icon: "⏳",
      text: "Pending Approval",
      bg: "bg-amber-50",
      border: "border-amber-200",
      color: "text-amber-800",
    },
    rejected: {
      icon: "❌",
      text: "Not Available",
      bg: "bg-red-50",
      border: "border-red-200",
      color: "text-red-800",
    },
    suspended: {
      icon: "⛔",
      text: "Temporarily Unavailable",
      bg: "bg-orange-50",
      border: "border-orange-200",
      color: "text-orange-800",
    },
  };
  const c = config[status];
  if (!c) return null;
  return (
    <div className={`mt-4 px-3 py-2.5 ${c.bg} border ${c.border} rounded-lg`}>
      <p className={`text-xs font-semibold ${c.color} flex items-center gap-2`}>
        <span className="text-base">{c.icon}</span>
        {c.text}
      </p>
    </div>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────

export default function BuySellDetailClient() {
  const params = useParams();
  const listingId = params?.id as string;

  // Increment to force ReviewsList remount + refetch after a new review is submitted
  const [reviewsKey, setReviewsKey] = useState(0);

  // Backend bookmark state
  const [isSaved, setIsSaved] = useState(false);
  const [bookmarkId, setBookmarkId] = useState<string | null>(null);
  const [savingBookmark, setSavingBookmark] = useState(false);

  const [listing, setListing] = useState<BuySellListing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mapEmbedUrl, setMapEmbedUrl] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingData, setBookingData] = useState({ viewingDate: "", contactPhone: "", message: "" });
  const [bookingSubmitting, setBookingSubmitting] = useState(false);
  const [currentUser, setCurrentUser] = useState<{
    id: string;
    firstName?: string;
    email?: string;
    phone?: string;
  } | null>(null);

  // ── Bootstrap current user ────────────────────────────────────────────────
  useEffect(() => {
    const userStr =
      localStorage.getItem("user") || sessionStorage.getItem("user");
    if (userStr) {
      try {
        const u = JSON.parse(userStr);
        setCurrentUser({
          id: u._id || u.id,
          firstName: u.firstName,
          email: u.email,
          phone: u.phone,
        });
        if (u.phone) setBookingData(prev => ({ ...prev, contactPhone: u.phone }));
      } catch {}
    }
  }, []);

  // ── Check bookmark status ──────────────────────────────────────────────────
  useEffect(() => {
    if (!listingId) return;
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!token) return;
    bookmarksApi.check("buy-sell", listingId)
      .then(res => {
        setIsSaved(res.isSaved ?? false);
        setBookmarkId(res.bookmarkId ?? null);
      })
      .catch(() => { /* not critical */ });
  }, [listingId]);

  const handleToggleSave = async () => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!token) { window.location.href = "/routes/login"; return; }
    setSavingBookmark(true);
    const prev = isSaved;
    setIsSaved(!prev); // optimistic
    try {
      const result = await bookmarksApi.toggle("buy-sell", listingId);
      setIsSaved(result.bookmarked);
      setBookmarkId(result.bookmarkId ?? null);
      toast.success(result.bookmarked ? "Saved to favorites!" : "Removed from saved listings");
    } catch {
      setIsSaved(prev); // revert
      toast.error("Failed to update saved listings. Please try again.");
    } finally {
      setSavingBookmark(false);
    }
  };

  // ── Fetch listing ─────────────────────────────────────────────────────────
  const fetchListing = useCallback(async () => {
    if (!listingId) return;
    try {
      setLoading(true);
      const res = await buySellApi.getById(listingId);
      setListing(res.data);
      // Seed bookmark state from listing response (backend sets isBookmarked per-user)
      if (res.data?.isBookmarked !== undefined) {
        setIsSaved(res.data.isBookmarked);
      }
      setError(null);
    } catch (err) {
      setError("Failed to load listing. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, [listingId]);

  useEffect(() => {
    fetchListing();
  }, [fetchListing]);

  // ── Build map embed URL ───────────────────────────────────────────────────
  useEffect(() => {
    if (!listing) { setMapEmbedUrl(null); return; }
    let cancelled = false;
    buildGoogleMapsEmbedUrlAsync({
      location: listing.location,
      mapCoordinates: listing.mapCoordinates,
    }).then((url) => { if (!cancelled) setMapEmbedUrl(url); });
    return () => { cancelled = true; };
  }, [listing]);

  // ── Book Viewing ──────────────────────────────────────────────────────────
  const handleSubmitBooking = async () => {
    if (!currentUser || !listing || bookingSubmitting) return;
    if (!bookingData.contactPhone.trim()) {
      toast.error("Please provide your contact phone number");
      return;
    }
    if (!bookingData.viewingDate) {
      toast.error("Please select a preferred viewing date");
      return;
    }
    if (new Date(bookingData.viewingDate) <= new Date()) {
      toast.error("Viewing date must be in the future");
      return;
    }
    try {
      setBookingSubmitting(true);

      // Resolve seller ID — mirrors the property detail resolveId pattern
      const resolveId = (
        ref: string | { _id?: string; id?: string } | undefined,
      ): string => {
        if (!ref) return "";
        if (typeof ref === "string") return ref;
        return ref._id || ref.id || "";
      };
      const resolvedSellerId =
        resolveId(listing.sellerId as string | { _id?: string; id?: string } | undefined);

      const bookingPayload: Record<string, unknown> = {
        serviceId: listing._id,
        scheduledDate: new Date(bookingData.viewingDate).toISOString(),
        duration: 1,
        contactPhone: bookingData.contactPhone,
        notes:
          bookingData.message ||
          `Viewing request for "${listing.title}" in ${listing.location}.`,
        serviceLocation: listing.location,
        serviceAddress: listing.location,
        paymentMethod: "pending",
      };
      if (resolvedSellerId) bookingPayload.providerId = resolvedSellerId;

      const response = await apiClient.post("/bookings", bookingPayload);
      if (response.success) {
        toast.success("Viewing request submitted! The seller will contact you soon.");
        setShowBookingModal(false);
        setBookingData(prev => ({ ...prev, viewingDate: "", message: "" }));
      } else {
        throw new Error(response.message || "Failed to submit viewing request");
      }
    } catch (err: any) {
      toast.error(getUserFriendlyErrorMessage(err, "Failed to submit request. Please try again."));
    } finally {
      setBookingSubmitting(false);
    }
  };

  // ── WhatsApp helper ───────────────────────────────────────────────────────
  const handleWhatsApp = () => {
    if (!currentUser) { window.location.href = "/routes/login"; return; }
    if (!listing) return;
    const phone = getSellerPhone(listing).replace(/[^0-9+]/g, "");
    const msg = encodeURIComponent(
      `Hi, I'm interested in your listing "${listing.title}" on FindAfriq.`,
    );
    const url = phone
      ? `https://wa.me/${phone.replace("+", "")}?text=${msg}`
      : `https://wa.me/?text=${msg}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  // ── Send message via thread ───────────────────────────────────────────────
  const handleSendMessage = async (subject: string, message: string) => {
    if (!currentUser || !listing || submitting) return;
    const seller = resolveSeller(listing);
    const sellerId = seller?._id;
    if (!sellerId) {
      toast.error("Unable to contact seller at this time.");
      return;
    }
    try {
      setSubmitting(true);
      const threadResponse = await messagesApi.createThread({
        participants: [sellerId],
        relatedItem: {
          type: "buy_sell",
          id: listing._id,
          title: listing.title,
        },
      });
      const threadId = threadResponse.data?._id;
      if (!threadId) { toast.error("Could not start conversation. Please try again."); return; }
      const fullMessage = `${subject ? `[${subject}] ` : ""}${message}\n\nFrom: ${currentUser.firstName || "User"}${currentUser.email ? ` (${currentUser.email})` : ""}`;
      await apiClient.post("/messages/send", { threadId, text: fullMessage });
      toast.success("Message sent! The seller will respond soon.");
      setShowContactModal(false);
    } catch (err: any) {
      toast.error(getUserFriendlyErrorMessage(err, "Failed to send message. Please try again."));
    } finally {
      setSubmitting(false);
    }
  };

  // ── Loading / error states ────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center max-w-md">
          <p className="text-red-600 mb-4">{error || "Listing not found"}</p>
          <button
            onClick={() => (window.location.href = "/routes/buy-and-sell")}
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Back to Listings
          </button>
        </div>
      </div>
    );
  }

  // ── Derived values ────────────────────────────────────────────────────────
  const images = listing.images?.length ? listing.images : ["/images/properties/pexels-photo-323780.jpeg"];
  const media = images.map((src) => ({ type: "image" as const, src }));

  const seller = resolveSeller(listing);
  const sellerName = seller
    ? getUserDisplayName(seller as unknown as Record<string, unknown>, seller.email || "Seller")
    : "Seller";
  const sellerInitial = sellerName.charAt(0).toUpperCase();
  const sellerAvatar = seller?.avatar || "";
  const sellerId = seller?._id || (typeof listing.sellerId === "string" ? listing.sellerId : "");
  const isOwnListing = sellerId === currentUser?.id;
  const showVerified = isUserVerifiedByAdmin(seller as unknown as { verificationStatus?: string; verified?: boolean });
  const isAdminSeller =
    seller &&
    (seller.userType === "admin" || (seller as unknown as Record<string, unknown>).role === "admin");

  const categoryLabel = CATEGORY_LABEL[listing.category] || listing.category;
  const isApproved = listing.status === "approved";

  // ── Category-specific detail rows ─────────────────────────────────────────
  const detailRows: { icon: string; label: string; value: string }[] = [];

  if (listing.category === "land") {
    if (listing.landSubcategory)
      detailRows.push({ icon: "🏷️", label: "Land Type", value: SUBCATEGORY_LABEL[listing.landSubcategory] || listing.landSubcategory });
    if (listing.landSize != null && listing.unit)
      detailRows.push({ icon: "📐", label: "Land Size", value: `${listing.landSize.toLocaleString()} ${UNIT_LABEL[listing.unit] || listing.unit}` });
    if (listing.ownershipStatus)
      detailRows.push({ icon: "📋", label: "Ownership", value: listing.ownershipStatus });
  }

  if (listing.category === "house") {
    if (listing.houseSubcategory)
      detailRows.push({ icon: "🏡", label: "House Type", value: SUBCATEGORY_LABEL[listing.houseSubcategory] || listing.houseSubcategory });
    if (listing.propertyType)
      detailRows.push({ icon: "🏗️", label: "Structure", value: listing.propertyType });
    if (listing.bedrooms != null)
      detailRows.push({ icon: "🛏️", label: "Bedrooms", value: `${listing.bedrooms}` });
    if (listing.bathrooms != null)
      detailRows.push({ icon: "🚿", label: "Bathrooms", value: `${listing.bathrooms}` });
  }

  if (listing.category === "household_item") {
    if (listing.itemSubcategory)
      detailRows.push({ icon: "🏷️", label: "Category", value: SUBCATEGORY_LABEL[listing.itemSubcategory] || listing.itemSubcategory });
    if (listing.condition)
      detailRows.push({ icon: "✨", label: "Condition", value: listing.condition === "new" ? "Brand New" : "Fairly Used" });
    if (listing.warranty != null)
      detailRows.push({ icon: "🛡️", label: "Warranty", value: listing.warranty ? "Included" : "No warranty" });
    if (listing.deliveryAvailable != null)
      detailRows.push({ icon: "🚚", label: "Delivery", value: listing.deliveryAvailable ? "Available" : "Pickup only" });
  }

  // Amenities for house listings
  const amenities: { icon: string; label: string; desc: string }[] = [];
  if (listing.category === "house" && listing.amenities?.length) {
    listing.amenities.forEach((a) => {
      amenities.push({
        icon: a.icon || "🏷️",
        label: a.label,
        desc: (a as any).description || "Available",
      });
    });
  }

  return (
    <div className="min-h-screen bg-white">
      <Toaster position="top-center" />

      {/* ── Hero image carousel ─────────────────────────────────────────── */}
      <section className="relative w-full max-w-6xl mx-auto px-4 sm:px-6 pt-4 sm:pt-6">
        <MediaCarousel media={media} />
      </section>

      {/* ── Main content ────────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 px-6 py-8">

        {/* ═══ LEFT COLUMN ═══════════════════════════════════════════════ */}
        <div className="lg:col-span-2 space-y-8">

          {/* Title & basic info */}
          <header>
            <div className="flex flex-wrap items-center gap-2">
              <span className={`text-xs uppercase font-semibold tracking-wide px-2 py-1 rounded ${CATEGORY_COLOR[listing.category] || "bg-gray-100 text-gray-700"}`}>
                {categoryLabel}
              </span>
              {listing.isPremium && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-400 text-white rounded text-xs font-bold">
                  ⭐ Premium
                </span>
              )}
            </div>

            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mt-3">
              {listing.title}
            </h1>
            <p className="text-gray-600 text-base mt-1 flex items-center gap-1.5">
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {listing.location}
            </p>

            <div className="mt-4 flex items-center gap-3 flex-wrap">
              <ShareButton
                title={listing.title}
                text={`Check out this listing: ${listing.title} in ${listing.location}`}
              />
              {/* Favorite button — backed by /api/bookmarks */}
              <button
                type="button"
                disabled={savingBookmark}
                aria-label={isSaved ? "Remove from favorites" : "Save to favorites"}
                onClick={handleToggleSave}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all text-sm font-medium ${isSaved ? "border-red-300 bg-red-50 text-red-600" : "border-gray-200 bg-white text-gray-600 hover:bg-red-50 hover:border-red-300 hover:text-red-600"} disabled:opacity-60`}
              >
                <svg
                  className={`w-4 h-4 ${isSaved ? "fill-red-500 stroke-red-500" : "fill-none stroke-gray-500"}`}
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                {savingBookmark ? "..." : isSaved ? "Saved" : "Save"}
              </button>
            </div>
          </header>

          {/* Description */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">About this listing</h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              {listing.description || "No description provided."}
            </p>
          </section>

          {/* Category-specific details */}
          {detailRows.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Listing Details</h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {detailRows.map((r, i) => (
                  <DetailRow key={i} icon={r.icon} label={r.label} value={r.value} />
                ))}
              </div>
            </section>
          )}

          {/* Amenities (house only) */}
          {amenities.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Amenities & Features</h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {amenities.map((a, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 border-l-4 border-l-[#ffcc00] hover:border-[#ffcc00]/40 transition-all"
                  >
                    <span className="text-xl leading-none">{a.icon}</span>
                    <div>
                      <div className="font-medium text-gray-900 text-sm">{a.label}</div>
                      <div className="text-xs text-gray-500">{a.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Map */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Location</h2>
            <div className="w-full h-56 rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
              {mapEmbedUrl ? (
                <iframe
                  src={mapEmbedUrl}
                  width="100%"
                  height="100%"
                  loading="lazy"
                  className="border-0"
                  title={`Map showing ${listing.location}`}
                />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-gray-500">
                  Loading map…
                </div>
              )}
            </div>
          </section>


          {/* Seller / Managed By */}
          {seller && (
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Listed By</h2>
              <button
                type="button"
                onClick={() => { if (sellerId) window.location.href = `/routes/profile-view/${sellerId}`; }}
                className="w-full flex items-start gap-3 border border-gray-200 p-4 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all cursor-pointer text-left"
              >
                {/* Avatar */}
                <div className="relative w-12 h-12 rounded-full overflow-hidden bg-linear-to-br from-blue-500 to-blue-600 shrink-0">
                  {sellerAvatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={sellerAvatar} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-lg font-bold text-white">
                      {sellerInitial}
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <p className="font-semibold text-gray-900 text-sm">{sellerName}</p>
                    {showVerified ? (
                      <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-medium shrink-0">Verified</span>
                    ) : (
                      <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full font-medium shrink-0">Not Verified</span>
                    )}
                  </div>
                  <p className="text-gray-500 text-xs">
                    {isAdminSeller ? "FindAfriq Admin" : "Registered seller on FindAfriq"}
                  </p>
                  {seller.email && (
                    <p className="text-gray-500 text-xs mt-1 truncate">{seller.email}</p>
                  )}
                  <div className="flex items-center gap-1 mt-2 text-xs text-blue-600 font-medium">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    View Profile
                  </div>
                </div>
              </button>
            </section>
          )}

          {/* Reviews */}
          <section>
            <ReviewsList
              key={reviewsKey}
              itemType="buy-sell"
              itemId={listingId}
              itemTitle={listing.title}
            />
          </section>
        </div>

        {/* ═══ RIGHT COLUMN ══════════════════════════════════════════════ */}
        <div className="lg:col-span-1">
          <div className="mx-auto max-w-sm lg:flex lg:flex-col lg:h-full">

            {/* Sticky price card */}
            <aside className="lg:sticky lg:top-[calc(4rem+0.75rem)] lg:z-30 shrink-0">
              <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">

                {/* Price section */}
                <div className="bg-linear-to-br from-blue-50 to-white p-6">
                  {listing.isPremium && (
                    <div className="mb-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-linear-to-r from-amber-400 to-amber-500 text-white rounded-full text-xs font-bold shadow-sm">
                      <span>⭐</span>
                      <span>Premium Listing</span>
                    </div>
                  )}

                  <div className="flex items-baseline gap-1.5">
                    <div className="text-4xl font-bold text-gray-900">
                      ${listing.price.toLocaleString()}
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Listed price</p>

                  {(listing as any).agentFee != null && (
                    <div className="mt-4 rounded-xl border border-gray-200 bg-white p-4 space-y-3">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Payment Details</p>
                      <div className="flex items-start gap-3 p-3 rounded-lg border border-gray-100 bg-gray-50">
                        <div className="shrink-0 w-9 h-9 rounded-full bg-green-100 flex items-center justify-center">
                          <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-sm font-semibold text-gray-900">Agent Fee</span>
                          <p className="text-xs text-gray-500 mt-0.5">Fee set by the listing agent or real estate agency.</p>
                          <p className="text-xs text-gray-400 mt-0.5">This fee is paid directly to the agent.</p>
                        </div>
                        <span className="shrink-0 text-base font-bold text-green-600">${(listing as any).agentFee.toLocaleString()}</span>
                      </div>
                      <div className="flex items-start gap-3 p-3 rounded-lg border border-amber-200 bg-amber-50">
                        <div className="shrink-0 w-8 h-8 rounded-full bg-amber-400 flex items-center justify-center">
                          <span className="text-white text-sm font-bold">!</span>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-amber-800">Payment Integration Coming Soon!</p>
                          <p className="text-xs text-amber-700 mt-0.5">Please contact the agent for payment instructions.</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between px-1">
                        <div className="flex items-center gap-2">
                          <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          <span className="text-sm font-semibold text-gray-700">Total Amount to Pay Agent</span>
                        </div>
                        <span className="text-base font-bold text-gray-900">${(listing as any).agentFee.toLocaleString()}</span>
                      </div>
                    </div>
                  )}

                  {/* Category badge in card */}
                  <div className={`mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${CATEGORY_COLOR[listing.category] || "bg-gray-100 text-gray-700"}`}>
                    {categoryLabel}
                  </div>

                  {/* Non-approved status */}
                  <StatusBanner status={listing.status} />
                </div>

                {/* Action buttons */}
                <div className="p-6 space-y-3 border-t border-gray-100">
                  {/* WhatsApp */}
                  <button
                    type="button"
                    onClick={handleWhatsApp}
                    className="w-full h-12 text-sm font-semibold bg-[#25D366] hover:bg-[#1fb855] text-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                    <span>{currentUser ? "WhatsApp Seller" : "Sign in to WhatsApp"}</span>
                    {!currentUser && <Lock className="w-3.5 h-3.5" />}
                  </button>

                  {/* Book Viewing */}
                  {isApproved && (
                    <button
                      type="button"
                      onClick={() => {
                        if (!currentUser) { window.location.href = "/routes/login"; return; }
                        setShowBookingModal(true);
                      }}
                      className="w-full h-12 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>{currentUser ? "Book Viewing Now" : "Sign in to Book"}</span>
                      {!currentUser && <Lock className="w-3.5 h-3.5" />}
                    </button>
                  )}
                </div>
              </div>
            </aside>

            {/* Chat box (below sticky card) */}
            <div className="mt-4 space-y-4 lg:flex-1">
              {!currentUser ? (
                <div className="rounded-xl border border-gray-200 bg-white p-6 text-center shadow-lg">
                  <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-linear-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                    <MessageCircle className="w-7 h-7 text-gray-500" />
                  </div>
                  <p className="text-sm font-medium text-gray-900 mb-2">Message the Seller</p>
                  <p className="text-xs text-gray-500 mb-4">Sign in to start a conversation</p>
                  <button
                    onClick={() => (window.location.href = "/routes/login")}
                    className="h-10 w-full rounded-lg bg-gray-900 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-gray-800"
                  >
                    Sign In to Chat
                  </button>
                </div>
              ) : sellerId && !isOwnListing ? (
                <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-lg">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center">
                      <MessageCircle className="w-4 h-4 text-blue-600" />
                    </div>
                    <span className="text-sm font-semibold text-gray-900">Message Seller</span>
                  </div>
                  <ChatBox
                    userId={currentUser.id}
                    landlordId={sellerId}
                    propertyId={listingId}
                  />
                </div>
              ) : null}

              <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
                <p className="text-xs font-medium text-blue-900">
                  💡 <span className="font-semibold">Tip:</span> Always verify the item/property
                  in person before making a payment. Stay safe — never pay before seeing.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Book Viewing modal ──────────────────────────────────────────── */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-xl sm:rounded-2xl max-w-lg w-full shadow-2xl max-h-[95vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-blue-600 px-4 sm:px-6 py-4 sm:py-5 rounded-t-xl sm:rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0 pr-2">
                  <h3 className="text-lg sm:text-2xl font-bold text-white truncate">Book a Viewing</h3>
                  <p className="text-xs sm:text-sm text-blue-100 mt-1">Schedule a time to view this listing</p>
                </div>
                <button
                  onClick={() => setShowBookingModal(false)}
                  className="text-white/80 hover:text-white hover:bg-white/10 rounded-full p-2 transition-all"
                  disabled={bookingSubmitting}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="p-4 sm:p-6 space-y-4">
              {/* Listing summary */}
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-gray-900 text-sm truncate">{listing?.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{listing?.location}</p>
                  <p className="text-base font-bold text-blue-600 mt-1">${listing?.price.toLocaleString()}</p>
                </div>
              </div>

              {/* Preferred viewing date */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-2">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Preferred Viewing Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={bookingData.viewingDate}
                  onChange={e => setBookingData(prev => ({ ...prev, viewingDate: e.target.value }))}
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  required
                />
              </div>

              {/* Contact phone */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-2">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  Contact Phone <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={bookingData.contactPhone}
                  onChange={e => setBookingData(prev => ({ ...prev, contactPhone: e.target.value }))}
                  placeholder="+231 886 149 219"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>

              {/* Message */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-2">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                  </svg>
                  Message <span className="text-xs font-normal text-gray-500">(Optional)</span>
                </label>
                <textarea
                  rows={3}
                  value={bookingData.message}
                  onChange={e => setBookingData(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="Any specific time preference or questions for the seller..."
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
                />
              </div>

              <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-4 text-sm text-blue-800">
                The seller will receive your request and contact you to confirm the viewing details.
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-gray-50 px-4 sm:px-6 py-3 sm:py-4 rounded-b-xl sm:rounded-b-2xl border-t border-gray-200">
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <button
                  className="w-full sm:flex-1 h-11 text-sm font-semibold bg-white hover:bg-gray-100 text-gray-700 rounded-xl border-2 border-gray-300 transition-all order-2 sm:order-1"
                  onClick={() => setShowBookingModal(false)}
                  disabled={bookingSubmitting}
                >
                  Cancel
                </button>
                <button
                  className="w-full sm:flex-[2] h-11 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2 order-1 sm:order-2"
                  onClick={handleSubmitBooking}
                  disabled={bookingSubmitting}
                >
                  {bookingSubmitting ? (
                    <><svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/></svg>Submitting…</>
                  ) : (
                    <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>Submit Viewing Request</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Contact modal ────────────────────────────────────────────────── */}
      {showContactModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Contact Seller</h3>
                <p className="text-sm text-gray-600 mt-1">Send a direct message</p>
              </div>
              <button
                onClick={() => setShowContactModal(false)}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-1 transition-colors"
                disabled={submitting}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">📋 Subject</label>
                <input
                  type="text"
                  id="bs-contact-subject"
                  defaultValue={`Inquiry about ${listing?.title || "your listing"}`}
                  placeholder="e.g., Questions about the listing"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">💬 Your Message</label>
                <textarea
                  id="bs-contact-message"
                  rows={5}
                  placeholder="Ask about the item, negotiate the price, or request more details..."
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
                />
              </div>

              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <p className="text-sm text-green-900">
                  ✅ <span className="font-semibold">Quick Response:</span> Most sellers respond within 24 hours.
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  className="flex-1 h-12 text-sm font-semibold bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-xl transition-all"
                  onClick={() => setShowContactModal(false)}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  className="flex-1 h-12 text-sm font-semibold bg-linear-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-xl shadow-lg transition-all disabled:opacity-50"
                  disabled={submitting}
                  onClick={() => {
                    const subject = (document.getElementById("bs-contact-subject") as HTMLInputElement)?.value || "";
                    const message = (document.getElementById("bs-contact-message") as HTMLTextAreaElement)?.value || "";
                    if (message.trim()) {
                      handleSendMessage(subject, message);
                    } else {
                      toast.error("Please enter a message before sending.");
                    }
                  }}
                >
                  {submitting ? "Sending…" : "Send Message ✉️"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
