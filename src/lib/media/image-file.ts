const ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

export const MEDIA_IMAGE_MAX_BYTES = 5 * 1024 * 1024;

export function extensionForImageMime(mimeType: string): string {
  if (mimeType === "image/png") return "png";
  if (mimeType === "image/webp") return "webp";
  if (mimeType === "image/gif") return "gif";
  return "jpg";
}

/** Resolves MIME from the blob type or a filename extension fallback. */
export function resolveImageMimeType(
  file: Blob,
  fileName?: string,
): string | null {
  if (ALLOWED_MIME.has(file.type)) {
    return file.type;
  }

  const name = (fileName ?? (file instanceof File ? file.name : "")).toLowerCase();
  if (name.endsWith(".png")) return "image/png";
  if (name.endsWith(".webp")) return "image/webp";
  if (name.endsWith(".gif")) return "image/gif";
  if (name.endsWith(".jpg") || name.endsWith(".jpeg")) return "image/jpeg";
  return null;
}

/** Validates MIME and size for admin image uploads. */
export function validateImageFile(
  file: Blob,
  maxBytes = MEDIA_IMAGE_MAX_BYTES,
  fileName?: string,
): string | null {
  const mime = resolveImageMimeType(file, fileName);
  if (!mime) {
    if (
      file.type === "image/heic" ||
      file.type === "image/heif" ||
      /\.hei[cf]$/i.test(fileName ?? (file instanceof File ? file.name : ""))
    ) {
      return "HEIC images are not supported. Please use JPEG, PNG, WebP, or GIF.";
    }
    return "Only JPEG, PNG, WebP, or GIF images are allowed.";
  }
  if (file.size > maxBytes) {
    return `Image must be ${Math.floor(maxBytes / (1024 * 1024))}MB or smaller.`;
  }
  return null;
}
