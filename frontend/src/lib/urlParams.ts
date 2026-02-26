/**
 * Utility functions for managing URL parameters.
 * Supports both query string and hash-based routing.
 */

/**
 * Clear/remove a specific URL parameter from the current address without reloading.
 * Works with both query string (?param=value) and hash-based routing (#/path?param=value).
 * @param paramName The name of the parameter to remove
 */
export function clearUrlParam(paramName: string): void {
  try {
    const url = new URL(window.location.href);
    
    // Check if we have hash-based routing with search params
    if (url.hash.includes('?')) {
      const [hashPath, hashSearch] = url.hash.split('?');
      const searchParams = new URLSearchParams(hashSearch);
      
      if (searchParams.has(paramName)) {
        searchParams.delete(paramName);
        const newSearch = searchParams.toString();
        url.hash = newSearch ? `${hashPath}?${newSearch}` : hashPath;
        window.history.replaceState(null, '', url.toString());
      }
    } 
    // Standard query string parameters
    else if (url.searchParams.has(paramName)) {
      url.searchParams.delete(paramName);
      window.history.replaceState(null, '', url.toString());
    }
  } catch (error) {
    console.error('Error clearing URL parameter:', error);
  }
}

/**
 * Get a URL parameter value from the current address.
 * Works with both query string and hash-based routing.
 * @param paramName The name of the parameter to retrieve
 * @returns The parameter value or null if not found
 */
export function getUrlParam(paramName: string): string | null {
  try {
    const url = new URL(window.location.href);
    
    // Check hash-based routing first
    if (url.hash.includes('?')) {
      const hashSearch = url.hash.split('?')[1];
      const searchParams = new URLSearchParams(hashSearch);
      if (searchParams.has(paramName)) {
        return searchParams.get(paramName);
      }
    }
    
    // Fall back to standard query string
    return url.searchParams.get(paramName);
  } catch (error) {
    console.error('Error getting URL parameter:', error);
    return null;
  }
}
