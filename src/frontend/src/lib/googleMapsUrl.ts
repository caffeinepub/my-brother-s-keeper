/**
 * Build a Google Maps URL from coordinates and optional zoom level
 */
export function buildGoogleMapsUrl(
  latitude: number,
  longitude: number,
  zoom?: number
): string {
  const baseUrl = 'https://www.google.com/maps';
  const coords = `${latitude},${longitude}`;
  
  if (zoom !== undefined) {
    return `${baseUrl}?q=${coords}&z=${zoom}`;
  }
  
  return `${baseUrl}?q=${coords}`;
}
