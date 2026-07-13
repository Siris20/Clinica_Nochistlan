import { useCallback, useEffect, useMemo, useState, useRef } from "react";

export const useDepartments = (selectedEnterpriseId = null) => {
  // Estados originales
  const [departments, setDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [loadingDepartments, setLoadingDepartments] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Estados para paginación original
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalDepartments, setTotalDepartments] = useState(0);

  // Estados para carga incremental de departamentos (catálogo)
  const [catalogDepartments, setCatalogDepartments] = useState([]);
  const [hasMoreCatalog, setHasMoreCatalog] = useState(true);
  const [isFetchingMoreCatalog, setIsFetchingMoreCatalog] = useState(false);
  const [catalogPage, setCatalogPage] = useState(0);
  const CATALOG_BATCH_SIZE = 10;

  // Referencia para el infinite scroll
  const observer = useRef();

  // Filtrar departamentos según la empresa seleccionada
  const filteredByEnterprise = useMemo(() => {
    if (!selectedEnterpriseId) return departments;
    return departments.filter((dep) => dep.empresa_id === selectedEnterpriseId);
  }, [departments, selectedEnterpriseId]);

  // Filtrar departamentos según el término de búsqueda
  const filteredDepartments = useMemo(() => {
    if (!searchTerm) return filteredByEnterprise;
    
    return filteredByEnterprise.filter(
      (department) => department.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [filteredByEnterprise, searchTerm]);

  // Filtrar departamentos de catálogo
  const filteredCatalogDepartments = useMemo(() => {
    if (!selectedEnterpriseId) return catalogDepartments;
    
    const filtered = catalogDepartments.filter(
      (dep) => dep.empresa_id === selectedEnterpriseId
    );
    
    if (!searchTerm) return filtered;
    
    return filtered.filter(
      (department) => department.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [catalogDepartments, selectedEnterpriseId, searchTerm]);

  // Aplicar paginación a los departamentos filtrados
  const paginatedDepartments = useMemo(() => {
    const startIndex = page * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;    
    setTotalDepartments(filteredDepartments.length);    
    return filteredDepartments.slice(startIndex, endIndex);
  }, [filteredDepartments, page, rowsPerPage]);

  // Callback para el elemento de referencia del infinite scroll
  const lastDepartmentElementRef = useCallback(node => {
    if (loadingDepartments || isFetchingMoreCatalog) return;
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMoreCatalog) {
        loadMoreCatalogDepartments();
      }
    }, { threshold: 0.5 });
    
    if (node) observer.current.observe(node);
  }, [loadingDepartments, hasMoreCatalog, isFetchingMoreCatalog]);

  // Función para obtener todos los departamentos (original - para módulos existentes)
  const handleGetDepartments = async (skip=0, limit=1000) => {
    try {
      setLoadingDepartments(true);
      
      const response = await fetch(
        `${import.meta.env.VITE_API_SERVER}/api/v1/departamentos/?skip=${skip}&limit=${limit}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const result = await response.json();
        setDepartments(result);
        setLoadingDepartments(false);
      }
    } catch (error) {
      console.error("Error al cargar departamentos:", error);
      setLoadingDepartments(false);
    }
  };

  // Función para cargar departamentos del catálogo (primera página)
  const handleGetCatalogDepartments = async () => {
    // Evitar cargar si ya estamos cargando o si ya tenemos departamentos y no es un refresh explícito
    if (isFetchingMoreCatalog || (catalogDepartments.length > 0 && !loadingDepartments)) {
      return;
    }
    
    try {
      setIsFetchingMoreCatalog(true);
      setCatalogPage(0);
      
      const response = await fetch(
        `${import.meta.env.VITE_API_SERVER}/api/v1/departamentos/?skip=0&limit=${CATALOG_BATCH_SIZE}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const result = await response.json();
        setCatalogDepartments(result);
        
        // Si recibimos menos departamentos que los solicitados, significa que no hay más
        setHasMoreCatalog(result.length === CATALOG_BATCH_SIZE);
        
        setLoadingDepartments(false);
      }
    } catch (error) {
      console.error("Error al cargar departamentos para catálogo:", error);
      setLoadingDepartments(false);
    } finally {
      setIsFetchingMoreCatalog(false);
    }
  };

  // Función para cargar más departamentos del catálogo (scroll)
  const loadMoreCatalogDepartments = async () => {
    if (isFetchingMoreCatalog || !hasMoreCatalog) return;
    
    try {
      const nextPageSkip = catalogDepartments.length;
      setIsFetchingMoreCatalog(true);
      
      const response = await fetch(
        `${import.meta.env.VITE_API_SERVER}/api/v1/departamentos/?skip=${nextPageSkip}&limit=${CATALOG_BATCH_SIZE}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const newDepartments = await response.json();
        
        // Si recibimos menos departamentos que los solicitados, significa que no hay más
        if (newDepartments.length < CATALOG_BATCH_SIZE) {
          setHasMoreCatalog(false);
        }
        
        // Incrementamos la página y agregamos los nuevos departamentos
        setCatalogPage(prevPage => prevPage + 1);
        setCatalogDepartments(prevDepartments => [...prevDepartments, ...newDepartments]);
      } else {
        console.error('Error en la respuesta de la API');
        setHasMoreCatalog(false);
      }
    } catch (error) {
      console.error("Error al cargar más departamentos para catálogo:", error);
      setHasMoreCatalog(false);
    } finally {
      setIsFetchingMoreCatalog(false);
    }
  };

  //Función para manejar el cambio de página (original)
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  
  //Función para manejar el cambio de filas por página (original)
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  //Funcion para obtener un departamento por id
  const handleGetDepartment = async (id) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_SERVER}/api/v1/departamento/${id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const result = await response.json();
        setSelectedDepartment(result);
        return result;
      }
    } catch (error) {
      throw new Error("Error al obtener el departamento");
    }
  };

  //Funcion para borrar un departamento
  const handleDeleteDepartment = async (id) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_SERVER}/api/v1/departamentos/${id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        // Recargar departamentos
        handleGetDepartments();
        handleGetCatalogDepartments();
      }
    } catch (error) {
      throw new Error("Error al borrar el departamento");
    }
  };

  //Funcion para crear un departamento
  const handleCreateDepartment = async (deparmentData) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_SERVER}/api/v1/departamento/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(deparmentData),
        }
      );

      if (response.ok) {
        await handleGetDepartments();
        await handleGetCatalogDepartments();
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

  //Funcion para actualizar un departamento
  const handleUpdateDepartment = async (id, departmentData) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_SERVER}/api/v1/departamentos/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(departmentData),
        }
      );

      if (response.ok) {
        await handleGetDepartments();
        await handleGetCatalogDepartments();
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

  // Cargar departamentos al iniciar
  useEffect(() => {
    // Cargar todos los departamentos para mantener la funcionalidad original
    handleGetDepartments();
    
    // Cargar departamentos para el catálogo con scroll infinito
    handleGetCatalogDepartments();
    
    // Limpiar el observer al desmontar
    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, []);

  // Efecto para reiniciar a la primera página cuando cambia la empresa seleccionada
  useEffect(() => {
    setPage(0);
    setCatalogPage(0);
    setHasMoreCatalog(true);
    
    // Recargar departamentos de catálogo cuando cambia la empresa
    handleGetCatalogDepartments();
  }, [selectedEnterpriseId]);

  // Efecto para manejar la búsqueda inteligente
  useEffect(() => {
    if (searchTerm) {
      if (filteredDepartments.length > 0) {
        setPage(0); 
      }
      
      // También reseteamos para el catálogo
      setCatalogPage(0);
    }
  }, [searchTerm, filteredDepartments]);

  return {
    // Valores y funciones originales (para mantener compatibilidad)
    departments,
    filteredDepartments: paginatedDepartments,
    allFilteredDepartments: filteredDepartments,
    setDepartments,
    selectedDepartment,
    setSelectedDepartment,
    loadingDepartments,
    page,
    setPage,
    rowsPerPage,
    setRowsPerPage,
    totalDepartments,
    handleChangePage,
    handleChangeRowsPerPage,
    searchTerm,
    setSearchTerm,
    handleGetDepartments,
    handleGetDepartment,
    handleDeleteDepartment,
    handleCreateDepartment,
    handleUpdateDepartment,
    
    // Nuevos valores y funciones para infinite scroll de catálogo
    catalogDepartments,
    filteredCatalogDepartments,
    hasMoreCatalog,
    isFetchingMoreCatalog,
    catalogPage,
    setCatalogPage,
    handleGetCatalogDepartments,
    loadMoreCatalogDepartments,
    lastDepartmentElementRef,
  };
};