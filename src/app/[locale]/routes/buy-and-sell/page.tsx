import { Suspense } from "react";
import BuyAndSellPageContent from "./BuyAndSellPageContent";

export const metadata = {
  title: "Buy & Sell | FindAfriq",
  description:
    "Buy and sell land, houses, and fairly used household items — all in one trusted marketplace on FindAfriq.",
};

export default function BuyAndSellPage() {
  return (
    <Suspense fallback={null}>
      <BuyAndSellPageContent />
    </Suspense>
  );
}
