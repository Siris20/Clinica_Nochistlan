import React, { useEffect, useMemo, useState } from "react";
import { useEmployee } from '../../../Employee/useEmployee';
import { useStorage } from "../../../Storage/useStorage";
import { useClients } from "../../../Clients/useClients";

export const useSales = (selectedBranchId = null) => {
  const [sales, setSales] = useState([]);
  const [selectedSale, setSelectedSale] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  //Estados para paginación
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalSales, setTotalSales] = useState(0);

  //Obtener empleados, almacenes, proveedores y productos
  const { employees } = useEmployee();
  const { storage } = useStorage();
  const { clients } = useClients();

  // Ya no necesitamos filtrar en frontend porque el backend lo hace
  const filteredByEnterprise = useMemo(() => {
    return sales; // Devolver todas las ventas que vienen del backend (ya filtradas)
  }, [sales]);

  //Enriquecer las ventas con información adicional
  const enrichedSales = useMemo(() => {
    return filteredByEnterprise.map(sale => {
      const empleado = employees.find(e => e.id === sale.empleado_id);
      const cliente = clients.find(c => c.id === sale.cliente_id);
      
      // Obtener almacen_id: primero del objeto principal, si no del primer producto
      let almacenId = sale.almacen_id;
      if (!almacenId && sale.productos_vendidos && sale.productos_vendidos.length > 0) {
        almacenId = sale.productos_vendidos[0].almacen_id;
      }
      
      const almacen = storage.find(a => a.id === almacenId);

      return {
        ...sale,
        empleado_nombre: empleado ? empleado.name : 'Empleado no encontrado',
        cliente_nombre: cliente ? cliente.nombre_fiscal : 'Sin cliente',
        almacen_nombre: almacen ? almacen.name : 'Almacén no encontrado',
        // Agregar almacen_id al objeto para consistencia
        almacen_id: almacenId
      };
    });
  }, [filteredByEnterprise, employees, clients, storage]);

  // Aplicar filtro de busqueda
  const filteredSales = useMemo(() => {
    if (!searchTerm) return enrichedSales;

    return enrichedSales.filter(
      (sale) =>
        sale.id?.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.fecha_factura
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        sale.fecha_pago
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        sale.metodo_pago
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        sale.empleado_nombre
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        sale.cliente_nombre
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        sale.almacen_nombre
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        sale.total 
          ?.toString()
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        sale.estado
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        sale.costo_envio
          ?.toString()
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
    );
  }, [enrichedSales, searchTerm]);

  //Aplicar paginación a las ventas filtradas
  const paginatedSales = useMemo(() => {
    const startIndex = page * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;

    setTotalSales(filteredSales.length);

    return filteredSales.slice(startIndex, endIndex);
  }, [filteredSales, page, rowsPerPage]);

  //Función para manejar el cambio de página
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Función para manejar el cambio de filas por página
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // Resetear a la primera página al cambiar filas por página
  };

  //FUNCIÓN PARA OBTENER TODAS LAS VENTAS
  const handleGetSales = async (skip = 0, limit=1000, empresa_id = null, sucursal_id = null) => {
    try {
      // Construir la URL con parámetros opcionales
      let url = `${import.meta.env.VITE_API_SERVER}/api/v1/ventas?skip=${skip}&limit=${limit}`;
      if (empresa_id) url += `&empresa_id=${empresa_id}`;
      if (sucursal_id) url += `&sucursal_id=${sucursal_id}`;
      
      
      const response = await fetch(
        url,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const result = await response.json();
        // Ordenar las ventas por fecha de creación (descendente)
        const sortedSales = result.sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );
        setSales(sortedSales);
        setLoading(false);
      }
    } catch (error) {
      setLoading(true);
    }
  };

  //Función para obtener el detalle de una venta
  const handleGetSale = async (venta_id, empresa_id=null, sucursal_id=null) => {

    //Construir la URL con parámetros opcionales
    let url = `${import.meta.env.VITE_API_SERVER}/api/v1/venta/${venta_id}`;
    if (empresa_id) url += `?empresa_id=${empresa_id}`;
    if (sucursal_id) url += `&sucursal_id=${sucursal_id}`;
    try {
      const response = await fetch(
        url,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const result = await response.json();
        const empleado = employees.find(e => e.id === result.empleado_id);
        const cliente = clients.find(s => s.id === result.cliente_id);
        const almacen = storage.find(a => a.id === result.almacen_id);

        const enrichedSale = {
          ...result,
          empleado_nombre: empleado ? empleado.name : 'Empleado no encontrado',
          cliente_nombre: cliente ? cliente.nombre_fiscal : 'Sin cliente',
          almacen_nombre: almacen ? almacen.name : 'Almacén no encontrado',
        }


        setSelectedSale(enrichedSale);
        return enrichedSale;
      }
    } catch (error) {
      throw new Error("Error obteniendo detalles de la venta:", error);
    }
  };

  // Función para crear una venta
  const handleCreateSale = async (saleData) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_SERVER}/api/v1/venta`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(saleData),
        }
      );

      if(response.ok){
        // Mantener el filtrado por sucursal después de crear una venta
        await handleGetSales(0, 1000, null, selectedBranchId);
        return true;
      } else {
        const errorData = await response.json();
        if (errorData.detail && Array.isArray(errorData.detail)) {
          const errorMessages = errorData.detail.map((error) => {
            const field = error.loc[error.loc.length - 1];
            return `${field}: ${error.msg}`;
          });
          throw new Error(errorMessages.join("\n"));
        }
        throw new Error(
          errorData.detail || `Error ${response.status}: ${response.statusText}`
        );
      }
    } catch (error) {
      throw error;
    }
  }; 

  // Función para editar una venta
  const handleUpdateSale = async (id, saleData) => {
    if (!id) {
      throw new Error('ID de venta no proporcionado');
    }
  
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_SERVER}/api/v1/venta/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            venta_data: saleData.venta_data,
            productos_vendidos: saleData.productos_vendidos
          }),
        }
      );
        
      if(!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.detail || `Error ${response.status}: ${response.statusText}`
        );
      }

      // Mantener el filtrado por sucursal después de actualizar una venta
      await handleGetSales(0, 1000, null, selectedBranchId);
      return true;
    } catch (error) {
      throw error;
    }
  };

  //Efecto para cargar todas las ventas al inicio
  useEffect(() => {
    handleGetSales(0, 1000, null, selectedBranchId);
  }, []);

  //Efecto para recargar ventas cuando cambia la sucursal seleccionada
  useEffect(() => {
    if (selectedBranchId !== null) {
      handleGetSales(0, 1000, null, selectedBranchId);
      setPage(0); // Reiniciar a la primera página
    }
  }, [selectedBranchId]);

  //Efecto para manejar la busqueda
  useEffect(()=> {
    if(searchTerm) {
      setPage(0); // Reiniciar a la primera página al buscar
    }
  }, [searchTerm]);

  return {
    sales: paginatedSales,
    allSales: sales,
    filteredSales,
    setSales,
    selectedSale,
    setSelectedSale,
    loading,
    page,
    setPage,
    rowsPerPage,
    setRowsPerPage,
    totalSales,
    handleChangePage,
    handleChangeRowsPerPage,
    searchTerm,
    setSearchTerm,
    handleGetSales,
    handleGetSale,
    handleCreateSale,
    handleUpdateSale
  };
};
