import { GridSize } from '../types';

/**
 * Initialize an empty grid with the specified dimensions
 */
export const initializeEmptyGrid = (gridSize: GridSize): string[][] => {
  const emptyGrid: string[][] = [];
  for (let y = 0; y < gridSize.height; y++) {
    const row: string[] = [];
    for (let x = 0; x < gridSize.width; x++) {
      row.push('transparent');
    }
    emptyGrid.push(row);
  }
  return emptyGrid;
};

/**
 * Flood fill algorithm for paint bucket tool
 */
export const fillArea = (
  pattern: string[][], 
  y: number, 
  x: number, 
  targetColor: string, 
  replacementColor: string,
  gridSize: GridSize
): void => {
  if (targetColor === replacementColor) return;
  
  const queue: [number, number][] = [];
  queue.push([y, x]);
  
  while (queue.length > 0) {
    const [cy, cx] = queue.shift()!;
    
    if (cy < 0 || cy >= gridSize.height || cx < 0 || cx >= gridSize.width) continue;
    if (pattern[cy][cx] !== targetColor) continue;
    
    pattern[cy][cx] = replacementColor;
    
    // Add adjacent cells to queue (4-way connectivity)
    queue.push([cy + 1, cx]);
    queue.push([cy - 1, cx]);
    queue.push([cy, cx + 1]);
    queue.push([cy, cx - 1]);
  }
};

/**
 * Resize grid while maintaining existing content
 */
export const resizeGrid = (
  currentPattern: string[][], 
  newSize: GridSize
): string[][] => {
  const newGrid: string[][] = [];
  for (let y = 0; y < newSize.height; y++) {
    const row: string[] = [];
    for (let x = 0; x < newSize.width; x++) {
      // Copy existing cells if they exist, otherwise use transparent
      row.push(y < currentPattern.length && x < currentPattern[y].length 
        ? currentPattern[y][x] 
        : 'transparent');
    }
    newGrid.push(row);
  }
  return newGrid;
};

/**
 * Shift the pattern one cell up. Cells falling off the top are discarded;
 * the bottom row is filled with 'transparent'.
 */
export const shiftPatternUp = (pattern: string[][], gridSize: GridSize): string[][] => {
  const h = gridSize.height;
  const w = gridSize.width;
  const newGrid: string[][] = [];
  for (let y = 0; y < h; y++) {
    const row: string[] = [];
    for (let x = 0; x < w; x++) {
      row.push(y < h - 1 ? pattern[y + 1][x] : 'transparent');
    }
    newGrid.push(row);
  }
  return newGrid;
};

/**
 * Shift the pattern one cell down. Cells falling off the bottom are discarded;
 * the top row is filled with 'transparent'.
 */
export const shiftPatternDown = (pattern: string[][], gridSize: GridSize): string[][] => {
  const h = gridSize.height;
  const w = gridSize.width;
  const newGrid: string[][] = [];
  for (let y = 0; y < h; y++) {
    const row: string[] = [];
    for (let x = 0; x < w; x++) {
      row.push(y > 0 ? pattern[y - 1][x] : 'transparent');
    }
    newGrid.push(row);
  }
  return newGrid;
};

/**
 * Shift the pattern one cell left. Cells falling off the left are discarded;
 * the rightmost column is filled with 'transparent'.
 */
export const shiftPatternLeft = (pattern: string[][], gridSize: GridSize): string[][] => {
  const h = gridSize.height;
  const w = gridSize.width;
  const newGrid: string[][] = [];
  for (let y = 0; y < h; y++) {
    const row: string[] = [];
    for (let x = 0; x < w; x++) {
      row.push(x < w - 1 ? pattern[y][x + 1] : 'transparent');
    }
    newGrid.push(row);
  }
  return newGrid;
};

/**
 * Shift the pattern one cell right. Cells falling off the right are discarded;
 * the leftmost column is filled with 'transparent'.
 */
export const shiftPatternRight = (pattern: string[][], gridSize: GridSize): string[][] => {
  const h = gridSize.height;
  const w = gridSize.width;
  const newGrid: string[][] = [];
  for (let y = 0; y < h; y++) {
    const row: string[] = [];
    for (let x = 0; x < w; x++) {
      row.push(x > 0 ? pattern[y][x - 1] : 'transparent');
    }
    newGrid.push(row);
  }
  return newGrid;
};

/**
 * Shift the pattern by an arbitrary number of cells (dx to the right, dy down).
 * Positive dx shifts content to the right; positive dy shifts content downward.
 * Newly revealed cells are 'transparent'.
 */
export const shiftPatternBy = (
  pattern: string[][],
  gridSize: GridSize,
  dx: number,
  dy: number
): string[][] => {
  const h = gridSize.height;
  const w = gridSize.width;
  const newGrid: string[][] = [];
  for (let y = 0; y < h; y++) {
    const row: string[] = [];
    for (let x = 0; x < w; x++) {
      const sx = x - dx;
      const sy = y - dy;
      if (sy >= 0 && sy < h && sx >= 0 && sx < w) {
        row.push(pattern[sy][sx]);
      } else {
        row.push('transparent');
      }
    }
    newGrid.push(row);
  }
  return newGrid;
};
