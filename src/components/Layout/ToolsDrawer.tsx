import React, { useEffect, useState } from "react";
import { Box, IconButton } from "@mui/material";
import { ToolsDrawer as StyledToolsDrawer, DrawerHeader } from "../../styles/styledComponents";
import ColorPicker from "../ColorPicker";
import { ToolControls } from "../Controls";
import { EditTool } from "../../types";
import CloseIcon from "@mui/icons-material/Close";
import TextDrawer from "../Tools/TextDrawer";
import type { TextAlignOption } from "../../utils/textImage";

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
  onOpenQRCode?: () => void;
  onPlaceText?: (text: string, align: TextAlignOption, lineHeightMul: number, kerningEm: number) => void;
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
  onOpenQRCode,
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
        onOpenQRCode={onOpenQRCode}
      />
      <Box sx={{ px: 2 }}>
        <ColorPicker currentColor={currentColor} beadColors={beadColors} onColorSelect={onColorSelect} />
      </Box>
      <TextDrawer
        open={textDrawerOpen}
        onClose={() => {
          setTextDrawerOpen(false);
          // Deactivate Text tool so re-clicking re-opens drawer
          onToolChange(EditTool.PAINT);
        }}
        onPlaceText={(text: string, align: TextAlignOption, lineHeightMul: number, kerningEm: number) => {
          onPlaceText?.(text, align, lineHeightMul, kerningEm);
          // After placing, also switch away from Text to allow quick re-open
          onToolChange(EditTool.PAINT);
        }}
      />
    </StyledToolsDrawer>
  );
};

export default ToolsDrawer;
