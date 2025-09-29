import React from "react";
import { Grid, Box, Typography, Button } from "@mui/material";
import BrushIcon from "@mui/icons-material/Brush";
import DeleteIcon from "@mui/icons-material/Delete";
import ColorizeIcon from "@mui/icons-material/Colorize";
import UndoIcon from "@mui/icons-material/Undo";
import RedoIcon from "@mui/icons-material/Redo";
import FormatColorFillIcon from "@mui/icons-material/FormatColorFill";
import QrCode2Icon from "@mui/icons-material/QrCode2";
import TitleIcon from "@mui/icons-material/Title";
import SelectAllIcon from "@mui/icons-material/SelectAll";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import { ToolButton } from "../../styles/styledComponents";
import { EditTool } from "../../types";

interface ToolControlsProps {
  currentTool: EditTool;
  onToolChange: (tool: EditTool) => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onOpenQRCode?: () => void;
  isSubtractSelectionActive?: boolean;
}

const ToolControls: React.FC<ToolControlsProps> = ({
  currentTool,
  onToolChange,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onOpenQRCode,
  isSubtractSelectionActive = false,
}) => {
  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Tools
      </Typography>
      <Grid container spacing={2} sx={{ display: "flex", flexWrap: "wrap", justifyContent: "flex-start" }}>
        <Grid item xs={3}>
          <ToolButton active={currentTool === EditTool.SELECT} onClick={() => onToolChange(EditTool.SELECT)}>
            <Box sx={{ position: "relative", width: 24, height: 24, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
              <SelectAllIcon />
              <Box
                sx={{
                  position: "absolute",
                  right: -6,
                  bottom: -6,
                  background: "transparent",
                  borderRadius: "50%",
                  width: 16,
                  height: 16,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "text.primary",
                }}
                aria-hidden
              >
                {isSubtractSelectionActive ? <RemoveIcon sx={{ fontSize: 16 }} /> : <AddIcon sx={{ fontSize: 16 }} />}
              </Box>
            </Box>
          </ToolButton>
        </Grid>
        <Grid item xs={3}>
          <ToolButton active={currentTool === EditTool.PAINT} onClick={() => onToolChange(EditTool.PAINT)}>
            <BrushIcon />
          </ToolButton>
        </Grid>
        <Grid item xs={3}>
          <ToolButton active={currentTool === EditTool.ERASE} onClick={() => onToolChange(EditTool.ERASE)}>
            <DeleteIcon />
          </ToolButton>
        </Grid>
        <Grid item xs={3}>
          <ToolButton active={currentTool === EditTool.EYEDROPPER} onClick={() => onToolChange(EditTool.EYEDROPPER)}>
            <ColorizeIcon />
          </ToolButton>
        </Grid>
        <Grid item xs={3}>
          <ToolButton active={currentTool === EditTool.BUCKET} onClick={() => onToolChange(EditTool.BUCKET)}>
            <FormatColorFillIcon />
          </ToolButton>
        </Grid>
        <Grid item xs={3}>
          <ToolButton onClick={onOpenQRCode} aria-label="QR Code">
            <QrCode2Icon />
          </ToolButton>
        </Grid>
        <Grid item xs={3}>
          <ToolButton active={currentTool === EditTool.TEXT} onClick={() => onToolChange(EditTool.TEXT)}>
            <TitleIcon />
          </ToolButton>
        </Grid>
      </Grid>

      <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
        History
      </Typography>
      <Box sx={{ display: "flex", justifyContent: "space-between", gap: 1 }}>
        <Button variant="outlined" onClick={onUndo} disabled={!canUndo}>
          <UndoIcon />
        </Button>
        <Button variant="outlined" onClick={onRedo} disabled={!canRedo}>
          <RedoIcon />
        </Button>
      </Box>
    </Box>
  );
};

export default ToolControls;
