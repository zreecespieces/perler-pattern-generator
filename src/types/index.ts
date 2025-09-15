export enum EditTool {
  NONE = "none",
  PAINT = "paint",
  ERASE = "erase",
  EYEDROPPER = "eyedropper",
  BUCKET = "bucket",
}

export type HistoryEntry = {
  pattern: string[][];
  timestamp: number;
};

export type GridSize = {
  width: number;
  height: number;
};
