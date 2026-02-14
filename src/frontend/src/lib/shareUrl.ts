/**
 * Get the current app's share URL based on the runtime location.
 * Works for both preview and live deployments.
 */
export function getShareUrl(): string {
  return window.location.origin;
}
