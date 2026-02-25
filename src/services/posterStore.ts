/**
 * posterStore.ts
 *
 * Storage layer for proposal poster images.
 * Images cannot be stored on the Quai blockchain, so we persist
 * base64 data URLs in localStorage keyed by a stable title slug.
 *
 * Max individual poster size: 2 MB (base64) to respect localStorage quota.
 */

const PREFIX = 'campus_poster_';
const MAX_BYTES = 2 * 1024 * 1024; // 2 MB base64 limit

/** Convert a proposal title to a stable localStorage key */
export function titleToKey(title: string): string {
  return PREFIX + title.toLowerCase().trim().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
}

/** Save a poster data URL for a given title. Returns false if too large. */
export function savePoster(title: string, dataUrl: string): boolean {
  if (!title || !dataUrl) return false;
  if (dataUrl.length > MAX_BYTES) {
    console.warn(`[posterStore] Poster for "${title}" exceeds 2 MB limit, skipping.`);
    return false;
  }
  try {
    localStorage.setItem(titleToKey(title), dataUrl);
    return true;
  } catch (e) {
    console.warn('[posterStore] localStorage write failed (quota exceeded?):', e);
    return false;
  }
}

/** Retrieve a poster data URL for a given title. Returns null if not found. */
export function getPoster(title: string): string | null {
  if (!title) return null;
  try {
    return localStorage.getItem(titleToKey(title));
  } catch {
    return null;
  }
}

/** Remove a poster from localStorage. */
export function deletePoster(title: string): void {
  try {
    localStorage.removeItem(titleToKey(title));
  } catch { /* ignore */ }
}

/**
 * Compress and resize an image File using a canvas element.
 * Returns a base64 data URL at ≤960px max dimension, JPEG quality 0.82.
 * No external dependencies — uses built-in browser Canvas API.
 */
export function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      const MAX_DIM = 960;
      let { width, height } = img;
      if (width > MAX_DIM || height > MAX_DIM) {
        if (width > height) {
          height = Math.round((height / width) * MAX_DIM);
          width = MAX_DIM;
        } else {
          width = Math.round((width / height) * MAX_DIM);
          height = MAX_DIM;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) { reject(new Error('Canvas context unavailable')); return; }
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', 0.82));
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Image failed to load for compression'));
    };

    img.src = objectUrl;
  });
}
