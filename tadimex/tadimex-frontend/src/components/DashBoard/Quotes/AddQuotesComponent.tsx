import React, { useEffect, useRef, useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  DialogActions,
  Button,
  InputLabel,
  Select,
  MenuItem,
  FormControl,
  Box,
  Typography,
  TextField,
  Autocomplete,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from "@mui/material";
import { v4 as uuidv4 } from "uuid";
import { toast } from "react-toastify";
import { Grid } from "@mui/material";
import { useClients } from "../../../hooks/Clients/useClients";
import { useEmitters } from "../../../hooks/Emitters/useEmitters";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import AddIcon from "@mui/icons-material/Add";
import { useEnterprise } from "../../../context/EnterpriseContext";
import { useLogos } from "../../../hooks/Logos/useLogos";
import {
  Edit,
  KeyboardArrowLeft,
  KeyboardArrowRight,
} from "@mui/icons-material";
import { useProducts } from "../../../hooks/Products/useProducts";
import DeleteIcon from "@mui/icons-material/Delete";
import { EditablePopover } from "./EditablePopover";

export const AddQuotesComponent = ({
  open,
  setOpen,
  onAddQuotes,
  onEditQuotes,
  initialData,
  onClose,
}) => {
  //Contexto de empresa seleccionada
  const { selectedEnterprise } = useEnterprise();

  //Hook de emisores
  const { allFilteredEmitters : filteredEmitters } = useEmitters(selectedEnterprise);
  //Hook de clientes
  const { allFilteredClients: filteredClients } = useClients(selectedEnterprise);

  //Hook de logos
  const { filteredLogos } = useLogos(selectedEnterprise);

  //Hook de productos - pasamos selectedEnterprise pero sin auto-ejecución
  const { 
    allFilteredProducts: products, 
    handleGetAllProductsByEnterprise,
    loadingProducts 
  } = useProducts(null, selectedEnterprise, false);

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "https://avatar.iran.liara.run/public/28";

    if (imagePath.startsWith("data:")) {
      return imagePath;
    }

    // Asegúrate de que las rutas usen forward slashes
    const normalizedPath = imagePath.replace(/\\/g, "/");
    return `${import.meta.env.VITE_API_SERVER}/${normalizedPath}`;
  };

  const [quoteData, setQuoteData] = useState({
    emisor_id: "",
    cliente_id: "",
    logo_id: "",
    descuento_general: "0",
    fecha_vencimiento: null,
    gastos_envio: "0",
    observaciones: "",
    condiciones_venta: "",
  });

  const [errors, setErrors] = useState({
    emisor_id: "",
    cliente_id: "",
    logo_id: "",
    fecha_vencimiento: null,
    descuento_general: "",
    gastos_envio: "",
    observaciones: "",
    condiciones_venta: "",
  });

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productsList, setProductsList] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [discount, setDiscount] = useState(0);
  const [subtotal, setSubtotal] = useState(0);
  const [productSectionError, setProductSectionError] = useState(false);
  const [modelInputValue, setModelInputValue] = useState("");
  const [nameInputValue, setNameInputValue] = useState("");
  const [activeField, setActiveField] = useState(null);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingField, setEditingField] = useState(null);
  const [editingValue, setEditingValue] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);

  // Función para manejar la selección del producto
  const handleProductSelection = (event, newValue) => {
    setSelectedProduct(newValue);

    if (newValue) {
      setModelInputValue(newValue.model || "");
      setNameInputValue(newValue.name || "");

      calculateSubtotal(quantity, newValue.sell_price, discount);
    } else {
      // Si se deselecciona, limpiamos ambos
      setModelInputValue("");
      setNameInputValue("");
      setSubtotal(0);
    }
  };

  // Función para manejar la entrada en el campo de modelo (clave)
  const handleModelInputChange = (event, newInputValue) => {
    setModelInputValue(newInputValue);
    setActiveField("model");

    // Si hay un nuevo valor de entrada, intenta encontrar coincidencias
    if (newInputValue.trim() !== "") {
      const filteredByModel = getFilteredProductsByModel(newInputValue);

      // Si solo hay una coincidencia exacta, selecciona ese producto automáticamente
      if (
        filteredByModel.length === 1 &&
        filteredByModel[0].model.toLowerCase() === newInputValue.toLowerCase()
      ) {
        setSelectedProduct(filteredByModel[0]);
        setNameInputValue(filteredByModel[0].name || "");
        calculateSubtotal(quantity, filteredByModel[0].sell_price, discount);
      }
    }
  };

  // Función para manejar la entrada en el campo de nombre
  const handleNameInputChange = (event, newInputValue) => {
    setNameInputValue(newInputValue);
    setActiveField("name");

    // Si hay un nuevo valor de entrada, intenta encontrar coincidencias
    if (newInputValue.trim() !== "") {
      const filteredByName = getFilteredProductsByName(newInputValue);

      // Si solo hay una coincidencia exacta, selecciona ese producto automáticamente
      if (
        filteredByName.length === 1 &&
        filteredByName[0].name.toLowerCase() === newInputValue.toLowerCase()
      ) {
        setSelectedProduct(filteredByName[0]);
        setModelInputValue(filteredByName[0].model || "");
        calculateSubtotal(quantity, filteredByName[0].sell_price, discount);
      }
    }
  };

  // Función mejorada para filtrar por modelo
  const getFilteredProductsByModel = (inputValue) => {
    if (!inputValue || inputValue.trim() === "")
      return filterAvailableProducts(products);

    const inputValueLowerCase = inputValue.toLowerCase();
    return filterAvailableProducts(
      products.filter(
        (product) =>
          product.model &&
          product.model.toLowerCase().includes(inputValueLowerCase)
      )
    );
  };

  // Función mejorada para filtrar por nombre
  const getFilteredProductsByName = (inputValue) => {
    if (!inputValue || inputValue.trim() === "")
      return filterAvailableProducts(products);

    const inputValueLowerCase = inputValue.toLowerCase();
    return filterAvailableProducts(
      products.filter(
        (product) =>
          product.name &&
          product.name.toLowerCase().includes(inputValueLowerCase)
      )
    );
  };

  // Función para obtener opciones filtradas para los Autocomplete
  const filterAvailableProducts = (productArray) => {
    if (!productsList.length) return productArray;

    // Obtener IDs de productos ya agregados
    const addedProductIds = productsList.map((product) => product.id);

    // Filtrar productos que no están en la lista
    return productArray.filter(
      (product) => !addedProductIds.includes(product.id)
    );
  };

  // Función para manejar cambios en la cantidad
  const handleQuantityChange = (event) => {
    const newQuantity = Number(event.target.value);
    setQuantity(newQuantity);
    if (selectedProduct) {
      calculateSubtotal(newQuantity, selectedProduct.sell_price, discount);
    }
  };

  // Función para manejar cambios en el descuento
  const handleDiscountChange = (event) => {
    const newDiscount = Number(event.target.value);
    setDiscount(newDiscount);
    if (selectedProduct) {
      calculateSubtotal(quantity, selectedProduct.sell_price, newDiscount);
    }
  };

  // Función para calcular el subtotal
  const calculateSubtotal = (qty, price, disc) => {
    const subtotalBeforeDiscount = qty * price;
    const discountAmount = subtotalBeforeDiscount * (disc / 100);
    const finalSubtotal = subtotalBeforeDiscount - discountAmount;
    setSubtotal(finalSubtotal);
  };

  // Agregar estas funciones para calcular los totales
  const calculateTotals = () => {
    const subtotal = productsList.reduce(
      (sum, product) => sum + product.subtotal,
      0
    );
    const descuentoGeneral =
      (subtotal * parseFloat(quoteData.descuento_general)) / 100;
    const subtotalConDescuento = subtotal - descuentoGeneral;
    const gastosEnvio = parseFloat(quoteData.gastos_envio);
    const subtotalConEnvio = subtotalConDescuento + gastosEnvio;
    const iva = subtotalConEnvio * 0.16; // 16% IVA

    //Calcular la retención de ISR si corresponde
    let isrRet = 0;
    const emisor = filteredEmitters.find(
      (emisor) => emisor.id === quoteData.emisor_id
    );
    const cliente = filteredClients.find(
      (cliente) => cliente.id === quoteData.cliente_id
    );
    if (
      emisor &&
      cliente &&
      emisor.regimen_fiscal === "626 - Régimen Simplificado de Confianza" &&
      cliente.tipo_persona === "MORAL"
    ) {
      isrRet = subtotalConEnvio * 0.0125;
    }

    const total = subtotalConEnvio + iva - isrRet;

    return {
      subtotal,
      descuentoGeneral,
      gastosEnvio,
      subtotalConEnvio,
      isrRet,
      iva,
      total,
    };
  };

  //Funcion para abrir el popover de edicion
  const handleStartEditing = (event, index, field, value) => {
    setAnchorEl(event.currentTarget);
    setEditingIndex(index);
    setEditingField(field);
    setEditingValue(String(value));
  };
  //Funcion para cerrar el popover de edicion
  const handleCloseEditing = () => {
    setAnchorEl(null);
    setEditingIndex(null);
    setEditingField(null);
  };

  // Función para guardar los cambios en cualquier campo
  const handleSaveEdit = () => {
    if (editingIndex === null || !editingField) return;
  
    const updatedProducts = [...productsList];
    const product = { ...updatedProducts[editingIndex] };
  
    // Validar el valor según el tipo de campo
    let validValue = editingValue;
  
    switch (editingField) {
      case "nombre":
        if (!validValue.trim()) return; // No guardar nombres vacíos
        product.nombre = validValue;
        product.concepto = validValue;
        break;
      case "concepto":
        if (!validValue.trim()) return; // No guardar conceptos vacíos
        product.concepto = validValue;
        break;
      case "precio_unitario":
        const newPrice = parseFloat(validValue);
        if (isNaN(newPrice) || newPrice <= 0) return; // Validar precio positivo
        product.precio_cotizado = newPrice;
        // Recalcular el subtotal
        product.subtotal =
          product.cantidad * newPrice * (1 - product.descuento / 100);
        break;
      case "cantidad":
        const newQuantity = parseInt(validValue);
        if (isNaN(newQuantity) || newQuantity <= 0) return; // Validar cantidad positiva
        product.cantidad = newQuantity;
        // Recalcular el subtotal
        product.subtotal =
          newQuantity * (product.precio_cotizado || product.precio_unitario) * (1 - product.descuento / 100);
        break;
      case "descuento":
        const newDiscount = parseFloat(validValue);
        if (isNaN(newDiscount) || newDiscount < 0 || newDiscount > 100) return; // Validar descuento entre 0 y 100
        product.descuento = newDiscount;
        // Recalcular el subtotal
        product.subtotal =
          product.cantidad * (product.precio_cotizado || product.precio_unitario) * (1 - newDiscount / 100);
        break;
      default:
        return;
    }
  
    updatedProducts[editingIndex] = product;
    setProductsList(updatedProducts);
    handleCloseEditing();
    toast.success(
      `Campo ${
        editingField === "nombre" || editingField === "concepto" 
        ? "concepto" 
        : editingField === "precio_unitario" 
        ? "precio unitario" 
        : editingField
      } actualizado correctamente`
    );
  };

  // UseEffect para cargar todos los productos cuando se abre el modal
  useEffect(() => {
    if (open && selectedEnterprise) {
      const enterpriseId = typeof selectedEnterprise === 'object' ? selectedEnterprise.id : selectedEnterprise;
      handleGetAllProductsByEnterprise(enterpriseId);
    }
  }, [open, selectedEnterprise]);

  // UseEffect para cargar los datos iniciales cuando se está editando
  useEffect(() => {
    if (initialData) {
      // Cargar datos básicos de la cotización
      setQuoteData({
        emisor_id: initialData.emisor_id,
        cliente_id: initialData.cliente_id,
        logo_id: initialData.logo_id,
        fecha_vencimiento: dayjs(initialData.fecha_vencimiento) || null,
        descuento_general: initialData.descuento_general,
        gastos_envio: initialData.gastos_envio,
        observaciones: initialData.observaciones,
        condiciones_venta: initialData.condiciones_venta,
      });

      // Cargar lista de productos
      if (
        initialData.productos_cotizados &&
        initialData.productos_cotizados.length > 0
      ) {
        const productosEnriquecidos = initialData.productos_cotizados
          .map((producto) => {
            // Encontrar el producto completo en la lista de productos
            const productoCompleto = products.find(
              (p) => p.id === producto.producto_id
            );

            if (productoCompleto) {
              // Calcular el subtotal
              const priceToUse = producto.precio_unitario || productoCompleto.sell_price;
              const subtotalBeforeDiscount =
                producto.cantidad * priceToUse;
              const discountAmount =
                subtotalBeforeDiscount * (producto.descuento / 100);
              const finalSubtotal = subtotalBeforeDiscount - discountAmount;

              return {
                id: productoCompleto.id,
                modelo: productoCompleto.model,
                nombre: productoCompleto.name,
                concepto: producto.concepto || productoCompleto.name,
                cantidad: producto.cantidad,
                precio_unitario: productoCompleto.sell_price,
                precio_cotizado: producto.precio_unitario || productoCompleto.sell_price,
                descuento: producto.descuento,
                subtotal: finalSubtotal,
              };
            }
            return null;
          })
          .filter(Boolean); // Eliminar cualquier null del mapeo

        setProductsList(productosEnriquecidos);
      }
    }
  }, [initialData, products]); // Agregar products como dependencia

  // Función para manejar cambios en los campos del formulario
  const handleChange = (e) => {
    const { name, value } = e.target;

    setQuoteData((prev) => ({
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
    let isValid = true;

    const requiredFields = [
      "emisor_id",
      "cliente_id",
      "fecha_vencimiento",
      "logo_id",
    ];

    requiredFields.forEach((key) => {
      if (!quoteData[key]) {
        newErrors[key] = "Campo requerido";
        isValid = false;
      }
    });

    setErrors(newErrors);

    // Validar que haya al menos un producto en la lista
    if (productsList.length === 0) {
      setProductSectionError(true);
      isValid = false;
    } else {
      setProductSectionError(false);
    }

    return isValid;
  };

  // Función para manejar el envío del formulario
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateFields()) {
      toast.error("Por favor, llena todos los campos correctamente");
      return;
    }

    const formattedData = {
      id: initialData?.id,
      cotizacion_data: {
        emisor_id: parseInt(quoteData.emisor_id),
        cliente_id: parseInt(quoteData.cliente_id),
        logo_id: parseInt(quoteData.logo_id),
        descuento_general: parseFloat(quoteData.descuento_general),
        gastos_envio: parseFloat(quoteData.gastos_envio),
        observaciones: quoteData.observaciones,
        condiciones_venta: quoteData.condiciones_venta,
        fecha_vencimiento: dayjs(quoteData.fecha_vencimiento)
          .startOf("day")
          .format("YYYY-MM-DD"),
      },
      productos_cotizados: productsList.map((product) => ({
        producto_id: product.id,
        cantidad: product.cantidad,
        descuento: product.descuento,
        concepto: product.concepto || product.nombre,
        precio_unitario: product.precio_cotizado || product.precio_unitario,
      })),
    };

    if (initialData) {
      onEditQuotes(formattedData);
    } else {
      onAddQuotes(formattedData);
    }
    handleCloseDialog();
  };

  // Agregar función para manejar la adición de productos
  const handleAddProduct = () => {
    if (!selectedProduct || quantity <= 0) {
      toast.error("Por favor selecciona un producto y una cantidad válida");
      return;
    }

    // Verificar si el producto ya existe en la lista
    const productExists = productsList.some(
      (product) => product.id === selectedProduct.id
    );

    if (productExists) {
      toast.warning(
        `El producto "${selectedProduct.name}" ya ha sido agregado a la cotización`
      );
      return;
    }

    const newProduct = {
      id: selectedProduct.id,
      nombre: selectedProduct.name,
      concepto: selectedProduct.name, //Inicialmente igual al nombre
      modelo: selectedProduct.model,
      cantidad: quantity,
      precio_unitario: selectedProduct.sell_price,
      precio_cotizado: selectedProduct.sell_price, //Precio editable para la cotización
      descuento: discount,
      subtotal: subtotal,
    };

    setProductsList([...productsList, newProduct]);
    setProductSectionError(false);

    // Limpiar los campos
    setSelectedProduct(null);
    setQuantity(1);
    setDiscount(0);
    setSubtotal(0);
    setModelInputValue("");
    setNameInputValue("");
    setActiveField(null);
  };

  //Funcion para eliminar productos
  const handleRemoveProduct = (index) => {
    const newProductsList = productsList.filter((_, i) => i !== index);
    setProductsList(newProductsList);
  };

  // Función para cerrar el diálogo
  const handleCloseDialog = () => {
    setQuoteData({
      emisor_id: "",
      cliente_id: "",
      logo_id: "",
      fecha_vencimiento: null,
      descuento_general: "0",
      gastos_envio: "0",
      observaciones: "",
      condiciones_venta: "",
    });
    setErrors({
      emisor_id: "",
      cliente_id: "",
      logo_id: "",
      fecha_vencimiento: null,
      descuento_general: "",
      gastos_envio: "",
      observaciones: "",
      condiciones_venta: "",
    });
    // Limpiar datos de productos
    setProductsList([]);
    setProductSectionError(false);
    setSelectedProduct(null);
    setQuantity(1);
    setDiscount(0);
    setSubtotal(0);
    setModelInputValue("");
    setNameInputValue("");
    setActiveField(null);
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
            width: { xs: "95%", sm: "80rem" },
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
          {initialData ? "Editar cotización" : "Nueva cotización"}
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
            <Typography variant="h6" sx={subtitleStyle}>
              Emisor
            </Typography>{" "}
            <Grid item xs={12}>
              <FormControl fullWidth required error={!!errors.emisor_id}>
                <InputLabel>Emisor</InputLabel>
                <Select
                  label="Emisor"
                  name="emisor_id"
                  value={quoteData.emisor_id}
                  onChange={handleChange}
                >
                  {filteredEmitters.map((emitter) => (
                    <MenuItem key={emitter.id} value={emitter.id}>
                      {`${emitter.razon_social}`}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Typography variant="h6" sx={subtitleStyle}>
              Cliente
            </Typography>{" "}
            <Grid item xs={12}>
              <FormControl fullWidth required error={!!errors.cliente_id}>
                <InputLabel>Cliente</InputLabel>
                <Select
                  label="Cliente"
                  name="cliente_id"
                  value={quoteData.cliente_id}
                  onChange={handleChange}
                >
                  {filteredClients.map((client) => (
                    <MenuItem key={client.id} value={client.id}>
                      {`${client.nombre_fiscal}`}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={4}>
                <Typography variant="h6" sx={subtitleStyle}>
                  Fecha de vencimiento
                </Typography>{" "}
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    value={quoteData.fecha_vencimiento}
                    format="DD/MM/YYYY"
                    onChange={(newValue) =>
                      handleChange({
                        target: {
                          name: "fecha_vencimiento",
                          value: newValue,
                        },
                      })
                    }
                    views={["day", "month", "year"]}
                    openTo="day"
                    minDate={dayjs()}
                    slotProps={{
                      textField: {
                        size: "medium",
                        error: !!errors.fecha_vencimiento,
                        fullWidth: true,
                        sx: {
                          "& .MuiOutlinedInput-root": {
                            fontSize: "14px",
                          },
                        },
                      },
                    }}
                  />
                </LocalizationProvider>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography variant="h6" sx={subtitleStyle}>
                  Descuento general
                </Typography>{" "}
                <TextField
                  type="number"
                  name="descuento_general"
                  label="Descuento general"
                  variant="outlined"
                  fullWidth
                  value={quoteData.descuento_general}
                  onChange={handleChange}
                  error={!!errors.descuento_general}
                  helperText={errors.descuento_general}
                  inputProps={{
                    step: "1",
                    min: "0",
                    onKeyPress: (e) => {
                      if (!/[\d.]/.test(e.key)) {
                        e.preventDefault();
                      }
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography variant="h6" sx={subtitleStyle}>
                  Gastos de envío
                </Typography>{" "}
                <TextField
                  type="number"
                  name="gastos_envio"
                  label="Gastos de envío"
                  variant="outlined"
                  fullWidth
                  value={quoteData.gastos_envio}
                  onChange={handleChange}
                  error={!!errors.gastos_envio}
                  helperText={errors.gastos_envio}
                  inputProps={{
                    step: "0.1",
                    min: "0",
                    onKeyPress: (e) => {
                      if (!/[\d.]/.test(e.key)) {
                        e.preventDefault();
                      }
                    },
                  }}
                />
              </Grid>
            </Grid>
            <hr />
            <Typography sx={titleStyle}>Agregar producto</Typography>
            <Grid container spacing={1}>
              <Grid item xs={12} md={2}>
                <Typography sx={{ ...subtitleStyle, fontSize: 14 }}>
                  Clave
                </Typography>
                <Autocomplete
                  options={getFilteredProductsByModel(modelInputValue)}
                  getOptionLabel={(option) => option.model || ""}
                  value={selectedProduct}
                  onChange={handleProductSelection}
                  inputValue={modelInputValue}
                  onInputChange={handleModelInputChange}
                  isOptionEqualToValue={(option, value) =>
                    option?.id === value?.id
                  }
                  renderOption={(props, option) => (
                    <li {...props} key={option.id}>
                      {option.model}
                    </li>
                  )}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      variant="outlined"
                      label="Clave"
                      fullWidth
                      size="small"
                      onFocus={() => setActiveField("model")}
                    />
                  )}
                  openOnFocus
                  noOptionsText="No hay productos disponibles"
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography sx={{ ...subtitleStyle, fontSize: 14 }}>
                  Concepto
                </Typography>
                <Autocomplete
                  options={
                    activeField === "model"
                      ? getFilteredProductsByModel(modelInputValue)
                      : getFilteredProductsByName(nameInputValue)
                  }
                  getOptionLabel={(option) => option.name || ""}
                  value={selectedProduct}
                  onChange={handleProductSelection}
                  inputValue={nameInputValue}
                  onInputChange={handleNameInputChange}
                  isOptionEqualToValue={(option, value) =>
                    option?.id === value?.id
                  }
                  renderOption={(props, option) => (
                    <li {...props} key={option.id}>
                      {option.name}
                    </li>
                  )}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      variant="outlined"
                      label="Concepto"
                      fullWidth
                      required
                      size="small"
                      onFocus={() => setActiveField("name")}
                    />
                  )}
                  openOnFocus
                  noOptionsText="No hay productos disponibles"
                />
              </Grid>
              <Grid item xs={12} md={1}>
                <Typography sx={{ ...subtitleStyle, fontSize: 14 }}>
                  Exist.
                </Typography>
                <TextField
                  variant="outlined"
                  label="Exist."
                  fullWidth
                  disabled
                  size="small"
                  name="existencia"
                  InputProps={{
                    readOnly: true,
                  }}
                />
              </Grid>
              <Grid item xs={12} md={1}>
                <Typography sx={{ ...subtitleStyle, fontSize: 14 }}>
                  Cant.
                </Typography>
                <TextField
                  type="number"
                  variant="outlined"
                  label="Cant."
                  fullWidth
                  required
                  size="small"
                  name="cantidad"
                  value={quantity}
                  onChange={handleQuantityChange}
                  inputProps={{
                    min: "1",
                    step: "1",
                    onKeyPress: (e) => {
                      if (!/\d/.test(e.key)) {
                        e.preventDefault();
                      }
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} md={1}>
                <Typography sx={{ ...subtitleStyle, fontSize: 14 }}>
                  P.U.
                </Typography>
                <TextField
                  type="number"
                  variant="outlined"
                  label="P.U."
                  fullWidth
                  required
                  disabled
                  size="small"
                  name="sell_price"
                  value={selectedProduct ? selectedProduct.sell_price : ""}
                  inputProps={{
                    step: "0.01",
                    min: "0",
                    onKeyPress: (e) => {
                      if (!/[\d.]/.test(e.key)) {
                        e.preventDefault();
                      }
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} md={1}>
                <Typography sx={{ ...subtitleStyle, fontSize: 14 }}>
                  Desc %
                </Typography>
                <TextField
                  type="number"
                  variant="outlined"
                  label="Desc %"
                  fullWidth
                  required
                  size="small"
                  name="descuento_porcentaje"
                  value={discount}
                  onChange={handleDiscountChange}
                  inputProps={{
                    step: "1",
                    min: "0",
                    onKeyPress: (e) => {
                      if (!/[\d.]/.test(e.key)) {
                        e.preventDefault();
                      }
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} md={1}>
                <Typography sx={{ ...subtitleStyle, fontSize: 14 }}>
                  Subtotal
                </Typography>
                <TextField
                  type="number"
                  variant="outlined"
                  label="Subtotal"
                  fullWidth
                  required
                  size="small"
                  name="subtotal"
                  value={subtotal.toFixed(2)}
                  disabled
                  InputProps={{
                    readOnly: true,
                  }}
                  inputProps={{
                    step: "0.01",
                    min: "0",
                    onKeyPress: (e) => {
                      if (!/[\d.]/.test(e.key)) {
                        e.preventDefault();
                      }
                    },
                  }}
                />
              </Grid>
              <Grid
                item
                xs={12}
                md={1}
                sx={{ display: "flex", alignItems: "center", height: "100%" }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    height: "40px",
                    width: "100%",
                    justifyContent: "center",
                    mt: "2.4rem",
                  }}
                >
                  <IconButton
                    onClick={handleAddProduct}
                    sx={{
                      width: 30,
                      height: 30,
                      borderRadius: "50%",
                      backgroundColor: "#000",
                      color: "#fff",
                      "&:hover": {
                        backgroundColor: "#333",
                      },
                    }}
                  >
                    <AddIcon sx={{ fontSize: 20 }} />
                  </IconButton>
                </Box>
              </Grid>
            </Grid>
            <Box sx={{ mt: 2, mb: 2 }}>
              {productsList.length > 0 ? (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Clave</TableCell>
                        <TableCell>Concepto</TableCell>
                        <TableCell align="right">Cantidad</TableCell>
                        <TableCell align="right">Precio Unit.</TableCell>
                        <TableCell align="right">Descuento %</TableCell>
                        <TableCell align="right">Subtotal</TableCell>
                        <TableCell align="center">Acciones</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {productsList.map((product, index) => (
                        <TableRow key={index}>
                          <TableCell>{product.modelo || "-"}</TableCell>
                          <TableCell
                            sx={{
                              position: "relative",
                              textAlign: "justify",
                            }}
                          >
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                cursor: "pointer",
                                "&:hover": {
                                  color: "primary.main",
                                },
                                padding: "4px",
                              }}
                              onClick={(e) =>
                                handleStartEditing(
                                  e,
                                  index,
                                  "concepto",
                                  product.concepto || product.nombre
                                )
                              }
                            >
                              {product.concepto || product.nombre}
                            </Box>
                          </TableCell>
                          <TableCell align="right">
                            <Box
                              sx={{
                                cursor: "pointer",
                                "&:hover": {
                                  color: "primary.main",
                                },
                                padding: "4px",
                              }}
                              onClick={(e) =>
                                handleStartEditing(
                                  e,
                                  index,
                                  "cantidad",
                                  product.cantidad
                                )
                              }
                            >
                              {product.cantidad}
                            </Box>
                          </TableCell>
                          <TableCell align="right">
                            <Box
                              sx={{
                                cursor: "pointer",
                                "&:hover": {
                                  color: "primary.main",
                                },
                                padding: "4px",
                              }}
                              onClick={(e) =>
                                handleStartEditing(
                                  e,
                                  index,
                                  "precio_unitario",
                                  product.precio_cotizado ||
                                    product.precio_unitario
                                )
                              }
                            >
                              $
                              {(
                                product.precio_cotizado ||
                                product.precio_unitario
                              ).toFixed(2)}
                            </Box>
                          </TableCell>
                          <TableCell align="right">
                            <Box
                              sx={{
                                cursor: "pointer",
                                "&:hover": {
                                  color: "primary.main",
                                },
                                padding: "4px",
                              }}
                              onClick={(e) =>
                                handleStartEditing(
                                  e,
                                  index,
                                  "descuento",
                                  product.descuento
                                )
                              }
                            >
                              {product.descuento}%
                            </Box>
                          </TableCell>
                          <TableCell align="right">
                            ${product.subtotal.toFixed(2)}
                          </TableCell>
                          <TableCell align="center">
                            <IconButton
                              size="small"
                              onClick={() => handleRemoveProduct(index)}
                              sx={{
                                color: "#D01313",
                                "&:hover": {
                                  backgroundColor: "#ffebee",
                                },
                              }}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : productSectionError ? (
                <Box
                  sx={{
                    backgroundColor: "rgba(244, 67, 54, 0.1)",
                    borderRadius: "4px",
                    p: 2,
                    textAlign: "center",
                  }}
                >
                  <Typography color="error">
                    No se ha agregado ningún producto
                  </Typography>
                </Box>
              ) : null}
              <EditablePopover
                open={Boolean(anchorEl)}
                anchorEl={anchorEl}
                onClose={handleCloseEditing}
                value={editingValue}
                onChange={(value) => setEditingValue(value)}
                onSave={handleSaveEdit}
                title={`Editar ${
                  editingField === "nombre" || editingField === "concepto"
                    ? "concepto"
                    : editingField === "precio_unitario"
                    ? "precio unitario"
                    : editingField === "cantidad"
                    ? "cantidad"
                    : editingField === "descuento"
                    ? "descuento"
                    : ""
                }`}
                placeholder={`Ingrese el nuevo ${
                  editingField === "nombre" || editingField === "concepto"
                    ? "concepto"
                    : editingField === "precio_unitario"
                    ? "precio unitario"
                    : editingField === "cantidad"
                    ? "cantidad"
                    : editingField === "descuento"
                    ? "descuento"
                    : ""
                }`}
                multiline={
                  editingField === "nombre" || editingField === "concepto"
                }
                rows={
                  editingField === "nombre" || editingField === "concepto"
                    ? 4
                    : 1
                }
                type={
                  editingField === "nombre" || editingField === "concepto"
                    ? "text"
                    : editingField === "precio_unitario"
                    ? "price"
                    : "number"
                }
                width={
                  editingField === "nombre" || editingField === "concepto"
                    ? "500px"
                    : "200px"
                }
                max
                saveText="Guardar"
                cancelText="Cancelar"
              />
            </Box>
            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
              <Grid container spacing={2} justifyContent="flex-end">
                <Grid item xs={12} md={4}>
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 1,
                      "& .MuiTypography-root": {
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: "14px",
                        py: 0.5,
                      },
                    }}
                  >
                    {(() => {
                      const totals = calculateTotals();
                      return (
                        <>
                          <Typography
                            sx={{ borderBottom: "1px solid #e0e0e0" }}
                          >
                            <span>Subtotal:</span>
                            <span>${totals.subtotal.toFixed(2)}</span>
                          </Typography>
                          <Typography
                            sx={{ borderBottom: "1px solid #e0e0e0" }}
                          >
                            <span>Descuento general:</span>
                            <span>${totals.descuentoGeneral.toFixed(2)}</span>
                          </Typography>
                          <Typography
                            sx={{ borderBottom: "1px solid #e0e0e0" }}
                          >
                            <span>Gastos de envío:</span>
                            <span>${totals.gastosEnvio.toFixed(2)}</span>
                          </Typography>
                          <Typography
                            sx={{ borderBottom: "1px solid #e0e0e0" }}
                          >
                            <span>Subtotal con envío:</span>
                            <span>${totals.subtotalConEnvio.toFixed(2)}</span>
                          </Typography>
                          <Typography>
                            <span>IVA:</span>
                            <span>${totals.iva.toFixed(2)}</span>
                          </Typography>
                          <Typography>
                            <span>Ret.Isr:</span>
                            <span>${totals?.isrRet}</span>
                          </Typography>
                          <Typography
                            sx={{
                              fontWeight: "bold !important",
                              borderTop: "1px solid #e0e0e0",
                              pt: 1,
                              backgroundColor: "#f1f1f1",
                            }}
                          >
                            <span>Total:</span>
                            <span>${totals.total.toFixed(2)}</span>
                          </Typography>
                        </>
                      );
                    })()}
                  </Box>
                </Grid>
              </Grid>
            </Box>
            <hr />
            <Typography sx={titleStyle}>Selecciona un logo</Typography>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                mb: 2,
              }}
            >
              <IconButton
                onClick={() => {
                  const currentIndex = filteredLogos.findIndex(
                    (logo) => logo.id === quoteData.logo_id
                  );
                  const newIndex =
                    (currentIndex - 1 + filteredLogos.length) %
                    filteredLogos.length;
                  handleChange({
                    target: {
                      name: "logo_id",
                      value: filteredLogos[newIndex].id,
                    },
                  });
                }}
                sx={{
                  backgroundColor: "#f5f5f5",
                  "&:hover": {
                    backgroundColor: "#e0e0e0",
                  },
                }}
              >
                <KeyboardArrowLeft />
              </IconButton>

              <Box
                sx={{
                  display: "flex",
                  gap: 2,
                  overflow: "hidden",
                  width: "100%",
                  justifyContent: "center",
                }}
              >
                {filteredLogos.map((logo) => (
                  <Box
                    key={logo.id}
                    onClick={() =>
                      handleChange({
                        target: {
                          name: "logo_id",
                          value: logo.id,
                        },
                      })
                    }
                    sx={{
                      width: 100,
                      height: 100,
                      border:
                        logo.id === quoteData.logo_id
                          ? "2px solid #000"
                          : errors.logo_id
                          ? "2px solid red"
                          : "1px solid #e0e0e0",
                      borderRadius: 1,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: 1,
                      transition: "all 0.2s",
                      "&:hover": {
                        border: "2px solid #000",
                      },
                    }}
                  >
                    <img
                      src={getImageUrl(logo.image_url)}
                      alt={`Logo ${logo.id}`}
                      style={{
                        maxWidth: "100%",
                        maxHeight: "100%",
                        objectFit: "contain",
                      }}
                    />
                  </Box>
                ))}
              </Box>

              <IconButton
                onClick={() => {
                  const currentIndex = filteredLogos.findIndex(
                    (logo) => logo.id === quoteData.logo_id
                  );
                  const newIndex = (currentIndex + 1) % filteredLogos.length;
                  handleChange({
                    target: {
                      name: "logo_id",
                      value: filteredLogos[newIndex].id,
                    },
                  });
                }}
                sx={{
                  backgroundColor: "#f5f5f5",
                  "&:hover": {
                    backgroundColor: "#e0e0e0",
                  },
                }}
              >
                <KeyboardArrowRight />
              </IconButton>
            </Box>
            <hr />
            <Typography sx={titleStyle}>Información Adicional</Typography>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <Typography variant="h6" sx={subtitleStyle}>
                  Observaciones
                </Typography>
                <TextField
                  variant="outlined"
                  label="Observaciones"
                  fullWidth
                  required
                  name="observaciones"
                  value={quoteData.observaciones}
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
                      200 - (quoteData.observaciones?.length || 0) <= 10
                        ? "error.main"
                        : "text.secondary",
                    fontSize: "0.75rem",
                  }}
                >
                  {200 - (quoteData.observaciones?.length || 0)} caracteres
                  restantes
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="h6" sx={subtitleStyle}>
                  Condiciones de venta
                </Typography>
                <TextField
                  variant="outlined"
                  label="Condiciones de venta"
                  fullWidth
                  required
                  name="condiciones_venta"
                  value={quoteData.condiciones_venta}
                  onChange={(e) => {
                    if (e.target.value.length <= 200) {
                      handleChange(e);
                    }
                  }}
                  error={!!errors.condiciones_venta}
                  helperText={errors.condiciones_venta}
                  inputProps={{ maxLength: 200 }}
                />
                <Box
                  display="flex"
                  justifyContent="flex-end"
                  mt={0.5}
                  sx={{
                    color:
                      200 - (quoteData.condiciones_venta?.length || 0) <= 10
                        ? "error.main"
                        : "text.secondary",
                    fontSize: "0.75rem",
                  }}
                >
                  {200 - (quoteData.condiciones_venta?.length || 0)} caracteres
                  restantes
                </Box>
              </Grid>
            </Grid>
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
