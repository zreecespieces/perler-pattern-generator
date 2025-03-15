import React from 'react';
import { Box, Button, Dialog, DialogTitle, DialogContent, DialogActions, Typography, useMediaQuery } from "@mui/material";

interface ColorReplacementDialogProps {
  open: boolean;
  oldColor: string;
  newColor: string;
  usedColors: string[];
  savedColors: string[];
  onClose: () => void;
  onReplaceColor: () => void;
  onNewColorChange: (color: string) => void;
}

const ColorReplacementDialog: React.FC<ColorReplacementDialogProps> = ({
  open,
  oldColor,
  newColor,
  usedColors,
  savedColors,
  onClose,
  onReplaceColor,
  onNewColorChange
}) => {
  const isMobile = useMediaQuery(theme => theme.breakpoints.down("md"))
  return (
    <Dialog open={open} onClose={onClose} fullScreen={isMobile}>
      <DialogTitle>Replace Color</DialogTitle>
      <DialogContent sx={{ p: 3, display: "flex", flexDirection: "column", gap: 2, minWidth: 350 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Current Color
            </Typography>
            <Box
              sx={{
                width: 48,
                height: 48,
                backgroundColor: oldColor,
                border: "1px solid rgba(0,0,0,0.2)",
                borderRadius: "4px",
              }}
            />
          </Box>
          <Box sx={{ flex: 1, textAlign: "center" }}>
            <Typography variant="subtitle2" color="text.secondary">
              will be replaced with
            </Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              New Color
            </Typography>
            <Box
              sx={{
                width: 48,
                height: 48,
                backgroundColor: newColor,
                border: "1px solid rgba(0,0,0,0.2)",
                borderRadius: "4px",
              }}
            />
          </Box>
        </Box>

        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            Select replacement color:
          </Typography>

          {/* Tabs layout for different color groups */}
          <Box sx={{ mt: 2 }}>
            {/* Pattern Colors */}
            {usedColors.filter(color => color !== oldColor).length > 0 && (
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 500, pb: 1 }}>
                  Pattern Colors
                </Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5, mb: 2 }}>
                  {usedColors
                    .filter(color => color !== oldColor)
                    .map((color) => (
                      <Box
                        key={color}
                        onClick={() => onNewColorChange(color)}
                        sx={{
                          width: 30,
                          height: 30,
                          backgroundColor: color,
                          border: color === newColor ? "2px solid #000" : "1px solid rgba(0,0,0,0.2)",
                          borderRadius: "4px",
                          cursor: "pointer",
                          transition: "transform 0.1s",
                          "&:hover": {
                            transform: "scale(1.1)",
                          },
                        }}
                      />
                    ))}
                </Box>
              </Box>
            )}

            {/* Saved Colors */}
            {savedColors.length > 0 && (
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 500, pb: 1 }}>
                  Saved Colors
                </Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5, mb: 2 }}>
                  {savedColors.map((color) => (
                    <Box
                      key={color}
                      onClick={() => onNewColorChange(color)}
                      sx={{
                        width: 30,
                        height: 30,
                        backgroundColor: color,
                        border: color === newColor ? "2px solid #000" : "1px solid rgba(0,0,0,0.2)",
                        borderRadius: "4px",
                        cursor: "pointer",
                        transition: "transform 0.1s",
                        "&:hover": {
                          transform: "scale(1.1)",
                        },
                      }}
                    />
                  ))}
                </Box>
              </Box>
            )}

            {/* Custom Color */}
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 500, pb: 1 }}>
                Custom Color
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <input
                  type="color"
                  value={newColor}
                  onChange={(e) => onNewColorChange(e.target.value)}
                  style={{ 
                    width: '40px', 
                    height: '40px', 
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    backgroundColor: 'transparent'
                  }}
                />
                <Typography variant="body2">{newColor}</Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Cancel
        </Button>
        <Button onClick={onReplaceColor} color="primary" variant="contained">
          Replace
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ColorReplacementDialog;
