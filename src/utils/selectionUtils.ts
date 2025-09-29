import { GridSize } from "../types";

export const cellKey = (y: number, x: number) => `${y},${x}`;
export const parseCellKey = (key: string): { y: number; x: number } => {
  const [ys, xs] = key.split(",");
  return { y: Number(ys), x: Number(xs) };
};

// Build a contiguous region (4-connected) of same-color cells starting at (y,x)
export const getSameColorRegion = (
  pattern: string[][],
  y: number,
  x: number,
  gridSize: GridSize
): Set<string> => {
  const targetColor = pattern[y][x];
  const visited = new Set<string>();
  if (!targetColor) return visited;
  const q: Array<{ y: number; x: number }> = [{ y, x }];
  while (q.length) {
    const { y: cy, x: cx } = q.shift()!;
    if (cy < 0 || cy >= gridSize.height || cx < 0 || cx >= gridSize.width) continue;
    const key = cellKey(cy, cx);
    if (visited.has(key)) continue;
    if (pattern[cy][cx] !== targetColor) continue;
    visited.add(key);
    q.push({ y: cy + 1, x: cx });
    q.push({ y: cy - 1, x: cx });
    q.push({ y: cy, x: cx + 1 });
    q.push({ y: cy, x: cx - 1 });
  }
  return visited;
};

export const getSelectionBounds = (selected: Set<string>) => {
  let minY = Infinity,
    minX = Infinity,
    maxY = -Infinity,
    maxX = -Infinity;
  for (const key of selected) {
    const { y, x } = parseCellKey(key);
    if (y < minY) minY = y;
    if (x < minX) minX = x;
    if (y > maxY) maxY = y;
    if (x > maxX) maxX = x;
  }
  if (selected.size === 0) {
    minY = minX = maxY = maxX = 0;
  }
  return { minY, minX, maxY, maxX };
};
