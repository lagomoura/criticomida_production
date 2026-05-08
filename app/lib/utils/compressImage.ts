/**
 * Client-side image compression for the review hot path.
 *
 * Why: a fresh iPhone photo is typically 4–12MB. On 3G/4G uploads at the
 * restaurant table that's 30–90s of waiting with the publish button disabled.
 * Resizing to 1200px wide and re-encoding as JPEG@0.82 cuts the payload to
 * ~250–500KB without visible quality loss for feed-sized renders, and the
 * upload finishes in seconds.
 *
 * Behavior:
 * - Skips compression when the file is small enough to upload "as-is" or when
 *   the format is one we shouldn't recompress (e.g., GIF — would lose
 *   animation; SVG — vector). The original File is returned unchanged.
 * - On any failure (canvas refused, decoder error, OOM), returns the original
 *   File. Compression is a perf optimization, not a correctness boundary.
 * - Preserves the original filename with a `.jpg` suffix swap so the backend
 *   sees a sensible name in upload payloads.
 */

const SKIP_COMPRESSION_MIME = new Set(['image/gif', 'image/svg+xml']);
const SKIP_IF_SMALLER_THAN = 600 * 1024; // 600KB — already mobile-friendly.

interface CompressOptions {
  /** Max edge in CSS pixels of the longest side. */
  maxEdge?: number;
  /** JPEG quality in [0, 1]. */
  quality?: number;
}

export async function compressImage(
  file: File,
  { maxEdge = 1600, quality = 0.82 }: CompressOptions = {},
): Promise<File> {
  if (typeof window === 'undefined') return file;
  if (!file.type.startsWith('image/')) return file;
  if (SKIP_COMPRESSION_MIME.has(file.type)) return file;
  if (file.size <= SKIP_IF_SMALLER_THAN) return file;

  try {
    const bitmap = await loadBitmap(file);
    const width = bitmap instanceof HTMLImageElement ? bitmap.naturalWidth : bitmap.width;
    const height = bitmap instanceof HTMLImageElement ? bitmap.naturalHeight : bitmap.height;
    const longest = Math.max(width, height);
    const scale = longest > maxEdge ? maxEdge / longest : 1;
    const targetW = Math.round(width * scale);
    const targetH = Math.round(height * scale);

    const closeBitmap = () => {
      if (typeof ImageBitmap !== 'undefined' && bitmap instanceof ImageBitmap) {
        bitmap.close();
      }
    };

    const canvas = document.createElement('canvas');
    canvas.width = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      closeBitmap();
      return file;
    }
    ctx.drawImage(bitmap, 0, 0, targetW, targetH);
    closeBitmap();

    const blob: Blob | null = await new Promise((resolve) => {
      canvas.toBlob(resolve, 'image/jpeg', quality);
    });
    if (!blob) return file;
    if (blob.size >= file.size) return file; // keep original if compression actually made it bigger

    const baseName = file.name.replace(/\.[^.]+$/, '') || 'photo';
    return new File([blob], `${baseName}.jpg`, {
      type: 'image/jpeg',
      lastModified: Date.now(),
    });
  } catch {
    return file;
  }
}

async function loadBitmap(file: File): Promise<HTMLImageElement | ImageBitmap> {
  // createImageBitmap is the fast path; falls back to <img> on Safari quirks.
  if (typeof createImageBitmap === 'function') {
    try {
      return await createImageBitmap(file);
    } catch {
      /* fall through */
    }
  }
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = (e) => {
      URL.revokeObjectURL(url);
      reject(e);
    };
    img.src = url;
  });
}
