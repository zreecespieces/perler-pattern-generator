import { GridSize } from '../types';

/**
 * Export the current pattern as a PNG image
 */
export const exportAsPNG = (gridRef?: HTMLDivElement | null): void => {
  if (!gridRef) return;
  
  // Use html-to-image library functionality
  const grid = gridRef;
  
  // Create a canvas element
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  
  // Set canvas size to match the grid
  const gridRect = grid.getBoundingClientRect();
  canvas.width = gridRect.width;
  canvas.height = gridRect.height;
  
  // Draw a white background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Draw each bead
  const beads = grid.querySelectorAll('[data-bead]');
  beads.forEach((bead) => {
    const beadRect = bead.getBoundingClientRect();
    const color = bead.getAttribute('data-color') || 'transparent';
    
    if (color !== 'transparent') {
      // Calculate relative position
      const x = beadRect.left - gridRect.left;
      const y = beadRect.top - gridRect.top;
      
      // Draw the bead
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(
        x + beadRect.width / 2, 
        y + beadRect.height / 2, 
        beadRect.width / 2, 
        0, 
        Math.PI * 2
      );
      ctx.fill();
      
      // Draw a subtle border
      ctx.strokeStyle = 'rgba(0,0,0,0.2)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  });
  
  // Convert canvas to data URL and trigger download
  const dataUrl = canvas.toDataURL('image/png');
  const link = document.createElement('a');
  link.download = 'perler-pattern.png';
  link.href = dataUrl;
  link.click();
};

/**
 * Export the current pattern as a JSON file
 */
export const exportAsJSON = (
  gridSize: GridSize, 
  scale: number, 
  perlerPattern: string[][]
): void => {
  // Create state object
  const state = {
    gridSize,
    scale,
    perlerPattern
  };
  
  // Convert to JSON
  const json = JSON.stringify(state, null, 2);
  
  // Create download link
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'perler-pattern.json';
  a.click();
  
  // Clean up
  URL.revokeObjectURL(url);
};

/**
 * Import a pattern from a JSON file
 */
export const importFromJSON = (
  file: File,
  onImportSuccess: (gridSize: GridSize, scale: number, perlerPattern: string[][], hasImage: boolean) => void,
  onImportError: (error: Error) => void
): void => {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const content = e.target?.result as string;
      const state = JSON.parse(content);
      
      // Check if it's a valid state file
      if (!state.perlerPattern || !state.gridSize) {
        throw new Error('Invalid state file');
      }
      
      onImportSuccess(state.gridSize, state.scale || 100, state.perlerPattern, state.hasImage || false);
      
    } catch (error) {
      console.error('Error importing state:', error);
      onImportError(error as Error);
    }
  };
  reader.readAsText(file);
};
