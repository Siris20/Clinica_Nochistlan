import { useEffect, useMemo, useState } from "react";

export const useSubCategories = (selectedCategoryId = null, selectedEnterpriseId = null) => {
  const [subcategories, setSubcategories] = useState([]);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [loadingSubcategories, setLoadingSubcategories] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Estados para paginación
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalSubcategories, setTotalSubcategories] = useState(0);

  // Filtrar subcategorías según el término de búsqueda
  const filteredSubcategories = useMemo(() => {
    if (!searchTerm) return subcategories;
    
    return subcategories.filter(
      (subcategory) => subcategory.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [subcategories, searchTerm]);

  // Efecto para manejar la búsqueda inteligente
  useEffect(() => {
    if (searchTerm) {
      if (filteredSubcategories.length > 0) {
        setPage(0);
      } else {
        setPage(0);
      }
    }
  }, [searchTerm, filteredSubcategories, rowsPerPage]);

  // Aplicar paginación a las subcategorías filtradas
  const paginatedFilteredSubcategories = useMemo(() => {
    const startIndex = page * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;

    setTotalSubcategories(filteredSubcategories.length);

    return filteredSubcategories.slice(startIndex, endIndex);
  }, [filteredSubcategories, page, rowsPerPage]);

  // NUEVA FUNCIÓN: Obtener subcategorías por categoría específica
  const handleGetSubcategoriesByCategory = async (categoryId, empresaId, skip = 0, limit = 100) => {
    try {
      setLoadingSubcategories(true);
      
      const response = await fetch(
        `${import.meta.env.VITE_API_SERVER}/api/v1/subcategorias/categoria/${categoryId}?empresa_id=${empresaId}&skip=${skip}&limit=${limit}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const result = await response.json();
        setSubcategories(result);
        setLoadingSubcategories(false);
        return result;
      }
    } catch (error) {
      console.error("Error al cargar subcategorías por categoría:", error);
      setLoadingSubcategories(false);
      setSubcategories([]);
      return [];
    }
  };

  // Función original para obtener todas las subcategorías (mantener compatibilidad)
  const handleGetSubcategories = async (skip = 0, limit = 1000) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_SERVER}/api/v1/subcategorias?skip=${skip}&limit=${limit}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const result = await response.json();
        setSubcategories(result);
        setLoadingSubcategories(false);
      }
    } catch (error) {
      setLoadingSubcategories(true);
    }
  };

  // Función para obtener una subcategoría por id
  const handleGetSubcategory = async (id) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_SERVER}/api/v1/subcategoria/${id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const result = await response.json();
        setSelectedSubcategory(result);
        return result;
      }
    } catch (error) {
      throw new Error("Error al obtener la subcategoria");
    }
  };

  // Función para borrar una subcategoría
  const handleDeleteSubcategory = async (id) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_SERVER}/api/v1/subcategoria/${id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        // Si tenemos una categoría seleccionada, recargar sus subcategorías
        if (selectedCategoryId && selectedEnterpriseId) {
          await handleGetSubcategoriesByCategory(selectedCategoryId, selectedEnterpriseId);
        } else {
          // Fallback al método original
          handleGetSubcategories();
        }
      }
    } catch (error) {
      throw new Error("Error al borrar la subcategoria");
    }
  };

  // Función para crear una subcategoría
  const handleCreateSubcategory = async (subcategoryData) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_SERVER}/api/v1/subcategoria`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(subcategoryData),
        }
      );

      if (response.ok) {
        // Si tenemos una categoría seleccionada, recargar sus subcategorías
        if (selectedCategoryId && selectedEnterpriseId) {
          await handleGetSubcategoriesByCategory(selectedCategoryId, selectedEnterpriseId);
        } else {
          // Fallback al método original
          await handleGetSubcategories();
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

  // Función para actualizar una subcategoría
  const handleUpdateSubcategory = async (id, subcategoryData) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_SERVER}/api/v1/subcategoria/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(subcategoryData),
        }
      );

      if (response.ok) {
        // Si tenemos una categoría seleccionada, recargar sus subcategorías
        if (selectedCategoryId && selectedEnterpriseId) {
          await handleGetSubcategoriesByCategory(selectedCategoryId, selectedEnterpriseId);
        } else {
          // Fallback al método original
          await handleGetSubcategories();
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

  // Efecto para cargar subcategorías cuando cambia la categoría seleccionada
  useEffect(() => {
    if (selectedCategoryId && selectedEnterpriseId) {
      handleGetSubcategoriesByCategory(selectedCategoryId, selectedEnterpriseId);
    } else {
      // Limpiar subcategorías si no hay categoría seleccionada
      setSubcategories([]);
      setLoadingSubcategories(false);
    }
    
    // Reiniciar a la primera página cuando cambia la categoría seleccionada
    setPage(0);
  }, [selectedCategoryId, selectedEnterpriseId]);

  return {
    subcategories,
    filteredSubcategories: paginatedFilteredSubcategories,
    allFilteredSubcategories: filteredSubcategories,
    setSubcategories,
    selectedSubcategory,
    setSelectedSubcategory,
    loadingSubcategories,
    page,
    setPage,
    rowsPerPage,
    setRowsPerPage,
    totalSubcategories,
    handleChangePage,
    handleChangeRowsPerPage,
    searchTerm,
    setSearchTerm,
    handleGetSubcategories, // Mantener para compatibilidad
    handleGetSubcategoriesByCategory, // Nueva función
    handleGetSubcategory,
    handleDeleteSubcategory,
    handleCreateSubcategory,
    handleUpdateSubcategory,
  };
};