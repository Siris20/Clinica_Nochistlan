import React from "react";
import { Box, Container, Grid, Typography, Link } from "@mui/material";
import FacebookIcon from "@mui/icons-material/Facebook";
import TwitterIcon from "@mui/icons-material/Twitter";
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
        backgroundColor: "#f1f1f1", // Fondo gris claro
        color: "#333333", // Texto oscuro para contraste
        py: 3,
        marginTop: "auto",
      }}
    >
      {/* Sección principal del footer */}
      <Container maxWidth="lg">
        <Grid container spacing={2}>
          {/* Columna 1: Información de la empresa */}
          <Grid item xs={12} md={4}>
            <Typography
              variant="h6"
              gutterBottom
              sx={{
                fontWeight: "bold",
                mb: 1.5,
                textAlign: { xs: "center", md: "left" },
              }}
            >
              Sobre Nosotros
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: "#666666", // Gris oscuro para contraste
                lineHeight: 1.6,
                textAlign: { xs: "center", md: "left" },
              }}
            >
              En Clínica Nochistlán nos dedicamos a ofrecer atención médica privada con calidad, profesionalismo y un trato humano. Nuestro 
              equipo de especialistas, apoyado por tecnología moderna e instalaciones seguras, trabaja para brindar soluciones integrales que 
              promuevan la salud y el bienestar de nuestros pacientes.
              Nos distinguimos por la excelencia, la innovación y el compromiso con cada persona que deposita su confianza en nosotros, 
              ofreciendo una atención personalizada donde la salud y la calidez humana siempre son nuestra prioridad.
            </Typography>
          </Grid>

          {/* Columna 2: Enlaces Útiles */}
          <Grid item xs={12} md={4}>
            <Typography
              variant="h6"
              gutterBottom
              sx={{
                fontWeight: "bold",
                mb: 1.5,
                textAlign: { xs: "center", md: "left" },
              }}
            >
              Enlaces Útiles
            </Typography>
            <Box sx={{ textAlign: { xs: "center", md: "left" } }}>
              <Link
                href="#"
                variant="body2"
                underline="none"
                sx={{
                  color: "#666666",
                  display: "block",
                  mb: 1,
                  "&:hover": { color: "#333333", transition: "color 0.3s" },
                }}
              >
                Inicio
              </Link>
              <Link
                href="#"
                variant="body2"
                underline="none"
                sx={{
                  color: "#666666",
                  display: "block",
                  mb: 1,
                  "&:hover": { color: "#333333", transition: "color 0.3s" },
                }}
              >
                Servicios
              </Link>
              <Link
                href="#"
                variant="body2"
                underline="none"
                sx={{
                  color: "#666666",
                  display: "block",
                  mb: 1,
                  "&:hover": { color: "#333333", transition: "color 0.3s" },
                }}
              >
                Contacto
              </Link>
            </Box>
          </Grid>

          {/* Columna 3: Contacto y Redes Sociales */}
          <Grid item xs={12} md={4}>
            <Typography
              variant="h6"
              gutterBottom
              sx={{
                fontWeight: "bold",
                mb: 1.5,
                textAlign: { xs: "center", md: "left" },
              }}
            >
              Contacto y Redes
            </Typography>

            {/* Información de contacto */}
            <Box sx={{ mb: 2, textAlign: { xs: "center", md: "left" } }}>
              {/* Teléfono */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  mb: 0.5,
                  justifyContent: { xs: "center", md: "flex-start" },
                }}
              >
                <PhoneIcon sx={{ fontSize: 18, color: "#ef4444", mr: 1 }} />
                <Link
                  href="https://wa.me/524491388110?text=Buen%20día%2C%20estoy%20interesado%20en%20los%20servicios%20de%20Tadimex."
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ textDecoration: "none" }}
                >
                  <Typography variant="body2" sx={{ color: "#666666" }}>
                    449-138-8110
                  </Typography>
                </Link>
              </Box>

              {/* Email */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  mb: 0.5,
                  justifyContent: { xs: "center", md: "flex-start" },
                }}
              >
                <EmailIcon sx={{ fontSize: 18, color: "#ef4444", mr: 1 }} />
                <Typography variant="body2" sx={{ color: "#666666" }}>
                  tadimex@gmail.com
                </Typography>
              </Box>

              {/* Ubicación */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "flex-start",
                  mb: 1,
                  justifyContent: { xs: "center", md: "flex-start" },
                }}
              >
                <LocationOnIcon
                  sx={{ fontSize: 18, color: "#ef4444", mr: 1, mt: 0.2 }}
                />
                <Link
                  href="https://www.google.com/maps/search/?api=1&query=Gral+Luis+Caballero+203%2C+Insurgentes%2C+20287+Aguascalientes%2C+Ags"
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Ver en Google Maps"
                  sx={{ textDecoration: "none" }}
                >
                  <Typography
                    variant="body2"
                    sx={{ color: "#666666", fontSize: "0.875rem" }}
                  >
                    Gral Luis Caballero 203, Insurgentes, 20287
                    <br />
                    Aguascalientes, Ags.
                  </Typography>
                </Link>
              </Box>
            </Box>

            {/* Redes sociales */}
            <Typography
              variant="body2"
              sx={{
                color: "#666666",
                mb: 1,
                textAlign: { xs: "center", md: "left" },
              }}
            >
              Síguenos en nuestras redes sociales
            </Typography>
            <Box
              sx={{
                display: "flex",
                justifyContent: { xs: "center", md: "flex-start" },
                gap: 1,
              }}
            >
              <Link
                href="https://wa.me/524491388110?text=Buen%20día%2C%20estoy%20interesado%20en%20los%20servicios%20de%20Tadimex."
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 40,
                  height: 40,
                  backgroundColor: "#e5e5e5",
                  borderRadius: "8px",
                  color: "#666666",
                  "&:hover": {
                    backgroundColor: "#43A047",
                    color: "white",
                    transition: "all 0.3s",
                  },
                }}
              >
                <WhatsApp sx={{ fontSize: 20 }} />
              </Link>
              <Link
                href="https://www.facebook.com/share/1BpUuUVeT4/"
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 40,
                  height: 40,
                  backgroundColor: "#e5e5e5",
                  borderRadius: "8px",
                  color: "#666666",
                  "&:hover": {
                    backgroundColor: "#1877f2",
                    color: "white",
                    transition: "all 0.3s",
                  },
                }}
              >
                <FacebookIcon sx={{ fontSize: 20 }} />
              </Link>
              <Link
                href="https://www.instagram.com/tadimex.mx?igsh=Z201enVwdTUwZTJh"
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 40,
                  height: 40,
                  backgroundColor: "#e5e5e5",
                  borderRadius: "8px",
                  color: "#666666",
                  "&:hover": {
                    backgroundColor: "#e4405f",
                    color: "white",
                    transition: "all 0.3s",
                  },
                }}
              >
                <InstagramIcon sx={{ fontSize: 20 }} />
              </Link>
              <Link
                href="https://www.linkedin.com/in/tadimex-aguascalientes-b78282289?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app"
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 40,
                  height: 40,
                  backgroundColor: "#e5e5e5",
                  borderRadius: "8px",
                  color: "#666666",
                  "&:hover": {
                    backgroundColor: "#0077b5",
                    color: "white",
                    transition: "all 0.3s",
                  },
                }}
              >
                <LinkedInIcon sx={{ fontSize: 20 }} />
              </Link>
            </Box>
          </Grid>
        </Grid>
      </Container>

      {/* Línea divisoria */}
      <Box sx={{ borderTop: "1px solid #cccccc", mt: 2 }}></Box>

      {/* Copyright */}
      <Container maxWidth="lg">
        <Box sx={{ py: 2, textAlign: "center" }}>
          <Typography variant="body2" sx={{ color: "#888888" }}>
            © {currentYear} Tadimex. Todos los derechos reservados.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}

export default Footer;
