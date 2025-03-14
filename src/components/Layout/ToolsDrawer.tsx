import React from 'react';
import { Box } from '@mui/material';
import { ToolsDrawer as StyledToolsDrawer } from '../../styles/styledComponents';
import ColorPicker from '../ColorPicker';
import { ToolControls } from '../Controls';
import { EditTool } from '../../types';

interface ToolsDrawerProps {
  currentTool: EditTool;
  currentColor: string;
  beadColors: string[];
  onToolChange: (tool: EditTool) => void;
  onColorSelect: (color: string) => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

const ToolsDrawer: React.FC<ToolsDrawerProps> = ({
  currentTool,
  currentColor,
  beadColors,
  onToolChange,
  onColorSelect,
  onUndo,
  onRedo,
  canUndo,
  canRedo
}) => {
  return (
    <StyledToolsDrawer variant="persistent" anchor="left" open>
      <ToolControls 
        currentTool={currentTool}
        onToolChange={onToolChange}
        onUndo={onUndo}
        onRedo={onRedo}
        canUndo={canUndo}
        canRedo={canRedo}
      />
      <Box sx={{ px: 2 }}>
        <ColorPicker 
          currentColor={currentColor}
          beadColors={beadColors}
          onColorSelect={onColorSelect}
        />
      </Box>
    </StyledToolsDrawer>
  );
};

export default ToolsDrawer;
