"use client";
import { useState, useEffect } from "react";
import PropertyCard, {
  Property,
} from "@/components/domain/PropertyCard";
import ServiceCard, { Service } from "@/components/domain/ServiceCard";
import SearchBar from "@/components/ui/SearchBar";
import HeroVerifiedBadge from "@/components/ui/HeroVerifiedBadge";
import VerifiedTrustedBanner from "@/components/ui/VerifiedTrustedBanner";
import AdvertisementBanner from "@/components/ui/AdvertisementBanner";
import TestimonialsSection from "@/components/ui/TestimonialsSection";
import PartnerLogos from "@/components/ui/PartnerLogos";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { propertiesApi, servicesApi } from "@/services/api";
import { buySellApi } from "@/services/api";
import { useErrorMessage } from "@/lib/error-messages";
import {
  Property as ApiProperty,
  Service as ApiService,
} from "@/types/dashboard";
import type { BuySellListing } from "@/types/buy-sell";
import { useAuth } from "@/providers";
import { normalizeApiEntityList } from "@/lib/normalize-api-entity";
import { bookmarksApi } from "@/services/api/bookmarks.api";
import BuySellCard from "@/components/domain/BuySellCard";


const partnerLogos = [
  { name: "Partner 1", logoUrl: "/images/partners/partner1.jpeg" },
  { name: "Partner 2", logoUrl: "/images/partners/partner2.jpeg" },
  { name: "Partner 3", logoUrl: "/images/partners/partner3.jpeg" },
  { name: "Partner 4", logoUrl: "/images/partners/partner4.jpeg" },
  { name: "Partner 5", logoUrl: "/images/partners/partner5.jpeg" },
  { name: "Partner 6", logoUrl: "/images/partners/partner6.jpeg" },
];

// Adapter functions to convert API data to component types
type CardTranslator = (
  key: string,
  values?: Record<string, string | number | Date>,
) => string;

const adaptPropertyToCard = (
  apiProperty: ApiProperty,
  tCard: CardTranslator,
  locale: string,
): Property => {
  const amenities = [];

  // Build amenities array from property data (use rooms as fallback when bedrooms missing)
  const bedroomCount =
    apiProperty.bedrooms != null ? apiProperty.bedrooms : apiProperty.rooms;
  if (bedroomCount != null) {
    amenities.push(tCard("bedrooms", { count: bedroomCount }));
  } else {
    amenities.push(tCard("bedroomsUnspecified"));
  }
  if (apiProperty.bathrooms) {
    amenities.push(tCard("bathrooms", { count: apiProperty.bathrooms }));
  }
  if (apiProperty.area) {
    amenities.push(tCard("minutesFromMainRoad", { minutes: apiProperty.area }));
  }

  // Fallback to a default if no amenities
  if (amenities.length === 0) {
    amenities.push(apiProperty.type);
  }

  const defaultImage = "/images/properties/pexels-photo-323780.jpeg";

  const propertyType = apiProperty.propertyType || apiProperty.type || "";
  return {
    id: apiProperty._id,
    title: apiProperty.title,
    location: apiProperty.location,
    price: `$${apiProperty.price}`,
    imageUrl: apiProperty.images?.[0] || defaultImage,
    imageUrls: apiProperty.images?.length ? apiProperty.images : [defaultImage],
    amenities,
    rating: apiProperty.rating
      ? Number(apiProperty.rating.toFixed(2))
      : undefined,
    distance: undefined,
    dates: apiProperty.availableFrom
      ? tCard("availableFrom", {
          date: new Date(apiProperty.availableFrom).toLocaleDateString(locale),
        })
      : undefined,
    propertyType: propertyType || undefined,
    isBookmarked: apiProperty.isBookmarked,
    sourceLang: apiProperty.sourceLang,
    translations: apiProperty.translations,
    translationSource: apiProperty.translationSource,
  };
};

