import React, { useCallback } from 'react';
import CanvasGrid from '../CanvasGrid';
import { GridSize, EditTool } from '../../types';
import { Box } from '@mui/material';

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

  return (
    <Box 
      ref={gridRef}
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: '100%',
        overflow: 'auto', // Make the inner container scrollable
        position: 'relative',
      }}
      onMouseLeave={handleMouseLeave}
    >
      <CanvasGrid
        perlerPattern={perlerPattern}
        gridSize={gridSize}
        onMouseDown={handleMouseDown}
        onMouseOver={handleMouseOver}
        onMouseUp={handleMouseUp}
        currentTool={currentTool}
      />
    </Box>
  );
};

export default Pegboard;
