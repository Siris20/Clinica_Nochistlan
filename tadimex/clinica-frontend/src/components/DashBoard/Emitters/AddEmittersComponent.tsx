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
import { FISCAL_REGIMEN_OPTIONS } from "../fiscal_regimen_sections";

export const AddEmittersComponent = ({
  open,
  setOpen,
  onAddEmitters,
  onEditEmitters,
  initialData,
  onClose,
}) => {
  const { selectedEnterprise } = useEnterprise();

  const [formData, setFormData] = useState({
    rfc: "",
    razon_social: "",
    tipo_persona: "",
    regimen_fiscal: "",
    calle: "",
    numero_exterior: "",
    numero_interior: "",
    colonia: "",
    localidad: "",
    municipio: "",
    estado: "",
    codigo_postal: "",
    banco: "",
    numero_cuenta: "",
    numero_tarjeta: "",
    clabe: "",
    numero_certificado: "",
    contrasena_clave: "",
    certificado_path: "",
    clave_privada_path: "",
    es_pruebas: false,
  });

  const [errors, setErrors] = useState({
    rfc: "",
    razon_social: "",
    tipo_persona: "",
    regimen_fiscal: "",
    calle: "",
    numero_exterior: "",
    numero_interior: "",
    colonia: "",
    localidad: "",
    municipio: "",
    estado: "",
    codigo_postal: "",
    banco: "",
    numero_cuenta: "",
    numero_tarjeta: "",
    clabe: "",
    numero_certificado: "",
    contrasena_clave: "",
    certificado_path: "",
    clave_privada_path: "",
  });

  //Estados
  const [selectedCertFile, setSelectedCertFile] = useState(null);
  const [selectedKeyFile, setSelectedKeyFile] = useState(null);

  // Referencias para los inputs de archivo
  const certInputRef = useRef(null);
  const keyInputRef = useRef(null);

  // UseEffect para cargar los datos iniciales cuando se está editando
  useEffect(() => {
    if (initialData) {
      setFormData({
        rfc: initialData.rfc,
        razon_social: initialData.razon_social,
        tipo_persona: initialData.tipo_persona,
        regimen_fiscal: initialData.regimen_fiscal,
        calle: initialData.calle,
        numero_exterior: initialData.numero_exterior,
        numero_interior: initialData.numero_interior,
        colonia: initialData.colonia,
        localidad: initialData.localidad,
        municipio: initialData.municipio,
        estado: initialData.estado,
        codigo_postal: initialData.codigo_postal,
        banco: initialData.banco,
        numero_cuenta: initialData.numero_cuenta,
        numero_tarjeta: initialData.numero_tarjeta,
        clabe: initialData.clabe,
        numero_certificado: initialData.numero_certificado,
        contrasena_clave: initialData.contrasena_clave,
        certificado_path: initialData.certificado_path,
        clave_privada_path: initialData.clave_privada_path,
        es_pruebas: initialData.es_pruebas,
      });

      if(initialData.certificado_path) {
        //Creamos un objeto File a partir del nombre del archivo
        const certFileName = initialData.certificado_path.split("/").pop();
        const certFile = new File([""], certFileName, { type: "application/x-x509-ca-cert" });
        setSelectedCertFile(certFile);
      }

      if(initialData.clave_privada_path) {
        //Creamos un objeto File a partir del nombre del archivo
        const keyFileName = initialData.clave_privada_path.split("/").pop();
        const keyFile = new File([""], keyFileName, { type: "application/x-pkcs8" });
        setSelectedKeyFile(keyFile);
      }

    }
  }, [initialData]);

  // Función para manejar cambios en los campos del formulario
  const handleChange = (e) => {
    const { name, value } = e.target;

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

  // Manejadores para la selección de archivos
  const handleCertFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (!file.name.toLowerCase().endsWith(".cer")) {
        toast.error("Por favor selecciona un archivo con extensión .cer");
        return;
      }
      setSelectedCertFile(file);
    }
  };

  const handleKeyFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (!file.name.toLowerCase().endsWith(".key")) {
        toast.error("Por favor selecciona un archivo con extensión .key");
        return;
      }
      setSelectedKeyFile(file);
    }
  };

  //Validaciones
  const validateFields = () => {
    const newErrors = {};

    const requiredFields = [
      "razon_social",
      "tipo_persona",
      "regimen_fiscal",
      "numero_certificado",
      "contrasena_clave",
      "rfc",
      "calle",
      "numero_exterior",
      "colonia",
      "localidad",
      "municipio",
      "estado",
      "codigo_postal",
      "banco",
      "numero_cuenta",
      "clabe",
      "numero_tarjeta",
    ];

    requiredFields.forEach((key) => {
      if (!formData[key]) {
        newErrors[key] = "Campo requerido";
      }
    });

    //Validar código postal
    if (formData.codigo_postal.length !== 5) {
      newErrors.codigo_postal = "El código postal debe tener 5 dígitos";
    }

    //Validar RFC según el tipo de persona
    if(formData.tipo_persona === "FISICA" && formData.rfc.length !== 13){
      newErrors.rfc = "El RFC  de la persona Fisica, debe tener 13 caracteres";
    } else if (formData.tipo_persona === "MORAL" && formData.rfc.length !== 12) {
      newErrors.rfc = "El RFC de la persona Moral, debe tener 12 caracteres";
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

    const emitterData = {
      id: initialData ? initialData.id : uuidv4(),
      ...formData,
      certificado_path: selectedCertFile, 
      clave_privada_path: selectedKeyFile,
      es_pruebas: Boolean(formData.es_pruebas),
      empresa_id: selectedEnterprise,
    };

    if (initialData) {
      onEditEmitters(emitterData);
    } else {
      onAddEmitters(emitterData);
    }
    handleCloseDialog();
  };

  // Función para cerrar el diálogo
  const handleCloseDialog = () => {
    setFormData({
      rfc: "",
      razon_social: "",
      tipo_persona: "",
      regimen_fiscal: "",
      calle: "",
      numero_exterior: "",
      numero_interior: "",
      colonia: "",
      localidad: "",
      municipio: "",
      estado: "",
      codigo_postal: "",
      banco: "",
      numero_cuenta: "",
      numero_tarjeta: "",
      clabe: "",
      numero_certificado: "",
      contrasena_clave: "",
      certificado_path: "",
      clave_privada_path: "",
      es_pruebas: false,
    });
    setErrors({
      rfc: "",
      razon_social: "",
      tipo_persona: "",
      regimen_fiscal: "",
      calle: "",
      numero_exterior: "",
      numero_interior: "",
      colonia: "",
      localidad: "",
      municipio: "",
      estado: "",
      codigo_postal: "",
      banco: "",
      numero_cuenta: "",
      numero_tarjeta: "",
      clabe: "",
      numero_certificado: "",
      contrasena_clave: "",
      certificado_path: "",
      clave_privada_path: "",
    });
    setSelectedCertFile(null);
    setSelectedKeyFile(null);
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
          {initialData ? "Editar Emisor" : "Nuevo Emisor"}
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
                  Razón Social
                </Typography>{" "}
                <TextField
                  name="razon_social"
                  label="Razón Social"
                  variant="outlined"
                  fullWidth
                  value={formData.razon_social}
                  onChange={handleChange}
                  error={!!errors.razon_social}
                  helperText={errors.razon_social}
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
            <Typography sx={titleStyle}>
              Información para recepción de pagos
            </Typography>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="banco"
                  label="Banco"
                  variant="outlined"
                  fullWidth
                  value={formData.banco}
                  onChange={handleChange}
                  error={!!errors.banco}
                  helperText={errors.banco}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="numero_cuenta"
                  label="No. Cuenta Bancaria"
                  variant="outlined"
                  fullWidth
                  value={formData.numero_cuenta}
                  onChange={handleChange}
                  error={!!errors.numero_cuenta}
                  helperText={errors.numero_cuenta}
                />
              </Grid>
            </Grid>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="numero_tarjeta"
                  label="No. Tarjeta"
                  variant="outlined"
                  fullWidth
                  value={formData.numero_tarjeta}
                  onChange={handleChange}
                  error={!!errors.numero_tarjeta}
                  helperText={errors.numero_tarjeta}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="clabe"
                  label="CLABE Interbancaria"
                  variant="outlined"
                  fullWidth
                  value={formData.clabe}
                  onChange={handleChange}
                  error={!!errors.clabe}
                  helperText={errors.clabe}
                />
              </Grid>
            </Grid>
            <hr />
            <Typography sx={{ ...titleStyle, mb: 3 }}>
              Certificado del sello digital
            </Typography>
            <Box sx={{ mb: 4 }}>
              <Typography
                sx={{
                  fontSize: "14px",
                  color: "#1C1B1F",
                  mb: 2,
                }}
              >
                Certificado (.cer)
              </Typography>
              <input
                type="file"
                ref={certInputRef}
                onChange={handleCertFileSelect}
                accept=".cer"
                style={{ display: "none" }}
              />
              <Grid container spacing={3}>
                <Grid item xs={12} sm={5}>
                  <Box sx={{ display: "flex", justifyContent: "center" }}>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => certInputRef.current?.click()}
                      sx={{
                        borderRadius: 100,
                        borderColor: "#CAC4D0",
                        fontSize: 14,
                        textTransform: "none",
                        color: "#49454F",
                        py: 1,
                        px: 3,
                        width: "50%",
                        justifyContent: "center",
                      }}
                    >
                      {selectedCertFile
                        ? selectedCertFile.name
                        : "Seleccionar archivo"}
                    </Button>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={7}>
                  <TextField
                    name="numero_certificado"
                    placeholder="Número de Certificado"
                    variant="outlined"
                    fullWidth
                    value={formData.numero_certificado}
                    onChange={handleChange}
                    error={!!errors.numero_certificado}
                    helperText={errors.numero_certificado}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 1,
                      },
                    }}
                  />
                </Grid>
              </Grid>
            </Box>
            <Box sx={{ mb: 4 }}>
              <Typography
                sx={{
                  fontSize: "14px",
                  color: "#1C1B1F",
                  mb: 2,
                }}
              >
                Clave Privada (.key)
              </Typography>
              <input
                type="file"
                ref={keyInputRef}
                onChange={handleKeyFileSelect}
                accept=".key"
                style={{ display: "none" }}
              />
              <Grid container spacing={3}>
                <Grid item xs={12} sm={5}>
                  <Box sx={{ display: "flex", justifyContent: "center" }}>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => keyInputRef.current?.click()}
                      sx={{
                        borderRadius: 100,
                        borderColor: "#CAC4D0",
                        fontSize: 14,
                        textTransform: "none",
                        color: "#49454F",
                        py: 1,
                        px: 3,
                        width: "50%",
                        justifyContent: "center",
                      }}
                    >
                      {selectedKeyFile
                        ? selectedKeyFile.name
                        : "Seleccionar archivo"}
                    </Button>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={7}>
                  <TextField
                    name="contrasena_clave"
                    placeholder="Contraseña de la clave privada"
                    variant="outlined"
                    type="password"
                    autoComplete="password"
                    fullWidth
                    value={formData.contrasena_clave}
                    onChange={handleChange}
                    error={!!errors.contrasena_clave}
                    helperText={errors.contrasena_clave}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 1,
                      },
                    }}
                  />
                </Grid>
              </Grid>
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
