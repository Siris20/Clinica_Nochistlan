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
  Typography,
  Box,
} from "@mui/material";
import { v4 as uuidv4 } from "uuid";
import { toast } from "react-toastify";
import { useEnterprise } from "../../../context/EnterpriseContext";
import FileUploadIcon from '@mui/icons-material/FileUpload';

export const AddLogosComponent = ({
  open,
  setOpen,
  onAddLogo,
  onEditLogo,
  initialData,
  onClose,
}) => {
  const { selectedEnterprise } = useEnterprise();

  const [formData, setFormData] = useState({
    name: "",
    image_file: "",
  });

  const [errors, setErrors] = useState({
    name: "",
    image_file: "",
  });

  // UseEffect para cargar los datos iniciales cuando se está editando
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        image_file: initialData.image_url
          ? `${import.meta.env.VITE_API_SERVER}/${initialData.image_url}`
          : null,
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

  // Función auxiliar para validar las dimensiones de la imagen
  const validateImageDimensions = (file) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = URL.createObjectURL(file);

      img.onload = () => {
        URL.revokeObjectURL(img.src);
        if (img.width === 500 && img.height === 500) {
          resolve(true);
        } else {
          reject(
            new Error(
              `La imagen debe ser exactamente de 500x500 píxeles. Dimensiones actuales: ${img.width}x${img.height}`
            )
          );
        }
      };

      img.onerror = () => {
        URL.revokeObjectURL(img.src);
        reject(new Error("Error al cargar la imagen"));
      };
    });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        await validateImageDimensions(file);
        setFormData((prev) => ({
          ...prev,
          image_file: file,
        }));
        setErrors((prev) => ({
          ...prev,
          image_file: "",
        }));
      } catch (error) {
        setErrors((prev) => ({
          ...prev,
          image_file: error.message,
        }));
        setFormData((prev) => ({
          ...prev,
          image_file: null,
        }));
      }
    }
  };

  const handleDrop = async (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      try {
        await validateImageDimensions(file);
        setFormData((prev) => ({
          ...prev,
          image_file: file,
        }));
        setErrors((prev) => ({
          ...prev,
          image_file: "",
        }));
      } catch (error) {
        setErrors((prev) => ({
          ...prev,
          image_file: error.message,
        }));
        setFormData((prev) => ({
          ...prev,
          image_file: null,
        }));
      }
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const removeImage = () => {
    setFormData((prev) => ({
      ...prev,
      image_file: null,
    }));
  };

  //Validaciones
  const validateFields = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = "Campo requerido";
    if (!formData.image_file) newErrors.image_file = "La imagen es requerida";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Función para manejar el envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateFields()) {
      toast.error("Por favor, llena todos los campos correctamente");
      return;
    }

    const logoData = {
      id: initialData ? initialData.id : uuidv4(),
      ...formData,
      empresa_id: selectedEnterprise,
    };

    try {
      if (initialData) {
        await onEditLogo(logoData);
      } else {
        await onAddLogo(logoData);
      }
      handleCloseDialog();
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Función para cerrar el diálogo
  const handleCloseDialog = () => {
    setFormData({
      name: "",
      image_file: "",
    });
    setErrors({
      name: "",
      image_file: "",
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
          {initialData ? "Editar Logo" : "Nuevo Logo"}
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
          <TextField
            variant="outlined"
            label="Nombre"
            fullWidth
            required
            name="name"
            value={formData.name}
            onChange={handleChange}
            sx={{ mt: 2, mb: 3 }}
            error={!!errors.name}
            helperText={errors.name}
          />

          <Typography sx={{ mb: 1, fontWeight: 500 }}>Logo:</Typography>
          <Box
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            sx={{
              border: errors.image_file
                ? "3px dashed #d32f2f"
                : "3px dashed rgb(218, 218, 218)",
              borderRadius: 4,
              padding: 2,
              textAlign: "center",
              cursor: "pointer",
              marginBottom: 2,
              minHeight: "200px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              style={{ display: "none" }}
              id="image-upload"
            />
            <label htmlFor="image-upload" style={{ width: "100%" }}>
              {!formData.image_file ? (
                <>
                  <FileUploadIcon
                    sx={{ fontSize: 40, color: "text.secondary" }}
                  />
                  <Typography color="text.secondary">
                    Arrastra y suelta una imagen aquí o haz clic para
                    seleccionar. (500x500 píxeles)
                  </Typography>
                  {errors.image_file && (
                    <Typography color="error" sx={{ mt: 1 }}>
                      {errors.image_file}
                    </Typography>
                  )}
                </>
              ) : (
                <Box sx={{ position: "relative", display: "inline-block" }}>
                  <img
                    src={
                      formData.image_file instanceof File
                        ? URL.createObjectURL(formData.image_file)
                        : formData.image_file
                    }
                    alt="Logo preview"
                    style={{
                      maxWidth: "200px",
                      maxHeight: "200px",
                      objectFit: "contain",
                    }}
                  />
                  <IconButton
                    onClick={(e) => {
                      e.preventDefault();
                      removeImage();
                    }}
                    sx={{
                      position: "absolute",
                      top: -10,
                      right: -10,
                      backgroundColor: "#D01313",
                      width: 20,
                      height: 20,
                      color: "#fff",
                      "&:hover": {
                        backgroundColor: "#D01319",
                      },
                    }}
                  >
                    <CloseIcon sx={{ fontSize: 14 }} />
                  </IconButton>
                </Box>
              )}
            </label>
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
