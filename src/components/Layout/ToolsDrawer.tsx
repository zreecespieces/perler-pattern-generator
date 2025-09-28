import React, { useEffect, useState } from "react";
import { Box, IconButton } from "@mui/material";
import { ToolsDrawer as StyledToolsDrawer, DrawerHeader } from "../../styles/styledComponents";
import ColorPicker from "../ColorPicker";
import { ToolControls } from "../Controls";
import { EditTool } from "../../types";
import CloseIcon from "@mui/icons-material/Close";
import TextDrawer from "../Tools/TextDrawer";

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
  variant?: "persistent" | "temporary";
  open?: boolean;
  onClose?: () => void;
  onPlaceText?: (text: string, fontFamily: string) => void;
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
  canRedo,
  variant = "persistent",
  open = true,
  onClose,
  onPlaceText,
}) => {
  const [textDrawerOpen, setTextDrawerOpen] = useState(false);

  // Open the text drawer automatically when Text tool is selected
  useEffect(() => {
    if (currentTool === EditTool.TEXT) {
      setTextDrawerOpen(true);
    } else {
      setTextDrawerOpen(false);
    }
  }, [currentTool]);

  return (
    <StyledToolsDrawer variant={variant} anchor="left" open={open} onClose={onClose}>
      {variant === "temporary" && (
        <DrawerHeader>
          <IconButton aria-label="Close tools" onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </DrawerHeader>
      )}
      <ToolControls
        currentTool={currentTool}
        onToolChange={onToolChange}
        onUndo={onUndo}
        onRedo={onRedo}
        canUndo={canUndo}
        canRedo={canRedo}
      />
      <Box sx={{ px: 2 }}>
        <ColorPicker currentColor={currentColor} beadColors={beadColors} onColorSelect={onColorSelect} />
      </Box>
      <TextDrawer
        open={textDrawerOpen}
        onClose={() => setTextDrawerOpen(false)}
        onPlaceText={(text: string, font: string) => onPlaceText?.(text, font)}
      />
    </StyledToolsDrawer>
  );
};

export default ToolsDrawer;
