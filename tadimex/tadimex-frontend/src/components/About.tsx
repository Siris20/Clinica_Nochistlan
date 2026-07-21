import React from 'react';
import { Box, Typography, Container } from '@mui/material';

function About() {
  return (
    <Box
      component="section"
      id="about"
      sx={{
        backgroundColor: '#0D3B66', // Azul Clínico Profundo
        width: '100%',
        minHeight: '60vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: { xs: 8, md: 12 },
        position: 'relative',
        overflow: 'hidden',
        margin: 0,
        padding: 0,
        boxSizing: 'border-box'
      }}
    >
      <Container 
        maxWidth="md" // Cambiado a 'md' para una lectura más cómoda de los textos largos
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
            fontWeight: 800,
            fontSize: { xs: '2.2rem', sm: '2.8rem', md: '3.5rem' },
            mb: 5,
            textShadow: '2px 2px 4px rgba(0,0,0,0.15)',
            letterSpacing: '0.01em',
            position: 'relative',
            display: 'inline-block',
            // Línea decorativa inferior en verde menta
            '&::after': {
              content: '""',
              display: 'block',
              width: '60px',
              height: '4px',
              backgroundColor: '#00A896', 
              margin: '16px auto 0 auto',
              borderRadius: '2px'
            }
          }}
        >
          ¿Quiénes somos?
        </Typography>
        
        {/* Párrafos de texto con excelente legibilidad */}
        <Box 
          sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: 3,
            px: { xs: 1, sm: 3 }
          }}
        >
          <Typography
            variant="body1"
            sx={{
              color: '#F4F7F6',
              fontWeight: 400,
              fontSize: { xs: '1rem', sm: '1.15rem', md: '1.2rem' },
              lineHeight: 1.8,
              textAlign: 'justify',
              textShadow: '1px 1px 2px rgba(0,0,0,0.1)'
            }}
          >
            En <b>Clínica Nochistlán</b> somos una institución privada comprometida con el cuidado de la salud y el bienestar de nuestros 
            pacientes. Nuestro propósito es brindar atención médica integral, oportuna y de calidad, respaldada por un equipo de profesionales 
            altamente capacitados, tecnología moderna e instalaciones diseñadas para ofrecer comodidad y seguridad.
          </Typography>

          <Typography
            variant="body1"
            sx={{
              color: '#F4F7F6',
              fontWeight: 400,
              fontSize: { xs: '1rem', sm: '1.15rem', md: '1.2rem' },
              lineHeight: 1.8,
              textAlign: 'justify',
              textShadow: '1px 1px 2px rgba(0,0,0,0.1)'
            }}
          >
            Creemos que cada paciente merece una atención personalizada, basada en el respeto, la empatía y la confianza. Por ello, trabajamos 
            diariamente para ofrecer servicios médicos eficientes, diagnósticos precisos y tratamientos enfocados en mejorar la calidad de vida 
            de quienes depositan su confianza en nosotros.
          </Typography>

          <Typography
            variant="body1"
            sx={{
              color: '#F4F7F6',
              fontWeight: 400,
              fontSize: { xs: '1rem', sm: '1.15rem', md: '1.2rem' },
              lineHeight: 1.8,
              textAlign: 'justify',
              textShadow: '1px 1px 2px rgba(0,0,0,0.1)'
            }}
          >
            En <b>Clínica Nochistlán</b> nos distinguimos por nuestro compromiso con la excelencia, la innovación y la mejora 
            continua, manteniendo siempre al paciente y su familia como el centro de cada una de nuestras acciones. Nuestro objetivo es 
            convertirnos en un referente de atención médica privada en la región, ofreciendo un servicio humano, ético y profesional que 
            contribuya al bienestar de nuestra comunidad.
          </Typography>
        </Box>
        
        {/* Elementos decorativos esféricos con tonos de salud (Verde Menta / Teal) */}
        <Box
          sx={{
            position: 'absolute',
            top: '-10%',
            right: '-5%',
            width: '180px',
            height: '180px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(0, 168, 150, 0.15) 0%, rgba(0, 168, 150, 0) 70%)',
            display: { xs: 'none', md: 'block' }
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: '-15%',
            left: '-8%',
            width: '140px',
            height: '140px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(0, 168, 150, 0.12) 0%, rgba(0, 168, 150, 0) 70%)',
            display: { xs: 'none', md: 'block' }
          }}
        />
      </Container>
    </Box>
  );
}

export default About;