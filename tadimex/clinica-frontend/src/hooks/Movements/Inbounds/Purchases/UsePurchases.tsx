import React, { useEffect, useMemo, useState } from "react";
import { useEmployee } from '../../../Employee/useEmployee';
import { useStorage } from "../../../Storage/useStorage";
import { useSuppliers } from '../../../Suppliers/useSuppliers';
import { useProducts } from "../../../Products/useProducts";

export const usePurchases = (selectedBranchId = null) => {
  const [purchases, setPurchases] = useState([]);
  const [selectedPurchase, setSelectedPurchase] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  //Estados para paginación
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalPurchases, setTotalPurchases] = useState(0);

  //Obtener empleados, almacenes, proveedores y productos
  const { employees } = useEmployee();
  const { storage } = useStorage();
  const { suppliers } = useSuppliers();

  // Filtrar compras por sucursal seleccionada usando la relación almacen_id -> sucursal_id
  const filteredByEnterprise = useMemo(() => {
    if (!selectedBranchId) return [];
    
    // Obtener los IDs de almacenes que pertenecen a la sucursal seleccionada
    const branchStorageIds = storage
      .filter(almacen => almacen.sucursal_id === selectedBranchId)
      .map(almacen => almacen.id);
    
    // Filtrar compras que tengan almacen_id en la lista de almacenes de la sucursal
    return purchases.filter(purchase => 
      branchStorageIds.includes(purchase.almacen_id)
    );
  }, [purchases, selectedBranchId, storage]);

  //Enriquecer las compras con información adicional
  const enrichedPurchases = useMemo(() => {
    return filteredByEnterprise.map(purchase => {
      const empleado = employees.find(e => e.id === purchase.empleado_id);
      const proveedor = suppliers.find(s => s.id === purchase.proveedor_id);
      const almacen = storage.find(a => a.id === purchase.almacen_id);


      return {
        ...purchase,
        empleado_nombre: empleado ? empleado.name : 'Empleado no encontrado',
        proveedor_nombre: proveedor ? proveedor.nombre : 'Sin proveedor',
        almacen_nombre: almacen ? almacen.name : 'Almacén no encontrado',
      };
    });
  }, [filteredByEnterprise, employees, suppliers, storage]);

  // Aplicar filtro de busqueda
  const filteredPurchases = useMemo(() => {
    if (!searchTerm) return enrichedPurchases;

    return enrichedPurchases.filter(
      (purchase) =>
        purchase.id?.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
        purchase.fecha_factura
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        purchase.fecha_pago
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        purchase.metodo_pago
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        purchase.empleado_nombre
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        purchase.proveedor_nombre
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        purchase.almacen_nombre
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        purchase.total 
          ?.toString()
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
    );
  }, [enrichedPurchases, searchTerm]);

  //Aplicar paginación a las compras filtradas
  const paginatedPurchases = useMemo(() => {
    const startIndex = page * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;

    setTotalPurchases(filteredPurchases.length);

    return filteredPurchases.slice(startIndex, endIndex);
  }, [filteredPurchases, page, rowsPerPage]);

  //Función para manejar el cambio de página
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Función para manejar el cambio de filas por página
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // Resetear a la primera página al cambiar filas por página
  };

  //FUNCIÓN PARA OBTENER TODAS LAS COMPRAS
  const handleGetPurchases = async (skip = 0, limit=1000, empresa_id = null, sucursal_id = null) => {
    try {
      // Construir la URL con parámetros opcionales
      let url = `${import.meta.env.VITE_API_SERVER}/api/v1/compras?skip=${skip}&limit=${limit}`;
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
        // Ordenar las compras por fecha de creación (descendente)
        const sortedPurchases = result.sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );
        setPurchases(sortedPurchases);
        setLoading(false);
      }
    } catch (error) {
      setLoading(true);
    }
  };

  //Función para obtener el detalle de una compra
  const handleGetPurchase = async (compra_id, empresa_id=null, sucursal_id=null) => {

    //Construir la URL con parámetros opcionales
    let url = `${import.meta.env.VITE_API_SERVER}/api/v1/compra/${compra_id}`;
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
        const proveedor = suppliers.find(s => s.id === result.proveedor_id);
        const almacen = storage.find(a => a.id === result.almacen_id);

        const enrichedQuote = {
          ...result,
          empleado_nombre: empleado ? empleado.name : 'Empleado no encontrado',
          proveedor_nombre: proveedor ? proveedor.nombre : 'Sin proveedor',
          almacen_nombre: almacen ? almacen.name : 'Almacén no encontrado',
        }


        setSelectedPurchase(enrichedQuote);
        return enrichedQuote;
      }
    } catch (error) {
      throw new Error("Error obteniendo detalles de la compra:", error);
    }
  };

  // Función para crear una compra
  const handleCreatePurchase = async (purchaseData) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_SERVER}/api/v1/compra`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(purchaseData),
        }
      );

      if(response.ok){
        await handleGetPurchases();
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

  // Función para editar una compra
  const handleUpdatePurchase = async (id, purchaseData) => {
    if (!id) {
      throw new Error('ID de compra no proporcionado');
    }
  
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_SERVER}/api/v1/compra/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            compra_data: purchaseData.compra_data,
            productos_comprados: purchaseData.productos_comprados
          }),
        }
      );
        
      if(!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.detail || `Error ${response.status}: ${response.statusText}`
        );
      }

      await handleGetPurchases();
      return true;
    } catch (error) {
      throw error;
    }
  };

  //Efecto para cargar todas las compras al inicio
  useEffect(() => {
    handleGetPurchases();
  }, []);

  //Efecto para reiniciar a la primera pagina cuando cambia la empresa
  useEffect(() => {
    setPage(0);
  }, [selectedBranchId]);

  //Efecto para manejar la busqueda
  useEffect(()=> {
    if(searchTerm) {
      setPage(0); // Reiniciar a la primera página al buscar
    }
  }, [searchTerm]);

  return {
    purchases: paginatedPurchases,
    allPurchases: purchases,
    filteredPurchases,
    setPurchases,
    selectedPurchase,
    setSelectedPurchase,
    loading,
    page,
    setPage,
    rowsPerPage,
    setRowsPerPage,
    totalPurchases,
    handleChangePage,
    handleChangeRowsPerPage,
    searchTerm,
    setSearchTerm,
    handleGetPurchases,
    handleGetPurchase,
    handleCreatePurchase,
    handleUpdatePurchase
  };
};
