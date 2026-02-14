/**
 * Quick Share helper using Web Share API with clipboard fallback.
 * Returns a result indicating what happened for appropriate toast messaging.
 */

export type QuickShareResult =
  | { status: 'success' }
  | { status: 'copied' }
  | { status: 'cancelled' }
  | { status: 'not-supported' }
  | { status: 'error'; message: string };

/**
 * Attempt to share a URL using the Web Share API.
 * Falls back to copying to clipboard if not supported.
 */
export async function quickShare(url: string, title: string): Promise<QuickShareResult> {
  // Check if Web Share API is available
  if (navigator.share) {
    try {
      await navigator.share({
        title,
        url,
      });
      return { status: 'success' };
    } catch (error: any) {
      // User cancelled the share
      if (error.name === 'AbortError') {
        return { status: 'cancelled' };
      }
      // Other errors - fall back to clipboard
      console.warn('Web Share API failed, falling back to clipboard:', error);
      return await fallbackToCopy(url);
    }
  } else {
    // Web Share API not supported - use clipboard fallback
    return await fallbackToCopy(url);
  }
}

/**
 * Fallback: copy URL to clipboard
 */
async function fallbackToCopy(url: string): Promise<QuickShareResult> {
  try {
    await navigator.clipboard.writeText(url);
    return { status: 'copied' };
  } catch (error: any) {
    console.error('Clipboard copy failed:', error);
    return { status: 'error', message: error.message || 'Failed to copy link' };
  }
}
