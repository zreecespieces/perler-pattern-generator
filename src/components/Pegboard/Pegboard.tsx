import React, { useCallback } from 'react';
import CanvasGrid from '../CanvasGrid';
import { GridSize, EditTool } from '../../types';

interface PegboardProps {
  perlerPattern: string[][];
  gridSize: GridSize;
  isLargeGrid: boolean; // Keep for compatibility but we won't use it anymore
  gridRef: React.RefObject<HTMLDivElement | null>;
  currentTool: EditTool;
  isMouseDown: boolean;
  setIsMouseDown: (isDown: boolean) => void;
  onCellClick: (y: number, x: number) => void;
  onMouseOver?: (y: number, x: number) => void;
  onMouseUp?: () => void;
}

const Pegboard: React.FC<PegboardProps> = ({
  perlerPattern,
  gridSize,
  gridRef,
  currentTool,
  isMouseDown,
  setIsMouseDown,
  onCellClick,
  onMouseOver,
  onMouseUp
}) => {
  // Mouse handlers for dragging paint/erase
  const handleMouseDown = useCallback((y: number, x: number) => {
    setIsMouseDown(true);
    onCellClick(y, x);
  }, [setIsMouseDown, onCellClick]);

  const handleMouseOver = useCallback((y: number, x: number) => {
    if (onMouseOver) {
      onMouseOver(y, x);
    }
  }, [onMouseOver]);

  const handleMouseUp = useCallback(() => {
    setIsMouseDown(false);
    if (onMouseUp) {
      onMouseUp();
    }
  }, [setIsMouseDown, onMouseUp]);
  
  // Add mouse leave handler to handle cases where cursor leaves the pegboard
  const handleMouseLeave = useCallback(() => {
    if (isMouseDown) {
      setIsMouseDown(false);
      if (onMouseUp) {
        onMouseUp();
      }
    }
  }, [isMouseDown, setIsMouseDown, onMouseUp]);

  // Always use CanvasGrid for consistent rendering and better performance
  return (
    <div 
      ref={gridRef}
      onMouseLeave={handleMouseLeave}
      style={{
        // Add some styling for the container
        border: '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '4px',
        overflow: 'hidden',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        backgroundColor: 'rgba(30, 30, 30, 0.6)'
      }}
    >
      <CanvasGrid
        perlerPattern={perlerPattern}
        gridSize={gridSize}
        onMouseDown={handleMouseDown}
        onMouseOver={handleMouseOver}
        onMouseUp={handleMouseUp}
        currentTool={currentTool}
      />
    </div>
  );
};

export default Pegboard;
