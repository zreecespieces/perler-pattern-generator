import React from 'react';
import { Grid, Box, Typography, Button } from '@mui/material';
import BrushIcon from '@mui/icons-material/Brush';
import DeleteIcon from '@mui/icons-material/Delete';
import ColorizeIcon from '@mui/icons-material/Colorize';
import UndoIcon from '@mui/icons-material/Undo';
import RedoIcon from '@mui/icons-material/Redo';
import FormatColorFillIcon from '@mui/icons-material/FormatColorFill';
import { ToolButton } from '../../styles/styledComponents';
import { EditTool } from '../../types';


interface ToolControlsProps {
  currentTool: EditTool;
  onToolChange: (tool: EditTool) => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

const ToolControls: React.FC<ToolControlsProps> = ({
  currentTool,
  onToolChange,
  onUndo,
  onRedo,
  canUndo,
  canRedo
}) => {
  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>Tools</Typography>
      <Grid container spacing={2} sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
        <Grid item xs={3}>
          <ToolButton
            active={currentTool === EditTool.PAINT}
            onClick={() => onToolChange(EditTool.PAINT)}
          >
            <BrushIcon />
          </ToolButton>
        </Grid>
        <Grid item xs={3}>
          <ToolButton
            active={currentTool === EditTool.ERASE}
            onClick={() => onToolChange(EditTool.ERASE)}
          >
            <DeleteIcon />
          </ToolButton>
        </Grid>
        <Grid item xs={3}>
          <ToolButton
            active={currentTool === EditTool.EYEDROPPER}
            onClick={() => onToolChange(EditTool.EYEDROPPER)}
          >
            <ColorizeIcon />
          </ToolButton>
        </Grid>
        <Grid item xs={3}>
          <ToolButton
            active={currentTool === EditTool.BUCKET}
            onClick={() => onToolChange(EditTool.BUCKET)}
          >
            <FormatColorFillIcon />
          </ToolButton>
        </Grid>
      </Grid>
      
      <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>History</Typography>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1 }}>
        <Button 
          variant="outlined"
          onClick={onUndo}
          disabled={!canUndo}
        >
          <UndoIcon />
        </Button>
        <Button 
          variant="outlined"
          onClick={onRedo}
          disabled={!canRedo}
        >
          <RedoIcon />
        </Button>
      </Box>
    </Box>
  );
};

export default ToolControls;
