import { useState, useCallback, useMemo } from 'react';
import { GridSize, EditTool } from '../types';
import { initializeEmptyGrid, resizeGrid, fillArea } from '../utils/gridUtils';
import useHistory from './useHistory';

/**
 * Custom hook to manage the perler pattern state and operations
 */
export const usePerlerPattern = (initialGridSize: GridSize) => {
  // Initialize with an empty grid
  const initialPattern = useMemo(() => initializeEmptyGrid(initialGridSize), 
    [initialGridSize]);
  
  const [perlerPattern, setPerlerPattern] = useState<string[][]>(initialPattern);
  const [gridSize, setGridSize] = useState<GridSize>(initialGridSize);
  const [separateDimensions, setSeparateDimensions] = useState(false);

  // History management
  const { 
    addToHistory, 
    handleUndo, 
    handleRedo, 
    resetHistory,
    canUndo,
    canRedo 
  } = useHistory(initialPattern);

  // Clear the grid
  const clearPattern = useCallback(() => {
    const emptyGrid = initializeEmptyGrid(gridSize);
    setPerlerPattern(emptyGrid);
    resetHistory(emptyGrid);
  }, [gridSize, resetHistory]);

  // Handle grid size changes
  const handleGridSizeChange = useCallback((value: number) => {
    if (separateDimensions) return; // Skip if using separate controls
    
    // Calculate new dimensions while maintaining aspect ratio
    const aspectRatio = gridSize.width / gridSize.height;
    
    // Determine if we should adjust based on width or height
    let newWidth, newHeight;
    
    if (aspectRatio >= 1) {
      // Wider than tall, or square
      newWidth = value;
      newHeight = Math.round(value / aspectRatio);
    } else {
      // Taller than wide
      newHeight = value;
      newWidth = Math.round(value * aspectRatio);
    }
    
    // Ensure minimum size
    newWidth = Math.max(5, newWidth);
    newHeight = Math.max(5, newHeight);
    
    const newSize = { width: newWidth, height: newHeight };
    setGridSize(newSize);
    
    // Create a new grid with the new dimensions
    const newGrid = resizeGrid(perlerPattern, newSize);
    setPerlerPattern(newGrid);
    addToHistory(newGrid);
  }, [gridSize, perlerPattern, separateDimensions, addToHistory]);
  
  // Handle individual dimension changes
  const handleDimensionChange = useCallback((dimension: 'width' | 'height', value: number) => {
    const newSize = { ...gridSize, [dimension]: value };
    setGridSize(newSize);
    
    const newGrid = resizeGrid(perlerPattern, newSize);
    setPerlerPattern(newGrid);
    addToHistory(newGrid);
  }, [gridSize, perlerPattern, addToHistory]);
  
  // Handle toggling between separate and combined dimension controls
  const handleSeparateDimensionsChange = useCallback((checked: boolean) => {
    // Update state first
    setSeparateDimensions(checked);
    
    // If switching to combined mode, normalize the grid to a square or reasonable aspect ratio
    if (!checked) {
      // Calculate the average of width and height
      const avgSize = Math.round((gridSize.width + gridSize.height) / 2);
      
      // Use the larger dimension to set the new size
      const newSize = { width: avgSize, height: avgSize };
      setGridSize(newSize);
      
      // Resize the grid with the new dimensions
      const newGrid = resizeGrid(perlerPattern, newSize);
      setPerlerPattern(newGrid);
      addToHistory(newGrid);
    }
  }, [gridSize, perlerPattern, addToHistory]);

  // Update the pattern at a specific position
  const updatePatternAt = useCallback((y: number, x: number, color: string, tool: EditTool) => {
    // Create a copy of the current pattern
    const newPattern = perlerPattern.map(row => [...row]);
    
    switch (tool) {
      case EditTool.PAINT:
        newPattern[y][x] = color;
        break;
      case EditTool.ERASE:
        newPattern[y][x] = 'transparent';
        break;
      case EditTool.BUCKET:
        fillArea(newPattern, y, x, perlerPattern[y][x], color, gridSize);
        break;
      default:
        return;
    }
    
    setPerlerPattern(newPattern);
    addToHistory(newPattern);
    return newPattern;
  }, [perlerPattern, gridSize, addToHistory]);

  // Perform undo/redo operations
  const undoPattern = useCallback(() => {
    const previousPattern = handleUndo();
    if (previousPattern) {
      setPerlerPattern(previousPattern);
    }
  }, [handleUndo]);

  const redoPattern = useCallback(() => {
    const nextPattern = handleRedo();
    if (nextPattern) {
      setPerlerPattern(nextPattern);
    }
  }, [handleRedo]);

  // Check if grid is large enough to warrant using canvas renderer
  const isLargeGrid = useMemo(() => {
    return gridSize.width * gridSize.height > 900; // Use canvas rendering for grids larger than 30x30
  }, [gridSize.width, gridSize.height]);

  return {
    perlerPattern,
    setPerlerPattern,
    gridSize,
    setGridSize,
    separateDimensions,
    setSeparateDimensions: handleSeparateDimensionsChange,
    clearPattern,
    handleGridSizeChange,
    handleDimensionChange,
    updatePatternAt,
    undoPattern,
    redoPattern,
    addToHistory,
    canUndo,
    canRedo,
    isLargeGrid
  };
};

export default usePerlerPattern;
