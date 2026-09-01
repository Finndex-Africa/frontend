"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useCurrency } from "@/lib/currency/CurrencyProvider";
import { CURRENCIES, CURRENCY_META, type Currency } from "@/lib/currency/config";

/**
 * Currency picker, deliberately mirroring LanguageSwitcher so the two read as a
 * pair in the navbar. Explicit rather than geo-inferred: en/fr does not imply a
 * country, and silently guessing a visitor's currency gets money wrong.
 */
export default function CurrencySwitcher({
  className = "",
  variant = "dropdown",
}: {
  className?: string;
  /** "dropdown" for the desktop navbar, "inline" for the mobile menu. */
  variant?: "dropdown" | "inline";
}) {
  const t = useTranslations("currencySwitcher");
  const { currency, setCurrency } = useCurrency();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const switchTo = (next: Currency) => {
    if (next !== currency) setCurrency(next);
    setOpen(false);
  };

  if (variant === "inline") {
    return (
      <div
        className={`flex items-center gap-2 ${className}`}
        role="group"
        aria-label={t("changeCurrency")}
      >
        {CURRENCIES.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => switchTo(c)}
            aria-current={c === currency ? "true" : undefined}
            className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
              c === currency
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {CURRENCY_META[c].label}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t("changeCurrency")}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-semibold text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-colors"
      >
        {CURRENCY_META[currency].label}
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label={t("label")}
          className="absolute right-0 mt-2 w-44 rounded-xl border border-gray-200 bg-white py-1 shadow-lg z-50"
        >
          {CURRENCIES.map((c) => (
            <li key={c}>
              <button
                type="button"
                role="option"
                aria-selected={c === currency}
                onClick={() => switchTo(c)}
                className={`w-full text-left px-3 py-2 text-sm transition-colors hover:bg-gray-50 ${
                  c === currency ? "font-semibold text-blue-600" : "text-gray-700"
                }`}
              >
                {t(`names.${c}`)}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
