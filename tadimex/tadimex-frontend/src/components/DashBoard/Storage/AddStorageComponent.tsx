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
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { useEmployee } from "../../../hooks/Employee/useEmployee";
import { useBranches } from '../../../hooks/Branches/useBranches';
import { v4 as uuidv4 } from 'uuid';
import { toast } from "react-toastify";
import { useBranch } from "../../../context/BranchContext";

export const AddStorageComponent = ({
  open,
  setOpen,
  onAddStorage,
  onEditStorage,
  initialData,
  onClose,
}) => {

  const {selectedBranch} = useBranch(); 

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
    type: "",
    encargado_id: "",
  });

  const [errors, setErrors] = useState({
    name: "", 
    calle: "",
    numero_exterior: "",
    colonia: "",
    localidad: "",
    municipio: "",
    estado: "",
    codigo_postal: "",
    type: "",
    encargado_id: "",
  });

  //Hooks
  const { employees } = useEmployee();

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
        type: initialData.type || "",
        encargado_id: initialData.encargado_id || "",
      });
    }
  }, [initialData]);

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
      type: "",
      encargado_id: "",
    });
    setErrors({
      name: "", 
      calle: "",
      numero_exterior: "",
      colonia: "",
      localidad: "",
      municipio: "",
      estado: "",
      codigo_postal: "",
      type: "",
      encargado_id: "",
    });
    setOpen(false);
    onClose();
  };

  //Funcion para manejar los cambios en el formulario
  const handleChange = (e)=> {
    const {name, value} = e.target;

    if(name === "codigo_postal" && value && !/^\d*$/.test(value)) {
      return;
    }

    if (name === "numero_exterior" && value && !/^\d*$/.test(value)) {
      return;
    }

    if (name === "numero_interior" && value && !/^\d*$/.test(value)) {
      return;
    }

    setFormData(prev => ({ ...prev, [name]: value }));

    if(errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  }

  //Validaciones
  const validateFields = () => {
    const newErrors = {}; 

    const requiredFields = ["name", "calle", "numero_exterior", "colonia", "localidad", "municipio", "estado", "codigo_postal", "type", "encargado_id"];

    requiredFields.forEach((field) => {
      if(!formData[field]) {
        newErrors[field] = "Campo es requerido";
      }
    });

    //Validar codigo postal
    if(formData.codigo_postal.length !== 5) {
      newErrors.codigo_postal = "El código postal debe tener 5 dígitos";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }; 

  const handleSubmit = (e) => {
    e.preventDefault();

    if(!validateFields()) {
      toast.error("Por favor completa los campos requeridos");
      return;
    }

    const storageData = {
      id: initialData ? initialData.id : uuidv4(), 
      ...formData,
      sucursal_id: selectedBranch
    }

    if (initialData) {
      onEditStorage(storageData);
    } else {
      onAddStorage(storageData);
    }
    handleCloseDialog();
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
          height: { xs: "auto", sm: "auto" },
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
        {initialData ? "Editar Almacén" : "Nuevo Almacén"}
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
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <TextField
              label="Nombre"
              fullWidth
              required
              name="name"
              value={formData.name}
              onChange={handleChange}
              error={!!errors.name}
              helperText={errors.name}
            />
          </Grid>
          
          <Grid item xs={12} sm={8}>
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
          
          <Grid item xs={12} sm={2}>
            <TextField
              variant="outlined"
              label="Número Ext."
              fullWidth
              required
              name="numero_exterior"
              value={formData.numero_exterior}
              onChange={handleChange}
              error={!!errors.numero_exterior}
              helperText={errors.numero_exterior}
            />
          </Grid>
          
          <Grid item xs={12} sm={2}>
            <TextField
              variant="outlined"
              label="Número Int."
              fullWidth
              name="numero_interior"
              value={formData.numero_interior}
              onChange={handleChange}
            />
          </Grid>

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

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth required error={!!errors.type}>
              <InputLabel>Tipo</InputLabel>
              <Select
                label="Tipo"
                name="type"
                value={formData.type}
                onChange={handleChange}
              >
                <MenuItem value="PRINCIPAL">Principal</MenuItem>
                <MenuItem value="SECUNDARIO">Secundario</MenuItem>
                <MenuItem value="GARAGE">Garage</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth required error={!!errors.encargado_id}>
              <InputLabel>Encargado</InputLabel>
              <Select
                label="Encargado"
                name="encargado_id"
                value={formData.encargado_id}
                onChange={handleChange}
              >
                {employees.map((employee) => (
                  <MenuItem key={employee.id} value={employee.id}>
                    {`${employee.name} ${employee.last_name}`}
                  </MenuItem>
                ))}
              </Select>
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
  );
};