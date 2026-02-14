/**
 * Simple QR Code generator using canvas and a lightweight algorithm.
 * This implementation uses the browser's canvas API to draw QR codes.
 */

interface QRCodeOptions {
  width?: number;
  margin?: number;
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
}

/**
 * Generate a QR code on a canvas element with adequate quiet zone.
 * Uses a third-party API to generate the QR code image.
 * @param text The text to encode in the QR code
 * @param canvas The canvas element to render to
 * @param size The size in pixels (default: 256)
 */
export async function generateQRCode(
  text: string,
  canvas: HTMLCanvasElement,
  size: number = 256
): Promise<void> {
  try {
    // Use QR Server API to generate QR code
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(text)}&margin=10`;
    
    // Create an image element
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    // Wait for image to load
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error('Failed to load QR code image'));
      img.src = qrApiUrl;
    });
    
    // Set canvas size
    canvas.width = size;
    canvas.height = size;
    
    // Draw image on canvas
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Failed to get canvas context');
    }
    
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, size, size);
    ctx.drawImage(img, 0, 0, size, size);
    
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw new Error('Failed to generate QR code');
  }
}
