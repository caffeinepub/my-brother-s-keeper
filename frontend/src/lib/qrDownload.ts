/**
 * Download a canvas as a PNG image file.
 * Validates canvas readiness before attempting download.
 * @param canvas The canvas element to download
 * @param filename The filename for the downloaded image
 * @returns Promise that resolves when download is triggered or rejects on error
 */
export function downloadCanvasAsPNG(
  canvas: HTMLCanvasElement,
  filename: string = 'qr-code.png'
): Promise<void> {
  return new Promise((resolve, reject) => {
    // Validate canvas has non-zero dimensions
    if (!canvas.width || !canvas.height) {
      reject(new Error('QR code is not ready yet. Please wait a moment and try again.'));
      return;
    }

    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('QR code is not ready yet. Please wait a moment and try again.'));
        return;
      }

      try {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        resolve();
      } catch (error) {
        reject(new Error('Failed to download. Please try again.'));
      }
    }, 'image/png');
  });
}
