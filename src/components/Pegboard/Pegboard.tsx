import React, { useCallback } from 'react';
import CanvasGrid from '../CanvasGrid';
import ColorLegend from '../ColorLegend';
import { GridSize, EditTool } from '../../types';
import { Box, useMediaQuery } from '@mui/material';

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
  onReplaceColor?: (oldColor: string, newColor: string) => void;
  scale?: number;
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
  onMouseUp,
  onReplaceColor,
  scale = 100,
}) => {
  const isMobile = useMediaQuery(theme => theme.breakpoints.down("md"))
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

  // When a color is selected for replacement
  const handleReplaceColor = useCallback((oldColor: string) => {
    // Open color picker - this will be handled by the parent component
    if (onReplaceColor) {
      onReplaceColor(oldColor, ''); // Initially empty new color, will be filled when user selects a color
    }
  }, [onReplaceColor]);

  return (
    <Box 
      ref={gridRef}
      sx={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: '100%',
        overflow: 'hidden', // Changed from 'auto' to 'hidden'
        position: 'relative',
      }}
      onMouseLeave={handleMouseLeave}
    >
      {!isMobile && (
        <ColorLegend perlerPattern={perlerPattern} onReplaceColor={handleReplaceColor} />
      )}
      
      <CanvasGrid
        perlerPattern={perlerPattern}
        gridSize={gridSize}
        onMouseDown={handleMouseDown}
        onMouseOver={handleMouseOver}
        onMouseUp={handleMouseUp}
        currentTool={currentTool}
        scale={scale}
      />

      {/* Color legend showing counts of each color used */}
      {isMobile && (
        <>
          <br />
          <ColorLegend perlerPattern={perlerPattern} onReplaceColor={handleReplaceColor} />
        </>
      )}
    </Box>
  );
};

export default Pegboard;
