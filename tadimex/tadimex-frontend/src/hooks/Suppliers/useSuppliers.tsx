import React, { useEffect, useMemo, useState } from "react";

export const useSuppliers = (selectedEnterpriseId = null) => {
  const [suppliers, setSuppliers] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Estados para paginación
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalSuppliers, setTotalSuppliers] = useState(0);

  // Filtrar proveedores según la empresa seleccionada y el término de búsqueda
  const filteredSuppliers = useMemo(() => {
    // Primero filtramos por empresa
    let filtered = [];
    if (!selectedEnterpriseId) {
      filtered = suppliers;
    } else {
      filtered = suppliers.filter(
        (supplier) => supplier.empresa_id === selectedEnterpriseId
      );
    }

    // Luego filtramos por término de búsqueda si existe
    if (searchTerm) {
      return filtered.filter(
        (supplier) =>
          supplier.nombre
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
            supplier.telefono
              ?.toLowerCase()
              .includes(searchTerm.toLowerCase()) ||
            supplier.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          supplier?.observaciones
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  }, [suppliers, selectedEnterpriseId, searchTerm]);

  // Aplicamos la paginación a los proveedores filtrados por empresa
  const paginatedFilteredSuppliers = useMemo(() => {
    const startIndex = page * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;

    // Actualizamos el total de proveedores para la paginación
    setTotalSuppliers(filteredSuppliers.length);

    // Devolvemos solo la porción que corresponde a la página actual
    return filteredSuppliers.slice(startIndex, endIndex);
  }, [filteredSuppliers, page, rowsPerPage, totalSuppliers]);

  // Efecto para manejar la búsqueda
  useEffect(() => {
    if (searchTerm) {
      // Si hay resultados de búsqueda, calculamos en qué página debería estar el primer resultado
      if (filteredSuppliers.length > 0) {
        // Calculamos en qué página está el primer resultado (siempre será la primera página en este caso)
        setPage(0);
      }
    }
  }, [searchTerm, filteredSuppliers]);

  //Funcion para obtener todos los proveedores
  const handleGetSuppliers = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_SERVER}/api/v1/proveedores?include_inactive=true`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const result = await response.json();
        setSuppliers(result);
        setLoading(false);
      }
    } catch (error) {
      setLoading(true);
    }
  };

  // Función para manejar el cambio de página
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Función para manejar el cambio de filas por página
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // Resetear a la primera página cuando cambia el número de filas
  };

  //Funcion para obtener un proveedor por su id
  const handleGetSupplier = async (id) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_SERVER}/api/v1/proveedor/${id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const result = await response.json();
        setSelectedSupplier(result);
      }
    } catch (error) {
      throw new Error("Error al obtener el proveedor");
    }
  };

  //Funcion para borrar un proveedor
  const handleDeleteSupplier = async (id) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_SERVER}/api/v1/proveedor/${id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        handleGetSuppliers();
      } else {
        const errorData = await response.json();

        // Verifica si el error está relacionado con compras
        if (
          errorData.detail &&
          (errorData.detail.includes("proveedor_id") ||
            errorData.detail.includes("compras"))
        ) {
          throw new Error(
            "No se puede eliminar el proveedor porque está asociado a una o más compras"
          );
        }



        throw new Error(
          errorData.detail || `Error ${response.status}: ${response.statusText}`
        );
      }
    } catch (error) {
      throw new Error("Error al eliminar el proveedor");
    }
  };

  //Funcion para crear un proveedor
  const handleCreateSupplier = async (supplierData) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_SERVER}/api/v1/proveedor`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(supplierData),
        }
      );

      if (response.ok) {
        await handleGetSuppliers();
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

  //Funcion para editar un proveedor
  const handleUpdateSupplier = async (id, supplierData) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_SERVER}/api/v1/proveedor/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(supplierData),
        }
      );

      if (response.ok) {
        await handleGetSuppliers();
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

  //Función para activar o desactivar un proveedor
  const handleToggleSupplierStatus = async (id) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_SERVER}/api/v1/proveedor/${id}/toggle`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            accept: "application/json",
          },
        }
      );

      if (response.ok) {
        await handleGetSuppliers();
        return true;
      } else {
        const errorData = await response.json();
        throw new Error(
          errorData.detail || `Error ${response.status}: ${response.statusText}`
        );
      }
    } catch (error) {
      throw error;
    }
  };

  // Efecto para cargar todos los proveedores una sola vez
  useEffect(() => {
    handleGetSuppliers();
  }, []);

  // Efecto para reiniciar a la primera página cuando cambia la empresa seleccionada
  useEffect(() => {
    setPage(0); // Reset a la primera página al cambiar de empresa
  }, [selectedEnterpriseId]);

  return {
    suppliers,
    filteredSuppliers: paginatedFilteredSuppliers,
    allFilteredSuppliers: filteredSuppliers,
    setSuppliers,
    selectedSupplier,
    setSelectedSupplier,
    loading,
    page,
    setPage,
    rowsPerPage,
    setRowsPerPage,
    totalSuppliers,
    handleChangePage,
    handleChangeRowsPerPage,
    searchTerm,
    setSearchTerm,
    handleGetSuppliers,
    handleGetSupplier,
    handleDeleteSupplier,
    handleCreateSupplier,
    handleUpdateSupplier,
    handleToggleSupplierStatus
  };
};
