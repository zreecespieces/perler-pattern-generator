export enum EditTool {
  NONE = "none",
  PAINT = "paint",
  ERASE = "erase",
  EYEDROPPER = "eyedropper",
  BUCKET = "bucket",
  TEXT = "text",
  SELECT = "select",
}

export type HistoryEntry = {
  pattern: string[][];
  timestamp: number;
};

export type GridSize = {
  width: number;
  height: number;
};

export type PanDirection = 'up' | 'down' | 'left' | 'right';

export type SelectMode = 'single' | 'region';
