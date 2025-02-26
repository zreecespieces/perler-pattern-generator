import { useState, useRef, useEffect } from 'react'
import { 
  ThemeProvider, 
  createTheme, 
  styled,
  Box, 
  Button, 
  Drawer, 
  Typography, 
  Slider,
  Paper,
  alpha,
  Checkbox,
  FormControlLabel,
  Grid2
} from '@mui/material';
import { 
  Brush as BrushIcon, 
  Colorize as ColorizeIcon,
  Undo as UndoIcon,
  Redo as RedoIcon,
  Delete as DeleteIcon,
  Upload as UploadIcon,
  FormatColorFill as BucketIcon,
  Download as DownloadIcon,
  ImportExport as ImportExportIcon,
  Save as SaveIcon
} from '@mui/icons-material';
import './App.css'

// Tools enum for easier management
enum EditTool {
  NONE = 'none',
  PAINT = 'paint',
  ERASE = 'erase',
  EYEDROPPER = 'eyedropper',
  BUCKET = 'bucket'
}

type HistoryEntry = {
  pattern: string[][];
  timestamp: number;
}

// Create a custom theme with EDM techno punk aesthetic
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#00ffff', // Cyan
    },
    secondary: {
      main: '#ff00ff', // Magenta
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
    text: {
      primary: '#ffffff',
      secondary: '#b0b0b0',
    },
  },
  typography: {
    fontFamily: '"Rajdhani", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 600,
      letterSpacing: '0.05em',
      textTransform: 'uppercase',
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 600,
      letterSpacing: '0.05em',
      textTransform: 'uppercase',
    },
    h4: {
      fontSize: '1.2rem',
      fontWeight: 600,
      letterSpacing: '0.05em',
      textTransform: 'uppercase',
    },
  },
  shape: {
    borderRadius: 4,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          textTransform: 'uppercase',
          fontWeight: 600,
          letterSpacing: '0.05em',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
  },
});

// Styled components
const AppContainer = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.background.default,
  color: theme.palette.text.primary,
  minHeight: '100vh',
  overflowY: 'auto',
  width: '100%',
}));

const MainContent = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'drawerOpen',
})<{ drawerOpen: boolean }>(({ theme, drawerOpen }) => ({
  padding: theme.spacing(3),
  marginLeft: drawerOpen ? 240 : 0,
  transition: theme.transitions.create('margin', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
}));

const ToolsDrawer = styled(Drawer)(({ theme }) => ({
  width: 240,
  flexShrink: 0,
  '& .MuiDrawer-paper': {
    width: 240,
    boxSizing: 'border-box',
    backgroundColor: theme.palette.background.paper,
    borderRight: 'none',
    boxShadow: `0 0 20px ${alpha(theme.palette.primary.main, 0.2)}`,
    backgroundImage: `linear-gradient(to bottom, ${theme.palette.background.paper}, ${alpha(theme.palette.background.paper, 0.95)})`,
  },
}));

const DrawerHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: theme.spacing(1, 1),
  borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
  backgroundImage: `linear-gradient(to right, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(theme.palette.secondary.main, 0.1)})`,
}));

const ToolButton = styled(Button, {
  shouldForwardProp: (prop) => prop !== 'active',
})<{ active?: boolean }>(({ theme, active }) => ({
  margin: theme.spacing(0.5),
  padding: theme.spacing(1),
  minWidth: 0,
  width: 40,
  height: 40,
  borderRadius: 0,
  border: `1px solid ${active ? theme.palette.primary.main : alpha(theme.palette.primary.main, 0.3)}`,
  backgroundColor: active ? alpha(theme.palette.primary.main, 0.2) : 'transparent',
  boxShadow: active ? `0 0 10px ${alpha(theme.palette.primary.main, 0.5)}` : 'none',
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.3),
  },
}));

