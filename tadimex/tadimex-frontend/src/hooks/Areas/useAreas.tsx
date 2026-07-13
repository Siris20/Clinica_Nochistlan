import { useEffect, useMemo, useState } from "react";

export const useAreas = (selectedEnterpriseId = null) => {
  const [areas, setAreas] = useState([]);
  const [selectedArea, setSelectedArea] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Estados para paginación
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalAreas, setTotalAreas] = useState(0);

  

  // Filtrar areas según la empresa seleccionada y el termino de busqueda
  const filteredAreas = useMemo(() => {
    //Filtramos por empresa
    let filtered = []; 
    if(!selectedEnterpriseId) {
      filtered = areas;
    }else {
      filtered = areas.filter(area => area.empresa_id === selectedEnterpriseId);
    }

    //Filtramos por termino de busqueda
    if(searchTerm) {
      return filtered.filter(
        (area) =>
          area.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          area.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          area.enterprise?.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return filtered;
  }, [areas, selectedEnterpriseId, searchTerm]);

  //Aplicamos paginacion a las areas filtradas por empresa
  const paginatedFilteredAreas = useMemo(() => {
    const startIndex = page * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    setTotalAreas(filteredAreas.length);
    return filteredAreas.slice(startIndex, endIndex); 
  }, [filteredAreas, page, rowsPerPage, totalAreas]);

  //Efecto para manejar la busqueda
  useEffect(()=> {
    if(searchTerm) {
      if(filteredAreas.length > 0) {
        setPage(0);
      }
    }
  }, [searchTerm, filteredAreas]);

  //Funcion para obtener todas las areas
  const handleGetAreas = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_SERVER}/api/v1/areas`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const result = await response.json();
        setAreas(result);
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

  //Funcion para obtener una area por id
  const handleGetArea = async (id: number) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_SERVER}/api/v1/area/${id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const result = await response.json();
        setSelectedArea(result);
      }
    } catch (error) {
      throw new Error("Error al obtener area");
    }
  };

  //Funcion para borrar una area
  const handleDeleteArea = async (id: number) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_SERVER}/api/v1/area/${id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        handleGetAreas();
      }
    } catch (error) {
      throw new Error("Error al eliminar area");
    }
  };

  //Funcion para crear una area
  const handleCreateArea = async (areaData) => {
    try {
      const formattedData = {
        ...areaData,
      };

      const response = await fetch(
        `${import.meta.env.VITE_API_SERVER}/api/v1/area`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formattedData),
        }
      );

      if (response.ok) {
        await handleGetAreas();
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

  //Funcion para actualizar una area
  const handleUpdateArea = async (id: number, areaData) => {
    try {
      const formattedData = {
        ...areaData,
      };

      const response = await fetch(
        `${import.meta.env.VITE_API_SERVER}/api/v1/area/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formattedData),
        }
      );

      if (response.ok) {
        await handleGetAreas();
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

  useEffect(() => {
    handleGetAreas();
  }, []);

  useEffect(() => {
    setPage(0); // Reset a la primera página al cambiar de empresa
  }, [selectedEnterpriseId]);


  return {
    areas,
    filteredAreas: paginatedFilteredAreas,
    allFilteredAreas: filteredAreas,
    setAreas, 
    selectedArea,
    setSelectedArea,
    loading,
    page,
    setPage,
    rowsPerPage,
    setRowsPerPage,
    totalAreas,
    handleChangePage,
    handleChangeRowsPerPage,
    searchTerm,
    setSearchTerm,
    handleGetAreas,
    handleGetArea,
    handleDeleteArea,
    handleCreateArea,
    handleUpdateArea,
  }
}
