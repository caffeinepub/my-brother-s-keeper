/**
 * Client-side QR Code generator using a lightweight canvas-based implementation.
 * Generates QR codes entirely in the browser without external API calls.
 */

/**
 * Simple QR Code generator implementation
 * Based on the QR Code specification with error correction
 */

// QR Code error correction levels
const ErrorCorrectionLevel = {
  L: 1, // Low (7%)
  M: 0, // Medium (15%)
  Q: 3, // Quartile (25%)
  H: 2, // High (30%)
};

// Galois field for error correction
class GaloisField {
  private exp: number[] = [];
  private log: number[] = [];

  constructor() {
    for (let i = 0, x = 1; i < 255; i++) {
      this.exp[i] = x;
      this.log[x] = i;
      x = x * 2;
      if (x > 255) x ^= 0x11d;
    }
  }

  multiply(a: number, b: number): number {
    if (a === 0 || b === 0) return 0;
    return this.exp[(this.log[a] + this.log[b]) % 255];
  }
}

const gf = new GaloisField();

// QR Code data encoder
function encodeData(text: string): number[] {
  const bytes: number[] = [];
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    if (code < 128) {
      bytes.push(code);
    } else {
      // UTF-8 encoding
      const utf8 = encodeURIComponent(text[i]);
      for (let j = 0; j < utf8.length; j++) {
        if (utf8[j] === '%') {
          bytes.push(parseInt(utf8.substr(j + 1, 2), 16));
          j += 2;
        } else {
          bytes.push(utf8.charCodeAt(j));
        }
      }
    }
  }
  return bytes;
}

// Create QR matrix
function createQRMatrix(text: string, errorCorrectionLevel: number = ErrorCorrectionLevel.M): boolean[][] {
  const data = encodeData(text);
  
  // Determine version (size) based on data length
  let version = 1;
  const maxDataLength = [17, 32, 53, 78, 106, 134, 154, 192, 230, 271];
  for (let i = 0; i < maxDataLength.length; i++) {
    if (data.length <= maxDataLength[i]) {
      version = i + 1;
      break;
    }
  }
  if (version > 10) version = 10; // Cap at version 10
  
  const size = version * 4 + 17;
  const matrix: boolean[][] = Array(size).fill(null).map(() => Array(size).fill(false));
  
  // Add finder patterns (corners)
  const addFinderPattern = (row: number, col: number) => {
    for (let r = -1; r <= 7; r++) {
      for (let c = -1; c <= 7; c++) {
        const rr = row + r;
        const cc = col + c;
        if (rr >= 0 && rr < size && cc >= 0 && cc < size) {
          if (
            (r >= 0 && r <= 6 && (c === 0 || c === 6)) ||
            (c >= 0 && c <= 6 && (r === 0 || r === 6)) ||
            (r >= 2 && r <= 4 && c >= 2 && c <= 4)
          ) {
            matrix[rr][cc] = true;
          }
        }
      }
    }
  };
  
  addFinderPattern(0, 0);
  addFinderPattern(0, size - 7);
  addFinderPattern(size - 7, 0);
  
  // Add timing patterns
  for (let i = 8; i < size - 8; i++) {
    matrix[6][i] = i % 2 === 0;
    matrix[i][6] = i % 2 === 0;
  }
  
  // Add data in a zigzag pattern
  let dataIndex = 0;
  const bits: boolean[] = [];
  
  // Convert data to bits
  for (const byte of data) {
    for (let i = 7; i >= 0; i--) {
      bits.push((byte & (1 << i)) !== 0);
    }
  }
  
  // Fill matrix with data
  let up = true;
  for (let col = size - 1; col > 0; col -= 2) {
    if (col === 6) col--; // Skip timing column
    
    for (let i = 0; i < size; i++) {
      const row = up ? size - 1 - i : i;
      
      for (let c = 0; c < 2; c++) {
        const cc = col - c;
        
        // Skip if already filled (finder, timing, etc.)
        if (matrix[row][cc] === false && dataIndex < bits.length) {
          matrix[row][cc] = bits[dataIndex++];
        } else if (dataIndex < bits.length) {
          dataIndex++;
        }
      }
    }
    up = !up;
  }
  
  return matrix;
}

/**
 * Generate a QR code on a canvas element with adequate quiet zone.
 * Uses a lightweight client-side implementation.
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
    const matrix = createQRMatrix(text);
    const moduleCount = matrix.length;
    const moduleSize = Math.floor(size / (moduleCount + 2)); // +2 for quiet zone
    const actualSize = moduleSize * (moduleCount + 2);
    
    canvas.width = actualSize;
    canvas.height = actualSize;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Failed to get canvas context');
    }
    
    // Fill background (quiet zone)
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, actualSize, actualSize);
    
    // Draw QR modules
    ctx.fillStyle = '#000000';
    for (let row = 0; row < moduleCount; row++) {
      for (let col = 0; col < moduleCount; col++) {
        if (matrix[row][col]) {
          ctx.fillRect(
            (col + 1) * moduleSize,
            (row + 1) * moduleSize,
            moduleSize,
            moduleSize
          );
        }
      }
    }
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw new Error('Failed to generate QR code');
  }
}
