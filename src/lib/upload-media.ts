/**
 * Upload user-picked images through `mediaApi`, with the preparation and the
 * error vocabulary that every call site needs.
 *
 *   const urls = await uploadImages(imageFiles, "properties");
 *
 * Call this instead of `mediaApi.upload` directly. It does three things a bare
 * upload doesn't:
 *
 * 1. Runs each file through `prepareUpload`, so a 5MB camera photo goes over
 *    the wire as ~800KB and stays under nginx's `client_max_body_size`.
 * 2. Refuses a file we know the proxy would drop, naming the file and the
 *    reason, instead of letting it fail as an opaque network error.
 * 3. Translates a request that never reached the API into an explanation the
 *    user can act on, rather than "Can't reach the server".
 *
 * Failures are thrown as `UploadFailedError`, which `resolveError` renders from
 * the message catalog — so existing `errorMessage(err, "createProperty")` calls
 * show the precise upload reason without any extra wiring.
 */
import { mediaApi, MediaResponse } from "@/services/api/media.api";
import { prepareUpload } from "@/lib/image-upload";

export type MediaType = "properties" | "users" | "services" | "buy-sell";

/** Carries a message-catalog path so the UI can localize it; see error-messages.ts. */
export class UploadFailedError extends Error {
  readonly i18nKey: string;
  readonly i18nValues: Record<string, string>;

  constructor(i18nKey: string, values: Record<string, string> = {}) {
    super(`${i18nKey} ${JSON.stringify(values)}`);
    this.name = "UploadFailedError";
    this.i18nKey = i18nKey;
    this.i18nValues = values;
  }
}

const REASON_KEYS: Record<string, string> = {
  badFileType: "upload.fileRejectedType",
  fileTooLarge: "upload.fileTooLargeNamed",
  tooLargeToSend: "upload.tooLargeToSend",
};

/** True when the request never produced a response — see `uploadOne`. */
function neverReachedServer(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const err = error as { response?: unknown; code?: unknown; message?: unknown };
  if (err.response) return false;
  const code = typeof err.code === "string" ? err.code : "";
  const msg = typeof err.message === "string" ? err.message.toLowerCase() : "";
  return (
    code === "ERR_NETWORK" ||
    msg === "network error" ||
    msg.includes("failed to fetch")
  );
}

export type UploadOptions = {
  /** Groups the file under an entity's folder, when the caller has an id. */
  entityId?: string;
  /** Document fields (e.g. a registration certificate) also accept a PDF scan. */
  allowPdf?: boolean;
};

async function uploadOne(
  file: File,
  type: MediaType,
  { entityId, allowPdf = false }: UploadOptions,
): Promise<MediaResponse> {
  const prepared = await prepareUpload(file, { allowPdf });
  if (!prepared.ok) {
    throw new UploadFailedError(REASON_KEYS[prepared.reason], {
      name: file.name,
    });
  }

  try {
    return await mediaApi.upload(prepared.file, type, entityId);
  } catch (error) {
    // No response at all. The usual cause is the proxy rejecting the body
    // before CORS headers are attached, which the browser can only report as a
    // connection failure — so name both possibilities rather than blaming the
    // user's network.
    if (neverReachedServer(error)) {
      throw new UploadFailedError("upload.uploadBlocked", { name: file.name });
    }
    throw error;
  }
}

/**
 * Uploads one file and returns its URL.
 */
export async function uploadImage(
  file: File,
  type: MediaType,
  options: UploadOptions = {},
): Promise<string> {
  const response = await uploadOne(file, type, options);
  return response.url;
}

/**
 * Uploads images in order and returns their URLs, throwing on the first
 * failure. Sequential on purpose: a handful of parallel uploads saturates a
 * phone's uplink, and failing one at a time is what lets us name the file that
 * went wrong.
 */
export async function uploadImages(
  files: File[],
  type: MediaType,
  options: UploadOptions = {},
): Promise<string[]> {
  const urls: string[] = [];
  for (const file of files) {
    urls.push(await uploadImage(file, type, options));
  }
  return urls;
}
