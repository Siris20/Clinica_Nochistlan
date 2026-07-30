import React from "react";
import { Box, Typography, Container, Button } from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

export const Services = () => {
  const services = [
    {
      id: 1,
      title: "Consultas Médicas y Especialidades",
      description:
        "Ofrecemos atención médica integral con un equipo de especialistas dedicados a la prevención, diagnóstico y tratamiento oportuno de diversas condiciones de salud. Contamos con consulta general, pediatría, ginecología y medicina interna.",
      image: "/images/consulta_medica.webp", // Asegúrate de contar con imágenes alusivas a la clínica
      imageAlt: "Consulta Médica en Clínica Nochistlán",
      backgroundColor: "#f8fafc",
      textBackground: "#ffffff",
    },
    {
      id: 2,
      title: "Atención de Urgencias 24/7",
      description:
        "Nuestro servicio de urgencias está preparado para atender eventualidades y situaciones críticas a cualquier hora del día. Ofrecemos estabilización inmediata, curaciones y monitoreo continuo con personal altamente capacitado.",
      image: "/images/urgencia_medica.webp",
      imageAlt: "Atención de Urgencias",
      backgroundColor: "#ffffff",
      textBackground: "#f1f5f9",
    },
    {
      id: 3,
      title: "Hospitalización y Quirófano",
      description:
        "Disponemos de habitaciones confortables y seguras para la recuperación de nuestros pacientes, así como un área quirúrgica equipada con tecnología moderna para procedimientos programados y de emergencia.",
      image: "/images/quirofano_hospital.webp",
      imageAlt: "Quirófano e Instalaciones",
      backgroundColor: "#f8fafc",
      textBackground: "#ffffff",
    },
  ];

  return (
    <>
      {/* Título Principal de la Sección */}
      <Box
        component="section"
        id="services"
        sx={{
          backgroundColor: "#f8fafc",
          width: "100%",
          py: { xs: 8, md: 10 },
          borderBottom: "1px solid #e2e8f0",
        }}
      >
        <Container maxWidth="lg" sx={{ textAlign: "center" }}>
          <Typography
            variant="h2"
            component="h2"
            sx={{
              color: "#1e40af", // Azul principal
              fontWeight: 800,
              fontSize: { xs: "2rem", sm: "2.5rem", md: "3rem" },
              mb: 1.5,
              letterSpacing: "-0.02em",
            }}
          >
            Nuestros Servicios
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: "#475569",
              maxWidth: "700px",
              mx: "auto",
              fontSize: { xs: "1rem", sm: "1.1rem" },
              mb: 3,
            }}
          >
            Conoce las áreas de atención médica y especializada que ponemos a
            disposición para el cuidado y salud de tu familia en Nochistlán.
          </Typography>
          <Box
            sx={{
              width: "60px",
              height: "4px",
              backgroundColor: "#00a884", // Verde turquesa de acento
              mx: "auto",
              borderRadius: "2px",
            }}
          />
        </Container>
      </Box>

      {/* Bloques de Servicios Alternados */}
      {services.map((service) => {
        const isEven = service.id % 2 === 0;

        return (
          <Box
            key={service.id}
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              minHeight: "450px",
              backgroundColor: service.backgroundColor,
              borderBottom: "1px solid #e2e8f0",
            }}
          >
            {/* Sección de Imagen */}
            <Box
              sx={{
                flex: { xs: "1", md: "0 0 50%" },
                position: "relative",
                minHeight: { xs: "280px", md: "450px" },
                order: {
                  xs: 1,
                  md: isEven ? 2 : 1,
                },
                overflow: "hidden",
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
                  objectPosition: "center",
                }}
              />
            </Box>

            {/* Sección de Texto */}
            <Box
              sx={{
                flex: { xs: "1", md: "0 0 50%" },
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "flex-start",
                padding: { xs: "2.5rem 1.5rem", md: "4rem 5rem" },
                backgroundColor: service.textBackground,
                order: {
                  xs: 2,
                  md: isEven ? 1 : 2,
                },
              }}
            >
              <Typography
                variant="h4"
                component="h3"
                sx={{
                  fontWeight: 700,
                  mb: 2,
                  color: "#1e40af",
                  fontSize: { xs: "1.5rem", md: "2rem" },
                  letterSpacing: "-0.01em",
                }}
              >
                {service.title}
              </Typography>

              <Typography
                variant="body1"
                sx={{
                  color: "#475569",
                  lineHeight: 1.8,
                  fontSize: { xs: "0.95rem", md: "1.05rem" },
                  mb: 3,
                }}
              >
                {service.description}
              </Typography>

              {/* Detalle visual de separación / Acción opcional */}
              <Box
                sx={{
                  width: "50px",
                  height: "3px",
                  backgroundColor: "#00a884",
                  borderRadius: "2px",
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