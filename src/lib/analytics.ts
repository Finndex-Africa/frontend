/**
 * Google Analytics 4 event tracking utilities.
 *
 * All events are gated behind cookie consent — they only fire when
 * the user has accepted the "analytics" category in the cookie banner.
 *
 * Consent is stored in localStorage under "findafriq_cookie_consent":
 *   { necessary, analytics, marketing, preferences, version, timestamp }
 */

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    gtag?: (...args: any[]) => void;
    dataLayer?: unknown[];
  }
}

const CONSENT_KEY = "findafriq_cookie_consent";

function hasAnalyticsConsent(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const stored = localStorage.getItem(CONSENT_KEY);
    if (!stored) return false;
    const parsed = JSON.parse(stored);
    return parsed?.analytics === true;
  } catch {
    return false;
  }
}

function sendEvent(eventName: string, params?: Record<string, unknown>): void {
  if (!hasAnalyticsConsent()) return;
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  window.gtag("event", eventName, params ?? {});
}

// ---------------------------------------------------------------------------
// 1. Page views — handled automatically by the GoogleAnalytics script in Next.js,
//    but you can also call this manually for SPA navigations if needed.
// ---------------------------------------------------------------------------
export function trackPageView(path: string, title?: string): void {
  sendEvent("page_view", { page_path: path, page_title: title });
}

// ---------------------------------------------------------------------------
// 2. Discovery & Search
// ---------------------------------------------------------------------------
export type SearchType = "homes" | "services";

export function trackSearch(params: {
  type: SearchType;
  location?: string;
  propertyType?: string;
  category?: string;
  budget?: string;
  serviceName?: string;
}): void {
  sendEvent("search", {
    search_type: params.type,
    location: params.location || undefined,
    property_type: params.propertyType || undefined,
    service_category: params.category || undefined,
    max_budget: params.budget || undefined,
    service_name: params.serviceName || undefined,
  });
}

export function trackFilterApplied(filter: string, value: string): void {
  sendEvent("filter_applied", { filter_name: filter, filter_value: value });
}

export function trackFilterCleared(source: "properties" | "services"): void {
  sendEvent("filter_cleared", { source });
}

// ---------------------------------------------------------------------------
// 3. Listing engagement
// ---------------------------------------------------------------------------
export type ListingType = "property" | "service" | "buy-sell";

export function trackListingViewed(params: {
  id: string;
  type: ListingType;
  title?: string;
  location?: string;
  price?: number;
  category?: string;
}): void {
  sendEvent("listing_viewed", {
    listing_id: params.id,
    listing_type: params.type,
    listing_title: params.title,
    listing_location: params.location,
    listing_price: params.price,
    listing_category: params.category,
  });
}

export function trackListingBookmarked(params: {
  id: string;
  type: ListingType;
  action: "add" | "remove";
}): void {
  sendEvent("listing_bookmarked", {
    listing_id: params.id,
    listing_type: params.type,
    bookmark_action: params.action,
  });
}

export function trackListingShared(params: {
  id: string;
  type: ListingType;
  method?: string;
}): void {
  sendEvent("listing_shared", {
    listing_id: params.id,
    listing_type: params.type,
    share_method: params.method || "unknown",
  });
}

export function trackListingCardClicked(params: {
  id: string;
  type: ListingType;
  source: string;
}): void {
  sendEvent("listing_card_clicked", {
    listing_id: params.id,
    listing_type: params.type,
    source_page: params.source,
  });
}

// ---------------------------------------------------------------------------
// 4. Booking funnel
// ---------------------------------------------------------------------------
export function trackBookingModalOpened(params: {
  listingId: string;
  listingType: ListingType;
}): void {
  sendEvent("booking_modal_opened", {
    listing_id: params.listingId,
    listing_type: params.listingType,
  });
}

export function trackBookingSubmitted(params: {
  listingId: string;
  listingType: ListingType;
  rentalPeriod?: string;
  scheduledDate?: string;
}): void {
  sendEvent("booking_submitted", {
    listing_id: params.listingId,
    listing_type: params.listingType,
    rental_period: params.rentalPeriod,
    scheduled_date: params.scheduledDate,
  });
}

export function trackBookingConfirmed(bookingId: string): void {
  sendEvent("booking_confirmed", { booking_id: bookingId });
}

