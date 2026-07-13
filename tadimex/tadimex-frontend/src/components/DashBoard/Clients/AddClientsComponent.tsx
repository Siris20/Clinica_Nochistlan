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
  Select,
  MenuItem,
  FormControl,
  Box,
  Typography,
  FormHelperText,
  Chip,
  InputLabel,
} from "@mui/material";
import { v4 as uuidv4 } from "uuid";
import { toast } from "react-toastify";
import { useEnterprises } from "../../../hooks/Enterprises/useEnterprises";
import { Grid } from "@mui/material";
import { useEnterprise } from "../../../context/EnterpriseContext";
import { FISCAL_REGIMEN_OPTIONS } from "../fiscal_regimen_sections";

export const AddClientsComponent = ({
  open,
  setOpen,
  onAddClients,
  onEditClients,
  initialData,
  onClose,
}) => {
  const { selectedEnterprise } = useEnterprise();

  const [formData, setFormData] = useState({
    nombre_fiscal: "",
    tipo_persona: "",
    regimen_fiscal: "",
    rfc: "",
    contact_name: "",
    alias: "",
    land_line: "",
    phone_number: "",
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
    nombre_fiscal: "",
    tipo_persona: "",
    regimen_fiscal: "",
    rfc: "",
    contact_name: "",
    alias: "",
    land_line: "",
    phone_number: "",
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

  const [isSubmitted, setIsSubmitted] = useState(false);

  // UseEffect para cargar los datos iniciales cuando se está editando
  useEffect(() => {
    if (initialData) {
      setFormData({
        nombre_fiscal: initialData.nombre_fiscal,
        tipo_persona: initialData.tipo_persona,
        regimen_fiscal: initialData.regimen_fiscal,
        rfc: initialData.rfc,
        contact_name: initialData.contact_name,
        alias: initialData.alias,
        land_line: initialData.land_line,
        phone_number: initialData.phone_number,
        email: initialData.email,
        calle: initialData.calle,
        numero_exterior: initialData.numero_exterior,
        numero_interior: initialData.numero_interior,
        colonia: initialData.colonia,
        localidad: initialData.localidad,
        municipio: initialData.municipio,
        estado: initialData.estado,
        codigo_postal: initialData.codigo_postal,
        observaciones: initialData.observaciones,
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

    if (name === "phone_number" && value && !/^\d*$/.test(value)) {
      return;
    }

    if (name === "land_line" && value && !/^\d*$/.test(value)) {
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


    if(name==="rfc") {
      if(formData.tipo_persona==="FISICA" && value.length>13){
        return;
      }
      if(formData.tipo_persona==="MORAL" && value.length>12){
        return;
      }
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
      "nombre_fiscal",
      "tipo_persona",
      "regimen_fiscal",
      "rfc",
      "contact_name",
      "alias",
      "land_line",
      "phone_number",
      "email",
      "calle",
      "numero_exterior",
      "colonia",
      "localidad",
      "municipio",
      "estado",
      "codigo_postal",
    ];

    requiredFields.forEach((key) => {
      if (!formData[key]) {
        newErrors[key] = "Campo requerido";
      }
    });

    //Validar teléfono
    if (formData.phone_number.length !== 10) {
      newErrors.phone_number = "El número de teléfono debe tener 10 dígitos";
    } else if (!/^\d+$/.test(formData.phone_number)) {
      newErrors.phone_number =
        "El número de teléfono solo debe contener números";
    }

    //Validar teléfono fijo
    if (formData.land_line.length !== 10) {
      newErrors.land_line = "El número de teléfono debe tener 10 dígitos";
    } else if (!/^\d+$/.test(formData.land_line)) {
      newErrors.land_line = "El número de teléfono solo debe contener números";
    }

    //Validar email
    if (!validateEmail(formData.email)) {
      newErrors.email = "Correo inválido";
    }

    //Validar RFC según el tipo de persona
    if(formData.tipo_persona === "FISICA" && formData.rfc.length !== 13){
      newErrors.rfc = "El RFC  de la persona Fisica, debe tener 13 caracteres";
    } else if (formData.tipo_persona === "MORAL" && formData.rfc.length !== 12) {
      newErrors.rfc = "El RFC de la persona Moral, debe tener 12 caracteres";
    }

    //Validar código postal
    if (formData.codigo_postal.length !== 5) {
      newErrors.codigo_postal = "El código postal debe tener 5 dígitos";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Función para manejar el envío del formulario
  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitted(true);

    if (!validateFields()) {
      toast.error("Por favor, llena todos los campos correctamente");
      return;
    }

    const clientData = {
      id: initialData ? initialData.id : uuidv4(),
      ...formData,
      empresa_id: selectedEnterprise,
    };

    if (initialData) {
      onEditClients(clientData);
    } else {
      onAddClients(clientData);
    }
    handleCloseDialog();
  };

  // Función para cerrar el diálogo
  const handleCloseDialog = () => {
    setIsSubmitted(false);
    setFormData({
      nombre_fiscal: "",
      tipo_persona: "",
      regimen_fiscal: "",
      rfc: "",
      contact_name: "",
      alias: "",
      land_line: "",
      phone_number: "",
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
      nombre_fiscal: "",
      tipo_persona: "",
      regimen_fiscal: "",
      rfc: "",
      contact_name: "",
      alias: "",
      land_line: "",
      phone_number: "",
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
          {initialData ? "Editar Cliente" : "Nuevo Cliente"}
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
              <Grid item xs={12} sm={6}>
                <Typography variant="h6" sx={subtitleStyle}>
                  Nombre Fiscal
                </Typography>{" "}
                <TextField
                  name="nombre_fiscal"
                  label="Nombre Fiscal"
                  variant="outlined"
                  fullWidth
                  value={formData.nombre_fiscal}
                  onChange={handleChange}
                  error={!!errors.nombre_fiscal}
                  helperText={errors.nombre_fiscal}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="h6" sx={subtitleStyle}>
                  RFC
                </Typography>{" "}
                <TextField
                  name="rfc"
                  label="RFC"
                  variant="outlined"
                  fullWidth
                  value={formData.rfc}
                  onChange={handleChange}
                  error={!!errors.rfc}
                  helperText={errors.rfc}
                  inputProps={{
                    maxLength: formData.tipo_persona === "FISICA" ? 13 : 12,
                  }}
                />
              </Grid>
            </Grid>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="h6" sx={subtitleStyle}>
                  Tipo de Persona
                </Typography>{" "}
                <FormControl fullWidth error={!!errors.tipo_persona}>
                  <InputLabel>Tipo de Persona</InputLabel>
                  <Select
                    label="Tipo de Persona"
                    name="tipo_persona"
                    value={formData.tipo_persona || ""}
                    onChange={handleChange}
                  >
                    <MenuItem value="FISICA">Física</MenuItem>
                    <MenuItem value="MORAL">Moral</MenuItem>
                  </Select>
                  {errors.tipo_persona && (
                    <FormHelperText>{errors.tipo_persona}</FormHelperText>
                  )}
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
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
                    {formData.tipo_persona &&
                      FISCAL_REGIMEN_OPTIONS[formData.tipo_persona].map(
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
            <hr />
            <Typography sx={titleStyle}>Información de Contacto</Typography>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="contact_name"
                  label="Nombre de Contacto"
                  variant="outlined"
                  fullWidth
                  value={formData.contact_name}
                  onChange={handleChange}
                  error={!!errors.contact_name}
                  helperText={errors.contact_name}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="alias"
                  label="Alias"
                  variant="outlined"
                  fullWidth
                  value={formData.alias}
                  onChange={handleChange}
                  error={!!errors.alias}
                  helperText={errors.alias}
                />
              </Grid>
            </Grid>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} md={4}>
                <TextField
                  variant="outlined"
                  label="Teléfono Fijo"
                  fullWidth
                  required
                  name="land_line"
                  value={formData.land_line}
                  onChange={handleChange}
                  error={!!errors.land_line}
                  helperText={errors.land_line}
                  inputProps={{ maxLength: 10 }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  variant="outlined"
                  label="Teléfono Celular"
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
              <Grid item xs={12} md={4}>
                <TextField
                  variant="outlined"
                  label="Correo Electrónico"
                  fullWidth
                  required
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  error={!!errors.email}
                  helperText={errors.email}
                />
              </Grid>
            </Grid>

            <hr />
            <Typography sx={titleStyle}>Domicilio Fiscal</Typography>
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
            <Typography sx={titleStyle}>Observaciones</Typography>
            <TextField
              variant="outlined"
              label="Observaciones"
              fullWidth
              required
              name="observaciones"
              value={formData.observaciones}
              onChange={(e) => {
                if (e.target.value.length <= 200) {
                  handleChange(e);
                }
              }}
              error={!!errors.observaciones}
              helperText={errors.observaciones}
              inputProps={{ maxLength: 200 }}
            />
            <Box
              display="flex"
              justifyContent="flex-end"
              mt={0.5}
              sx={{
                color:
                  200 - (formData.observaciones?.length || 0) <= 10
                    ? "error.main"
                    : "text.secondary",
                fontSize: "0.75rem",
              }}
            >
              {200 - (formData.observaciones?.length || 0)} caracteres
              restantes
            </Box>
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
