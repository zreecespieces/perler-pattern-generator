import React, { useState } from 'react';
import { Box, Button, Dialog, DialogTitle, DialogContent, DialogActions, Typography } from '@mui/material';
import UploadIcon from '@mui/icons-material/Upload';
import DeleteIcon from '@mui/icons-material/Delete';
import BrushIcon from '@mui/icons-material/Brush';
import RestartAltIcon from '@mui/icons-material/RestartAlt'; 
import { MainContent as StyledMainContent, SectionTitle, PegboardContainer, OriginalImageContainer } from '../../styles/styledComponents';
import Pegboard from '../Pegboard';
import { GridSizeControls, ExportControls } from '../Controls';
import { EditTool, GridSize } from '../../types';
import ColorPicker from '../ColorPicker';

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
  onClearImage: () => void;
  onRegeneratePattern: () => void;
  onSeparateDimensionsChange: (checked: boolean) => void;
  onGridSizeChange: (value: number) => void;
  onDimensionChange: (dimension: 'width' | 'height', value: number) => void;
  onScaleChange: (value: number | number[]) => void;
  onCellClick: (y: number, x: number) => void;
  onMouseOver?: (y: number, x: number) => void;
  onMouseUp?: () => void;
  onExportPng: () => void;
  onExportJson: () => void;
  onImportClick: () => void;
  onImportFile: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onResetGridSize: () => void;
  onReplaceColor: (oldColor: string, newColor: string) => void;
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
  onClearImage,
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
  onReplaceColor
}) => {
  // Get list of colors used in the pattern for the replacement dialog
  const [openColorDialog, setOpenColorDialog] = useState(false);
  const [oldColor, setOldColor] = useState('');
  const [newColor, setNewColor] = useState('#000000');
  
  // Get unique colors from pattern
  const usedColors = React.useMemo(() => {
    const colors = new Set<string>();
    perlerPattern.forEach(row => {
      row.forEach(cell => {
        if (cell && cell !== 'transparent') {
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

  const handleNewColorSelect = (color: string) => {
    setNewColor(color);
  };

  const handleReplaceColor = () => {
    if (oldColor && newColor) {
      onReplaceColor(oldColor, newColor);
      handleCloseDialog();
    }
  };

  return (
    <StyledMainContent drawerOpen>
      <SectionTitle variant="h1">Instant Perler Pattern</SectionTitle>
      {/* Container for the pegboard and controls */}
      <PegboardContainer>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, width: '100%' }}>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button variant="contained" onClick={() => fileInputRef.current?.click()} startIcon={<UploadIcon />}>
            Upload Image
          </Button>
          <input
          type="file"
          ref={fileInputRef}
          onChange={onUploadClick}
          accept="image/*"
          style={{ display: 'none' }}
        />
          
          {image && (
            <Button variant="outlined" onClick={onClearImage} startIcon={<DeleteIcon />}>
              Clear Image
            </Button>
          )}
            {image && (
              <Button
                variant="contained"
                color="secondary"
                onClick={onRegeneratePattern}
                startIcon={<BrushIcon />}
              >
                Regenerate Pattern
              </Button>
            )}
            <Button
              variant="outlined"
              onClick={onResetGridSize}
              startIcon={<RestartAltIcon />}
            >
              Reset Grid Size
            </Button>
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
            onImportClick();
            importFileRef.current?.click(); // Handle file input click here
          }}
        />
      </PegboardContainer>
      
      {/* Hidden import file input */}
      <input
        type="file"
        accept=".json"
        ref={importFileRef}
        onChange={onImportFile}
        style={{ display: 'none' }}
      />
      
      {image && (
        <OriginalImageContainer>
          <SectionTitle variant="h3">Original Image</SectionTitle>
          <img src={image} alt="Uploaded" />
        </OriginalImageContainer>
      )}

      {/* Color replacement dialog */}
      <Dialog open={openColorDialog} onClose={handleCloseDialog}>
        <DialogTitle>Replace Color</DialogTitle>
        <DialogContent sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2, minWidth: 300 }}>
          <Box>
            <Typography variant="subtitle2" gutterBottom>Current Color:</Typography>
            <Box sx={{ 
              width: 50, 
              height: 50, 
              backgroundColor: oldColor,
              border: '1px solid rgba(0,0,0,0.2)',
              borderRadius: '4px'
            }} />
          </Box>
          
          <Box>
            <Typography variant="subtitle2" gutterBottom>New Color:</Typography>
            <ColorPicker 
              currentColor={newColor} 
              beadColors={[...usedColors, '#FFFFFF', '#000000', '#FF0000', '#00FF00', '#0000FF']} 
              onColorSelect={handleNewColorSelect} 
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={handleReplaceColor} color="primary" variant="contained">
            Replace
          </Button>
        </DialogActions>
      </Dialog>
    </StyledMainContent>
  );
};

export default MainContent;
