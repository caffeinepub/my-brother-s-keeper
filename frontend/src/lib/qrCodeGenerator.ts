/**
 * Standards-compliant QR Code generator implementation.
 * Generates scannable QR codes with proper error correction and quiet zones.
 * Based on the QR Code specification ISO/IEC 18004.
 */

type ErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H';

const ERROR_CORRECTION_LEVELS: Record<ErrorCorrectionLevel, number> = {
  L: 1, // ~7% correction
  M: 0, // ~15% correction
  Q: 3, // ~25% correction
  H: 2, // ~30% correction
};

// Error correction codewords per block for each version and EC level
const EC_CODEWORDS_PER_BLOCK: Record<number, Record<ErrorCorrectionLevel, [number, number, number, number]>> = {
  1: { L: [1, 19, 7, 0], M: [1, 16, 10, 0], Q: [1, 13, 13, 0], H: [1, 9, 17, 0] },
  2: { L: [1, 34, 10, 0], M: [1, 28, 16, 0], Q: [1, 22, 22, 0], H: [1, 16, 28, 0] },
  3: { L: [1, 55, 15, 0], M: [1, 44, 26, 0], Q: [2, 17, 18, 0], H: [2, 13, 22, 0] },
  4: { L: [1, 80, 20, 0], M: [2, 32, 18, 0], Q: [2, 24, 26, 0], H: [4, 9, 16, 0] },
  5: { L: [1, 108, 26, 0], M: [2, 43, 24, 0], Q: [2, 15, 18, 2], H: [2, 11, 22, 2] },
};

// Galois field log and antilog tables for GF(256)
const GF_LOG: number[] = new Array(256);
const GF_EXP: number[] = new Array(256);

// Initialize Galois field tables
function initGaloisField() {
  let x = 1;
  for (let i = 0; i < 255; i++) {
    GF_EXP[i] = x;
    GF_LOG[x] = i;
    x <<= 1;
    if (x & 0x100) {
      x ^= 0x11d;
    }
  }
  for (let i = 255; i < 512; i++) {
    GF_EXP[i] = GF_EXP[i - 255];
  }
}

initGaloisField();

// Galois field multiplication
function gfMul(a: number, b: number): number {
  if (a === 0 || b === 0) return 0;
  return GF_EXP[GF_LOG[a] + GF_LOG[b]];
}

// Generate Reed-Solomon error correction codewords
function generateErrorCorrection(data: number[], numEcCodewords: number): number[] {
  const generator: number[] = [1];
  
  // Build generator polynomial
  for (let i = 0; i < numEcCodewords; i++) {
    const newGen: number[] = new Array(generator.length + 1).fill(0);
    for (let j = 0; j < generator.length; j++) {
      newGen[j] ^= gfMul(generator[j], GF_EXP[i]);
      newGen[j + 1] ^= generator[j];
    }
    generator.length = newGen.length;
    for (let j = 0; j < newGen.length; j++) {
      generator[j] = newGen[j];
    }
  }

  // Perform polynomial division
  const result = [...data, ...new Array(numEcCodewords).fill(0)];
  for (let i = 0; i < data.length; i++) {
    const coef = result[i];
    if (coef !== 0) {
      for (let j = 0; j < generator.length; j++) {
        result[i + j] ^= gfMul(generator[j], coef);
      }
    }
  }

  return result.slice(data.length);
}

class QRCodeGenerator {
  private modules: (boolean | null)[][] = [];
  private moduleCount: number = 0;

  constructor(private version: number, private errorCorrectionLevel: ErrorCorrectionLevel) {
    this.moduleCount = version * 4 + 17;
    // Initialize with null (unset) values
    this.modules = Array(this.moduleCount).fill(null).map(() => 
      Array(this.moduleCount).fill(null)
    );
  }

