/**
 * Backend base URL (without /api) for loading uploads
 */
function getBackendBaseUrl(): string {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
  const base = apiUrl.replace(/\/api\/?$/, "").trim();
  return base || "http://localhost:5000";
}

/** Supabase storage host - never used directly for rendering */
const SUPABASE_STORAGE_REGEX =
  /^https:\/\/[^/]+\.supabase\.co\/storage\/v1\/object\/public\//;

/**
 * Returns image URL that always points to the current backend.
 * Rewrites any old stored URL to the current backend uploads path.
 * Supabase URLs are never used directly for rendering.
 */
export function getImageUrl(url: string | null | undefined): string {
  if (!url) return "/placeholder.svg";

  const base = getBackendBaseUrl();

  // Never render from Supabase directly: rewrite to backend /uploads path
  if (SUPABASE_STORAGE_REGEX.test(url)) {
    const m = url.match(
      /^https:\/\/[^/]+\.supabase\.co\/storage\/v1\/object\/public\/([^/]+)\/(.+)$/
    );
    if (m) return `${base}/uploads/${m[1]}/${m[2]}`;
    return "/placeholder.svg";
  }

  // Extract path from any full URL containing /uploads/
  const uploadsMatch = url.match(/^(https?:\/\/[^/]+)(\/uploads\/.*)$/);
  if (uploadsMatch) {
    return `${base}${uploadsMatch[2]}`;
  }

  // Relative path
  if (url.startsWith("/")) {
    const path = url.startsWith("/uploads/") ? url : `/uploads${url}`;
    return `${base}${path}`;
  }
  if (!url.startsWith("http")) {
    return `${base}/uploads/${url.replace(/^\/+/, "")}`;
  }

  // Unknown absolute URL (non-backend/non-supabase): don't trust it
  return "/placeholder.svg";
}
