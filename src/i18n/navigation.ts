import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

/**
 * Locale-aware replacements for next/link and next/navigation.
 *
 * Import Link/useRouter/usePathname/redirect from HERE rather than from
 * `next/link` or `next/navigation` in any component under app/[locale].
 * These keep the active locale in the URL automatically, and `usePathname`
 * returns the path WITHOUT the locale prefix (so `/routes/login` stays
 * `/routes/login` on both /en and /fr).
 */
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
