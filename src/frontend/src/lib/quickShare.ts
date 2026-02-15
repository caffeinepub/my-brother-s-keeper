/**
 * Quick Share helper using Web Share API with clipboard fallback.
 * Returns a result indicating what happened for appropriate toast messaging.
 */

import { copyToClipboard } from './clipboard';

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
  // Validate URL
  if (!url || url.trim().length === 0) {
    return { status: 'error', message: 'No URL available to share' };
  }

  // Check if Web Share API is available and usable
  const canUseWebShare = 
    typeof navigator !== 'undefined' &&
    'share' in navigator &&
    typeof navigator.share === 'function' &&
    window.isSecureContext;

  if (canUseWebShare) {
    // Check if we can share this specific data (some browsers support navigator.share but not all data types)
    const shareData = { title, url };
    
    if (navigator.canShare && !navigator.canShare(shareData)) {
      // Browser says it can't share this data - fall back to clipboard
      return await fallbackToCopy(url);
    }

    try {
      await navigator.share(shareData);
      return { status: 'success' };
    } catch (error: any) {
      // User cancelled the share
      if (error.name === 'AbortError') {
        return { status: 'cancelled' };
      }
      
      // NotAllowedError means permission denied or user gesture required
      if (error.name === 'NotAllowedError') {
        console.warn('Web Share API not allowed, falling back to clipboard');
        return await fallbackToCopy(url);
      }
      
      // Other errors - fall back to clipboard
      console.warn('Web Share API failed, falling back to clipboard:', error);
      return await fallbackToCopy(url);
    }
  } else {
    // Web Share API not supported or not in secure context - use clipboard fallback
    return await fallbackToCopy(url);
  }
}

/**
 * Fallback: copy URL to clipboard using resilient clipboard helper
 */
async function fallbackToCopy(url: string): Promise<QuickShareResult> {
  const success = await copyToClipboard(url);
  
  if (success) {
    return { status: 'copied' };
  } else {
    // Clipboard copy failed - return not-supported so UI can guide user to manual copy
    return { status: 'not-supported' };
  }
}