const adaptServiceToCard = (
  apiService: ApiService,
  tCard: CardTranslator,
): Service => {
  // Extract tags from category and description
  const tags = [( apiService.category ?? "").replace(/_/g, " ")].filter(Boolean);

  const defaultServiceImages: Record<string, string> = {
    electrical: "/images/services/electricity1.jpeg",
    plumbing: "/images/services/plumbing1.jpeg",
    cleaning: "/images/services/cleaning1.jpeg",
    painting_decoration: "/images/services/cleaning1.jpeg",
    carpentry_furniture: "/images/services/cleaning1.jpeg",
    moving_logistics: "/images/services/cleaning1.jpeg",
    security_services: "/images/services/cleaning1.jpeg",
    sanitation_services: "/images/services/cleaning1.jpeg",
    maintenance: "/images/services/cleaning1.jpeg",
    other: "/images/services/cleaning1.jpeg",
  };
  const defaultImage =
    defaultServiceImages[apiService.category] || defaultServiceImages["other"];

  // Extract provider info if available
  const provider =
    typeof apiService.provider === "object" && apiService.provider
      ? {
          name: apiService.provider.name || tCard("defaultProviderName"),
          photo: undefined, // Backend would need to provide this
        }
      : undefined;

  return {
    id: apiService._id,
    name: apiService.title,
    location: apiService.location,
    rating: apiService.rating ? Number(apiService.rating.toFixed(2)) : 0,
    reviews: 0, // API doesn't provide review count yet
    imageUrl: apiService.images?.[0] || defaultImage,
    tags,
    badge: apiService.category
      ? apiService.category
          .replace(/_/g, " ")
          .replace(/\b\w/g, (c) => c.toUpperCase())
      : undefined,
    provider,
    isBookmarked: apiService.isBookmarked,
    sourceLang: apiService.sourceLang,
    translations: apiService.translations,
    translationSource: apiService.translationSource,
  };
};

