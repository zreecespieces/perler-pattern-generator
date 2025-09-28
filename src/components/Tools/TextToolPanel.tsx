import React, { useState } from "react";
import { Box, Button, MenuItem, Select, SelectChangeEvent, TextField, Typography } from "@mui/material";

interface TextToolPanelProps {
  onPlaceText: (text: string, fontFamily: string) => void;
}

const FONT_OPTIONS: { label: string; value: string }[] = [
  { label: "Arial", value: "Arial, Helvetica, sans-serif" },
  { label: "Helvetica", value: "Helvetica, Arial, sans-serif" },
  { label: "Georgia", value: "Georgia, serif" },
  { label: "Times New Roman", value: "'Times New Roman', Times, serif" },
  { label: "Courier New", value: "'Courier New', Courier, monospace" },
  { label: "Verdana", value: "Verdana, Geneva, sans-serif" },
  { label: "Impact", value: "Impact, Charcoal, sans-serif" },
];

const TextToolPanel: React.FC<TextToolPanelProps> = ({ onPlaceText }) => {
  const [text, setText] = useState<string>("");
  const [font, setFont] = useState<string>(FONT_OPTIONS[0].value);

  const handleFontChange = (e: SelectChangeEvent<string>) => {
    setFont(e.target.value);
  };

  const handlePlace = () => {
    if (!text.trim()) return;
    onPlaceText(text.trim(), font);
  };

  return (
    <Box sx={{ p: 2, display: "flex", flexDirection: "column", gap: 2 }}>
      <Typography variant="h6">Text</Typography>
      <TextField
        label="Enter text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        size="small"
        fullWidth
      />

      <Box>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          Font
        </Typography>
        <Select fullWidth size="small" value={font} onChange={handleFontChange}>
          {FONT_OPTIONS.map((opt) => (
            <MenuItem key={opt.value} value={opt.value}>
              {opt.label}
            </MenuItem>
          ))}
        </Select>
      </Box>

      <Box>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          Preview
        </Typography>
        <Box
          sx={{
            border: "1px solid rgba(255,255,255,0.2)",
            borderRadius: 1,
            p: 1.5,
            minHeight: 56,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(0,0,0,0.1)",
            fontFamily: font,
            fontSize: 20,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
          aria-label="Text preview"
        >
          {text || <span style={{ opacity: 0.6 }}>Your text will preview here</span>}
        </Box>
      </Box>

      <Button variant="contained" onClick={handlePlace} disabled={!text.trim()}>
        Place Text
      </Button>
    </Box>
  );
};

export default TextToolPanel;
