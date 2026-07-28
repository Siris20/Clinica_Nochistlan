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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { v4 as uuidv4 } from "uuid";
import { toast } from "react-toastify";
import { useEnterprises } from "../../../hooks/Enterprises/useEnterprises";
import { useEnterprise } from "../../../context/EnterpriseContext";

export const AddAreasComponent = ({
  open,
  setOpen,
  onAddArea,
  onEditArea,
  initialData,
  onClose,
}) => {

  const {selectedEnterprise} = useEnterprise(); 
  

  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  const [errors, setErrors] = useState({
    name: "",
    description: "",
  });


  // UseEffect para cargar los datos iniciales cuando se está editando
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
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

    const requiredFields = [
      "name",
      "description",
    ];

    requiredFields.forEach((key) => {
      if (!formData[key]) {
        newErrors[key] = "Campo requerido";
      }
    });

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

    const areasData = {
      id: initialData ? initialData.id : uuidv4(),
      ...formData,
      empresa_id: selectedEnterprise
    };

    if (initialData) {
      onEditArea(areasData);
    } else {
      onAddArea(areasData);
    }
    handleCloseDialog();
  };

  // Función para cerrar el diálogo
  const handleCloseDialog = () => {
    setFormData({
      name: "",
      description: "",
    });
    setErrors({
      name: "",
      description: "",
    });
    setOpen(false);
    onClose();
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={handleCloseDialog}
        PaperProps={{
          component: "form",
          sx: {
            width: { xs: "95%", sm: "730px" },
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
          {initialData ? "Editar Área" : "Nueva Área"}
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
          <h5 style={{ margin: 16 }}>Información del área</h5>
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
          <TextField
            variant="outlined"
            label="Descripción"
            fullWidth
            required
            name="description"
            value={formData.description}
            onChange={handleChange}
            sx={{ mt: 2, mb: 2 }}
            error={!!errors.description}
            helperText={errors.description}
          />
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
