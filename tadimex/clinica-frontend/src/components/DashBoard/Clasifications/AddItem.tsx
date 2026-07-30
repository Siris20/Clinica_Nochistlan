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
  FormControl,
  InputLabel,
  Select,
  FormHelperText,
  MenuItem,
  Typography,
} from "@mui/material";
import { parse, v4 as uuidv4 } from "uuid";
import { toast } from "react-toastify";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import { Grid } from "@mui/material";
import { useEnterprise } from "../../../context/EnterpriseContext";
import { UM_SAT_OPTIONS } from "../um_sat_sections";
import { useSatConcepts } from "../../../hooks/SatConcepts/useSatConcepts";
import { SatCodeField } from "../Products/SatCodeField";

export const AddItem = ({
  open,
  setOpen,
  onAddItem,
  onEditItem,
  initialData,
  onClose,
  itemType,
  departamentos,
  categorias,
  subcategorias,
  productos,
  selectedDepartmentId,
  selectedCategoryId,
  selectedSubcategoryId,
  enterprises,
}) => {
  const { selectedEnterprise } = useEnterprise();

  // Hook de conceptos SAT
  const { selectedSatConcept, loading, handleGetSatConceptByClave } = useSatConcepts();

  //Estado para manejar el concepto SAT
  const [satConcept, setSatConcept] = useState("");
   
  

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    parentId: "",
    //Campos adicionales para productos
    model: "",
    brand: "",
    SAT_code: "",
    SAT_concept: "",
    unidad_medida: "",
    warranty: "",
    images: [],
    sell_price: "",
  });

  const [errors, setErrors] = useState({
    name: "",
    description: "",
    parentId: "",
    model: "",
    brand: "",
    SAT_code: "",
    SAT_concept: "",
    unidad_medida: "",
    warranty: "",
    sell_price: "",
  });

