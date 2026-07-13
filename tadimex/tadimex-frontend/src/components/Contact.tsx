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
} from "@mui/material";
import { Container, Stack, styled } from "@mui/system";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import MessageIcon from "@mui/icons-material/Message";
import SendIcon from "@mui/icons-material/Send";

const StyledForm = styled("form")({
  backgroundColor: "#fff",
  padding: "20px",
  borderRadius: "8px",
  boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
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

  const RECIPIENT_EMAIL = "tadimex@gmail.com";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Limpiar error cuando el usuario comienza a escribir
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

      // Crear el cuerpo del email
      const emailBody = `Buen día, estoy interesado en los servicios de Tadimex

Datos de contacto:
- Nombre: ${formData.name}
- Teléfono: ${formData.phone}
- Correo: ${formData.email}

Mensaje:
${formData.message}

Quedo atento a su respuesta.

Saludos cordiales,
${formData.name}`;

      // Crear el asunto del email
      const emailSubject = `Consulta de servicios - ${formData.name}`;

      // Crear la URL mailto
      const mailtoUrl = `mailto:${RECIPIENT_EMAIL}?subject=${encodeURIComponent(
        emailSubject
      )}&body=${encodeURIComponent(emailBody)}`;

      // Simular procesamiento
      setTimeout(() => {
        setIsSubmitting(false);

        // Abrir la aplicación de correo
        window.location.href = mailtoUrl;

        // Mostrar mensaje de éxito
        setSubmitted(true);

        // Reset formulario después de enviar
        setFormData({
          name: "",
          email: "",
          phone: "",
          message: "",
        });

        // Ocultar mensaje de éxito después de 5 segundos
        setTimeout(() => {
          setSubmitted(false);
        }, 5000);
      }, 1000);
    }
  };

  return (
    <>
      <Box
        component="section"
        id="contact"
        sx={{
          backgroundColor: "#0B1426",
          width: "100%",
          minHeight: "50vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          py: { xs: 6, md: 10 },
          position: "relative",
          overflow: "hidden",
          margin: 0,
          padding: 0,
          boxSizing: "border-box",
        }}
      >
        <Container
          maxWidth="lg"
          sx={{
            position: "relative",
            zIndex: 2,
            textAlign: "center",
          }}
        >
          <Typography
            variant="h2"
            component="h1"
            sx={{
              color: "white",
              fontWeight: 700,
              fontSize: { xs: "2rem", sm: "2.5rem", md: "3.5rem" },
              mb: 4,
              textShadow: "2px 2px 4px rgba(0,0,0,0.3)",
              letterSpacing: "0.02em",
            }}
          >
            Contáctanos
          </Typography>

          {/* Decorative elements */}
          <Box
            sx={{
              position: "absolute",
              top: "20%",
              right: "10%",
              width: "100px",
              height: "100px",
              borderRadius: "50%",
              background: "rgba(255, 255, 255, 0.1)",
              display: { xs: "none", md: "block" },
            }}
          />
          <Box
            sx={{
              position: "absolute",
              bottom: "20%",
              left: "15%",
              width: "60px",
              height: "60px",
              borderRadius: "50%",
              background: "rgba(255,255,255,0.08)",
              display: { xs: "none", md: "block" },
            }}
          />
        </Container>
      </Box>

      <Box sx={{ p: 3 }}>
        <Typography variant="body1" sx={{ fontSize: "1.2rem", m: 2 }}>
          Pregunta por nuestros precios y servicios disponibles. La atención es
          personalizada.
        </Typography>
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <StyledForm onSubmit={handleSubmit}>
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
                  <Typography variant="body2">
                    Revisa si se abrió correctamente y envía el mensaje.
                  </Typography>
                </Box>
              ) : (
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <FormControl fullWidth>
                      <TextField
                        label="Ingresa tu nombre"
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
                              <PersonIcon />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <FormControl fullWidth>
                      <TextField
                        label="Ingresa tu correo electrónico"
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
                              <EmailIcon />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <FormControl fullWidth>
                      <TextField
                        label="Teléfono"
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
                              <PhoneIcon />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <FormControl fullWidth>
                      <TextField
                        label="Mensaje"
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
                                sx={{ alignSelf: "flex-start", mt: 1 }}
                              />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <Box textAlign="center">
                      <Button
                        variant="contained"
                        sx={{
                          backgroundColor: "#F44ecf",
                          color: "#fff",
                          "&:hover": { backgroundColor: "#F44ecf" },
                        }}
                        size="large"
                        type="submit"
                        disabled={isSubmitting}
                        endIcon={
                          isSubmitting ? (
                            <CircularProgress size={20} />
                          ) : (
                            <SendIcon />
                          )
                        }
                      >
                        {isSubmitting
                          ? "Preparando email..."
                          : "Enviar por correo"}
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              )}
            </StyledForm>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box
              sx={{
                backgroundColor: "#f0f0f0",
                p: 2,
                display: "flex",
                alignItems: "center",
                borderRadius: "8px",
                mb: 2,
              }}
            >
              <Stack direction="row" alignItems="center" spacing={1}>
                <IconButton
                  href="https://wa.me/524491388110?text=Buen%20día%2C%20estoy%20interesado%20en%20los%20servicios%20de%20Tadimex"
                  target="_blank"
                  rel="noopener noreferrer"
                  title="WhatsApp"
                  sx={{
                    color: "#25d336",
                    backgroundColor: "#fff",
                    borderRadius: "50%",
                    boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
                    transition: "transform 0.2s",
                    "&:hover": {
                      color: "#fff",
                      backgroundColor: "#25d336",
                      transform: "scale(1.1)",
                    },
                  }}
                >
                  <WhatsAppIcon />
                </IconButton>
                <Typography variant="body1">+52 449 138 8110</Typography>
              </Stack>
            </Box>
            <Box
              sx={{
                width: "100%",
                height: "350px",
                borderRadius: "8px",
                overflow: "hidden",
                boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
              }}
            >
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3703.3669823425593!2d-102.29454672494443!3d21.84382398002029!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8429f189e9c30e71%3A0x123456789abcdef0!2sGral%20Luis%20Caballero%20203%2C%20Insurgentes%2C%2020287%20Aguascalientes%2C%20Ags.%2C%20Mexico!5e0!3m2!1ses!2smx!4v1730940873697!5m2!1ses!2smx"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                title="Google Maps - Tadimex"
              ></iframe>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </>
  );
}

export default Contact;
