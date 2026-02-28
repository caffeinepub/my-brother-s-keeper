const ADMIN_TOKEN_KEY = 'caffeineAdminToken';

/**
 * Save the admin token to localStorage before the Internet Identity login redirect.
 * This ensures the token survives the redirect and can be retrieved after login.
 */
export function saveAdminTokenBeforeLogin(token: string): void {
  if (token && token.trim()) {
    localStorage.setItem(ADMIN_TOKEN_KEY, token.trim());
  }
}

/**
 * Retrieve the stored admin token from localStorage.
 * Returns null if no token is stored.
 */
export function getAdminToken(): string | null {
  return localStorage.getItem(ADMIN_TOKEN_KEY);
}

/**
 * Clear the admin token from localStorage and remove any hash parameter from the URL.
 * Does not cause a page reload.
 */
export function clearAdminToken(): void {
  localStorage.removeItem(ADMIN_TOKEN_KEY);

  // Also clear any hash-based token from the URL
  if (window.location.hash && window.location.hash.includes('adminToken')) {
    try {
      const url = new URL(window.location.href);
      url.hash = '';
      window.history.replaceState(null, '', url.toString());
    } catch {
      // Ignore URL manipulation errors
    }
  }
}

/**
 * Extract an admin token from the URL hash parameter.
 * Supports formats like: #adminToken=TOKEN_VALUE
 */
export function extractAdminTokenFromHash(): string | null {
  const hash = window.location.hash;
  if (!hash) return null;

  try {
    // Remove the leading '#' and parse as query string
    const params = new URLSearchParams(hash.slice(1));
    return params.get('adminToken');
  } catch {
    return null;
  }
}

/**
 * Check for an admin token in the URL hash and save it to localStorage.
 * Call this on app initialization before any redirects.
 */
export function captureAdminTokenFromUrl(): void {
  const token = extractAdminTokenFromHash();
  if (token) {
    saveAdminTokenBeforeLogin(token);
    // Clear the hash from the URL
    try {
      const url = new URL(window.location.href);
      url.hash = '';
      window.history.replaceState(null, '', url.toString());
    } catch {
      // Ignore URL manipulation errors
    }
  }
}
