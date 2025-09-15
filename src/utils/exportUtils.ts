import { GridSize } from "../types";

/**
 * Export the current pattern as a PNG image
 */
export const exportAsPNG = (gridRef?: HTMLDivElement | null): void => {
  if (!gridRef) return;

  // Find the canvas element within the grid container
  const canvas = gridRef.querySelector("canvas");
  if (!canvas) {
    console.error("Canvas element not found");
    return;
  }

  // Create a new canvas to add padding and background
  const exportCanvas = document.createElement("canvas");
  const ctx = exportCanvas.getContext("2d");
  if (!ctx) return;

  // Add some padding around the pattern
  const padding = 20;
  exportCanvas.width = canvas.width + padding * 2;
  exportCanvas.height = canvas.height + padding * 2;

  // Draw a white background
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);

  // Draw the pattern canvas onto our export canvas with padding
  ctx.drawImage(canvas, padding, padding);

  // Add a title/caption at the bottom if desired
  ctx.font = "17px Arial";
  ctx.fillStyle = "#000000";
  ctx.textAlign = "center";
  ctx.fillText(
    "Instant Perler Pattern - https://zacharyreece.dev/instant-perler-pattern",
    exportCanvas.width / 2,
    exportCanvas.height - 5
  );

  // Convert to data URL and trigger download
  const dataUrl = exportCanvas.toDataURL("image/png");
  const link = document.createElement("a");
  link.download = "perler-pattern.png";
  link.href = dataUrl;
  link.click();
};

/**
 * Export the current pattern as a JSON file
 */
export const exportAsJSON = (gridSize: GridSize, scale: number, perlerPattern: string[][]): void => {
  // Create state object
  const state = {
    gridSize,
    scale,
    perlerPattern,
  };

  // Convert to JSON
  const json = JSON.stringify(state, null, 2);

  // Create download link
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "perler-pattern.json";
  a.click();

  // Clean up
  URL.revokeObjectURL(url);
};

/**
 * Import a pattern from a JSON file
 */
export const importFromJSON = (fileContent: string): string[][] | null => {
  try {
    const state = JSON.parse(fileContent);

    // Check if it's a valid state file
    if (!state.perlerPattern || !state.gridSize) {
      console.error("Invalid pattern file");
      return null;
    }

    return state.perlerPattern;
  } catch (error) {
    console.error("Error importing pattern:", error);
    return null;
  }
};
