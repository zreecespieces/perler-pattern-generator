import React, { useState, useRef, useCallback, useEffect } from "react";
import { generateDominantCellPattern } from "./utils/imageUtils";
import {
  fillArea,
  shiftPatternUp,
  shiftPatternDown,
  shiftPatternLeft,
  shiftPatternRight,
  shiftPatternBy,
} from "./utils/gridUtils";
import { usePerlerPattern } from "./hooks/usePerlerPattern";
import { exportAsJSON, exportAsPNG } from "./utils/exportUtils";
import useMediaQuery from "@mui/material/useMediaQuery";
import { EditTool, GridSize, PanDirection, SelectMode } from "./types";
import { AppContainer } from "./styles/styledComponents";
import { MainContent, ToolsDrawer } from "./components/Layout";
import { toolColors } from "./utils/beadColors";
import QRCodeDrawer from "./components/Tools/QRCodeDrawer";
import { renderTextImageDataUrl, TextAlignOption } from "./utils/textImage";
import { cellKey, getSameColorRegion, parseCellKey, getSelectionBounds } from "./utils/selectionUtils";

function App() {
  // Initialize with Paint tool selected by default
  const [currentTool, setCurrentTool] = useState<EditTool>(EditTool.PAINT);
  const [image, setImage] = useState<string | null>(null);
  const [currentColor, setCurrentColor] = useState("#000000"); // Default to black
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [scale, setScale] = useState(100); // Scale percentage (100% = full size)
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 }); // persistent offset in grid cells
  const fileInputRef = useRef<HTMLInputElement>(null);
  const importFileRef = useRef<HTMLInputElement>(null);
  const scaleDebounceRef = useRef<number | undefined>(undefined);

  // Theme and responsive design
  const isMobile = useMediaQuery((theme) => theme.breakpoints.down("md"));
  const [mobileToolsOpen, setMobileToolsOpen] = useState(false);
  const [qrOpen, setQROpen] = useState(false);
  // Selection state
  const [selectedCells, setSelectedCells] = useState<Set<string>>(new Set());
  const [selectMode, setSelectMode] = useState<SelectMode>("single");
  const [isMetaDown, setIsMetaDown] = useState(false);
  const [isCtrlDown, setIsCtrlDown] = useState(false);
  const [isDraggingSelection, setIsDraggingSelection] = useState(false);
  const [selectionDragOffset, setSelectionDragOffset] = useState<{ dx: number; dy: number }>({ dx: 0, dy: 0 });
  const dragStartRef = useRef<{ y: number; x: number } | null>(null);
  // Text overlay state (for click-to-place)
  const [textOverlayPattern, setTextOverlayPattern] = useState<string[][] | null>(null);
  const [textOverlayTopLeft, setTextOverlayTopLeft] = useState<{ x: number; y: number } | null>(null);

  // Start with a reasonably sized grid for direct painting
  const initialGridSize: GridSize = { width: 29, height: 29 };

  const {
    perlerPattern,
    setPerlerPattern,
    gridSize,
    separateDimensions,
    setSeparateDimensions,
    handleGridSizeChange,
    handleDimensionChange,
    addToHistory,
    undoPattern,
    redoPattern,
    canUndo,
    canRedo,
    setGridSize,
  } = usePerlerPattern(initialGridSize);

  // Grid ref for capturing as image
  const gridRef = useRef<HTMLDivElement>(null);

  // Regenerate pattern from the current image with automatic edge detection
  const regeneratePattern = () => {
    if (image) {
      generatePattern(image, scale);
    }
  };

  // Open the QR drawer from the tool panel
  const handleOpenQRCode = () => {
    if (isMobile) setMobileToolsOpen(false);
    setQROpen(true);
  };

  // Generate from a QR image via the existing upload/generation pipeline
  const handleGenerateFromImage = (dataUrl: string, moduleCount: number) => {
    // Reset pan offset and set image, then generate at current scale with zero offsets
    setPanOffset({ x: 0, y: 0 });
    setImage(dataUrl);
    // Choose scale based on QR module count
    let chosenScale = scale;
    if (moduleCount === 29) chosenScale = 133;
    else if (moduleCount === 25) chosenScale = 123;
    else if (moduleCount === 21) chosenScale = 89;
    setScale(chosenScale);
    generateDominantCellPattern(
      dataUrl,
      chosenScale,
      gridSize,
      (newPattern: string[][]) => {
        if (newPattern) {
          setPerlerPattern(newPattern);
          addToHistory(newPattern);
        }
      },
      { offsetCellsX: 0, offsetCellsY: 0, multiplier: 64 }
    );
  };

  // Clamp drag offset so the ghost stays within the grid
  const clampDragOffset = useCallback(
    (dx: number, dy: number): { dx: number; dy: number } => {
      if (!selectedCells || selectedCells.size === 0) return { dx: 0, dy: 0 };
      const { minY, minX, maxY, maxX } = getSelectionBounds(selectedCells);
      const minDx = -minX;
      const maxDx = gridSize.width - 1 - maxX;
      const minDy = -minY;
      const maxDy = gridSize.height - 1 - maxY;
      const clampedDx = Math.max(minDx, Math.min(maxDx, dx));
      const clampedDy = Math.max(minDy, Math.min(maxDy, dy));
      return { dx: clampedDx, dy: clampedDy };
    },
    [selectedCells, gridSize.width, gridSize.height]
  );

  // Commit moving the selection by (dx, dy)
  const moveSelectionBy = useCallback(
    (dx: number, dy: number) => {
      if (!selectedCells || selectedCells.size === 0) return;
      if (dx === 0 && dy === 0) return;
      // Build new pattern from the old one
      const newPattern = JSON.parse(JSON.stringify(perlerPattern));
      // Clear sources first
      for (const key of selectedCells) {
        const { y, x } = parseCellKey(key);
        newPattern[y][x] = "transparent";
      }
      // Paste destinations using colors from original pattern
      for (const key of selectedCells) {
        const { y, x } = parseCellKey(key);
        const ty = y + dy;
        const tx = x + dx;
        if (ty < 0 || tx < 0 || ty >= gridSize.height || tx >= gridSize.width) continue;
        const color = perlerPattern[y][x];
        if (color === "transparent") continue;
        newPattern[ty][tx] = color;
      }
      setPerlerPattern(newPattern);
      addToHistory(newPattern);
      // Update selection to new positions
      const nextSelection = new Set<string>();
      for (const key of selectedCells) {
        const { y, x } = parseCellKey(key);
        nextSelection.add(cellKey(y + dy, x + dx));
      }
      setSelectedCells(nextSelection);
      // Reset drag state
      setSelectionDragOffset({ dx: 0, dy: 0 });
      setIsDraggingSelection(false);
      dragStartRef.current = null;
    },
    [selectedCells, perlerPattern, gridSize.height, gridSize.width, setPerlerPattern, addToHistory]
  );


  // Recenter: shift pattern back by current panOffset and reset offset
  const handleRecenter = useCallback(() => {
    const { x, y } = panOffset;
    if (x === 0 && y === 0) return;

    // Always inverse-shift current pattern immediately so the UI recenters instantly
    const shifted = shiftPatternBy(perlerPattern, gridSize, -x, -y);
    setPerlerPattern(shifted);
    addToHistory(shifted);
    setPanOffset({ x: 0, y: 0 });

    // If an image is loaded, regenerate from the true origin (no offsets)
    if (image) {
      generateDominantCellPattern(
        image,
        scale,
        gridSize,
        (newPattern: string[][]) => {
          setPerlerPattern(newPattern);
          addToHistory(newPattern);
        },
        { offsetCellsX: 0, offsetCellsY: 0 }
      );
    }
  }, [panOffset, perlerPattern, gridSize, setPerlerPattern, addToHistory, image, scale]);

  // Track modifier keys for +/- indicator on the Select tool
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Meta") setIsMetaDown(true);
      if (e.key === "Control") setIsCtrlDown(true);
      if (e.key === "Escape") {
        setSelectedCells(new Set());
        setIsDraggingSelection(false);
        setSelectionDragOffset({ dx: 0, dy: 0 });
        dragStartRef.current = null;
        // Cancel text overlay if active
        setTextOverlayPattern(null);
        setTextOverlayTopLeft(null);
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "Meta") setIsMetaDown(false);
      if (e.key === "Control") setIsCtrlDown(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  // Handle panning the entire grid by one cell
  const handlePan = useCallback(
    (direction: PanDirection) => {
      let newPattern: string[][] | null = null;
      switch (direction) {
        case "up":
          newPattern = shiftPatternUp(perlerPattern, gridSize);
          setPanOffset((prev) => ({ x: prev.x, y: prev.y - 1 }));
          break;
        case "down":
          newPattern = shiftPatternDown(perlerPattern, gridSize);
          setPanOffset((prev) => ({ x: prev.x, y: prev.y + 1 }));
          break;
        case "left":
          newPattern = shiftPatternLeft(perlerPattern, gridSize);
          setPanOffset((prev) => ({ x: prev.x - 1, y: prev.y }));
          break;
        case "right":
          newPattern = shiftPatternRight(perlerPattern, gridSize);
          setPanOffset((prev) => ({ x: prev.x + 1, y: prev.y }));
          break;
        default:
          newPattern = null;
      }
      if (newPattern) {
        setPerlerPattern(newPattern);
        addToHistory(newPattern);
      }
    },
    [perlerPattern, gridSize, setPerlerPattern, addToHistory]
  );

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const inputEl = event.target as HTMLInputElement;
    const file = inputEl.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      // Reset pan offset so a new upload starts centered
      setPanOffset({ x: 0, y: 0 });
      setImage(dataUrl);
      // Generate immediately at zero offset to avoid stale offset usage
      generateDominantCellPattern(
        dataUrl,
        scale,
        gridSize,
        (newPattern: string[][]) => {
          if (newPattern) {
            setPerlerPattern(newPattern);
            addToHistory(newPattern);
          }
        },
        { offsetCellsX: 0, offsetCellsY: 0 }
      );
      // Clear file input so selecting the same file again triggers onChange
      if (inputEl) inputEl.value = "";
    };
    reader.readAsDataURL(file);
  };

  // Handle scale change with proper typing
  const handleScaleChange = (newValue: number | number[]) => {
    const newScale = parseInt(newValue.toString());
    setScale(newScale);
    // Debounce heavy generation while dragging the slider
    if (scaleDebounceRef.current !== undefined) {
      window.clearTimeout(scaleDebounceRef.current);
    }
    const gridArea = gridSize.width * gridSize.height;
    // For large grids, avoid any generation during drag; wait for onChangeCommitted
    if (gridArea >= 2500) {
      return;
    }
    const delay = 120;
    scaleDebounceRef.current = window.setTimeout(() => {
      if (image) {
        generatePattern(image, newScale);
      }
    }, delay);
  };

  // Generate immediately when the user releases the slider thumb
  const handleScaleCommit = (value: number) => {
    const committed = Number(value);
    setScale(committed);
    if (image) {
      generatePattern(image, committed);
    }
  };

  // Generate pattern from image with automatic edge detection (memoized)
  const generatePattern = useCallback(
    (imageUrl: string, scalePercent: number) => {
      console.log("generatePattern called - using automatic edge detection");

      // Always use advanced region-based pattern generation with automatic edge detection
      console.log("Using advanced region-based pattern generation with automatic edge detection");

      generateDominantCellPattern(
        imageUrl,
        scalePercent,
        gridSize,
        (newPattern: string[][]) => {
          if (newPattern) {
            console.log("Dominant-per-cell pattern generated successfully");
            setPerlerPattern(newPattern);
            addToHistory(newPattern);
          }
        },
        { offsetCellsX: panOffset.x, offsetCellsY: panOffset.y }
      );
    },
    [gridSize, panOffset.x, panOffset.y, setPerlerPattern, addToHistory]
  );

  // Reset grid size back to default 29x29
  const resetGridSize = () => {
    setGridSize({ width: 29, height: 29 });
  };

  // Clear the entire perler pattern grid (all cells to transparent)
  const clearGrid = useCallback(() => {
    // Create a new pattern with all cells set to transparent
    const emptyPattern = Array(gridSize.height)
      .fill(null)
      .map(() => Array(gridSize.width).fill("transparent"));

    setPerlerPattern(emptyPattern);
    addToHistory(emptyPattern);

    // Clear the image as well
    setImage(null);
    // Reset pan offset so next generation starts centered
    setPanOffset({ x: 0, y: 0 });
  }, [gridSize.height, gridSize.width, setPerlerPattern, addToHistory]);

  // Cell interaction handler with deep clone to avoid any reference issues
  const handleCellInteraction = useCallback(
    (y: number, x: number) => {
      // Create a deep copy to ensure no reference issues
      const newPattern = JSON.parse(JSON.stringify(perlerPattern));

      switch (currentTool) {
        case EditTool.PAINT:
          newPattern[y][x] = currentColor;
          break;
        case EditTool.ERASE:
          newPattern[y][x] = "transparent";
          break;
        case EditTool.EYEDROPPER:
          if (perlerPattern[y][x] !== "transparent") {
            setCurrentColor(perlerPattern[y][x]);
            setCurrentTool(EditTool.PAINT); // Switch back to paint after picking color
          }
          return; // Don't update the pattern for eyedropper
        case EditTool.BUCKET:
          fillArea(newPattern, y, x, perlerPattern[y][x], currentColor, gridSize);
          break;
        default:
          return;
      }

      // Update state with new pattern
      setPerlerPattern(newPattern);
      addToHistory(newPattern);
    },
    [perlerPattern, currentTool, currentColor, gridSize, setPerlerPattern, addToHistory]
  );

  // Apply current tool to the existing selection (bulk operation)
  const applyToolToSelection = useCallback(
    (tool: EditTool) => {
      if (!selectedCells || selectedCells.size === 0) return;
      const newPattern = JSON.parse(JSON.stringify(perlerPattern));
      if (tool === EditTool.ERASE) {
        for (const key of selectedCells) {
          const { y, x } = parseCellKey(key);
          newPattern[y][x] = "transparent";
        }
      } else if (tool === EditTool.BUCKET) {
        for (const key of selectedCells) {
          const { y, x } = parseCellKey(key);
          newPattern[y][x] = currentColor;
        }
      } else {
        return;
      }
      setPerlerPattern(newPattern);
      addToHistory(newPattern);
    },
    [selectedCells, perlerPattern, currentColor, setPerlerPattern, addToHistory]
  );

  // Update selection based on cell and mode
  const updateSelection = useCallback(
    (y: number, x: number, subtract: boolean) => {
      setSelectedCells((prev) => {
        const next = new Set(prev);
        if (selectMode === "single") {
          const key = cellKey(y, x);
          if (subtract) next.delete(key);
          else next.add(key);
        } else {
          const region = getSameColorRegion(perlerPattern, y, x, gridSize);
          for (const k of region) {
            if (subtract) next.delete(k);
            else next.add(k);
          }
        }
        return next;
      });
    },
    [selectMode, perlerPattern, gridSize]
  );

  // Render text into a 300x300 white image and process through the normal image pipeline
  const handlePlaceText = useCallback(
    (text: string, align: TextAlignOption = "center", lineHeightMul: number = 1.15, kerningEm: number = 0) => {
      if (!text.trim()) return;
      const dataUrl = renderTextImageDataUrl(text.trim(), align, lineHeightMul, kerningEm);
      if (!dataUrl) return;
      // Generate a pattern from the text image but do not apply to grid; create an overlay instead
      generateDominantCellPattern(
        dataUrl,
        100, // keep crisp scale for text mask
        gridSize,
        (pattern: string[][]) => {
          // Crop to bounding box of non-transparent cells
          let minX = gridSize.width, minY = gridSize.height, maxX = -1, maxY = -1;
          for (let y = 0; y < pattern.length; y++) {
            for (let x = 0; x < pattern[y].length; x++) {
              if (pattern[y][x] && pattern[y][x] !== "transparent") {
                if (x < minX) minX = x;
                if (y < minY) minY = y;
                if (x > maxX) maxX = x;
                if (y > maxY) maxY = y;
              }
            }
          }
          if (maxX < minX || maxY < minY) {
            // Nothing to place
            setTextOverlayPattern(null);
            setTextOverlayTopLeft(null);
            return;
          }
          const cropW = maxX - minX + 1;
          const cropH = maxY - minY + 1;
          const cropped: string[][] = Array.from({ length: cropH }, (_, yy) =>
            Array.from({ length: cropW }, (_, xx) => pattern[minY + yy][minX + xx])
          );
          setTextOverlayPattern(cropped);
          // Start centered
          const startX = Math.max(0, Math.min(gridSize.width - cropW, Math.round((gridSize.width - cropW) / 2)));
          const startY = Math.max(0, Math.min(gridSize.height - cropH, Math.round((gridSize.height - cropH) / 2)));
          setTextOverlayTopLeft({ x: startX, y: startY });
          // Ensure Text tool is active so hover moves overlay
          setCurrentTool(EditTool.TEXT);
        },
        { multiplier: 64 }
      );
      // Do not set main image or pattern here
    },
    [gridSize]
  );

  // Replace all instances of one color with another in the pattern
  const handleReplaceColor = useCallback(
    (oldColor: string, newColor: string) => {
      if (newColor && oldColor !== newColor) {
        // Create a deep copy to ensure no reference issues
        const newPattern = JSON.parse(JSON.stringify(perlerPattern));

        // Replace all instances of oldColor with newColor
        for (let y = 0; y < newPattern.length; y++) {
          for (let x = 0; x < newPattern[y].length; x++) {
            if (newPattern[y][x] === oldColor) {
              newPattern[y][x] = newColor;
            }
          }
        }

        // Update state with new pattern
        setPerlerPattern(newPattern);
        addToHistory(newPattern);
      }
    },
    [perlerPattern, setPerlerPattern, addToHistory]
  );

  // Mouse event handlers with drag painting support
  const handleMouseDown = useCallback(
    (y: number, x: number, mods?: { subtract: boolean }) => {
      // Click-to-place Text overlay
      if (currentTool === EditTool.TEXT && textOverlayPattern && textOverlayTopLeft) {
        const newPattern = JSON.parse(JSON.stringify(perlerPattern));
        for (let oy = 0; oy < textOverlayPattern.length; oy++) {
          for (let ox = 0; ox < textOverlayPattern[oy].length; ox++) {
            const color = textOverlayPattern[oy][ox];
            if (!color || color === "transparent") continue;
            const ty = textOverlayTopLeft.y + oy;
            const tx = textOverlayTopLeft.x + ox;
            if (ty < 0 || tx < 0 || ty >= gridSize.height || tx >= gridSize.width) continue;
            newPattern[ty][tx] = color;
          }
        }
        setPerlerPattern(newPattern);
        addToHistory(newPattern);
        // Switch tool away from Text so drawer doesn't auto-reopen and user can re-enter Text later
        setCurrentTool(EditTool.PAINT);
        // Clear overlay after placing
        setTextOverlayPattern(null);
        setTextOverlayTopLeft(null);
        return;
      }
      if (currentTool === EditTool.SELECT) {
        const key = cellKey(y, x);
        const isInSelection = selectedCells.has(key);
        const isSubtract = !!mods?.subtract;
        if (isInSelection && !isSubtract) {
          // Begin dragging the current selection
          setIsMouseDown(true);
          setIsDraggingSelection(true);
          dragStartRef.current = { y, x };
          setSelectionDragOffset({ dx: 0, dy: 0 });
          return;
        }
        // Otherwise, modify selection (add/subtract)
        setIsMouseDown(true);
        updateSelection(y, x, isSubtract);
        return;
      }
      // Selection-aware bulk ops for erase/bucket
      if (selectedCells.size > 0 && (currentTool === EditTool.ERASE || currentTool === EditTool.BUCKET)) {
        applyToolToSelection(currentTool);
        return;
      }
      setIsMouseDown(true);
      handleCellInteraction(y, x);
    },
    [currentTool, selectedCells, updateSelection, applyToolToSelection, handleCellInteraction, perlerPattern, gridSize.height, gridSize.width, addToHistory, setPerlerPattern, textOverlayPattern, textOverlayTopLeft]
  );

  const handleMouseOver = useCallback(
    (y: number, x: number, mods?: { subtract: boolean }) => {
      // Move text overlay with cursor while in Text tool
      if (currentTool === EditTool.TEXT && textOverlayPattern) {
        const w = textOverlayPattern[0]?.length ?? 0;
        const h = textOverlayPattern.length;
        const topLeftX = Math.max(0, Math.min(gridSize.width - w, x - Math.floor(w / 2)));
        const topLeftY = Math.max(0, Math.min(gridSize.height - h, y - Math.floor(h / 2)));
        setTextOverlayTopLeft({ x: topLeftX, y: topLeftY });
        return;
      }
      if (!isMouseDown) return;
      if (currentTool === EditTool.SELECT) {
        if (isDraggingSelection && dragStartRef.current) {
          const dx = x - dragStartRef.current.x;
          const dy = y - dragStartRef.current.y;
          const clamped = clampDragOffset(dx, dy);
          setSelectionDragOffset(clamped);
          return;
        }
        updateSelection(y, x, !!mods?.subtract);
        return;
      }
      if (currentTool === EditTool.PAINT || currentTool === EditTool.ERASE) {
        handleCellInteraction(y, x);
      }
    },
    [isMouseDown, currentTool, isDraggingSelection, clampDragOffset, updateSelection, handleCellInteraction, textOverlayPattern, gridSize.width, gridSize.height]
  );

  const handleMouseUp = useCallback(() => {
    setIsMouseDown(false);
    if (isDraggingSelection) {
      const { dx, dy } = selectionDragOffset;
      moveSelectionBy(dx, dy);
    }
  }, [isDraggingSelection, selectionDragOffset, moveSelectionBy]);

  // Add global mouse event listeners to ensure mouseup is captured even outside the grid
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      setIsMouseDown(false);
    };

    // Add listeners for both mouseup and mouseleave to handle all cases
    window.addEventListener("mouseup", handleGlobalMouseUp);
    document.addEventListener("mouseleave", handleGlobalMouseUp);

    return () => {
      window.removeEventListener("mouseup", handleGlobalMouseUp);
      document.removeEventListener("mouseleave", handleGlobalMouseUp);
    };
  }, []);

  const handleExportAsPNG = () => gridRef.current && exportAsPNG(gridRef.current);
  const handleExportAsJSON = () => perlerPattern && exportAsJSON(gridSize, scale, perlerPattern);

  const handleImportFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const fileContent = e.target?.result as string;
        const parsed = JSON.parse(fileContent);

        // Validate the imported data
        if (!parsed.perlerPattern || !parsed.gridSize) {
          console.error("Invalid pattern file");
          return;
        }

        // Update grid size first
        if (parsed.gridSize.width !== gridSize.width || parsed.gridSize.height !== gridSize.height) {
          setSeparateDimensions(parsed.gridSize.width !== parsed.gridSize.height);
          // We need to set the grid size directly
          setGridSize(parsed.gridSize);
        }

        // Set the pattern
        setPerlerPattern(parsed.perlerPattern);
        addToHistory(parsed.perlerPattern);

        // Reset scale if available
        if (parsed.scale) {
          setScale(parsed.scale);
        }

        // Clear any file selection
        if (importFileRef.current) {
          importFileRef.current.value = "";
        }
      } catch (error) {
        console.error("Error importing pattern:", error);
      }
    };
    reader.readAsText(file);
  };

  return (
    <AppContainer>
      {!isMobile && (
        <ToolsDrawer
          currentTool={currentTool}
          currentColor={currentColor}
          beadColors={toolColors}
          onToolChange={setCurrentTool}
          onColorSelect={setCurrentColor}
          onUndo={undoPattern}
          onRedo={redoPattern}
          canUndo={canUndo}
          canRedo={canRedo}
          onOpenQRCode={handleOpenQRCode}
          onPlaceText={handlePlaceText}
          isSubtractSelectionActive={isMetaDown || isCtrlDown}
          selectMode={selectMode}
          onSelectModeChange={setSelectMode}
          overlayActive={!!textOverlayPattern}
        />
      )}
      {isMobile && (
        <ToolsDrawer
          variant="temporary"
          open={mobileToolsOpen}
          onClose={() => setMobileToolsOpen(false)}
          currentTool={currentTool}
          currentColor={currentColor}
          beadColors={toolColors}
          onToolChange={setCurrentTool}
          onColorSelect={setCurrentColor}
          onUndo={undoPattern}
          onRedo={redoPattern}
          canUndo={canUndo}
          canRedo={canRedo}
          onOpenQRCode={handleOpenQRCode}
          onPlaceText={handlePlaceText}
          isSubtractSelectionActive={isMetaDown || isCtrlDown}
          selectMode={selectMode}
          onSelectModeChange={setSelectMode}
          overlayActive={!!textOverlayPattern}
        />
      )}
      <MainContent
        image={image}
        gridSize={gridSize}
        scale={scale}
        separateDimensions={separateDimensions}
        perlerPattern={perlerPattern}
        gridRef={gridRef}
        isLargeGrid={true} // Always use canvas rendering now
        currentTool={currentTool}
        isMouseDown={isMouseDown}
        setIsMouseDown={setIsMouseDown}
        fileInputRef={fileInputRef}
        importFileRef={importFileRef}
        onUploadClick={handleImageUpload}
        onRegeneratePattern={regeneratePattern}
        onSeparateDimensionsChange={setSeparateDimensions}
        onGridSizeChange={handleGridSizeChange}
        onDimensionChange={handleDimensionChange}
        onScaleChange={handleScaleChange}
        onScaleCommit={handleScaleCommit}
        onCellClick={handleMouseDown}
        onMouseOver={handleMouseOver}
        onMouseUp={handleMouseUp}
        onExportPng={handleExportAsPNG}
        onExportJson={handleExportAsJSON}
        onImportClick={() => importFileRef.current?.click()}
        onImportFile={handleImportFile}
        onResetGridSize={resetGridSize}
        onReplaceColor={handleReplaceColor}
        onClearGrid={clearGrid}
        onOpenTools={() => setMobileToolsOpen(true)}
        onPan={handlePan}
        onRecenter={handleRecenter}
        selectedCells={selectedCells}
        selectionDragOffset={selectionDragOffset}
        textOverlayPattern={textOverlayPattern ?? undefined}
        textOverlayTopLeft={textOverlayTopLeft ?? undefined}
      />

      {/* QR Code Drawer */}
      <QRCodeDrawer open={qrOpen} onClose={() => setQROpen(false)} onGenerateFromImage={handleGenerateFromImage} />
    </AppContainer>
  );
}

export default App;
