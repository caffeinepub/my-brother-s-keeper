import { useEffect, useState, useRef } from 'react';
import { generateQRCodeToCanvas } from '@/lib/qrCodeGenerator';

interface UseQrCodeCanvasOptions {
  canvas: HTMLCanvasElement | null;
  text: string;
  size?: number;
  margin?: number;
}

type QrStatus = 'idle' | 'generating' | 'ready' | 'error';

interface UseQrCodeCanvasResult {
  qrReady: boolean;
  qrError: string | null;
  status: QrStatus;
}

/**
 * Hook to reliably generate a QR code on a canvas element after it's mounted.
 * Handles re-generation on dependency changes and tracks ready/error state.
 * Includes a 3-second safety timeout to prevent indefinite "generating" state.
 */
export function useQrCodeCanvas({
  canvas,
  text,
  size = 256,
  margin = 4,
}: UseQrCodeCanvasOptions): UseQrCodeCanvasResult {
  const [status, setStatus] = useState<QrStatus>('idle');
  const [qrError, setQrError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    // If canvas or text is not available, stay idle (not generating)
    if (!canvas || !text) {
      setStatus('idle');
      setQrError(null);
      return;
    }

    // Cancel any previous generation
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller for this generation
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    // Start generating
    setStatus('generating');
    setQrError(null);

    // Safety timeout: if generation takes more than 3 seconds, mark as error
    const safetyTimeout = setTimeout(() => {
      if (!abortController.signal.aborted) {
        console.error('QR generation timeout after 3 seconds');
        setQrError('QR code generation timed out');
        setStatus('error');
        abortController.abort();
      }
    }, 3000);

    // Generate QR code
    const generateQR = async () => {
      try {
        await generateQRCodeToCanvas(text, canvas, size, margin, 'M');
        
        // Only update state if not aborted
        if (!abortController.signal.aborted) {
          clearTimeout(safetyTimeout);
          setStatus('ready');
          setQrError(null);
        }
      } catch (error) {
        // Only update state if not aborted
        if (!abortController.signal.aborted) {
          clearTimeout(safetyTimeout);
          console.error('QR generation error:', error);
          setQrError('Failed to generate QR code');
          setStatus('error');
        }
      }
    };

    generateQR();

    // Cleanup function
    return () => {
      clearTimeout(safetyTimeout);
      abortController.abort();
    };
  }, [canvas, text, size, margin]);

  return { 
    qrReady: status === 'ready', 
    qrError,
    status
  };
}
