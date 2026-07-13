import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  CircularProgress,
} from "@mui/material";
import { Close, Language, Add } from "@mui/icons-material";
import { toast } from "react-toastify";

interface RegisterWebsiteModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  onAddWebsite: (website: { name: string; domain: string }) => Promise<void>;
}

export const RegisterWebsiteModal: React.FC<RegisterWebsiteModalProps> = ({
  open,
  setOpen,
  onAddWebsite,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    domain: "",
  });

  const [errors, setErrors] = useState({
    name: "",
    domain: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Función para manejar cambios en los campos del formulario
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Limpiar error cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  // Validaciones
  const validateFields = () => {
    const newErrors = { name: "", domain: "" };
    let isValid = true;

    // Validar nombre
    if (!formData.name.trim()) {
      newErrors.name = "El nombre es requerido";
      isValid = false;
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "El nombre debe tener al menos 2 caracteres";
      isValid = false;
    }

    // Validar dominio
    if (!formData.domain.trim()) {
      newErrors.domain = "El dominio es requerido";
      isValid = false;
    } else {
      // Validación básica de dominio
      const domainRegex =
        /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+$|^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]$/;
      const cleanDomain = formData.domain
        .trim()
        .replace(/^https?:\/\//, "")
        .replace(/\/$/, "");

      if (!domainRegex.test(cleanDomain) && !cleanDomain.includes(".")) {
        newErrors.domain = "Ingresa un dominio válido (ej: ejemplo.com)";
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  // Función para manejar el envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateFields()) {
      toast.error("Por favor, llena todos los campos correctamente");
      return;
    }

    setIsSubmitting(true);

    try {
      // Limpiar dominio (remover http/https y slash final)
      const cleanDomain = formData.domain
        .trim()
        .replace(/^https?:\/\//, "")
        .replace(/\/$/, "");

      await onAddWebsite({
        name: formData.name.trim(),
        domain: cleanDomain,
      });

      // Si llegamos aquí, la operación fue exitosa
      handleCloseDialog();
    } catch (error) {
      console.error("Error al registrar sitio web:", error);
      // El error se maneja en el componente padre con toast
    } finally {
      setIsSubmitting(false);
    }
  };

  // Función para cerrar el diálogo
  const handleCloseDialog = () => {
    setFormData({
      name: "",
      domain: "",
    });
    setErrors({
      name: "",
      domain: "",
    });
    setIsSubmitting(false);
    setOpen(false);
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" && !isSubmitting) {
      handleSubmit(event as any);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleCloseDialog}
      PaperProps={{
        component: "form",
        sx: {
          width: { xs: "95%", sm: "500px" },
          height: { xs: "auto", sm: "auto" },
          maxHeight: { xs: "95vh", sm: "none" },
          borderRadius: 3,
          m: { xs: 1, sm: 2 },
        },
      }}
    >
      <DialogTitle
        sx={{
          fontFamily: "Inter, sans-serif",
          fontWeight: "600",
          fontSize: 20,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          pb: 1,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Language color="primary" fontSize="small" />
          Registrar Sitio Web
        </Box>
        <IconButton
          onClick={handleCloseDialog}
          disabled={isSubmitting}
          sx={{
            borderRadius: "100%",
            position: "absolute",
            right: 10,
            top: 10,
            backgroundColor: "#D01313",
            width: 32,
            height: 32,
            color: "#fff",
            "&:hover": {
              backgroundColor: "#D01319",
            },
            "&:disabled": {
              backgroundColor: "#ccc",
            },
          }}
        >
          <Close sx={{ fontSize: "18px" }} />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        <Typography
          variant="subtitle2"
          sx={{
            mb: 2,
            color: "text.secondary",
            fontWeight: 500,
          }}
        >
          Información del sitio web
        </Typography>

        <TextField
          variant="outlined"
          label="Nombre del sitio"
          fullWidth
          required
          name="name"
          value={formData.name}
          onChange={handleChange}
          onKeyPress={handleKeyPress}
          disabled={isSubmitting}
          sx={{ mt: 1 }}
          error={!!errors.name}
          helperText={errors.name || "Ej: Mi Blog Personal"}
          placeholder="Ingresa el nombre del sitio web"
        />

        <TextField
          variant="outlined"
          label="Dominio"
          fullWidth
          required
          name="domain"
          value={formData.domain}
          onChange={handleChange}
          onKeyPress={handleKeyPress}
          disabled={isSubmitting}
          sx={{ mt: 2, mb: 2 }}
          error={!!errors.domain}
          helperText={errors.domain || "Ej: miblog.com o https://miblog.com"}
          placeholder="Ingresa el dominio del sitio web"
        />
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button
          onClick={handleCloseDialog}
          disabled={isSubmitting}
          sx={{
            borderRadius: 100,
            color: "#666",
            fontFamily: "Inter, sans-serif",
            fontSize: 12,
            textTransform: "none",
            mr: 1,
          }}
        >
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={
            isSubmitting || !formData.name.trim() || !formData.domain.trim()
          }
          variant="contained"
          startIcon={
            isSubmitting ? (
              <CircularProgress size={16} color="inherit" />
            ) : (
              <Add fontSize="small" />
            )
          }
          sx={{
            borderRadius: 100,
            backgroundColor: "#000",
            color: "#fff",
            fontFamily: "Inter, sans-serif",
            fontSize: 12,
            textTransform: "none",
            minWidth: 120,
            "&:hover": {
              backgroundColor: "#333",
            },
          }}
        >
          {isSubmitting ? "Guardando..." : "Registrar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
