import React from 'react';
import { styled, alpha } from '@mui/material/styles';

interface ColorSwatchProps {
  color: string;
  selected?: boolean;
  onClick: () => void;
}

// Styled color swatch
const SwatchContainer = styled('div', {
  shouldForwardProp: (prop) => prop !== 'color' && prop !== 'selected',
})<{ color: string; selected?: boolean }>(({ theme, color, selected }) => ({
  width: 24,
  height: 24,
  backgroundColor: color,
  margin: theme.spacing(0.5),
  cursor: 'pointer',
  borderRadius: '50%',
  boxSizing: 'border-box',
  boxShadow: selected ? `0 0 0 2px ${theme.palette.primary.main}, 0 0 0 4px ${alpha(theme.palette.primary.main, 0.3)}` : 'none',
  border: `1px solid ${alpha('#000000', 0.2)}`,
  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  '&:hover': {
    transform: 'scale(1.15)',
    boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.7)}`,
    zIndex: 10,
  },
}));

const ColorSwatch: React.FC<ColorSwatchProps> = ({ color, selected, onClick }) => {
  return (
    <SwatchContainer 
      color={color} 
      selected={selected} 
      onClick={onClick} 
    />
  );
};

export default ColorSwatch;
