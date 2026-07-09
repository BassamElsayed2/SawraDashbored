/**
 * Backend WebSocket base URL (without /api)
 */
export function getSocketUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_SOCKET_URL?.trim();
  if (envUrl) return envUrl.replace(/\/$/, "");

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
  return apiUrl.replace(/\/api\/?$/, "").trim() || "http://localhost:5000";
}
