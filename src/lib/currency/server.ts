import { Currency, FALLBACK_RATES, RateTable } from "./config";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

/**
 * Exchange rates from the backend.
 *
 * Revalidated every 5 minutes. The backend caches live rates for longer, but an
 * admin can set a manual override in dashboard Settings and expects it to reach
 * shoppers promptly — an hour-long window here made that override look broken.
 * These are cheap cached calls to our own API, not Wise round-trips.
 *
 * Falls back to a static table rather than throwing: an unreachable rates
 * endpoint must not take down every page that happens to render a price.
 */
export async function getRates(): Promise<RateTable> {
  try {
    const res = await fetch(`${API_URL}/currency/rates`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) throw new Error(`rates endpoint returned ${res.status}`);

    const body = await res.json();
    // The API wraps some responses; accept either shape.
    const table = (body?.data ?? body) as Partial<RateTable>;
    if (!table?.rates || typeof table.rates !== "object") {
      throw new Error("rates payload missing `rates`");
    }
    return {
      base: (table.base as Currency) ?? "USD",
      rates: table.rates,
      provider: table.provider ?? "fallback",
      fetchedAt: table.fetchedAt ?? new Date().toISOString(),
    };
  } catch (error) {
    console.warn(
      `[currency] falling back to static rates: ${(error as Error).message}`,
    );
    return FALLBACK_RATES;
  }
}
