import React from "react";
import { Box, ToggleButton, ToggleButtonGroup, Typography } from "@mui/material";
import type { SelectMode } from "../../types";

interface SelectModeControlsProps {
  mode: SelectMode;
  onModeChange: (mode: SelectMode) => void;
}

const SelectModeControls: React.FC<SelectModeControlsProps> = ({ mode, onModeChange }) => {
  return (
    <Box sx={{ p: 2, pt: 0 }}>
      <Typography variant="subtitle2" sx={{ mb: 1 }}>
        Selection Mode
      </Typography>
      <ToggleButtonGroup
        size="small"
        fullWidth
        exclusive
        value={mode}
        onChange={(_, v) => v && onModeChange(v)}
        aria-label="Selection mode">
        <ToggleButton value="single" aria-label="Single bead selection">
          Single
        </ToggleButton>
        <ToggleButton value="region" aria-label="Region selection (same color)">
          Region
        </ToggleButton>
      </ToggleButtonGroup>
      <Typography variant="caption" sx={{ mt: 1, display: "block", opacity: 0.8 }}>
        Hold Cmd (Mac) or Ctrl (Win) to subtract from selection. Press esc to clear selection. Click and drag to move selection.
      </Typography>
    </Box>
  );
};

export default SelectModeControls;
