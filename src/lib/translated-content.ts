import { useLocale } from "next-intl";
import { useMemo } from "react";

/**
 * Translation payload the API returns alongside author-written text.
 * Written by the backend translation module on create/update.
 *
 * Field names vary by entity: listings use `title`/`description`,
 * reviews use `text`/`ownerReply`.
 */
export interface TranslatableEntity {
  sourceLang?: string;
  /** { fr: { title, description } } or { fr: { text, ownerReply } }. */
  translations?: Record<string, unknown>;
  translationSource?: "machine" | "human";
}

export interface ResolvedText {
  /** What to render. Translated when one exists, otherwise the original. */
  value: string;
  /** The author's original, for the "see original" toggle. */
  original: string;
  /**
   * True when `value` is a machine translation and therefore needs the
   * "translated automatically" disclosure. Human-authored translations and
   * text already in the viewer's language do not.
   */
  isMachineTranslated: boolean;
  /** Language the author wrote in, when known. */
  sourceLang?: string;
}

const EMPTY: ResolvedText = {
  value: "",
  original: "",
  isMachineTranslated: false,
};

function resolveField(
  entity: TranslatableEntity | null | undefined,
  field: string,
  locale: string,
): ResolvedText {
  if (!entity) return EMPTY;

  // Field names vary per entity, so read structurally.
  const record = entity as unknown as Record<string, unknown>;
  const raw = record[field];
  const original = typeof raw === "string" ? raw : "";

  // Author already wrote in this language — never show a translation banner.
  if (entity.sourceLang === locale) {
    return {
      value: original,
      original,
      isMachineTranslated: false,
      sourceLang: entity.sourceLang,
    };
  }

  const bucket = entity.translations?.[locale] as
    Record<string, string | undefined> | undefined;
  const translated = bucket?.[field];
  if (!translated) {
    return {
      value: original,
      original,
      isMachineTranslated: false,
      sourceLang: entity.sourceLang,
    };
  }

  return {
    value: translated,
    original,
    // Human-supplied translations are authoritative; no disclosure needed.
    isMachineTranslated: entity.translationSource !== "human",
    sourceLang: entity.sourceLang,
  };
}

/**
 * Resolves author-written text for the active locale.
 *
 * Follows Airbnb's Translation Engine model: the translation is what renders by
 * default, and the original is available behind a "see original" affordance
 * rather than the other way round.
 *
 *   const t = useTranslatedFields(review, ["text", "ownerReply"]);
 *   <TranslatedText text={t.text} />
 */
export function useTranslatedFields<F extends string>(
  entity: TranslatableEntity | null | undefined,
  fields: readonly F[],
): Record<F, ResolvedText> {
  const locale = useLocale();
  // Join so a fresh array literal on every render doesn't bust the memo.
  const key = fields.join(",");

  return useMemo(
    () =>
      Object.fromEntries(
        key.split(",").map((f) => [f, resolveField(entity, f, locale)]),
      ) as Record<F, ResolvedText>,
    [entity, key, locale],
  );
}

/** Convenience wrapper for listings. */
export function useTranslatedContent(
  entity: TranslatableEntity | null | undefined,
) {
  const locale = useLocale();

  return useMemo(
    () => ({
      title: resolveField(entity, "title", locale),
      description: resolveField(entity, "description", locale),
    }),
    [entity, locale],
  );
}
