"use client";

import { useEffect, useRef } from "react";
import { trackScrollDepth, type ScrollDepthMilestone } from "@/lib/analytics";
import { usePathname } from "next/navigation";

const MILESTONES: ScrollDepthMilestone[] = [25, 50, 75, 90];

/**
 * Tracks how far down the page the user scrolls.
 * Fires a GA4 `scroll_depth` event at 25%, 50%, 75%, and 90%.
 * Each milestone fires at most once per page load.
 */
export function useScrollDepth() {
  const pathname = usePathname();
  const fired = useRef<Set<ScrollDepthMilestone>>(new Set());

  useEffect(() => {
    fired.current = new Set();

    const handleScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const docHeight =
        document.documentElement.scrollHeight -
        document.documentElement.clientHeight;

      if (docHeight <= 0) return;

      const pct = Math.round((scrollTop / docHeight) * 100);

      for (const milestone of MILESTONES) {
        if (pct >= milestone && !fired.current.has(milestone)) {
          fired.current.add(milestone);
          trackScrollDepth(milestone, pathname);
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [pathname]);
}
