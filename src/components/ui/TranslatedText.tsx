"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import type { ResolvedText } from "@/lib/translated-content";

/**
 * Renders listing text following Airbnb's Translation Engine pattern:
 * the translation is shown by default and the original sits behind a
 * "Show original" toggle — the inverse of a click-to-translate button.
 *
 * The disclosure only appears for machine translations. Text the author wrote
 * in the viewer's language, or translated by hand, renders untouched.
 */
export default function TranslatedText({
  text,
  as: Tag = "p",
  className = "",
  disclosureClassName = "",
}: {
  text: ResolvedText;
  as?: "p" | "h1" | "h2" | "h3" | "span" | "div";
  className?: string;
  disclosureClassName?: string;
}) {
  const t = useTranslations("translatedContent");
  const [showingOriginal, setShowingOriginal] = useState(false);

  if (!text.value) return null;

  if (!text.isMachineTranslated) {
    return <Tag className={className}>{text.value}</Tag>;
  }

  const body = showingOriginal ? text.original : text.value;

  return (
    <>
      <Tag className={className}>{body}</Tag>
      <div
        className={`mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-500 ${disclosureClassName}`}
      >
        <span className="inline-flex items-center gap-1">
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
            aria-hidden
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
            />
          </svg>
          {t("automaticallyTranslated")}
        </span>
        <span aria-hidden>·</span>
        <button
          type="button"
          onClick={(e) => {
            // These often sit inside a <Link> card — don't navigate.
            e.preventDefault();
            e.stopPropagation();
            setShowingOriginal((v) => !v);
          }}
          className="underline underline-offset-2 hover:text-gray-700 transition-colors"
        >
          {showingOriginal ? t("showTranslation") : t("showOriginal")}
        </button>
      </div>
    </>
  );
}
