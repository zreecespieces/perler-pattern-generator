import React, { useState } from "react";
import { Box, Button, TextField, Typography, ToggleButton, ToggleButtonGroup, Slider } from "@mui/material";
import type { TextAlignOption } from "../../utils/textImage";

interface TextToolPanelProps {
  onPlaceText: (text: string, align: TextAlignOption, lineHeightMul: number, kerningEm: number) => void;
}

const TextToolPanel: React.FC<TextToolPanelProps> = ({ onPlaceText }) => {
  const [text, setText] = useState<string>("");
  const [align, setAlign] = useState<TextAlignOption>("center");
  const [lineHeightMul, setLineHeightMul] = useState<number>(1.15);
  const [kerningEm, setKerningEm] = useState<number>(0);

  const handlePlace = () => {
    if (!text.trim()) return;
    onPlaceText(text, align, lineHeightMul, kerningEm);
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
        multiline
        minRows={2}
        maxRows={6}
      />

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
            fontSize: 20,
            overflow: "hidden",
            whiteSpace: "pre-line",
            textAlign: align,
            lineHeight: lineHeightMul,
            letterSpacing: `${kerningEm}em`,
          }}
          aria-label="Text preview">
          {text || <span style={{ opacity: 0.6 }}>Your text will preview here</span>}
        </Box>
      </Box>

      <Box>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          Align
        </Typography>
        <ToggleButtonGroup size="small" fullWidth exclusive value={align} onChange={(_, v) => v && setAlign(v)}>
          <ToggleButton value="left" aria-label="Align left">
            Left
          </ToggleButton>
          <ToggleButton value="center" aria-label="Align center">
            Center
          </ToggleButton>
          <ToggleButton value="right" aria-label="Align right">
            Right
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <Box>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          Line Height ({lineHeightMul.toFixed(2)}x)
        </Typography>
        <Slider
          size="small"
          value={lineHeightMul}
          onChange={(_, v) => typeof v === "number" && setLineHeightMul(v)}
          min={0.8}
          max={2.0}
          step={0.05}
          marks={[
            { value: 1, label: "1.0" },
            { value: 1.15, label: "1.15" },
            { value: 1.5, label: "1.5" },
          ]}
          valueLabelDisplay="off"
        />
      </Box>

      <Box>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          Letter Spacing ({kerningEm.toFixed(2)}em)
        </Typography>
        <Slider
          size="small"
          value={kerningEm}
          onChange={(_, v) => typeof v === "number" && setKerningEm(v)}
          min={-0.1}
          max={0.3}
          step={0.01}
          marks={[
            { value: 0, label: "0" },
            { value: 0.1, label: "+0.10" },
          ]}
          valueLabelDisplay="off"
        />
      </Box>

      <Button variant="contained" onClick={handlePlace} disabled={!text.trim()}>
        Place Text
      </Button>
    </Box>
  );
};

export default TextToolPanel;
