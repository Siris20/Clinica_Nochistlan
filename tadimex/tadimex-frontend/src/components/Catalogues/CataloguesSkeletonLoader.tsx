import React from 'react';
import { Grid, Card, Box, Skeleton } from '@mui/material';

const DepartmentCardSkeleton = () => (
  <Card
    sx={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      overflow: 'hidden',
      background: 'linear-gradient(135deg, #ffffff 0%, #f5f5f5 100%)',
    }}
  >
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '4px',
        background: 'linear-gradient(90deg, #f44ecf 0%, #f44ecf 100%)',
        opacity: 0.3
      }}
    />
    <Box sx={{ p: 2, position: 'relative', zIndex: 1 }}>
      <Skeleton 
        variant="text"
        width="70%"
        height={32}
        sx={{ mb: 1 }}
        animation="wave"
      />
      <Skeleton 
        variant="text"
        width="100%"
        height={20}
        animation="wave"
      />
      <Skeleton 
        variant="text"
        width="90%"
        height={20}
        animation="wave"
      />
    </Box>
  </Card>
);

export const CataloguesSkeletonLoader = () => {
  return (
    <Grid container spacing={3} sx={{ py: 4 }}>
      {[...Array(8)].map((_, index) => (
        <Grid item xs={12} md={6} lg={3} key={index}>
          <DepartmentCardSkeleton />
        </Grid>
      ))}
    </Grid>
  );
};