// Efecto para obtener el concepto SAT cuando cambia el código
  useEffect(() => {
    if (formData.SAT_code && formData.SAT_code.length > 0) {
      handleGetSatConceptByClave(formData.SAT_code);
    } else {
      setSatConcept("");
      setFormData(prev => ({
        ...prev,
        SAT_concept: ""
      }));
    }
  }, [formData.SAT_code]);

  // Efecto para actualizar el campo de concepto SAT cuando se obtiene del API
  useEffect(() => {
    if (selectedSatConcept && selectedSatConcept.descripcion) {
      setSatConcept(selectedSatConcept.descripcion);
      setFormData(prev => ({
        ...prev,
        SAT_concept: selectedSatConcept.descripcion
      }));
    }
  }, [selectedSatConcept]);

  const getImagePreviewUrl = (image) => {
    if (image instanceof File) {
      return URL.createObjectURL(image);
    }

    const baseUrl = import.meta.env.VITE_API_SERVER.endsWith("/")
      ? import.meta.env.VITE_API_SERVER.slice(0, -1)
      : import.meta.env.VITE_API_SERVER;

    if (typeof image === "string") {
      return `${baseUrl}/${image.replace(/\\/g, "/")}`;
    }

    if (image?.path) {
      return `${baseUrl}/${image.path.replace(/\\/g, "/")}`;
    }

    if (image?.url) {
      return `${baseUrl}/${image.url.replace(/\\/g, "/")}`;
    }

    return "https://avatar.iran.liara.run/public/28";
  };

  // UseEffect para cargar los datos iniciales cuando se está editando
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        description: initialData.description || "",
        parentId:
          itemType === "categoria"
            ? initialData.departamento_id || ""
            : itemType === "subcategoria"
            ? initialData.categoria_id || ""
            : initialData.subcategoria_id || selectedSubcategoryId || "", // Añade selectedSubcategoryId aquí
        model: initialData.model || "",
        brand: initialData.brand || "",
        SAT_code: initialData.SAT_code || "",
        SAT_concept: initialData.SAT_concept || "",
        unidad_medida: initialData.unidad_medida || "",
        warranty: initialData.warranty || "",
        images: initialData.images || [],
        sell_price: initialData.sell_price || "",
      });

       // Si hay código SAT inicial, obtenemos su concepto
       if (initialData.SAT_code) {
        handleGetSatConceptByClave(initialData.SAT_code);
      }

    } else {
      setFormData((prev) => ({
        ...prev,
        parentId:
          itemType === "categoria"
            ? selectedDepartmentId || ""
            : itemType === "subcategoria"
            ? selectedCategoryId || ""
            : itemType === "producto"
            ? selectedSubcategoryId || ""
            : "",
      }));
    }
  }, [
    initialData,
    open,
    itemType,
    selectedDepartmentId,
    selectedCategoryId,
    selectedSubcategoryId,
  ]);

  // Función para manejar cambios en los campos del formulario
  const handleChange = (e) => {
    const { name, value } = e.target;

    //Validaciones para campos numericos
    if (name === "sell_price" || name === "rent_price") {
      // Solo permite números y un punto decimal
      if (value && !/^\d*\.?\d{0,2}$/.test(value)) {
        return;
      }

      // Prevenir múltiples puntos decimales
      if (value.split(".").length > 2) {
        return;
      }

      // Prevenir que empiece con punto decimal
      if (value.startsWith(".")) {
        return;
      }
    }

    // Validación para garantía (solo números enteros)
    if (name === "warranty") {
      // Solo permite números enteros
      if (value && !/^\d*$/.test(value)) {
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

  // Función para validar las extensiones de archivo permitidas
  const validateImageFormat = (file) => {
    const allowedExtensions = ["jpg", "jpeg", "png", "webp"];
    const fileName = file.name.toLowerCase();
    const fileExtension = fileName.split(".").pop();

    return allowedExtensions.includes(fileExtension);
  };

  // Modificación para handleImageUpload
  const handleImageUpload = (e) => {
    const allFiles = Array.from(e.target.files).filter(
      (file) => file instanceof File
    );

    // Filtrar archivos por formato permitido
    const invalidFiles = allFiles.filter((file) => !validateImageFormat(file));
    if (invalidFiles.length > 0) {
      toast.error("Solo se permiten archivos jpg, jpeg, png y webp");
      return;
    }

    // Validar número máximo de imágenes
    if (formData.images.length + allFiles.length > 3) {
      toast.error("Máximo 3 imágenes permitidas");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ...allFiles],
    }));
  };

  const removeImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  // Modificación para handleDrop
  const handleDrop = (event) => {
    event.preventDefault();
    const allFiles = Array.from(event.dataTransfer.files);

    // Filtrar archivos por formato permitido
    const invalidFiles = allFiles.filter((file) => !validateImageFormat(file));
    if (invalidFiles.length > 0) {
      toast.error("Solo se permiten archivos jpg, jpeg, png y webp");
      return;
    }

    // Validar número máximo de imágenes
    if (formData.images.length + allFiles.length > 3) {
      toast.error("Máximo 3 imágenes permitidas");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ...allFiles],
    }));
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const titleStyle = {
    fontFamily: "Inter, sans-serif",
    fontWeight: "500",
    fontSize: "14px",
    minWidth: "150px",
    margin: "16px 0 8px 0",
  };

  // Función para formatear el título del item
  const getItemTitle = () => {
    const action = initialData ? "Editar" : "Agregar";
    switch (itemType) {
      case "departamento":
        return `${action} Departamento`;
      case "categoria":
        return `${action} Categoría`;
      case "subcategoria":
        return `${action} Subcategoría`;
      case "producto":
        return `${action} Producto`;
      default:
        return `${action} Item`;
    }
  };

  //Validaciones
  const validateFiels = () => {
    const newErrors = {};

    // Validación de imágenes
    const invalidImages = formData.images.filter(
      (img) => img instanceof File && !validateImageFormat(img)
    );

    if (!formData.name) {
      newErrors.name = "Campo requerido";
    }

    if (!formData.description) {
      newErrors.description = "Campo requerido";
    }

    if (itemType === "producto") {
      if (!formData.model) newErrors.model = "Campo requerido";
      if (!formData.brand) newErrors.brand = "Campo requerido";
      if (!formData.SAT_code) newErrors.SAT_code = "Campo requerido";
      if (!formData.unidad_medida) newErrors.unidad_medida = "Campo requerido";
      if (!formData.warranty) {
        newErrors.warranty = "Campo requerido";
      } else if (!/^\d+$/.test(formData.warranty)) {
        newErrors.warranty = "Solo se permiten números enteros";
      }
      if (!formData.sell_price) {
        newErrors.sell_price = "Campo requerido";
      } else if (parseFloat(formData.sell_price) <= 0) {
        newErrors.sell_price = "El precio debe ser mayor a 0";
      } else if (!/^\d+(\.\d{0,2})?$/.test(formData.sell_price)) {
        newErrors.sell_price = "Formato inválido. Use máximo 2 decimales";
      }
      if (!formData.parentId)
        newErrors.parentId = "Selecciona una subcategoría";
    } else if (
      (itemType === "categoria" || itemType === "subcategoria") &&
      !formData.parentId
    ) {
      newErrors.parentId = `Selecciona un ${
        itemType === "categoria" ? "departamento" : "categoría"
      }`;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Función para manejar el envío del formulario
  const handleSubmit = (e) => {
    if (!validateFiels()) {
      toast.error("Por favor, llena todos los campos correctamente");
      return;
    }

    e.preventDefault();
    const itemData = {
      id: initialData ? initialData.id : uuidv4(),
      name: formData.name,
      description: formData.description,
      parentId: formData.parentId,
      ...(itemType === "departamento" && {
        empresa_id: selectedEnterprise,
      }),
      ...(itemType === "producto" && {
        model: formData.model,
        brand: formData.brand,
        SAT_code: formData.SAT_code,
        unidad_medida: formData.unidad_medida,
        warranty: parseInt(formData.warranty),
        images: formData.images,
        sell_price: parseFloat(formData.sell_price).toFixed(2),
      }),
    };

    if (initialData) {
      onEditItem(itemData);
    } else {
      onAddItem(itemData);
    }
    handleCloseDialog();
  };

  // Función para cerrar el diálogo
  const handleCloseDialog = () => {
    setFormData({
      name: "",
      description: "",
      parentId: "",
      model: "",
      brand: "",
      SAT_code: "",
      SAT_concept: "",
      unidad_medida: "",
      warranty: "",
      images: [],
      sell_price: "",
    });
    setErrors({
      name: "",
      description: "",
      parentId: "",
      model: "",
      brand: "",
      SAT_code: "",
      SAT_concept: "",
      unidad_medida: "",
      warranty: "",
      sell_price: "",
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
            width: {
              xs: "95%",
              sm: itemType === "producto" ? "64rem" : "45.63rem",
            },
            maxWidth: { xs: "95vw", sm: "none" },
            height: {
              xs: "auto",
              sm: itemType === "producto" ? "41rem" : "auto",
            },
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
          {getItemTitle()}
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
          {(itemType === "categoria" ||
            itemType === "subcategoria" ||
            itemType === "producto") && (
            <Box sx={{ mb: 2 }}>
              <Typography
                sx={{
                  fontFamily: "Inter, sans-serif",
                  fontWeight: "bold",
                  fontSize: "14px",
                  marginBottom: 2,
                }}
              >
                Información Principal
              </Typography>
              <Typography sx={titleStyle}>
                {itemType === "categoria"
                  ? "Departamento"
                  : itemType === "subcategoria"
                  ? "Categoría"
                  : "Subcategoría"}
              </Typography>
              <FormControl fullWidth error={!!errors.parentId}>
                <InputLabel>
                  Selecciona{" "}
                  {itemType === "categoria"
                    ? "un departamento"
                    : itemType === "subcategoria"
                    ? "una categoría"
                    : "una subcategoría"}
                </InputLabel>
                <Select
                  name="parentId"
                  value={formData.parentId || ""}
                  onChange={handleChange}
                  label={
                    itemType === "categoria"
                      ? "Departamento"
                      : itemType === "subcategoria"
                      ? "Categoría"
                      : "Subcategoría"
                  }
                  disabled={
                    !initialData &&
                    ((itemType === "categoria" && selectedDepartmentId) ||
                      (itemType === "subcategoria" && selectedCategoryId) ||
                      (itemType === "producto" && selectedSubcategoryId))
                  }
                >
                  {(itemType === "categoria"
                    ? departamentos
                    : itemType === "subcategoria"
                    ? categorias.filter((cat) =>
                        initialData
                          ? cat.departamento_id === initialData.departamento_id
                          : selectedDepartmentId &&
                            cat.departamento_id === selectedDepartmentId
                      )
                    : subcategorias.filter((sub) =>
                        initialData
                          ? sub.categoria_id === initialData.categoria_id
                          : selectedCategoryId &&
                            sub.categoria_id === selectedCategoryId
                      )
                  ).map((item) => (
                    <MenuItem key={item.id} value={item.id}>
                      {item.name}
                    </MenuItem>
                  ))}
                </Select>
                {errors.parentId && (
                  <FormHelperText>{errors.parentId}</FormHelperText>
                )}
              </FormControl>
            </Box>
          )}

          <Typography sx={titleStyle}>Nombre:</Typography>
          <TextField
            variant="outlined"
            label="Nombre"
            size="small"
            fullWidth
            required
            name="name"
            value={formData.name}
            onChange={handleChange}
            sx={{ mt: 2 }}
            error={!!errors.name}
            helperText={errors.name}
          />
          <Typography sx={titleStyle}>Descripción:</Typography>
          <TextField
            variant="outlined"
            label="Descripción"
            size="small"
            fullWidth
            required
            name="description"
            value={formData.description}
            onChange={handleChange}
            error={!!errors.description}
            helperText={errors.description}
          />

          {itemType === "producto" && (
            <>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography sx={titleStyle}>Marca:</Typography>
                  <TextField
                    variant="outlined"
                    label="Marca"
                    size="small"
                    fullWidth
                    required
                    name="brand"
                    value={formData.brand}
                    onChange={handleChange}
                    error={!!errors.brand}
                    helperText={errors.brand}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography sx={titleStyle}>Modelo:</Typography>
                  <TextField
                    variant="outlined"
                    label="Modelo"
                    size="small"
                    fullWidth
                    required
                    name="model"
                    value={formData.model}
                    onChange={handleChange}
                    error={!!errors.model}
                    helperText={errors.model}
                  />
                </Grid>
              </Grid>

              <SatCodeField
                formData={formData}
                setFormData={setFormData}
                errors={errors}
                titleStyle={titleStyle}
              />

              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography sx={titleStyle}>Unidad de Medida:</Typography>
                  <FormControl fullWidth error={!!errors.unidad_medida}>
                    <InputLabel>Unidad de Medida</InputLabel>
                    <Select
                      label="Unidad de Medida"
                      name="unidad_medida"
                      value={formData.unidad_medida || ""}
                      onChange={handleChange}
                    >
                      {UM_SAT_OPTIONS.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.unidad_medida && (
                      <FormHelperText>{errors.unidad_medida}</FormHelperText>
                    )}
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography sx={titleStyle}>
                    Información de la Unidad:
                  </Typography>
                  <TextField
                    fullWidth
                    disabled
                    label="Clave y Tipo"
                    value={
                      formData.unidad_medida
                        ? `${formData.unidad_medida} - ${
                            UM_SAT_OPTIONS.find(
                              (opt) => opt.value === formData.unidad_medida
                            )?.type || ""
                          }`
                        : ""
                    }
                  />
                </Grid>
              </Grid>

              <hr />
              <Typography
                sx={{
                  fontFamily: "Inter, sans-serif",
                  fontWeight: "bold",
                  fontSize: "14px",
                  marginY: 2,
                }}
              >
                Venta y Garantía
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography sx={titleStyle}>Precio de Venta:</Typography>
                  <TextField
                    variant="outlined"
                    label="Precio de Venta"
                    size="small"
                    fullWidth
                    required
                    name="sell_price"
                    value={formData.sell_price}
                    onChange={handleChange}
                    error={!!errors.sell_price}
                    helperText={errors.sell_price}
                    InputProps={{
                      startAdornment: <span>$</span>,
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography sx={titleStyle}>Garantía (en años):</Typography>
                  <TextField
                    variant="outlined"
                    label="Garantía (en años)"
                    size="small"
                    fullWidth
                    required
                    name="warranty"
                    value={formData.warranty}
                    onChange={handleChange}
                    error={!!errors.warranty}
                    helperText={errors.warranty}
                  />
                </Grid>
              </Grid>
              <Grid item xs={12}>
                <Typography sx={titleStyle}>
                  Imagenes del producto (Máximo 3)
                </Typography>

                <Box
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  sx={{
                    border: "3px dashed rgb(218, 218, 218)",
                    borderRadius: 4,
                    padding: 2,
                    textAlign: "center",
                    cursor: "pointer",
                    marginBottom: 2,
                  }}
                >
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    style={{ display: "none" }}
                    id="image-upload"
                  />
                  <label htmlFor="image-upload">
                    {formData.images.length === 0 ? (
                      <>
                        <FileUploadIcon sx={{ fontSize: 40 }} />
                        <p>
                          Arrastra y suelta imágenes aquí o haz clic para
                          seleccionar
                        </p>
                      </>
                    ) : (
                      <Box
                        sx={{
                          display: "flex",
                          gap: 2,
                          flexWrap: "wrap",
                          justifyContent: "center",
                        }}
                      >
                        {formData.images.map((image, index) => (
                          <Box key={index} sx={{ position: "relative" }}>
                            <img
                              src={getImagePreviewUrl(image)}
                              alt={`preview ${index + 1}`}
                              style={{
                                width: 100,
                                height: 100,
                                objectFit: "cover",
                              }}
                            />
                            <IconButton
                              onClick={(e) => {
                                e.preventDefault();
                                removeImage(index);
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
                        ))}
                        {formData.images.length < 3 && (
                          <Box
                            sx={{
                              width: 100,
                              height: 100,
                              border: "2px dashed #ccc",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <FileUploadIcon />
                          </Box>
                        )}
                      </Box>
                    )}
                  </label>
                </Box>
              </Grid>
            </>
          )}
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
