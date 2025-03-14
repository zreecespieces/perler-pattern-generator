import React from 'react';
import { Box, Button } from '@mui/material';
import UploadIcon from '@mui/icons-material/Upload';
import DeleteIcon from '@mui/icons-material/Delete';
import BrushIcon from '@mui/icons-material/Brush';
import RestartAltIcon from '@mui/icons-material/RestartAlt'; 
import { MainContent as StyledMainContent, SectionTitle, PegboardContainer, OriginalImageContainer, ControlPanel } from '../../styles/styledComponents';
import { GridSizeControls, ExportControls } from '../Controls';
import Pegboard from '../Pegboard';
import { EditTool, GridSize } from '../../types';

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
  onResetGridSize
}) => {
  return (
    <StyledMainContent drawerOpen>
      <SectionTitle variant="h1">Instant Perler Pattern</SectionTitle>
      
      <ControlPanel>
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          onChange={onUploadClick}
          style={{ display: 'none' }}
        />
        <input
          type="file"
          accept=".json"
          ref={importFileRef}
          onChange={onImportFile}
          style={{ display: 'none' }}
        />
        <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', gap: 2, overflow: 'hidden' }}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
            <Button
              variant="contained"
              color="primary"
              onClick={() => fileInputRef.current?.click()}
            >
              <UploadIcon sx={{ mr: 1 }} />
              Upload Image
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={onClearImage}
            >
              <DeleteIcon sx={{ mr: 1 }} />
              Clear Grid
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={onResetGridSize}
            >
              <RestartAltIcon sx={{ mr: 1 }} />
              Reset Grid Size
            </Button>
            {image && (
              <Button
                variant="contained"
                color="secondary"
                onClick={onRegeneratePattern}
                disabled={!image}
                title={!image ? "Upload an image first" : "Regenerate pattern from image"}
              >
                <BrushIcon sx={{ mr: 1 }} />
                Regenerate Pattern
              </Button>
            )}
          </Box>

          <GridSizeControls
            gridSize={gridSize}
            scale={scale}
            separateDimensions={separateDimensions}
            onGridSizeChange={onGridSizeChange}
            onDimensionChange={onDimensionChange}
            onScaleChange={onScaleChange}
            onSeparateDimensionsChange={onSeparateDimensionsChange}
            showScaleControl={!!image}
          />
        </Box>
      </ControlPanel>

      <PegboardContainer>
        <Pegboard 
          gridSize={gridSize}
          perlerPattern={perlerPattern}
          currentTool={currentTool}
          isMouseDown={isMouseDown}
          setIsMouseDown={setIsMouseDown}
          gridRef={gridRef}
          isLargeGrid={isLargeGrid}
          onCellClick={onCellClick}
          onMouseOver={onMouseOver}
          onMouseUp={onMouseUp}
        />
        
        <ExportControls
          onExportPng={onExportPng}
          onExportJson={onExportJson}
          onImportClick={onImportClick}
        />
      </PegboardContainer>
      
      {image && (
        <OriginalImageContainer>
          <SectionTitle variant="h3">Original Image</SectionTitle>
          <img src={image} alt="Uploaded" />
        </OriginalImageContainer>
      )}
    </StyledMainContent>
  );
};

export default MainContent;
