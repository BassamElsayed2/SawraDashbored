/**
 * Backend base URL (without /api) for loading uploads
 */
function getBackendBaseUrl(): string {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
  const base = apiUrl.replace(/\/api\/?$/, "").trim();
  return base || "http://localhost:5000";
}

/**
 * Returns image URL that always points to the current backend.
 * Rewrites stored URLs (e.g. https://api.elsawa.net/uploads/...) to use
 * NEXT_PUBLIC_API_URL base so images work in dev and when domain changes.
 */
export function getImageUrl(url: string | null | undefined): string {
  if (!url) return "/placeholder.svg";

  // Extract path from any full URL containing /uploads/
  const uploadsMatch = url.match(/^(https?:\/\/[^/]+)(\/uploads\/.*)$/);
  if (uploadsMatch) {
    const base = getBackendBaseUrl();
    return `${base}${uploadsMatch[2]}`;
  }

  // Relative path
  if (url.startsWith("/")) {
    const base = getBackendBaseUrl();
    return `${base}${url}`;
  }
  if (!url.startsWith("http")) {
    const base = getBackendBaseUrl();
    return `${base}/${url}`;
  }

  return url;
}
