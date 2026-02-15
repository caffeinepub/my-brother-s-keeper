/**
 * Export a flyer component as a PNG image using pure canvas rendering.
 * This approach manually renders the flyer content to avoid external dependencies
 * and works reliably on mobile browsers without tainted canvas issues.
 */

/**
 * Export the flyer as a PNG file.
 * @param flyerElement The flyer container element to export
 * @param shareUrl The share URL to include in the flyer
 * @param filename The filename for the downloaded image
 */
export async function exportFlyerAsPNG(
  flyerElement: HTMLDivElement,
  shareUrl: string,
  filename: string = 'flyer.png'
): Promise<void> {
  try {
    // Validate inputs
    if (!flyerElement) {
      throw new Error('Flyer is not ready yet. Please wait a moment and try again.');
    }
    
    if (!shareUrl || shareUrl.trim().length === 0) {
      throw new Error('Share URL is not ready yet. Please wait a moment and try again.');
    }

    console.log('[Flyer Export] Starting export process...');

    // Get flyer dimensions
    const rect = flyerElement.getBoundingClientRect();
    const scale = 2; // Higher resolution for better quality
    
    // Create export canvas
    const canvas = document.createElement('canvas');
    canvas.width = rect.width * scale;
    canvas.height = rect.height * scale;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Your browser does not support this feature. Please try a different browser.');
    }

    // Scale context for high DPI
    ctx.scale(scale, scale);

    // Fill background with white
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, rect.width, rect.height);

    // Apply gradient background (matching the flyer preview)
    const gradient = ctx.createLinearGradient(0, 0, rect.width, rect.height);
    gradient.addColorStop(0, '#ffffff');
    gradient.addColorStop(0.5, '#ffffff');
    gradient.addColorStop(1, 'rgba(255, 153, 0, 0.05)'); // primary/5 approximation
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, rect.width, rect.height);

    // Set up text rendering
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';

    let yOffset = 48; // Starting Y position (padding)

    // Draw logo/icon placeholder (shield icon area)
    const iconSize = 80;
    const iconX = rect.width / 2 - iconSize / 2;
    ctx.fillStyle = '#ff9900'; // primary color
    ctx.beginPath();
    ctx.roundRect(iconX, yOffset, iconSize, iconSize, 16);
    ctx.fill();
    
    // Draw shield icon (simplified)
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 48px system-ui, -apple-system, sans-serif';
    ctx.fillText('🛡️', rect.width / 2, yOffset + 16);
    
    yOffset += iconSize + 32;

    // Draw title
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 40px system-ui, -apple-system, sans-serif';
    ctx.fillText("My Brother's Keeper", rect.width / 2, yOffset);
    yOffset += 50;

    // Draw subtitle
    ctx.fillStyle = '#666666';
    ctx.font = '20px system-ui, -apple-system, sans-serif';
    ctx.fillText('A Safety Network for Truck Drivers', rect.width / 2, yOffset);
    yOffset += 60;

    // Draw introduction card background
    const cardPadding = 48;
    const cardX = cardPadding;
    const cardWidth = rect.width - cardPadding * 2;
    const cardY = yOffset;
    const cardHeight = 280;
    
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#e5e5e5';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(cardX, cardY, cardWidth, cardHeight, 8);
    ctx.fill();
    ctx.stroke();

    // Draw card title
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 24px system-ui, -apple-system, sans-serif';
    ctx.fillText('Stay Safe on the Road', rect.width / 2, cardY + 24);

    // Draw card content (text)
    ctx.fillStyle = '#666666';
    ctx.font = '16px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'left';
    
    const textX = cardX + 24;
    let textY = cardY + 70;
    const lineHeight = 24;
    
    const lines = [
      'My Brother\'s Keeper is a community-driven platform',
      'designed to keep truck drivers safe and connected.',
      '',
      '• Find trusted safe places recommended by fellow truckers',
      '• Share your routes and stay connected with other drivers',
      '• Store emergency contact information securely',
      '• Access SOS features when you need help',
      '',
      'Join a verified community built by truckers, for truckers.',
      'Your safety is our priority.',
    ];

    lines.forEach(line => {
      if (line.startsWith('•')) {
        ctx.fillText(line, textX, textY);
      } else if (line === '') {
        // Skip empty lines but add spacing
      } else {
        ctx.fillText(line, textX, textY);
      }
      textY += lineHeight;
    });

    yOffset = cardY + cardHeight + 48;

    // Draw "Visit the Platform" section
    ctx.textAlign = 'center';
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 24px system-ui, -apple-system, sans-serif';
    ctx.fillText('Visit the Platform', rect.width / 2, yOffset);
    yOffset += 40;

    ctx.fillStyle = '#666666';
    ctx.font = '16px system-ui, -apple-system, sans-serif';
    ctx.fillText('Access the platform by visiting the link below:', rect.width / 2, yOffset);
    yOffset += 50;

    // Draw URL card background
    const urlCardX = cardPadding;
    const urlCardWidth = rect.width - cardPadding * 2;
    const urlCardHeight = 140;
    
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#ff9900';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.roundRect(urlCardX, yOffset, urlCardWidth, urlCardHeight, 12);
    ctx.fill();
    ctx.stroke();

    // Draw "APP LINK:" label
    ctx.fillStyle = '#999999';
    ctx.font = '12px system-ui, -apple-system, sans-serif';
    ctx.fillText('APP LINK:', rect.width / 2, yOffset + 24);

    // Draw URL
    ctx.fillStyle = '#ff9900';
    ctx.font = 'bold 20px monospace';
    
    // Handle long URLs by wrapping if needed
    const maxWidth = urlCardWidth - 48;
    const urlWords = shareUrl.split('/');
    let currentLine = '';
    let urlY = yOffset + 60;
    
    urlWords.forEach((word, index) => {
      const testLine = currentLine + (index > 0 ? '/' : '') + word;
      const metrics = ctx.measureText(testLine);
      
      if (metrics.width > maxWidth && currentLine !== '') {
        ctx.fillText(currentLine, rect.width / 2, urlY);
        currentLine = word;
        urlY += 28;
      } else {
        currentLine = testLine;
      }
    });
    
    if (currentLine !== '') {
      ctx.fillText(currentLine, rect.width / 2, urlY);
    }

    yOffset += urlCardHeight + 48;

    // Draw footer
    ctx.fillStyle = '#999999';
    ctx.font = '14px system-ui, -apple-system, sans-serif';
    ctx.fillText('Built with care for the trucking community', rect.width / 2, yOffset);

    console.log('[Flyer Export] Canvas rendering complete');

    // Convert canvas to blob and download
    return new Promise<void>((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('Failed to create flyer image. Please try again.'));
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
        
        console.log('[Flyer Export] Download triggered successfully');
        resolve();
      }, 'image/png');
    });
  } catch (error) {
    console.error('[Flyer Export] Export error:', error);
    
    // Provide user-friendly error messages
    if (error instanceof Error) {
      // If it's already a user-friendly error, re-throw it
      if (error.message.includes('not ready') || 
          error.message.includes('try again') ||
          error.message.includes('Please')) {
        throw error;
      }
      
      // Map technical errors to user-friendly messages
      if (error.message.includes('taint') || error.message.includes('toBlob')) {
        throw new Error('Unable to export flyer due to browser security restrictions. Please try again or use "Copy Link" instead.');
      }
      
      if (error.message.includes('timeout')) {
        throw new Error('Export took too long. Please try again.');
      }
    }
    
    // Generic fallback error
    throw new Error('Failed to export flyer. Please try again or use "Copy Link" instead.');
  }
}
