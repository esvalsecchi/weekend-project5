import React from 'react';
import { CircularProgress, Box, Typography } from '@mui/material';

const LoadingModal = () => {
  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 1300, // Z-index alto para que se muestre encima de otros elementos
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <CircularProgress size={60} thickness={5} />
        <Typography mt={2} color="white" variant="h6">
          Loading...
        </Typography>
      </Box>
    </Box>
  );
};

export default LoadingModal;