export function trackBookingRejected(bookingId: string, reason?: string): void {
  sendEvent("booking_rejected", { booking_id: bookingId, reason });
}

export function trackBookingCancelled(bookingId: string, cancelledBy: "provider" | "customer"): void {
  sendEvent("booking_cancelled", { booking_id: bookingId, cancelled_by: cancelledBy });
}

// ---------------------------------------------------------------------------
// 5. Contact / lead events
// ---------------------------------------------------------------------------
export function trackWhatsAppClick(params: {
  listingId: string;
  listingType: ListingType;
}): void {
  sendEvent("whatsapp_click", {
    listing_id: params.listingId,
    listing_type: params.listingType,
  });
}

export function trackContactModalOpened(params: {
  listingId: string;
  listingType: ListingType;
}): void {
  sendEvent("contact_modal_opened", {
    listing_id: params.listingId,
    listing_type: params.listingType,
  });
}

export function trackChatStarted(params: {
  recipientRole?: string;
  sourcePage?: string;
}): void {
  sendEvent("chat_started", {
    recipient_role: params.recipientRole,
    source_page: params.sourcePage,
  });
}

// ---------------------------------------------------------------------------
// 6. Auth funnel
// ---------------------------------------------------------------------------
export type UserType =
  | "HomeSeeker"
  | "Agent"
  | "RealEstateAgency"
  | "Landlord"
  | "ServiceProvider";

export function trackSignUp(userType: UserType): void {
  // GA4 recommended event name
  sendEvent("sign_up", { method: "email", user_type: userType });
}

export function trackLogin(): void {
  // GA4 recommended event name
  sendEvent("login", { method: "email" });
}

export function trackEmailVerified(): void {
  sendEvent("email_verification_completed");
}

export function trackPasswordResetRequested(): void {
  sendEvent("password_reset_requested");
}

export function trackPasswordResetCompleted(): void {
  sendEvent("password_reset_completed");
}

// ---------------------------------------------------------------------------
// 7. Listing creation & management (provider side)
// ---------------------------------------------------------------------------
export function trackListingCreated(params: {
  type: ListingType;
  category?: string;
}): void {
  sendEvent("listing_created", {
    listing_type: params.type,
    listing_category: params.category,
  });
}

export function trackListingEdited(params: {
  id: string;
  type: ListingType;
}): void {
  sendEvent("listing_edited", {
    listing_id: params.id,
    listing_type: params.type,
  });
}

export function trackListingUnpublished(params: {
  id: string;
  type: ListingType;
}): void {
  sendEvent("listing_unpublished", {
    listing_id: params.id,
    listing_type: params.type,
  });
}

// ---------------------------------------------------------------------------
// 8. Waitlist signup
// ---------------------------------------------------------------------------
export function trackWaitlistSignup(source: string): void {
  sendEvent("waitlist_signup", { source });
}

// ---------------------------------------------------------------------------
// 9. Reviews
// ---------------------------------------------------------------------------
export function trackReviewSubmitted(params: {
  type: ListingType;
  rating: number;
}): void {
  sendEvent("review_submitted", {
    listing_type: params.type,
    rating: params.rating,
  });
}

// ---------------------------------------------------------------------------
// 10. Pricing
// ---------------------------------------------------------------------------
export function trackPricingPlanClicked(params: {
  plan: string;
  audience: string;
}): void {
  sendEvent("pricing_plan_clicked", {
    plan_name: params.plan,
    audience: params.audience,
  });
}

// ---------------------------------------------------------------------------
// 11. Identity verification funnel
// ---------------------------------------------------------------------------
export function trackIdentityVerificationStarted(role?: string): void {
  sendEvent("identity_verification_started", { user_role: role });
}

export function trackIdentityVerificationSubmitted(params: {
  role?: string;
  idType?: string;
}): void {
  sendEvent("identity_verification_submitted", {
    user_role: params.role,
    id_type: params.idType,
  });
}

// ---------------------------------------------------------------------------
// 12. Scroll depth
// ---------------------------------------------------------------------------
export type ScrollDepthMilestone = 25 | 50 | 75 | 90;

export function trackScrollDepth(milestone: ScrollDepthMilestone, page: string): void {
  sendEvent("scroll_depth", {
    milestone,
    page_path: page,
  });
}
