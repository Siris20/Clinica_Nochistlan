import React from 'react';
import { Grid, Card, Box, Skeleton } from '@mui/material';

const LogoCardSkeleton = () => (
  <Card
    sx={{
      width: "100%",
      height: 200,
      display: "flex",
      flexDirection: "column",
    }}
  >
    <Box
      sx={{
        position: "relative",
        height: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 2,
      }}
    >
      <Skeleton 
        variant="rectangular"
        width="80%"
        height="80%"
        animation="wave"
      />
    </Box>
    <Box
      sx={{
        flexGrow: 1,
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        py: 1,
        px: 2,
      }}
    >
      <Skeleton
        variant="text"
        width="60%"
        height={24}
        animation="wave"
      />
      <Skeleton
        variant="circular"
        width={24}
        height={24}
        animation="wave"
      />
    </Box>
  </Card>
);

export const LogosSkeletonLoader = () => {
  return (
    <Grid
      container
      spacing={2}
      sx={{
        padding: 2,
        "& .MuiGrid-item": {
          minWidth: {
            xs: "100%",
            sm: "50%",
            md: "33.33%",
            lg: "20%",
          },
        },
      }}
    >
      {[...Array(5)].map((_, index) => (
        <Grid item key={index}>
          <LogoCardSkeleton />
        </Grid>
      ))}
    </Grid>
  );
};