import { useCallback, useEffect, useMemo, useState, useRef } from "react";

export const useProducts = (selectedSubcategoryId = null, selectedEnterpriseId = null, requireSubcategory = false) => {
  // Estados originales
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  // Estados para paginación original
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalProducts, setTotalProducts] = useState(0);

  // Estados específicos para productos por empresa
  const [enterpriseProductsTotal, setEnterpriseProductsTotal] = useState(0);
  const [searchProductsTotal, setSearchProductsTotal] = useState(0);
  const [allEnterpriseProducts, setAllEnterpriseProducts] = useState([]);
  const [useLocalSearch, setUseLocalSearch] = useState(false);

  // Estados para infinite scroll (catálogo)
  const [catalogProducts, setCatalogProducts] = useState([]);
  const [hasMoreCatalog, setHasMoreCatalog] = useState(true);
  const [isFetchingMoreCatalog, setIsFetchingMoreCatalog] = useState(false);
  const [catalogPage, setCatalogPage] = useState(0);
  const CATALOG_BATCH_SIZE = 10;

  // Referencia para el infinite scroll
  const observer = useRef();

  // Efecto para debounce del término de búsqueda
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300); // 300ms de delay

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Filtrar productos según el término de búsqueda
  const filteredProducts = useMemo(() => {
    // Si estamos en una empresa sin subcategoría (ProductsComponent)
    if (selectedEnterpriseId && !selectedSubcategoryId) {
      // Si estamos usando búsqueda local (workaround)
      if (useLocalSearch && debouncedSearchTerm && debouncedSearchTerm.trim() !== "") {
        return products.filter(
          (product) =>
            product.name?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
            product.description?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
            product.brand?.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
        );
      }
      
      // Si no hay búsqueda, devolver productos tal como están
      return products;
    }
    
    // Para otros casos (catálogo, subcategorías), usar filtro local
    if (!searchTerm) return products;
    
    return products.filter(
      (product) =>
        product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.brand?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [products, searchTerm, selectedEnterpriseId, selectedSubcategoryId, debouncedSearchTerm, useLocalSearch]);

  // Filtrar productos de catálogo
  const filteredCatalogProducts = useMemo(() => {
    if (!searchTerm) return catalogProducts;
    
    return catalogProducts.filter(
      (product) =>
        product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.brand?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [catalogProducts, searchTerm]);

  // Efecto para manejar la búsqueda (solo para catálogo)
  useEffect(() => {
    if (searchTerm && !selectedEnterpriseId) {
      // Solo para catálogo (cuando no hay empresa seleccionada)
      if (filteredCatalogProducts.length > 0) {
        setCatalogPage(0);
      }
    }
  }, [searchTerm, filteredCatalogProducts, selectedEnterpriseId]);

  // Paginación de productos - MODIFICADO para manejar productos por empresa
  const paginatedFilteredProducts = useMemo(() => {
    // Si estamos usando productos por empresa
    if (selectedEnterpriseId && !selectedSubcategoryId) {
      // Si estamos usando búsqueda local (workaround)
      if (useLocalSearch && debouncedSearchTerm && debouncedSearchTerm.trim() !== "") {
        // Filtro local con paginación local
        const startIndex = page * rowsPerPage;
        const endIndex = startIndex + rowsPerPage;
        setTotalProducts(filteredProducts.length);
        return filteredProducts.slice(startIndex, endIndex);
      } else {
        // Sin búsqueda, usar el total de la empresa
        setTotalProducts(enterpriseProductsTotal);
        return filteredProducts;
      }
    }
    
    // Para otros casos (subcategorías o todos los productos), usar paginación local
    const startIndex = page * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    setTotalProducts(filteredProducts.length);
    return filteredProducts.slice(startIndex, endIndex);
  }, [filteredProducts, page, rowsPerPage, selectedEnterpriseId, selectedSubcategoryId, enterpriseProductsTotal, searchProductsTotal, debouncedSearchTerm, useLocalSearch]);

  // Callback para el elemento de referencia del infinite scroll
  const lastProductElementRef = useCallback(
    (node) => {
      if (loadingProducts || isFetchingMoreCatalog) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasMoreCatalog) {
            loadMoreCatalogProducts();
          }
        },
        { threshold: 0.5 }
      );

      if (node) observer.current.observe(node);
    },
    [loadingProducts, hasMoreCatalog, isFetchingMoreCatalog]
  );

  // NUEVA FUNCIÓN: Obtener total de productos por empresa
  const handleGetProductsTotalByEnterprise = async (empresaId) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_SERVER}/api/v1/producto/empresa/${empresaId}/total`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const result = await response.json();
        setEnterpriseProductsTotal(result.total || 0);
        return result.total || 0;
      }
    } catch (error) {
      console.error("Error al obtener el total de productos por empresa:", error);
      setEnterpriseProductsTotal(0);
      return 0;
    }
  };

  // NUEVA FUNCIÓN: Obtener total de productos filtrados por búsqueda
  const handleGetSearchProductsTotal = async (empresaId, search = "") => {
    try {
      let url = `${import.meta.env.VITE_API_SERVER}/api/v1/producto/empresa/${empresaId}/total`;
      
      if (search && search.trim() !== "") {
        url += `?search=${encodeURIComponent(search.trim())}`;
      }
      
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const result = await response.json();
        setSearchProductsTotal(result.total || 0);
        return result.total || 0;
      }
    } catch (error) {
      console.error("Error al obtener el total de productos filtrados:", error);
      setSearchProductsTotal(0);
      return 0;
    }
  };

  // NUEVA FUNCIÓN: Obtener productos por subcategoría específica
  const handleGetProductsBySubcategory = async (subcategoryId, empresaId, skip = 0, limit = 1000, orderDirection = "asc") => {
    try {
      setLoadingProducts(true);
      
      const response = await fetch(
        `${import.meta.env.VITE_API_SERVER}/api/v1/producto/subcategoria/${subcategoryId}/list?empresa_id=${empresaId}&skip=${skip}&limit=${limit}&order_direction=${orderDirection}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const result = await response.json();
        setProducts(result);
        setLoadingProducts(false);
        return result;
      }
    } catch (error) {
      console.error("Error al cargar productos por subcategoría:", error);
      setLoadingProducts(false);
      setProducts([]);
      return [];
    }
  };

  // NUEVA FUNCIÓN: Obtener productos por empresa específica CON PAGINACIÓN
  const handleGetProductsByEnterprise = async (empresaId, skip = 0, limit = 10, orderDirection = "asc", search = "") => {
    try {
      setLoadingProducts(true);
      
      let url = `${import.meta.env.VITE_API_SERVER}/api/v1/producto/empresa/${empresaId}/list?skip=${skip}&limit=${limit}&order_direction=${orderDirection}`;
      
      // Agregar parámetro de búsqueda si existe
      if (search && search.trim() !== "") {
        url += `&search=${encodeURIComponent(search.trim())}`;
      }
      
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const result = await response.json();
        setProducts(result);
        setLoadingProducts(false);
        return result;
      }
    } catch (error) {
      console.error("Error al cargar productos por empresa:", error);
      setLoadingProducts(false);
      setProducts([]);
      return [];
    }
  };

  // NUEVA FUNCIÓN: Cargar productos paginados por empresa (incluye total)
  const handleGetProductsByEnterprisePageinated = async (empresaId, pageNumber = 0, pageSize = 10, search = "") => {
    const skip = pageNumber * pageSize;
    
    // Si es la primera página, obtener el total correspondiente
    if (pageNumber === 0) {
      if (search && search.trim() !== "") {
        // Si hay búsqueda, obtener total de productos filtrados
        await handleGetSearchProductsTotal(empresaId, search);
      } else {
        // Si no hay búsqueda, obtener total normal de la empresa
        await handleGetProductsTotalByEnterprise(empresaId);
      }
    }
    
    return await handleGetProductsByEnterprise(empresaId, skip, pageSize, "asc", search);
  };

  // NUEVA FUNCIÓN: Obtener TODOS los productos por empresa (para cotizaciones, etc.)
  const handleGetAllProductsByEnterprise = async (empresaId, search = "") => {
    try {
      setLoadingProducts(true);
      
      let url = `${import.meta.env.VITE_API_SERVER}/api/v1/producto/empresa/${empresaId}/list?skip=0&limit=1000&order_direction=asc`;
      
      // Agregar parámetro de búsqueda si existe
      if (search && search.trim() !== "") {
        url += `&search=${encodeURIComponent(search.trim())}`;
      }
            
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const result = await response.json();
        setProducts(result);
        setLoadingProducts(false);
        return result;
      } else {
        console.error('❌ Error en la respuesta:', response.status, response.statusText);
        setLoadingProducts(false);
        setProducts([]);
        return [];
      }
    } catch (error) {
      console.error("❌ Error al cargar todos los productos por empresa:", error);
      setLoadingProducts(false);
      setProducts([]);
      return [];
    }
  };

  // Función original para obtener todos los productos (mantener compatibilidad)
  const handleGetProducts = async (skip = 0, limit = 1000) => {
    try {
      setLoadingProducts(true);

      const response = await fetch(
        `${import.meta.env.VITE_API_SERVER}/api/v1/productos?skip=${skip}&limit=${limit}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const result = await response.json();
        setProducts(result);
        setLoadingProducts(false);
      }
    } catch (error) {
      console.error("Error al cargar productos:", error);
      setLoadingProducts(false);
    }
  };

  // Función para cargar productos del catálogo (primera página)
  const handleGetCatalogProducts = async () => {
    if (isFetchingMoreCatalog || (catalogProducts.length > 0 && !loadingProducts)) {
      return;
    }

    try {
      setIsFetchingMoreCatalog(true);
      setCatalogPage(0);

      const response = await fetch(
        `${import.meta.env.VITE_API_SERVER}/api/v1/productos?skip=0&limit=${CATALOG_BATCH_SIZE}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const result = await response.json();
        setCatalogProducts(result);

        setHasMoreCatalog(result.length === CATALOG_BATCH_SIZE);
        setLoadingProducts(false);
      }
    } catch (error) {
      console.error("Error al cargar productos para catálogo:", error);
      setLoadingProducts(false);
    } finally {
      setIsFetchingMoreCatalog(false);
    }
  };

  // Función para cargar más productos del catálogo (scroll)
  const loadMoreCatalogProducts = async () => {
    if (isFetchingMoreCatalog || !hasMoreCatalog) return;

    try {
      const nextPageSkip = catalogProducts.length;
      setIsFetchingMoreCatalog(true);

      const response = await fetch(
        `${import.meta.env.VITE_API_SERVER}/api/v1/productos?skip=${nextPageSkip}&limit=${CATALOG_BATCH_SIZE}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const newProducts = await response.json();
        if (newProducts.length < CATALOG_BATCH_SIZE) {
          setHasMoreCatalog(false);
        }

        setCatalogPage((prevPage) => prevPage + 1);
        setCatalogProducts((prevProducts) => [...prevProducts, ...newProducts]);
      } else {
        console.error("Error en la respuesta de la API");
        setHasMoreCatalog(false);
      }
    } catch (error) {
      console.error("Error al cargar más productos para catálogo:", error);
      setHasMoreCatalog(false);
    } finally {
      setIsFetchingMoreCatalog(false);
    }
  };

  // Función para manejar el cambio de página (original)
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
    
    // Si estamos en una empresa (sin subcategoría), cargar productos de esa página
    if (selectedEnterpriseId && !selectedSubcategoryId && !requireSubcategory) {
      handleGetProductsByEnterprisePageinated(selectedEnterpriseId, newPage, rowsPerPage, debouncedSearchTerm);
    }
  };

  // Función para manejar el cambio de filas por página (modificado para paginación)
  const handleChangeRowsPerPage = (event) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    setRowsPerPage(newRowsPerPage);
    setPage(0);
    
    // Si estamos en una empresa (sin subcategoría), cargar productos con el nuevo tamaño de página
    if (selectedEnterpriseId && !selectedSubcategoryId && !requireSubcategory) {
      handleGetProductsByEnterprisePageinated(selectedEnterpriseId, 0, newRowsPerPage, debouncedSearchTerm);
    }
  };

  // Función para obtener un producto por id (original)
  const handleGetProduct = async (id) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_SERVER}/api/v1/producto/${id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const result = await response.json();
        setSelectedProduct(result);
        return result;
      }
    } catch (error) {
      throw new Error("Error al obtener el producto");
    }
  };

  // Función para borrar un producto (original)
  const handleDeleteProduct = async (id) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_SERVER}/api/v1/producto/${id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        // Si tenemos una subcategoría seleccionada, recargar sus productos
        if (selectedSubcategoryId && selectedEnterpriseId) {
          await handleGetProductsBySubcategory(selectedSubcategoryId, selectedEnterpriseId);
        } else if (selectedEnterpriseId) {
          // Si solo tenemos empresa, recargar todos los productos de la empresa
          await handleGetProductsByEnterprise(selectedEnterpriseId);
        } else {
          // Fallback al método original
          handleGetProducts();
        }
      }
    } catch (error) {
      throw new Error("Error al borrar el producto");
    }
  };

  // Función para crear un producto (original)
  const handleCreateProduct = async (productData) => {
    try {
      const queryParams = new URLSearchParams({
        name: String(productData.name || ""),
        model: String(productData.model || ""),
        brand: String(productData.brand || ""),
        SAT_code: String(productData.SAT_code || ""),
        warranty: String(productData.warranty || 0),
        description: String(productData.description || ""),
        sell_price: String(productData.sell_price || 0),
        rent_price: String(productData.rent_price || 0),
        subcategoria_id: String(productData.subcategoria_id || 0),
        unidad_medida: String(productData.unidad_medida || ""),
      });

      const url = `${import.meta.env.VITE_API_SERVER}/api/v1/producto?${queryParams.toString()}`;

      const formData = new FormData();

      if (productData.images && productData.images.length > 0) {
        productData.images.forEach((image, index) => {
          formData.append("images", image);
        });
      }

      const response = await fetch(url, {
        method: "POST",
        body: formData,
        headers: {
          accept: "application/json",
        },
      });

      if (response.ok) {
        // Si tenemos una subcategoría seleccionada, recargar sus productos
        if (selectedSubcategoryId && selectedEnterpriseId) {
          await handleGetProductsBySubcategory(selectedSubcategoryId, selectedEnterpriseId);
        } else if (selectedEnterpriseId) {
          // Si solo tenemos empresa, recargar todos los productos de la empresa
          await handleGetProductsByEnterprise(selectedEnterpriseId);
        } else {
          // Fallback al método original
          await handleGetProducts();
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

  // Función para actualizar un producto (original)
  const handleUpdateProduct = async (id, productData) => {
    try {
      if (!id || !Number.isInteger(id)) {
        throw new Error("ID de producto inválido");
      }

      const formData = new FormData();

      const existingImages = productData.images.filter(
        (img) => typeof img === "string"
      );
      const newImages = productData.images.filter((img) => img instanceof File);

      if (existingImages.length > 0) {
        existingImages.forEach((image) => {
          formData.append("images", image);
        });
      } else {
        formData.append("images", "");
      }

      if (newImages.length > 0) {
        newImages.forEach((image) => {
          formData.append("new_files", image);
        });
      }

      const queryParams = new URLSearchParams({
        name: String(productData.name || ""),
        model: String(productData.model || ""),
        brand: String(productData.brand || ""),
        SAT_code: String(productData.SAT_code || ""),
        warranty: String(productData.warranty || 0),
        description: String(productData.description || ""),
        sell_price: String(productData.sell_price || 0),
        rent_price: String(productData.rent_price || 0),
        subcategoria_id: String(productData.subcategoria_id || 0),
        unidad_medida: String(productData.unidad_medida || ""),
      });

      const url = `${import.meta.env.VITE_API_SERVER}/api/v1/producto/${id}?${queryParams.toString()}`;

      const response = await fetch(url, {
        method: "PUT",
        body: formData,
        headers: {
          accept: "application/json",
        },
      });

      if (response.ok) {
        // Si tenemos una subcategoría seleccionada, recargar sus productos
        if (selectedSubcategoryId && selectedEnterpriseId) {
          await handleGetProductsBySubcategory(selectedSubcategoryId, selectedEnterpriseId);
        } else if (selectedEnterpriseId) {
          // Si solo tenemos empresa, recargar todos los productos de la empresa
          await handleGetProductsByEnterprise(selectedEnterpriseId);
        } else {
          // Fallback al método original
          await handleGetProducts();
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

// Efecto para cargar productos cuando cambia la subcategoría o empresa seleccionada
useEffect(() => {
  if (selectedSubcategoryId && selectedEnterpriseId) {
    handleGetProductsBySubcategory(selectedSubcategoryId, selectedEnterpriseId);
  } else if (!selectedSubcategoryId && selectedEnterpriseId && !requireSubcategory) {
    // Solo cargar productos por empresa si NO se requiere subcategoría (ProductsComponent)
    // Resetear página al cambiar empresa y usar paginación
    setPage(0);
    // NO pasar debouncedSearchTerm aquí para evitar bucles
    handleGetProductsByEnterprisePageinated(selectedEnterpriseId, 0, rowsPerPage, "");
} else if (!selectedSubcategoryId && !selectedEnterpriseId && !requireSubcategory) {
  // NO cargar automáticamente todos los productos aquí
  // Dejar que ProductsCards llame a handleGetCatalogProducts() cuando sea necesario
  setProducts([]);
  setLoadingProducts(false);
} else {
    // Limpiar productos si:
    // - Se requiere subcategoría pero no hay una seleccionada (ClasificationsComponent)
    setProducts([]);
    setLoadingProducts(false);
  }
  
  // Reiniciar a la primera página cuando cambia la subcategoría seleccionada
  setPage(0);
  setCatalogPage(0);
  setHasMoreCatalog(true);
}, [selectedSubcategoryId, selectedEnterpriseId, requireSubcategory, rowsPerPage]);

// Efecto específico para manejar la búsqueda con debounce
useEffect(() => {
  // Solo ejecutar si hay empresa seleccionada y es para ProductsComponent
  if (selectedEnterpriseId && !selectedSubcategoryId && !requireSubcategory) {
    setPage(0);
    
    // cuando hay búsqueda, cargar TODOS los productos y filtrar localmente
    if (debouncedSearchTerm && debouncedSearchTerm.trim() !== "") {
      handleGetAllProductsByEnterprise(selectedEnterpriseId, "");
      setUseLocalSearch(true);
    } else {
      // Si no hay búsqueda, usar paginación normal
      handleGetProductsByEnterprisePageinated(selectedEnterpriseId, 0, rowsPerPage, "");
      setUseLocalSearch(false);
    }
  }
}, [debouncedSearchTerm]);

  // Limpiar el observer al desmontar
  useEffect(() => {
    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, []);

  return {
    // Valores y funciones originales (para mantener compatibilidad)
    products,
    filteredProducts: paginatedFilteredProducts,
    allFilteredProducts: filteredProducts,
    setProducts,
    selectedProduct,
    setSelectedProduct,
    loadingProducts,
    page,
    setPage,
    rowsPerPage,
    setRowsPerPage,
    totalProducts,
    handleChangePage,
    handleChangeRowsPerPage,
    searchTerm,
    setSearchTerm,
    handleGetProducts, // Mantener para compatibilidad
    handleGetProductsBySubcategory, // Nueva función
    handleGetProductsByEnterprise, // Nueva función para productos por empresa
    handleGetProductsByEnterprisePageinated, // Nueva función paginada para productos por empresa
    handleGetAllProductsByEnterprise, // Nueva función para obtener TODOS los productos por empresa
    handleGetProduct,
    handleDeleteProduct,
    handleCreateProduct,
    handleUpdateProduct,

    // Valores y funciones para infinite scroll de catálogo
    catalogProducts,
    filteredCatalogProducts,
    hasMoreCatalog,
    isFetchingMoreCatalog,
    catalogPage,
    setCatalogPage,
    handleGetCatalogProducts,
    loadMoreCatalogProducts,
    lastProductElementRef,
  };
};