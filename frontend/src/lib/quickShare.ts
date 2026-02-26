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
    
    // TypeScript-safe check for canShare
    const hasCanShare = 'canShare' in navigator && typeof navigator.canShare === 'function';
    if (hasCanShare && !navigator.canShare(shareData)) {
      // Web Share API exists but can't share this data - fall back to clipboard
      const copied = await copyToClipboard(url);
      return copied ? { status: 'copied' } : { status: 'not-supported' };
    }

    // Try to use Web Share API
    try {
      await navigator.share(shareData);
      return { status: 'success' };
    } catch (error: any) {
      // Check if user cancelled
      if (error.name === 'AbortError') {
        return { status: 'cancelled' };
      }
      
      // Check for permission denied
      if (error.name === 'NotAllowedError') {
        // Try clipboard fallback
        const copied = await copyToClipboard(url);
        return copied ? { status: 'copied' } : { status: 'error', message: 'Permission denied for sharing' };
      }
      
      // Other error - try clipboard fallback
      console.warn('Web Share API error:', error);
      const copied = await copyToClipboard(url);
      return copied ? { status: 'copied' } : { status: 'error', message: 'Failed to share' };
    }
  }

  // Web Share API not available - try clipboard fallback
  const copied = await copyToClipboard(url);
  return copied ? { status: 'copied' } : { status: 'not-supported' };
}
