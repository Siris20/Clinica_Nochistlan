import React, { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../context/AuthContext';

export const useBranches = (selectedEnterpriseId = null) => {
  const {token} = useAuth();
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Estados para paginación
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalBranches, setTotalBranches] = useState(0);


  // Filtrar sucursales según la empresa seleccionada y el término de búsqueda
  const filteredBranches = useMemo(() => {
    //Filtramos por empresa
    let filtered = []; 
    if(!selectedEnterpriseId) {
      filtered = branches;
    }else {
      filtered = branches.filter(branch => branch.empresa_id === selectedEnterpriseId);
    }

    //Filtramos por búsqueda
    if(searchTerm.trim() !== "") {
      filtered = filtered.filter(
        (branch) =>
          branch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          branch.phone_number.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return filtered;
  }, [branches, selectedEnterpriseId, searchTerm]);

  //Paginacion a las sucursales filtradas por empresa y búsqueda
  const paginatedBranches = useMemo(() => {
    const startIndex = page * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    setTotalBranches(filteredBranches.length);
    return filteredBranches.slice(startIndex, endIndex);
  }, [filteredBranches, page, rowsPerPage, totalBranches]);

  //Efecto para manejar la busqueda
  useEffect(() => {
    if(searchTerm) {
      if(filteredBranches.length > 0) {
        setPage(0);
      }
    }
  }, [searchTerm, filteredBranches]);

  //Funcion para obtener todas las sucursales
  const handleGetBranches = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_SERVER}/api/v1/sucursal`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const result = await response.json();
        setBranches(result);
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

  //Funcion para obtener una sucursal por su id
  const handleGetBranch = async (id: number) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_SERVER}/api/v1/sucursal/${id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const result = await response.json();
        setSelectedBranch(result);
      }
    } catch (error) {
      throw new Error("Error al obtener la sucursal");
    }
  };

  //Funcion para borrar una sucursal
  const handleDeleteBranch = async (id: number) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_SERVER}/api/v1/sucursal/${id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        handleGetBranches();
      }
    } catch (error) {
      throw new Error("Error al eliminar la sucursal");
    }
  };

  //Funcion para crear una sucursal
  const handleCreateBranch = async (branchData) => {
    try {
      const formattedData = {
        ...branchData,
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_SERVER}/api/v1/sucursal`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formattedData),
        }
      );

      if(response.ok){
        await handleGetBranches();
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

    }catch (error) {
      throw error;
    }
  }; 

  //Funcion para editar una sucursal
  const handleUpdateBranch = async (id: number, branchData) => {
    try {
      const formattedData = {
        ...branchData,
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_SERVER}/api/v1/sucursal/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formattedData),
        }
      );

      if(response.ok){
        await handleGetBranches();
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

    }catch (error) {
      throw error;
    }
  };


  //Funcion para obtener los empleados de una sucursal

  //Funcion para obtener los almacenes de una sucursal

  //Reestablecer la sucursal seleccionada cuando se cambia de empresa
  useEffect(() => {
    setSelectedBranch(null);
  }, [selectedEnterpriseId]);


  useEffect(() => {
    handleGetBranches();
  }, []);

  //Efecto para resetear la paginación al cambiar de empresa
  useEffect(() => {
    setPage(0);
  }, [selectedEnterpriseId]);


  return {
    branches,
    filteredBranches: paginatedBranches,
    allFilteredBranches: filteredBranches,
    setBranches,
    selectedBranch,
    setSelectedBranch,
    loading,
    page,
    setPage,
    rowsPerPage,
    setRowsPerPage,
    totalBranches,
    handleChangePage,
    handleChangeRowsPerPage,
    searchTerm,
    setSearchTerm,
    handleGetBranches,
    handleGetBranch,
    handleDeleteBranch, 
    handleCreateBranch, 
    handleUpdateBranch,
  }
}
