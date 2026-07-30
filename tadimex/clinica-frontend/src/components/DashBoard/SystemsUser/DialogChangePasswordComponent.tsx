import React, { useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  TextField,
  InputAdornment,
  Box,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import CloseIcon from "@mui/icons-material/Close";
import { toast } from "react-toastify";

export const DialogChangePassword = ({ open, setOpen, userId, onUpdatePassword }) => {
  const [formData, setFormData] = useState({
    current_password: "",
    new_password: "",
    confirm_new_password: "",
  });

  const [errors, setErrors] = useState({});
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const resetForm = () => {
    setFormData({
      current_password: "",
      new_password: "",
      confirm_new_password: "",
    });
    setErrors({});
  };

  const handleClose = () => {
    resetForm();
    setOpen(false);
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Validar contraseña actual
    if (!formData.current_password.trim()) {
      newErrors.current_password = "La contraseña actual es requerida";
    }

    // Validar nueva contraseña
    if (!formData.new_password.trim()) {
      newErrors.new_password = "La nueva contraseña es requerida";
    }
    if(formData.new_password.length < 8){
      newErrors.new_password = "La contraseña debe tener al menos 8 caracteres"
    }

    // Validar confirmación de contraseña
    if (!formData.confirm_new_password.trim()) {
      newErrors.confirm_new_password = "Debe confirmar la nueva contraseña";
    } else if (formData.new_password !== formData.confirm_new_password) {
      newErrors.confirm_new_password = "Las contraseñas no coinciden";
    }

    

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdateClick = async () => {
    if (!validateForm()) {
      toast.error("Por favor, complete todos los campos correctamente");
      return;
    }

    if (!userId) {
      toast.error("No se puede identificar el usuario");
      return;
    }

    try {
      await onUpdatePassword(userId, {
        current_password: formData.current_password,
        new_password: formData.new_password,
      });
      toast.success("Contraseña actualizada correctamente");
      handleClose();
    } catch (error) {
      if (error.detail) {
        if (Array.isArray(error.detail)) {
          error.detail.forEach((err) => {
            const field = err.loc[err.loc.length - 1];
            toast.error(`${field}: ${err.msg}`);
          });
        } else {
          toast.error(error.detail);
        }
      } else if (error.message) {
        toast.error(error.message);
      } else {
        toast.error("Error al actualizar la contraseña");
      }
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault(); // Prevenir el comportamiento por defecto del formulario
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      PaperProps={{
        sx: {
          width: "500px",
          borderRadius: 5,
        },
      }}
    >
      <form onSubmit={handleSubmit}>
        <DialogTitle
          sx={{
            fontFamily: "Inter, sans-serif",
            fontWeight: "600",
            fontSize: 24,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          Cambiar contraseña
          <IconButton
            onClick={handleClose}
            sx={{
              borderRadius: "100%",
              position: "absolute",
              right: 10,
              top: 10,
              backgroundColor: "#D01313",
              width: 24,
              height: 24,
              color: "#fff",
              "&:hover": {
                backgroundColor: "#D01319",
              },
            }}
          >
            <CloseIcon sx={{ fontSize: "20px" }} />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              variant="outlined"
              label="Contraseña actual"
              autoComplete="current-password"
              type={showCurrentPassword ? "text" : "password"}
              value={formData.current_password}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  current_password: e.target.value,
                }))
              }
              fullWidth
              error={!!errors.current_password}
              helperText={errors.current_password}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      edge="end"
                      tabIndex={-1}
                    >
                      {showCurrentPassword ? <Visibility /> : <VisibilityOff />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          <Box sx={{ mt: 2 }}>
            <TextField
              variant="outlined"
              label="Nueva contraseña"
              type={showNewPassword ? "text" : "password"}
              value={formData.new_password}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  new_password: e.target.value,
                }))
              }
              fullWidth
              autoComplete="new-password"
              error={!!errors.new_password}
              helperText={errors.new_password}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      edge="end"
                      tabIndex={-1}
                    >
                      {showNewPassword ? <Visibility /> : <VisibilityOff />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          <Box sx={{ mt: 2 }}>
            <TextField
              variant="outlined"
              label="Confirmar nueva contraseña"
              autoComplete="new-password"
              type={showConfirmPassword ? "text" : "password"}
              value={formData.confirm_new_password}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  confirm_new_password: e.target.value,
                }))
              }
              fullWidth
              error={!!errors.confirm_new_password}
              helperText={errors.confirm_new_password}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      edge="end"
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? <Visibility /> : <VisibilityOff />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleUpdateClick}
            variant="contained"
            sx={{
              borderRadius: 100,
              backgroundColor: "#000",
              color: "#fff",
              fontFamily: "Inter, sans-serif",
              fontSize: 12,
            }}
          >
            Cambiar contraseña
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};