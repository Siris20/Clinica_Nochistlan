import React from 'react';
import { Box, Typography, Container, Paper, Grid } from '@mui/material';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import SecurityIcon from '@mui/icons-material/Security';
import FavoriteIcon from '@mui/icons-material/Favorite';

function About() {
  return (
    <Box
      component="section"
      id="about"
      sx={{
        backgroundColor: '#f8fafc', // Fondo claro/médico muy suave
        width: '100%',
        minHeight: '60vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: { xs: 8, md: 12 },
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Container maxWidth="lg">
        {/* Encabezado */}
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography
            variant="h2"
            component="h2"
            sx={{
              color: '#1e40af', // Azul principal
              fontWeight: 800,
              fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
              mb: 1.5,
              letterSpacing: '-0.02em',
            }}
          >
            ¿Quiénes somos?
          </Typography>
          <Box
            sx={{
              width: '60px',
              height: '4px',
              backgroundColor: '#00a884', // Verde turquesa de acento
              mx: 'auto',
              borderRadius: '2px',
            }}
          />
        </Box>

        {/* Tarjeta de contenido */}
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, sm: 5, md: 6 },
            borderRadius: '16px',
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.05)',
          }}
        >
          <Typography
            variant="body1"
            sx={{
              color: '#334155',
              fontWeight: 400,
              fontSize: { xs: '1rem', sm: '1.125rem' },
              lineHeight: 1.8,
              textAlign: 'center',
              maxWidth: '900px',
              mx: 'auto',
              mb: 4,
            }}
          >
            En <strong>Clínica Nochistlán</strong> nos enorgullece ser un centro médico
            de referencia ubicado en el municipio de <strong>Nochistlán de Mejía, Zacatecas</strong>.
            Brindamos atención de salud integral, consultas con especialistas y servicios
            de urgencias, orientados siempre por la calidez humana, la ética y el compromiso
            con la vida.
          </Typography>

          <Typography
            variant="body1"
            sx={{
              color: '#475569',
              fontWeight: 400,
              fontSize: { xs: '0.95rem', sm: '1.05rem' },
              lineHeight: 1.8,
              textAlign: 'center',
              maxWidth: '850px',
              mx: 'auto',
              mb: 6,
            }}
          >
            Contamos con instalaciones modernas y equipamiento tecnológico diseñado para
            brindar diagnósticos oportunos y tratamientos efectivos a toda la comunidad
            nochistlense y zonas conurbadas.
          </Typography>

          {/* Tres Pilares Destacados */}
          <Grid container spacing={3} sx={{ pt: 2 }}>
            <Grid item xs={12} md={4}>
              <Box
                sx={{
                  textAlign: 'center',
                  p: 2,
                  borderRadius: '12px',
                  backgroundColor: '#f1f5f9',
                }}
              >
                <LocalHospitalIcon sx={{ fontSize: 40, color: '#00a884', mb: 1 }} />
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e40af', mb: 0.5 }}>
                  Instalaciones Equipadas
                </Typography>
                <Typography variant="body2" sx={{ color: '#64748b' }}>
                  Espacios preparados para ofrecer atención médica segura y confortable.
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} md={4}>
              <Box
                sx={{
                  textAlign: 'center',
                  p: 2,
                  borderRadius: '12px',
                  backgroundColor: '#f1f5f9',
                }}
              >
                <FavoriteIcon sx={{ fontSize: 40, color: '#00a884', mb: 1 }} />
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e40af', mb: 0.5 }}>
                  Trato Humano
                </Typography>
                <Typography variant="body2" sx={{ color: '#64748b' }}>
                  Atención dedicada y empática para el bienestar de cada paciente.
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} md={4}>
              <Box
                sx={{
                  textAlign: 'center',
                  p: 2,
                  borderRadius: '12px',
                  backgroundColor: '#f1f5f9',
                }}
              >
                <SecurityIcon sx={{ fontSize: 40, color: '#00a884', mb: 1 }} />
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e40af', mb: 0.5 }}>
                  Confianza y Salud
                </Typography>
                <Typography variant="body2" sx={{ color: '#64748b' }}>
                  Especialistas comprometidos con brindar respuestas diagnósticas precisas.
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Container>
    </Box>
  );
}

export default About;