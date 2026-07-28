import { useEffect, useMemo, useState } from "react";

export const useCategories = (selectedDepartmentId = null, selectedEnterpriseId = null) => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Estados para paginación
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCategories, setTotalCategories] = useState(0);

  // Filtrar categorías según el término de búsqueda
  const filteredCategories = useMemo(() => {
    if (!searchTerm) return categories;
    
    return categories.filter(
      (category) => category.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [categories, searchTerm]);

  // Efecto para manejar la búsqueda inteligente
  useEffect(() => {
    if (searchTerm) {
      if (filteredCategories.length > 0) {
        setPage(0);
      } else {
        setPage(0);
      }
    }
  }, [searchTerm, filteredCategories, rowsPerPage]);

  // Aplicar paginación a las categorías filtradas
  const paginatedFilteredCategories = useMemo(() => {
    const startIndex = page * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;

    setTotalCategories(filteredCategories.length);

    return filteredCategories.slice(startIndex, endIndex);
  }, [filteredCategories, page, rowsPerPage]);

  // NUEVA FUNCIÓN: Obtener categorías por departamento específico
  const handleGetCategoriesByDepartment = async (departmentId, empresaId, skip = 0, limit = 100) => {
    try {
      setLoadingCategories(true);
      
      const response = await fetch(
        `${import.meta.env.VITE_API_SERVER}/api/v1/categorias/departamento/${departmentId}?empresa_id=${empresaId}&skip=${skip}&limit=${limit}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const result = await response.json();
        setCategories(result);
        setLoadingCategories(false);
        return result;
      }
    } catch (error) {
      console.error("Error al cargar categorías por departamento:", error);
      setLoadingCategories(false);
      setCategories([]);
      return [];
    }
  };

  // Función original para obtener todas las categorías (mantener compatibilidad)
  const handleGetCategories = async (skip = 0, limit = 1000) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_SERVER}/api/v1/categorias?skip=${skip}&limit=${limit}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const result = await response.json();
        setCategories(result);
        setLoadingCategories(false);
      }
    } catch (error) {
      setLoadingCategories(true);
    }
  };

  // Función para obtener una categoría por id
  const handleGetCategory = async (id) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_SERVER}/api/v1/categoria/${id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const result = await response.json();
        setSelectedCategory(result);
        return result;
      }
    } catch (error) {
      throw new Error("Error al obtener la categoria");
    }
  };

  // Función para borrar una categoría
  const handleDeleteCategory = async (id) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_SERVER}/api/v1/categoria/${id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        // Si tenemos un departamento seleccionado, recargar sus categorías
        if (selectedDepartmentId && selectedEnterpriseId) {
          await handleGetCategoriesByDepartment(selectedDepartmentId, selectedEnterpriseId);
        } else {
          // Fallback al método original
          handleGetCategories();
        }
      }
    } catch (error) {
      throw new Error("Error al borrar la categoria");
    }
  };

  // Función para crear una categoría
  const handleCreateCategory = async (categoryData) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_SERVER}/api/v1/categoria`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(categoryData),
        }
      );

      if (response.ok) {
        // Si tenemos un departamento seleccionado, recargar sus categorías
        if (selectedDepartmentId && selectedEnterpriseId) {
          await handleGetCategoriesByDepartment(selectedDepartmentId, selectedEnterpriseId);
        } else {
          // Fallback al método original
          await handleGetCategories();
        }
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

  // Función para actualizar una categoría
  const handleUpdateCategory = async (id, categoryData) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_SERVER}/api/v1/categoria/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(categoryData),
        }
      );

      if (response.ok) {
        // Si tenemos un departamento seleccionado, recargar sus categorías
        if (selectedDepartmentId && selectedEnterpriseId) {
          await handleGetCategoriesByDepartment(selectedDepartmentId, selectedEnterpriseId);
        } else {
          // Fallback al método original
          await handleGetCategories();
        }
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
  
  // Función para manejar el cambio de página
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  
  // Función para manejar el cambio de filas por página
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Efecto para cargar categorías cuando cambia el departamento seleccionado
  useEffect(() => {
    if (selectedDepartmentId && selectedEnterpriseId) {
      handleGetCategoriesByDepartment(selectedDepartmentId, selectedEnterpriseId);
    } else {
      // Limpiar categorías si no hay departamento seleccionado
      setCategories([]);
      setLoadingCategories(false);
    }
    
    // Reiniciar a la primera página cuando cambia el departamento seleccionado
    setPage(0);
  }, [selectedDepartmentId, selectedEnterpriseId]);

  return {
    categories,
    filteredCategories: paginatedFilteredCategories,
    allFilteredCategories: filteredCategories,
    setCategories,
    selectedCategory,
    setSelectedCategory,
    loadingCategories,
    page,
    setPage,
    rowsPerPage,
    setRowsPerPage,
    totalCategories,
    handleChangePage,
    handleChangeRowsPerPage,
    searchTerm,
    setSearchTerm,
    handleGetCategories, // Mantener para compatibilidad
    handleGetCategoriesByDepartment, // Nueva función
    handleGetCategory,
    handleDeleteCategory,
    handleCreateCategory,
    handleUpdateCategory,
  };
};