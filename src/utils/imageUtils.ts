import { GridSize } from '../types';

/**
 * Convert RGB values to hex color string
 */
export const rgbToHex = (r: number, g: number, b: number): string => {
  return '#' + [r, g, b].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
};

/**
 * Generate a perler pattern from an image URL
 */
export const generatePerlerPattern = (
  imageUrl: string, 
  scalePercent: number, 
  gridSize: GridSize, 
  onPatternGenerated: (pattern: string[][]) => void
): void => {
  const img = new Image();
  img.onload = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas size to match our grid
    canvas.width = gridSize.width;
    canvas.height = gridSize.height;
    
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Calculate scaling and positioning to maintain aspect ratio
    const imgAspectRatio = img.width / img.height;
    const gridAspectRatio = gridSize.width / gridSize.height;
    
    let scaledWidth, scaledHeight;
    
    if (imgAspectRatio > gridAspectRatio) {
      // Image is wider than grid (relative to height)
      scaledWidth = gridSize.width * (scalePercent / 100);
      scaledHeight = scaledWidth / imgAspectRatio;
    } else {
      // Image is taller than grid (relative to width)
      scaledHeight = gridSize.height * (scalePercent / 100);
      scaledWidth = scaledHeight * imgAspectRatio;
    }
    
    // Center the image on the canvas
    const offsetX = (gridSize.width - scaledWidth) / 2;
    const offsetY = (gridSize.height - scaledHeight) / 2;
    
    // Draw the image centered and scaled
    ctx.drawImage(img, offsetX, offsetY, scaledWidth, scaledHeight);
    
    // Get image data for each "pixel" (perler bead)
    const pattern: string[][] = [];
    
    // Initialize with empty (transparent) pixels
    for (let y = 0; y < gridSize.height; y++) {
      const row: string[] = [];
      for (let x = 0; x < gridSize.width; x++) {
        row.push('transparent');
      }
      pattern.push(row);
    }
    
    // Fill in pixels where the image is drawn
    for (let y = 0; y < gridSize.height; y++) {
      for (let x = 0; x < gridSize.width; x++) {
        const pixelData = ctx.getImageData(x, y, 1, 1).data;
        
        // Only add a colored bead if the pixel has some opacity
        if (pixelData[3] > 10) { // Alpha channel > 10 (not fully transparent)
          // Convert RGB to hex color
          const color = rgbToHex(pixelData[0], pixelData[1], pixelData[2]);
          pattern[y][x] = color;
        }
      }
    }
    
    onPatternGenerated(pattern);
  };
  img.src = imageUrl;
};
