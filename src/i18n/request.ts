import { getRequestConfig } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
    // Africa/Monrovia — FindAfriq's primary market. Keeps server-rendered
    // relative dates consistent with what users see.
    timeZone: "Africa/Monrovia",
    formats: {
      dateTime: {
        short: { day: "numeric", month: "short", year: "numeric" },
        long: { day: "numeric", month: "long", year: "numeric" },
        listing: {
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "numeric",
          minute: "numeric",
        },
      },
      number: {
        currency: { style: "currency", currency: "USD", maximumFractionDigits: 0 },
        compact: { notation: "compact", maximumFractionDigits: 1 },
      },
    },
  };
});
