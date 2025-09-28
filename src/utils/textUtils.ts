import { GridSize } from "../types";

/**
 * Render the provided text into a boolean mask sized to the grid.
 * Each mask cell is true if the text occupies that grid cell when centered and scaled to fit.
 */
export type TextRenderOptions = {
  oversample?: number; // render scale vs grid resolution
  threshold?: number; // 0..1 coverage per cell required to fill
  dilate?: number; // 0 = none, 1 = expand by 1 cell
  stroke?: number; // stroke width in oversampled pixels to reinforce edges
  closing?: number; // iterations of morphological closing (dilate then erode)
  tracking?: number; // additional spacing between characters as a fraction of font size (e.g. 0.08)
  maxWidthRatio?: number; // horizontal margin ratio (default 0.92)
  autoThreshold?: boolean; // choose threshold from coverage using Otsu
};

export function renderTextMask(
  text: string,
  fontFamily: string,
  gridSize: GridSize,
  opts: TextRenderOptions = {}
): boolean[][] {
  const width = Math.max(1, Math.floor(gridSize.width));
  const height = Math.max(1, Math.floor(gridSize.height));

  const smallGrid = gridSize.width * gridSize.height <= 1600;
  const oversample = Math.max(1, Math.floor(opts.oversample ?? (smallGrid ? 6 : 4)));
  // legacy options kept in type for compatibility; no longer directly used in SDF binarization
  // const threshold = Math.min(1, Math.max(0, opts.threshold ?? 0.5));
  // const dilate = Math.max(0, Math.floor(opts.dilate ?? 0));
  // No stroke by default; rely on fill coverage for crisp edges
  const stroke = Math.max(0, opts.stroke ?? 0);
  // const closing = Math.max(0, Math.floor(opts.closing ?? 0));
  // Minimal tracking by default to avoid letter merging without inflating width
  const tracking = Math.max(0, opts.tracking ?? (smallGrid ? 0.01 : 0.02));
  const maxWidthRatio = Math.min(1, Math.max(0.5, opts.maxWidthRatio ?? 0.94));

  const ow = width * oversample;
  const oh = height * oversample;

  const canvas = document.createElement("canvas");
  canvas.width = ow;
  canvas.height = oh;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return Array.from({ length: height }, () => Array(width).fill(false));
  }

  ctx.clearRect(0, 0, ow, oh);
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  // Fit font in oversampled space
  const maxW = ow * maxWidthRatio;
  const maxH = oh * 0.8;
  const fontSize = Math.floor(Math.min(maxH, maxW));
  const minFontSize = Math.max(6, Math.floor(oversample * 2));

  const fitText = () => {
    for (let fs = fontSize; fs >= minFontSize; fs--) {
      ctx.font = `${fs}px ${fontFamily}`;
      // Measure height using a representative measurement
      const m = ctx.measureText("Mg");
      const tm = m as TextMetrics & { actualBoundingBoxAscent?: number; actualBoundingBoxDescent?: number };
      const ascent = tm.actualBoundingBoxAscent ?? fs * 0.8;
      const descent = tm.actualBoundingBoxDescent ?? fs * 0.2;
      const textH = ascent + descent;
      // Compute width per-character + tracking
      const chars = Array.from(text);
      const trackPx = tracking * fs;
      let textW = 0;
      for (const ch of chars) {
        textW += ctx.measureText(ch).width;
      }
      textW += Math.max(0, chars.length - 1) * trackPx;
      if (textW <= maxW && textH <= maxH) {
        return { fs, textW, textH };
      }
    }
    return null;
  };

  const fitted = fitText();
  const finalFontSize = fitted ? fitted.fs : minFontSize;
  ctx.font = `${finalFontSize}px ${fontFamily}`;

  // Draw centered at oversampled resolution, with tracking per character
  const drawText = (strokeOnly = false) => {
    // Ensure left alignment so x is the left edge of each glyph, not center
    const prevAlign = ctx.textAlign;
    ctx.textAlign = "left";
    const fs = finalFontSize;
    const chars = Array.from(text);
    const trackPx = tracking * fs;
    // compute total width for centering
    let totalW = 0;
    for (const ch of chars) totalW += ctx.measureText(ch).width;
    totalW += Math.max(0, chars.length - 1) * trackPx;
    let x = (ow - totalW) / 2;
    // snap baseline to pixel grid for consistency
    const y = Math.round(oh / 2);
    for (const ch of chars) {
      // keep subpixel x to preserve glyph metrics and avoid blocky edges
      if (strokeOnly) {
        ctx.strokeText(ch, x, y);
      } else {
        ctx.fillText(ch, x, y);
      }
      x = x + ctx.measureText(ch).width + trackPx;
    }
    // restore previous alignment
    ctx.textAlign = prevAlign;
  };
  if (stroke > 0) {
    ctx.lineWidth = stroke;
    ctx.lineJoin = "round";
    ctx.miterLimit = 2;
    ctx.strokeStyle = "#ffffff";
    drawText(true);
  }
  // Always fill text for primary coverage
  drawText(false);

  // Coverage-based downsampling (fast) on stroke alpha
  const img = ctx.getImageData(0, 0, ow, oh);
  const data = img.data;
  const mask: boolean[][] = Array.from({ length: height }, () => Array<boolean>(width).fill(false));
  const coverageMap: number[][] = Array.from({ length: height }, () => Array<number>(width).fill(0));
  const cellSamples = oversample * oversample;
  const gamma = 1.0; // no gamma to avoid blocky edges
  for (let gy = 0; gy < height; gy++) {
    for (let gx = 0; gx < width; gx++) {
      let sum = 0;
      const startY = gy * oversample;
      const startX = gx * oversample;
      for (let sy = 0; sy < oversample; sy++) {
        const y = startY + sy;
        for (let sx = 0; sx < oversample; sx++) {
          const x = startX + sx;
          const idx = (y * ow + x) * 4;
          const a = data[idx + 3] / 255;
          // gamma sharpen
          sum += Math.pow(a, gamma);
        }
      }
      coverageMap[gy][gx] = sum / cellSamples; // 0..1
    }
  }

  // Fixed thresholds tuned for readability and speed
  const thr = smallGrid ? 0.52 : 0.50;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      mask[y][x] = coverageMap[y][x] >= thr;
    }
  }

  // Neighbor utility (placed before cleanup)
  const neighbors8 = (g: boolean[][], x: number, y: number) => {
    let c = 0;
    for (let j = -1; j <= 1; j++) {
      for (let i = -1; i <= 1; i++) {
        if (i === 0 && j === 0) continue;
        const nx = x + i;
        const ny = y + j;
        if (nx >= 0 && ny >= 0 && ny < height && nx < width && g[ny][nx]) c++;
      }
    }
    return c;
  };

  // Baked-in cleanup to remove speckles

  // Prune singletons (speckle removal only)
  {
    const copy = mask.map((row) => [...row]);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (copy[y][x] && neighbors8(copy, x, y) <= 1) mask[y][x] = false;
      }
    }
  }

  return mask;
}
