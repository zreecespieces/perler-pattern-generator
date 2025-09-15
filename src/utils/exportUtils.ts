import { GridSize } from "../types";

// Minimal types for the File System Access API (only what's needed here)
type FSWritable = { write: (data: Blob) => Promise<void>; close: () => Promise<void> };
type FSFileHandle = { createWritable: () => Promise<FSWritable> };
type SaveFilePickerAcceptType = { description?: string; accept: Record<string, string[]> };
type SaveFilePickerOptions = {
  suggestedName?: string;
  startIn?: "downloads" | "documents" | "desktop" | "pictures";
  types?: SaveFilePickerAcceptType[];
};
type FSShowSaveFilePicker = (options: SaveFilePickerOptions) => Promise<FSFileHandle>;

// Helper: save a Blob using the File System Access API when available, with a fallback to browser download
const saveBlob = async (
  blob: Blob,
  suggestedName: string,
  mimeDescription: string,
  mimeType: string,
  extension: string
): Promise<void> => {
  const w = window as unknown as { showSaveFilePicker?: FSShowSaveFilePicker };
  if (typeof w.showSaveFilePicker === "function") {
    try {
      const handle = await w.showSaveFilePicker({
        suggestedName,
        startIn: "downloads",
        types: [
          {
            description: mimeDescription,
            accept: { [mimeType]: [extension] },
          },
        ],
      });
      const writable = await handle.createWritable();
      await writable.write(blob);
      await writable.close();
      return;
    } catch {
      // User canceled or API failed; fall back below
    }
  }

  // Fallback: trigger a browser download to the default downloads location
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = suggestedName;
  a.click();
  URL.revokeObjectURL(url);
};

/**
 * Export the current pattern as a PNG image
 */
export const exportAsPNG = async (gridRef?: HTMLDivElement | null): Promise<void> => {
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

  // Convert to Blob and prompt user for save location/name
  const blob: Blob | null = await new Promise((resolve) =>
    exportCanvas.toBlob((b) => resolve(b), "image/png")
  );
  if (blob) {
    await saveBlob(blob, "perler-pattern.png", "PNG Image", "image/png", ".png");
  } else {
    // Fallback if toBlob is unavailable
    const dataUrl = exportCanvas.toDataURL("image/png");
    await saveBlob(
      new Blob([dataUrl.split(",")[1] || ""], { type: "image/png" }),
      "perler-pattern.png",
      "PNG Image",
      "image/png",
      ".png"
    );
  }
};

/**
 * Export the current pattern as a JSON file
 */
export const exportAsJSON = async (
  gridSize: GridSize,
  scale: number,
  perlerPattern: string[][]
): Promise<void> => {
  // Create state object
  const state = {
    gridSize,
    scale,
    perlerPattern,
  };

  // Convert to JSON
  const json = JSON.stringify(state, null, 2);

  // Save using file picker (with fallback)
  const blob = new Blob([json], { type: "application/json" });
  await saveBlob(blob, "perler-pattern.json", "JSON File", "application/json", ".json");
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
