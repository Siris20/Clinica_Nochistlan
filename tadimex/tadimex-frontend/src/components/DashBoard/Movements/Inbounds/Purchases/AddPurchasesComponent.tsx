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
  Checkbox,
  Grid,
} from "@mui/material";
import { v4 as uuidv4 } from "uuid";
import { toast } from "react-toastify";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import AddIcon from "@mui/icons-material/Add";
import {
  Edit,
  KeyboardArrowLeft,
  KeyboardArrowRight,
} from "@mui/icons-material";
import DeleteIcon from "@mui/icons-material/Delete";
import { useEmitters } from "../../../../../hooks/Emitters/useEmitters";
import { useClients } from "../../../../../hooks/Clients/useClients";
import { useLogos } from "../../../../../hooks/Logos/useLogos";
import { useEnterprise } from "../../../../../context/EnterpriseContext";
import { useProducts } from "../../../../../hooks/Products/useProducts";
import { EditablePopover } from "../../../Quotes/EditablePopover";
import { PAYMENT_METHOD_OPTIONS } from "../../../payment_method";
import { MOVEMENT_STATE_OPTIONS } from "../../../movement_state";
import { useStorage } from "../../../../../hooks/Storage/useStorage";
import { useBranch } from "../../../../../context/BranchContext";
import { useAuth } from "../../../../../context/AuthContext";
import { useSuppliers } from "../../../../../hooks/Suppliers/useSuppliers";

// Interfaces
interface Product {
  id: number;
  name: string;
  model: string;
  sell_price: number;
  include_tax?: boolean;
}

interface ProductInList {
  id: number;
  nombre: string;
  concepto: string;
  modelo: string;
  cantidad: number;
  precio_unitario: number;
  precio_comprado: number;
  costo_unitario?: number; // Solo para edición
  descuento: number;
  subtotal: number;
  include_tax: boolean;
}