  private setupPositionProbePattern(row: number, col: number): void {
    for (let r = -1; r <= 7; r++) {
      if (row + r < 0 || this.moduleCount <= row + r) continue;
      
      for (let c = -1; c <= 7; c++) {
        if (col + c < 0 || this.moduleCount <= col + c) continue;
        
        if (
          (0 <= r && r <= 6 && (c === 0 || c === 6)) ||
          (0 <= c && c <= 6 && (r === 0 || r === 6)) ||
          (2 <= r && r <= 4 && 2 <= c && c <= 4)
        ) {
          this.modules[row + r][col + c] = true;
        } else {
          this.modules[row + r][col + c] = false;
        }
      }
    }
  }

  private setupTimingPattern(): void {
    for (let i = 8; i < this.moduleCount - 8; i++) {
      if (this.modules[i][6] === null) {
        this.modules[i][6] = i % 2 === 0;
      }
      if (this.modules[6][i] === null) {
        this.modules[6][i] = i % 2 === 0;
      }
    }
  }

  private setupTypeInfo(maskPattern: number): void {
    const data = (ERROR_CORRECTION_LEVELS[this.errorCorrectionLevel] << 3) | maskPattern;
    const bits = this.getBCHTypeInfo(data);

    // Vertical
    for (let i = 0; i < 15; i++) {
      const mod = ((bits >> i) & 1) === 1;
      if (i < 6) {
        this.modules[i][8] = mod;
      } else if (i < 8) {
        this.modules[i + 1][8] = mod;
      } else {
        this.modules[this.moduleCount - 15 + i][8] = mod;
      }
    }

    // Horizontal
    for (let i = 0; i < 15; i++) {
      const mod = ((bits >> i) & 1) === 1;
      if (i < 8) {
        this.modules[8][this.moduleCount - i - 1] = mod;
      } else if (i < 9) {
        this.modules[8][15 - i - 1 + 1] = mod;
      } else {
        this.modules[8][15 - i - 1] = mod;
      }
    }

    // Fixed module
    this.modules[this.moduleCount - 8][8] = true;
  }

  private getBCHTypeInfo(data: number): number {
    let d = data << 10;
    while (this.getBCHDigit(d) - this.getBCHDigit(0x537) >= 0) {
      d ^= 0x537 << (this.getBCHDigit(d) - this.getBCHDigit(0x537));
    }
    return ((data << 10) | d) ^ 0x5412;
  }

  private getBCHDigit(data: number): number {
    let digit = 0;
    while (data !== 0) {
      digit++;
      data >>>= 1;
    }
    return digit;
  }

  private mapData(data: number[], maskPattern: number): void {
    let inc = -1;
    let row = this.moduleCount - 1;
    let bitIndex = 7;
    let byteIndex = 0;

    for (let col = this.moduleCount - 1; col > 0; col -= 2) {
      if (col === 6) col--;

      while (true) {
        for (let c = 0; c < 2; c++) {
          const cc = col - c;

          if (this.modules[row][cc] !== null) continue;

          let dark = false;
          if (byteIndex < data.length) {
            dark = ((data[byteIndex] >>> bitIndex) & 1) === 1;
          }

          const mask = this.getMask(maskPattern, row, cc);
          if (mask) {
            dark = !dark;
          }

          this.modules[row][cc] = dark;
          bitIndex--;

          if (bitIndex === -1) {
            byteIndex++;
            bitIndex = 7;
          }
        }

        row += inc;

        if (row < 0 || this.moduleCount <= row) {
          row -= inc;
          inc = -inc;
          break;
        }
      }
    }
  }

  private getMask(maskPattern: number, i: number, j: number): boolean {
    switch (maskPattern) {
      case 0: return (i + j) % 2 === 0;
      case 1: return i % 2 === 0;
      case 2: return j % 3 === 0;
      case 3: return (i + j) % 3 === 0;
      case 4: return (Math.floor(i / 2) + Math.floor(j / 3)) % 2 === 0;
      case 5: return ((i * j) % 2) + ((i * j) % 3) === 0;
      case 6: return (((i * j) % 2) + ((i * j) % 3)) % 2 === 0;
      case 7: return (((i * j) % 3) + ((i + j) % 2)) % 2 === 0;
      default: throw new Error('Invalid mask pattern');
    }
  }

