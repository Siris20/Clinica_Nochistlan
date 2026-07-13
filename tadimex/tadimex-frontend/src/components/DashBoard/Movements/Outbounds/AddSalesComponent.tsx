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
import { useEnterprise } from "../../../../context/EnterpriseContext";
import { useBranch } from "../../../../context/BranchContext";
import { useAuth } from "../../../../context/AuthContext";
import { useStorage } from "../../../../hooks/Storage/useStorage";
import { useStock } from "../../../../hooks/Stock/useStock";
import { useSuppliers } from "../../../../hooks/Suppliers/useSuppliers";
import { useProducts } from "../../../../hooks/Products/useProducts";
import { EditablePopover } from "../../Quotes/EditablePopover";
import { MOVEMENT_STATE_OPTIONS } from "../../movement_state";
import { PAYMENT_METHOD_OPTIONS } from "../../payment_method";
import { useClients } from '../../../../hooks/Clients/useClients';
import { useQuotes } from '../../../../hooks/Quotes/useQuotes';

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
  precio_unitario: number;  // Precio base sin IVA
  precio_unitario_original?: number;  // Para edición: precio base guardado
  precio_vendido: number;
  costo_unitario?: number;  // Precio total con IVA si aplica
  descuento: number;
  subtotal: number;
  include_tax: boolean;
  almacen_id?: number;
  almacen_nombre?: string;
  existencias?: number; // Para mostrar las existencias disponibles
}

