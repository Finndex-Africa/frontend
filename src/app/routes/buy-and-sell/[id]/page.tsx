import type { Metadata } from "next";
import BuySellDetailClient from "./BuySellDetailClient";

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  // Minimal static metadata; the client fills in the real title/description
  return {
    title: "Listing | FindAfriq Buy & Sell",
    description:
      "View this listing on FindAfriq – buy land, houses, and fairly-used items trusted marketplace.",
    alternates: { canonical: `/routes/buy-and-sell/${id}` },
  };
}

export default function BuySellDetailPage() {
  return <BuySellDetailClient />;
}
