import React from 'react';
import { CircularProgress, Box } from '@mui/material';



export const Loader = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <img src="/images/tadimex.png" alt="Tadimex Logo" style={{ marginBottom: 20, width:'100px' }} />
      <CircularProgress size={60} />
    </Box>
  );
};

export default Loader;