export const AddPurchasesComponent = ({
  open,
  setOpen,
  onAddPurchases,
  onEditPurchases,
  initialData,
  onClose,
}) => {
  //Contexto de empresa seleccionada
  const { selectedEnterprise } = useEnterprise();
  //Contexto de sucursal seleccionada
  const { selectedBranch } = useBranch();

  //Hook de empleados
  const {employeeData} = useAuth();

  //Hook de almacenes
  const { allFilteredStorage: filteredStorage } = useStorage(selectedBranch);

  //Hook de proveedores
  const { allFilteredSuppliers: suppliers } = useSuppliers(selectedEnterprise);

  //Hook de productos - usar null para searchterm y false para isBackendPaginated
  const {
     allFilteredProducts: products,
     handleGetAllProductsByEnterprise,
     loadingProducts 
    } = useProducts(null, selectedEnterprise, false);

  const [purchaseData, setPurchaseData] = useState({
    empleado_id: "",
    tipo_movimiento: "entrada",
    observaciones: "",
    estado: "completado",
    almacen_id: "",
    fecha_recepcion: null as dayjs.Dayjs | null,
    numero_factura: "",
    fecha_factura: null as dayjs.Dayjs | null,
    fecha_pago: null as dayjs.Dayjs | null,
    metodo_pago: "efectivo",
    costo_envio: "",
    proveedor_id: "",
  });

  const [errors, setErrors] = useState({
    empleado_id: "",
    almacen_id: "",
    metodo_pago: "",
  });

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productsList, setProductsList] = useState<ProductInList[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [discount, setDiscount] = useState(0);
  const [subtotal, setSubtotal] = useState(0);
  const [modelInputValue, setModelInputValue] = useState("");
  const [nameInputValue, setNameInputValue] = useState("");
  const [activeField, setActiveField] = useState<string | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState("");
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [includeTax, setIncludeTax] = useState(false);
  const [productSectionError, setProductSectionError] = useState(false);
  const [forceUpdate, setForceUpdate] = useState(0); // Para forzar re-render en modo creación

  // Función para manejar la selección del producto
  const handleProductSelection = (event, newValue) => {
    setSelectedProduct(newValue);

    if (newValue) {
      setModelInputValue(newValue.model || "");
      setNameInputValue(newValue.name || "");
      // Si el producto tiene la propiedad include_tax, usarla, si no, usar false por defecto
      setIncludeTax(newValue.include_tax || false);

      calculateSubtotal(quantity, newValue.sell_price, discount);
    } else {
      // Si se deselecciona, limpiamos ambos
      setModelInputValue("");
      setNameInputValue("");
      setIncludeTax(false);
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
  const getFilteredProductsByModel = (inputValue: string): Product[] => {
    if (!inputValue || inputValue.trim() === "")
      return filterAvailableProducts(products);

    const inputValueLowerCase = inputValue.toLowerCase();
    return filterAvailableProducts(
      products.filter(
        (product: Product) =>
          product.model &&
          product.model.toLowerCase().includes(inputValueLowerCase)
      )
    );
  };

  // Función mejorada para filtrar por nombre
  const getFilteredProductsByName = (inputValue: string): Product[] => {
    if (!inputValue || inputValue.trim() === "")
      return filterAvailableProducts(products);

    const inputValueLowerCase = inputValue.toLowerCase();
    return filterAvailableProducts(
      products.filter(
        (product: Product) =>
          product.name &&
          product.name.toLowerCase().includes(inputValueLowerCase)
      )
    );
  };

  // Función para obtener opciones filtradas para los Autocomplete
  const filterAvailableProducts = (productArray: Product[]): Product[] => {
    if (!productsList.length) return productArray;

    // Obtener IDs de productos ya agregados
    const addedProductIds = productsList.map((product) => product.id);

    // Filtrar productos que no están en la lista
    return productArray.filter(
      (product: Product) => !addedProductIds.includes(product.id)
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

  // Función para manejar cambios en el checkbox de IVA
  const handleIncludeTaxChange = (event) => {
    setIncludeTax(event.target.checked);
  };

  // Función para calcular el subtotal
  const calculateSubtotal = (qty, price, disc) => {
    const subtotalBeforeDiscount = qty * price;
    const discountAmount = subtotalBeforeDiscount * (disc / 100);
    const finalSubtotal = subtotalBeforeDiscount - discountAmount;
    setSubtotal(finalSubtotal);
  };

  // Función para calcular los totales de la tabla
  const calculateTableTotals = () => {
    if (productsList.length === 0) {
      return {
        totalQuantity: 0,
        averagePrice: 0,
        totalIVA: 0,
        totalUnitPrice: 0,
        totalImport: 0,
      };
    }

    const totalQuantity = productsList.reduce((sum, product) => sum + product.cantidad, 0);
    
    // Precio promedio ponderado
    const totalValue = productsList.reduce((sum, product) => 
      sum + (product.precio_comprado || product.precio_unitario) * product.cantidad, 0
    );
    const averagePrice = totalValue / totalQuantity;
    
    let totalUnitPrice = 0; // Subtotal
    let totalIVA = 0; // IVA total
    let totalImport = 0; // Total final

    if (initialData) {
      // En modo edición: ajustar cálculos para mostrar precios sin IVA
      const costoEnvioTotal = parseFloat(purchaseData.costo_envio || "0");
      const costoEnvioUnitario = totalQuantity > 0 ? costoEnvioTotal / totalQuantity : 0;
      
      productsList.forEach(product => {
        // Calcular el precio base sin IVA (lo que ahora mostramos como precio unitario)
        const precioUnitarioSinIVA = product.include_tax ? 
          product.precio_unitario / 1.16 : 
          product.precio_unitario;
        
        // Subtotal = precio sin IVA * cantidad
        const subtotalSinIVA = precioUnitarioSinIVA * product.cantidad;
        totalUnitPrice += subtotalSinIVA;
        
        // IVA = 16% del subtotal sin IVA
        const ivaProducto = subtotalSinIVA * 0.16;
        totalIVA += ivaProducto;
        
        // Total = subtotal sin IVA + IVA + costo de envío proporcional
        const costoEnvioProducto = costoEnvioUnitario * product.cantidad;
        totalImport += subtotalSinIVA + ivaProducto + costoEnvioProducto;
      });
    } else {
      // En modo creación: usar el cálculo original + agregar costo de envío
      const costoEnvioTotal = parseFloat(purchaseData.costo_envio || "0");
      
      productsList.forEach(product => {
        const importeProducto = product.subtotal;
        
        if (product.include_tax) {
          const subtotalSinIVA = importeProducto / 1.16;
          const ivaProducto = importeProducto - subtotalSinIVA;
          
          totalUnitPrice += subtotalSinIVA;
          totalIVA += ivaProducto;
          totalImport += importeProducto;
        } else {
          const ivaProducto = importeProducto * 0.16;
          
          totalUnitPrice += importeProducto;
          totalIVA += ivaProducto;
          totalImport += importeProducto + ivaProducto;
        }
      });
      
      // Agregar el costo de envío al total final en modo creación
      totalImport += costoEnvioTotal;
    }

    return {
      totalQuantity,
      averagePrice,
      totalIVA,
      totalUnitPrice,
      totalImport,
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
        product.precio_comprado = newPrice;
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
          newQuantity * (product.precio_comprado || product.precio_unitario) * (1 - product.descuento / 100);
        break;
      case "descuento":
        const newDiscount = parseFloat(validValue);
        if (isNaN(newDiscount) || newDiscount < 0 || newDiscount > 100) return; // Validar descuento entre 0 y 100
        product.descuento = newDiscount;
        // Recalcular el subtotal
        product.subtotal =
          product.cantidad * (product.precio_comprado || product.precio_unitario) * (1 - newDiscount / 100);
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

  //UseEffect para cargar todos los productos cuando se abre el modal
  useEffect(()=> {
    if(open && selectedEnterprise) {
      const enterpriseId = typeof selectedEnterprise === 'object' ? (selectedEnterprise as any).id : selectedEnterprise;
      handleGetAllProductsByEnterprise(enterpriseId);
    }
  },[open, selectedEnterprise])

  // UseEffect para inicializar el empleado_id con el empleado logueado
  useEffect(() => {
    if ((employeeData as any)?.id) {
      setPurchaseData(prev => ({
        ...prev,
        empleado_id: (employeeData as any).id
      }));
    }
  }, [employeeData]);

  // UseEffect para cargar los datos iniciales cuando se está editando
  useEffect(() => {
    if (initialData && products.length > 0) {
      // Cargar datos básicos de la compra
      setPurchaseData({
        empleado_id: initialData.empleado_id || (employeeData as any)?.id || "",
        tipo_movimiento: initialData.tipo_movimiento || "entrada",
        observaciones: initialData.observaciones || "",
        estado: initialData.estado || "completado",
        almacen_id: initialData.almacen_id || "",
        fecha_recepcion: initialData.fecha_recepcion ? dayjs(initialData.fecha_recepcion) : null,
        numero_factura: initialData.numero_factura || "",
        fecha_factura: initialData.fecha_factura ? dayjs(initialData.fecha_factura) : null,
        fecha_pago: initialData.fecha_pago ? dayjs(initialData.fecha_pago) : null,
        metodo_pago: initialData.metodo_pago || "efectivo",
        costo_envio: initialData.costo_envio || "",
        proveedor_id: initialData.proveedor_id || "",
      });

      // Cargar lista de productos
      if (
        initialData.productos_comprados &&
        initialData.productos_comprados.length > 0
      ) {
        const productosEnriquecidos = initialData.productos_comprados
          .map((producto: any) => {
            // Encontrar el producto completo en la lista de productos
            const productoCompleto = (products as any[]).find(
              (p: any) => p.id === producto.producto_id
            );

            if (productoCompleto) {
              return {
                id: productoCompleto.id,
                modelo: productoCompleto.model,
                nombre: productoCompleto.name,
                concepto: productoCompleto.name,
                cantidad: producto.cantidad,
                precio_unitario: parseFloat(producto.precio_unitario_original || productoCompleto.sell_price),
                precio_comprado: parseFloat(producto.precio_unitario_original || productoCompleto.sell_price),
                costo_unitario: parseFloat(producto.costo_unitario), // Solo para edición
                descuento: 0, // Los descuentos ya están calculados en el backend
                subtotal: parseFloat(producto.importe), // El importe es el subtotal
                include_tax: producto.incluye_iva_original || false,
              };
            }
            return null;
          })
          .filter(Boolean); // Eliminar cualquier null del mapeo

        setProductsList(productosEnriquecidos);
      }
    }
  }, [initialData, products, employeeData]); // Agregar employeeData como dependencia

  // UseEffect para actualizar costos unitarios en tiempo real cuando cambie el costo de envío
  useEffect(() => {
    if (initialData && productsList.length > 0) {
      const costoEnvio = parseFloat(purchaseData.costo_envio || "0");
      const totalQuantity = productsList.reduce((sum, product) => sum + product.cantidad, 0);
      const costoEnvioUnitario = totalQuantity > 0 ? costoEnvio / totalQuantity : 0;

      const productosActualizados = productsList.map(product => {
        let nuevoCostoUnitario, nuevoImporteTotal;
        
        if (product.include_tax) {
          // Si incluye IVA, el costo base ya tiene IVA, solo agregar envío
          const costoBaseSinEnvio = product.precio_unitario;
          nuevoCostoUnitario = costoBaseSinEnvio + costoEnvioUnitario;
          nuevoImporteTotal = (product.precio_unitario * product.cantidad) + (costoEnvioUnitario * product.cantidad); // Incluir envío en el total
        } else {
          // Si no incluye IVA, agregar IVA + envío
          const costoBaseSinEnvio = product.precio_unitario * 1.16;
          nuevoCostoUnitario = costoBaseSinEnvio + costoEnvioUnitario;
          nuevoImporteTotal = (product.precio_unitario * 1.16 * product.cantidad) + (costoEnvioUnitario * product.cantidad); // Incluir IVA y envío en el total
        }

        return {
          ...product,
          costo_unitario: nuevoCostoUnitario,
          subtotal: nuevoImporteTotal // En edición, subtotal = importe total incluyendo envío
        };
      });

      setProductsList(productosActualizados);
    }
  }, [purchaseData.costo_envio, initialData]); // Se ejecuta cuando cambia el costo de envío

  // UseEffect para forzar re-render en modo creación cuando cambie el costo de envío
  useEffect(() => {
    // En modo creación, solo necesitamos que se re-renderice la tabla
    // Los cálculos se hacen en calculateTableTotals()
    if (!initialData) {
      setForceUpdate(prev => prev + 1);
    }
  }, [purchaseData.costo_envio, initialData]);

  const formatPrice = (price) => {
    return price.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  // Función para manejar cambios en los campos del formulario
  const handleChange = (e) => {
    const { name, value } = e.target;

    setPurchaseData((prev) => ({
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
    const newErrors: any = {};
    let isValid = true;

    const requiredFields = [
      "empleado_id",
      "almacen_id",
      "metodo_pago",
    ];

    requiredFields.forEach((key) => {
      if (!purchaseData[key as keyof typeof purchaseData] || purchaseData[key as keyof typeof purchaseData] === "") {
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

    const productos_comprados = productsList.map((product) => ({
      producto_id: product.id,
      cantidad: product.cantidad,
      precio_unitario: product.precio_comprado || product.precio_unitario,
      incluye_iva: product.include_tax || false,
    }));

    // Estructura para crear (POST)
    const createData = {
      empleado_id: parseInt(purchaseData.empleado_id),
      tipo_movimiento: purchaseData.tipo_movimiento,
      observaciones: purchaseData.observaciones || "",
      estado: purchaseData.estado,
      almacen_id: parseInt(purchaseData.almacen_id),
      fecha_recepcion: purchaseData.fecha_recepcion ? dayjs(purchaseData.fecha_recepcion).format("YYYY-MM-DD") : null,
      numero_factura: purchaseData.numero_factura || "",
      fecha_factura: purchaseData.fecha_factura ? dayjs(purchaseData.fecha_factura).format("YYYY-MM-DD") : null,
      fecha_pago: purchaseData.fecha_pago ? dayjs(purchaseData.fecha_pago).format("YYYY-MM-DD") : null,
      metodo_pago: purchaseData.metodo_pago,
      costo_envio: purchaseData.costo_envio ? parseFloat(purchaseData.costo_envio) : 0,
      proveedor_id: purchaseData.proveedor_id && purchaseData.proveedor_id !== "" ? parseInt(purchaseData.proveedor_id) : null,
      productos_comprados: productos_comprados,
    };

    // Estructura para editar (PUT)
    const editData = {
      compra_data: {
        empleado_id: parseInt(purchaseData.empleado_id),
        tipo_movimiento: purchaseData.tipo_movimiento,
        observaciones: purchaseData.observaciones || "",
        estado: purchaseData.estado,
        almacen_id: parseInt(purchaseData.almacen_id),
        fecha_recepcion: purchaseData.fecha_recepcion ? dayjs(purchaseData.fecha_recepcion).format("YYYY-MM-DD") : null,
        numero_factura: purchaseData.numero_factura || "",
        fecha_factura: purchaseData.fecha_factura ? dayjs(purchaseData.fecha_factura).format("YYYY-MM-DD") : null,
        fecha_pago: purchaseData.fecha_pago ? dayjs(purchaseData.fecha_pago).format("YYYY-MM-DD") : null,
        metodo_pago: purchaseData.metodo_pago,
        costo_envio: purchaseData.costo_envio ? parseFloat(purchaseData.costo_envio) : 0,
        proveedor_id: purchaseData.proveedor_id && purchaseData.proveedor_id !== "" ? parseInt(purchaseData.proveedor_id) : null,
        productos_comprados: [{}] // Array vacío requerido por la API
      },
      productos_comprados: productos_comprados,
    };

    if (initialData) {
      // Para editar, agregar el ID y usar la estructura especial
      editData.compra_data.id = initialData.id;
      onEditPurchases(editData);
    } else {
      // Para crear, usar la estructura simple
      onAddPurchases(createData);
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
        `El producto "${selectedProduct.name}" ya ha sido agregado a la compra`
      );
      return;
    }

    let newProduct: ProductInList;

    if (initialData) {
      // MODO EDICIÓN: Buscar si el producto existía en la compra original
      const productoOriginal = initialData.productos_comprados?.find(
        (p: any) => p.producto_id === selectedProduct.id
      );

      // Usar el costo de envío actual, no el inicial
      const costoEnvioActual = parseFloat(purchaseData.costo_envio || "0");
      const totalQuantityFutura = productsList.reduce((sum, p) => sum + p.cantidad, 0) + quantity;
      const costoEnvioUnitario = totalQuantityFutura > 0 ? costoEnvioActual / totalQuantityFutura : 0;

      if (productoOriginal) {
        // Si existía en la compra original, pero permitir cambio de configuración IVA
        const precioOriginal = parseFloat(productoOriginal.precio_unitario_original || selectedProduct.sell_price);
        let costoFinal, importeTotal;
        
        if (includeTax) {
          // Si ahora incluye IVA
          costoFinal = precioOriginal + costoEnvioUnitario;
          importeTotal = (precioOriginal * quantity) + (costoEnvioUnitario * quantity); // Incluir envío
        } else {
          // Si ahora NO incluye IVA
          costoFinal = (precioOriginal * 1.16) + costoEnvioUnitario;
          importeTotal = (precioOriginal * 1.16 * quantity) + (costoEnvioUnitario * quantity); // Incluir IVA y envío
        }

        newProduct = {
          id: selectedProduct.id,
          nombre: selectedProduct.name,
          concepto: selectedProduct.name,
          modelo: selectedProduct.model,
          cantidad: quantity,
          precio_unitario: precioOriginal,
          precio_comprado: precioOriginal,
          costo_unitario: costoFinal,
          descuento: discount,
          subtotal: importeTotal, // Incluye envío desde el inicio
          include_tax: includeTax, // Usar la configuración actual del checkbox
        };
      } else {
        // Si no existía en la compra original, agregar como producto nuevo pero con estructura de edición
        let costoFinal, importeTotal;
        
        if (includeTax) {
          // Si incluye IVA, el precio ya tiene IVA
          costoFinal = selectedProduct.sell_price + costoEnvioUnitario;
          importeTotal = (selectedProduct.sell_price * quantity) + (costoEnvioUnitario * quantity); // Incluir envío
        } else {
          // Si no incluye IVA, agregar IVA + envío al costo
          costoFinal = (selectedProduct.sell_price * 1.16) + costoEnvioUnitario;
          importeTotal = (selectedProduct.sell_price * 1.16 * quantity) + (costoEnvioUnitario * quantity); // Incluir IVA y envío
        }

        newProduct = {
          id: selectedProduct.id,
          nombre: selectedProduct.name,
          concepto: selectedProduct.name,
          modelo: selectedProduct.model,
          cantidad: quantity,
          precio_unitario: selectedProduct.sell_price,
          precio_comprado: selectedProduct.sell_price,
          costo_unitario: costoFinal,
          descuento: discount,
          subtotal: importeTotal, // Incluye envío desde el inicio
          include_tax: includeTax,
        };
      }
    } else {
      // MODO CREACIÓN: usar la lógica original
      newProduct = {
        id: selectedProduct.id,
        nombre: selectedProduct.name,
        concepto: selectedProduct.name,
        modelo: selectedProduct.model,
        cantidad: quantity,
        precio_unitario: selectedProduct.sell_price,
        precio_comprado: selectedProduct.sell_price,
        descuento: discount,
        subtotal: subtotal,
        include_tax: includeTax,
      };
    }

    setProductsList([...productsList, newProduct]);
    setProductSectionError(false);

    // Limpiar los campos
    setSelectedProduct(null);
    setQuantity(1);
    setDiscount(0);
    setSubtotal(0);
    setModelInputValue("");
    setNameInputValue("");
    setIncludeTax(false);
    setActiveField(null);
  };

  //Funcion para eliminar productos
  const handleRemoveProduct = (index) => {
    const newProductsList = productsList.filter((_, i) => i !== index);
    setProductsList(newProductsList);
  };

  // Función para cerrar el diálogo
  const handleCloseDialog = () => {
    setPurchaseData({
      empleado_id: (employeeData as any)?.id || "",
      tipo_movimiento: "entrada",
      observaciones: "",
      estado: "completado",
      almacen_id: "",
      fecha_recepcion: null,
      numero_factura: "",
      fecha_factura: null,
      fecha_pago: null,
      metodo_pago: "efectivo",
      costo_envio: "",
      proveedor_id: "",
    });
    setErrors({
      empleado_id: "",
      almacen_id: "",
      metodo_pago: "",
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
    setIncludeTax(false); // Limpiar el estado del IVA
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
          {initialData ? "Editar Compra" : "Registrar Compra"}
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
            <Typography sx={titleStyle}>Productos Comprados</Typography>
            <Grid container spacing={1}>
              <Grid item xs={12} md={3}>
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
              <Grid item xs={12} md={5}>
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
                  ¿Incluye IVA?
                </Typography>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '40px',
                    border: '1px solid #e0e0e0',
                    borderRadius: '4px',
                    backgroundColor: selectedProduct ? '#fff' : '#f5f5f5',
                    transition: 'all 0.2s ease-in-out',
                    cursor: selectedProduct ? 'pointer' : 'not-allowed',
                    '&:hover': {
                      borderColor: selectedProduct ? '#1976d2' : '#e0e0e0',
                      backgroundColor: selectedProduct ? '#f8f9ff' : '#f5f5f5',
                    },
                  }}
                  onClick={() => {
                    if (selectedProduct) {
                      handleIncludeTaxChange({ target: { checked: !includeTax } });
                    }
                  }}
                >
                  <Checkbox
                    checked={includeTax}
                    disabled={!selectedProduct}
                    size="small"
                    onChange={handleIncludeTaxChange}
                    sx={{
                      color: '#9e9e9e',
                      '&.Mui-checked': {
                        color: '#1976d2',
                      },
                      '&.Mui-disabled': {
                        color: '#bdbdbd',
                      },
                      '&:hover': {
                        backgroundColor: 'transparent',
                      },
                      '& .MuiSvgIcon-root': {
                        fontSize: '20px',
                        borderRadius: '3px',
                      },
                    }}
                    inputProps={{
                      "aria-label": "¿Incluye IVA?",
                    }}
                  />
                </Box>
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
              {productsList.length > 0 && (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Clave</TableCell>
                        <TableCell>Concepto</TableCell>
                        <TableCell align="right">Cantidad</TableCell>
                        <TableCell align="right">Precio Unit.</TableCell>
                        <TableCell align="right">IVA</TableCell>
                        <TableCell align="right">Costo de Envío</TableCell>
                        {initialData && <TableCell align="right">Costo Unit.</TableCell>}
                        <TableCell align="right">Total</TableCell>
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
                                  product.precio_comprado ||
                                    product.precio_unitario
                                )
                              }
                            >
                              $
                              {(() => {
                                const precioBase = product.precio_comprado || product.precio_unitario;
                                // Si incluye IVA, mostrar el precio sin IVA (precio base / 1.16)
                                if (product.include_tax) {
                                  return (precioBase / 1.16).toFixed(2);
                                } else {
                                  // Si no incluye IVA, mostrar el precio tal como está
                                  return precioBase.toFixed(2);
                                }
                              })()}
                            </Box>
                          </TableCell>
                          <TableCell align="right">
                            <Box
                              sx={{
                                padding: "4px",
                                color: "text.primary",
                              }}
                            >
                              $
                              {(() => {
                                if (initialData) {
                                  // En modo edición, calcular IVA basado en los datos del producto
                                  const costoEnvioUnitario = parseFloat(purchaseData.costo_envio || "0") / productsList.reduce((sum, p) => sum + p.cantidad, 0);
                                  
                                  if (product.include_tax) {
                                    // Si incluye IVA, calcular el IVA basado en el precio sin IVA que ahora mostramos
                                    const precioSinIVA = product.precio_unitario / 1.16;
                                    const ivaCalculado = precioSinIVA * 0.16 * product.cantidad;
                                    return ivaCalculado.toFixed(2);
                                  } else {
                                    // Si no incluye IVA, el IVA es 16% del precio unitario
                                    const ivaCalculado = product.precio_unitario * 0.16 * product.cantidad;
                                    return ivaCalculado.toFixed(2);
                                  }
                                } else {
                                  // Modo creación: cálculo basado en el precio mostrado
                                  if (product.include_tax) {
                                    // El precio sin IVA es el subtotal / 1.16, y el IVA es 16% de ese precio
                                    const precioSinIVA = product.subtotal / 1.16;
                                    const ivaProducto = precioSinIVA * 0.16;
                                    return ivaProducto.toFixed(2);
                                  } else {
                                    return (product.subtotal * 0.16).toFixed(2);
                                  }
                                }
                              })()}
                            </Box>
                          </TableCell>
                          <TableCell align="right">
                            <Box
                              sx={{
                                padding: "4px",
                                color: "text.primary",
                              }}
                            >
                              $
                              {(() => {
                                // Calcular el costo de envío proporcional para este producto
                                const costoEnvioTotal = parseFloat(purchaseData.costo_envio || "0");
                                const totalQuantity = productsList.reduce((sum, p) => sum + p.cantidad, 0);
                                const costoEnvioUnitario = totalQuantity > 0 ? costoEnvioTotal / totalQuantity : 0;
                                const costoEnvioProducto = costoEnvioUnitario * product.cantidad;
                                return costoEnvioProducto.toFixed(2);
                              })()}
                            </Box>
                          </TableCell>
                          {initialData && (
                            <TableCell align="right">
                              <Box
                                sx={{
                                  padding: "4px",
                                  color: "text.primary",
                                  fontWeight: "bold",
                                }}
                              >
                                $
                                {(() => {
                                  // Calcular costo unitario dinámico
                                  const precioUnitarioSinIVA = product.include_tax ? 
                                    product.precio_unitario / 1.16 : 
                                    product.precio_unitario;
                                  
                                  const ivaUnitario = precioUnitarioSinIVA * 0.16;
                                  
                                  // Costo de envío proporcional
                                  const costoEnvioTotal = parseFloat(purchaseData.costo_envio || "0");
                                  const totalQuantity = productsList.reduce((sum, p) => sum + p.cantidad, 0);
                                  const costoEnvioUnitario = totalQuantity > 0 ? costoEnvioTotal / totalQuantity : 0;
                                  
                                  const costoTotal = precioUnitarioSinIVA + ivaUnitario + costoEnvioUnitario;
                                  return costoTotal.toFixed(2);
                                })()}
                              </Box>
                            </TableCell>
                          )}
                          <TableCell align="right">
                            $
                            {(() => {
                              if (initialData) {
                                // En modo edición: Calcular total dinámicamente
                                const precioUnitarioSinIVA = product.include_tax ? 
                                  product.precio_unitario / 1.16 : 
                                  product.precio_unitario;
                                
                                const subtotalSinIVA = precioUnitarioSinIVA * product.cantidad;
                                const ivaTotal = subtotalSinIVA * 0.16;
                                
                                // Costo de envío proporcional
                                const costoEnvioTotal = parseFloat(purchaseData.costo_envio || "0");
                                const totalQuantity = productsList.reduce((sum, p) => sum + p.cantidad, 0);
                                const costoEnvioUnitario = totalQuantity > 0 ? costoEnvioTotal / totalQuantity : 0;
                                const costoEnvioProducto = costoEnvioUnitario * product.cantidad;
                                
                                const totalFinal = subtotalSinIVA + ivaTotal + costoEnvioProducto;
                                return totalFinal.toFixed(2);
                              } else {
                                // En modo creación: calcular el total + agregar costo de envío proporcional
                                const totalConIVA = !product.include_tax ? product.subtotal * 1.16 : product.subtotal;
                                
                                // Calcular el costo de envío proporcional para este producto
                                const costoEnvioTotal = parseFloat(purchaseData.costo_envio || "0");
                                const totalQuantity = productsList.reduce((sum, p) => sum + p.cantidad, 0);
                                const costoEnvioUnitario = totalQuantity > 0 ? costoEnvioTotal / totalQuantity : 0;
                                const costoEnvioProducto = costoEnvioUnitario * product.cantidad;
                                
                                return (totalConIVA + costoEnvioProducto).toFixed(2);
                              }
                            })()}
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
                      
                      {/* Fila de totales */}
                      <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                        <TableCell sx={{ fontWeight: 'bold' }}>
                          Totales
                        </TableCell>
                        <TableCell>
                          {/* Concepto - vacío */}
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                          {(() => {
                            const tableTotals = calculateTableTotals();
                            return tableTotals.totalQuantity;
                          })()}
                        </TableCell>
                        <TableCell align="right">
                          {/* Precio Unit. - vacío */}
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                          $
                          {(() => {
                            const tableTotals = calculateTableTotals();
                            return formatPrice(tableTotals.totalIVA);
                          })()}
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                          $
                          {(() => {
                            // Total del costo de envío
                            const costoEnvioTotal = parseFloat(purchaseData.costo_envio || "0");
                            return formatPrice(costoEnvioTotal);
                          })()}
                        </TableCell>
                        {initialData && (
                          <TableCell align="right" sx={{ fontWeight: 'bold' }}>

                          </TableCell>
                        )}
                        <TableCell align="right" sx={{ fontWeight: 'bold'}}>
                          $
                          {(() => {
                            const tableTotals = calculateTableTotals();
                            return formatPrice(tableTotals.totalImport);
                          })()}
                        </TableCell>
                        <TableCell align="center">
                          {/* Acciones - vacío */}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
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
                    : ""
                }`}
                placeholder={`Ingrese el nuevo ${
                  editingField === "nombre" || editingField === "concepto"
                    ? "concepto"
                    : editingField === "precio_unitario"
                    ? "precio unitario"
                    : editingField === "cantidad"
                    ? "cantidad"
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
            {productSectionError && (
              <Box sx={{ mt: 1 }}>
                <Typography color="error" variant="body2">
                  Debe agregar al menos un producto a la compra
                </Typography>
              </Box>
            )}
            <hr />
            <Typography sx={titleStyle}>Almacén</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" sx={subtitleStyle}>
                  Ubicación del Almacén
                </Typography>
                <FormControl fullWidth required error={!!errors.almacen_id}>
                  <InputLabel>Almacén</InputLabel>
                  <Select
                    label="Almacén"
                    name="almacen_id"
                    value={purchaseData?.almacen_id || ""}
                    onChange={handleChange}
                  >
                    {(filteredStorage as any[]).map((storage: any)=> (
                      <MenuItem key={storage.id} value={storage.id}>
                        {storage.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" sx={subtitleStyle}>
                  Fecha de Recepción (Opcional)
                </Typography>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    value={purchaseData?.fecha_recepcion}
                    format="DD/MM/YYYY"
                    onChange={(newValue) =>
                      handleChange({
                        target: {
                          name: "fecha_recepcion",
                          value: newValue,
                        },
                      })
                    }
                    views={["day", "month", "year"]}
                    openTo="day"
                    slotProps={{
                      textField: {
                        size: "medium",
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
            </Grid>
            <hr />
            <Typography sx={titleStyle}>Datos de la Compra</Typography>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={3}>
                <Typography variant="h6" sx={subtitleStyle}>
                  Fecha de Factura (Opcional)
                </Typography>{" "}
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    value={purchaseData?.fecha_factura}
                    format="DD/MM/YYYY"
                    onChange={(newValue) =>
                      handleChange({
                        target: {
                          name: "fecha_factura",
                          value: newValue,
                        },
                      })
                    }
                    views={["day", "month", "year"]}
                    openTo="day"
                    slotProps={{
                      textField: {
                        size: "medium",
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
              <Grid item xs={12} sm={3}>
                <Typography variant="h6" sx={subtitleStyle}>
                  Fecha de Pago (Opcional)
                </Typography>{" "}
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    value={purchaseData?.fecha_pago}
                    format="DD/MM/YYYY"
                    onChange={(newValue) =>
                      handleChange({
                        target: {
                          name: "fecha_pago",
                          value: newValue,
                        },
                      })
                    }
                    views={["day", "month", "year"]}
                    openTo="day"
                    slotProps={{
                      textField: {
                        size: "medium",
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
              <Grid item xs={12} sm={3}>
                <Typography variant="h6" sx={subtitleStyle}>
                  Método de Pago
                </Typography>{" "}
                <FormControl fullWidth required error={!!errors?.metodo_pago}>
                  <InputLabel>Seleccione un método de pago</InputLabel>
                  <Select
                    label="Seleccione un método de pago"
                    name="metodo_pago"
                    value={purchaseData?.metodo_pago || "efectivo"}
                    onChange={handleChange}
                  >
                    {PAYMENT_METHOD_OPTIONS.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Typography variant="h6" sx={subtitleStyle}>
                  Costos de envío (Opcional)
                </Typography>{" "}
                <TextField
                  type="number"
                  name="costo_envio"
                  label="Costos de envío"
                  variant="outlined"
                  fullWidth
                  value={purchaseData?.costo_envio || ""}
                  onChange={handleChange}
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
            <Typography variant="h6" sx={subtitleStyle}>
              Empleado que registra la compra
            </Typography>{" "}
            <Grid item xs={12}>
              <TextField
                label="Empleado"
                name="empleado_id"
                value={employeeData ? `${(employeeData as any).name} ${(employeeData as any).apellido_paterno || ''} ${(employeeData as any).apellido_materno || ''}`.trim() : ''}
                fullWidth
                disabled
                variant="outlined"
                sx={{
                  '& .MuiInputBase-input.Mui-disabled': {
                    WebkitTextFillColor: '#000000',
                    backgroundColor: '#f5f5f5',
                  },
                  '& .MuiOutlinedInput-root.Mui-disabled .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#e0e0e0',
                  },
                }}
                helperText="Este campo se completa automáticamente con el usuario que inició sesión"
              />
            </Grid>
            {/* PROVEEDOR Y NÚMERO DE FACTURA */}
            <Typography variant="h6" sx={subtitleStyle}>
              Proveedor (Opcional)
            </Typography>{" "}
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Proveedor</InputLabel>
                <Select
                  label="Proveedor"
                  name="proveedor_id"
                  value={purchaseData?.proveedor_id || ""}
                  onChange={handleChange}
                >
                  <MenuItem value="">
                    Sin proveedor
                  </MenuItem>
                  {suppliers.map((supplier) => (
                    <MenuItem key={supplier.id} value={supplier.id}>
                      {supplier.nombre}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Typography variant="h6" sx={subtitleStyle}>
              Número de Factura (Opcional)
            </Typography>{" "}
            <Grid item xs={12}>
              <TextField
                type="text"
                name="numero_factura"
                label="Número de Factura"
                variant="outlined"
                fullWidth
                value={purchaseData?.numero_factura || ""}
                onChange={handleChange}
              />
            </Grid>
            <hr />
            <Typography sx={titleStyle}>General</Typography>
            <Grid container>
              <Grid item xs={12}>
                <Typography variant="h6" sx={subtitleStyle}>
                  Observaciones (Opcional)
                </Typography>
                <TextField
                  variant="outlined"
                  label="Observaciones"
                  fullWidth
                  name="observaciones"
                  value={purchaseData.observaciones || ""}
                  onChange={(e) => {
                    if (e.target.value.length <= 200) {
                      handleChange(e);
                    }
                  }}
                  inputProps={{ maxLength: 200 }}
                />
                <Box
                  display="flex"
                  justifyContent="flex-end"
                  mt={0.5}
                  sx={{
                    color:
                      200 - (purchaseData.observaciones?.length || 0) <= 10
                        ? "error.main"
                        : "text.secondary",
                    fontSize: "0.75rem",
                  }}
                >
                  {200 - (purchaseData.observaciones?.length || 0)} caracteres
                  restantes
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="h6" sx={subtitleStyle}>
                  Estado del Movimiento
                </Typography>{" "}
                <FormControl fullWidth>
                  <InputLabel>Seleccione un estado del movimiento</InputLabel>
                  <Select
                    label="Seleccione un estado del movimiento"
                    name="estado"
                    value={purchaseData?.estado || "completado"}
                    onChange={handleChange}
                  >
                    {MOVEMENT_STATE_OPTIONS.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
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
