import React from 'react';
import { Box, Typography } from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import ColorSwatch from './ColorSwatch';
import { ColorGrid } from '../../styles/styledComponents';

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
  return (
    <Box>
      <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>Colors</Typography>
      <CurrentColorDisplay color={currentColor} />
      <ColorGrid>
        {beadColors.map((color, index) => (
          <ColorSwatch 
            key={index}
            color={color}
            selected={color === currentColor}
            onClick={() => onColorSelect(color)}
          />
        ))}
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          mt: 2,
          width: '100%'
        }}>
          <Typography variant="body2" sx={{ mb: 1 }}>Custom Color:</Typography>
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
          </Box>
        </Box>
      </ColorGrid>
    </Box>
  );
};

export default ColorPicker;
