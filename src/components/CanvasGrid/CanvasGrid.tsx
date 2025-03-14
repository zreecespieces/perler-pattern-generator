import React, { useRef, useEffect, memo, useCallback } from 'react';
import { GridSize, EditTool } from '../../types';

interface CanvasGridProps {
  perlerPattern: string[][];
  onMouseDown: (y: number, x: number) => void;
  onMouseOver: (y: number, x: number) => void;
  onMouseUp: () => void;
  gridSize: GridSize;
  currentTool: EditTool;
}

// Canvas-based grid renderer with improved visuals for all grid sizes
const CanvasGrid: React.FC<CanvasGridProps> = ({ 
  perlerPattern, 
  onMouseDown, 
  onMouseOver, 
  onMouseUp,
  gridSize,
  currentTool
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const pixelSize = 16; // Size of each bead in pixels
  
  // Remember last cell position to prevent firing events on the same cell rapidly
  const lastCellRef = useRef<{ x: number, y: number } | null>(null);
  
  // Track if mouse is down
  const isMouseDownRef = useRef<boolean>(false);
  
  // Draw the grid with enhanced styling
  const drawGrid = useCallback(() => {
    const canvas = canvasRef.current;
    const context = contextRef.current;
    if (!canvas || !context) return;
    
    // Clear canvas
    context.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid background with a subtle pattern
    context.fillStyle = '#2a2a2a';
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw subtle background pattern
    context.fillStyle = 'rgba(255, 255, 255, 0.03)';
    for (let y = 0; y < gridSize.height; y++) {
      for (let x = 0; x < gridSize.width; x++) {
        if ((x + y) % 2 === 0) {
          context.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
        }
      }
    }
    
    // Draw beads with simple styling
    for (let y = 0; y < perlerPattern.length; y++) {
      for (let x = 0; x < perlerPattern[y].length; x++) {
        const color = perlerPattern[y][x];
        if (color === 'transparent') continue;
        
        const centerX = x * pixelSize + pixelSize / 2;
        const centerY = y * pixelSize + pixelSize / 2;
        const radius = pixelSize / 2 - 1;
        
        // Simple bead circle without special effects
        context.beginPath();
        context.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        context.fillStyle = color;
        context.fill();
        
        // Draw a simple border
        context.strokeStyle = 'rgba(0, 0, 0, 0.2)';
        context.lineWidth = 0.5;
        context.stroke();
      }
    }
    
    // Draw grid lines with improved styling
    context.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    context.lineWidth = 1;
    
    // Draw horizontal lines
    for (let y = 0; y <= gridSize.height; y++) {
      context.beginPath();
      context.moveTo(0, y * pixelSize);
      context.lineTo(canvas.width, y * pixelSize);
      context.stroke();
    }
    
    // Draw vertical lines
    for (let x = 0; x <= gridSize.width; x++) {
      context.beginPath();
      context.moveTo(x * pixelSize, 0);
      context.lineTo(x * pixelSize, canvas.height);
      context.stroke();
    }
  }, [perlerPattern, gridSize]);
  
  // Handle mouse events
  const getCellCoordinates = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / pixelSize);
    const y = Math.floor((e.clientY - rect.top) / pixelSize);
    
    // Check bounds
    if (x < 0 || x >= gridSize.width || y < 0 || y >= gridSize.height) return null;
    
    return { x, y };
  };
  
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const coords = getCellCoordinates(e);
    if (!coords) return;
    
    isMouseDownRef.current = true;
    lastCellRef.current = coords;
    onMouseDown(coords.y, coords.x);
  };
  
  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const coords = getCellCoordinates(e);
    if (!coords) return;
    
    // Avoid triggering mouse over on the same cell multiple times
    if (lastCellRef.current?.x === coords.x && lastCellRef.current?.y === coords.y) return;
    
    lastCellRef.current = coords;
    if (isMouseDownRef.current) {
      onMouseOver(coords.y, coords.x);
    }
  };
  
  const handleCanvasMouseUp = () => {
    isMouseDownRef.current = false;
    onMouseUp();
  };
  
  const handleCanvasMouseLeave = () => {
    isMouseDownRef.current = false;
    onMouseUp();
  };
  
  // Initialize canvas and draw initial grid
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Set canvas size
    canvas.width = gridSize.width * pixelSize;
    canvas.height = gridSize.height * pixelSize;
    
    // Get context
    const context = canvas.getContext('2d');
    if (!context) return;
    
    contextRef.current = context;
    context.imageSmoothingEnabled = false; // Disable anti-aliasing for pixel art
    
    // Draw initial grid
    drawGrid();
  }, [gridSize, drawGrid]); // Re-initialize when grid size changes
  
  // Redraw when pattern changes
  useEffect(() => {
    drawGrid();
  }, [perlerPattern, drawGrid]);
  
  // Set appropriate cursor based on the current tool
  const getCursorStyle = () => {
    switch (currentTool) {
      case EditTool.PAINT:
        return 'url("data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2224%22 height=%2224%22 viewBox=%220 0 24 24%22%3E%3Cpath d=%22M7 14c-1.66 0-3 1.34-3 3 0 1.31-1.16 2-2 2 .92 1.22 2.49 2 4 2 2.21 0 4-1.79 4-4 0-1.66-1.34-3-3-3zm13.71-9.37l-1.34-1.34c-.39-.39-1.02-.39-1.41 0L9 12.25 11.75 15l8.96-8.96c.39-.39.39-1.02 0-1.41z%22/%3E%3C/svg%3E") 4 20, auto';
      case EditTool.ERASE:
        return 'url("data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2224%22 height=%2224%22 viewBox=%220 0 24 24%22%3E%3Cpath d=%22M15.14 3c-.51 0-1.02.2-1.41.59L2.59 14.73c-.78.77-.78 2.04 0 2.83L5.03 20h7.97l8.23-8.24c.78-.77.78-2.03 0-2.83l-4.68-4.68c-.38-.38-.89-.58-1.41-.58zM7.52 17.5H6.15l-2.3-2.3 4.39-4.39 2.3 2.3-2.96 4.39z%22/%3E%3C/svg%3E") 4 20, auto';
      case EditTool.EYEDROPPER:
        return 'url("data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2224%22 height=%2224%22 viewBox=%220 0 24 24%22%3E%3Cpath d=%22M20.71 5.63l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-3.12 3.12-1.93-1.91-1.41 1.41 1.42 1.42L3 16.25V21h4.75l8.92-8.92 1.42 1.42 1.41-1.41-1.92-1.92 3.12-3.12c.4-.4.4-1.03.01-1.42zM6.92 19L5 17.08l8.06-8.06 1.92 1.92L6.92 19z%22/%3E%3C/svg%3E") 4 20, auto';
      case EditTool.BUCKET:
        return 'url("data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2224%22 height=%2224%22 viewBox=%220 0 24 24%22%3E%3Cpath d=%22M16.56 8.94L7.62 0 6.21 1.41l2.38 2.38-5.15 5.15c-.59.59-.59 1.54 0 2.12l5.5 5.5c.29.29.68.44 1.06.44s.77-.15 1.06-.44l5.5-5.5c.59-.58.59-1.53 0-2.12zM5.21 10L10 5.21 14.79 10H5.21zM19 11.5s-2 2.17-2 3.5c0 1.1.9 2 2 2s2-.9 2-2c0-1.33-2-3.5-2-3.5z%22/%3E%3C/svg%3E") 4 20, auto';
      default:
        return 'pointer';
    }
  };
  
  return (
    <canvas
      ref={canvasRef}
      onMouseDown={handleCanvasMouseDown}
      onMouseMove={handleCanvasMouseMove}
      onMouseUp={handleCanvasMouseUp}
      onMouseLeave={handleCanvasMouseLeave}
      style={{ 
        cursor: getCursorStyle(),
        display: 'block', // Removes any extra space below canvas
        boxShadow: '0 0 5px rgba(0, 0, 0, 0.2)', // Subtle shadow
        borderRadius: '2px' // Slightly rounded corners
      }}
    />
  );
};

// Use memo to prevent unnecessary re-renders
export default memo(CanvasGrid);
