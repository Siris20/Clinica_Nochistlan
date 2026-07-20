import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext";

export const useEnterprises = () => {
  const { token } = useAuth();
  const [enterprises, setEnterprises] = useState([]);
  const [selectedEnterprise, setSelectedEnterprise] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Estados para paginación
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalEnterprises, setTotalEnterprises] = useState(0);

  //Filtrar empresas segun el termino de busqueda
  const filteredEnterprises = useMemo(() => {
    // Si hay un término de búsqueda, filtramos las empresas
    if (searchTerm) {
      return enterprises.filter(
        (enterprise) =>
          enterprise.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          enterprise.phone_number
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          enterprise.SAT_certificate?.toLowerCase().includes(
            searchTerm.toLowerCase()
          ) ||
          enterprise.SAT_stamp?.toLowerCase().includes(
            searchTerm.toLowerCase()
          ) ||
          enterprise.regimen_fiscal
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
    }

    // Si no hay término de búsqueda, devolvemos todas las empresas
    return enterprises;
  }, [enterprises, searchTerm]);

  // Aplicamos la paginación a las empresas filtradas
  const paginatedFilteredEnterprises = useMemo(() => {
    const startIndex = page * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;

    setTotalEnterprises(filteredEnterprises.length);

    return filteredEnterprises.slice(startIndex, endIndex);
  }, [filteredEnterprises, page, rowsPerPage, totalEnterprises]);

 // Efecto para manejar la búsqueda
 useEffect(() => {
  if (searchTerm) {
    if (filteredEnterprises.length > 0) {
      const pageOfFirstResult = Math.floor(0 / rowsPerPage);
      setPage(pageOfFirstResult);
    } else {
      setPage(0);
    }
  }
}, [searchTerm, filteredEnterprises, rowsPerPage]);

  //Funcion para obtener todas las empresas
  const handleGetEnterprises = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_SERVER}/api/v1/empresa`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const result = await response.json();
        setEnterprises(result);
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


  //Funcion para obtener una empresa por su id
  const handleGetEnterprise = async (id: number) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_SERVER}/api/v1/empresa/${id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const result = await response.json();
        setSelectedEnterprise(result);
      }
    } catch (error) {
      throw new Error("Error al obtener la empresa");
    }
  };

  //Eliminar una empresa
  const handleDeleteEnterprise = async (id: number) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_SERVER}/api/v1/empresa/${id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        handleGetEnterprises();
      }
    } catch (error) {
      throw new Error("Error al eliminar la empresa");
    }
  };

  //Funcion para crear una empresa
  const handleCreateEnterprise = async (enterpriseData) => {
    try {
      const formattedData = {
        ...enterpriseData,
        numero_interior: enterpriseData.numero_interior || "",
      };

      const response = await fetch(
        `${import.meta.env.VITE_API_SERVER}/api/v1/empresa`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formattedData),
        }
      );

      if (response.ok) {
        await handleGetEnterprises();
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

  //Actualizar una empresa
  const handleUpdateEnterprise = async (id: number, enterpriseData) => {
    try {
      const formattedData = {
        ...enterpriseData,
        numero_interior: enterpriseData.numero_interior || "",
      };

      const response = await fetch(
        `${import.meta.env.VITE_API_SERVER}/api/v1/empresa/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formattedData),
        }
      );

      if (response.ok) {
        await handleGetEnterprises();
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
    handleGetEnterprises();
  }, []);

  return {
    enterprises: paginatedFilteredEnterprises,
    allEnterprises: enterprises,
    filteredEnterprises,
    setEnterprises,
    selectedEnterprise,
    setSelectedEnterprise,
    loading,
    page,
    setPage,
    rowsPerPage,
    setRowsPerPage,
    totalEnterprises,
    handleChangePage,
    handleChangeRowsPerPage,
    searchTerm,
    setSearchTerm,
    handleGetEnterprises,
    handleGetEnterprise,
    handleDeleteEnterprise,
    handleCreateEnterprise,
    handleUpdateEnterprise,
  };
};
