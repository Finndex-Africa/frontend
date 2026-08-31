"use client";

import { useTranslations } from "next-intl";
import { CURRENCIES, CURRENCY_META, type Currency } from "@/lib/currency/config";

/**
 * Currency picker for listing forms.
 *
 * Sits beside a price input so the seller states which currency their price is
 * in. That choice is stored on the listing and is authoritative — the platform
 * never re-derives it, so a Kigali rent stays a fixed RWF figure.
 */
export default function CurrencySelect({
  value,
  onChange,
  name = "currency",
  id,
  disabled,
  className = "",
}: {
  value: Currency;
  onChange: (next: Currency) => void;
  name?: string;
  id?: string;
  disabled?: boolean;
  className?: string;
}) {
  const t = useTranslations("currencySwitcher");

  return (
    <select
      id={id}
      name={name}
      value={value}
      disabled={disabled}
      aria-label={t("changeCurrency")}
      onChange={(e) => onChange(e.target.value as Currency)}
      className={`px-3 py-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent ${className}`}
    >
      {CURRENCIES.map((c) => (
        <option key={c} value={c}>
          {CURRENCY_META[c].label}
        </option>
      ))}
    </select>
  );
}
