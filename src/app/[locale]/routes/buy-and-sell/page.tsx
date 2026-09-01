import { getTranslations } from 'next-intl/server';
import { Suspense } from "react";
import BuyAndSellPageContent from "./BuyAndSellPageContent";

export async function generateMetadata() {
    const tMeta = await getTranslations('metadata');
    // Root layout applies the "%s | FindAfriq" title template.
    return { title: tMeta('buySellTitle'), description: tMeta('buySellDesc') };
}

export default function BuyAndSellPage() {
  return (
    <Suspense fallback={null}>
      <BuyAndSellPageContent />
    </Suspense>
  );
}
