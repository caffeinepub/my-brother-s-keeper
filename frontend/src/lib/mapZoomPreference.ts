const STORAGE_KEY = 'mbk_map_zoom_preference';
const DEFAULT_ZOOM = 15;
const MIN_ZOOM = 1;
const MAX_ZOOM = 21;

/**
 * Get the stored map zoom preference or return the default
 */
export function getMapZoomPreference(): number {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = parseInt(stored, 10);
      if (!isNaN(parsed)) {
        return clampZoom(parsed);
      }
    }
  } catch (error) {
    console.error('Failed to read map zoom preference:', error);
  }
  return DEFAULT_ZOOM;
}

/**
 * Store the map zoom preference
 */
export function setMapZoomPreference(zoom: number): void {
  try {
    const clamped = clampZoom(zoom);
    localStorage.setItem(STORAGE_KEY, clamped.toString());
  } catch (error) {
    console.error('Failed to store map zoom preference:', error);
  }
}

/**
 * Clear the stored map zoom preference
 */
export function clearMapZoomPreference(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear map zoom preference:', error);
  }
}

/**
 * Clamp zoom value to valid range
 */
function clampZoom(zoom: number): number {
  return Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoom));
}

/**
 * Get the default zoom value
 */
export function getDefaultZoom(): number {
  return DEFAULT_ZOOM;
}

/**
 * Get the valid zoom range
 */
export function getZoomRange(): { min: number; max: number } {
  return { min: MIN_ZOOM, max: MAX_ZOOM };
}
