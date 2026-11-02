/**
 * Helper to convert Google Drive shareable links into direct embeddable image URLs.
 * Automatically appends =w1200 CDN parameter for fast web optimization.
 * Handles formats like:
 * - https://drive.google.com/file/d/FILE_ID/view?usp=sharing
 * - https://drive.google.com/open?id=FILE_ID
 * - https://drive.google.com/uc?export=view&id=FILE_ID
 */
export function convertGoogleDriveUrl(url: string): string {
  if (!url || typeof url !== "string") return "";
  const trimmed = url.trim();

  // Check for /file/d/FILE_ID pattern
  const fileDMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (fileDMatch && fileDMatch[1]) {
    return `https://lh3.googleusercontent.com/d/${fileDMatch[1]}=w1200`;
  }

  // Check for id=FILE_ID query param pattern
  const idMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (idMatch && idMatch[1]) {
    return `https://lh3.googleusercontent.com/d/${idMatch[1]}=w1200`;
  }

  // If already an lh3 link without width specifier, append =w1200
  if (trimmed.startsWith("https://lh3.googleusercontent.com/d/") && !trimmed.includes("=")) {
    return `${trimmed}=w1200`;
  }

  // Return original URL if it's not a Google Drive link
  return trimmed;
}
