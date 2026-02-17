import { Principal } from '@dfinity/principal';

/**
 * Validates whether a string is a valid textual Principal ID.
 * Returns true if valid, false otherwise.
 */
export function isValidPrincipal(text: string): boolean {
  if (!text || text.trim().length === 0) {
    return false;
  }
  
  try {
    Principal.fromText(text.trim());
    return true;
  } catch {
    return false;
  }
}

/**
 * Safely converts a string to a Principal, returning null if invalid.
 */
export function safePrincipalFromText(text: string): Principal | null {
  try {
    return Principal.fromText(text.trim());
  } catch {
    return null;
  }
}
