import { useState } from "react";
import {
  Box,
  Button,
  Grid,
  IconButton,
  InputAdornment,
  Link,
  TextField,
  Typography,
  Container,
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import React from "react";
import { UseLoginValidation } from "../../hooks/Auth/UseLoginValidation";

export const SignIn = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { errors, formData, handleChange, onSubmit } = UseLoginValidation();

  const handleClickPassword = () => setShowPassword(!showPassword);

  const handleFormSubmit = (event) => {
    event.preventDefault();
    onSubmit();
  };

  return (
    <>
      <Container
        component="main"
        maxWidth={false}
        disableGutters
        sx={{
          minHeight: "100vh",
          backgroundColor: "#f5f5f5",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Box
          component="form"
          noValidate
          onSubmit={handleFormSubmit}
          sx={{
            width: { xs: "90%", sm: "450px" },
            backgroundColor: "white",
            borderRadius: "16px",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08)",
            p: { xs: 3, sm: 4 },
            display: "flex",
            flexDirection: "column",
            gap: 2,
            transition: "all 0.3s ease",
          }}
        >
          {/* Logo */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              mb: 2,
            }}
          >
            <img
              src="images/tadimex.png"
              alt="Logo Tadimex"
              style={{
                width: "120px",
                height: "auto",
              }}
            />
          </Box>

          {/* Título */}
          <Typography
            component="h1"
            variant="h5"
            sx={{
              fontWeight: 600,
              textAlign: "center",
              color: "#2c3e50",
              mb: 3,
            }}
          >
            Iniciar Sesión
          </Typography>

          {/* Campo Usuario */}
          <TextField
            required
            placeholder="Email o Número telefónico"
            fullWidth
            label="Credenciales"
            name="credential"
            value={formData.credential}
            onChange={(e) => handleChange(e.target.value, "credential")}
            error={!!errors.credential}
            helperText={errors.credential}
            sx={{
              "& .MuiOutlinedInput-root": {
                "&:hover fieldset": {
                  borderColor: "primary.main",
                },
              },
            }}
          />

          {/* Campo Contraseña */}
          <TextField
            required
            fullWidth
            name="password"
            label="Contraseña"
            type={showPassword ? "text" : "password"}
            value={formData.password}
            onChange={(e) => handleChange(e.target.value, "password")}
            error={!!errors.password}
            helperText={errors.password}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={handleClickPassword}
                    edge="end"
                    aria-label="toggle password visibility"
                  >
                    {showPassword ? <Visibility /> : <VisibilityOff />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                "&:hover fieldset": {
                  borderColor: "primary.main",
                },
              },
            }}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{
              mt: 3,
              mb: 2,
              py: 1.5,
              textTransform: "none",
              fontSize: "1rem",
              borderRadius: "8px",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
              "&:hover": {
                boxShadow: "0 6px 16px rgba(0, 0, 0, 0.15)",
              },
            }}
          >
            Iniciar Sesión
          </Button>
        </Box>
      </Container>
    </>
  );
};
