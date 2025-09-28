import React, { useEffect, useRef, useState } from "react";
import { Box, Button, IconButton, TextField, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { DrawerHeader, ToolsDrawer as StyledToolsDrawer } from "../../styles/styledComponents";
import qrcode from "qrcode-generator";

type ECC = "L" | "M" | "Q" | "H";
type QRApi = {
  addData: (s: string, mode?: "Numeric" | "Alphanumeric" | "Byte" | "Kanji") => void;
  make: () => void;
  getModuleCount: () => number;
  isDark: (r: number, c: number) => boolean;
};
const createQR = qrcode as unknown as (version: number, ecc: ECC) => QRApi;

type QRCodeDrawerProps = {
  open: boolean;
  onClose: () => void;
  onGenerateFromImage: (dataUrl: string, moduleCount: number) => void;
};

const QRCodeDrawer: React.FC<QRCodeDrawerProps> = ({ open, onClose, onGenerateFromImage }) => {
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [moduleCount, setModuleCount] = useState<number | null>(null);
  const [matrix, setMatrix] = useState<boolean[][] | null>(null);
  // Fixed QR configuration: Low error correction, cap modules at 29
  const ECC_FIXED: ECC = "L";
  const MAX_MODULES = 29;

  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  // Pick the most efficient encoding mode supported by the content without altering it
  const detectBestMode = (input: string): "Numeric" | "Alphanumeric" | "Byte" => {
    if (/^\d+$/.test(input)) return "Numeric";
    // Alphanumeric set per QR spec: 0-9, A-Z, space, $%*+-./:
    // Note: lowercase letters are NOT allowed; we will not upcase to avoid altering content
    if (/^[0-9A-Z $%*+\-./:]+$/.test(input)) return "Alphanumeric";
    return "Byte";
  };

  // Helper to compute version cap from module cap
  const modulesToVersionCap = (mods: number) => {
    const clamped = Math.max(21, Math.min(177, mods)); // version 1..40 => 21..177
    return Math.max(1, Math.min(40, Math.floor((clamped - 21) / 4) + 1));
  };

  const generateMatrixWithCap = (input: string) => {
    if (!input) {
      setMatrix(null);
      setModuleCount(null);
      setError(null);
      return;
    }
    const maxV = modulesToVersionCap(MAX_MODULES);
    const mode = detectBestMode(input);
    let success = false;
    for (let v = 1; v <= maxV; v++) {
      try {
        const qr = createQR(v, ECC_FIXED);
        qr.addData(input, mode);
        qr.make();
        const count = qr.getModuleCount();
        const mat: boolean[][] = [];
        for (let r = 0; r < count; r++) {
          const row: boolean[] = [];
          for (let c = 0; c < count; c++) {
            row.push(qr.isDark(r, c));
          }
          mat.push(row);
        }
        setMatrix(mat);
        setModuleCount(count);
        setError(null);
        success = true;
        break;
      } catch {
        // try next version
      }
    }
    if (!success) {
      setMatrix(null);
      setModuleCount(null);
      setError(`Content doesn't fit within 29 modules at Low error level. Shorten content.`);
    }
  };

  // Build the QR matrix when inputs change
  useEffect(() => {
    generateMatrixWithCap(text);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);

  // When the drawer re-opens and text exists, ensure preview regenerates immediately
  useEffect(() => {
    if (!open) return;
    if (!text) return;
    generateMatrixWithCap(text);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, text]);

  // Draw preview whenever matrix updates or drawer opens
  useEffect(() => {
    const canvas = previewCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const size = 220; // fixed preview size
    canvas.width = size;
    canvas.height = size;

    ctx.clearRect(0, 0, size, size);

    if (!matrix || !moduleCount) {
      // placeholder
      ctx.fillStyle = "#666";
      ctx.fillRect(0, 0, size, size);
      ctx.fillStyle = "#999";
      ctx.fillRect(0, 0, size, 36);
      ctx.fillStyle = "#111";
      ctx.font = "12px system-ui, -apple-system, Segoe UI, Roboto";
      ctx.fillText("Enter text to preview QR", 12, 22);
      return;
    }

    // Render to an offscreen 1:1 module canvas for sharp scaling, include quiet zone
    const quietZoneModules = moduleCount === 21 ? 2 : 5; // 2 for v1 (21 modules), else 5
    const totalModules = moduleCount + quietZoneModules * 2;
    const off = document.createElement("canvas");
    off.width = totalModules;
    off.height = totalModules;
    const offCtx = off.getContext("2d");
    if (!offCtx) return;
    offCtx.fillStyle = "#FFFFFF";
    offCtx.fillRect(0, 0, off.width, off.height);
    offCtx.fillStyle = "#000000";
    for (let r = 0; r < moduleCount; r++) {
      for (let c = 0; c < moduleCount; c++) {
        if (matrix[r][c]) {
          offCtx.fillRect(c + quietZoneModules, r + quietZoneModules, 1, 1);
        }
      }
    }

    // Draw full-bleed without smoothing
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(off, 0, 0, size, size);
  }, [matrix, moduleCount, open]);

  // Generate a crisp 300x300 QR PNG (quiet zone depends on module count) and pass through the existing image pipeline
  const generateViaPipeline = () => {
    if (!matrix || !moduleCount) return;

    // Render offscreen at 1:1 modules, then scale to 300x300 without smoothing
    const quietZoneModules = moduleCount === 21 ? 2 : 5;
    const totalModules = moduleCount + quietZoneModules * 2;

    const off = document.createElement("canvas");
    off.width = totalModules;
    off.height = totalModules;
    const offCtx = off.getContext("2d");
    if (!offCtx) return;
    offCtx.fillStyle = "#FFFFFF";
    offCtx.fillRect(0, 0, off.width, off.height);
    offCtx.fillStyle = "#000000";
    for (let r = 0; r < moduleCount; r++) {
      for (let c = 0; c < moduleCount; c++) {
        if (matrix[r][c]) {
          offCtx.fillRect(c + quietZoneModules, r + quietZoneModules, 1, 1);
        }
      }
    }

    const targetSide = 300;
    const canvas = document.createElement("canvas");
    canvas.width = targetSide;
    canvas.height = targetSide;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, targetSide, targetSide);
    ctx.drawImage(off, 0, 0, targetSide, targetSide);

    const dataUrl = canvas.toDataURL("image/png");
    onGenerateFromImage(dataUrl, moduleCount);
    onClose();
  };

  return (
    <StyledToolsDrawer variant="temporary" anchor="left" open={open} onClose={onClose}>
      <DrawerHeader>
        <Typography variant="subtitle1" sx={{ flex: 1 }}>
          QR Code
        </Typography>
        <IconButton aria-label="Close QR" onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DrawerHeader>

      <Box sx={{ p: 2, display: "flex", flexDirection: "column", gap: 2 }}>
        <TextField
          label="QR content"
          placeholder="Type text or URL"
          multiline
          value={text}
          onChange={(e) => setText(e.target.value)}
          size="small"
          fullWidth
        />

        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
          <canvas ref={previewCanvasRef} style={{ width: 220, height: 220, imageRendering: "pixelated" }} />
        </Box>

        {error && (
          <Typography variant="body2" color="error">
            {error}
          </Typography>
        )}

        <Button variant="contained" onClick={generateViaPipeline} disabled={!text || !matrix}>
          Generate Pattern
        </Button>
      </Box>
    </StyledToolsDrawer>
  );
};

export default QRCodeDrawer;
