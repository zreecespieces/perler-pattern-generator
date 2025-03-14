import React, { useState, useEffect } from "react"
import { Box, Button, Dialog, DialogTitle, DialogContent, DialogActions, Typography, Slider, Chip, Link, IconButton } from "@mui/material"
import UploadIcon from "@mui/icons-material/Upload"
import BrushIcon from "@mui/icons-material/Brush"
import RestartAltIcon from "@mui/icons-material/RestartAlt"
import FilterListIcon from "@mui/icons-material/FilterList"
import GitHubIcon from "@mui/icons-material/GitHub"
import ClearIcon from "@mui/icons-material/Clear"
import CodeIcon from "@mui/icons-material/Code"
import { MainContent as StyledMainContent, SectionTitle, PegboardContainer, OriginalImageContainer } from "../../styles/styledComponents"
import Pegboard from "../Pegboard"
import { GridSizeControls, ExportControls } from "../Controls"
import { EditTool, GridSize } from "../../types"
import { getSavedColors } from "../../utils/storageUtils"
import ColorReplacementDialog from "../Dialogs/ColorReplacementDialog"

interface MainContentProps {
  image: string | null
  gridSize: GridSize
  scale: number
  separateDimensions: boolean
  perlerPattern: string[][]
  gridRef: React.RefObject<HTMLDivElement | null>
  isLargeGrid: boolean
  currentTool: EditTool
  isMouseDown: boolean
  setIsMouseDown: (isDown: boolean) => void
  fileInputRef: React.RefObject<HTMLInputElement | null>
  importFileRef: React.RefObject<HTMLInputElement | null>
  onUploadClick: (event: React.ChangeEvent<HTMLInputElement>) => void
  onRegeneratePattern: () => void
  onSeparateDimensionsChange: (checked: boolean) => void
  onGridSizeChange: (value: number) => void
  onDimensionChange: (dimension: "width" | "height", value: number) => void
  onScaleChange: (value: number | number[]) => void
  onCellClick: (y: number, x: number) => void
  onMouseOver?: (y: number, x: number) => void
  onMouseUp?: () => void
  onExportPng: () => void
  onExportJson: () => void
  onImportClick: () => void
  onImportFile: (event: React.ChangeEvent<HTMLInputElement>) => void
  onResetGridSize: () => void
  onReplaceColor: (oldColor: string, newColor: string) => void
  onClearGrid: () => void
  normalizeColors: (threshold: number) => void
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
  normalizeColors,
}) => {
  // Get list of colors used in the pattern for the replacement dialog
  const [openColorDialog, setOpenColorDialog] = useState(false)
  const [oldColor, setOldColor] = useState("")
  const [newColor, setNewColor] = useState("#000000")
  const [openNormalizationDialog, setOpenNormalizationDialog] = useState(false)
  const [normalizationThreshold, setNormalizationThreshold] = useState(0.5)
  const [savedColors, setSavedColors] = useState<string[]>([])

  useEffect(() => {
    const savedColors = getSavedColors()
    setSavedColors(savedColors)
  }, [])

  // Get unique colors from pattern
  const usedColors = React.useMemo(() => {
    const colors = new Set<string>()
    perlerPattern.forEach((row) => {
      row.forEach((cell) => {
        if (cell && cell !== "transparent") {
          colors.add(cell)
        }
      })
    })
    return Array.from(colors)
  }, [perlerPattern])

  // Handle replacement from the color legend
  const handleColorSwatch = (oldColorValue: string) => {
    setOldColor(oldColorValue)
    setOpenColorDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenColorDialog(false)
  }

  const handleReplaceColor = () => {
    if (oldColor && newColor) {
      onReplaceColor(oldColor, newColor)
      handleCloseDialog()
    }
  }

  const handleOpenNormalizationDialog = () => {
    setOpenNormalizationDialog(true)
  }

  const handleCloseNormalizationDialog = () => {
    setOpenNormalizationDialog(false)
  }

  const handleNormalizationThresholdChange = (_event: Event, value: number | number[]) => {
    setNormalizationThreshold(value as number)
  }

  const handleNormalizeColors = () => {
    normalizeColors(normalizationThreshold)
    handleCloseNormalizationDialog()
  }

  return (
    <StyledMainContent drawerOpen>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 0 }}>
        <SectionTitle variant="h1">Instant Perler Pattern</SectionTitle>
        <Box
          sx={{
            display: 'inline-block',
            borderRadius: '20px',
            padding: '2px', // This creates the border width
            paddingLeft: "8px",
            background: 'linear-gradient(135deg, #00FFFF, #FF00FF)',
            boxShadow: '0 2px 10px rgba(0,0,0,0.15)',
            transition: 'all 0.3s ease',
            '&:hover': {
              boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
              transform: 'translateY(-2px)'
            }
          }}
        >
          <Chip
            icon={<CodeIcon style={{ color: 'white' }} />}
            label={
              <Link 
                href="https://zacharyreece.dev" 
                target="_blank" 
                rel="noopener noreferrer" 
                sx={{ 
                  color: 'white',
                  fontWeight: 'bold',
                  textDecoration: 'none',
                  '&:hover': { 
                    textDecoration: 'underline' 
                  } 
                }}
              >
                Built with PLUR by Zachary Reece
              </Link>
            }
            sx={{
              background: 'black',
              fontWeight: 600,
              borderRadius: '18px', // Slightly smaller than parent to show gradient
              border: 'none',
              height: '32px',
              '& .MuiChip-label': {
                px: 1
              }
            }}
          />
          {/* Github iconbutton */}
          <IconButton
            sx={{
              color: 'white',
              background: 'transparent',
              '&:hover': {
                background: 'transparent'
              }
            }}
            onClick={() => window.open('https://github.com/zreecespieces/perler-pattern-generator', '_blank')}
          >
            <GitHubIcon />
          </IconButton>
        </Box>
      </Box>
      {/* Container for the pegboard and controls */}
      <PegboardContainer>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3, width: "100%" }}>
          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
            <Button variant="contained" onClick={() => fileInputRef.current?.click()} startIcon={<UploadIcon />}>
              Upload Image
            </Button>
            <input type="file" ref={fileInputRef} onChange={onUploadClick} accept="image/*" style={{ display: "none" }} />
            {image && (
              <Button variant="contained" color="secondary" onClick={onRegeneratePattern} startIcon={<BrushIcon />}>
                Regenerate Pattern
              </Button>
            )}
            <Button variant="outlined" onClick={onResetGridSize} startIcon={<RestartAltIcon />}>
              Reset Grid Size
            </Button>
            <Button variant="outlined" onClick={onClearGrid} startIcon={<ClearIcon />}>
              Clear Grid
            </Button>
            {image && (
              <Button variant="outlined" onClick={handleOpenNormalizationDialog} startIcon={<FilterListIcon />}>
                Normalize Colors
              </Button>
            )}
          </Box>

          <GridSizeControls
            gridSize={gridSize}
            onGridSizeChange={onGridSizeChange}
            onDimensionChange={onDimensionChange}
            separateDimensions={separateDimensions}
            onSeparateDimensionsChange={onSeparateDimensionsChange}
            scale={scale}
            onScaleChange={onScaleChange}
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
        />

        <ExportControls
          onExportPng={onExportPng}
          onExportJson={onExportJson}
          onImportClick={() => {
            onImportClick()
            importFileRef.current?.click() // Handle file input click here
          }}
        />
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

      {/* Normalization dialog */}
      <Dialog open={openNormalizationDialog} onClose={handleCloseNormalizationDialog}>
        <DialogTitle>Normalize Colors</DialogTitle>
        <DialogContent sx={{ p: 3, display: "flex", flexDirection: "column", gap: 2, minWidth: 350 }}>
          <Typography variant="body1">
            This will combine similar colors in your pattern to reduce the total number of unique beads needed.
          </Typography>

          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Current Colors: {usedColors.length}
            </Typography>
          </Box>

          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Similarity Threshold: {Math.round(normalizationThreshold * 100)}%
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Higher values group more colors together. Lower values preserve more of the original colors.
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", mt: 2 }}>
              <Typography variant="caption" color="text.secondary">
                Minimal
              </Typography>
              <Slider
                value={normalizationThreshold}
                onChange={handleNormalizationThresholdChange}
                min={0}
                max={1}
                step={0.01}
                sx={{ mx: 2 }}
              />
              <Typography variant="caption" color="text.secondary">
                Aggressive
              </Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseNormalizationDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={handleNormalizeColors} color="primary" variant="contained">
            Normalize
          </Button>
        </DialogActions>
      </Dialog>
    </StyledMainContent>
  )
}

export default MainContent