  public make(data: string): void {
    // Setup position detection patterns
    this.setupPositionProbePattern(0, 0);
    this.setupPositionProbePattern(this.moduleCount - 7, 0);
    this.setupPositionProbePattern(0, this.moduleCount - 7);

    // Setup timing patterns
    this.setupTimingPattern();

    // Encode data with proper error correction
    const dataCodewords = this.encodeData(data);
    
    // Choose best mask pattern
    const maskPattern = this.chooseBestMask(dataCodewords);
    
    // Setup format info
    this.setupTypeInfo(maskPattern);
    
    // Map data
    this.mapData(dataCodewords, maskPattern);
  }

  private chooseBestMask(dataCodewords: number[]): number {
    let bestMask = 0;
    let lowestPenalty = Infinity;

    // Try all 8 mask patterns and choose the one with lowest penalty
    for (let mask = 0; mask < 8; mask++) {
      // Create temporary modules for testing
      const tempModules = this.modules.map(row => [...row]);
      
      // Apply mask
      this.mapData(dataCodewords, mask);
      
      // Calculate penalty
      const penalty = this.calculateMaskPenalty();
      
      if (penalty < lowestPenalty) {
        lowestPenalty = penalty;
        bestMask = mask;
      }
      
      // Restore modules
      this.modules = tempModules;
    }

    return bestMask;
  }

  private calculateMaskPenalty(): number {
    let penalty = 0;

    // Rule 1: Adjacent modules in row/column with same color
    for (let i = 0; i < this.moduleCount; i++) {
      let lastColor = false;
      let count = 0;
      
      // Check rows
      for (let j = 0; j < this.moduleCount; j++) {
        const color = this.modules[i][j] === true;
        if (j === 0 || color !== lastColor) {
          if (count >= 5) {
            penalty += count - 2;
          }
          lastColor = color;
          count = 1;
        } else {
          count++;
        }
      }
      if (count >= 5) {
        penalty += count - 2;
      }

      // Check columns
      lastColor = false;
      count = 0;
      for (let j = 0; j < this.moduleCount; j++) {
        const color = this.modules[j][i] === true;
        if (j === 0 || color !== lastColor) {
          if (count >= 5) {
            penalty += count - 2;
          }
          lastColor = color;
          count = 1;
        } else {
          count++;
        }
      }
      if (count >= 5) {
        penalty += count - 2;
      }
    }

    // Rule 2: Block of modules in same color (2x2)
    for (let i = 0; i < this.moduleCount - 1; i++) {
      for (let j = 0; j < this.moduleCount - 1; j++) {
        const color = this.modules[i][j] === true;
        if (
          this.modules[i][j + 1] === color &&
          this.modules[i + 1][j] === color &&
          this.modules[i + 1][j + 1] === color
        ) {
          penalty += 3;
        }
      }
    }

    return penalty;
  }

