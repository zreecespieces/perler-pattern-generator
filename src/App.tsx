import { useState, useRef, useCallback, useEffect } from "react"
import { ThemeProvider } from "@mui/material"
import { EditTool, GridSize } from "./types"
import { AppContainer } from "./styles/styledComponents"
import { MainContent, ToolsDrawer } from "./components/Layout"
import usePerlerPattern from "./hooks/usePerlerPattern"
import { generatePerlerPattern } from "./utils/imageUtils"
import theme from "./styles/theme"
import { exportAsJSON, exportAsPNG } from "./utils/exportUtils"
import { fillArea } from "./utils/gridUtils"

function App() {
  // Initialize with Paint tool selected by default
  const [currentTool, setCurrentTool] = useState<EditTool>(EditTool.PAINT);
  const [image, setImage] = useState<string | null>(null);
  const [currentColor, setCurrentColor] = useState('#000000'); // Default to black
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [scale, setScale] = useState(100); // Scale percentage (100% = full size)
  const fileInputRef = useRef<HTMLInputElement>(null);
  const importFileRef = useRef<HTMLInputElement>(null);

  // Start with a reasonably sized grid for direct painting
  const initialGridSize: GridSize = { width: 29, height: 29 };

  const {
    perlerPattern,
    setPerlerPattern,
    gridSize,
    separateDimensions,
    setSeparateDimensions,
    clearPattern,
    handleGridSizeChange,
    handleDimensionChange,
    addToHistory,
    undoPattern,
    redoPattern,
    canUndo,
    canRedo
  } = usePerlerPattern(initialGridSize);

  // Grid ref for capturing as image
  const gridRef = useRef<HTMLDivElement>(null);

  // Regenerate pattern from the current image
  const regeneratePattern = () => {
    if (image) {
      generatePattern(image, scale);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setImage(dataUrl);
      generatePattern(dataUrl, scale);
    };
    reader.readAsDataURL(file);
  };

  // Handle scale change with proper typing
  const handleScaleChange = (newValue: number | number[]) => {
    const newScale = parseInt(newValue.toString());
    setScale(newScale);
    if (image) {
      generatePattern(image, newScale);
    }
  };

  // Generate pattern from image
  const generatePattern = (imageUrl: string, scalePercent: number) => {
    generatePerlerPattern(imageUrl, scalePercent, gridSize, (newPattern) => {
      if (newPattern) {
        setPerlerPattern(newPattern);
        addToHistory(newPattern);
      }
    });
  };

  // Clear pattern and image (if any)
  const clearImage = () => {
    setImage(null);
    clearPattern(); // This will reset to a blank grid
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Cell interaction handler with deep clone to avoid any reference issues
  const handleCellInteraction = useCallback((y: number, x: number) => {
    // Create a deep copy to ensure no reference issues
    const newPattern = JSON.parse(JSON.stringify(perlerPattern));
    
    switch (currentTool) {
      case EditTool.PAINT:
        newPattern[y][x] = currentColor;
        break;
      case EditTool.ERASE:
        newPattern[y][x] = 'transparent';
        break;
      case EditTool.EYEDROPPER:
        if (perlerPattern[y][x] !== 'transparent') {
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
  }, [perlerPattern, currentTool, currentColor, gridSize, setPerlerPattern, addToHistory]);

  // Mouse event handlers with drag painting support
  const handleMouseDown = useCallback((y: number, x: number) => {
    setIsMouseDown(true);
    handleCellInteraction(y, x);
  }, [handleCellInteraction]);

  const handleMouseOver = useCallback((y: number, x: number) => {
    if (isMouseDown && (currentTool === EditTool.PAINT || currentTool === EditTool.ERASE)) {
      handleCellInteraction(y, x);
    }
  }, [isMouseDown, currentTool, handleCellInteraction]);

  const handleMouseUp = useCallback(() => {
    setIsMouseDown(false);
  }, []);

  // Add global mouse event listeners to ensure mouseup is captured even outside the grid
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      setIsMouseDown(false);
    };

    // Add listeners for both mouseup and mouseleave to handle all cases
    window.addEventListener('mouseup', handleGlobalMouseUp);
    document.addEventListener('mouseleave', handleGlobalMouseUp);
    
    return () => {
      window.removeEventListener('mouseup', handleGlobalMouseUp);
      document.removeEventListener('mouseleave', handleGlobalMouseUp);
    };
  }, []);

  const handleExportAsPNG = () => gridRef.current && exportAsPNG(gridRef.current);
  const handleExportAsJSON = () => perlerPattern && exportAsJSON(gridSize, scale, perlerPattern);

  return (
    <ThemeProvider theme={theme}>
      <AppContainer>
        <ToolsDrawer
          currentTool={currentTool}
          currentColor={currentColor}
          beadColors={[
            '#FFFFFF', '#000000', '#FF0000', '#00FF00', '#0000FF', 
            '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#800080',
            '#008000', '#800000', '#808000', '#008080', '#FFC0CB',
            '#A52A2A', '#FF7F50', '#FFD700', '#808080', '#C0C0C0'
          ]}
          onToolChange={setCurrentTool}
          onColorSelect={setCurrentColor}
          onUndo={undoPattern}
          onRedo={redoPattern}
          canUndo={canUndo}
          canRedo={canRedo}
        />

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
          onClearImage={clearImage}
          onRegeneratePattern={regeneratePattern}
          onSeparateDimensionsChange={setSeparateDimensions}
          onGridSizeChange={handleGridSizeChange}
          onDimensionChange={handleDimensionChange}
          onScaleChange={handleScaleChange}
          onCellClick={handleMouseDown}
          onMouseOver={handleMouseOver}
          onMouseUp={handleMouseUp}
          onExportPng={handleExportAsPNG}
          onExportJson={handleExportAsJSON}
          onImportClick={() => importFileRef.current?.click()}
        />
      </AppContainer>
    </ThemeProvider>
  );
}

export default App;