import React from 'react';
import { Box, Typography, Container } from '@mui/material';

function About() {
  return (
    <Box
      component="section"
      id="about"
      sx={{
        backgroundColor: '#0B1426',
        width: '100%',
        minHeight: '50vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: { xs: 6, md: 10 },
        position: 'relative',
        overflow: 'hidden',
        margin: 0,
        padding: 0,
        boxSizing: 'border-box'
      }}
    >
      <Container 
        maxWidth="lg" 
        sx={{ 
          position: 'relative', 
          zIndex: 2,
          textAlign: 'center'
        }}
      >
        <Typography
          variant="h2"
          component="h1"
          sx={{
            color: 'white',
            fontWeight: 700,
            fontSize: { xs: '2rem', sm: '2.5rem', md: '3.5rem' },
            mb: 4,
            textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
            letterSpacing: '0.02em'
          }}
        >
          ¿Quiénes somos?
        </Typography>
        
        <Typography
          variant="h6"
          component="h4"
          sx={{
            color: 'white',
            fontWeight: 400,
            fontSize: { xs: '1.1rem', sm: '1.3rem', md: '1.3rem' },
            lineHeight: 1.6,
            maxWidth: '900px',
            mx: 'auto',
            textShadow: '1px 1px 2px rgba(0,0,0,0.2)',
            px: { xs: 2, sm: 0 }
          }}
        >
          Tadimex Prueba de que docker actualiza automaticamente al hacer cambios en local y prueba para ver si entendi los branches
        </Typography>
        
        {/* Decorative elements */}
        <Box
          sx={{
            position: 'absolute',
            top: '20%',
            right: '10%',
            width: '100px',
            height: '100px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.1)',
            display: { xs: 'none', md: 'block' }
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: '20%',
            left: '15%',
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.08)',
            display: { xs: 'none', md: 'block' }
          }}
        />
      </Container>
    </Box>
  );
}

export default About;
