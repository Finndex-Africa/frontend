import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  // Run on everything except API routes, Next internals, and files with an
  // extension (favicon.ico, images, sitemap.xml, robots.txt, …).
  matcher: ["/((?!api|_next|_vercel|monitoring|.*\\..*).*)"],
};
