/**
 * Export a flyer component as a PNG image.
 * This creates a temporary canvas, renders the flyer content to it,
 * and triggers a download.
 */

/**
 * Export the flyer as a PNG file.
 * @param flyerElement The flyer container element to export
 * @param qrCanvas The QR code canvas element
 * @param filename The filename for the downloaded image
 */
export async function exportFlyerAsPNG(
  flyerElement: HTMLDivElement,
  qrCanvas: HTMLCanvasElement,
  filename: string = 'flyer.png'
): Promise<void> {
  try {
    // Create a temporary canvas for the full flyer
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('Failed to get canvas context');
    }

    // Set canvas size to match the flyer element
    const rect = flyerElement.getBoundingClientRect();
    const scale = 2; // Higher resolution for better quality
    canvas.width = rect.width * scale;
    canvas.height = rect.height * scale;
    
    // Scale context for high DPI
    ctx.scale(scale, scale);

    // Fill background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, rect.width, rect.height);

    // Use html2canvas-like approach: render DOM to canvas
    // For simplicity, we'll use a different approach - convert to image via SVG foreignObject
    const data = `
      <svg xmlns="http://www.w3.org/2000/svg" width="${rect.width}" height="${rect.height}">
        <foreignObject width="100%" height="100%">
          <div xmlns="http://www.w3.org/1999/xhtml" style="font-family: system-ui, -apple-system, sans-serif;">
            ${flyerElement.innerHTML}
          </div>
        </foreignObject>
      </svg>
    `;

    const img = new Image();
    const svgBlob = new Blob([data], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    await new Promise<void>((resolve, reject) => {
      img.onload = () => {
        try {
          ctx.drawImage(img, 0, 0, rect.width, rect.height);
          URL.revokeObjectURL(url);
          resolve();
        } catch (error) {
          URL.revokeObjectURL(url);
          reject(error);
        }
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to load flyer image'));
      };
      img.src = url;
    });

    // Convert canvas to blob and download
    return new Promise<void>((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('Failed to create image blob'));
          return;
        }

        const downloadUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(downloadUrl);
        resolve();
      }, 'image/png');
    });
  } catch (error) {
    console.error('Flyer export error:', error);
    throw new Error('Failed to export flyer');
  }
}
