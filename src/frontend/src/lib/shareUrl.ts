/**
 * Get the canonical, absolute share URL for the application.
 * Returns a consistent URL across all sharing contexts.
 */
export function getShareUrl(): string {
  // Use window.location.origin for the canonical base URL
  // This works for both preview and live deployments
  const baseUrl = window.location.origin;
  
  // Ensure consistent formatting (no trailing slash for root)
  return baseUrl;
}
