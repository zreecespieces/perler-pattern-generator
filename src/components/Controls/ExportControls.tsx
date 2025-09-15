import React from 'react';
import { Button, Stack, useMediaQuery } from '@mui/material';
import ImportExportIcon from '@mui/icons-material/ImportExport';
import SaveIcon from '@mui/icons-material/Save';
import DownloadIcon from '@mui/icons-material/Download';
import MenuIcon from '@mui/icons-material/Menu';

interface ExportControlsProps {
  onExportPng: () => void;
  onExportJson: () => void;
  onImportClick: () => void;
  onOpenTools?: () => void;
}

const ExportControls: React.FC<ExportControlsProps> = ({ onExportPng, onExportJson, onImportClick, onOpenTools }) => {
  const isMobile = useMediaQuery(theme => theme.breakpoints.down('md'));
  return (
    <Stack direction={{ xs: 'column', md: 'row' }} sx={{ 
      justifyContent: 'flex-end', 
      gap: 2, 
      mt: 2,
      width: isMobile ? '100%' : 'fit-content',
      borderTop: (theme) => `1px solid ${theme.palette.primary.main}30`,
      pt: 2
    }}>
      {isMobile && (
        <Button
          variant="outlined"
          color="primary"
          fullWidth
          onClick={onOpenTools}
          startIcon={<MenuIcon />}
        >
          Open Tools
        </Button>
      )}
      <Button
        variant="outlined"
        color="primary"
        fullWidth={isMobile}
        onClick={onImportClick}
        startIcon={<ImportExportIcon />}
      >
        Import Pattern Data
      </Button>
      <Button
        variant="outlined"
        color="primary"
        fullWidth={isMobile}
        onClick={onExportJson}
        startIcon={<SaveIcon />}
      >
        Save Pattern Data
      </Button>
      <Button
        variant="contained"
        color="primary"
        fullWidth={isMobile}
        onClick={onExportPng}
        startIcon={<DownloadIcon />}
      >
        Download Image
      </Button>
    </Stack>
  );
};

export default ExportControls;
