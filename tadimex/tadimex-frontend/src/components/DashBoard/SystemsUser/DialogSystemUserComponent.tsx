import React, { useEffect, useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  TextField,
  Grid,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Box,
} from "@mui/material";
import { LockReset, Visibility, VisibilityOff } from "@mui/icons-material";
import { useEmployee } from "../../../hooks/Employee/useEmployee";
import { toast } from "react-toastify";
import { DialogChangePassword } from "./DialogChangePasswordComponent";

export const DialogSystemUserComponent = ({
  open,
  setOpen,
  onAddSystemUser,
  onEditSystemUser,
  onUpdatePassword,
  initialData,
}) => {
  const [formData, setFormData] = useState({
    empleado_id: "",
    password: "",
    confirm_password: "",
    rol: "",
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);

  // Cargar datos iniciales cuando se está editando
  useEffect(() => {
    if (initialData) {
      setFormData({
        empleado_id: initialData.empleado_id || "",
        rol: initialData.rol || "",
        password: "",
        confirm_password: "",
      });
    }
  }, [initialData]);

  const handleCloseDialog = () => {
    setOpen(false);
    setFormData({
      empleado_id: "",
      password: "",
      confirm_password: "",
      rol: "",
    });
    setErrors({});
  };

  const handleClickShowPassword = (event) => {
    event.preventDefault();
    setShowPassword((show) => !show);
  };

  const handleClickShowConfirmPassword = (event) => {
    event.preventDefault();
    setShowConfirmPassword((show) => !show);
  };

  const { employees } = useEmployee();

  const userRoleOptions = [
    "Administrador",
    "Recursos humanos",
    "Empleado",
    "Emisor",
    "Observador",
  ];

  const validateForm = () => {
    const newErrors = {};

    if (!initialData) {
      // Validaciones solo para creación
      if (!formData.empleado_id) {
        newErrors.empleado_id = "Debe seleccionar un empleado";
      }

      if (!formData.password) {
        newErrors.password = "La contraseña es requerida";
      }

      if (!formData.confirm_password) {
        newErrors.confirm_password = "Debe confirmar la contraseña";
      } else if (formData.password !== formData.confirm_password) {
        newErrors.confirm_password = "Las contraseñas no coinciden";
      }
    }

    if (!formData.rol) {
      newErrors.rol = "Debe seleccionar un rol";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    if (event) {
      event.preventDefault();
    }

    if (validateForm()) {
      try {
        if (initialData) {
          // Modo edición - solo enviamos el rol
          const updateData = {
            id: initialData.id,
            rol: formData.rol,
          };
          await onEditSystemUser(updateData);
        } else {
          // Modo creación - enviamos todos los datos
          const userData = {
            empleado_id: formData.empleado_id,
            rol: formData.rol,
            password: formData.password,
          };
          await onAddSystemUser(userData);
        }
        handleCloseDialog();
      } catch (error) {
        throw error;
      }
    } else {
      toast.error("Por favor, complete los campos correctamente");
    }
  };

  // Encontrar el empleado actual para mostrar su nombre
  const currentEmployee = employees.find(
    (emp) => emp.id === formData.empleado_id
  );

  return (
    <Dialog
      open={open}
      onClose={handleCloseDialog}
      onSubmit={handleSubmit}
      PaperProps={{
        component: "form",
        sx: {
          width: { xs: "95%", sm: "730px" },
          height: { xs: "auto", sm: initialData ? "auto" : "70%" },
          maxHeight: { xs: "95vh", sm: "none" },
          borderRadius: 5,
          m: { xs: 1, sm: 2 },
        },
      }}
    >
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
        {initialData ? "Editar usuario" : "Agregar usuario"}
        <IconButton
          onClick={handleCloseDialog}
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
        <h5 style={{ margin: 16 }}>
          {initialData ? "Empleado seleccionado" : "Seleccionar empleado"}
        </h5>
        <FormControl fullWidth error={!!errors.empleado_id}>
          <InputLabel>Empleado</InputLabel>
          <Select
            value={formData.empleado_id}
            onChange={(e) => {
              setFormData((prev) => ({
                ...prev,
                empleado_id: e.target.value,
              }));
            }}
            label="Empleado"
            disabled={!!initialData}
            autoComplete="username"
          >
            {employees.map((employee) => (
              <MenuItem key={employee.id} value={employee.id}>
                {`${employee.name} ${employee.last_name}`}
              </MenuItem>
            ))}
          </Select>
          {errors.empleado_id && (
            <FormHelperText>{errors.empleado_id}</FormHelperText>
          )}
        </FormControl>

        {!initialData && (
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <h5 style={{ margin: "16px 0" }}>Contraseña</h5>
              <TextField
                variant="outlined"
                label="Contraseña"
                autoComplete="new-password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, password: e.target.value }))
                }
                fullWidth
                error={!!errors.password}
                helperText={errors.password}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={handleClickShowPassword}
                        edge="end"
                        tabIndex={-1}
                      >
                        {showPassword ? <Visibility /> : <VisibilityOff />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <h5 style={{ margin: "16px 0" }}>Confirmar contraseña</h5>
              <TextField
                variant="outlined"
                label="Confirmar contraseña"
                autoComplete="new-password"
                type={showConfirmPassword ? "text" : "password"}
                value={formData.confirm_password}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    confirm_password: e.target.value,
                  }))
                }
                fullWidth
                error={!!errors.confirm_password}
                helperText={errors.confirm_password}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={handleClickShowConfirmPassword}
                        edge="end"
                        tabIndex={-1}
                      >
                        {showConfirmPassword ? (
                          <Visibility />
                        ) : (
                          <VisibilityOff />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          </Grid>
        )}

        <h5 style={{ margin: 16 }}>Rol del usuario</h5>
        <FormControl fullWidth error={!!errors.rol}>
          <InputLabel>Rol del usuario</InputLabel>
          <Select
            value={formData.rol}
            onChange={(e) => {
              setFormData((prev) => ({
                ...prev,
                rol: e.target.value,
              }));
            }}
            label="Rol del usuario"
            autoComplete="off"
          >
            {userRoleOptions.map((role) => (
              <MenuItem key={role} value={role}>
                {role}
              </MenuItem>
            ))}
          </Select>
          {errors.rol && <FormHelperText>{errors.rol}</FormHelperText>}

          {initialData && (
            <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
              <Button
                onClick={() => setChangePasswordOpen(true)}
                startIcon={<LockReset />}
                sx={{ textTransform: "none" }}
              >
                Cambiar contraseña
              </Button>
            </Box>
          )}
        </FormControl>
        <DialogChangePassword
          open={changePasswordOpen}
          setOpen={setChangePasswordOpen}
          userId={initialData?.id}
          onUpdatePassword={onUpdatePassword}
        />
      </DialogContent>
      <DialogActions>
        <Button
          type="submit"
          variant="contained"
          sx={{
            borderRadius: 100,
            backgroundColor: "#000",
            color: "#fff",
            fontFamily: "Inter, sans-serif",
            fontSize: 12,
          }}
        >
          {initialData ? "Guardar Cambios" : "Guardar Usuario"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
