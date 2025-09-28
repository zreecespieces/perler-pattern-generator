import React from "react";
import { Drawer, Box, IconButton, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import TextToolPanel from "./TextToolPanel";

interface TextDrawerProps {
  open: boolean;
  onClose: () => void;
  onPlaceText: (text: string, fontFamily: string) => void;
}

const TextDrawer: React.FC<TextDrawerProps> = ({ open, onClose, onPlaceText }) => {
  return (
    <Drawer
      anchor="left"
      variant="temporary"
      open={open}
      onClose={onClose}
      sx={{ zIndex: (theme) => theme.zIndex.drawer + 10 }}
      ModalProps={{ keepMounted: true, disableEnforceFocus: true, disableAutoFocus: false, disableRestoreFocus: false }}
      PaperProps={{
        sx: {
          width: 300,
          backgroundColor: (theme) => theme.palette.background.paper,
          backdropFilter: "blur(8px)",
          borderRight: (theme) => `1px solid ${theme.palette.divider}`,
        },
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", p: 1.5, borderBottom: (theme) => `1px solid ${theme.palette.divider}` }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
          Add Text
        </Typography>
        <IconButton aria-label="Close text drawer" onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </Box>

      <TextToolPanel
        onPlaceText={(text, font) => {
          onPlaceText(text, font);
          onClose();
        }}
      />
    </Drawer>
  );
};

export default TextDrawer;
