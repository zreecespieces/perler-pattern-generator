import React, { useMemo } from "react";
import { Box, Typography, Tooltip, useMediaQuery } from "@mui/material";
import { alpha } from "@mui/material/styles";

interface ColorLegendProps {
  perlerPattern: string[][];
  onReplaceColor?: (oldColor: string) => void;
}

interface ColorCount {
  color: string;
  count: number;
}

const ColorLegend: React.FC<ColorLegendProps> = ({ perlerPattern, onReplaceColor }) => {
  const isMobile = useMediaQuery((theme) => theme.breakpoints.down("md"));

  // Count the occurrences of each color in the pattern
  const colorCounts = useMemo(() => {
    const counts: Record<string, number> = {};

    // Skip transparent/empty cells
    perlerPattern.forEach((row) => {
      row.forEach((cell) => {
        if (cell && cell !== "transparent") {
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
        position: isMobile ? "static" : "absolute",
        top: isMobile ? "auto" : 10,
        right: isMobile ? "auto" : 10,
        width: isMobile ? "100%" : "150px",
        maxHeight: isMobile ? "none" : "90%",
        overflow: isMobile ? "visible" : "auto",
        backgroundColor: (theme) => (isMobile ? theme.palette.background.paper : alpha("#000000", 0.5)),
        borderRadius: isMobile ? "4px" : "4px",
        padding: isMobile ? 1.5 : 1.5,
        border: "none",
        zIndex: isMobile ? "auto" : 100,
        backdropFilter: isMobile ? "none" : "blur(4px)",
        mt: isMobile ? 1 : 0,
      }}>
      <Typography
        variant="subtitle2"
        sx={{
          color: "#ffffff",
          mb: 1,
          textAlign: "center",
          fontWeight: "bold",
        }}>
        Color Count
      </Typography>

      <Box
        sx={{
          px: isMobile ? 1 : 0,
          display: "flex",
          flexDirection: isMobile ? "row" : "column",
          flexWrap: isMobile ? "wrap" : "nowrap",
          gap: isMobile ? 1 : 0.75,
          alignItems: isMobile ? "center" : "stretch",
          justifyContent: isMobile ? "flex-start" : "flex-start",
        }}>
        {colorCounts.map(({ color, count }) => (
          <Box
            key={color}
            sx={{
              display: "flex",
              flexDirection: isMobile ? "column" : "row",
              alignItems: "center",
              textAlign: isMobile ? "center" : "left",
              gap: 0.5,
              pr: isMobile ? 1 : 0,
              minWidth: isMobile ? 64 : "auto",
            }}>
            <Tooltip title="Replace with..." arrow placement={isMobile ? "top" : "left"}>
              <Box
                onClick={() => handleColorClick(color)}
                sx={{
                  width: isMobile ? 14 : 16,
                  height: isMobile ? 14 : 16,
                  backgroundColor: color,
                  borderRadius: "2px",
                  border: isMobile ? "1px solid rgba(0,0,0,0.2)" : "1px solid rgba(255,255,255,0.2)",
                  cursor: onReplaceColor ? "pointer" : "default",
                  "&:hover": {
                    border: isMobile ? "1px solid rgba(0,0,0,0.4)" : "1px solid rgba(255,255,255,0.5)",
                    transform: "scale(1.1)",
                    transition: "all 0.1s ease-in-out",
                  },
                }}
              />
            </Tooltip>
            <Typography
              variant="body2"
              sx={{
                color: isMobile ? "text.primary" : "#ffffff",
                fontFamily: "monospace",
                fontSize: isMobile ? "0.75rem" : "0.8rem",
              }}>
              {count} {count === 1 ? "bead" : "beads"}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default ColorLegend;
