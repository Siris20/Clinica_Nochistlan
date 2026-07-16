import React from "react";
import { Box, Typography, Container } from "@mui/material";

export const  Services = () => {
  const services = [
    {
      id: 1,
      title: "Posicionamiento SEO",
      description: "La agencia desarrolla un software para conectar mejor con personas que buscan productos similares a los de sus clientes y lo que hace este sistema es la optimización para motores de búsqueda a este sistema le llamaron Tuwe, el algoritmo busca fragmentos enriquecidos con palabras claves que podrían ayudar aumentar la visibilidad del sitio Web y generando las mejores recomendaciones que logren que más clientes se interesen por sus productos o servicios vistos en su sitio web",
      image: "/images/posicionamiento_seo.png",
      imageAlt: "Posicionamiento SEO",
      backgroundColor: "#f8f9fa",
      textBackground: "white"
    },
    {
      id: 2,
      title: "Visuales en Alta Calidad",
      description: "La agencia se encarga de diseñar, planificar, ejecutar y evaluar estrategias comunicativas cuyo objetivo principal es la mejora de la imagen y la reputación de una empresa y establecer relaciones a largo plazo con sus clientes.",
      image: "/images/visuales_alta_calidad.png",
      imageAlt: "Visuales en Alta Calidad",
      backgroundColor: "#ffffff",
      textBackground: "#f5f5f5"
    },
    {
      id: 3,
      title: "Relaciones Públicas",
      description: "Nos especializamos en desarrollar infraestructuras funcionales y sostenibles que se adaptan a las necesidades específicas de tu empresa. Construir espacios eficientes no solo mejora tu operación, sino que también contribuye al desarrollo sostenible.",
      image: "/images/relaciones_publicas.png",
      imageAlt: "Relaciones Públicas",
      backgroundColor: "#f8f9fa",
      textBackground: "white"
    },
  ];

  return (
    <>
      {/* Título principal */}
      <Box
        component="section"
        id="services"
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
            Nuestros Servicios
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

      {/* Servicios */}
      {services.map((service) => {
        const isEven = service.id % 2 === 0;
        
        return (
          <Box
            key={service.id}
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              minHeight: "500px",
              backgroundColor: service.backgroundColor,
            }}
          >
            {/* Sección de imagen */}
            <Box
              sx={{
                flex: { xs: "1", md: "0 0 60%" },
                position: "relative",
                minHeight: { xs: "300px", md: "500px" },
                order: { 
                  xs: 1, 
                  md: isEven ? 2 : 1 
                },
                overflow: "hidden",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <img
                src={service.image}
                title={service.imageAlt}
                alt={service.imageAlt}
                style={{ 
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  objectPosition: "center"
                }}
              />
            </Box>

            {/* Sección de texto */}
            <Box
              sx={{
                flex: { xs: "1", md: "0 0 40%" },
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "flex-start",
                padding: { xs: "2rem", md: "3rem" },
                backgroundColor: service.textBackground,
                order: { 
                  xs: 2, 
                  md: isEven ? 1 : 2 
                },
              }}
            >
              <Typography
                variant="h4"
                component="h3"
                sx={{
                  fontWeight: "bold",
                  mb: 2,
                  color: "#092A40",
                  fontSize: { xs: "1.5rem", md: "2rem" },
                }}
              >
                {service.title}
              </Typography>

              <Typography
                variant="body1"
                sx={{
                  color: "#6B7280",
                  lineHeight: 1.8,
                  fontSize: { xs: "0.9rem", md: "1rem" },
                  textAlign: "justify",
                  mb: 2,
                }}
              >
                {service.description}
              </Typography>
              <Box
                sx={{
                  mt: 4,
                  width: "60px",
                  height: "4px",
                  backgroundColor: "#E53E3E",
                }}
              />
            </Box>
          </Box>
        );
      })}
    </>
  );
};

export default Services;