export default function HomePage() {
  const errorMessage = useErrorMessage();
  const locale = useLocale();
  const t = useTranslations("home");
  const tCard = useTranslations("propertyCard");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const { setRole } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [buySellListings, setBuySellListings] = useState<BuySellListing[]>([]);
  const [loadingProperties, setLoadingProperties] = useState(true);
  const [loadingServices, setLoadingServices] = useState(true);
  const [loadingBuySell, setLoadingBuySell] = useState(true);
  const [propertiesError, setPropertiesError] = useState<string | null>(null);
  const [servicesError, setServicesError] = useState<string | null>(null);
  const [listingCounts, setListingCounts] = useState<{ properties: number; services: number; buySell: number } | null>(null);

  // Handle logout from dashboard
  useEffect(() => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    const isLogout = url.searchParams.get("logout") === "true";
    if (isLogout) {
      console.log("🚪 Logout request from dashboard");
      // Clear all auth storage
      localStorage.removeItem("token");
      localStorage.removeItem("authToken"); // legacy cleanup
      localStorage.removeItem("user");
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("authToken"); // legacy cleanup
      sessionStorage.removeItem("user");
      setRole("guest");

      // Remove logout parameter from URL
      url.searchParams.delete("logout");
      window.history.replaceState({}, "", url.toString());
    }
  }, [setRole]);

  // On mount, print any persistent debug logs (helpful after redirects)
  useEffect(() => {
    try {
      // dynamic import to avoid bundling in production vendor churn
      import("@/utils/persistentLogger").then((mod) => {
        const logs = mod.getLogs();
        if (logs && logs.length) {
          // Print compact summary to console
          console.groupCollapsed(`Persistent logs (${logs.length})`);
          logs
            .slice(-50)
            .forEach((l: any) => console.log(l.ts, l.level, l.message, l.meta));
          console.groupEnd();
        }
      });
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    // Fetch properties from API
    const fetchProperties = async () => {
      try {
        setLoadingProperties(true);
        const response = await propertiesApi.getAll({
          page: 1,
          limit: 10,
          status: "approved",
          sort: "-createdAt", // Sort by most recent first
        });
        // Handle both response structures: response.data.data or response.data
        const propertiesData = normalizeApiEntityList<ApiProperty>(
          response.data?.data || response.data,
        );
        const adaptedProperties = propertiesData.map((prop) =>
          adaptPropertyToCard(prop, tCard, locale),
        );
        setProperties(adaptedProperties);
        setPropertiesError(null);
      } catch (error: any) {
        console.error("Error fetching properties:", error);
        console.error(
          "Error details:",
          error?.response?.data || error?.message,
        );
        setPropertiesError(
          errorMessage(
            error,
            t("propertiesLoadError"),
          ),
        );
        setProperties([]);
      } finally {
        setLoadingProperties(false);
      }
    };

    // Fetch services from API
    const fetchServices = async () => {
      try {
        setLoadingServices(true);
        const response = await servicesApi.getAll({
          page: 1,
          limit: 10,
          status: "active",
          sort: "-createdAt", // Sort by most recent first
        });
        // Handle both response structures: response.data.data or response.data
        const servicesData = response.data?.data || response.data;
        const adaptedServices = servicesData.map((svc: ApiService) =>
          adaptServiceToCard(svc, tCard),
        );
        setServices(adaptedServices);
        setServicesError(null);
      } catch (error) {
        console.error("Error fetching services:", error);
        setServicesError(
          errorMessage(
            error,
            t("servicesLoadError"),
          ),
        );
        setServices([]);
      } finally {
        setLoadingServices(false);
      }
    };

    const fetchBuySell = async () => {
      try {
        setLoadingBuySell(true);
        const token = typeof window !== "undefined"
          ? (localStorage.getItem("token") || sessionStorage.getItem("token"))
          : null;

        // Fetch listings + saved IDs in parallel (one bulk call, not one per card)
        const [res, savedItems] = await Promise.allSettled([
          buySellApi.getAll({ page: 1, limit: 10, status: "approved" }),
          token ? bookmarksApi.getAll("buy-sell") : Promise.resolve([]),
        ]);

        const items = res.status === "fulfilled" ? (res.value.data ?? []) : [];
        const saved = savedItems.status === "fulfilled" ? savedItems.value : [];
        const savedSet = new Set(saved.map((s) => s.listing._id));

        setBuySellListings(items.map((l) => ({ ...l, isBookmarked: savedSet.has(l._id) })));

        const buySellTotal = res.status === "fulfilled" ? (res.value.pagination?.totalItems ?? 0) : 0;
        setListingCounts(prev => prev ? { ...prev, buySell: buySellTotal } : { properties: 0, services: 0, buySell: buySellTotal });
      } catch {
        setBuySellListings([]);
      } finally {
        setLoadingBuySell(false);
      }
    };

    const fetchCounts = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
        const res = await fetch(`${API_URL}/properties/public/stats`);
        const json = await res.json();
        const d = json?.data as Record<string, unknown> | undefined;
        if (!d) return;
        const properties = Number(d.approvedProperties) || 0;
        const services = Number(d.totalServices ?? d.totalServiceProviders) || 0;
        setListingCounts(prev => ({
          properties,
          services,
          buySell: prev?.buySell ?? 0,
        }));
      } catch {
        // non-critical, counts just won't show
      }
    };

    fetchProperties();
    fetchServices();
    fetchBuySell();
    fetchCounts();
  }, []);
  return (
    <div className="min-h-screen bg-white">
      {/* Hero — fixed image heights (same as Properties); mobile: stacked headline + search with extra gap; md+: unchanged overlap */}
      <section className="relative z-20 w-full overflow-visible pb-3 md:h-[400px] md:pb-0">
        <div className="absolute inset-0 overflow-hidden">
          {/*
            This is the LCP element. `priority` preloads it; `fetchPriority`
            and an explicit `sizes` tell the browser it is the important one
            and stop it downloading a desktop-width crop on a phone.
          */}
          <Image
            src="/images/properties/bg.jpeg"
            alt={t("heroImageAlt")}
            fill
            sizes="100vw"
            className="object-cover object-[center_30%]"
            priority
            fetchPriority="high"
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>

        <div className="relative z-[5] flex flex-col md:h-[400px]">
          <div className="px-4 pt-14 pb-2 sm:pb-3 text-center text-white md:flex md:flex-1 md:flex-col md:items-center md:justify-center md:px-4 md:pt-0 md:pb-0">
            <HeroVerifiedBadge />
            <h1 className="max-w-4xl mx-auto font-extrabold drop-shadow-lg text-2xl leading-snug sm:text-3xl sm:leading-snug md:inline-block md:text-5xl md:leading-tight">
              <span className="block md:inline">{t("heroTitleLine1")} </span>
              <span className="block md:inline">{t("heroTitleLine2")}</span>
            </h1>
            <div className="mx-auto mt-6 hidden w-full max-w-3xl md:block">
              <SearchBar />
            </div>
          </div>

          <div className="relative z-30 isolate mt-2 px-4 pb-3 sm:mt-4 md:hidden">
            <div className="container-app max-w-5xl mx-auto">
              <SearchBar />
            </div>
          </div>
        </div>
      </section>

      <div className="relative z-0 mt-4 md:mt-8 pb-4">
        <VerifiedTrustedBanner />
      </div>


      {/* Trusted by Leading Organizations and Service Providers - disabled for now */}
      {false && (
        <section className="container-app pt-40 sm:pt-44 md:pt-48 pb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-center mb-4 sm:mb-6 px-4">
            {t("trustedByHeading")}
          </h2>
          <PartnerLogos partners={partnerLogos} />
        </section>
      )}

      {/* Property Grid */}
      <div className="container-app pt-6 pb-12">
        <div className="flex items-center gap-3 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900">{t("exploreProperties")}</h2>
        </div>
        {loadingProperties ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 "></div>
          </div>
        ) : propertiesError ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-600 mb-4">{propertiesError}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              {tCommon("retry")}
            </button>
          </div>
        ) : properties.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
            <p className="text-gray-600 text-lg">{t("noProperties")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-3 gap-y-6 sm:gap-x-6 sm:gap-y-10">
            {properties.map((property) => (
              <PropertyCard key={property.id} p={property} compact />
            ))}
          </div>
        )}
      </div>

      {/* Continue exploring section */}
      <div>
        <div className="container-app py-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-8">
            {t("continueExploringProperties")}
          </h2>
          <button
            className="cursor-pointer bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors"
            onClick={() => router.push("/routes/properties")}
          >
            {tCommon("showMore")}
          </button>
        </div>
      </div>

      {/* Divider between Properties and Services */}
      <div className="container-app">
        <hr className="border-gray-200" />
      </div>

      {/* Services Section */}
      <div className="container-app py-12">
        <div className="flex items-center gap-3 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900">{t("exploreServices")}</h2>
        </div>
        {loadingServices ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : servicesError ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-600 mb-4">{servicesError}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors shadow-md"
            >
              {tCommon("retry")}
            </button>
          </div>
        ) : services.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
            <p className="text-gray-600 text-lg">{t("noServices")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-3 gap-y-6 sm:gap-x-6 sm:gap-y-10">
            {services.map((service) => (
              <ServiceCard key={service.id} service={service} compact />
            ))}
          </div>
        )}
      </div>

      {/* Continue exploring services */}
      <div>
        <div className="container-app py-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-8">
            {t("moreServices")}
          </h2>
          <button
            className="cursor-pointer bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors"
            onClick={() => router.push("/routes/services")}
          >
            {t("showMoreServices")}
          </button>
        </div>
      </div>

      {/* Divider */}
      <div className="container-app">
        <hr className="border-gray-200" />
      </div>

      {/* Buy & Sell Section */}
      <div className="container-app pt-12 pb-6">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900">{t("buySellHeading")}</h2>
        </div>

        {loadingBuySell ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-3 gap-y-6 sm:gap-x-4 sm:gap-y-8">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="bg-gray-100 rounded-2xl animate-pulse aspect-4/3" />
            ))}
          </div>
        ) : buySellListings.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-3 gap-y-6 sm:gap-x-4 sm:gap-y-8">
            {buySellListings.map(listing => (
              <BuySellCard key={listing._id} listing={listing} />
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">{t("noBuySell")}</p>
        )}
      </div>

      {/* Continue exploring Buy & Sell */}
      <div>
        <div className="container-app py-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-8">
            {t("moreBuySell")}
          </h2>
          <button
            className="cursor-pointer bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors"
            onClick={() => router.push("/routes/buy-and-sell")}
          >
            {t("showMoreListings")}
          </button>
        </div>
      </div>

      {/* Advertisement Banner — Connecting you Seamlessly */}
      <AdvertisementBanner />

      {/* Testimonials Section */}
      <TestimonialsSection />

      {/* CTA - Join Us on Our Journey */}
      <section className="bg-blue-600 py-16 text-white text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          {t("ctaHeading")}
        </h2>
        <p className="text-lg md:text-xl max-w-2xl mx-auto mb-6">
          {t("ctaBody")}
        </p>
        <Link
          href="/routes/login"
          className="inline-block bg-white text-blue-600 font-semibold px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors"
        >
          {t("ctaButton")}
        </Link>
      </section>
    </div>
  );
}
