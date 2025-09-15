// Pattern generation Web Worker (OffscreenCanvas version)
// Receives: { imageUrl: string, scalePercent: number, gridWidth: number, gridHeight: number, multiplier: number }
// Returns: { type: 'RESULT', pattern: string[][] }

import { rgbToHex, rgbToHsv } from "../utils/colorUtils";

interface GenerateMessage {
  imageUrl: string;
  scalePercent: number;
  gridWidth: number;
  gridHeight: number;
  multiplier: number;
}

self.onmessage = async (e: MessageEvent) => {
  const msg: GenerateMessage = e.data;
  const gridW = msg.gridWidth;
  const gridH = msg.gridHeight;
  const multiplier = msg.multiplier;
  const scalePercent = msg.scalePercent;

  // Prepare OffscreenCanvas at sampling resolution
  const sampleWidth = gridW * multiplier;
  const sampleHeight = gridH * multiplier;
  const canvas = new OffscreenCanvas(sampleWidth, sampleHeight);
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    (self as unknown as Worker).postMessage({
      type: "RESULT",
      pattern: Array.from({ length: gridH }, () => Array(gridW).fill("transparent")),
    });
    return;
  }

  // Load image and draw with aspect-preserving scale and centering
  try {
    const res = await fetch(msg.imageUrl);
    const blob = await res.blob();
    const bitmap = await createImageBitmap(blob);

    const imgAspectRatio = bitmap.width / bitmap.height;
    const gridAspectRatio = sampleWidth / sampleHeight;
    let scaledWidth: number, scaledHeight: number;
    if (imgAspectRatio > gridAspectRatio) {
      scaledWidth = sampleWidth * (scalePercent / 100);
      scaledHeight = scaledWidth / imgAspectRatio;
    } else {
      scaledHeight = sampleHeight * (scalePercent / 100);
      scaledWidth = scaledHeight * imgAspectRatio;
    }
    const offsetX = (sampleWidth - scaledWidth) / 2;
    const offsetY = (sampleHeight - scaledHeight) / 2;

    ctx.clearRect(0, 0, sampleWidth, sampleHeight);
    ctx.drawImage(bitmap, offsetX, offsetY, scaledWidth, scaledHeight);
  } catch (err) {
    console.error(err);
    (self as unknown as Worker).postMessage({
      type: "RESULT",
      pattern: Array.from({ length: gridH }, () => Array(gridW).fill("transparent")),
    });
    return;
  }

  const imageData = ctx.getImageData(0, 0, sampleWidth, sampleHeight);
  const data = imageData.data;

  // Compute pattern
  const pattern: string[][] = [];
  for (let y = 0; y < gridH; y++) {
    const row: string[] = [];
    for (let x = 0; x < gridW; x++) row.push("transparent");
    pattern.push(row);
  }

  const binsH = 24,
    binsS = 6,
    binsV = 6;

  for (let cy = 0; cy < gridH; cy++) {
    for (let cx = 0; cx < gridW; cx++) {
      const x0 = cx * multiplier;
      const y0 = cy * multiplier;
      const x1 = Math.min(x0 + multiplier, sampleWidth);
      const y1 = Math.min(y0 + multiplier, sampleHeight);

      const hist = new Map<number, { c: number; r: number; g: number; b: number }>();

      for (let y = y0; y < y1; y++) {
        for (let x = x0; x < x1; x++) {
          const idx = (y * sampleWidth + x) * 4;
          const r = data[idx];
          const g = data[idx + 1];
          const b = data[idx + 2];
          const a = data[idx + 3];
          if (a <= 10) continue;

          const { h, s, v } = rgbToHsv(r, g, b);
          const hBin = Math.min(binsH - 1, Math.floor((h / 360) * binsH));
          const sBin = Math.min(binsS - 1, Math.floor(s * binsS));
          const vBin = Math.min(binsV - 1, Math.floor(v * binsV));
          const binIndex = hBin * (binsS * binsV) + sBin * binsV + vBin;

          const weight = 0.7 + 0.3 * s; // bias toward saturated colors slightly
          const entry = hist.get(binIndex) || { c: 0, r: 0, g: 0, b: 0 };
          entry.c += weight;
          entry.r += r * weight;
          entry.g += g * weight;
          entry.b += b * weight;
          hist.set(binIndex, entry);
        }
      }

      if (hist.size === 0) {
        pattern[cy][cx] = "transparent";
        continue;
      }

      let best: { c: number; r: number; g: number; b: number } | null = null;
      for (const e of hist.values()) {
        if (!best || e.c > best.c) best = e;
      }
      if (best && best.c > 0) {
        const avgR = Math.round(best.r / best.c);
        const avgG = Math.round(best.g / best.c);
        const avgB = Math.round(best.b / best.c);
        pattern[cy][cx] = rgbToHex(avgR, avgG, avgB);
      } else {
        pattern[cy][cx] = "transparent";
      }
    }
  }

  // Post back result
  (self as unknown as Worker).postMessage({ type: "RESULT", pattern });
};
