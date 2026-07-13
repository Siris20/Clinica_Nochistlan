import { useEffect, useState, useMemo } from "react";
import { useStorage } from "../Storage/useStorage";
import { useProducts } from "../Products/useProducts";

export interface Sucursal {
  sucursal_id:           number;
  almacenes:             Almacenes[];
  valor_total:           number;
  stock_total:           number;
  ultima_actualizacion:  Date;
  movimientos_recientes: number;
}

export interface Almacenes {
  almacen_id:            number;
  almacen_nombre:        string;
  productos:             Productos[];
  valor_total:           number;
  stock_total:           number;
  ultima_actualizacion:  Date;
  movimientos_recientes: number;
}

export interface Productos {
  producto_id:          number;
  producto_codigo:      string;
  producto_descripcion: string;
  cantidad:             number;
  costo_promedio:       number;
  importe:              number;
  ultima_actualizacion: Date;
}

export interface AlmacenStock {
  almacen_id:           number;
  almacen_nombre:       string;
  productos:            Productos[];
  valor_total:          number;
  stock_total:          number;
  ultima_actualizacion: Date;
  movimientos_recientes: number;
}

export const useStock = (selectedBranchId = null) => {
  const [stocks, setStocks] = useState<Sucursal[]>([]);
  const [selectedStorageStock, setSelectedStorageStock] = useState<AlmacenStock | null>(null);
  const [loadingStorageStock, setLoadingStorageStock] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Estados para paginación
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalStocks, setTotalStocks] = useState(0);

  //Obtener almacenes y productos   
  const {storage}: {storage: any[]} = useStorage();
  const {products, handleGetProducts}: {products: any[], handleGetProducts: () => Promise<void>} = useProducts();

  // Cargar todos los productos al inicializar
  useEffect(() => {
    handleGetProducts();
  }, []);

  // Función para manejar el cambio de página
  const handleChangePage = (event: any, newPage: number) => {
    setPage(newPage);
  };

  // Función para manejar el cambio de filas por página
  const handleChangeRowsPerPage = (event: any) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  //Función para procesar las fechas de la respuesta
  const processStockResponse = (data: any): Sucursal => {
    return {
      ...data,
      ultima_actualizacion: new Date(data.ultima_actualizacion),
      almacenes: data.almacenes.map((almacen: any) => ({
        ...almacen,
        ultima_actualizacion: new Date(almacen.ultima_actualizacion),
        productos: almacen.productos.map((producto: any) => ({
          ...producto,
          ultima_actualizacion: new Date(producto.ultima_actualizacion)
        }))
      }))
    };
  };

  //Función para obtener el stock de productos por sucursal 
  const handleGetStockProductsByBranch = async () => {    
    if (!selectedBranchId) {
      setStocks([]);
      setLoading(false);
      return;
    }

    try {
      const url = `${import.meta.env.VITE_API_SERVER}/api/v1/stock/sucursal/${selectedBranchId}/productos`;      
      const response = await fetch(url, {
        method: "GET", 
        headers: {
          "Content-Type": "application/json",
        },
      });

      if(response.ok) {
        const result = await response.json();
        const processedData = processStockResponse(result);
        setStocks([processedData]);
        setLoading(false);
      } else {
        console.error("Error en response:", response.status, response.statusText);
        setStocks([]);
        setLoading(false);
      }

    } catch(error) {
      console.error("Error haciendo fetch:", error);
      setStocks([]);
      setLoading(false);
    }
  };

  //Función para obtener el stock de productos por almacén específico
  const handleGetStockProductsByStorage = async (storageId: number) => {
    if (!storageId) {
      setSelectedStorageStock(null);
      setLoadingStorageStock(false);
      return;
    }

    try {
      setLoadingStorageStock(true);
      const url = `${import.meta.env.VITE_API_SERVER}/api/v1/stock/almacen/${storageId}/productos`;
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const result = await response.json();
        
        // Procesar la respuesta y enriquecer con datos
        const processedStorageStock: AlmacenStock = {
          ...result,
          ultima_actualizacion: new Date(result.ultima_actualizacion),
          almacen_nombre: storage.find(s => s.id === result.almacen_id)?.name || 'Almacén no encontrado',
          productos: result.productos.map((producto: any) => {
            const productoData = products.find(p => p.id === producto.producto_id);
            return {
              ...producto,
              ultima_actualizacion: new Date(producto.ultima_actualizacion),
              producto_codigo: productoData ? productoData.model : 'Código no encontrado',
              producto_descripcion: productoData ? productoData.name : 'Descripción no encontrada',
            };
          })
        };

        setSelectedStorageStock(processedStorageStock);
        setLoadingStorageStock(false);
      } else {
        console.error("Error en response:", response.status, response.statusText);
        setSelectedStorageStock(null);
        setLoadingStorageStock(false);
      }
    } catch (error) {
      console.error("Error haciendo fetch del stock por almacén:", error);
      setSelectedStorageStock(null);
      setLoadingStorageStock(false);
    }
  };

  //Función para obtener las existencias de un producto específico en un almacén
  const getProductStockInStorage = async (productId: number, storageId: number): Promise<number> => {
    if (!productId || !storageId) {
      return 0;
    }

    try {
      const url = `${import.meta.env.VITE_API_SERVER}/api/v1/stock/almacen/${storageId}/productos`;
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const result = await response.json();
        const productStock = result.productos.find((p: any) => p.producto_id === productId);
        return productStock ? productStock.cantidad : 0;
      } else {
        console.error("Error al obtener existencias:", response.status, response.statusText);
        return 0;
      }
    } catch (error) {
      console.error("Error al obtener existencias:", error);
      return 0;
    }
  };

  // Enriquecer los datos de stock con información adicional
  const enrichedStocks = useMemo(() => {
    
    return stocks.map(sucursal => ({
      ...sucursal,
      almacenes: sucursal.almacenes.map(almacen => {
        const almacenData = storage.find(s => s.id === almacen.almacen_id);
        
        return {
          ...almacen,
          almacen_nombre: almacenData ? almacenData.name : 'Almacén no encontrado',
          productos: almacen.productos.map(producto => {
            const productoData = products.find(p => p.id === producto.producto_id);            
            return {
              ...producto,
              producto_codigo: productoData ? productoData.model : 'Código no encontrado',
              producto_descripcion: productoData ? productoData.name : 'Descripción no encontrada',
            };
          })
        };
      })
    }));
  }, [stocks, storage, products]);

  // Cargar todos los productos al inicializar
  useEffect(() => {
    handleGetProducts();
  }, []);

  // Cargar datos cuando cambia selectedBranchId
  useEffect(() => {
    handleGetStockProductsByBranch();
  }, [selectedBranchId]);

  return {
    stocks: enrichedStocks,
    allStocks: enrichedStocks,
    filteredStocks: enrichedStocks,
    selectedStorageStock,
    loadingStorageStock,
    handleGetStockProductsByStorage,
    getProductStockInStorage,
    setStocks,
    selectedStock: null,
    setSelectedStock: () => {},
    loading, 
    page,
    setPage,
    rowsPerPage,
    setRowsPerPage, 
    totalStocks: enrichedStocks.reduce((total, sucursal) => total + sucursal.stock_total, 0),
    handleChangePage,
    handleChangeRowsPerPage,
    searchTerm,
    setSearchTerm,
  };
};
