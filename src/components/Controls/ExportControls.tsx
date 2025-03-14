import React from 'react';
import { Box, Button } from '@mui/material';
import ImportExportIcon from '@mui/icons-material/ImportExport';
import SaveIcon from '@mui/icons-material/Save';
import DownloadIcon from '@mui/icons-material/Download';

interface ExportControlsProps {
  onExportPng: () => void;
  onExportJson: () => void;
  onImportClick: () => void;
}

const ExportControls: React.FC<ExportControlsProps> = ({
  onExportPng,
  onExportJson,
  onImportClick
}) => {
  return (
    <Box sx={{ 
      display: 'flex', 
      justifyContent: 'flex-end', 
      gap: 2, 
      mt: 2,
      borderTop: (theme) => `1px solid ${theme.palette.primary.main}30`,
      pt: 2
    }}>
      <Button
        variant="outlined"
        color="primary"
        onClick={onImportClick}
        startIcon={<ImportExportIcon />}
      >
        Import Pattern Data
      </Button>
      <Button
        variant="outlined"
        color="primary"
        onClick={onExportJson}
        startIcon={<SaveIcon />}
      >
        Save Pattern Data
      </Button>
      <Button
        variant="contained"
        color="primary"
        onClick={onExportPng}
        startIcon={<DownloadIcon />}
      >
        Download Image
      </Button>
    </Box>
  );
};

export default ExportControls;
