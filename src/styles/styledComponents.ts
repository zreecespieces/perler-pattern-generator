import { styled, alpha } from '@mui/material/styles';
import { Box, Paper, Typography, Button, Drawer, Slider } from '@mui/material';

// Main container for the app
export const AppContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  minHeight: '100vh',
  backgroundColor: theme.palette.background.default,
  background: `linear-gradient(135deg, ${alpha(theme.palette.background.default, 0.9)} 0%, ${alpha('#000000', 0.97)} 100%)`,
  color: theme.palette.text.primary,
  fontFamily: theme.typography.fontFamily,
}));

// Drawer component for tools
export const ToolsDrawer = styled(Drawer)(({ theme }) => ({
  width: 240,
  flexShrink: 0,
  '& .MuiDrawer-paper': {
    width: 240,
    boxSizing: 'border-box',
    backgroundColor: alpha(theme.palette.background.paper, 0.7),
    backdropFilter: 'blur(8px)',
    borderRight: `1px solid ${alpha(theme.palette.primary.main, 0.25)}`,
  },
}));

// Drawer header
export const DrawerHeader = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1, 2),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.25)}`,
}));

// Main content area
export const MainContent = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'drawerOpen',
})<{ drawerOpen: boolean }>(({ theme }) => ({
  padding: theme.spacing(3),
  marginLeft: 0,
  transition: theme.transitions.create('margin', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(3),
}));

// Section title
export const SectionTitle = styled(Typography)(({ theme }) => ({
  borderBottom: `2px solid ${alpha(theme.palette.primary.main, 0.5)}`,
  paddingBottom: theme.spacing(1),
  position: 'relative',
  '&::after': {
    content: '""',
    position: 'absolute',
    left: 0,
    bottom: -2,
    width: '50px',
    height: '2px',
    backgroundColor: theme.palette.secondary.main,
  },
}));

// Control panel
export const ControlPanel = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
  backgroundColor: alpha(theme.palette.background.paper, 0.5),
  backdropFilter: 'blur(4px)',
  borderRadius: 0,
  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
  overflow: 'hidden', // Prevent content overflow
  maxWidth: '100%', // Ensure it doesn't exceed parent width
  boxSizing: 'border-box', // Include padding in width calculation
}));

// Tool button
export const ToolButton = styled(Button, {
  shouldForwardProp: (prop) => prop !== 'active',
})<{ active?: boolean }>(({ theme, active }) => ({
  margin: theme.spacing(0.5),
  padding: theme.spacing(1),
  minWidth: 0,
  width: 40,
  height: 40,
  backgroundColor: active ? alpha(theme.palette.primary.main, 0.3) : 'transparent',
  border: active ? `1px solid ${theme.palette.primary.main}` : `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.2),
  },
}));

// Pegboard container
export const PegboardContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  overflow: 'auto',
  backgroundColor: alpha(theme.palette.background.paper, 0.5),
  backdropFilter: 'blur(4px)',
  borderRadius: 0,
  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
  maxHeight: '925px',
  width: '100%',
  boxSizing: 'border-box',
}));

// Pegboard grid
export const PegboardGrid = styled(Box)(({ theme }) => ({
  gap: 1,
  backgroundColor: alpha('#ffffff', 0.05),
  padding: theme.spacing(2),
  boxShadow: `0 0 10px ${alpha(theme.palette.primary.main, 0.2)}`,
  border: `1px solid ${alpha('#ffffff', 0.1)}`,
}));

// Original image container
export const OriginalImageContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  backgroundColor: alpha(theme.palette.background.paper, 0.5),
  backdropFilter: 'blur(4px)',
  borderRadius: 0,
  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
  '& img': {
    maxWidth: '100%',
    maxHeight: '300px',
    objectFit: 'contain',
    marginTop: theme.spacing(2),
    border: `1px solid ${alpha('#ffffff', 0.1)}`,
  },
}));

// Styled slider
export const StyledSlider = styled(Slider)(({ theme }) => ({
  color: theme.palette.primary.main,
  height: 8,
  width: '100%', // Ensure the slider takes the appropriate width
  '& .MuiSlider-track': {
    border: 'none',
    boxShadow: `0 0 6px ${theme.palette.primary.main}`,
  },
  '& .MuiSlider-thumb': {
    height: 20,
    width: 20,
    backgroundColor: theme.palette.background.paper,
    border: `2px solid ${theme.palette.primary.main}`,
    boxShadow: `0 0 8px ${theme.palette.primary.main}`,
    '&:focus, &:hover, &.Mui-active, &.Mui-focusVisible': {
      boxShadow: `0 0 12px ${theme.palette.primary.main}`,
    },
    '&::before': {
      display: 'none',
    },
  },
  '& .MuiSlider-valueLabel': {
    backgroundColor: theme.palette.primary.main,
  },
}));

// Color grid
export const ColorGrid = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  gap: 4,
  justifyContent: 'center',
  maxWidth: '100%',
  padding: theme.spacing(1),
  backgroundColor: alpha(theme.palette.background.paper, 0.3),
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
}));
