import React, { useState, useEffect } from 'react';
import { Box, Typography, IconButton, Tooltip } from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import ColorSwatch from './ColorSwatch';
import { ColorGrid } from '../../styles/styledComponents';
import { getSavedColors, saveColor, removeColor } from '../../utils/storageUtils';

interface ColorPickerProps {
  currentColor: string;
  beadColors: string[];
  onColorSelect: (color: string) => void;
}

// Current color display component
const CurrentColorDisplay = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'color',
})<{ color: string }>(({ theme, color }) => ({
  width: 48,
  height: 48,
  backgroundColor: color,
  margin: '0 auto',
  marginBottom: theme.spacing(2),
  borderRadius: '50%',
  border: `1px solid ${alpha(theme.palette.common.white, 0.3)}`,
  boxShadow: `0 0 10px ${alpha(color, 0.5)}`,
}));

const ColorPicker: React.FC<ColorPickerProps> = ({ 
  currentColor, 
  beadColors, 
  onColorSelect 
}) => {
  const [savedColors, setSavedColors] = useState<string[]>([]);

  // Load saved colors from local storage on component mount
  useEffect(() => {
    setSavedColors(getSavedColors());
  }, []);

  // Handle saving a custom color
  const handleSaveColor = () => {
    const updatedColors = saveColor(currentColor);
    setSavedColors(updatedColors);
  };

  // Handle removing a saved color
  const handleRemoveColor = (color: string, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent triggering the color selection
    const updatedColors = removeColor(color);
    setSavedColors(updatedColors);
  };

  return (
    <Box>
      <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>Colors</Typography>
      <CurrentColorDisplay color={currentColor} />
      
      {/* Standard bead colors */}
      <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>Standard Colors</Typography>
      <ColorGrid>
        {beadColors.map((color, index) => (
          <ColorSwatch 
            key={`bead-${index}`}
            color={color}
            selected={color === currentColor}
            onClick={() => onColorSelect(color)}
          />
        ))}
      </ColorGrid>
      
      {/* Saved custom colors */}
      {savedColors.length > 0 && (
        <>
          <Typography variant="subtitle2" sx={{ mt: 3, mb: 1 }}>Saved Colors</Typography>
          <ColorGrid>
            {savedColors.map((color, index) => (
              <Box key={`saved-${index}`} sx={{ position: 'relative' }}>
                <ColorSwatch
                  color={color}
                  selected={color === currentColor}
                  onClick={() => onColorSelect(color)}
                />
                <IconButton
                  size="small"
                  onClick={(e) => handleRemoveColor(color, e)}
                  sx={{
                    position: 'absolute',
                    top: -8,
                    right: -8,
                    bgcolor: 'rgba(255,255,255,0.9)',
                    width: 16,
                    height: 16,
                    padding: 0,
                    '&:hover': { bgcolor: 'rgba(255,255,255,1)' },
                  }}
                >
                  <CloseIcon sx={{ fontSize: 14, color: "#000" }} />
                </IconButton>
              </Box>
            ))}
          </ColorGrid>
        </>
      )}
      
      {/* Custom color picker */}
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center',
        mt: 3,
        width: '100%'
      }}>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>Custom Color</Typography>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1,
          width: '100%'
        }}>
          <input
            type="color"
            value={currentColor}
            onChange={(e) => onColorSelect(e.target.value)}
            style={{ 
              width: '40px', 
              height: '40px', 
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              backgroundColor: 'transparent'
            }}
          />
          <Typography variant="body2" sx={{ ml: 1 }}>{currentColor}</Typography>
          <Tooltip title="Save this color">
            <IconButton
              size="small"
              onClick={handleSaveColor}
              color="primary"
              sx={{ ml: 'auto' }}
            >
              <AddIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
    </Box>
  );
};

export default ColorPicker;
