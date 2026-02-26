/**
 * Resilient clipboard copy utility that handles various browser security constraints.
 * Returns true on success, false on failure (no exceptions thrown).
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  // Validate input
  if (!text || text.trim().length === 0) {
    console.warn('Cannot copy empty text to clipboard');
    return false;
  }

  // Check for secure context (required for clipboard API)
  if (!window.isSecureContext) {
    console.warn('Clipboard API requires secure context (HTTPS)');
    return attemptFallbackCopy(text);
  }

  // Try modern Clipboard API first
  if (navigator.clipboard && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (error: any) {
      console.warn('Clipboard API failed:', error.name, error.message);
      // Permission denied or other error - try fallback
      return attemptFallbackCopy(text);
    }
  }

  // Clipboard API not available - try fallback
  return attemptFallbackCopy(text);
}

/**
 * Fallback copy method using DOM selection and execCommand.
 * This is deprecated but still works in many browsers when clipboard API is blocked.
 */
function attemptFallbackCopy(text: string): boolean {
  try {
    // Create a temporary textarea element
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    textarea.style.top = '-9999px';
    textarea.setAttribute('readonly', '');
    
    document.body.appendChild(textarea);
    
    // Select the text
    textarea.select();
    textarea.setSelectionRange(0, text.length);
    
    // Try to copy
    const success = document.execCommand('copy');
    
    // Clean up
    document.body.removeChild(textarea);
    
    return success;
  } catch (error) {
    console.error('Fallback copy failed:', error);
    return false;
  }
}
