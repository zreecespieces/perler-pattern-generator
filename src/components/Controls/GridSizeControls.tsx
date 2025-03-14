import React from 'react';
import { Box, Typography, FormControlLabel, Checkbox } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { StyledSlider } from '../../styles/styledComponents';
import { GridSize } from '../../types';

interface GridSizeControlsProps {
  gridSize: GridSize;
  scale: number;
  separateDimensions: boolean;
  onGridSizeChange: (value: number) => void;
  onDimensionChange: (dimension: 'width' | 'height', value: number) => void;
  onScaleChange: (value: number | number[]) => void;
  onSeparateDimensionsChange: (checked: boolean) => void;
  showScaleControl?: boolean;
}

const GridSizeControls: React.FC<GridSizeControlsProps> = ({
  gridSize,
  scale,
  separateDimensions,
  onGridSizeChange,
  onDimensionChange,
  onScaleChange,
  onSeparateDimensionsChange,
  showScaleControl = false
}) => {
  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      width: '100%', 
      gap: 2 
    }}>
      <FormControlLabel
        control={
          <Checkbox 
            checked={separateDimensions}
            onChange={(e) => onSeparateDimensionsChange(e.target.checked)}
            sx={{ 
              color: theme => theme.palette.primary.main,
              '&.Mui-checked': {
                color: theme => theme.palette.primary.main,
              }
            }}
          />
        }
        label="Control width and height separately"
      />
      
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', md: 'row' }, 
        gap: 3, 
        width: '100%',
        p: 2,
        backgroundColor: (theme) => alpha(theme.palette.background.paper, 0.4),
        borderLeft: (theme) => `2px solid ${alpha(theme.palette.primary.main, 0.7)}`
      }}>
        {!separateDimensions ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, flex: 1 }}>
            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>Grid Size:</Typography>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <StyledSlider
                min={5}
                max={90}
                value={Math.max(gridSize.width, gridSize.height)}
                onChange={(_, value) => onGridSizeChange(value as number)}
              />
              <Typography variant="body1" sx={{ minWidth: 80 }}>{gridSize.width}×{gridSize.height}</Typography>
            </Box>
          </Box>
        ) : (
          <>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, flex: 1 }}>
              <Typography variant="body1" sx={{ fontWeight: 'bold' }}>Grid Width:</Typography>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <StyledSlider
                  min={5}
                  max={50}
                  value={gridSize.width}
                  onChange={(_, value) => onDimensionChange('width', value as number)}
                />
                <Typography variant="body1" sx={{ minWidth: 40 }}>{gridSize.width}</Typography>
              </Box>
            </Box>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, flex: 1 }}>
              <Typography variant="body1" sx={{ fontWeight: 'bold' }}>Grid Height:</Typography>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <StyledSlider
                  min={5}
                  max={50}
                  value={gridSize.height}
                  onChange={(_, value) => onDimensionChange('height', value as number)}
                />
                <Typography variant="body1" sx={{ minWidth: 40 }}>{gridSize.height}</Typography>
              </Box>
            </Box>
          </>
        )}
        
        {showScaleControl && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, flex: 1 }}>
            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>Image Scale:</Typography>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <StyledSlider
                min={10}
                max={200}
                value={scale}
                onChange={(_, value) => onScaleChange(value as number)}
              />
              <Typography variant="body1" sx={{ minWidth: 40 }}>{scale}%</Typography>
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default GridSizeControls;
