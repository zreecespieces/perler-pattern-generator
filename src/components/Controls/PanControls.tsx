import React from "react";
import { Box, IconButton, Tooltip } from "@mui/material";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import GpsFixedIcon from "@mui/icons-material/GpsFixed";
import { PanDirection } from "../../types";

interface PanControlsProps {
  onPan: (direction: PanDirection) => void;
  onRecenter: () => void;
}

// Gamepad-like circular arrow pad.
const PanControls: React.FC<PanControlsProps> = ({ onPan, onRecenter }) => {
  return (
    <Box
      sx={{
        width: 96,
        height: 96,
        borderRadius: "50%",
        bgcolor: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,255,255,0.12)",
        boxShadow: "0 2px 10px rgba(0,0,0,0.3)",
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gridTemplateRows: "repeat(3, 1fr)",
        alignItems: "center",
        justifyItems: "center",
        p: 0.5,
        backdropFilter: "saturate(120%) blur(2px)",
      }}
    >
      <Box />
      <Tooltip title="Pan Up" placement="top">
        <IconButton aria-label="Pan up" size="small" onClick={() => onPan("up")}>
          <ArrowUpwardIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Box />

      <Tooltip title="Pan Left" placement="left">
        <IconButton aria-label="Pan left" size="small" onClick={() => onPan("left")}>
          <ArrowBackIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Recenter" placement="top">
        <IconButton aria-label="Recenter" size="small" onClick={onRecenter}>
          <GpsFixedIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Pan Right" placement="right">
        <IconButton aria-label="Pan right" size="small" onClick={() => onPan("right")}>
          <ArrowForwardIcon fontSize="small" />
        </IconButton>
      </Tooltip>

      <Box />
      <Tooltip title="Pan Down" placement="bottom">
        <IconButton aria-label="Pan down" size="small" onClick={() => onPan("down")}>
          <ArrowDownwardIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Box />
    </Box>
  );
};

export default PanControls;
