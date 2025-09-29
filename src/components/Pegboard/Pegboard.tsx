import React, { useCallback } from "react";
import CanvasGrid from "../CanvasGrid";
import ColorLegend from "../ColorLegend";
import { GridSize, EditTool, PanDirection } from "../../types";
import { PanControls } from "../Controls";
import { Box, useMediaQuery } from "@mui/material";

interface PegboardProps {
  perlerPattern: string[][];
  gridSize: GridSize;
  isLargeGrid: boolean; // Keep for compatibility but we won't use it anymore
  gridRef: React.RefObject<HTMLDivElement | null>;
  currentTool: EditTool;
  isMouseDown: boolean;
  setIsMouseDown: (isDown: boolean) => void;
  onCellClick: (y: number, x: number, mods?: { subtract: boolean }) => void;
  onMouseOver?: (y: number, x: number, mods?: { subtract: boolean }) => void;
  onMouseUp?: () => void;
  onReplaceColor?: (oldColor: string, newColor: string) => void;
  scale?: number;
  onPan: (direction: PanDirection) => void;
  onRecenter: () => void;
  selectedCells?: Set<string>;
  selectionDragOffset?: { dx: number; dy: number };
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
  onPan,
  onRecenter,
  selectedCells,
  selectionDragOffset,
}) => {
  const isMobile = useMediaQuery((theme) => theme.breakpoints.down("md"));
  // Mouse handlers for dragging paint/erase
  const handleMouseDown = useCallback(
    (y: number, x: number, mods?: { subtract: boolean }) => {
      setIsMouseDown(true);
      onCellClick(y, x, mods);
    },
    [setIsMouseDown, onCellClick]
  );

  const handleMouseOver = useCallback(
    (y: number, x: number, mods?: { subtract: boolean }) => {
      if (onMouseOver) {
        onMouseOver(y, x, mods);
      }
    },
    [onMouseOver]
  );

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
  const handleReplaceColor = useCallback(
    (oldColor: string) => {
      // Open color picker - this will be handled by the parent component
      if (onReplaceColor) {
        onReplaceColor(oldColor, ""); // Initially empty new color, will be filled when user selects a color
      }
    },
    [onReplaceColor]
  );

  return (
    <Box
      ref={gridRef}
      sx={{
        display: isMobile ? "flex" : "grid",
        flexDirection: isMobile ? "column" : undefined,
        gridTemplateColumns: isMobile ? undefined : "1fr auto 1fr",
        justifyItems: isMobile ? undefined : "center",
        columnGap: isMobile ? 0 : 2,
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        height: "100%",
        position: "relative",
      }}
      onMouseLeave={handleMouseLeave}>
      <Box
        sx={{
          gridColumn: isMobile ? undefined : 2,
          display: "inline-flex",
          width: "fit-content",
          height: "fit-content",
          justifyContent: "center",
          alignItems: "center",
        }}>
        <CanvasGrid
          perlerPattern={perlerPattern}
          gridSize={gridSize}
          onMouseDown={handleMouseDown}
          onMouseOver={handleMouseOver}
          onMouseUp={handleMouseUp}
          currentTool={currentTool}
          scale={scale}
          selectedCells={selectedCells}
          selectionDragOffset={selectionDragOffset}
        />
      </Box>

      {!isMobile && (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "stretch",
            gridColumn: 3,
            height: "100%",
            justifySelf: "end",
            width: "max-content",
          }}>
          <ColorLegend perlerPattern={perlerPattern} onReplaceColor={handleReplaceColor} />
          <Box sx={{ flexGrow: 1 }} />
          <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
            <PanControls onPan={onPan} onRecenter={onRecenter} />
          </Box>
        </Box>
      )}

      {/* Color legend showing counts of each color used */}
      {isMobile && (
        <>
          <br />
          <Box sx={{ mt: 1, display: "flex", justifyContent: "flex-end", width: "100%" }}>
            <PanControls onPan={onPan} onRecenter={onRecenter} />
          </Box>
          <ColorLegend perlerPattern={perlerPattern} onReplaceColor={handleReplaceColor} />
        </>
      )}
    </Box>
  );
};

export default Pegboard;
