import React, { memo } from 'react';
import { styled } from '@mui/material/styles';

interface BeadProps {
  color: string;
  x: number;
  y: number;
  onMouseDown: (y: number, x: number) => void;
  onMouseOver: (y: number, x: number) => void;
  onMouseUp?: () => void;
}

// Styled bead component - a single cell in the grid
const BeadCell = styled('div', {
  shouldForwardProp: (prop) => prop !== 'color',
})<{ color: string }>(({ color }) => ({
  width: 16,
  height: 16,
  backgroundColor: color === 'transparent' ? 'transparent' : color,
  border: '1px solid rgba(255, 255, 255, 0.1)',
  cursor: 'pointer',
  borderRadius: '50%',
  boxSizing: 'border-box',
  transition: 'transform 0.1s ease',
  '&:hover': {
    transform: 'scale(1.1)',
    boxShadow: '0 0 5px rgba(255, 255, 255, 0.5)',
    zIndex: 10,
  },
}));

const Bead: React.FC<BeadProps> = ({ color, x, y, onMouseDown, onMouseOver, onMouseUp }) => {
  return (
    <BeadCell 
      color={color}
      data-bead
      data-color={color}
      data-x={x}
      data-y={y}
      onMouseDown={() => onMouseDown(y, x)}
      onMouseOver={() => onMouseOver(y, x)}
      onMouseUp={onMouseUp}
    />
  );
};

// Use memo to prevent unnecessary re-renders
export default memo(Bead, (prevProps, nextProps) => {
  return prevProps.color === nextProps.color;
});
