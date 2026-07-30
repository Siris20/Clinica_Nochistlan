import React from "react";
import { Box, Container, Grid, Typography, Link } from "@mui/material";
import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import { WhatsApp } from "@mui/icons-material";

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <Box
      sx={{
        backgroundColor: "#ffffff", // Fondo blanco
        color: "#1e293b",
        pt: 5,
        pb: 3,
        marginTop: "auto",
        borderTop: "2px solid #e2e8f0", // Separador sutil
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Columna 1: Sobre Nosotros */}
          <Grid item xs={12} md={5}>
            <Typography
              variant="h6"
              gutterBottom
              sx={{
                fontWeight: "700",
                fontSize: "1.1rem",
                mb: 2,
                color: "#1e40af", // Azul Principal
                textAlign: { xs: "center", md: "left" },
              }}
            >
              Sobre Nosotros
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: "#475569",
                lineHeight: 1.6,
                fontSize: "0.875rem",
                mb: 2,
                textAlign: { xs: "center", md: "left" },
              }}
            >
              En Clínica Nochistlán nos dedicamos a ofrecer atención médica
              privada con calidad, profesionalismo y un trato humano. Nuestro
              equipo de especialistas, apoyado por tecnología moderna e
              instalaciones seguras, trabaja para brindar soluciones integrales
              que promuevan la salud y el bienestar de nuestros pacientes.
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: "#475569",
                lineHeight: 1.6,
                fontSize: "0.875rem",
                textAlign: { xs: "center", md: "left" },
              }}
            >
              Nos distinguimos por la excelencia, la innovación y el compromiso
              con cada persona que deposita su confianza en nosotros.
            </Typography>
          </Grid>

          {/* Columna 2: Enlaces Útiles */}
          <Grid item xs={12} md={3}>
            <Typography
              variant="h6"
              gutterBottom
              sx={{
                fontWeight: "700",
                fontSize: "1.1rem",
                mb: 2,
                color: "#1e40af", // Azul Principal
                textAlign: { xs: "center", md: "left" },
              }}
            >
              Enlaces Útiles
            </Typography>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 1.5,
                alignItems: { xs: "center", md: "flex-start" },
              }}
            >
              {["Inicio", "Servicios", "Contacto"].map((item) => (
                <Link
                  key={item}
                  href="#"
                  variant="body2"
                  underline="none"
                  sx={{
                    color: "#475569",
                    fontSize: "0.9rem",
                    transition: "color 0.2s",
                    "&:hover": { color: "#2563eb", fontWeight: "600" }, // Azul CTA al hacer hover
                  }}
                >
                  {item}
                </Link>
              ))}
            </Box>
          </Grid>

          {/* Columna 3: Contacto y Redes */}
          <Grid item xs={12} md={4}>
            <Typography
              variant="h6"
              gutterBottom
              sx={{
                fontWeight: "700",
                fontSize: "1.1rem",
                mb: 2,
                color: "#1e40af", // Azul Principal
                textAlign: { xs: "center", md: "left" },
              }}
            >
              Contacto y Redes
            </Typography>

            {/* Datos de contacto actualizados para Clínica Nochistlán */}
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 1.5,
                mb: 3,
                alignItems: { xs: "center", md: "flex-start" },
              }}
            >
              {/* Teléfono */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <PhoneIcon sx={{ fontSize: 18, color: "#2563eb" }} />
                <Typography
                  variant="body2"
                  sx={{ color: "#475569", fontSize: "0.875rem" }}
                >
                  (473) 000-0000
                </Typography>
              </Box>

              {/* Email */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <EmailIcon sx={{ fontSize: 18, color: "#2563eb" }} />
                <Typography
                  variant="body2"
                  sx={{ color: "#475569", fontSize: "0.875rem" }}
                >
                  contacto@clinicanochistlan.com
                </Typography>
              </Box>

              {/* Ubicación */}
              <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
                <LocationOnIcon
                  sx={{ fontSize: 18, color: "#2563eb", mt: 0.3 }}
                />
                <Typography
                  variant="body2"
                  sx={{
                    color: "#475569",
                    fontSize: "0.875rem",
                    lineHeight: 1.4,
                    textAlign: { xs: "center", md: "left" },
                  }}
                >
                  Nochistlán de Mejía, Zacatecas, México.
                </Typography>
              </Box>
            </Box>

            {/* Redes sociales */}
            <Typography
              variant="body2"
              sx={{
                color: "#475569",
                mb: 1.5,
                fontSize: "0.875rem",
                textAlign: { xs: "center", md: "left" },
              }}
            >
              Síguenos en nuestras redes sociales
            </Typography>

            <Box
              sx={{
                display: "flex",
                justifyContent: { xs: "center", md: "flex-start" },
                gap: 1.5,
              }}
            >
              {[
                { icon: <WhatsApp sx={{ fontSize: 18 }} />, url: "#" },
                { icon: <FacebookIcon sx={{ fontSize: 18 }} />, url: "#" },
                { icon: <InstagramIcon sx={{ fontSize: 18 }} />, url: "#" },
                { icon: <LinkedInIcon sx={{ fontSize: 18 }} />, url: "#" },
              ].map((social, index) => (
                <Link
                  key={index}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 38,
                    height: 38,
                    backgroundColor: "#f1f5f9", // Cuadro suave
                    borderRadius: "8px",
                    color: "#1e40af", // Iconos en azul
                    transition: "all 0.2s ease-in-out",
                    "&:hover": {
                      backgroundColor: "#2563eb", // Fondo azul fuerte al hover
                      color: "#ffffff",
                    },
                  }}
                >
                  {social.icon}
                </Link>
              ))}
            </Box>
          </Grid>
        </Grid>
      </Container>

      {/* Línea divisoria inferior */}
      <Box sx={{ borderTop: "1px solid #e2e8f0", mt: 4, mb: 2 }}></Box>

      {/* Copyright */}
      <Container maxWidth="lg">
        <Box sx={{ textAlign: "center" }}>
          <Typography
            variant="body2"
            sx={{ color: "#94a3b8", fontSize: "0.85rem" }}
          >
            © {currentYear} Clínica Nochistlán. Todos los derechos reservados.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}

export default Footer;