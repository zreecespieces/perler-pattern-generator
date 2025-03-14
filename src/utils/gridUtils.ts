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
