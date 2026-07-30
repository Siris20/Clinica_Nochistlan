import { useEffect, useMemo, useState } from "react";

export const useStorage = (selectedBranchId = null) => {
  const [storage, setStorage] = useState([]);
  const [selectedStorage, setSelectedStorage] = useState(null);
  const [loadingStorage, setLoadingStorage] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Estados para paginación
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalStorage, setTotalStorage] = useState(0);

  // Filtra los almacenes según la sucursal seleccionada
  const filteredStorage = useMemo(() => {
    let filtered = [];
    
    // Primer filtro: por sucursal seleccionada
    if (!selectedBranchId) {
      // Si no hay sucursal seleccionada, no mostrar almacenes
      filtered = [];
    } else {
      filtered = storage.filter(store => store.sucursal_id === selectedBranchId);
    }
    
    // Segundo filtro: por término de búsqueda (se aplicará en el componente)
    return filtered;
  }, [storage, selectedBranchId]);
  
  // Aplicamos la paginación a los almacenes filtrados
  const paginatedFilteredStorage = useMemo(() => {
    const startIndex = page * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    
    // Actualizamos el total de almacenes para la paginación
    setTotalStorage(filteredStorage.length);
    
    // Devolvemos solo la porción que corresponde a la página actual
    return filteredStorage.slice(startIndex, endIndex);
  }, [filteredStorage, page, rowsPerPage, totalStorage]);

  // Función para manejar el cambio de página
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  
  // Función para manejar el cambio de filas por página
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // Resetear a la primera página cuando cambia el número de filas
  };

  // Función para obtener todos los almacenes
  const handleGetStorages = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_SERVER}/api/v1/almacenes`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const result = await response.json();
        setStorage(result);
        setLoadingStorage(false);
      }
    } catch (error) {
      setLoadingStorage(true);
    }
  };

  // Función para obtener un almacen por id
  const handleGetStorage = async (id) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_SERVER}/api/v1/almacen/${id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const result = await response.json();
        setSelectedStorage(result);
        return result;
      }
    } catch (error) {
      throw new Error("Error al obtener el almacen");
    }
  };

  // Función para borrar un almacen
  const handleDeleteStorage = async (id) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_SERVER}/api/v1/almacen/${id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        handleGetStorages();
      }
    } catch (error) {
      throw new Error("Error al borrar el almacen");
    }
  };

  // Función para crear un almacen
  const handleCreateStorage = async (storageData) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_SERVER}/api/v1/almacen`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(storageData),
        }
      );

      if (response.ok) {
        await handleGetStorages();
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

  // Función para actualizar un almacen
  const handleUpdateStorage = async (id, storageData) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_SERVER}/api/v1/almacen/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(storageData),
        }
      );

      if (response.ok) {
        await handleGetStorages();
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

  // Efecto para cargar todos los almacenes cuando cambia la sucursal
  useEffect(() => {
    handleGetStorages();
  }, [selectedBranchId]);
  
  // Efecto para reiniciar a la primera página cuando cambia la sucursal seleccionada
  useEffect(() => {
    setPage(0); // Reset a la primera página al cambiar de sucursal
  }, [selectedBranchId]);

  return {
    storage,
    filteredStorage: paginatedFilteredStorage,
    allFilteredStorage: filteredStorage, // Exponemos todos los almacenes filtrados (sin paginar)
    setStorage,
    selectedStorage,
    setSelectedStorage,
    loadingStorage,
    page,
    setPage,
    rowsPerPage,
    setRowsPerPage,
    totalStorage,
    handleChangePage,
    handleChangeRowsPerPage,
    searchTerm,
    setSearchTerm,
    handleGetStorages,
    handleGetStorage,
    handleDeleteStorage,
    handleCreateStorage,
    handleUpdateStorage,
  };
};