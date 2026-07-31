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
  Grid,
  InputLabel,
} from "@mui/material";
import { toast } from "react-toastify";

interface AddPatientsComponentProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  onAddPatient: (data: any) => Promise<void>;
  onEditPatient: (data: any) => Promise<void>;
  initialData: any;
  onClose: () => void;
}

export const AddPatientsComponent: React.FC<AddPatientsComponentProps> = ({
  open,
  setOpen,
  onAddPatient,
  onEditPatient,
  initialData,
  onClose,
}) => {
  const [formData, setFormData] = useState({
    nombre: "",
    apellido_paterno: "",
    apellido_materno: "",
    fecha_nacimiento: "",
    edad: "",
    peso: "",
    altura: "",
    genero: "",
    curp: "",
    grupo_sanguineo: "",
    alergias: "",
    contacto_emergencia_nombre: "",
    contacto_emergencia_telefono: "",
    contacto_emergencia_parentesco: "",
    estatus: "activo",
    telefono_celular: "",
    telefono_fijo: "",
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

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        nombre: initialData.nombre || "",
        apellido_paterno: initialData.apellido_paterno || "",
        apellido_materno: initialData.apellido_materno || "",
        fecha_nacimiento: initialData.fecha_nacimiento || "",
        edad:
          initialData.edad !== null && initialData.edad !== undefined
            ? String(initialData.edad)
            : "",
        peso:
          initialData.peso !== null && initialData.peso !== undefined
            ? String(initialData.peso)
            : "",
        altura:
          initialData.altura !== null && initialData.altura !== undefined
            ? String(initialData.altura)
            : "",
        genero: initialData.genero || "",
        curp: initialData.curp || "",
        grupo_sanguineo: initialData.grupo_sanguineo || "",
        alergias: initialData.alergias || "",
        contacto_emergencia_nombre:
          initialData.contacto_emergencia_nombre || "",
        contacto_emergencia_telefono:
          initialData.contacto_emergencia_telefono || "",
        contacto_emergencia_parentesco:
          initialData.contacto_emergencia_parentesco || "",
        estatus: initialData.estatus || "activo",
        telefono_celular: initialData.telefono_celular || "",
        telefono_fijo: initialData.telefono_fijo || "",
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

  const validateEmail = (email: string) => {
    if (!email) return true;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleChange = (e: any) => {
    const { name, value } = e.target;

    if (
      (name === "telefono_celular" ||
        name === "telefono_fijo" ||
        name === "contacto_emergencia_telefono" ||
        name === "codigo_postal" ||
        name === "edad") &&
      value &&
      !/^\d*$/.test(value)
    ) {
      return;
    }

    if (name === "curp" && value.length > 18) {
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

  const validateFields = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = "El nombre del paciente es obligatorio.";
    }

    if (formData.telefono_celular && formData.telefono_celular.length !== 10) {
      newErrors.telefono_celular = "El celular debe contener 10 dígitos.";
    }

    if (formData.telefono_fijo && formData.telefono_fijo.length !== 10) {
      newErrors.telefono_fijo = "El teléfono fijo debe contener 10 dígitos.";
    }

    if (
      formData.contacto_emergencia_telefono &&
      formData.contacto_emergencia_telefono.length !== 10
    ) {
      newErrors.contacto_emergencia_telefono = "El teléfono debe contener 10 dígitos.";
    }

    if (formData.email && !validateEmail(formData.email)) {
      newErrors.email = "Correo electrónico inválido.";
    }

    if (formData.curp) {
      const curpRegex = /^[A-Z]{4}\d{6}[HM][A-Z]{5}[0-9A-Z]\d$/i;
      if (formData.curp.length !== 18) {
        newErrors.curp = "La CURP debe contener 18 caracteres.";
      } else if (!curpRegex.test(formData.curp)) {
        newErrors.curp = "Formato de CURP inválido.";
      }
    }

    if (formData.codigo_postal && formData.codigo_postal.length !== 5) {
      newErrors.codigo_postal = "El código postal debe tener 5 dígitos.";
    }

    if (formData.edad !== "") {
      const edadNum = Number(formData.edad);
      if (isNaN(edadNum) || edadNum < 0 || edadNum > 120) {
        newErrors.edad = "Ingresa una edad válida (0-120).";
      }
    }

    if (formData.peso !== "") {
      const pesoNum = Number(formData.peso);
      if (isNaN(pesoNum) || pesoNum <= 0) {
        newErrors.peso = "Ingresa un peso válido.";
      }
    }

    if (formData.altura !== "") {
      const alturaNum = Number(formData.altura);
      if (isNaN(alturaNum) || alturaNum <= 0) {
        newErrors.altura = "Ingresa una altura válida.";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateFields()) {
      toast.error("Por favor, llena los campos correctamente.");
      return;
    }

    const patientData = {
      id: initialData ? initialData.id : undefined,
      ...formData,
    };

    try {
      if (initialData) {
        await onEditPatient(patientData);
      } else {
        await onAddPatient(patientData);
      }
      handleCloseDialog();
    } catch (error: any) {
      toast.error(error.message || "Error al guardar el paciente");
    }
  };

  const handleCloseDialog = () => {
    setFormData({
      nombre: "",
      apellido_paterno: "",
      apellido_materno: "",
      fecha_nacimiento: "",
      edad: "",
      peso: "",
      altura: "",
      genero: "",
      curp: "",
      grupo_sanguineo: "",
      alergias: "",
      contacto_emergencia_nombre: "",
      contacto_emergencia_telefono: "",
      contacto_emergencia_parentesco: "",
      estatus: "activo",
      telefono_celular: "",
      telefono_fijo: "",
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
    setErrors({});
    setOpen(false);
    onClose();
  };

  const titleStyle = {
    fontFamily: "Inter, sans-serif",
    fontWeight: "bold",
    fontSize: "14px",
    marginBottom: 2,
    marginTop: 1,
  };

  return (
    <Dialog
      open={open}
      onClose={handleCloseDialog}
      PaperProps={{
        component: "form",
        sx: {
          width: { xs: "95%", sm: "64rem" },
          maxWidth: "none",
          height: { xs: "auto", sm: "42rem" },
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
        {initialData ? "Editar Paciente" : "Nuevo Paciente"}
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
      <DialogContent dividers>
        <Box sx={{ mb: 2 }}>
          {/* Información Personal */}
          <Typography sx={titleStyle}>Datos Personales</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <TextField
                name="nombre"
                label="Nombre(s)"
                variant="outlined"
                fullWidth
                required
                value={formData.nombre}
                onChange={handleChange}
                error={!!errors.nombre}
                helperText={errors.nombre}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                name="apellido_paterno"
                label="Apellido Paterno"
                variant="outlined"
                fullWidth
                value={formData.apellido_paterno}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                name="apellido_materno"
                label="Apellido Materno"
                variant="outlined"
                fullWidth
                value={formData.apellido_materno}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                name="fecha_nacimiento"
                label="Fecha de Nacimiento"
                type="date"
                variant="outlined"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={formData.fecha_nacimiento}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={2}>
              <TextField
                name="edad"
                label="Edad"
                variant="outlined"
                fullWidth
                value={formData.edad}
                onChange={handleChange}
                error={!!errors.edad}
                helperText={errors.edad}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth>
                <InputLabel>Género</InputLabel>
                <Select
                  label="Género"
                  name="genero"
                  value={formData.genero}
                  onChange={handleChange}
                >
                  <MenuItem value="Masculino">Masculino</MenuItem>
                  <MenuItem value="Femenino">Femenino</MenuItem>
                  <MenuItem value="Otro">Otro</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                name="curp"
                label="CURP"
                variant="outlined"
                fullWidth
                value={formData.curp}
                onChange={handleChange}
                error={!!errors.curp}
                helperText={errors.curp}
                inputProps={{ maxLength: 18 }}
              />
            </Grid>
          </Grid>

          <hr style={{ margin: "16px 0", border: "0.5px solid #eee" }} />

          {/* Datos Médicos Básicos */}
          <Typography sx={titleStyle}>Información Médica Básica</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth>
                <InputLabel>Grupo Sanguíneo</InputLabel>
                <Select
                  label="Grupo Sanguíneo"
                  name="grupo_sanguineo"
                  value={formData.grupo_sanguineo}
                  onChange={handleChange}
                >
                  {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(
                    (tipo) => (
                      <MenuItem key={tipo} value={tipo}>
                        {tipo}
                      </MenuItem>
                    )
                  )}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                name="peso"
                label="Peso (kg)"
                variant="outlined"
                fullWidth
                value={formData.peso}
                onChange={handleChange}
                error={!!errors.peso}
                helperText={errors.peso}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                name="altura"
                label="Altura (m)"
                variant="outlined"
                fullWidth
                value={formData.altura}
                onChange={handleChange}
                error={!!errors.altura}
                helperText={errors.altura}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth>
                <InputLabel>Estatus</InputLabel>
                <Select
                  label="Estatus"
                  name="estatus"
                  value={formData.estatus}
                  onChange={handleChange}
                >
                  <MenuItem value="activo">Activo</MenuItem>
                  <MenuItem value="inactivo">Inactivo</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="alergias"
                label="Alergias o condiciones médicas"
                variant="outlined"
                multiline
                rows={2}
                fullWidth
                value={formData.alergias}
                onChange={handleChange}
              />
            </Grid>
          </Grid>

          <hr style={{ margin: "16px 0", border: "0.5px solid #eee" }} />

          {/* Contacto de Emergencia */}
          <Typography sx={titleStyle}>Contacto de Emergencia</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={5}>
              <TextField
                name="contacto_emergencia_nombre"
                label="Nombre de Contacto"
                variant="outlined"
                fullWidth
                value={formData.contacto_emergencia_nombre}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                name="contacto_emergencia_telefono"
                label="Teléfono de Emergencia"
                variant="outlined"
                fullWidth
                value={formData.contacto_emergencia_telefono}
                onChange={handleChange}
                error={!!errors.contacto_emergencia_telefono}
                helperText={errors.contacto_emergencia_telefono}
                inputProps={{ maxLength: 10 }}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                name="contacto_emergencia_parentesco"
                label="Parentesco"
                variant="outlined"
                fullWidth
                value={formData.contacto_emergencia_parentesco}
                onChange={handleChange}
              />
            </Grid>
          </Grid>

          <hr style={{ margin: "16px 0", border: "0.5px solid #eee" }} />

          {/* Información de Contacto */}
          <Typography sx={titleStyle}>
            Información de Contacto y Ubicación
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <TextField
                name="telefono_celular"
                label="Teléfono Celular"
                variant="outlined"
                fullWidth
                value={formData.telefono_celular}
                onChange={handleChange}
                error={!!errors.telefono_celular}
                helperText={errors.telefono_celular}
                inputProps={{ maxLength: 10 }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                name="telefono_fijo"
                label="Teléfono Fijo"
                variant="outlined"
                fullWidth
                value={formData.telefono_fijo}
                onChange={handleChange}
                error={!!errors.telefono_fijo}
                helperText={errors.telefono_fijo}
                inputProps={{ maxLength: 10 }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                name="email"
                label="Correo Electrónico"
                variant="outlined"
                fullWidth
                value={formData.email}
                onChange={handleChange}
                error={!!errors.email}
                helperText={errors.email}
              />
            </Grid>
          </Grid>

          {/* Domicilio */}
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                name="calle"
                label="Calle"
                variant="outlined"
                fullWidth
                value={formData.calle}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                name="numero_exterior"
                label="Número Exterior"
                variant="outlined"
                fullWidth
                value={formData.numero_exterior}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                name="numero_interior"
                label="Número Interior"
                variant="outlined"
                fullWidth
                value={formData.numero_interior}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                name="colonia"
                label="Colonia"
                variant="outlined"
                fullWidth
                value={formData.colonia}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                name="localidad"
                label="Localidad"
                variant="outlined"
                fullWidth
                value={formData.localidad}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                name="municipio"
                label="Municipio"
                variant="outlined"
                fullWidth
                value={formData.municipio}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="estado"
                label="Estado"
                variant="outlined"
                fullWidth
                value={formData.estado}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="codigo_postal"
                label="Código Postal"
                variant="outlined"
                fullWidth
                value={formData.codigo_postal}
                onChange={handleChange}
                error={!!errors.codigo_postal}
                helperText={errors.codigo_postal}
                inputProps={{ maxLength: 5 }}
              />
            </Grid>
          </Grid>

          <hr style={{ margin: "16px 0", border: "0.5px solid #eee" }} />

          <Typography sx={titleStyle}>Observaciones</Typography>
          <TextField
            variant="outlined"
            label="Observaciones Adicionales"
            fullWidth
            multiline
            rows={2}
            name="observaciones"
            value={formData.observaciones}
            onChange={(e) => {
              if (e.target.value.length <= 255) {
                handleChange(e);
              }
            }}
            inputProps={{ maxLength: 255 }}
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
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
            px: 4,
          }}
        >
          {initialData ? "Guardar cambios" : "Guardar Paciente"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};