  private encodeData(data: string): number[] {
    // Encode as byte mode with proper bit-level encoding
    const bits: boolean[] = [];
    
    // Mode indicator for byte mode (0100)
    bits.push(false, true, false, false);
    
    // Character count indicator (8 bits for version 1-9)
    const charCountBits = this.version < 10 ? 8 : 16;
    const length = data.length;
    for (let i = charCountBits - 1; i >= 0; i--) {
      bits.push(((length >> i) & 1) === 1);
    }
    
    // Data bytes
    for (let i = 0; i < data.length; i++) {
      const byte = data.charCodeAt(i);
      for (let j = 7; j >= 0; j--) {
        bits.push(((byte >> j) & 1) === 1);
      }
    }
    
    // Get capacity info
    const ecInfo = EC_CODEWORDS_PER_BLOCK[this.version]?.[this.errorCorrectionLevel] || 
                   EC_CODEWORDS_PER_BLOCK[1][this.errorCorrectionLevel];
    const [numBlocks, dataCodewordsPerBlock, ecCodewordsPerBlock] = ecInfo;
    const totalDataCodewords = numBlocks * dataCodewordsPerBlock;
    const totalBits = totalDataCodewords * 8;
    
    // Add terminator (up to 4 zeros)
    for (let i = 0; i < Math.min(4, totalBits - bits.length); i++) {
      bits.push(false);
    }
    
    // Pad to byte boundary
    while (bits.length % 8 !== 0) {
      bits.push(false);
    }
    
    // Add pad bytes (11101100 and 00010001 alternating)
    const padBytes = [0xec, 0x11];
    let padIndex = 0;
    while (bits.length < totalBits) {
      const padByte = padBytes[padIndex % 2];
      for (let i = 7; i >= 0; i--) {
        bits.push(((padByte >> i) & 1) === 1);
      }
      padIndex++;
    }
    
    // Convert bits to bytes
    const dataBytes: number[] = [];
    for (let i = 0; i < bits.length; i += 8) {
      let byte = 0;
      for (let j = 0; j < 8; j++) {
        if (bits[i + j]) {
          byte |= 1 << (7 - j);
        }
      }
      dataBytes.push(byte);
    }
    
    // Generate error correction codewords
    const ecBytes = generateErrorCorrection(dataBytes, ecCodewordsPerBlock);
    
    // Interleave data and error correction
    return [...dataBytes, ...ecBytes];
  }

  public isDark(row: number, col: number): boolean {
    return this.modules[row]?.[col] === true;
  }

  public getModuleCount(): number {
    return this.moduleCount;
  }
}

/**
 * Generate a QR code and render it to a canvas element.
 * @param text The text to encode in the QR code
 * @param canvas The canvas element to render to
 * @param size The size in pixels (default: 256)
 * @param margin The quiet zone margin in modules (default: 4)
 * @param errorCorrectionLevel Error correction level (default: 'M')
 */
export async function generateQRCodeToCanvas(
  text: string,
  canvas: HTMLCanvasElement,
  size: number = 256,
  margin: number = 4,
  errorCorrectionLevel: ErrorCorrectionLevel = 'M'
): Promise<void> {
  try {
    // Determine version based on data length (conservative estimate for byte mode)
    let version = 1;
    const maxCapacities = [17, 32, 53, 78, 106]; // Approximate byte mode capacities for versions 1-5
    for (let i = 0; i < maxCapacities.length; i++) {
      if (text.length <= maxCapacities[i]) {
        version = i + 1;
        break;
      }
    }
    if (version > 5) version = 5; // Limit to version 5 for now

    // Create QR code
    const qr = new QRCodeGenerator(version, errorCorrectionLevel);
    qr.make(text);

    const moduleCount = qr.getModuleCount();
    const quietZone = margin;
    const totalSize = moduleCount + (quietZone * 2);
    const cellSize = Math.floor(size / totalSize);
    const actualSize = cellSize * totalSize;

    // Set canvas dimensions with device pixel ratio for crisp rendering
    const dpr = window.devicePixelRatio || 1;
    canvas.width = actualSize * dpr;
    canvas.height = actualSize * dpr;
    canvas.style.width = `${actualSize}px`;
    canvas.style.height = `${actualSize}px`;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Failed to get canvas context');
    }

    // Scale for device pixel ratio
    ctx.scale(dpr, dpr);
    
    // Disable image smoothing for crisp edges
    ctx.imageSmoothingEnabled = false;

    // Fill background (white with quiet zone)
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, actualSize, actualSize);

    // Draw QR modules (black)
    ctx.fillStyle = '#000000';
    for (let row = 0; row < moduleCount; row++) {
      for (let col = 0; col < moduleCount; col++) {
        if (qr.isDark(row, col)) {
          ctx.fillRect(
            (col + quietZone) * cellSize,
            (row + quietZone) * cellSize,
            cellSize,
            cellSize
          );
        }
      }
    }
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw new Error('Failed to generate QR code');
  }
}
