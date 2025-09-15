import React, { useState, useEffect } from "react";
import { Box, Button, useMediaQuery, IconButton } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import FitScreenIcon from "@mui/icons-material/FitScreen";
import UploadIcon from "@mui/icons-material/Upload";
import BrushIcon from "@mui/icons-material/Brush";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import ClearIcon from "@mui/icons-material/Clear";
import {
  MainContent as StyledMainContent,
  SectionTitle,
  PegboardContainer,
  OriginalImageContainer,
} from "../../styles/styledComponents";
import Pegboard from "../Pegboard";
import { GridSizeControls, ExportControls } from "../Controls";
import { EditTool, GridSize } from "../../types";
import { getSavedColors } from "../../utils/storageUtils";
import ColorReplacementDialog from "../Dialogs/ColorReplacementDialog";
import { Attribution } from "./Attribution";

interface MainContentProps {
  image: string | null;
  gridSize: GridSize;
  scale: number;
  separateDimensions: boolean;
  perlerPattern: string[][];
  gridRef: React.RefObject<HTMLDivElement | null>;
  isLargeGrid: boolean;
  currentTool: EditTool;
  isMouseDown: boolean;
  setIsMouseDown: (isDown: boolean) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  importFileRef: React.RefObject<HTMLInputElement | null>;
  onUploadClick: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onRegeneratePattern: () => void;
  onSeparateDimensionsChange: (checked: boolean) => void;
  onGridSizeChange: (value: number) => void;
  onDimensionChange: (dimension: "width" | "height", value: number) => void;
  onScaleChange: (value: number | number[]) => void;
  onScaleCommit?: (value: number) => void;
  onCellClick: (y: number, x: number) => void;
  onMouseOver?: (y: number, x: number) => void;
  onMouseUp?: () => void;
  onExportPng: () => void;
  onExportJson: () => void;
  onImportClick: () => void;
  onImportFile: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onResetGridSize: () => void;
  onReplaceColor: (oldColor: string, newColor: string) => void;
  onClearGrid: () => void;
  onOpenTools?: () => void;
}

