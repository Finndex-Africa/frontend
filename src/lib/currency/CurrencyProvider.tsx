"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { useRouter } from "@/i18n/navigation";
import {
  CURRENCY_COOKIE,
  CURRENCY_META,
  Currency,
  DEFAULT_CURRENCY,
  RateTable,
  convert,
  isCurrency,
} from "./config";

type CurrencyContextValue = {
  /** The currency the visitor is browsing in. */
  currency: Currency;
  setCurrency: (next: Currency) => void;
  rates: RateTable;
  /**
   * True when rates came from the static fallback rather than a live provider.
   * Surface this if you ever show a rate figure directly to users.
   */
  ratesAreStale: boolean;
};

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

export function useCurrency(): CurrencyContextValue {
  const ctx = useContext(CurrencyContext);
  if (!ctx) {
    throw new Error("useCurrency must be used inside CurrencyProvider");
  }
  return ctx;
}

/**
 * Reads the cookie directly rather than having the server pass it down.
 *
 * That is deliberate: calling `cookies()` in the root layout would opt every
 * page out of static rendering. Listing prices are fetched client-side, so they
 * never appear in the server HTML — there is nothing for a differing server
 * render to mismatch against, and no flash of the wrong currency.
 */
function readCurrencyCookie(): Currency {
  if (typeof document === "undefined") return DEFAULT_CURRENCY;
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${CURRENCY_COOKIE}=([^;]*)`),
  );
  const value = match?.[1] && decodeURIComponent(match[1]);
  return isCurrency(value) ? value : DEFAULT_CURRENCY;
}

export function CurrencyProvider({
  rates,
  children,
}: {
  rates: RateTable;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [currency, setCurrencyState] = useState<Currency>(readCurrencyCookie);

  const setCurrency = useCallback(
    (next: Currency) => {
      setCurrencyState(next);
      // One year, lax: this is a display preference, not a credential.
      document.cookie = `${CURRENCY_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
      // Server components that render prices read the cookie, so they need to
      // re-render too — client state alone would leave them showing the old
      // currency until the next full navigation.
      router.refresh();
    },
    [router],
  );

  const value = useMemo<CurrencyContextValue>(
    () => ({
      currency,
      setCurrency,
      rates,
      ratesAreStale: rates.provider === "fallback",
    }),
    [currency, setCurrency, rates],
  );

  return (
    <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>
  );
}

/**
 * Formats listing prices.
 *
 * Airbnb-style: a listing shows a single price in the currency the visitor
 * chose, converted when it differs from the seller's. No dual display.
 *
 * The tradeoff that buys: a converted figure moves as the rate moves, so the
 * number a seeker saw yesterday may differ today. `original` is returned
 * alongside so detail pages and enquiry flows can show what the seller actually
 * committed to, which is the point at which the difference matters.
 */
export function useMoney() {
  const { currency: display, rates } = useCurrency();

  return useMemo(
    () => ({
      /** Formats an amount in a specific currency. No conversion. */
      format(amount: number | null | undefined, currency: Currency): string {
        if (amount === null || amount === undefined || !Number.isFinite(amount)) {
          return "";
        }
        const { decimals } = CURRENCY_META[currency];
        return new Intl.NumberFormat(undefined, {
          style: "currency",
          currency,
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        }).format(amount);
      },

      /**
       * The price to show on a card, in the visitor's currency.
       *
       * Falls back to the seller's currency if no rate is available — showing
       * the real price in the wrong currency beats showing nothing, and
       * `isConverted` lets callers label it.
       */
      forListing(
        amount: number | null | undefined,
        listingCurrency: Currency | undefined,
      ): { display: string; original: string; isConverted: boolean } {
        const source = listingCurrency ?? DEFAULT_CURRENCY;
        const original = this.format(amount, source);

        if (
          amount === null ||
          amount === undefined ||
          !Number.isFinite(amount) ||
          source === display
        ) {
          return { display: original, original, isConverted: false };
        }

        const converted = convert(amount, source, display, rates);
        if (converted === null) {
          return { display: original, original, isConverted: false };
        }
        return {
          display: this.format(converted, display),
          original,
          isConverted: true,
        };
      },
    }),
    [display, rates],
  );
}
