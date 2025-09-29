import React, { useEffect, useState } from "react";
import { Box, IconButton } from "@mui/material";
import { ToolsDrawer as StyledToolsDrawer, DrawerHeader } from "../../styles/styledComponents";
import ColorPicker from "../ColorPicker";
import { ToolControls } from "../Controls";
import { EditTool, SelectMode } from "../../types";
import CloseIcon from "@mui/icons-material/Close";
import TextDrawer from "../Tools/TextDrawer";
import type { TextAlignOption } from "../../utils/textImage";
import SelectModeControls from "../Tools/SelectModeControls";

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
  isSubtractSelectionActive?: boolean;
  selectMode: SelectMode;
  onSelectModeChange: (mode: SelectMode) => void;
  overlayActive?: boolean;
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
  isSubtractSelectionActive = false,
  selectMode,
  onSelectModeChange,
  overlayActive = false,
}) => {
  const [textDrawerOpen, setTextDrawerOpen] = useState(false);
  const prevToolRef = React.useRef<EditTool>(currentTool);

  // Open the text drawer automatically when Text tool is selected
  useEffect(() => {
    const prev = prevToolRef.current;
    if (currentTool === EditTool.TEXT && prev !== EditTool.TEXT && !overlayActive) {
      setTextDrawerOpen(true);
    }
    if (currentTool !== EditTool.TEXT) {
      setTextDrawerOpen(false);
    }
    prevToolRef.current = currentTool;
  }, [currentTool, overlayActive]);

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
        isSubtractSelectionActive={isSubtractSelectionActive}
      />
      {currentTool === EditTool.SELECT && (
        <SelectModeControls mode={selectMode} onModeChange={onSelectModeChange} />
      )}
      <Box sx={{ px: 2 }}>
        <ColorPicker currentColor={currentColor} beadColors={beadColors} onColorSelect={onColorSelect} />
      </Box>
      <TextDrawer
        open={textDrawerOpen}
        onClose={() => {
          setTextDrawerOpen(false);
          // Switch away from Text so user can re-open later
          onToolChange(EditTool.PAINT);
        }}
        onPlaceText={(text: string, align: TextAlignOption, lineHeightMul: number, kerningEm: number) => {
          onPlaceText?.(text, align, lineHeightMul, kerningEm);
          // Do not switch tools; overlay placement will proceed on the board
        }}
      />
    </StyledToolsDrawer>
  );
};

export default ToolsDrawer;
