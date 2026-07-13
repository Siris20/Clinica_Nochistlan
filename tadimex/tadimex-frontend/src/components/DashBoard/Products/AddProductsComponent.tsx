import React, { useEffect, useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import {
  Box,
  FormControl,
  FormHelperText,
  Grid,
  InputLabel,
  MenuItem,
  Select,
} from "@mui/material";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  DialogActions,
  Button,
  TextField,
  Typography,
} from "@mui/material";
import { toast } from "react-toastify";
import { useDepartments } from "../../../hooks/Departments/useDepartments";
import { useCategories } from "../../../hooks/Categories/useCategories";
import { useSubCategories } from "../../../hooks/Subcategories/useSubCategories";
import { v4 as uuidv4 } from "uuid";
import { useEnterprise } from "../../../context/EnterpriseContext";
import { UM_SAT_OPTIONS } from "../um_sat_sections";
import { useSatConcepts } from "../../../hooks/SatConcepts/useSatConcepts";
import { SatCodeField } from "./SatCodeField";

export const AddProductsComponent = ({
  open,
  setOpen,
  onAddProducts,
  onEditProducts,
  initialData,
  onClose,
}) => {
  //Contexto de empresa seleccionada
  const { selectedEnterprise } = useEnterprise();

  //Estado para los IDs seleccionados
  const [selectedDepartmentId, setSelectedDepartmentId] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");

  //Hook de departamento
  const { allFilteredDepartments: filteredDepartments } = useDepartments(selectedEnterprise);

  //Hook de categorias - ACTUALIZADO para usar selectedDepartmentId
  const { 
    allFilteredCategories: categories,
    handleGetCategoriesByDepartment
  } = useCategories(selectedDepartmentId || null, selectedEnterprise);

  //Hook de subcategorias - ACTUALIZADO para usar selectedCategoryId
  const { 
    allFilteredSubcategories: subcategories,
    handleGetSubcategoriesByCategory
  } = useSubCategories(selectedCategoryId || null, selectedEnterprise);

 // Hook de conceptos SAT
 const { selectedSatConcept, loading, handleGetSatConceptByClave } = useSatConcepts();

  //Estado para manejar el concepto SAT
  const [satConcept, setSatConcept] = useState("");

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

  //Formulario
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    departamento_id: "",
    categoria_id: "",
    subcategoria_id: "",
    model: "",
    brand: "",
    SAT_code: "",
    SAT_concept: "",
    unidad_medida: "",
    warranty: "",
    images: [],
    sell_price: "",
  });

  //Errores
  const [errors, setErrors] = useState({
    name: "",
    description: "",
    departamento_id: "",
    categoria_id: "",
    subcategoria_id: "",
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

  //UseEffect para cargar datos iniciales
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        description: initialData.description || "",
        subcategoria_id: initialData.subcategoria_id || "",
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

      // Para edición, necesitamos cargar la jerarquía completa
      if (initialData.departamento_id && initialData.categoria_id && initialData.subcategoria_id) {
        setSelectedDepartmentId(initialData.departamento_id);
        setSelectedCategoryId(initialData.categoria_id);
        setFormData((prev) => ({
          ...prev,
          departamento_id: initialData.departamento_id,
          categoria_id: initialData.categoria_id,
          subcategoria_id: initialData.subcategoria_id,
        }));
      } else if (initialData.subcategoria && initialData.subcategoria.categoria_id) {
        // Si tenemos el objeto subcategoria anidado, cargar las subcategorías de esa categoría
        setSelectedCategoryId(initialData.subcategoria.categoria_id);
      }
    } else {
      // Reset para nuevo producto
      setFormData({
        name: "",
        description: "",
        departamento_id: "",
        categoria_id: "",
        subcategoria_id: "",
        model: "",
        brand: "",
        SAT_code: "",
        SAT_concept: "",
        unidad_medida: "",
        warranty: "",
        images: [],
        sell_price: "",
      });

      // Resetear estados de selección
      setSelectedDepartmentId("");
      setSelectedCategoryId("");
    }
  }, [initialData]);

  // Función para manejar cambios en los campos del formulario
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "departamento_id") {
      setSelectedDepartmentId(value);
      // Limpiar categoría y subcategoría cuando cambia departamento
      setSelectedCategoryId("");
      setFormData((prev) => ({
        ...prev,
        departamento_id: value,
        categoria_id: "",
        subcategoria_id: "",
      }));
    } else if (name === "categoria_id") {
      setSelectedCategoryId(value);
      // Limpiar subcategoría cuando cambia categoría
      setFormData((prev) => ({
        ...prev,
        categoria_id: value,
        subcategoria_id: "",
      }));
    } else {
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
    }

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  //Funcion para validar el formato de la imagen
  const validateImageFormat = (file) => {
    const allowedExtensions = ["jpg", "jpeg", "png", "webp"];
    const fileName = file.name.toLowerCase();
    const fileExtension = fileName.split(".").pop();
    return allowedExtensions.includes(fileExtension);
  };

  //Funcion para subir imagenes
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

  //Funcion para eliminar imagenes
  const removeImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  //Funcion para manejar el drop de imagenes
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

  //Funcion para manejar el drag over
  const handleDragOver = (event) => {
    event.preventDefault();
  };

  // Función para cerrar el diálogo
  const handleCloseDialog = () => {
    setFormData({
      name: "",
      description: "",
      departamento_id: "",
      categoria_id: "",
      subcategoria_id: "",
      model: "",
      brand: "",
      SAT_code: "",
      unidad_medida: "",
      warranty: "",
      images: [],
      sell_price: "",
    });
    setErrors({
      name: "",
      description: "",
      departamento_id: "",
      categoria_id: "",
      subcategoria_id: "",
      model: "",
      brand: "",
      SAT_code: "",
      unidad_medida: "",
      warranty: "",
      sell_price: "",
    });
    setSelectedDepartmentId("");
    setSelectedCategoryId("");
    setOpen(false);
    onClose();
  };

  const titleStyle = {
    fontFamily: "Inter, sans-serif",
    fontWeight: "500",
    fontSize: "14px",
    minWidth: "150px",
    margin: "16px 0 8px 0",
  };

  //Validaciones
  const validateFields = () => {
    const newErrors = {};

    // Validación de imágenes
    const invalidImages = formData.images.filter(
      (img) => img instanceof File && !validateImageFormat(img)
    );

    if (invalidImages.length > 0) {
      newErrors.images = "Solo se permiten archivos jpg, jpeg, png y webp";
    }

    // Campos siempre requeridos
    if (!formData.name) newErrors.name = "Campo requerido";
    if (!formData.description) newErrors.description = "Campo requerido";
    if (!formData.brand) newErrors.brand = "Campo requerido";
    if (!formData.model) newErrors.model = "Campo requerido";
    if (!formData.SAT_code) newErrors.SAT_code = "Campo requerido";
    if (!formData.unidad_medida) newErrors.unidad_medida = "Campo requerido";

    // Garantía
    if (!formData.warranty) {
      newErrors.warranty = "Campo requerido";
    } else if (!/^\d+$/.test(formData.warranty)) {
      newErrors.warranty = "Solo se permiten números enteros";
    }

    // Precios
    if (!formData.sell_price) {
      newErrors.sell_price = "Campo requerido";
    } else if (parseFloat(formData.sell_price) <= 0) {
      newErrors.sell_price = "El precio debe ser mayor a 0";
    } else if (!/^\d+(\.\d{0,2})?$/.test(formData.sell_price)) {
      newErrors.sell_price = "Formato inválido. Use máximo 2 decimales";
    }

    // Departamento, categoría y subcategoría solo requeridos al crear
    if (!initialData) {
      if (!formData.departamento_id)
        newErrors.departamento_id = "Selecciona un departamento";
      if (!formData.categoria_id)
        newErrors.categoria_id = "Selecciona una categoría";
    }

    // Subcategoría siempre requerida
    if (!formData.subcategoria_id)
      newErrors.subcategoria_id = "Selecciona una subcategoría";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  //Funcion para manejar el envio del formulario
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateFields()) {
      toast.error("Por favor, llena todos los campos correctamente");
      return;
    }

    const productData = {
      id: initialData ? initialData.id : uuidv4(),
      ...formData,
    };

    if (initialData) {
      onEditProducts(productData);
    } else {
      onAddProducts(productData);
    }
    handleCloseDialog();
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
            maxWidth: { xs: "95vw", sm: "none" },
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
          {initialData ? "Editar Producto" : "Agregar Producto"}
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
          {!initialData && (
            <>
              <Typography sx={titleStyle}>Departamento:</Typography>
              <FormControl fullWidth error={!!errors.departamento_id}>
                <InputLabel>Selecciona un departamento</InputLabel>
                <Select
                  name="departamento_id"
                  value={formData.departamento_id}
                  onChange={handleChange}
                  label="Departamento"
                >
                  {filteredDepartments.map((department) => (
                    <MenuItem key={department.id} value={department.id}>
                      {department.name}
                    </MenuItem>
                  ))}
                </Select>
                {errors.departamento_id && (
                  <FormHelperText>{errors.departamento_id}</FormHelperText>
                )}
              </FormControl>

              <Typography sx={titleStyle}>Categoria:</Typography>
              <FormControl fullWidth error={!!errors.categoria_id}>
                <InputLabel>Selecciona una categoria</InputLabel>
                <Select
                  name="categoria_id"
                  value={formData.categoria_id}
                  onChange={handleChange}
                  label="Categoria"
                  disabled={!selectedDepartmentId}
                >
                  {categories.map((category) => (
                    <MenuItem key={category.id} value={category.id}>
                      {category.name}
                    </MenuItem>
                  ))}
                </Select>
                {errors.categoria_id && (
                  <FormHelperText>{errors.categoria_id}</FormHelperText>
                )}
              </FormControl>
            </>
          )}

          <Typography sx={titleStyle}>Subcategoría:</Typography>
          <FormControl fullWidth error={!!errors.subcategoria_id}>
            <InputLabel>Selecciona una subcategoría</InputLabel>
            <Select
              name="subcategoria_id"
              value={formData.subcategoria_id || ""}
              onChange={handleChange}
              label="Subcategoría"
              disabled={initialData ? false : !selectedCategoryId}
            >
              {subcategories.map((subcategory) => (
                <MenuItem key={subcategory.id} value={subcategory.id}>
                  {subcategory.name}
                </MenuItem>
              ))}
            </Select>
            {errors.subcategoria_id && (
              <FormHelperText>{errors.subcategoria_id}</FormHelperText>
            )}
          </FormControl>

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
                {errors.unidad_medida && <FormHelperText>{errors.unidad_medida}</FormHelperText>}
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography sx={titleStyle}>Información de la Unidad:</Typography>
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