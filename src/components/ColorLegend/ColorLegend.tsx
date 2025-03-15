import React, { useMemo } from 'react';
import { Box, Typography, Tooltip, useMediaQuery } from '@mui/material';
import { alpha } from '@mui/material/styles';

interface ColorLegendProps {
  perlerPattern: string[][];
  onReplaceColor?: (oldColor: string) => void;
}

interface ColorCount {
  color: string;
  count: number;
}

const ColorLegend: React.FC<ColorLegendProps> = ({ perlerPattern, onReplaceColor }) => {
  const isMobile = useMediaQuery(theme => theme.breakpoints.down("md"))
  // Count the occurrences of each color in the pattern
  const colorCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    
    // Skip transparent/empty cells
    perlerPattern.forEach(row => {
      row.forEach(cell => {
        if (cell && cell !== 'transparent') {
          counts[cell] = (counts[cell] || 0) + 1;
        }
      });
    });
    
    // Convert to array for sorting
    const colorCountArray: ColorCount[] = Object.entries(counts)
      .map(([color, count]) => ({ color, count }))
      .sort((a, b) => b.count - a.count); // Sort by count descending
    
    return colorCountArray;
  }, [perlerPattern]);
  
  // No colors used yet
  if (colorCounts.length === 0) {
    return null;
  }

  const handleColorClick = (color: string) => {
    if (onReplaceColor) {
      onReplaceColor(color);
    }
  };

  return (
    <Box
      sx={{
        position: !isMobile ? 'absolute' : undefined,
        top: 10,
        right: 10,
        width: '150px',
        maxHeight: '90%',
        overflow: 'auto',
        backgroundColor: alpha('#000000', 0.5),
        borderRadius: '4px',
        padding: 1.5,
        zIndex: 100,
        backdropFilter: 'blur(4px)',
      }}
    >
      <Typography 
        variant="subtitle2" 
        sx={{ 
          color: '#ffffff', 
          mb: 1, 
          textAlign: 'center',
          fontWeight: 'bold'
        }}
      >
        Color Count
      </Typography>
      
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
        {colorCounts.map(({ color, count }) => (
          <Box 
            key={color}
            sx={{ 
              display: 'flex', 
              alignItems: 'center',
              gap: 1
            }}
          >
            <Tooltip title="Replace with..." arrow placement="left">
              <Box 
                onClick={() => handleColorClick(color)}
                sx={{ 
                  width: 16, 
                  height: 16, 
                  backgroundColor: color,
                  borderRadius: '2px',
                  border: '1px solid rgba(255,255,255,0.2)',
                  cursor: onReplaceColor ? 'pointer' : 'default',
                  '&:hover': {
                    border: '1px solid rgba(255,255,255,0.5)',
                    transform: 'scale(1.1)',
                    transition: 'all 0.1s ease-in-out'
                  }
                }} 
              />
            </Tooltip>
            <Typography 
              variant="body2" 
              sx={{ 
                color: '#ffffff',
                fontFamily: 'monospace',
                fontSize: '0.8rem'
              }}
            >
              {count} {count === 1 ? 'bead' : 'beads'}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default ColorLegend;
