import { useEffect, useState } from 'react';
import { generateQRCodeToCanvas } from '@/lib/qrCodeGenerator';

interface UseQrCodeCanvasOptions {
  canvas: HTMLCanvasElement | null;
  text: string;
  size?: number;
  margin?: number;
}

interface UseQrCodeCanvasResult {
  qrReady: boolean;
  qrError: string | null;
}

/**
 * Hook to reliably generate a QR code on a canvas element after it's mounted.
 * Handles re-generation on dependency changes and tracks ready/error state.
 */
export function useQrCodeCanvas({
  canvas,
  text,
  size = 256,
  margin = 4,
}: UseQrCodeCanvasOptions): UseQrCodeCanvasResult {
  const [qrReady, setQrReady] = useState(false);
  const [qrError, setQrError] = useState<string | null>(null);

  useEffect(() => {
    if (!canvas || !text) {
      setQrReady(false);
      return;
    }

    setQrReady(false);
    setQrError(null);

    // Generate QR code
    const generateQR = async () => {
      try {
        await generateQRCodeToCanvas(text, canvas, size, margin, 'M');
        setQrReady(true);
        setQrError(null);
      } catch (error) {
        console.error('QR generation error:', error);
        setQrError('Failed to generate QR code');
        setQrReady(false);
      }
    };

    generateQR();
  }, [canvas, text, size, margin]);

  return { qrReady, qrError };
}
