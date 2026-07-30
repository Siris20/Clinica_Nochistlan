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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  OutlinedInput,
} from "@mui/material";
import { v4 as uuidv4 } from "uuid";
import { toast } from "react-toastify";
import { useEnterprise } from "../../../../context/EnterpriseContext";
import { Grid } from "@mui/material";
import { useClients } from "../../../../hooks/Clients/useClients";

export const AddParentAccountComponent = ({
  open,
  setOpen,
  onAddParentAccount,
  onEditParentAccount,
  initialData,
  onClose,
}) => {
  //Contexto de la empresa
  const { selectedEnterprise } = useEnterprise();

  //Hook de clientes
  const { filteredClients } = useClients(selectedEnterprise);

  const [formData, setFormData] = useState({
    accountNumber: "",
    cliente_ids: [], // Cambiado de cliente_id a cliente_ids para manejar un array
    description: "",
  });

  const [errors, setErrors] = useState({
    accountNumber: "",
    cliente_ids: "", // Cambiado de cliente_id a cliente_ids
    description: "",
  });

  // UseEffect para cargar los datos iniciales cuando se está editando
  useEffect(() => {
    if (initialData) {
      setFormData({
        accountNumber: initialData.accountNumber || "",
        // Si cliente_id viene como string (un solo ID), lo convertimos en array
        // Si ya viene como array, lo usamos directamente
        cliente_ids: initialData.cliente_ids || 
                   (initialData.cliente_id ? [initialData.cliente_id] : []),
        description: initialData.description || "",
      });
    }
  }, [initialData]);

  // Función para manejar cambios en los campos del formulario
  const handleChange = (e) => {
    const { name, value } = e.target;

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

    // Validamos que tenga número de cuenta
    if (!formData.accountNumber) {
      newErrors.accountNumber = "Campo requerido";
    }

    // Validamos que tenga al menos un cliente seleccionado
    if (!formData.cliente_ids || formData.cliente_ids.length === 0) {
      newErrors.cliente_ids = "Debes seleccionar al menos un cliente";
    }

    // Validamos que tenga descripción
    if (!formData.description) {
      newErrors.description = "Campo requerido";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Función para manejar el envío del formulario
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateFiels()) {
      toast.error("Por favor, llena todos los campos correctamente");
      return;
    }

    const parentAccountData = {
      id: initialData ? initialData.id : uuidv4(),
      ...formData,
      empresa_id: selectedEnterprise,
    };

    if (initialData) {
      onEditParentAccount(parentAccountData);
    } else {
      onAddParentAccount(parentAccountData);
    }
    handleCloseDialog();
  };

  // Función para cerrar el diálogo
  const handleCloseDialog = () => {
    setFormData({
      accountNumber: "",
      cliente_ids: [],
      description: "",
    });
    setErrors({
      accountNumber: "",
      cliente_ids: "",
      description: "",
    });
    setOpen(false);
    onClose();
  };

  const subtitleStyle = {
    fontSize: 16,
    fontWeight: 500,
    marginY: 1,
  };

  // Función auxiliar para obtener el nombre del cliente por su ID
  const getClientNameById = (id) => {
    const client = filteredClients.find(client => client.id === id);
    return client ? client.nombre_fiscal : '';
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={handleCloseDialog}
        PaperProps={{
          component: "form",
          sx: {
            width: { xs: "95%", sm: "44rem" },
            maxWidth: "none",
            height: { xs: "auto", sm: "31rem" },
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
          {initialData ? "Editar Cuenta Padre" : "Registrar Cuenta Padre"}
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
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="h6" sx={subtitleStyle}>
                  No. Cuenta
                </Typography>{" "}
                <TextField
                  name="accountNumber"
                  label="No. Cuenta"
                  variant="outlined"
                  fullWidth
                  value={formData.accountNumber}
                  onChange={handleChange}
                  error={!!errors.accountNumber}
                  helperText={errors.accountNumber}
                />
              </Grid>
            </Grid>
            <Typography variant="h6" sx={subtitleStyle}>
              Clientes
            </Typography>{" "}
            <Grid item xs={12}>
              <FormControl fullWidth required error={!!errors.cliente_ids}>
                <InputLabel>Asignar Clientes</InputLabel>
                <Select
                  multiple
                  label="Clientes"
                  name="cliente_ids"
                  value={formData.cliente_ids}
                  onChange={handleChange}
                  input={<OutlinedInput label="Asignar Clientes" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip 
                          key={value} 
                          label={getClientNameById(value)} 
                        />
                      ))}
                    </Box>
                  )}
                >
                  {filteredClients.map((client) => (
                    <MenuItem key={client.id} value={client.id}>
                      {`${client.nombre_fiscal}`}
                    </MenuItem>
                  ))}
                </Select>
                {errors.cliente_ids && <Typography color="error" variant="caption">{errors.cliente_ids}</Typography>}
              </FormControl>
            </Grid>
            <Typography sx={subtitleStyle}>Descripción</Typography>
            <TextField
              variant="outlined"
              label="Descripción"
              fullWidth
              required
              name="description"
              value={formData.description}
              onChange={(e) => {
                if (e.target.value.length <= 200) {
                  handleChange(e);
                }
              }}
              error={!!errors.description}
              helperText={errors.description}
              inputProps={{ maxLength: 200 }}
            />
            <Box
              display="flex"
              justifyContent="flex-end"
              mt={0.5}
              sx={{
                color:
                  200 - (formData.description?.length || 0) <= 10
                    ? "error.main"
                    : "text.secondary",
                fontSize: "0.75rem",
              }}
            >
              {200 - (formData.description?.length || 0)} caracteres restantes
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