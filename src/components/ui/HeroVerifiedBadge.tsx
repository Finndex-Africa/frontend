import { ShieldCheck } from "lucide-react";

export default function HeroVerifiedBadge() {
  return (
    <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/25 bg-black/45 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm sm:mt-6 sm:gap-2.5 sm:px-4 sm:py-2 sm:text-sm">
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 sm:h-7 sm:w-7">
        <ShieldCheck className="h-3.5 w-3.5 sm:h-4 sm:w-4" strokeWidth={2.5} />
      </span>
      Verified &amp; Trusted
    </div>
  );
}
