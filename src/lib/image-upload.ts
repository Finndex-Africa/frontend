/**
 * Prepare a user-picked file for `mediaApi.upload`: validate it, and shrink
 * camera photos before they go over the wire.
 *
 *   const prepared = await prepareUpload(file);
 *   if (!prepared.ok) return setError(tErr(`upload.${prepared.reason}`));
 *   await mediaApi.upload(prepared.file, "users");
 *
 * Why downscale at all, when the API accepts 10MB? A phone camera produces
 * 2-8MB JPEGs — far more detail than an ID review needs, and slow to push over
 * mobile data. It also keeps us clear of request-size limits in the proxy in
 * front of the API: those reject the request before any CORS headers are
 * added, so the browser can only report them as a connection failure ("Can't
 * reach the server"), never as "file too large". Small uploads avoid the whole
 * class of problem.
 */

/** Matches MAX_UPLOAD_SIZE_BYTES in the API — keep the two in step. */
export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

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

/** What we aim to land under, chosen to clear a 1MB proxy cap with headroom. */
const TARGET_BYTES = 800 * 1024;

/** Tried in order; we stop at the first that meets TARGET_BYTES. */
const QUALITY_STEPS = [0.85, 0.75, 0.6];

export type PreparedUpload =
  | { ok: true; file: File }
  | { ok: false; reason: "badFileType" | "fileTooLarge" };

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
    return file.size > MAX_UPLOAD_BYTES
      ? { ok: false, reason: "fileTooLarge" }
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

  return { ok: true, file: prepared };
}
