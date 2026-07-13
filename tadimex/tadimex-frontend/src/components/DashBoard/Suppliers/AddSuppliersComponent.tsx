import React, { useEffect, useRef, useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  DialogActions,
  Button,
  TextField,
  InputLabel,
  Select,
  MenuItem,
  FormControl,
  Autocomplete,
  Checkbox,
  Box,
  Typography,
  FormHelperText,
  Chip,
} from "@mui/material";
import { v4 as uuidv4 } from "uuid";
import { toast } from "react-toastify";
import { Grid } from "@mui/material";
import { useEnterprise } from "../../../context/EnterpriseContext";

export const AddSuppliersComponent = ({
  open,
  setOpen,
  onAddSuppliers,
  onEditSuppliers,
  initialData,
  onClose,
}) => {
  const { selectedEnterprise } = useEnterprise();

  const [formData, setFormData] = useState({
    nombre: "",
    telefono: "",
    email: "",
    calle: "",
    numero_exterior: "",
    numero_interior: "",
    colonia: "",
    localidad: "",
    municipio: "",
    estado: "",
    codigo_postal: "",
    observaciones: "",
  });

  const [errors, setErrors] = useState({
    nombre: "",
    telefono: "",
    email: "",
    calle: "",
    numero_exterior: "",
    numero_interior: "",
    colonia: "",
    localidad: "",
    municipio: "",
    estado: "",
    codigo_postal: "",
    observaciones: "",
  });

  // UseEffect para cargar los datos iniciales cuando se está editando
  useEffect(() => {
    if (initialData) {
      setFormData({
        nombre: initialData.nombre || "",
        telefono: initialData.telefono || "",
        email: initialData.email || "",
        calle: initialData.calle || "",
        numero_exterior: initialData.numero_exterior || "",
        numero_interior: initialData.numero_interior || "",
        colonia: initialData.colonia || "",
        localidad: initialData.localidad || "",
        municipio: initialData.municipio || "",
        estado: initialData.estado || "",
        codigo_postal: initialData.codigo_postal || "",
        observaciones: initialData.observaciones || "",
      });
    }
  }, [initialData]);

//Función para validar el email
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Función para manejar cambios en los campos del formulario
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "telefono" && value && !/^\d*$/.test(value)) {
      return;
    }

    if (name === "codigo_postal" && value && !/^\d*$/.test(value)) {
      return;
    }

    if (name === "numero_exterior" && value && !/^\d*$/.test(value)) {
      return;
    }

    if (name === "numero_interior" && value && !/^\d*$/.test(value)) {
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  //Validaciones
  const validateFields = () => {
    const newErrors = {};

    const requiredFields = [
      "nombre",
    ];

    requiredFields.forEach((key) => {
      if (!formData[key]) {
        newErrors[key] = "Campo requerido";
      }
    });

    //Validar código postal solo si tiene contenido
    if (formData.codigo_postal && formData.codigo_postal.length !== 5) {
      newErrors.codigo_postal = "El código postal debe tener 5 dígitos";
    }

    //Validar teléfono solo si tiene contenido
    if (formData.telefono) {
      if (formData.telefono.length !== 10) {
        newErrors.telefono = "El número de teléfono debe tener 10 dígitos";
      } else if (!/^\d+$/.test(formData.telefono)) {
        newErrors.telefono = "El número de teléfono solo debe contener números";
      }
    }

    //Validar email solo si tiene contenido
    if (formData.email && !validateEmail(formData.email)) {
      newErrors.email = "Correo inválido";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Función para manejar el envío del formulario
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateFields()) {
      toast.error("Por favor, llena todos los campos correctamente");
      return;
    }

    const supplierData = {
      id: initialData ? initialData.id : uuidv4(),
      ...formData,
      empresa_id: selectedEnterprise,
    };

    if (initialData) {
      onEditSuppliers(supplierData);
    } else {
      onAddSuppliers(supplierData);
    }
    handleCloseDialog();
  };

  // Función para cerrar el diálogo
  const handleCloseDialog = () => {
    setFormData({
      nombre: "",
      telefono: "",
      email: "",
      calle: "",
      numero_exterior: "",
      numero_interior: "",
      colonia: "",
      localidad: "",
      municipio: "",
      estado: "",
      codigo_postal: "",
      observaciones: "",
    });
    setErrors({
      nombre: "",
      telefono: "",
      email: "",
      calle: "",
      numero_exterior: "",
      numero_interior: "",
      colonia: "",
      localidad: "",
      municipio: "",
      estado: "",
      codigo_postal: "",
      observaciones: "",
    });
    setOpen(false);
    onClose();
  };

  const titleStyle = {
    fontFamily: "Inter, sans-serif",
    fontWeight: "bold",
    fontSize: "14px",
    marginBottom: 2,
  };

  const subtitleStyle = {
    fontSize: 16,
    fontWeight: 500,
    marginY: 1,
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={handleCloseDialog}
        PaperProps={{
          component: "form",
          sx: {
            width: { xs: "95%", sm: "64rem" },
            maxWidth: "none",
            height: { xs: "auto", sm: "41rem" },
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
          {initialData ? "Editar Proveedor" : "Nuevo Proveedor"}
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
          <Box sx={{ mb: 2 }}>
            <Typography sx={titleStyle}>Información Principal</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="h6" sx={subtitleStyle}>
                  Nombre
                </Typography>{" "}
                <TextField
                  name="nombre"
                  label="Nombre"
                  variant="outlined"
                  fullWidth
                  value={formData.nombre}
                  onChange={handleChange}
                  error={!!errors.nombre}
                  helperText={errors.nombre}
                />
              </Grid>
            </Grid>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" sx={subtitleStyle}>
                  Correo Electrónico
                </Typography>{" "}
                <TextField
                  variant="outlined"
                  label="Correo Electrónico"
                  fullWidth
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  error={!!errors.email}
                  helperText={errors.email}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" sx={subtitleStyle}>
                  Teléfono
                </Typography>{" "}
                <TextField
                  variant="outlined"
                  label="Teléfono"
                  fullWidth
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                  error={!!errors.telefono}
                  helperText={errors.telefono}
                  inputProps={{ maxLength: 10 }}
                />
              </Grid>
            </Grid>
            <hr />
            <Typography sx={titleStyle}>Domicilio</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="calle"
                  label="Calle"
                  variant="outlined"
                  fullWidth
                  value={formData.calle}
                  onChange={handleChange}
                  error={!!errors.calle}
                  helperText={errors.calle}
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  name="numero_exterior"
                  variant="outlined"
                  label="Número exterior"
                  fullWidth
                  value={formData.numero_exterior}
                  onChange={handleChange}
                  error={!!errors.numero_exterior}
                  helperText={errors.numero_exterior}
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  name="numero_interior"
                  variant="outlined"
                  label="Número interior"
                  fullWidth
                  value={formData.numero_interior}
                  onChange={handleChange}
                  error={!!errors.numero_interior}
                  helperText={errors.numero_interior}
                />
              </Grid>
            </Grid>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="colonia"
                  label="Colonia"
                  variant="outlined"
                  fullWidth
                  value={formData.colonia}
                  onChange={handleChange}
                  error={!!errors.colonia}
                  helperText={errors.colonia}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="localidad"
                  label="Localidad"
                  variant="outlined"
                  fullWidth
                  value={formData.localidad}
                  onChange={handleChange}
                  error={!!errors.localidad}
                  helperText={errors.localidad}
                />
              </Grid>
            </Grid>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={4}>
                <TextField
                  name="municipio"
                  label="Municipio"
                  variant="outlined"
                  fullWidth
                  value={formData.municipio}
                  onChange={handleChange}
                  error={!!errors.municipio}
                  helperText={errors.municipio}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  name="estado"
                  label="Estado"
                  variant="outlined"
                  fullWidth
                  value={formData.estado}
                  onChange={handleChange}
                  error={!!errors.estado}
                  helperText={errors.estado}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  name="codigo_postal"
                  label="Código Postal"
                  variant="outlined"
                  fullWidth
                  value={formData.codigo_postal}
                  onChange={handleChange}
                  error={!!errors.codigo_postal}
                  helperText={errors.codigo_postal}
                />
              </Grid>
            </Grid>
            <hr />
            <Typography sx={titleStyle}>Información Adicional</Typography>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12}>
                  <TextField
                    name="observaciones"
                    label="Observaciones"
                    variant="outlined"
                    fullWidth
                    value={formData.observaciones}
                    onChange={handleChange}
                    error={!!errors.observaciones}
                    helperText={errors.observaciones}
                  />
                </Grid>
              </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleSubmit}
            variant="contained"
            sx={{
              borderRadius: 100,
              backgroundColor: "#000",
              color: "#fff",
              fontFamily: "Inter, sans-serif",
              fontSize: 12,
              textTransform: "none",
            }}
          >
            {initialData ? "Guardar cambios" : "Guardar"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
