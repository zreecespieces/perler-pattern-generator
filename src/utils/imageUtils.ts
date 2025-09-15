import { GridSize } from "../types";
// No direct color utils needed here; heavy color work happens in the Web Worker

let activeWorker: Worker | null = null;

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
  const multiplier = options?.multiplier ?? 15;
  // Offload heavy work to Web Worker (including image decode and draw via OffscreenCanvas)
  if (activeWorker) {
    try {
      activeWorker.terminate();
    } catch {
      /* ignore previous worker termination errors */
    }
    activeWorker = null;
  }
  const worker = new Worker(new URL("../workers/patternWorker.ts", import.meta.url), { type: "module" });
  activeWorker = worker;
  worker.onmessage = (ev: MessageEvent) => {
    const msg = ev.data;
    if (msg && msg.type === "RESULT" && msg.pattern) {
      onPatternGenerated(msg.pattern as string[][]);
    } else {
      const empty = Array.from({ length: gridSize.height }, () => Array(gridSize.width).fill("transparent"));
      onPatternGenerated(empty);
    }
    try {
      worker.terminate();
    } finally {
      activeWorker = null;
    }
  };

  worker.postMessage({
    imageUrl,
    scalePercent,
    gridWidth: gridSize.width,
    gridHeight: gridSize.height,
    multiplier,
  });
};
