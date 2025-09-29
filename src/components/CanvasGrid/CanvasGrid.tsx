import React, { useRef, useEffect, memo, useCallback } from "react";
import { GridSize, EditTool } from "../../types";
import { Box } from "@mui/material";
import { parseCellKey } from "../../utils/selectionUtils";

interface CanvasGridProps {
  perlerPattern: string[][];
  onMouseDown: (y: number, x: number, mods?: { subtract: boolean }) => void;
  onMouseOver: (y: number, x: number, mods?: { subtract: boolean }) => void;
  onMouseUp: () => void;
  gridSize: GridSize;
  currentTool: EditTool;
  scale?: number;
  selectedCells?: Set<string>;
  selectionDragOffset?: { dx: number; dy: number };
}

// Canvas-based grid renderer with improved visuals for all grid sizes
const CanvasGrid: React.FC<CanvasGridProps> = ({
  perlerPattern,
  onMouseDown,
  onMouseOver,
  onMouseUp,
  gridSize,
  currentTool,
  scale = 100,
  selectedCells,
  selectionDragOffset,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const pixelSize = 16; // Size of each bead in pixels

  // Remember last cell position to prevent firing events on the same cell rapidly
  const lastCellRef = useRef<{ x: number; y: number } | null>(null);

  // Track if mouse is down
  const isMouseDownRef = useRef<boolean>(false);

  // Store scaling factor for mouse coordinates calculation
  const scalingFactorRef = useRef<number>(1);

  // Update the drawGrid function to account for the new scaling approach
  const drawGrid = useCallback(() => {
    const canvas = canvasRef.current;
    const context = contextRef.current;
    if (!canvas || !context) return;

    // Clear canvas
    context.clearRect(0, 0, canvas.width / (scale / 100), canvas.height / (scale / 100));

    // Save the current context state before any transformations
    context.save();

    // Reset any existing transform before applying a new one
    context.setTransform(1, 0, 0, 1, 0, 0);

    // Apply the user scaling to the context
    const userScaling = scale / 100;
    context.scale(userScaling, userScaling);

    // Draw grid background with a subtle pattern
    context.fillStyle = "#2a2a2a";
    context.fillRect(0, 0, gridSize.width * pixelSize, gridSize.height * pixelSize);

    // Draw subtle background pattern
    context.fillStyle = "rgba(255, 255, 255, 0.03)";
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
        if (color === "transparent") continue;

        const centerX = x * pixelSize + pixelSize / 2;
        const centerY = y * pixelSize + pixelSize / 2;
        const radius = pixelSize / 2 - 1;

        // Simple bead circle without special effects
        context.beginPath();
        context.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        context.fillStyle = color;
        context.fill();

        // Draw a simple border
        context.strokeStyle = "rgba(0, 0, 0, 0.2)";
        context.lineWidth = 0.5;
        context.stroke();
      }
    }

    // Draw grid lines with improved styling
    context.strokeStyle = "rgba(255, 255, 255, 0.1)";
    context.lineWidth = 1;

    // Draw horizontal lines
    for (let y = 0; y <= gridSize.height; y++) {
      context.beginPath();
      context.moveTo(0, y * pixelSize);
      context.lineTo(gridSize.width * pixelSize, y * pixelSize);
      context.stroke();
    }

    // Draw vertical lines
    for (let x = 0; x <= gridSize.width; x++) {
      context.beginPath();
      context.moveTo(x * pixelSize, 0);
      context.lineTo(x * pixelSize, gridSize.height * pixelSize);
      context.stroke();
    }

    // Selection drag ghost preview (semi-transparent beads at destination)
    if (
      selectedCells &&
      selectedCells.size > 0 &&
      selectionDragOffset &&
      (selectionDragOffset.dx !== 0 || selectionDragOffset.dy !== 0)
    ) {
      for (const key of selectedCells) {
        const { y, x } = parseCellKey(key);
        const tx = x + selectionDragOffset.dx;
        const ty = y + selectionDragOffset.dy;
        if (tx < 0 || ty < 0 || tx >= gridSize.width || ty >= gridSize.height) continue;
        const color = perlerPattern[y][x];
        if (color === "transparent") continue;
        const centerX = tx * pixelSize + pixelSize / 2;
        const centerY = ty * pixelSize + pixelSize / 2;
        const radius = pixelSize / 2 - 1;
        context.beginPath();
        context.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        context.fillStyle = color;
        context.globalAlpha = 0.6;
        context.fill();
        context.globalAlpha = 1.0;
        context.strokeStyle = "rgba(0, 0, 0, 0.2)";
        context.lineWidth = 0.5;
        context.stroke();
      }
    }

    // Selection highlight overlay
    if (selectedCells && selectedCells.size > 0) {
      // Use a subtle but visible highlight
      context.strokeStyle = "rgba(0, 200, 255, 0.9)";
      context.lineWidth = 2;
      for (const key of selectedCells) {
        const { y, x } = parseCellKey(key);
        // Draw an inset rectangle highlight per cell
        const inset = 1.5;
        context.strokeRect(
          x * pixelSize + inset,
          y * pixelSize + inset,
          pixelSize - inset * 2,
          pixelSize - inset * 2
        );
      }
    }

    // Restore the context state
    context.restore();
  }, [perlerPattern, gridSize, scale, selectedCells, selectionDragOffset]);

  // Handle mouse events
  const getCellCoordinates = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    const scaling = scalingFactorRef.current; // This is displayWidth / canvasWidth

    // First calculate position in display space
    const displayX = e.clientX - rect.left;
    const displayY = e.clientY - rect.top;

    // Then convert to canvas space accounting for the scaling
    // We divide by scaling because the canvas is actually smaller/larger than its display size
    const canvasX = displayX / scaling;
    const canvasY = displayY / scaling;

    // Finally convert to grid cell coordinates (taking into account the context scaling)
    // Since the context is scaled by userScaling, we need to divide by it to get actual pixel coordinates
    const userScaling = scale / 100;
    const x = Math.floor(canvasX / (pixelSize * userScaling));
    const y = Math.floor(canvasY / (pixelSize * userScaling));

    // Check bounds
    if (x < 0 || x >= gridSize.width || y < 0 || y >= gridSize.height) return null;

    return { x, y };
  };

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const coords = getCellCoordinates(e);
    if (!coords) return;

    isMouseDownRef.current = true;
    lastCellRef.current = coords;
    const subtract = e.metaKey || e.ctrlKey;
    onMouseDown(coords.y, coords.x, { subtract });
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const coords = getCellCoordinates(e);
    if (!coords) return;

    // Avoid triggering mouse over on the same cell multiple times
    if (lastCellRef.current?.x === coords.x && lastCellRef.current?.y === coords.y) return;

    lastCellRef.current = coords;
    if (isMouseDownRef.current) {
      const subtract = e.metaKey || e.ctrlKey;
      onMouseOver(coords.y, coords.x, { subtract });
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

  // Touch support (mobile)
  const getCellCoordinatesFromTouch = (e: React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || e.touches.length === 0) return null;

    const rect = canvas.getBoundingClientRect();
    const scaling = scalingFactorRef.current;
    const touch = e.touches[0];

    const displayX = touch.clientX - rect.left;
    const displayY = touch.clientY - rect.top;

    const canvasX = displayX / scaling;
    const canvasY = displayY / scaling;

    const userScaling = scale / 100;
    const x = Math.floor(canvasX / (pixelSize * userScaling));
    const y = Math.floor(canvasY / (pixelSize * userScaling));

    if (x < 0 || x >= gridSize.width || y < 0 || y >= gridSize.height) return null;
    return { x, y };
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const coords = getCellCoordinatesFromTouch(e);
    if (!coords) return;
    isMouseDownRef.current = true;
    lastCellRef.current = coords;
    onMouseDown(coords.y, coords.x);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const coords = getCellCoordinatesFromTouch(e);
    if (!coords) return;
    if (lastCellRef.current?.x === coords.x && lastCellRef.current?.y === coords.y) return;
    lastCellRef.current = coords;
    if (isMouseDownRef.current) {
      onMouseOver(coords.y, coords.x);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    isMouseDownRef.current = false;
    onMouseUp();
  };

  // Initialize canvas and handle scaling
  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");

    if (canvas && context) {
      // Set canvas dimensions based on grid size
      const canvasWidth = gridSize.width * pixelSize;
      const canvasHeight = gridSize.height * pixelSize;

      // Calculate display dimensions that won't change with scaling
      // (we'll maintain these visual dimensions regardless of scale)
      const maxDisplayWidth = 500; // Fixed visual width
      const maxDisplayHeight = 500; // Fixed visual height

      // Calculate appropriate scaling to fit within our container
      // This ratio ensures the canvas fits properly in its visual dimensions
      const widthScaling = canvasWidth > maxDisplayWidth ? maxDisplayWidth / canvasWidth : 1;
      const heightScaling = canvasHeight > maxDisplayHeight ? maxDisplayHeight / canvasHeight : 1;
      const baseScaling = Math.min(widthScaling, heightScaling);

      // The display size remains constant
      const displayWidth = canvasWidth * baseScaling;
      const displayHeight = canvasHeight * baseScaling;

      // Scale the actual canvas size based on the user's scale input
      // This means at 100% scale, the canvas is exactly the size needed for the normal view
      // At larger scales, the canvas is larger but still displayed at the same visual size
      // At smaller scales, the canvas is smaller but still displayed at the same visual size
      const userScaling = scale / 100; // Convert percentage to decimal

      // Set actual internal canvas pixel dimensions (for rendering)
      // Scaled by the user's preference
      canvas.width = Math.round(canvasWidth * userScaling);
      canvas.height = Math.round(canvasHeight * userScaling);

      // The visible display size remains fixed regardless of scale
      canvas.style.width = `${displayWidth}px`;
      canvas.style.height = `${displayHeight}px`;

      // Store scaling factor for mouse coordinate calculations
      // This is the ratio between canvas internal size and displayed size
      scalingFactorRef.current = displayWidth / canvas.width;

      // Store context for later use
      contextRef.current = context;

      // We need to adjust the drawing context to account for scaling
      context.scale(userScaling, userScaling);

      // Initial draw
      drawGrid();
    }
  }, [gridSize, drawGrid, scale]);

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
      case EditTool.SELECT:
        return 'crosshair';
      case EditTool.TEXT:
        return 'text';
      default:
        return "pointer";
    }
  };

  return (
    <Box
      sx={{
        mt: { xs: "1rem", lg: "0" },
        width: { xs: "20rem", lg: "100%" }, // Fill available width in parent container
        height: { xs: "20rem", lg: "100%" }, // Fill available height in parent container
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
        position: "relative",
      }}>
      <canvas
        ref={canvasRef}
        onMouseDown={handleCanvasMouseDown}
        onMouseMove={handleCanvasMouseMove}
        onMouseUp={handleCanvasMouseUp}
        onMouseLeave={handleCanvasMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          cursor: getCursorStyle(),
          display: "block",
          boxShadow: "0 0 5px rgba(0, 0, 0, 0.2)",
          borderRadius: "2px",
          objectFit: "contain", // Maintains aspect ratio while filling container
          maxWidth: "100%",
          maxHeight: "100%",
          margin: "auto",
          touchAction: "none",
        }}
      />
    </Box>
  );
};

// Use memo to prevent unnecessary re-renders
export default memo(CanvasGrid);
