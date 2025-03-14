// Convert hex color to RGB components
export const hexToRgb = (hex: string): { r: number; g: number; b: number } => {
  // Remove # if present
  hex = hex.replace(/^#/, '');

  // Parse the RGB components
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);

  return { r, g, b };
};

// Convert RGB to LAB color space for better perceptual color comparison
export const rgbToLab = ({ r, g, b }: { r: number; g: number; b: number }): { l: number; a: number; b: number } => {
  // RGB to XYZ
  let rLinear = r / 255;
  let gLinear = g / 255;
  let bLinear = b / 255;

  // Apply gamma correction
  rLinear = rLinear > 0.04045 ? Math.pow((rLinear + 0.055) / 1.055, 2.4) : rLinear / 12.92;
  gLinear = gLinear > 0.04045 ? Math.pow((gLinear + 0.055) / 1.055, 2.4) : gLinear / 12.92;
  bLinear = bLinear > 0.04045 ? Math.pow((bLinear + 0.055) / 1.055, 2.4) : bLinear / 12.92;

  // Convert to XYZ color space
  const x = rLinear * 0.4124 + gLinear * 0.3576 + bLinear * 0.1805;
  const y = rLinear * 0.2126 + gLinear * 0.7152 + bLinear * 0.0722;
  const z = rLinear * 0.0193 + gLinear * 0.1192 + bLinear * 0.9505;

  // XYZ to LAB
  // Reference values for D65 standard illuminant
  const xRef = 0.95047;
  const yRef = 1.0;
  const zRef = 1.08883;

  const xNorm = x / xRef;
  const yNorm = y / yRef;
  const zNorm = z / zRef;

  const fx = xNorm > 0.008856 ? Math.pow(xNorm, 1/3) : (7.787 * xNorm) + (16/116);
  const fy = yNorm > 0.008856 ? Math.pow(yNorm, 1/3) : (7.787 * yNorm) + (16/116);
  const fz = zNorm > 0.008856 ? Math.pow(zNorm, 1/3) : (7.787 * zNorm) + (16/116);

  const l = (116 * fy) - 16;
  const a = 500 * (fx - fy);
  const bValue = 200 * (fy - fz);

  return { l, a: a, b: bValue };
};

// Calculate perceptual color distance using Delta E (CIE76)
export const colorDistance = (color1: string, color2: string): number => {
  const lab1 = rgbToLab(hexToRgb(color1));
  const lab2 = rgbToLab(hexToRgb(color2));

  // Calculate Delta E (CIE76)
  const deltaL = lab1.l - lab2.l;
  const deltaA = lab1.a - lab2.a;
  const deltaB = lab1.b - lab2.b;

  return Math.sqrt(deltaL * deltaL + deltaA * deltaA + deltaB * deltaB);
};

// Convert RGB back to hex format
export const rgbToHex = ({ r, g, b }: { r: number; g: number; b: number }): string => {
  const toHex = (c: number) => {
    const hex = Math.round(c).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

// Normalize colors by clustering similar colors together
export const normalizeColors = (colors: string[], threshold: number = 5): { [key: string]: string } => {
  if (colors.length <= 1) return {};

  // Make a copy of the colors array to avoid modifying the original
  const remainingColors = [...colors];
  const clusters: string[][] = [];

  // Cluster similar colors
  while (remainingColors.length > 0) {
    const currentColor = remainingColors.shift()!;
    const cluster = [currentColor];

    // Find all colors that are similar to the current color
    for (let i = remainingColors.length - 1; i >= 0; i--) {
      const distance = colorDistance(currentColor, remainingColors[i]);
      if (distance < threshold) {
        cluster.push(remainingColors[i]);
        remainingColors.splice(i, 1);
      }
    }

    clusters.push(cluster);
  }

  // For each cluster, select a representative color
  const colorMap: { [key: string]: string } = {};
  
  clusters.forEach(cluster => {
    // Choose the first color in the cluster as the representative
    // Could be improved by choosing the most central color in the cluster
    const representative = cluster[0];
    
    // Map all colors in the cluster to the representative
    cluster.forEach(color => {
      colorMap[color] = representative;
    });
  });

  return colorMap;
};
