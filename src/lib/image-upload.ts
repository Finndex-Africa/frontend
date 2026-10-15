/**
 * Validate a user-picked file and shrink camera photos before they go over
 * the wire. Most callers want `uploadImages` from `@/lib/upload-media`, which
 * wraps this and the upload itself; reach for `prepareUpload` directly only
 * when you need the prepared File without sending it.
 *
 *   const prepared = await prepareUpload(file);
 *   if (!prepared.ok) return setError(tErr(`upload.${prepared.reason}`));
 *
 * Why downscale at all, when the API accepts 10MB? Two reasons.
 *
 * A phone camera produces 2-8MB JPEGs — far more detail than a listing photo
 * or an ID review needs, and slow to push over mobile data.
 *
 * More importantly, nginx in front of the API enforces
 * `client_max_body_size 1m`, well below the API's own 10MB limit. nginx
 * rejects an oversized request with a 413 that carries no CORS headers, so the
 * browser cannot show it to JavaScript at all: axios sees no response and
 * reports ERR_NETWORK, which we can only phrase as "Can't reach the server".
 * Keeping every request under MAX_REQUEST_BYTES is what stops a size problem
 * from surfacing as a bogus connection problem.
 */

/** Matches MAX_UPLOAD_SIZE_BYTES in the API — keep the two in step. */
export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

/**
 * The real ceiling on a request: nginx's `client_max_body_size` for
 * api.findafriq.com. Anything larger never reaches the API, and comes back as
 * an opaque network failure. Raise this only together with the nginx config.
 */
export const MAX_REQUEST_BYTES = 1024 * 1024;

/** The image types the API's media service accepts. */
const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
];

/** Longest edge we keep. ~2000px still resolves the fine print on an ID. */
const MAX_EDGE = 2000;

/** What we aim to land under: MAX_REQUEST_BYTES with headroom for multipart overhead. */
const TARGET_BYTES = 800 * 1024;

/** Tried in order; we stop at the first that meets TARGET_BYTES. */
const QUALITY_STEPS = [0.85, 0.75, 0.6];

/**
 * `fileTooLarge` — over the API's own 10MB limit.
 * `tooLargeToSend` — under 10MB but still over MAX_REQUEST_BYTES after
 *   compression, so nginx would drop it. Happens with formats this browser
 *   can't decode to a canvas (HEIC on some desktops) and with large PDFs.
 */
export type PreparedUpload =
  | { ok: true; file: File }
  | { ok: false; reason: "badFileType" | "fileTooLarge" | "tooLargeToSend" };

/**
 * Decode via createImageBitmap so EXIF orientation is honoured — phone photos
 * are usually stored landscape with a rotation flag, and drawing the raw
 * pixels would upload a sideways ID.
 */
async function decode(file: File): Promise<ImageBitmap | null> {
  if (typeof createImageBitmap !== "function") return null;
  try {
    return await createImageBitmap(file, {
      imageOrientation: "from-image",
    } as ImageBitmapOptions);
  } catch {
    // Formats the browser can't decode (e.g. HEIC on a desktop browser).
    return null;
  }
}

function toBlob(
  canvas: HTMLCanvasElement,
  quality: number,
): Promise<Blob | null> {
  return new Promise((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", quality),
  );
}

function asJpegName(name: string): string {
  return name.replace(/\.[^.]+$/, "") + ".jpg";
}

/**
 * Returns a smaller JPEG, or the original file when shrinking isn't possible
 * or wouldn't help. Never rejects: a failed compression should still let the
 * user try the upload, not block them.
 */
export async function compressImage(file: File): Promise<File> {
  const bitmap = await decode(file);
  if (!bitmap) return file;

  try {
    const longestEdge = Math.max(bitmap.width, bitmap.height);
    const scale = Math.min(1, MAX_EDGE / longestEdge);

    // Already modest in both dimensions and bytes — re-encoding would only
    // lose detail for nothing.
    if (scale === 1 && file.size <= TARGET_BYTES) return file;

    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));

    const ctx = canvas.getContext("2d");
    if (!ctx) return file;

    // JPEG has no alpha channel; without this, transparent PNG areas go black.
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

    let best: Blob | null = null;
    for (const quality of QUALITY_STEPS) {
      const blob = await toBlob(canvas, quality);
      if (!blob) break;
      best = blob;
      if (blob.size <= TARGET_BYTES) break;
    }

    // A tiny source can re-encode *larger* than it started; keep the original.
    if (!best || best.size >= file.size) return file;

    return new File([best], asJpegName(file.name), {
      type: "image/jpeg",
      lastModified: file.lastModified,
    });
  } catch {
    return file;
  } finally {
    bitmap.close();
  }
}

/**
 * Validates `file` and compresses it when it's an image.
 *
 * Pass `allowPdf` for document fields (e.g. a business registration
 * certificate) that accept a scan as well as a photo. PDFs are passed through
 * untouched — only their size is checked.
 */
export async function prepareUpload(
  file: File,
  { allowPdf = false }: { allowPdf?: boolean } = {},
): Promise<PreparedUpload> {
  if (file.type === "application/pdf") {
    if (!allowPdf) return { ok: false, reason: "badFileType" };
    if (file.size > MAX_UPLOAD_BYTES) return { ok: false, reason: "fileTooLarge" };
    // A PDF can't be compressed here, so an oversized one has to be refused
    // rather than sent into a 413.
    return file.size > MAX_REQUEST_BYTES
      ? { ok: false, reason: "tooLargeToSend" }
      : { ok: true, file };
  }

  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return { ok: false, reason: "badFileType" };
  }

  // Check the compressed size, not the original: a 12MB photo that shrinks to
  // 400KB is perfectly uploadable, so rejecting it on the raw size would be
  // needlessly strict.
  const prepared = await compressImage(file);
  if (prepared.size > MAX_UPLOAD_BYTES) {
    return { ok: false, reason: "fileTooLarge" };
  }
  // Compression is best-effort: it returns the original when the browser can't
  // decode the image. Catch that here, where we can say why, instead of
  // letting nginx turn it into "Can't reach the server".
  if (prepared.size > MAX_REQUEST_BYTES) {
    return { ok: false, reason: "tooLargeToSend" };
  }

  return { ok: true, file: prepared };
}