export const AddSalesComponent = ({
  open,
  setOpen,
  onAddSales,
  onEditSales,
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

  //Hook de stock para obtener existencias
  const { getProductStockInStorage } = useStock(selectedBranch);

  //Hook de clientes
  const { allFilteredClients: clients } = useClients(selectedEnterprise);

  //Hook de cotizaciones
  const { allFilteredQuotes: quotes } = useQuotes(selectedEnterprise);

  //Hook de productos - usar null para searchterm y false para isBackendPaginated
  const {
     allFilteredProducts: products,
     handleGetAllProductsByEnterprise,
     loadingProducts 
    } = useProducts(null, selectedEnterprise, false);

  const [saleData, setSaleData] = useState({
    empleado_id: "",
    tipo_movimiento: "salida",
    observaciones: "",
    estado: "completado",
    fecha_salida: null as dayjs.Dayjs | null,
    numero_factura: "",
    fecha_factura: null as dayjs.Dayjs | null,
    fecha_pago: null as dayjs.Dayjs | null,
    metodo_pago: "efectivo",
    costo_envio: "",
    cliente_id: "",
    cotizacion_id: "",
  });

  const [errors, setErrors] = useState({
    empleado_id: "",
    metodo_pago: "",
    cliente_id: "",
  });

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productsList, setProductsList] = useState<ProductInList[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [discount, setDiscount] = useState(0);
  const [subtotal, setSubtotal] = useState(0);
  const [selectedStorage, setSelectedStorage] = useState("");
  const [stockQuantity, setStockQuantity] = useState<number | null>(null);
  const [loadingStock, setLoadingStock] = useState(false);
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
  const [productStockMap, setProductStockMap] = useState<Map<string, number>>(new Map()); // Mapa para existencias por producto-almacén
  const [originalPrice, setOriginalPrice] = useState<number>(0); // Precio original del producto (nuestro costo)
  const [initialDataLoaded, setInitialDataLoaded] = useState(false); // Bandera para controlar carga inicial

  // Función para manejar la selección del producto
  const handleProductSelection = (event, newValue) => {
    setSelectedProduct(newValue);

    if (newValue) {
      setModelInputValue(newValue.model || "");
      setNameInputValue(newValue.name || "");
      // Si el producto tiene la propiedad include_tax, usarla, si no, usar false por defecto
      setIncludeTax(newValue.include_tax || false);
      // Guardar el precio original (nuestro costo)
      setOriginalPrice(newValue.sell_price);

      calculateSubtotal(quantity, newValue.sell_price, discount);
    } else {
      // Si se deselecciona, limpiamos ambos
      setModelInputValue("");
      setNameInputValue("");
      setIncludeTax(false);
      setSubtotal(0);
      setStockQuantity(null); // Limpiar existencias
      setOriginalPrice(0); // Limpiar precio original
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
        setOriginalPrice(filteredByModel[0].sell_price); // Guardar precio original
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
        setOriginalPrice(filteredByName[0].sell_price); // Guardar precio original
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
    let newQuantity = Number(event.target.value);
    
    // Validar que la cantidad no sea negativa
    if (newQuantity < 1) {
      newQuantity = 1;
    }
    
    // Si hay existencias disponibles, limitar la cantidad al stock máximo
    if (stockQuantity !== null && newQuantity > stockQuantity) {
      newQuantity = stockQuantity;
      // Mostrar mensaje de advertencia
      if (stockQuantity === 0) {
        toast.warning("Este producto no tiene existencias en el almacén seleccionado");
      } else {
        toast.warning(`Cantidad limitada a ${stockQuantity} unidades (existencias disponibles)`);
      }
    }
    
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

  // Función para manejar cambios en el precio de venta
  const handlePriceChange = (event) => {
    const newPrice = parseFloat(event.target.value) || 0;
    if (selectedProduct) {
      setSelectedProduct({
        ...selectedProduct,
        sell_price: newPrice
      });
      calculateSubtotal(quantity, newPrice, discount);
    }
  };

  // Función para obtener las existencias de un producto en un almacén específico
  const getProductStock = async (productId, storageId) => {
    if (!productId || !storageId) {
      setStockQuantity(null);
      return;
    }

    try {
      setLoadingStock(true);
      const quantity = await getProductStockInStorage(productId, parseInt(storageId));
      setStockQuantity(quantity);
    } catch (error) {
      console.error("Error al obtener existencias:", error);
      setStockQuantity(0);
    } finally {
      setLoadingStock(false);
    }
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
      sum + (product.precio_vendido || product.precio_unitario) * product.cantidad, 0
    );
    const averagePrice = totalValue / totalQuantity;
    
    let totalUnitPrice = 0; // Subtotal
    let totalIVA = 0; // IVA total
    let totalImport = 0; // Total final

    if (initialData) {
      // En modo edición: ajustar cálculos para mostrar precios sin IVA
      const costoEnvioTotal = parseFloat(saleData.costo_envio || "0");
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
      const costoEnvioTotal = parseFloat(saleData.costo_envio || "0");
      
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

  // Función para actualizar las existencias de un producto en un almacén específico
  const updateProductStock = async (productId: number, storageId: number) => {
    if (!productId || !storageId) return 0;
    
    const stockKey = `${productId}-${storageId}`;
    
    // Si ya tenemos la información en cache, la usamos
    if (productStockMap.has(stockKey)) {
      return productStockMap.get(stockKey) || 0;
    }
    
    try {
      const stock = await getProductStockInStorage(productId, storageId);
      
      // Actualizar el mapa de existencias
      setProductStockMap(prev => new Map(prev.set(stockKey, stock)));
      
      return stock;
    } catch (error) {
      console.error("Error al obtener existencias:", error);
      return 0;
    }
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
        product.precio_vendido = newPrice;
        // Recalcular el subtotal
        product.subtotal =
          product.cantidad * newPrice * (1 - product.descuento / 100);
        break;
      case "cantidad":
        const newQuantity = parseInt(validValue);
        if (isNaN(newQuantity) || newQuantity <= 0) return; // Validar cantidad positiva
        
        // Validar contra existencias disponibles
        if (product.existencias !== undefined && newQuantity > product.existencias) {
          toast.error(`No puedes asignar ${newQuantity} unidades. Solo hay ${product.existencias} existencias disponibles en ${product.almacen_nombre}`);
          return;
        }
        
        product.cantidad = newQuantity;
        // Recalcular el subtotal
        product.subtotal =
          newQuantity * (product.precio_vendido || product.precio_unitario) * (1 - product.descuento / 100);
        break;
      case "descuento":
        const newDiscount = parseFloat(validValue);
        if (isNaN(newDiscount) || newDiscount < 0 || newDiscount > 100) return; // Validar descuento entre 0 y 100
        product.descuento = newDiscount;
        // Recalcular el subtotal
        product.subtotal =
          product.cantidad * (product.precio_vendido || product.precio_unitario) * (1 - newDiscount / 100);
        break;
      case "almacen":
        const newStorageId = parseInt(validValue);
        if (isNaN(newStorageId)) return; // Validar que sea un ID válido
        
        const newStorage = filteredStorage.find(s => s.id === newStorageId);
        if (!newStorage) return; // Validar que el almacén exista
        
        product.almacen_id = newStorageId;
        product.almacen_nombre = newStorage.name;
        
        // Actualizar existencias de forma asíncrona
        updateProductStock(product.id, newStorageId).then(stock => {
          product.existencias = stock;
          // Forzar re-render para mostrar las nuevas existencias
          setProductsList([...updatedProducts]);
        });
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
        : editingField === "almacen"
        ? "almacén"
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
      setSaleData(prev => ({
        ...prev,
        empleado_id: (employeeData as any).id
      }));
    }
  }, [employeeData]);

  // UseEffect para cargar los datos iniciales cuando se está editando
  useEffect(() => {
    const loadInitialData = async () => {
      if (initialData && products.length > 0 && filteredStorage.length > 0 && !initialDataLoaded) {
        // Cargar datos básicos de la venta
        setSaleData({
          empleado_id: initialData.empleado_id || (employeeData as any)?.id || "",
          tipo_movimiento: initialData.tipo_movimiento || "salida",
          observaciones: initialData.observaciones || "",
          estado: initialData.estado || "completado",
          fecha_salida: initialData.fecha_salida ? dayjs(initialData.fecha_salida) : null,
          numero_factura: initialData.numero_factura || "",
          fecha_factura: initialData.fecha_factura ? dayjs(initialData.fecha_factura) : null,
          fecha_pago: initialData.fecha_pago ? dayjs(initialData.fecha_pago) : null,
          metodo_pago: initialData.metodo_pago || "efectivo",
          costo_envio: initialData.costo_envio || "",
          cliente_id: initialData.cliente_id || "",
          cotizacion_id: initialData.cotizacion_id || "",
        });

        // Cargar lista de productos (cambiar de productos_comprados a productos_vendidos)
        if (
          initialData.productos_vendidos &&
          initialData.productos_vendidos.length > 0
        ) {
          const productosEnriquecidos = await Promise.all(
            initialData.productos_vendidos.map(async (producto: any) => {
              // Encontrar el producto completo en la lista de productos
              const productoCompleto = (products as any[]).find(
                (p: any) => p.id === producto.producto_id
              );

              if (productoCompleto) {
                // Buscar información del almacén en filteredStorage
                const almacenInfo = (filteredStorage as any[]).find((s: any) => s.id === producto.almacen_id);
                const almacenNombre = almacenInfo?.name || "Almacén no encontrado";

                // Obtener existencias reales del producto en el almacén
                let existencias = 0;
                try {
                  existencias = await getProductStockInStorage(producto.producto_id, producto.almacen_id);
                } catch (error) {
                  console.error("Error al obtener existencias:", error);
                  existencias = 0;
                }

                return {
                  id: productoCompleto.id,
                  modelo: productoCompleto.model,
                  nombre: productoCompleto.name,
                  concepto: productoCompleto.name,
                  cantidad: producto.cantidad,
                  precio_unitario: parseFloat(producto.precio_unitario_original || productoCompleto.sell_price),
                  precio_unitario_original: parseFloat(producto.precio_unitario_original),
                  precio_vendido: parseFloat(producto.precio_unitario_original || productoCompleto.sell_price),
                  costo_unitario: parseFloat(producto.costo_unitario), // Precio con IVA
                  descuento: 0, // Los descuentos ya están calculados en el backend
                  subtotal: parseFloat(producto.importe || (producto.costo_unitario * producto.cantidad)), // El importe es el subtotal
                  include_tax: false, // Para ventas normalmente no usamos IVA
                  almacen_id: producto.almacen_id,
                  almacen_nombre: almacenNombre,
                  existencias: existencias,
                };
              }
              return null;
            })
          );

          const productosFiltrados = productosEnriquecidos.filter(Boolean);
          setProductsList(productosFiltrados);
          setInitialDataLoaded(true); // Marcar que ya se cargaron los datos iniciales
        }
      }
    };

    loadInitialData();
  }, [initialData, products, filteredStorage, getProductStockInStorage, initialDataLoaded]); // Agregar initialDataLoaded como dependencia

  // UseEffect para resetear la bandera cuando cambie el initialData
  useEffect(() => {
    setInitialDataLoaded(false);
  }, [initialData]);

  // UseEffect para actualizar costos unitarios en tiempo real cuando cambie el costo de envío
  useEffect(() => {
    if (initialData && productsList.length > 0) {
      const costoEnvio = parseFloat(saleData.costo_envio || "0");
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
  }, [saleData.costo_envio, initialData]); // Se ejecuta cuando cambia el costo de envío

  // UseEffect para forzar re-render en modo creación cuando cambie el costo de envío
  useEffect(() => {
    // En modo creación, solo necesitamos que se re-renderice la tabla
    // Los cálculos se hacen en calculateTableTotals()
    if (!initialData) {
      setForceUpdate(prev => prev + 1);
    }
  }, [saleData.costo_envio, initialData]);

  // UseEffect para obtener existencias cuando cambia el producto o almacén seleccionado
  useEffect(() => {
    if (selectedProduct && selectedStorage) {
      getProductStock(selectedProduct.id, parseInt(selectedStorage));
    } else {
      setStockQuantity(null);
    }
  }, [selectedProduct, selectedStorage]);

  const formatPrice = (price) => {
    return price.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  // Función para manejar cambios en los campos del formulario
  const handleChange = (e) => {
    const { name, value } = e.target;

    setSaleData((prev) => ({
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

  // Función para manejar la selección de cotización y cargar productos
  const handleQuoteSelection = async (e) => {
    const { name, value } = e.target;

    // Actualizar el estado del formulario
    setSaleData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }

    // Si se seleccionó una cotización, cargar sus productos
    if (value && quotes.length > 0) {
      const selectedQuote = quotes.find(quote => quote.id === parseInt(value));
      
      if (selectedQuote) {
        // Establecer automáticamente el cliente de la cotización
        setSaleData(prev => ({
          ...prev,
          cliente_id: selectedQuote.cliente_id ? selectedQuote.cliente_id.toString() : "",
        }));

        if (selectedQuote.productos_cotizados) {
          try {
            // Convertir productos de cotización al formato de la tabla
            const quotedProducts = [];
            
            for (const quotedProduct of selectedQuote.productos_cotizados) {
              // Buscar el producto completo en la lista de productos
              const fullProduct = products.find(p => p.id === quotedProduct.producto_id);
              
              if (fullProduct) {
                const defaultStorage = filteredStorage.length > 0 ? filteredStorage[0] : null;
                
                const newProduct: ProductInList = {
                  id: fullProduct.id,
                  nombre: fullProduct.name,
                  concepto: quotedProduct.concepto || fullProduct.name,
                  modelo: fullProduct.model,
                  cantidad: quotedProduct.cantidad,
                  precio_unitario: quotedProduct.precio_unitario,
                  precio_vendido: quotedProduct.precio_unitario,
                  descuento: quotedProduct.descuento || 0,
                  subtotal: quotedProduct.precio_unitario * quotedProduct.cantidad,
                  include_tax: false, // Por defecto
                  almacen_id: defaultStorage ? defaultStorage.id : null,
                  almacen_nombre: defaultStorage ? defaultStorage.name : "Sin almacén",
                  existencias: undefined, // Se cargará después
                };
                
                // Cargar existencias de forma asíncrona si hay almacén
                if (defaultStorage) {
                  updateProductStock(fullProduct.id, defaultStorage.id).then(stock => {
                    // Actualizar el producto con las existencias
                    setProductsList(prevList => 
                      prevList.map(p => 
                        p.id === fullProduct.id ? { ...p, existencias: stock } : p
                      )
                    );
                  });
                }
                
                quotedProducts.push(newProduct);
              }
            }
            
            // Cargar los productos en la tabla
            setProductsList(quotedProducts);
            setProductSectionError(false);
            
            // También cargar datos adicionales de la cotización si es necesario
            if (selectedQuote.gastos_envio) {
              setSaleData(prev => ({
                ...prev,
                costo_envio: selectedQuote.gastos_envio.toString()
              }));
            }
            
            // Limpiar los campos de selección de producto
            setSelectedProduct(null);
            setModelInputValue("");
            setNameInputValue("");
            setQuantity(1);
            setSubtotal(0);
            
            toast.success(`Se cargaron ${quotedProducts.length} productos de la cotización ${selectedQuote.folio}`);
            
          } catch (error) {
            console.error('Error al cargar productos de cotización:', error);
            toast.error('Error al cargar los productos de la cotización');
          }
        } else {
          // Si la cotización no tiene productos, solo limpiar la tabla
          setProductsList([]);
          
          // Pero aún cargar gastos de envío si existen
          if (selectedQuote.gastos_envio) {
            setSaleData(prev => ({
              ...prev,
              costo_envio: selectedQuote.gastos_envio.toString()
            }));
          }
        }
      }
    } else if (!value) {
      // Si se deseleccionó la cotización, limpiar la tabla y el cliente
      setProductsList([]);
      setSaleData(prev => ({
        ...prev,
        cliente_id: "",
        costo_envio: "",
      }));
    }
  };

  //Validaciones
  const validateFields = () => {
    const newErrors: any = {};
    let isValid = true;

    const requiredFields = [
      "empleado_id",
      "metodo_pago",
      "cliente_id"
    ];

    requiredFields.forEach((key) => {
      if (!saleData[key as keyof typeof saleData] || saleData[key as keyof typeof saleData] === "") {
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

    const productos_vendidos = productsList.map((product) => ({
      producto_id: product.id,
      cantidad: product.cantidad,
      precio_unitario_original: product.precio_unitario,  // Precio base sin IVA
      costo_unitario: product.precio_vendido || product.precio_unitario,  // Precio total con IVA si aplica
      incluye_iva_original: product.include_tax,  // Si el precio incluye IVA
      almacen_id: product.almacen_id,
    }));

    // Estructura para crear venta (POST)
    const createData = {
      empleado_id: parseInt(saleData.empleado_id),
      tipo_movimiento: saleData.tipo_movimiento,
      observaciones: saleData.observaciones || "",
      estado: saleData.estado,
      fecha_salida: saleData.fecha_salida ? dayjs(saleData.fecha_salida).format("YYYY-MM-DD") : null,
      numero_factura: saleData.numero_factura || "",
      fecha_factura: saleData.fecha_factura ? dayjs(saleData.fecha_factura).format("YYYY-MM-DD") : null,
      fecha_pago: saleData.fecha_pago ? dayjs(saleData.fecha_pago).format("YYYY-MM-DD") : null,
      metodo_pago: saleData.metodo_pago,
      costo_envio: saleData.costo_envio ? parseFloat(saleData.costo_envio) : 0,
      cliente_id: parseInt(saleData.cliente_id),
      productos_vendidos: productos_vendidos,
    };

    // Estructura para editar venta (PUT) - TODO: Ajustar cuando implementemos edición
    const editData = {
      venta_data: {
        empleado_id: parseInt(saleData.empleado_id),
        tipo_movimiento: saleData.tipo_movimiento,
        observaciones: saleData.observaciones || "",
        estado: saleData.estado,
        fecha_salida: saleData.fecha_salida ? dayjs(saleData.fecha_salida).format("YYYY-MM-DD") : null,
        numero_factura: saleData.numero_factura || "",
        fecha_factura: saleData.fecha_factura ? dayjs(saleData.fecha_factura).format("YYYY-MM-DD") : null,
        fecha_pago: saleData.fecha_pago ? dayjs(saleData.fecha_pago).format("YYYY-MM-DD") : null,
        metodo_pago: saleData.metodo_pago,
        costo_envio: saleData.costo_envio ? parseFloat(saleData.costo_envio) : 0,
        cliente_id: parseInt(saleData.cliente_id),
      },
      productos_vendidos: productos_vendidos,
    };

    if (initialData) {
      // Para editar venta
      editData.venta_data.id = initialData.id;
      onEditSales(editData);
    } else {
      // Para crear venta
      onAddSales(createData);
    }
    handleCloseDialog();
  };

  // Agregar función para manejar la adición de productos
  const handleAddProduct = () => {
    if (!selectedProduct) {
      toast.error("Por favor selecciona un producto");
      return;
    }

    if (!selectedStorage) {
      toast.error("Por favor selecciona el almacén de donde saldrá el producto");
      return;
    }

    if (quantity <= 0) {
      toast.error("La cantidad debe ser mayor a 0");
      return;
    }

    // Verificar existencias más específicamente
    if (stockQuantity !== null) {
      if (stockQuantity === 0) {
        toast.error("Este producto no tiene existencias en el almacén seleccionado");
        return;
      }
      
      if (quantity > stockQuantity) {
        toast.error(`No hay suficientes existencias. Disponible: ${stockQuantity}, solicitado: ${quantity}`);
        return;
      }
    }

    // Verificar si el producto ya existe en la lista
    const productExists = productsList.some(
      (product) => product.id === selectedProduct.id
    );

    if (productExists) {
      toast.warning(
        `El producto "${selectedProduct.name}" ya ha sido agregado a la venta`
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
      const costoEnvioActual = parseFloat(saleData.costo_envio || "0");
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
          precio_vendido: precioOriginal,
          costo_unitario: costoFinal,
          descuento: discount,
          subtotal: importeTotal, // Incluye envío desde el inicio
          include_tax: includeTax, // Usar la configuración actual del checkbox
          almacen_id: parseInt(selectedStorage),
          almacen_nombre: filteredStorage.find((s: any) => s.id === parseInt(selectedStorage))?.name || "",
          existencias: stockQuantity || 0, // Incluir existencias
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
          precio_vendido: selectedProduct.sell_price,
          costo_unitario: costoFinal,
          descuento: discount,
          subtotal: importeTotal, // Incluye envío desde el inicio
          include_tax: includeTax,
          almacen_id: parseInt(selectedStorage),
          almacen_nombre: filteredStorage.find((s: any) => s.id === parseInt(selectedStorage))?.name || "",
          existencias: stockQuantity || 0, // Incluir existencias
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
        precio_vendido: selectedProduct.sell_price,
        descuento: discount,
        subtotal: subtotal,
        include_tax: includeTax,
        almacen_id: parseInt(selectedStorage),
        almacen_nombre: filteredStorage.find((s: any) => s.id === parseInt(selectedStorage))?.name || "",
        existencias: stockQuantity || 0, // Incluir existencias
      };
    }

    setProductsList([...productsList, newProduct]);
    setProductSectionError(false);

    // Limpiar los campos
    setSelectedProduct(null);
    setQuantity(1);
    setDiscount(0);
    setSubtotal(0);
    setSelectedStorage("");
    setStockQuantity(null);
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
    setSaleData({
      empleado_id: (employeeData as any)?.id || "",
      tipo_movimiento: "salida",
      observaciones: "",
      estado: "completado",
      fecha_salida: null,
      numero_factura: "",
      fecha_factura: null,
      fecha_pago: null,
      metodo_pago: "efectivo",
      costo_envio: "",
      cliente_id: "",
      cotizacion_id: "",
    });
    setErrors({
      empleado_id: "",
      metodo_pago: "",
      cliente_id: "",
    });
    // Limpiar datos de productos
    setProductsList([]);
    setProductSectionError(false);
    setSelectedProduct(null);
    setQuantity(1);
    setDiscount(0);
    setSubtotal(0);
    setSelectedStorage("");
    setStockQuantity(null);
    setModelInputValue("");
    setNameInputValue("");
    setIncludeTax(false); // Limpiar el estado del IVA
    setActiveField(null);
    
    // Limpiar el mapa de existencias para evitar datos obsoletos
    setProductStockMap(new Map());
    
    // Resetear bandera de datos iniciales cargados
    setInitialDataLoaded(false);
    
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
          {initialData ? "Editar Venta" : "Registrar Venta"}
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
            <Grid container spacing={1}>
              <Grid item xs={12}>
                <Typography sx={{ ...subtitleStyle, fontSize: 14 }}>
                  Cotización (Opcional)
                </Typography>
                <FormControl fullWidth size="small">
                  <InputLabel>Cotización</InputLabel>
                  <Select
                    label="Cotización"
                    name="cotizacion_id"
                    value={saleData?.cotizacion_id || ""}
                    onChange={handleQuoteSelection}
                    size="small"
                  >
                    <MenuItem value="">
                      Sin cotización
                    </MenuItem>
                    {(quotes as any[]).map((quote: any)=> (
                      <MenuItem key={quote.id} value={quote.id}>
                        {quote.folio} - ${quote.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <hr />
            <Typography sx={titleStyle}>Productos a Vender</Typography>
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
              <Grid item xs={12} md={3}>
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
                  error={stockQuantity !== null && (stockQuantity === 0 || quantity > stockQuantity)}
                  helperText={
                    stockQuantity !== null 
                      ? stockQuantity === 0 
                        ? "Sin existencias disponibles"
                        : quantity > stockQuantity 
                          ? `Máximo disponible: ${stockQuantity}` 
                          : `Disponible: ${stockQuantity}`
                      : selectedProduct && selectedStorage 
                        ? "Consultando existencias..."
                        : undefined
                  }
                  inputProps={{
                    min: "1",
                    step: "1",
                    max: stockQuantity && stockQuantity > 0 ? stockQuantity : undefined,
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
                {/* Mostrar precios con diferentes márgenes */}
                {selectedProduct && originalPrice > 0 && (
                  <Box sx={{ mt: 0.5 }}>
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        fontSize: '0.75rem', 
                        color: 'primary.main',
                        display: 'block',
                        cursor: 'pointer',
                        '&:hover': { backgroundColor: 'primary.light', color: 'white', p: 0.5, borderRadius: 1 }
                      }}
                      onClick={() => {
                        const nuestroCosto = originalPrice;
                        const event = { target: { value: nuestroCosto.toString() } };
                        handlePriceChange(event as any);
                      }}
                    >
                      Nuestro costo: ${originalPrice.toFixed(2)}
                    </Typography>
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        fontSize: '0.75rem', 
                        color: 'warning.main',
                        display: 'block',
                        cursor: 'pointer',
                        '&:hover': { backgroundColor: 'warning.light', color: 'white', p: 0.5, borderRadius: 1 }
                      }}
                      onClick={() => {
                        const precioIntegrador = originalPrice * 1.20;
                        const event = { target: { value: precioIntegrador.toString() } };
                        handlePriceChange(event as any);
                      }}
                    >
                      Precio integrador (+20%): ${(originalPrice * 1.20).toFixed(2)}
                    </Typography>
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        fontSize: '0.75rem', 
                        color: 'success.main',
                        display: 'block',
                        cursor: 'pointer',
                        '&:hover': { backgroundColor: 'success.light', color: 'white', p: 0.5, borderRadius: 1 }
                      }}
                      onClick={() => {
                        const precioPublico = originalPrice * 1.40;
                        const event = { target: { value: precioPublico.toString() } };
                        handlePriceChange(event as any);
                      }}
                    >
                      Precio al público (+40%): ${(originalPrice * 1.40).toFixed(2)}
                    </Typography>
                  </Box>
                )}
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography sx={{ ...subtitleStyle, fontSize: 14 }}>
                  Almacén
                </Typography>
                <FormControl fullWidth required size="small">
                  <InputLabel>Seleccionar Almacén</InputLabel>
                  <Select
                    label="Seleccionar Almacén"
                    value={selectedStorage}
                    onChange={(e) => setSelectedStorage(e.target.value)}
                    size="small"
                  >
                    {(filteredStorage as any[]).map((storage: any)=> (
                      <MenuItem key={storage.id} value={storage.id}>
                        {storage.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                {/* Mostrar existencias */}
                {selectedProduct && selectedStorage && (
                  <Box sx={{ mt: 0.5 }}>
                    {loadingStock ? (
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          fontSize: '0.75rem', 
                          color: 'text.secondary',
                          fontStyle: 'italic'
                        }}
                      >
                        Consultando existencias...
                      </Typography>
                    ) : (
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          fontSize: '0.75rem', 
                          color: stockQuantity === 0 ? 'error.main' : stockQuantity && stockQuantity < 10 ? 'warning.main' : 'success.main',
                          fontWeight: 'bold'
                        }}
                      >
                        Existencias: {stockQuantity !== null ? stockQuantity : 'N/A'}
                        {stockQuantity === 0 && ' (Sin stock)'}
                        {stockQuantity && stockQuantity > 0 && stockQuantity < 10 && ' (Stock bajo)'}
                      </Typography>
                    )}
                  </Box>
                )}
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
                    disabled={
                      !selectedProduct || 
                      !selectedStorage || 
                      quantity <= 0 || 
                      (stockQuantity !== null && (stockQuantity === 0 || quantity > stockQuantity))
                    }
                    sx={{
                      width: 30,
                      height: 30,
                      borderRadius: "50%",
                      backgroundColor: 
                        !selectedProduct || 
                        !selectedStorage || 
                        quantity <= 0 || 
                        (stockQuantity !== null && (stockQuantity === 0 || quantity > stockQuantity))
                          ? "#ccc" 
                          : "#000",
                      color: "#fff",
                      "&:hover": {
                        backgroundColor: 
                          !selectedProduct || 
                          !selectedStorage || 
                          quantity <= 0 || 
                          (stockQuantity !== null && (stockQuantity === 0 || quantity > stockQuantity))
                            ? "#ccc" 
                            : "#333",
                      },
                      "&:disabled": {
                        backgroundColor: "#ccc",
                        color: "#999",
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
                        <TableCell>Almacén</TableCell>
                        <TableCell align="right">Cantidad</TableCell>
                        <TableCell align="right">Precio de Venta</TableCell>
                        <TableCell align="right">IVA</TableCell>
                        <TableCell align="right">Costo de Envío</TableCell>
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
                          <TableCell>
                            <Box
                              sx={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "flex-start",
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
                                  "almacen",
                                  product.almacen_id || ""
                                )
                              }
                            >
                              <Box component="span" sx={{ fontWeight: 500 }}>
                                {product.almacen_nombre || "Sin almacén"}
                              </Box>
                              {product.almacen_id && (
                                <Box 
                                  component="span" 
                                  sx={{ 
                                    fontSize: "0.75rem", 
                                    color: product.existencias === 0 ? "error.main" : 
                                           product.existencias && product.existencias < product.cantidad ? "warning.main" : 
                                           "success.main",
                                    fontWeight: 500
                                  }}
                                >
                                  Existencias: {product.existencias !== undefined ? product.existencias : "Cargando..."}
                                  {product.existencias !== undefined && product.existencias < product.cantidad && 
                                    " ⚠️ Insuficiente"
                                  }
                                  {product.existencias === 0 && " ❌ Sin stock"}
                                </Box>
                              )}
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
                                  product.precio_vendido ||
                                    product.precio_unitario
                                )
                              }
                            >
                              $
                              {(() => {
                                const precioBase = product.precio_vendido || product.precio_unitario;
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
                                  const costoEnvioUnitario = parseFloat(saleData.costo_envio || "0") / productsList.reduce((sum, p) => sum + p.cantidad, 0);
                                  
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
                                const costoEnvioTotal = parseFloat(saleData.costo_envio || "0");
                                const totalQuantity = productsList.reduce((sum, p) => sum + p.cantidad, 0);
                                const costoEnvioUnitario = totalQuantity > 0 ? costoEnvioTotal / totalQuantity : 0;
                                const costoEnvioProducto = costoEnvioUnitario * product.cantidad;
                                return costoEnvioProducto.toFixed(2);
                              })()}
                            </Box>
                          </TableCell>
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
                                const costoEnvioTotal = parseFloat(saleData.costo_envio || "0");
                                const totalQuantity = productsList.reduce((sum, p) => sum + p.cantidad, 0);
                                const costoEnvioUnitario = totalQuantity > 0 ? costoEnvioTotal / totalQuantity : 0;
                                const costoEnvioProducto = costoEnvioUnitario * product.cantidad;
                                
                                const totalFinal = subtotalSinIVA + ivaTotal + costoEnvioProducto;
                                return totalFinal.toFixed(2);
                              } else {
                                // En modo creación: calcular el total + agregar costo de envío proporcional
                                const totalConIVA = !product.include_tax ? product.subtotal * 1.16 : product.subtotal;
                                
                                // Calcular el costo de envío proporcional para este producto
                                const costoEnvioTotal = parseFloat(saleData.costo_envio || "0");
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
                        <TableCell>
                          {/* Almacén - vacío */}
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
                            const costoEnvioTotal = parseFloat(saleData.costo_envio || "0");
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
                    : editingField === "descuento"
                    ? "descuento"
                    : editingField === "almacen"
                    ? "almacén"
                    : ""
                }`}
                placeholder={`${
                  editingField === "nombre" || editingField === "concepto"
                    ? "Ingrese el nuevo concepto"
                    : editingField === "precio_unitario"
                    ? "Ingrese el nuevo precio unitario"
                    : editingField === "cantidad"
                    ? editingIndex !== null && productsList[editingIndex]?.existencias !== undefined
                      ? `Máximo disponible: ${productsList[editingIndex].existencias} unidades`
                      : "Ingrese la nueva cantidad"
                    : editingField === "descuento"
                    ? "Ingrese el nuevo descuento"
                    : editingField === "almacen"
                    ? "Seleccione un almacén"
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
                    : editingField === "almacen"
                    ? "select"
                    : "number"
                }
                width={
                  editingField === "nombre" || editingField === "concepto"
                    ? "500px"
                    : editingField === "almacen"
                    ? "350px"
                    : "200px"
                }
                options={editingField === "almacen" ? filteredStorage : []}
                optionValue="id"
                optionLabel="name"
                max={
                  editingField === "descuento" 
                    ? "100" 
                    : editingField === "cantidad" && editingIndex !== null && productsList[editingIndex]?.existencias !== undefined
                      ? productsList[editingIndex].existencias.toString()
                      : undefined
                }
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
            <Typography sx={titleStyle}>Datos de la Venta</Typography>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={3}>
                <Typography variant="h6" sx={subtitleStyle}>
                  Fecha de Factura (Opcional)
                </Typography>{" "}
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    value={saleData?.fecha_factura}
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
                    value={saleData?.fecha_pago}
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
                    value={saleData?.metodo_pago || "efectivo"}
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
                  value={saleData?.costo_envio || ""}
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
                        {/* Cliente Y NÚMERO DE FACTURA */}
            <Typography variant="h6" sx={subtitleStyle}>
              Cliente
            </Typography>{" "}
            <Grid item xs={12}>
              <FormControl fullWidth required error={!!errors?.cliente_id}>
                <InputLabel>Cliente</InputLabel>
                <Select
                  label="Cliente"
                  name="cliente_id"
                  value={saleData?.cliente_id || ""}
                  onChange={handleChange}
                  disabled={!!saleData.cotizacion_id}
                  sx={{
                    '& .MuiInputBase-input.Mui-disabled': {
                      WebkitTextFillColor: '#000000',
                      backgroundColor: '#f5f5f5',
                    },
                    '& .MuiOutlinedInput-root.Mui-disabled .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#e0e0e0',
                    },
                  }}
                >
                  {clients.map((client) => (
                    <MenuItem key={client.id} value={client.id}>
                      {client.nombre_fiscal}
                    </MenuItem>
                  ))}
                </Select>
                {errors.cliente_id && (
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      mt: 0.5, 
                      color: 'error.main',
                      fontSize: '0.75rem',
                      display: 'block'
                    }}
                  >
                    {errors.cliente_id}
                  </Typography>
                )}
                {saleData.cotizacion_id && (
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      mt: 0.5, 
                      color: 'text.secondary',
                      fontSize: '0.75rem',
                      fontStyle: 'italic'
                    }}
                  >
                    El cliente se establece automáticamente al seleccionar una cotización
                  </Typography>
                )}
              </FormControl>
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
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" sx={subtitleStyle}>
                  Número de Factura (Opcional)
                </Typography>{" "}
                  <TextField
                    type="text"
                    name="numero_factura"
                    label="Número de Factura"
                    variant="outlined"
                    fullWidth
                    value={saleData?.numero_factura || ""}
                    onChange={handleChange}
                  />
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" sx={subtitleStyle}>
                  Fecha de Salida (Opcional)
                </Typography>{" "}
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    value={saleData?.fecha_salida}
                    format="DD/MM/YYYY"
                    onChange={(newValue) =>
                      handleChange({
                        target: {
                          name: "fecha_salida",
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
            <Typography sx={titleStyle}>General</Typography>
            <Grid container>
                            <Grid item xs={12}>
                <Typography variant="h6" sx={subtitleStyle}>
                  Estado del Movimiento
                </Typography>{" "}
                <FormControl fullWidth>
                  <InputLabel>Seleccione un estado del movimiento</InputLabel>
                  <Select
                    label="Seleccione un estado del movimiento"
                    name="estado"
                    value={saleData?.estado || "completado"}
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
              <Grid item xs={12}>
                <Typography variant="h6" sx={subtitleStyle}>
                  Observaciones (Opcional)
                </Typography>
                <TextField
                  variant="outlined"
                  label="Observaciones"
                  fullWidth
                  name="observaciones"
                  value={saleData.observaciones || ""}
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
                      200 - (saleData.observaciones?.length || 0) <= 10
                        ? "error.main"
                        : "text.secondary",
                    fontSize: "0.75rem",
                  }}
                >
                  {200 - (saleData.observaciones?.length || 0)} caracteres
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
