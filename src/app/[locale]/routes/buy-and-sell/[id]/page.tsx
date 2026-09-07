import type { Metadata } from "next";
import BuySellDetailClient from "./BuySellDetailClient";
import JsonLd, { listingJsonLd, breadcrumbJsonLd } from "@/components/global/JsonLd";
import type { Locale } from "@/i18n/routing";
import {
  buildBuySellShareMetadata,
  fetchBuySellForOg,
} from "@/lib/server/listing-open-graph";

type PageProps = {
  params: Promise<{ id: string; locale: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id, locale } = await params;
  // Derived from the listing so each one is distinct; the previous hardcoded
  // title made every Buy & Sell page look like duplicate content.
  const listing = await fetchBuySellForOg(id);
  if (!listing) {
    return { title: "Listing | FindAfriq Buy & Sell" };
  }
  return buildBuySellShareMetadata(listing, locale);
}

export default async function BuySellDetailPage({ params }: PageProps) {
  const { id, locale } = await params;
  const listing = await fetchBuySellForOg(id);
  const lang = locale as Locale;

  return (
    <>
      {listing && (
        <>
          <JsonLd
            data={listingJsonLd(lang, {
              id,
              path: `/routes/buy-and-sell/${id}`,
              // These are goods and land being sold outright, so Product with an
              // Offer is the right shape — unlike rentals, which are Accommodation.
              type: "Product",
              name: listing.title,
              description: listing.description,
              images: listing.images,
              price: listing.price,
              location: listing.location,
              extra: {
                ...(listing.category ? { category: listing.category } : {}),
                ...(listing.condition
                  ? {
                      itemCondition:
                        listing.condition === "new"
                          ? "https://schema.org/NewCondition"
                          : "https://schema.org/UsedCondition",
                    }
                  : {}),
              },
            })}
          />
          <JsonLd
            data={breadcrumbJsonLd(lang, [
              { name: "Home", path: "" },
              { name: "Buy & Sell", path: "/routes/buy-and-sell" },
              { name: listing.title, path: `/routes/buy-and-sell/${id}` },
            ])}
          />
        </>
      )}
      <BuySellDetailClient />
    </>
  );
}
