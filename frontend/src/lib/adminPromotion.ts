/**
 * Admin promotion utilities.
 * 
 * The caffeineAdminToken may be lost when Internet Identity redirects back
 * to the app (sessionStorage is tab-scoped and may not survive the redirect).
 * We persist the token to localStorage before the login redirect so it can
 * be retrieved and used for admin promotion after authentication completes.
 */

const ADMIN_TOKEN_STORAGE_KEY = 'pendingCaffeineAdminToken';

/**
 * Read the caffeineAdminToken from the URL hash (if present) and persist it
 * to localStorage so it survives the Internet Identity redirect.
 * Call this before initiating the login flow.
 */
export function saveAdminTokenBeforeLogin(): void {
  const token = extractAdminTokenFromHash();
  if (token) {
    localStorage.setItem(ADMIN_TOKEN_STORAGE_KEY, token);
  }
}

/**
 * Retrieve the pending admin token from localStorage.
 * Returns null if none is stored.
 */
export function getPendingAdminToken(): string | null {
  // Also check the current URL hash in case the user hasn't logged in yet
  const fromHash = extractAdminTokenFromHash();
  if (fromHash) {
    localStorage.setItem(ADMIN_TOKEN_STORAGE_KEY, fromHash);
    return fromHash;
  }
  return localStorage.getItem(ADMIN_TOKEN_STORAGE_KEY);
}

/**
 * Clear the pending admin token from localStorage after use.
 */
export function clearPendingAdminToken(): void {
  localStorage.removeItem(ADMIN_TOKEN_STORAGE_KEY);
}

/**
 * Extract the caffeineAdminToken from the current URL hash parameters.
 * Returns null if not present.
 */
function extractAdminTokenFromHash(): string | null {
  try {
    const hash = window.location.hash;
    if (!hash || !hash.includes('caffeineAdminToken')) return null;

    // Parse hash as query string (strip leading #)
    const hashContent = hash.startsWith('#') ? hash.slice(1) : hash;
    const params = new URLSearchParams(hashContent);
    return params.get('caffeineAdminToken');
  } catch {
    return null;
  }
}

/**
 * Remove the caffeineAdminToken from the URL hash without triggering a page reload.
 */
export function clearAdminTokenFromUrl(): void {
  try {
    const hash = window.location.hash;
    if (!hash || !hash.includes('caffeineAdminToken')) return;

    const hashContent = hash.startsWith('#') ? hash.slice(1) : hash;
    const params = new URLSearchParams(hashContent);
    params.delete('caffeineAdminToken');

    const remaining = params.toString();
    const newHash = remaining ? '#' + remaining : '';
    window.history.replaceState(null, '', window.location.pathname + window.location.search + newHash);
  } catch {
    // ignore
  }
}
