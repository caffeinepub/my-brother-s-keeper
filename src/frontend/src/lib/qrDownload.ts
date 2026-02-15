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
      reject(new Error('Canvas is not ready: dimensions are zero'));
      return;
    }

    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Failed to create blob from canvas. The canvas may not be ready yet.'));
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
        reject(error);
      }
    }, 'image/png');
  });
}
