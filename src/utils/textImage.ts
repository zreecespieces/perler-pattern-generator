export type TextAlignOption = "left" | "center" | "right";

export function renderTextImageDataUrl(
  text: string,
  align: TextAlignOption = "center",
  lineHeightMul: number = 1.15,
  trackingEm: number = 0
): string {
  const size = 300;
  const margin = 20; // px

  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";

  // Background
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, size, size);

  // Choose a highly legible default font stack
  const fontStack = "600 48px Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif";
  ctx.font = fontStack;
  // alignment will be applied later based on 'align'
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = "#000000"; // black text for maximum contrast

  // Prepare lines (support explicit newlines)
  const lines = text.split(/\r?\n/);

  // Fit text to box by shrinking until it fits within margins
  const maxW = size - margin * 2;
  const maxH = size - margin * 2;

  // Start with large size and decrease
  let fontSize = Math.min(maxW, maxH);

  const getTextMetrics = (fs: number) => {
    ctx.font = `600 ${fs}px Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif`;
    const m = ctx.measureText("Mg");
    const metrics = m as TextMetrics & { actualBoundingBoxAscent?: number; actualBoundingBoxDescent?: number };
    const ascent = metrics.actualBoundingBoxAscent ?? fs * 0.8;
    const descent = metrics.actualBoundingBoxDescent ?? fs * 0.2;
    const height = ascent + descent;
    return { height, ascent, descent };
  };

  // Measure a line at font size 'fs' including tracking (kerning) in em units
  const measureLineWidth = (fs: number, line: string) => {
    ctx.font = `600 ${fs}px Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif`;
    const chars = Array.from(line);
    const trackPx = trackingEm * fs;
    let w = 0;
    for (const ch of chars) {
      w += ctx.measureText(ch).width;
    }
    if (chars.length > 1) w += (chars.length - 1) * trackPx;
    return w;
  };

  // Clamp reasonable line height range
  lineHeightMul = Math.max(0.8, Math.min(2.0, lineHeightMul));

  // Try decreasing font size until both width and total height fit
  for (; fontSize >= 10; fontSize -= 2) {
    const { height } = getTextMetrics(fontSize);
    const lineHeight = Math.ceil(height * lineHeightMul);
    const totalH = lines.length * lineHeight;
    const widest = lines.reduce((w, line) => Math.max(w, measureLineWidth(fontSize, line)), 0);
    if (widest <= maxW && totalH <= maxH) break;
  }

  // Final metrics
  const { height: lineBoxH, ascent } = getTextMetrics(fontSize);
  const lineHeight = Math.ceil(lineBoxH * lineHeightMul);
  const totalH = lines.length * lineHeight;

  // Vertical centering
  const firstBaselineY = Math.round((size - totalH) / 2) + Math.round(ascent);

  // Draw each line per-character to apply tracking
  ctx.textAlign = "left";
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const y = firstBaselineY + i * lineHeight;
    const lineWidth = measureLineWidth(fontSize, line);
    let xStart: number;
    switch (align) {
      case "left":
        xStart = margin;
        break;
      case "right":
        xStart = size - margin - lineWidth;
        break;
      case "center":
      default:
        xStart = Math.round((size - lineWidth) / 2);
        break;
    }
    const chars = Array.from(line);
    const trackPx = trackingEm * fontSize;
    let x = xStart;
    for (const ch of chars) {
      ctx.fillText(ch, x, y);
      x += ctx.measureText(ch).width + trackPx;
    }
  }

  return canvas.toDataURL("image/png");
}
