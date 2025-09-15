import { GridSize } from "../types";

/**
 * Convert RGB values to hex color string
 */
export const rgbToHex = (r: number, g: number, b: number): string => {
  return (
    "#" +
    [r, g, b]
      .map((x) => {
        const hex = x.toString(16);
        return hex.length === 1 ? "0" + hex : hex;
      })
      .join("")
  );
};

// Helper: RGB to HSV (h in [0,360), s,v in [0,1])
const rgbToHsv = (r: number, g: number, b: number) => {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b),
    min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  const s = max === 0 ? 0 : d / max;
  const v = max;
  if (d !== 0) {
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h *= 60;
  }
  return { h, s, v };
};

/**
 * Generate pattern by assigning each grid cell the dominant color found within
 * that cell from a high-resolution sampling of the source image.
 */
export const generateDominantCellPattern = (
  imageUrl: string,
  scalePercent: number,
  gridSize: GridSize,
  onPatternGenerated: (pattern: string[][]) => void,
  options?: { multiplier?: number }
): void => {
  const multiplier = options?.multiplier ?? 10;
  const img = new Image();
  img.onload = () => {
    // High-resolution working canvas for sampling
    const sampleWidth = gridSize.width * multiplier;
    const sampleHeight = gridSize.height * multiplier;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = sampleWidth;
    canvas.height = sampleHeight;
    ctx.clearRect(0, 0, sampleWidth, sampleHeight);

    // Maintain aspect ratio, apply scalePercent, and center
    const imgAspectRatio = img.width / img.height;
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

    ctx.drawImage(img, offsetX, offsetY, scaledWidth, scaledHeight);

    const imageData = ctx.getImageData(0, 0, sampleWidth, sampleHeight);
    const data = imageData.data;

    // Initialize pattern
    const pattern: string[][] = [];
    for (let y = 0; y < gridSize.height; y++) {
      const row: string[] = [];
      for (let x = 0; x < gridSize.width; x++) {
        row.push("transparent");
      }
      pattern.push(row);
    }

    // For each cell, build a coarse HSV histogram and pick dominant bin
    const binsH = 24,
      binsS = 6,
      binsV = 6;
    for (let cy = 0; cy < gridSize.height; cy++) {
      for (let cx = 0; cx < gridSize.width; cx++) {
        const x0 = cx * multiplier;
        const y0 = cy * multiplier;
        const x1 = x0 + multiplier;
        const y1 = y0 + multiplier;

        // Map<binIndex, {count:number, sumR:number, sumG:number, sumB:number}>
        const hist = new Map<number, { c: number; r: number; g: number; b: number }>();

        for (let y = y0; y < y1; y++) {
          for (let x = x0; x < x1; x++) {
            if (x < 0 || x >= sampleWidth || y < 0 || y >= sampleHeight) continue;
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

            // Weight by saturation to prefer vivid colors slightly
            const weight = 0.7 + 0.3 * s; // in [0.7,1.0]
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

        // Pick the bin with the max weighted count
        let bestBin: { c: number; r: number; g: number; b: number } | null = null;
        for (const entry of hist.values()) {
          if (!bestBin || entry.c > bestBin.c) bestBin = entry;
        }
        if (bestBin && bestBin.c > 0) {
          const avgR = Math.round(bestBin.r / bestBin.c);
          const avgG = Math.round(bestBin.g / bestBin.c);
          const avgB = Math.round(bestBin.b / bestBin.c);
          pattern[cy][cx] = rgbToHex(avgR, avgG, avgB);
        } else {
          pattern[cy][cx] = "transparent";
        }
      }
    }

    onPatternGenerated(pattern);
  };
  img.src = imageUrl;
};
