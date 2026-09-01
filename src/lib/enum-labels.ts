import { useTranslations } from "next-intl";
import { useCallback } from "react";

/**
 * Backend `propertyType` is free-text and `category` values are snake_case,
 * so listing data arrives as "house", "House", "Office Space",
 * "painting_decoration", … Normalize before looking up a translation.
 */
export function normalizeEnumKey(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_")
    .replace(/[^a-z0-9_]/g, "")
    // "Painting & Decoration" → "painting__decoration" → "painting_decoration"
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");
}

/** Title-cases an unknown value so it still reads acceptably: "guest_house" → "Guest House". */
function humanize(value: string): string {
  return value
    .replace(/_/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Translates a backend enum-ish value via the given namespace, falling back to
 * a humanized version of the raw value when there's no catalog entry — so a
 * new property type added server-side degrades gracefully instead of throwing.
 *
 *   const propertyType = useEnumLabel("propertyTypes");
 *   propertyType("house")             // "House" / "Maison"
 *   propertyType("geodesic_dome")     // "Geodesic Dome" (both locales)
 */
type EnumNamespace =
  | "propertyTypes"
  | "serviceCategories"
  | "buySellCategories"
  | "amenities"
  | "amenityDescriptions"
  | "ownerRoles"
  | "buySellSubcategories"
  | "landUnits";

export function useEnumLabel(namespace: EnumNamespace) {
  const t = useTranslations(namespace);

  return useCallback(
    (value: string | null | undefined): string => {
      if (!value) return "";
      const key = normalizeEnumKey(value);
      return t.has(key) ? t(key) : humanize(value);
    },
    [t],
  );
}

/**
 * Same lookup, but returns "" instead of humanizing when there's no entry.
 *
 * Use where a miss should fall through to another source rather than echo the
 * input — e.g. amenity descriptions, which fall back to the value stored on
 * the listing itself.
 */
export function useOptionalEnumLabel(namespace: EnumNamespace) {
  const t = useTranslations(namespace);

  return useCallback(
    (value: string | null | undefined): string => {
      if (!value) return "";
      const key = normalizeEnumKey(value);
      return t.has(key) ? t(key) : "";
    },
    [t],
  );
}
