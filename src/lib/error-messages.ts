/**
 * Turn API/server errors into clear, localized messages.
 * Use everywhere we show errors to the user (toast, setError, etc.).
 *
 *   const errorMessage = useErrorMessage();
 *   toast.error(errorMessage(error, "createProperty"));
 *
 * The resolver is pure and locale-agnostic — it decides *which* message applies
 * and returns a catalog key. `useErrorMessage` does the translation.
 */
import { useTranslations } from "next-intl";
import { useCallback } from "react";

/** Callers pass whatever `catch` gave them, so accept unknown and narrow here. */
export type AnyError = unknown;

type ErrorShape = {
  message?: unknown;
  code?: unknown;
  response?: { status?: number; data?: { message?: unknown; error?: unknown } };
};

function asError(error: AnyError): ErrorShape {
  return error && typeof error === "object" ? (error as ErrorShape) : {};
}

/** Normalizes a backend message into a catalog key, matching messages/*.json errors.server */
function serverKey(message: string): string {
  return message
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");
}

function rawMessage(raw: AnyError): string | undefined {
  const error = asError(raw);
  const data = error.response?.data;
  if (!data) return typeof error.message === "string" ? error.message : undefined;
  const msg = data.message;
  if (Array.isArray(msg)) return msg.join(" ");
  if (typeof msg === "string") return msg;
  if (typeof data.error === "string") return data.error;
  return typeof error.message === "string" ? error.message : undefined;
}

/** Upload errors the API phrases inconsistently; collapse them onto one key each. */
const UPLOAD_ALIASES: Record<string, string> = {
  "File size exceeds 10MB limit": "fileTooLarge",
  "This file is too large. Maximum size is 10MB per file. Please choose a smaller image or compress it.":
    "fileTooLarge",
  "Invalid file type": "badFileType",
  "This file type is not allowed. Please use JPG, PNG, GIF, WebP, PDF, or MP4.":
    "badFileType",
  "No file provided": "noFile",
  "No file provided. Please select a file to upload.": "noFile",
  "No files provided": "noFiles",
};

/** Axios sets these when the request never reached the server. */
function isNetworkError(raw: AnyError): boolean {
  const error = asError(raw);
  if (error.response) return false; // we got a response, so the network was fine
  const code = typeof error.code === "string" ? error.code : "";
  const msg = typeof error.message === "string" ? error.message.toLowerCase() : "";
  return (
    code === "ERR_NETWORK" ||
    code === "ECONNABORTED" ||
    msg === "network error" ||
    msg.includes("failed to fetch") ||
    msg.includes("networkerror")
  );
}

function isTimeout(raw: AnyError): boolean {
  const error = asError(raw);
  const code = typeof error.code === "string" ? error.code : "";
  const msg = typeof error.message === "string" ? error.message.toLowerCase() : "";
  return code === "ETIMEDOUT" || msg.includes("timeout");
}

export type ResolvedError =
  /** Matched a known message or status — translate `key` in namespace `ns`. */
  | { kind: "key"; ns: "server" | "upload" | "status" | "fallback"; key: string }
  /** Server sent something we don't recognise; show it verbatim. */
  | { kind: "raw"; text: string };

/**
 * Decides which message to show, without translating.
 *
 * Order: network/timeout → known upload alias → known backend message →
 * unrecognised backend text (verbatim) → HTTP status → caller's fallback.
 */
export function resolveError(
  error: AnyError,
  fallbackKey = "generic",
): ResolvedError {
  if (isTimeout(error)) return { kind: "key", ns: "fallback", key: "timeout" };
  if (isNetworkError(error)) return { kind: "key", ns: "fallback", key: "network" };

  const raw = rawMessage(error)?.trim();
  const status = asError(error).response?.status;

  if (raw) {
    const uploadKey = UPLOAD_ALIASES[raw];
    if (uploadKey) return { kind: "key", ns: "upload", key: uploadKey };
    return { kind: "raw", text: raw };
  }

  if (status) return { kind: "key", ns: "status", key: String(status) };
  return { kind: "key", ns: "fallback", key: fallbackKey };
}

/**
 * Returns `(error, fallbackKey?) => string` — a localized message for display.
 *
 * `fallbackKey` names an entry under `errors.fallback` in the catalog
 * (e.g. "createProperty"), used only when nothing more specific matched.
 */
export function useErrorMessage() {
  const t = useTranslations("errors");

  return useCallback(
    (error: AnyError, fallbackKey = "generic"): string => {
      const resolved = resolveError(error, fallbackKey);

      if (resolved.kind === "key") {
        const path = `${resolved.ns}.${resolved.key}`;
        if (t.has(path)) return t(path);
        // Unknown status code, or a fallback key that isn't in the catalog.
        return t(`fallback.${fallbackKey}`) as string;
      }

      // Backend messages have no server-side i18n. Translate the ones we know;
      // otherwise show the server's text rather than a vaguer generic message.
      const known = `server.${serverKey(resolved.text)}`;
      if (t.has(known)) return t(known);
      return resolved.text;
    },
    [t],
  );
}