const ColorSwatch = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'color' && prop !== 'selected',
})<{ color: string; selected?: boolean }>(({ theme, color, selected }) => ({
  width: 24,
  height: 24,
  backgroundColor: color,
  margin: theme.spacing(0.5),
  cursor: 'pointer',
  border: selected 
    ? `2px solid ${theme.palette.common.white}` 
    : `1px solid ${alpha(theme.palette.common.white, 0.3)}`,
  boxShadow: selected 
    ? `0 0 8px ${alpha(theme.palette.primary.main, 0.8)}` 
    : 'none',
  transition: 'all 0.2s ease',
  '&:hover': {
    transform: 'scale(1.1)',
    boxShadow: `0 0 8px ${alpha(theme.palette.primary.main, 0.6)}`,
  },
}));

const ColorGrid = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent: 'center',
  maxWidth: 200,
  margin: '0 auto',
  padding: theme.spacing(1),
}));

const CurrentColorDisplay = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'color',
})<{ color: string }>(({ theme, color }) => ({
  width: 48,
  height: 48,
  backgroundColor: color,
  margin: '0 auto',
  marginBottom: theme.spacing(2),
  border: `1px solid ${alpha(theme.palette.common.white, 0.3)}`,
  boxShadow: `0 0 15px ${alpha(theme.palette.primary.main, 0.5)}`,
}));

const PegboardContainer = styled(Paper)(({ theme }) => ({
  margin: theme.spacing(2, 0),
  padding: theme.spacing(2),
  backgroundColor: alpha(theme.palette.background.paper, 0.7),
  border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
  boxShadow: `0 0 20px ${alpha(theme.palette.primary.main, 0.2)}`,
  backgroundImage: `linear-gradient(45deg, ${alpha(theme.palette.primary.main, 0.05)}, ${alpha(theme.palette.secondary.main, 0.05)})`,
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '2px',
    background: `linear-gradient(to right, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  },
}));

const PegboardGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gap: 1,
  margin: '0 auto',
  maxWidth: '100%',
  overflow: 'auto',
  padding: theme.spacing(2),
  backgroundColor: alpha(theme.palette.common.black, 0.2),
  border: `1px solid ${alpha(theme.palette.common.white, 0.1)}`,
  '& > div': {
    aspectRatio: '1/1',
    width: '100%',
    minWidth: 20,
    minHeight: 20,
  }
}));

const ControlPanel = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: theme.spacing(2),
  margin: theme.spacing(2, 0),
  padding: theme.spacing(2),
  backgroundColor: alpha(theme.palette.background.paper, 0.7),
  border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
  boxShadow: `0 0 10px ${alpha(theme.palette.primary.main, 0.1)}`,
}));

const StyledSlider = styled(Slider)(({ theme }) => ({
  color: theme.palette.primary.main,
  height: 8,
  width: '100%',
  minWidth: 200,
  padding: '15px 0',
  '& .MuiSlider-track': {
    border: 'none',
    backgroundImage: `linear-gradient(to right, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  },
  '& .MuiSlider-thumb': {
    height: 24,
    width: 24,
    backgroundColor: theme.palette.background.paper,
    border: `2px solid ${theme.palette.primary.main}`,
    boxShadow: `0 0 10px ${alpha(theme.palette.primary.main, 0.5)}`,
    '&:focus, &:hover, &.Mui-active, &.Mui-focusVisible': {
      boxShadow: `0 0 15px ${alpha(theme.palette.primary.main, 0.7)}`,
    },
  },
  '& .MuiSlider-rail': {
    opacity: 0.5,
  }
}));

const OriginalImageContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  backgroundColor: alpha(theme.palette.background.paper, 0.7),
  border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
  boxShadow: `0 0 20px ${alpha(theme.palette.primary.main, 0.2)}`,
  '& img': {
    maxWidth: '100%',
    maxHeight: '300px',
    display: 'block',
    margin: '0 auto',
    border: `1px solid ${alpha(theme.palette.common.white, 0.1)}`,
  },
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  position: 'relative',
  display: 'inline-block',
  marginBottom: theme.spacing(2),
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: -5,
    left: 0,
    width: '100%',
    height: 2,
    backgroundImage: `linear-gradient(to right, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  },
}));

function App() {
  const [image, setImage] = useState<string | null>(null);
  const [gridSize, setGridSize] = useState({ width: 29, height: 29 }); // Standard perler pegboard size
  
  // Initialize with an empty grid
  const initializeEmptyGrid = () => {
    const emptyGrid: string[][] = [];
    for (let y = 0; y < gridSize.height; y++) {
      const row: string[] = [];
      for (let x = 0; x < gridSize.width; x++) {
        row.push('transparent');
      }
      emptyGrid.push(row);
    }
    return emptyGrid;
  };
  
  const [perlerPattern, setPerlerPattern] = useState<string[][]>(initializeEmptyGrid());
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [scale, setScale] = useState(100); // Scale percentage (100% = full size)
  const [separateDimensions, setSeparateDimensions] = useState(false); // Toggle for separate width/height controls
  
  // Editing features
  const [currentTool, setCurrentTool] = useState<EditTool>(EditTool.PAINT);
  const [currentColor, setCurrentColor] = useState('#000000');
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([
    {
      pattern: initializeEmptyGrid(),
      timestamp: Date.now()
    }
  ]);
  const [historyIndex, setHistoryIndex] = useState(0);
  
  // Common bead colors
  const beadColors = [
    '#FFFFFF', '#000000', '#FF0000', '#00FF00', '#0000FF', 
    '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#800080',
    '#008000', '#800000', '#808000', '#008080', '#FFC0CB',
    '#A52A2A', '#FF7F50', '#FFD700', '#808080', '#C0C0C0'
  ];

  // Grid ref for capturing as image
  const gridRef = useRef<HTMLDivElement>(null);

  // Handle grid size changes
  const handleGridSizeChange = (value: number) => {
    if (separateDimensions) return; // Skip if using separate controls
    
    // Calculate new dimensions while maintaining aspect ratio
    const aspectRatio = gridSize.width / gridSize.height;
    
    // Determine if we should adjust based on width or height
    let newWidth, newHeight;
    
    if (aspectRatio >= 1) {
      // Wider than tall, or square
      newWidth = value;
      newHeight = Math.round(value / aspectRatio);
    } else {
      // Taller than wide
      newHeight = value;
      newWidth = Math.round(value * aspectRatio);
    }
    
    // Ensure minimum size
    newWidth = Math.max(5, newWidth);
    newHeight = Math.max(5, newHeight);
    
    const newSize = { width: newWidth, height: newHeight };
    setGridSize(newSize);
    
    // Create a new grid with the new dimensions
    const newGrid: string[][] = [];
    for (let y = 0; y < newSize.height; y++) {
      const row: string[] = [];
      for (let x = 0; x < newSize.width; x++) {
        // Copy existing cells if they exist, otherwise use transparent
        row.push(y < perlerPattern.length && x < perlerPattern[y].length 
          ? perlerPattern[y][x] 
          : 'transparent');
      }
      newGrid.push(row);
    }
    
    setPerlerPattern(newGrid);
    addToHistory(newGrid);
  };
  
  // Handle individual dimension changes
  const handleDimensionChange = (dimension: 'width' | 'height', value: number) => {
    const newSize = { ...gridSize, [dimension]: value };
    setGridSize(newSize);
    
    // Create a new grid with the new dimensions
    const newGrid: string[][] = [];
    for (let y = 0; y < newSize.height; y++) {
      const row: string[] = [];
      for (let x = 0; x < newSize.width; x++) {
        // Copy existing cells if they exist, otherwise use transparent
        row.push(y < perlerPattern.length && x < perlerPattern[y].length 
          ? perlerPattern[y][x] 
          : 'transparent');
      }
      newGrid.push(row);
    }
    
    setPerlerPattern(newGrid);
    addToHistory(newGrid);
  };
  
  // Add pattern to history
  const addToHistory = (pattern: string[][]) => {
    // Create a deep copy of the pattern
    const patternCopy = pattern.map(row => [...row]);
    
    // If we're not at the end of the history, remove future states
    if (historyIndex < history.length - 1) {
      setHistory(history.slice(0, historyIndex + 1));
    }
    
    // Add new history entry
    const newEntry: HistoryEntry = {
      pattern: patternCopy,
      timestamp: Date.now()
    };
    
    setHistory([...history, newEntry]);
    setHistoryIndex(historyIndex + 1);
  };
  
  // Undo
  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setPerlerPattern(JSON.parse(JSON.stringify(history[historyIndex - 1].pattern)));
    }
  };
  
  // Redo
  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setPerlerPattern(JSON.parse(JSON.stringify(history[historyIndex + 1].pattern)));
    }
  };
  
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setImage(dataUrl);
      generatePerlerPattern(dataUrl, scale);
    };
    reader.readAsDataURL(file);
  };
  
  // eslint-disable-next-line
  const handleScaleChange = (event: any) => {
    const newScale = parseInt(event.target.value);
    setScale(newScale);
    if (image) {
      generatePerlerPattern(image, newScale);
    }
  };
  
  const generatePerlerPattern = (imageUrl: string, scalePercent: number) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      // Set canvas size to match our grid
      canvas.width = gridSize.width;
      canvas.height = gridSize.height;
      
      // Clear the canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Calculate scaling and positioning to maintain aspect ratio
      const imgAspectRatio = img.width / img.height;
      const gridAspectRatio = gridSize.width / gridSize.height;
      
      let scaledWidth, scaledHeight;
      
      if (imgAspectRatio > gridAspectRatio) {
        // Image is wider than grid (relative to height)
        scaledWidth = gridSize.width * (scalePercent / 100);
        scaledHeight = scaledWidth / imgAspectRatio;
      } else {
        // Image is taller than grid (relative to width)
        scaledHeight = gridSize.height * (scalePercent / 100);
        scaledWidth = scaledHeight * imgAspectRatio;
      }
      
      // Center the image on the canvas
      const offsetX = (gridSize.width - scaledWidth) / 2;
      const offsetY = (gridSize.height - scaledHeight) / 2;
      
      // Draw the image centered and scaled
      ctx.drawImage(img, offsetX, offsetY, scaledWidth, scaledHeight);
      
      // Get image data for each "pixel" (perler bead)
      const pattern: string[][] = [];
      
      // Initialize with empty (transparent) pixels
      for (let y = 0; y < gridSize.height; y++) {
        const row: string[] = [];
        for (let x = 0; x < gridSize.width; x++) {
          row.push('transparent');
        }
        pattern.push(row);
      }
      
      // Fill in pixels where the image is drawn
      for (let y = 0; y < gridSize.height; y++) {
        for (let x = 0; x < gridSize.width; x++) {
          const pixelData = ctx.getImageData(x, y, 1, 1).data;
          
          // Only add a colored bead if the pixel has some opacity
          if (pixelData[3] > 10) { // Alpha channel > 10 (not fully transparent)
            // Convert RGB to hex color
            const color = rgbToHex(pixelData[0], pixelData[1], pixelData[2]);
            pattern[y][x] = color;
          }
        }
      }
      
      setPerlerPattern(pattern);
      // Add to history
      addToHistory(pattern);
    };
    img.src = imageUrl;
  };
  
  const clearImage = () => {
    setImage(null);
    const emptyGrid = initializeEmptyGrid();
    setPerlerPattern(emptyGrid);
    setHistory([{ pattern: emptyGrid, timestamp: Date.now() }]);
    setHistoryIndex(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  // Add a function to regenerate pattern from the current image
  const regeneratePattern = () => {
    if (image) {
      generatePerlerPattern(image, scale);
    }
  };
  
  // Helper function to convert RGB to hex
  const rgbToHex = (r: number, g: number, b: number): string => {
    return '#' + [r, g, b].map(x => {
      const hex = x.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('');
  };
  
  // Cell interactions
  const handleCellClick = (y: number, x: number) => {
    // Create a copy of the current pattern
    const newPattern = perlerPattern.map(row => [...row]);
    
    switch (currentTool) {
      case EditTool.PAINT:
        newPattern[y][x] = currentColor;
        break;
      case EditTool.ERASE:
        newPattern[y][x] = 'transparent';
        break;
      case EditTool.EYEDROPPER:
        if (perlerPattern[y][x] !== 'transparent') {
          setCurrentColor(perlerPattern[y][x]);
          setCurrentTool(EditTool.PAINT); // Switch back to paint after picking color
        }
        break;
      case EditTool.BUCKET:
        fillArea(newPattern, y, x, perlerPattern[y][x], currentColor);
        break;
      default:
        return;
    }
    
    setPerlerPattern(newPattern);
    addToHistory(newPattern);
  };
  
  // Mouse handlers for dragging paint/erase
  const handleMouseDown = (y: number, x: number) => {
    setIsMouseDown(true);
    handleCellClick(y, x);
  };
  
  const handleMouseUp = () => {
    setIsMouseDown(false);
  };
  
  const handleMouseOver = (y: number, x: number) => {
    if (isMouseDown && (currentTool === EditTool.PAINT || currentTool === EditTool.ERASE)) {
      handleCellClick(y, x);
    }
  };
  
  // Flood fill algorithm for paint bucket
  const fillArea = (pattern: string[][], y: number, x: number, targetColor: string, replacementColor: string) => {
    if (targetColor === replacementColor) return;
    
    const queue: [number, number][] = [];
    queue.push([y, x]);
    
    while (queue.length > 0) {
      const [cy, cx] = queue.shift()!;
      
      if (cy < 0 || cy >= gridSize.height || cx < 0 || cx >= gridSize.width) continue;
      if (pattern[cy][cx] !== targetColor) continue;
      
      pattern[cy][cx] = replacementColor;
      
      // Add adjacent cells to queue (4-way connectivity)
      queue.push([cy + 1, cx]);
      queue.push([cy - 1, cx]);
      queue.push([cy, cx + 1]);
      queue.push([cy, cx - 1]);
    }
  };
  
  useEffect(() => {
    // Add window event listener for mouse up
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  // Export the pegboard as PNG
  const exportAsPNG = () => {
    if (!gridRef.current) return;
    
    // Use html-to-image library functionality
    const grid = gridRef.current;
    
    // Create a canvas element
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas size to match the grid
    const gridRect = grid.getBoundingClientRect();
    canvas.width = gridRect.width;
    canvas.height = gridRect.height;
    
    // Draw a white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw each bead
    const beads = grid.querySelectorAll('[data-bead]');
    beads.forEach((bead) => {
      const beadRect = bead.getBoundingClientRect();
      const color = bead.getAttribute('data-color') || 'transparent';
      
      if (color !== 'transparent') {
        // Calculate relative position
        const x = beadRect.left - gridRect.left;
        const y = beadRect.top - gridRect.top;
        
        // Draw the bead
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(
          x + beadRect.width / 2, 
          y + beadRect.height / 2, 
          beadRect.width / 2, 
          0, 
          Math.PI * 2
        );
        ctx.fill();
        
        // Draw a subtle border
        ctx.strokeStyle = 'rgba(0,0,0,0.2)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    });
    
    // Convert canvas to data URL and trigger download
    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = 'perler-pattern.png';
    link.href = dataUrl;
    link.click();
  };

  // Export the current state as JSON
  const exportAsJSON = () => {
    // Create state object
    const state = {
      gridSize,
      scale,
      perlerPattern,
      hasImage: !!image // Just store a boolean flag instead of the actual image
    };
    
    // Convert to JSON
    const json = JSON.stringify(state, null, 2);
    
    // Create download link
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'perler-pattern.json';
    a.click();
    
    // Clean up
    URL.revokeObjectURL(url);
  };

  // Import configuration from JSON
  const importFromJSON = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const state = JSON.parse(content);
        
        // Check if it's a valid state file
        if (!state.perlerPattern || !state.gridSize) {
          throw new Error('Invalid state file');
        }
        
        // Update state
        setGridSize(state.gridSize);
        setScale(state.scale || 100);
        setPerlerPattern(state.perlerPattern);
        
        // Create a placeholder image if the imported file had an image
        // This enables the regenerate button without actually storing the original image
        if (state.hasImage) {
          // Create a tiny 1x1 pixel transparent image as a placeholder
          const placeholderImg = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
          setImage(placeholderImg);
        } else {
          setImage(null);
        }
        
        // Add to history
        addToHistory(state.perlerPattern);
        
        // Reset history index to 0 (current state)
        setHistoryIndex(0);
        
      } catch (error) {
        console.error('Error importing state:', error);
        alert('Failed to import pattern. The file may be corrupted or in an invalid format.');
      }
    };
    reader.readAsText(file);
  };

  // Reference for import file input
  const importFileRef = useRef<HTMLInputElement>(null);

  return (
    <ThemeProvider theme={theme}>
      <AppContainer>
        <ToolsDrawer variant="persistent" anchor="left" open>
          <DrawerHeader>
            <Typography variant="h4">Tools</Typography>
          </DrawerHeader>
          <Box sx={{ p: 2 }}>
            <Grid2 container spacing={2} sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
              <Grid2 size={3}>
                <ToolButton
                  active={currentTool === EditTool.PAINT}
                  onClick={() => setCurrentTool(EditTool.PAINT)}
                >
                  <BrushIcon />
                </ToolButton>
              </Grid2>
              <Grid2 size={3}>
                <ToolButton
                  active={currentTool === EditTool.ERASE}
                  onClick={() => setCurrentTool(EditTool.ERASE)}
                >
                  <DeleteIcon />
                </ToolButton>
              </Grid2>
              <Grid2 size={3}>
                <ToolButton
                  active={currentTool === EditTool.EYEDROPPER}
                  onClick={() => setCurrentTool(EditTool.EYEDROPPER)}
                >
                  <ColorizeIcon />
                </ToolButton>
              </Grid2>
              <Grid2 size={3}>
                <ToolButton
                  active={currentTool === EditTool.BUCKET}
                  onClick={() => setCurrentTool(EditTool.BUCKET)}
                >
                  <BucketIcon />
                </ToolButton>
              </Grid2>
            </Grid2>
            
            <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>History</Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1 }}>
              <Button 
                variant="outlined"
                onClick={handleUndo}
                disabled={historyIndex <= 0}
              >
                <UndoIcon />
              </Button>
              <Button 
                variant="outlined"
                onClick={handleRedo}
                disabled={historyIndex >= history.length - 1}
              >
                <RedoIcon />
              </Button>
            </Box>
            
            <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>Colors</Typography>
            <CurrentColorDisplay color={currentColor} />
            <ColorGrid>
              {beadColors.map((color, index) => (
                <ColorSwatch 
                  key={index}
                  color={color}
                  selected={color === currentColor}
                  onClick={() => setCurrentColor(color)}
                />
              ))}
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                mt: 2,
                width: '100%'
              }}>
                <Typography variant="body2" sx={{ mb: 1 }}>Custom Color:</Typography>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1,
                  width: '100%'
                }}>
                  <input
                    type="color"
                    id="custom-color"
                    value={currentColor}
                    onChange={(e) => setCurrentColor(e.target.value)}
                    style={{ 
                      width: '40px', 
                      height: '40px', 
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      backgroundColor: 'transparent'
                    }}
                  />
                  <Typography variant="body2" sx={{ ml: 1 }}>{currentColor}</Typography>
                </Box>
              </Box>
            </ColorGrid>
          </Box>
        </ToolsDrawer>
        <MainContent drawerOpen>
          <SectionTitle variant="h1">Perler Pattern Generator</SectionTitle>
          <ControlPanel>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleImageUpload}
              style={{ display: 'none' }}
            />
            <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', gap: 2 }}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <UploadIcon sx={{ mr: 1 }} />
                  Upload Image
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={clearImage}
                >
                  <DeleteIcon sx={{ mr: 1 }} />
                  Clear Grid
                </Button>
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={regeneratePattern}
                  disabled={!image}
                  title={!image ? "Upload an image first" : "Regenerate pattern from image"}
                >
                  <BrushIcon sx={{ mr: 1 }} />
                  Regenerate Pattern
                </Button>
                <FormControlLabel
                  control={
                    <Checkbox 
                      checked={separateDimensions}
                      onChange={(e) => setSeparateDimensions(e.target.checked)}
                      sx={{ 
                        color: theme => theme.palette.primary.main,
                        '&.Mui-checked': {
                          color: theme => theme.palette.primary.main,
                        }
                      }}
                    />
                  }
                  label="Control width and height separately"
                />
              </Box>
              
              <Box sx={{ 
                display: 'flex', 
                flexDirection: { xs: 'column', md: 'row' }, 
                gap: 3, 
                width: '100%',
                p: 2,
                backgroundColor: (theme) => alpha(theme.palette.background.paper, 0.4),
                borderLeft: (theme) => `2px solid ${alpha(theme.palette.primary.main, 0.7)}`
              }}>
                {!separateDimensions ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, flex: 1 }}>
                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>Grid Size:</Typography>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                      <StyledSlider
                        min={5}
                        max={90}
                        value={Math.max(gridSize.width, gridSize.height)}
                        onChange={(_, value) => handleGridSizeChange(value as number)}
                      />
                      <Typography variant="body1" sx={{ minWidth: 80 }}>{gridSize.width}×{gridSize.height}</Typography>
                    </Box>
                  </Box>
                ) : (
                  <>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, flex: 1 }}>
                      <Typography variant="body1" sx={{ fontWeight: 'bold' }}>Grid Width:</Typography>
                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        <StyledSlider
                          min={5}
                          max={50}
                          value={gridSize.width}
                          onChange={(_, value) => handleDimensionChange('width', value as number)}
                        />
                        <Typography variant="body1" sx={{ minWidth: 40 }}>{gridSize.width}</Typography>
                      </Box>
                    </Box>
                    
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, flex: 1 }}>
                      <Typography variant="body1" sx={{ fontWeight: 'bold' }}>Grid Height:</Typography>
                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        <StyledSlider
                          min={5}
                          max={50}
                          value={gridSize.height}
                          onChange={(_, value) => handleDimensionChange('height', value as number)}
                        />
                        <Typography variant="body1" sx={{ minWidth: 40 }}>{gridSize.height}</Typography>
                      </Box>
                    </Box>
                  </>
                )}
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, flex: 1 }}>
                  <Typography variant="body1" sx={{ fontWeight: 'bold' }}>Image Scale:</Typography>
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <StyledSlider
                      min={10}
                      max={200}
                      value={scale}
                      onChange={handleScaleChange}
                    />
                    <Typography variant="body1" sx={{ minWidth: 40 }}>{scale}%</Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
          </ControlPanel>
          <PegboardContainer>
            <PegboardGrid
              ref={gridRef}
              sx={{
                gridTemplateColumns: `repeat(${gridSize.width}, 1fr)`,
                gridTemplateRows: `repeat(${gridSize.height}, 1fr)`,
                width: 'fit-content',
                height: 'fit-content',
              }}
            >
              {perlerPattern.map((row, y) => (
                row.map((color, x) => (
                  <Box
                    key={`${y}-${x}`}
                    data-bead="true"
                    data-color={color}
                    sx={{
                      backgroundColor: color !== 'transparent' ? color : '#f9f9f9',
                      border: color !== 'transparent' ? '1px solid rgba(0,0,0,0.1)' : '1px solid #ccc',
                      borderRadius: '50%',
                      boxShadow: color !== 'transparent' ? 'inset 0 0 5px rgba(0,0,0,0.1)' : 'none',
                      aspectRatio: '1/1',
                      width: 20,
                      height: 20,
                    }}
                    onMouseDown={() => handleMouseDown(y, x)}
                    onMouseOver={() => handleMouseOver(y, x)}
                  />
                ))
              ))}
            </PegboardGrid>
            
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'flex-end', 
              gap: 2, 
              mt: 2,
              borderTop: (theme) => `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
              pt: 2
            }}>
              <input
                type="file"
                accept=".json"
                ref={importFileRef}
                style={{ display: 'none' }}
                onChange={importFromJSON}
              />
              <Button
                variant="outlined"
                color="primary"
                onClick={() => importFileRef.current?.click()}
                startIcon={<ImportExportIcon />}
              >
                Import
              </Button>
              <Button
                variant="outlined"
                color="primary"
                onClick={exportAsJSON}
                startIcon={<SaveIcon />}
              >
                Export JSON
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={exportAsPNG}
                startIcon={<DownloadIcon />}
              >
                Download PNG
              </Button>
            </Box>
          </PegboardContainer>
          {image && (
            <OriginalImageContainer>
              <SectionTitle variant="h3">Original Image</SectionTitle>
              <img src={image} alt="Uploaded" />
            </OriginalImageContainer>
          )}
        </MainContent>
      </AppContainer>
    </ThemeProvider>
  );
}

export default App;
