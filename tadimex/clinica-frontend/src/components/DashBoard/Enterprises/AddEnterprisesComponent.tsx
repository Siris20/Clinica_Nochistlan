import React, { useEffect, useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
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
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  FormControl,
} from "@mui/material";
import { v4 as uuidv4 } from "uuid";
import { toast } from "react-toastify";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import { Grid } from "@mui/material";
import { useEnterprise } from "../../../context/EnterpriseContext";
import { FISCAL_REGIMEN_OPTIONS } from "../fiscal_regimen_sections";

export const AddEnterprisesComponent = ({
  open,
  setOpen,
  onAddEnterprise,
  onEditEnterprise,
  initialData,
  onClose,
}) => {
  const { refreshEnterprises } = useEnterprise();

  const [formData, setFormData] = useState({
    name: "",
    calle: "",
    numero_exterior: "",
    numero_interior: "",
    colonia: "",
    localidad: "",
    municipio: "",
    estado: "",
    codigo_postal: "",
    phone_number: "",
    SAT_certificate: "",
    SAT_stamp: "",
    regimen_fiscal: "",
  });

  const [errors, setErrors] = useState({
    name: "",
    calle: "",
    numero_exterior: "",
    numero_interior: "",
    colonia: "",
    localidad: "",
    municipio: "",
    estado: "",
    codigo_postal: "",
    phone_number: "",
    SAT_certificate: "",
    SAT_stamp: "",
    regimen_fiscal: "",
  });

  // UseEffect para cargar los datos iniciales cuando se está editando
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        calle: initialData.calle || "",
        numero_exterior: initialData.numero_exterior || "",
        numero_interior: initialData.numero_interior || "",
        colonia: initialData.colonia || "",
        localidad: initialData.localidad || "",
        municipio: initialData.municipio || "",
        estado: initialData.estado || "",
        codigo_postal: initialData.codigo_postal || "",
        phone_number: initialData.phone_number || "",
        SAT_certificate: initialData.SAT_certificate || "",
        SAT_stamp: initialData.SAT_stamp || "",
        regimen_fiscal: initialData.regimen_fiscal || "",
      });
    }
  }, [initialData]);

  // Función para manejar cambios en los campos del formulario
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "phone_number" && value && !/^\d*$/.test(value)) {
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
  const validateFiels = () => {
    const newErrors = {};

    const requiredFields = [
      "name",
      "calle",
      "numero_exterior",
      "colonia",
      "localidad",
      "municipio",
      "estado",
      "codigo_postal",
      "phone_number",
      "SAT_certificate",
      "SAT_stamp",
      "regimen_fiscal",
    ];

    requiredFields.forEach((key) => {
      if (!formData[key]) {
        newErrors[key] = "Campo requerido";
      }
    });

    //Para validar el número de teléfono
    if (formData.phone_number.length !== 10) {
      newErrors.phone_number = "El número de teléfono debe tener 10 dígitos";
    } else if (!/^\d+$/.test(formData.phone_number)) {
      newErrors.phone_number =
        "El número de teléfono solo debe contener números";
    }

    //Para validar el código postal
    if (formData.codigo_postal.length !== 5) {
      newErrors.codigo_postal = "El código postal debe tener 5 dígitos";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Función para manejar el envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateFiels()) {
      toast.error("Por favor, llena todos los campos correctamente");
      return;
    }

    const enterpriseData = {
      id: initialData ? initialData.id : uuidv4(),
      ...formData,
    };

    try {
      if (initialData) {
        await onEditEnterprise(enterpriseData);
      } else {
        await onAddEnterprise(enterpriseData);
      }
      refreshEnterprises();
      handleCloseDialog();
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Función para cerrar el diálogo
  const handleCloseDialog = () => {
    setFormData({
      name: "",
      calle: "",
      numero_exterior: "",
      numero_interior: "",
      colonia: "",
      localidad: "",
      municipio: "",
      estado: "",
      codigo_postal: "",
      phone_number: "",
      SAT_certificate: "",
      SAT_stamp: "",
      regimen_fiscal: "",
    });
    setErrors({
      name: "",
      calle: "",
      numero_exterior: "",
      numero_interior: "",
      colonia: "",
      localidad: "",
      municipio: "",
      estado: "",
      codigo_postal: "",
      phone_number: "",
      SAT_certificate: "",
      SAT_stamp: "",
      regimen_fiscal: "",
    });
    setOpen(false);
    onClose();
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
          {initialData ? "Editar Empresa" : "Nueva Empresa"}
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
          <h5 style={{ margin: 16 }}>Información de la empresa</h5>
          <TextField
            variant="outlined"
            label="Nombre"
            fullWidth
            required
            name="name"
            value={formData.name}
            onChange={handleChange}
            sx={{ mt: 2 }}
            error={!!errors.name}
            helperText={errors.name}
          />
          <h5 style={{ margin: 16 }}>Dirección</h5>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                variant="outlined"
                label="Calle"
                fullWidth
                required
                name="calle"
                value={formData.calle}
                onChange={handleChange}
                error={!!errors.calle}
                helperText={errors.calle}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                variant="outlined"
                label="Número exterior"
                fullWidth
                required
                name="numero_exterior"
                value={formData.numero_exterior}
                onChange={handleChange}
                error={!!errors.numero_exterior}
                helperText={errors.numero_exterior}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                variant="outlined"
                label="Número interior"
                fullWidth
                name="numero_interior"
                value={formData.numero_interior}
                onChange={handleChange}
              />
            </Grid>
          </Grid>

          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                variant="outlined"
                label="Colonia"
                fullWidth
                required
                name="colonia"
                value={formData.colonia}
                onChange={handleChange}
                error={!!errors.colonia}
                helperText={errors.colonia}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                variant="outlined"
                label="Localidad"
                fullWidth
                required
                name="localidad"
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
                variant="outlined"
                label="Municipio"
                fullWidth
                required
                name="municipio"
                value={formData.municipio}
                onChange={handleChange}
                error={!!errors.municipio}
                helperText={errors.municipio}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                variant="outlined"
                label="Estado"
                fullWidth
                required
                name="estado"
                value={formData.estado}
                onChange={handleChange}
                error={!!errors.estado}
                helperText={errors.estado}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                variant="outlined"
                label="Código Postal"
                fullWidth
                required
                name="codigo_postal"
                value={formData.codigo_postal}
                onChange={handleChange}
                error={!!errors.codigo_postal}
                helperText={errors.codigo_postal}
                inputProps={{ maxLength: 5 }}
              />
            </Grid>
          </Grid>

          <h5 style={{ margin: "16px 0 8px 0" }}>
            Información de contacto y fiscal
          </h5>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                variant="outlined"
                label="Teléfono"
                fullWidth
                required
                name="phone_number"
                value={formData.phone_number}
                onChange={handleChange}
                error={!!errors.phone_number}
                helperText={errors.phone_number}
                inputProps={{ maxLength: 10 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                variant="outlined"
                label="Certificado SAT"
                fullWidth
                required
                name="SAT_certificate"
                value={formData.SAT_certificate}
                onChange={handleChange}
                error={!!errors.SAT_certificate}
                helperText={errors.SAT_certificate}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                variant="outlined"
                label="Sello SAT"
                fullWidth
                required
                name="SAT_stamp"
                value={formData.SAT_stamp}
                onChange={handleChange}
                error={!!errors.SAT_stamp}
                helperText={errors.SAT_stamp}
              />
            </Grid>
          </Grid>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="h6" sx={subtitleStyle}>
                Régimen Fiscal
              </Typography>
              <FormControl fullWidth error={!!errors.regimen_fiscal}>
                <InputLabel>Régimen Fiscal</InputLabel>
                <Select
                  label="Régimen Fiscal"
                  name="regimen_fiscal"
                  value={formData.regimen_fiscal || ""}
                  onChange={handleChange}
                >
                  {
                    FISCAL_REGIMEN_OPTIONS.MORAL.map(
                      (option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      )
                    )}
                </Select>
                {errors.regimen_fiscal && (
                  <FormHelperText>{errors.regimen_fiscal}</FormHelperText>
                )}
              </FormControl>
            </Grid>
          </Grid>
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
