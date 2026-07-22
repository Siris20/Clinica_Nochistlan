import React, { useState } from "react";
import {
  Box,
  Typography,
  Grid,
  TextField,
  Button,
  IconButton,
  CircularProgress,
  FormControl,
  InputAdornment,
  Paper,
} from "@mui/material";
import { Container, Stack, styled } from "@mui/system";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import MessageIcon from "@mui/icons-material/Message";
import SendIcon from "@mui/icons-material/Send";
import LocationOnIcon from "@mui/icons-material/LocationOn";

const StyledForm = styled("form")({
  backgroundColor: "#ffffff",
  padding: "28px",
  borderRadius: "16px",
  border: "1px solid #e2e8f0",
  boxShadow: "0 10px 30px -5px rgba(0, 0, 0, 0.05)",
});

function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Correo de contacto de la clínica
  const RECIPIENT_EMAIL = "clinicanochistlan@gmail.com";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "El nombre es requerido";
    }

    if (!formData.email.trim()) {
      newErrors.email = "El correo es requerido";
    } else if (
      !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(formData.email)
    ) {
      newErrors.email = "Correo electrónico inválido";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "El teléfono es requerido";
    } else if (!/^[0-9]{10}$/i.test(formData.phone.replace(/\s/g, ""))) {
      newErrors.phone = "Ingresa un número de 10 dígitos";
    }

    if (!formData.message.trim()) {
      newErrors.message = "El mensaje es requerido";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (validateForm()) {
      setIsSubmitting(true);

      const emailBody = `Buen día, me gustaría solicitar información sobre los servicios de Clínica Nochistlán.

Datos de contacto:
- Nombre: ${formData.name}
- Teléfono: ${formData.phone}
- Correo: ${formData.email}

Consulta o Mensaje:
${formData.message}

Quedo atento a su respuesta.

Saludos cordiales,
${formData.name}`;

      const emailSubject = `Consulta Médica / Información - ${formData.name}`;

      const mailtoUrl = `mailto:${RECIPIENT_EMAIL}?subject=${encodeURIComponent(
        emailSubject
      )}&body=${encodeURIComponent(emailBody)}`;

      setTimeout(() => {
        setIsSubmitting(false);
        window.location.href = mailtoUrl;
        setSubmitted(true);

        setFormData({
          name: "",
          email: "",
          phone: "",
          message: "",
        });

        setTimeout(() => {
          setSubmitted(false);
        }, 5000);
      }, 1000);
    }
  };

  return (
    <>
      {/* Encabezado Principal */}
      <Box
        component="section"
        id="contact"
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
            component="h1"
            sx={{
              color: "#1e40af",
              fontWeight: 800,
              fontSize: { xs: "2rem", sm: "2.5rem", md: "3rem" },
              mb: 1.5,
              letterSpacing: "-0.02em",
            }}
          >
            Contáctanos
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
            Estamos a tu disposición para agendar citas, atender consultas sobre
            nuestros servicios médicos y brindar la orientación que necesites.
          </Typography>
          <Box
            sx={{
              width: "60px",
              height: "4px",
              backgroundColor: "#00a884",
              mx: "auto",
              borderRadius: "2px",
            }}
          />
        </Container>
      </Box>

      {/* Formulario e Información de Contacto */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 8 } }}>
        <Grid container spacing={4}>
          {/* Formulario */}
          <Grid item xs={12} md={6}>
            <StyledForm onSubmit={handleSubmit}>
              <Typography
                variant="h5"
                sx={{
                  color: "#1e40af",
                  fontWeight: 700,
                  mb: 3,
                }}
              >
                Envíanos un mensaje
              </Typography>

              {submitted ? (
                <Box
                  sx={{
                    textAlign: "center",
                    py: 4,
                    color: "success.main",
                  }}
                >
                  <Typography variant="h6" gutterBottom>
                    ¡Se abrió tu aplicación de correo!
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#64748b" }}>
                    Revisa si se abrió correctamente y confirma el envío de tu mensaje.
                  </Typography>
                </Box>
              ) : (
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <FormControl fullWidth>
                      <TextField
                        label="Nombre completo"
                        variant="outlined"
                        fullWidth
                        required
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        error={!!errors.name}
                        helperText={errors.name}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <PersonIcon sx={{ color: "#00a884" }} />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <FormControl fullWidth>
                      <TextField
                        label="Correo electrónico"
                        variant="outlined"
                        fullWidth
                        required
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        error={!!errors.email}
                        helperText={errors.email}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <EmailIcon sx={{ color: "#00a884" }} />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <FormControl fullWidth>
                      <TextField
                        label="Teléfono de contacto"
                        variant="outlined"
                        fullWidth
                        required
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        error={!!errors.phone}
                        helperText={errors.phone}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <PhoneIcon sx={{ color: "#00a884" }} />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <FormControl fullWidth>
                      <TextField
                        label="¿En qué podemos ayudarte?"
                        variant="outlined"
                        multiline
                        rows={4}
                        fullWidth
                        required
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        error={!!errors.message}
                        helperText={errors.message}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <MessageIcon
                                sx={{
                                  color: "#00a884",
                                  alignSelf: "flex-start",
                                  mt: 1,
                                }}
                              />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <Box textAlign="center" sx={{ mt: 1 }}>
                      <Button
                        variant="contained"
                        sx={{
                          backgroundColor: "#1e40af",
                          color: "#ffffff",
                          px: 4,
                          py: 1.2,
                          fontWeight: 600,
                          borderRadius: "8px",
                          "&:hover": { backgroundColor: "#00a884" },
                        }}
                        size="large"
                        type="submit"
                        disabled={isSubmitting}
                        endIcon={
                          isSubmitting ? (
                            <CircularProgress size={20} color="inherit" />
                          ) : (
                            <SendIcon />
                          )
                        }
                      >
                        {isSubmitting
                          ? "Preparando correo..."
                          : "Enviar Consulta"}
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              )}
            </StyledForm>
          </Grid>

          {/* Información de Contacto y Mapa */}
          <Grid item xs={12} md={6}>
            <Stack spacing={2}>
              {/* Tarjeta WhatsApp */}
              <Paper
                elevation={0}
                sx={{
                  p: 2.5,
                  backgroundColor: "#ffffff",
                  borderRadius: "12px",
                  border: "1px solid #e2e8f0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Stack direction="row" alignItems="center" spacing={2}>
                  <IconButton
                    href="https://wa.me/524491388110?text=Buen%20día%2C%20quisiera%20solicitar%20información%20sobre%20Clínica%20Nochistlán"
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Atención por WhatsApp"
                    sx={{
                      color: "#25d336",
                      backgroundColor: "#f0fdf4",
                      borderRadius: "50%",
                      p: 1.5,
                      boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
                      transition: "transform 0.2s",
                      "&:hover": {
                        color: "#fff",
                        backgroundColor: "#25d336",
                        transform: "scale(1.05)",
                      },
                    }}
                  >
                    <WhatsAppIcon fontSize="medium" />
                  </IconButton>
                  <Box>
                    <Typography
                      variant="subtitle2"
                      sx={{ color: "#64748b", fontWeight: 500 }}
                    >
                      Atención Inmediata por WhatsApp
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{ fontWeight: 700, color: "#1e40af" }}
                    >
                      +52 449 138 8110
                    </Typography>
                  </Box>
                </Stack>
              </Paper>

              {/* Tarjeta Ubicación */}
              <Paper
                elevation={0}
                sx={{
                  p: 2.5,
                  backgroundColor: "#ffffff",
                  borderRadius: "12px",
                  border: "1px solid #e2e8f0",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Box
                    sx={{
                      color: "#00a884",
                      backgroundColor: "#f0fdf4",
                      borderRadius: "50%",
                      p: 1.5,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <LocationOnIcon fontSize="medium" />
                  </Box>
                  <Box>
                    <Typography
                      variant="subtitle2"
                      sx={{ color: "#64748b", fontWeight: 500 }}
                    >
                      Ubicación
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 600, color: "#334155" }}
                    >
                      Nochistlán de Mejía, Zacatecas, México
                    </Typography>
                  </Box>
                </Stack>
              </Paper>

              {/* Mapa Google Maps enfocado en Nochistlán */}
              <Box
                sx={{
                  width: "100%",
                  height: "320px",
                  borderRadius: "12px",
                  overflow: "hidden",
                  border: "1px solid #e2e8f0",
                  boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.05)",
                }}
              >
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d29688.086438864757!2d-102.86248384218206!3d21.363842542036733!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x842e4726569eb23b%3A0x6a056a237376c90c!2sNochistl%C3%A1n%20de%20Mej%C3%ADa%2C%20Zac.!5e0!3m2!1ses!2smx!4v1710000000000!5m2!1ses!2smx"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  title="Google Maps - Nochistlán de Mejía"
                ></iframe>
              </Box>
            </Stack>
          </Grid>
        </Grid>
      </Container>
    </>
  );
}

export default Contact;