const MainContent: React.FC<MainContentProps> = ({
  image,
  gridSize,
  scale,
  separateDimensions,
  perlerPattern,
  gridRef,
  isLargeGrid,
  currentTool,
  isMouseDown,
  setIsMouseDown,
  fileInputRef,
  importFileRef,
  onUploadClick,
  onRegeneratePattern,
  onSeparateDimensionsChange,
  onGridSizeChange,
  onDimensionChange,
  onScaleChange,
  onCellClick,
  onMouseOver,
  onMouseUp,
  onExportPng,
  onExportJson,
  onImportClick,
  onImportFile,
  onResetGridSize,
  onReplaceColor,
  onClearGrid,
  onScaleCommit,
  onOpenTools,
}) => {
  // Get list of colors used in the pattern for the replacement dialog
  const [openColorDialog, setOpenColorDialog] = useState(false);
  const [oldColor, setOldColor] = useState("");
  const [newColor, setNewColor] = useState("#000000");
  const [savedColors, setSavedColors] = useState<string[]>([]);
  const isMobile = useMediaQuery((theme) => theme.breakpoints.down("md"));

  useEffect(() => {
    const savedColors = getSavedColors();
    setSavedColors(savedColors);
  }, []);

  // Get unique colors from pattern
  const usedColors = React.useMemo(() => {
    const colors = new Set<string>();
    perlerPattern.forEach((row) => {
      row.forEach((cell) => {
        if (cell && cell !== "transparent") {
          colors.add(cell);
        }
      });
    });
    return Array.from(colors);
  }, [perlerPattern]);

  // Handle replacement from the color legend
  const handleColorSwatch = (oldColorValue: string) => {
    setOldColor(oldColorValue);
    setOpenColorDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenColorDialog(false);
  };

  const handleReplaceColor = () => {
    if (oldColor && newColor) {
      onReplaceColor(oldColor, newColor);
      handleCloseDialog();
    }
  };

  const handleResetScale = () => {
    // Reset scale to 100% and commit the change
    onScaleChange(100);
    if (onScaleCommit) onScaleCommit(100);
  };

  // Color normalization is now applied automatically during generation in the worker.

  return (
    <StyledMainContent drawerOpen>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 0 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <SectionTitle variant="h1">Instant Perler Pattern</SectionTitle>

          {isMobile && (
            <IconButton aria-label="Open tools" onClick={onOpenTools} size="small">
              <MenuIcon sx={{ fontSize: 36 }} />
            </IconButton>
          )}
        </Box>
        {!isMobile && <Attribution />}
      </Box>
      {/* Container for the pegboard and controls */}
      <PegboardContainer>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3, width: "100%" }}>
          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
            <Button
              fullWidth={isMobile}
              variant="contained"
              onClick={() => fileInputRef.current?.click()}
              startIcon={<UploadIcon />}>
              Upload Image
            </Button>
            <input type="file" ref={fileInputRef} onChange={onUploadClick} accept="image/*" style={{ display: "none" }} />
            {image && (
              <Button
                fullWidth={isMobile}
                variant="contained"
                color="secondary"
                onClick={() => onRegeneratePattern()}
                startIcon={<BrushIcon />}>
                Regenerate Pattern
              </Button>
            )}
            <Button fullWidth={isMobile} variant="outlined" onClick={onResetGridSize} startIcon={<RestartAltIcon />}>
              Reset Grid Size
            </Button>
            <Button fullWidth={isMobile} variant="outlined" onClick={handleResetScale} startIcon={<FitScreenIcon />}>
              Reset Image Scale
            </Button>
            <Button fullWidth={isMobile} variant="outlined" onClick={onClearGrid} startIcon={<ClearIcon />}>
              Clear Grid
            </Button>
            {/* Manual Normalize Colors control removed: normalization is automatic during generation */}
          </Box>

          <GridSizeControls
            gridSize={gridSize}
            onGridSizeChange={onGridSizeChange}
            onDimensionChange={onDimensionChange}
            separateDimensions={separateDimensions}
            onSeparateDimensionsChange={onSeparateDimensionsChange}
            scale={scale}
            onScaleChange={onScaleChange}
            onScaleCommit={onScaleCommit}
            showScaleControl={true}
          />
        </Box>

        {/* Pegboard with color legend */}
        <Pegboard
          perlerPattern={perlerPattern}
          gridSize={gridSize}
          isLargeGrid={isLargeGrid}
          gridRef={gridRef}
          currentTool={currentTool}
          isMouseDown={isMouseDown}
          setIsMouseDown={setIsMouseDown}
          onCellClick={onCellClick}
          onMouseOver={onMouseOver}
          onMouseUp={onMouseUp}
          onReplaceColor={handleColorSwatch}
          scale={scale}
        />

        <ExportControls
          onExportPng={onExportPng}
          onExportJson={onExportJson}
          onImportClick={onImportClick}
          onOpenTools={onOpenTools}
        />
        {isMobile && (
          <>
            <br />
            <Attribution fullWidth />
          </>
        )}
      </PegboardContainer>

      {/* Hidden import file input */}
      <input type="file" accept=".json" ref={importFileRef} onChange={onImportFile} style={{ display: "none" }} />

      {image && (
        <OriginalImageContainer>
          <SectionTitle variant="h3">Original Image</SectionTitle>
          <img src={image} alt="Uploaded" />
        </OriginalImageContainer>
      )}

      {/* Color replacement dialog */}
      <ColorReplacementDialog
        open={openColorDialog}
        onClose={handleCloseDialog}
        oldColor={oldColor}
        newColor={newColor}
        onReplaceColor={handleReplaceColor}
        usedColors={usedColors}
        savedColors={savedColors}
        onNewColorChange={setNewColor}
      />

      {/* Manual normalization dialog removed */}
    </StyledMainContent>
  );
};

export default MainContent;
