import React, { useState, useEffect } from "react";
import { useDepartments } from "../../hooks/Departments/useDepartments";
import { useCategories } from "../../hooks/Categories/useCategories";
import { useSubCategories } from "../../hooks/Subcategories/useSubCategories";
import { useProducts } from "../../hooks/Products/useProducts";
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Breadcrumbs,
  Link,
  CircularProgress,
} from "@mui/material";
import { useEnterprise } from "../../context/EnterpriseContext";
import { CataloguesSkeletonLoader } from "./CataloguesSkeletonLoader";

interface Department {
  id: number;
  name: string;
  description: string;
}

interface Category {
  id: number;
  name: string;
  description: string;
  departamento_id: number;
}

interface Subcategory {
  id: number;
  name: string;
  description: string;
  categoria_id: number;
}

interface Product {
  id: number;
  name: string;
  description: string;
  model?: string;
  brand?: string;
  warranty?: number;
  images?: string[];
  sell_price: number;
  subcategoria_id: number;
  unidad_medida?: string;
  SAT_code?: string;
}

interface CataloguesCardsProps {
  searchTerm: string;
  onProductClick?: (productId: number) => void;
  showAllDepartments?: boolean; // Nuevo prop para mostrar todos los departamentos
}

export const CataloguesCards: React.FC<CataloguesCardsProps> = ({
  searchTerm,
  onProductClick,
  showAllDepartments = false, // Default a false para mantener comportamiento original
}) => {
  const { selectedEnterprise } = useEnterprise();
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<
    number | null
  >(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    null
  );
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<
    number | null
  >(null);
  const [selectedLevel, setSelectedLevel] = useState<
    "departments" | "categories" | "subcategories" | "products"
  >("departments");

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  // Para departamentos: usar null si showAllDepartments es true, sino usar selectedEnterprise
  const departmentEnterpriseFilter = showAllDepartments ? null : selectedEnterprise;
  
  // Para categorías, subcategorías y productos: siempre usar selectedEnterprise para mantener funcionalidad
  const {
    allFilteredDepartments: filteredCatalogDepartments,
    loading: loadingDepartments,
    isFetchingMore: isFetchingMoreDepartments,
    hasMore: hasMoreDepartments,
    lastElementRef: lastDepartmentElementRef,
  } = useDepartments(departmentEnterpriseFilter);

  const { 
    allFilteredCategories: categories, 
    loading: loadingCategories 
  } = useCategories(selectedDepartmentId, selectedEnterprise);

  const { 
    allFilteredSubcategories: subcategories, 
    loading: loadingSubcategories 
  } = useSubCategories(selectedCategoryId, selectedEnterprise);

  const {
    allFilteredProducts: products,
    loading: loadingProducts,
    isFetchingMore: isFetchingMoreProducts,
    hasMore: hasMoreProducts,
    lastElementRef: lastProductElementRef,
  } = useProducts(selectedSubcategoryId, selectedEnterprise, true);

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "https://avatar.iran.liara.run/public/28";

    if (imagePath.startsWith("data:")) {
      return imagePath;
    }

    // Normalizar la ruta reemplazando backslashes con forward slashes
    const normalizedPath = imagePath.replace(/\\/g, "/");

    // Asegurarse que haya un slash entre la URL base y la ruta
    const baseUrl = import.meta.env.VITE_API_SERVER.endsWith("/")
      ? import.meta.env.VITE_API_SERVER.slice(0, -1)
      : import.meta.env.VITE_API_SERVER;

    return `${baseUrl}/${normalizedPath}`;
  };

  // Resetear estados cuando cambia la empresa seleccionada o showAllDepartments
  useEffect(() => {
    setSelectedDepartmentId(null);
    setSelectedCategoryId(null);
    setSelectedSubcategoryId(null);
    setSelectedLevel("departments");
  }, [selectedEnterprise, showAllDepartments]);

  const handleDepartmentClick = (departmentId: number) => {
    setSelectedDepartmentId(departmentId);
    setSelectedLevel("categories");
    setSelectedCategoryId(null);
    setSelectedSubcategoryId(null);
  };

  const handleCategoryClick = (categoryId: number) => {
    setSelectedCategoryId(categoryId);
    setSelectedLevel("subcategories");
    setSelectedSubcategoryId(null);
  };
  
  const handleSubcategoryClick = (subcategoryId: number) => {
    setSelectedSubcategoryId(subcategoryId);
    setSelectedLevel("products");
  };

  const handleProductClick = (productId: number) => {
    if (onProductClick) {
      onProductClick(productId);
    }
  };

  const handleBreadcrumbClick = (
    level: "departments" | "categories" | "subcategories" | "products"
  ) => {
    setSelectedLevel(level);
    if (level === "departments") {
      setSelectedDepartmentId(null);
      setSelectedCategoryId(null);
      setSelectedSubcategoryId(null);
    } else if (level === "categories") {
      setSelectedCategoryId(null);
      setSelectedSubcategoryId(null);
    } else if (level === "subcategories") {
      setSelectedSubcategoryId(null);
    }
  };

  const filterItemsBySearch = (
    items: Array<Department | Category | Subcategory | Product>
  ) => {
    if (!searchTerm) return items;

    const searchLower = searchTerm.toLowerCase();
    return items.filter(
      (item) =>
        item.name.toLowerCase().includes(searchLower) ||
        (item.description &&
          item.description.toLowerCase().includes(searchLower))
    );
  };

  // Mostrar un skeleton loader solo durante la carga inicial
  const isInitialLoading =
    (loadingDepartments &&
      filteredCatalogDepartments.length === 0 &&
      selectedLevel === "departments") ||
    (loadingCategories &&
      categories.length === 0 &&
      selectedLevel === "categories") ||
    (loadingSubcategories &&
      subcategories.length === 0 &&
      selectedLevel === "subcategories") ||
    (loadingProducts &&
      products.length === 0 &&
      selectedLevel === "products");

  if (isInitialLoading) {
    return (
      <Container>
        <CataloguesSkeletonLoader />
      </Container>
    );
  }

  const renderBreadcrumbs = () => {
    const selectedDepartment = (filteredCatalogDepartments as Department[]).find(
      (d) => d.id === selectedDepartmentId
    );
    const selectedCategory = (categories as Category[]).find(
      (c) => c.id === selectedCategoryId
    );
    const selectedSubcategory = (subcategories as Subcategory[]).find(
      (s) => s.id === selectedSubcategoryId
    );

    return (
      <Box
        sx={{
          mb: { xs: 2, md: 4 },
          p: { xs: 1.5, md: 2 },
          backgroundColor: "white",
          borderRadius: 2,
          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
          overflowX: "auto",
          "&::-webkit-scrollbar": {
            height: "4px",
          },
          "&::-webkit-scrollbar-track": {
            background: "#f1f1f1",
          },
          "&::-webkit-scrollbar-thumb": {
            background: "#ddd",
            borderRadius: "4px",
          },
        }}
      >
        <Breadcrumbs
          sx={{
            "& .MuiBreadcrumbs-ol": {
              flexWrap: "nowrap",
              width: "100%",
            },
            "& .MuiBreadcrumbs-li": {
              minWidth: "max-content",
            },
            "& .MuiBreadcrumbs-separator": {
              mx: { xs: 0.5, md: 1 },
            },
          }}
        >
          <Link
            component="button"
            onClick={() => handleBreadcrumbClick("departments")}
            sx={{
              color: selectedLevel === "departments" ? "#f44ecf" : "#666",
              textDecoration: "none",
              fontWeight: selectedLevel === "departments" ? 600 : 400,
              fontSize: { xs: "0.85rem", md: "0.95rem" },
              whiteSpace: "nowrap",
              "&:hover": {
                color: "#f44ecf",
              },
            }}
          >
            Departamentos
          </Link>
          {selectedDepartment && (
            <Link
              component="button"
              onClick={() => handleBreadcrumbClick("categories")}
              sx={{
                color: selectedLevel === "categories" ? "#f44ecf" : "#666",
                textDecoration: "none",
                fontWeight: selectedLevel === "categories" ? 600 : 400,
                fontSize: { xs: "0.85rem", md: "0.95rem" },
                whiteSpace: "nowrap",
                "&:hover": {
                  color: "#f44ecf",
                },
              }}
            >
              {selectedDepartment.name}
            </Link>
          )}
          {selectedCategory && (
            <Link
              component="button"
              onClick={() => handleBreadcrumbClick("subcategories")}
              sx={{
                color: selectedLevel === "subcategories" ? "#f44ecf" : "#666",
                textDecoration: "none",
                fontWeight: selectedLevel === "subcategories" ? 600 : 400,
                fontSize: { xs: "0.85rem", md: "0.95rem" },
                whiteSpace: "nowrap",
                "&:hover": {
                  color: "#f44ecf",
                },
              }}
            >
              {selectedCategory.name}
            </Link>
          )}
          {selectedSubcategory && (
            <Typography
              sx={{
                color: "#f44ecf",
                fontWeight: 600,
                fontSize: { xs: "0.85rem", md: "0.95rem" },
                whiteSpace: "nowrap",
              }}
            >
              {selectedSubcategory.name}
            </Typography>
          )}
        </Breadcrumbs>
      </Box>
    );
  };

  const renderCards = () => {
    let items: Array<Department | Category | Subcategory | Product> = [];
    let handleClick: (id: number) => void;
    let isLoading = false;
    let isFetchingMore = false;
    let hasMore = false;
    let lastItemRef = null;
    
    switch (selectedLevel) {
      case "departments":
        items = filteredCatalogDepartments as Department[];
        handleClick = handleDepartmentClick;
        isLoading = loadingDepartments;
        isFetchingMore = isFetchingMoreDepartments;
        hasMore = hasMoreDepartments;
        lastItemRef = lastDepartmentElementRef;
        break;
      case "categories":
        items = categories;
        handleClick = handleCategoryClick;
        isLoading = loadingCategories;
        break;
      case "subcategories":
        items = subcategories;
        handleClick = handleSubcategoryClick;
        isLoading = loadingSubcategories;
        break;
      case "products":
        items = products;
        handleClick = selectedLevel === "products" ? handleProductClick : () => {};
        isLoading = loadingProducts;
        isFetchingMore = isFetchingMoreProducts;
        hasMore = hasMoreProducts;
        lastItemRef = lastProductElementRef;
        break;
    }

    // Aplicar filtro de búsqueda
    const filteredItems = filterItemsBySearch(items);
    
    if (filteredItems.length === 0 && !isLoading) {
      return (
        <Box
          sx={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            p: 4,
          }}
        >
          <Typography
            variant="h6"
            sx={{
              color: "#666",
              fontWeight: 500,
              fontSize: "1.1rem",
              textAlign: "center",
              mb: 2,
            }}
          >
            Sin datos disponibles
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: "#999",
              textAlign: "center",
            }}
          >
            {searchTerm
              ? "No se encontraron resultados para tu búsqueda"
              : "No hay elementos disponibles"}
          </Typography>
        </Box>
      );
    }

    return (
      <>
        <Grid container spacing={3}>
          {filteredItems.map((item, index) => {
            const isLastElement = index === filteredItems.length - 1;

            return (
              <Grid
                item
                xs={12}
                md={6}
                lg={3}
                key={item.id}
                ref={isLastElement && lastItemRef ? lastItemRef : null}
              >
                <Card
                  sx={{
                    height: selectedLevel === "products" ? 400 : 300,
                    display: "flex",
                    flexDirection: "column",
                    position: "relative",
                    overflow: "hidden",
                    transition:
                      "transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out",
                    background:
                      "linear-gradient(135deg, #ffffff 0%, #f5f5f5 100%)",
                    borderRadius: 2,
                    border: "1px solid #f0f0f0",
                    "&:hover": {
                      transform: "translateY(-8px)",
                      boxShadow: "0 12px 20px rgba(244,78,207,0.1)",
                      cursor: "pointer",
                    },
                  }}
                  onClick={() => handleClick(item.id)}
                >
                  {selectedLevel === "products" ? (
                    <>
                      {item?.images && item?.images.length > 0 ? (
                        <Box
                          component="img"
                          src={getImageUrl(item.images[0])}
                          alt={item.name}
                          sx={{
                            width: "100%",
                            height: 200,
                            objectFit: "cover",
                            borderBottom: "1px solid #f0f0f0",
                          }}
                        />
                      ) : (
                        <Box
                          sx={{
                            width: "100%",
                            height: 200,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor: "#f5f5f5",
                            borderBottom: "1px solid #f0f0f0",
                          }}
                        >
                          <Typography color="text.secondary">
                            Sin imagen
                          </Typography>
                        </Box>
                      )}
                      <CardContent
                        sx={{
                          p: 2,
                          display: "flex",
                          flexDirection: "column",
                          height: 200,
                          justifyContent: "space-between",
                        }}
                      >
                        <Box>
                          <Typography
                            variant="h6"
                            sx={{
                              fontWeight: 700,
                              color: "#333",
                              fontSize: "0.95rem",
                              mb: 1,
                              height: "4em",
                              overflow: "hidden",
                            }}
                          >
                            {truncateText(item.name, 50)}
                          </Typography>
                          {item.description && (
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{
                                fontSize: "0.85rem",
                                textAlign: "justify",
                                mb: 2,
                                height: "4.2em",
                                overflow: "hidden",
                              }}
                            >
                              {truncateText(item?.description, 150) || ""}
                            </Typography>
                          )}
                        </Box>
                        <Typography
                          variant="h6"
                          sx={{
                            color: "#f44ecf",
                            fontWeight: 600,
                            fontSize: "1.1rem",
                            alignSelf: "flex-start",
                          }}
                        >
                          ${item?.sell_price.toLocaleString("es-MX") || 0}
                        </Typography>
                      </CardContent>
                    </>
                  ) : (
                    <CardContent
                      sx={{
                        p: 3,
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                      }}
                    >
                      <Typography
                        variant="h6"
                        component="h2"
                        sx={{
                          fontWeight: 600,
                          color: "#333",
                          fontSize: "1.1rem",
                          textAlign: "center",
                        }}
                      >
                        {item.name}
                      </Typography>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 400,
                          color: "#333",
                          fontSize: "0.8rem",
                          textAlign: "center",
                        }}
                      >
                        {item.description}
                      </Typography>
                    </CardContent>
                  )}
                </Card>
              </Grid>
            );
          })}
        </Grid>
        
        {/* Loader para mostrar al final cuando estamos cargando más items */}
        {isFetchingMore && (
          <Box 
            sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              width: '100%', 
              py: 4 
            }}
          >
            <CircularProgress color="secondary" />
            <Typography 
              variant="body2" 
              sx={{ ml: 2, color: '#666', alignSelf: 'center' }}
            >
              {selectedLevel === "departments" && "Cargando más departamentos..."}
              {selectedLevel === "products" && "Cargando más productos..."}
            </Typography>
          </Box>
        )}
        
        {/* Mensaje cuando no hay más items */}
        {!hasMore && filteredItems.length > 0 && (selectedLevel === "departments" || selectedLevel === "products") && (
          <Box 
            sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              width: '100%', 
              py: 4 
            }}
          >
            <Typography 
              variant="body2" 
              sx={{ color: '#666' }}
            >
              {selectedLevel === "departments" && "No hay más departamentos disponibles"}
              {selectedLevel === "products" && "No hay más productos disponibles"}
            </Typography>
          </Box>
        )}
      </>
    );
  };

  return (
    <Container sx={{ py: { xs: 2, md: 4 } }}>
      {renderBreadcrumbs()}
      <Box
        sx={{
          mb: 3,
          textAlign: "center",
        }}
      >
        <Typography
          variant="h6"
          sx={{
            color: "#666",
            fontWeight: 500,
            fontSize: "1.1rem",
          }}
        >
          {selectedLevel === "departments" && "Selecciona un Departamento"}
          {selectedLevel === "categories" && "Selecciona una Categoría"}
          {selectedLevel === "subcategories" && "Selecciona una Subcategoría"}
          {selectedLevel === "products" && "Productos disponibles"}
        </Typography>
      </Box>
      {renderCards()}
    </Container>
  );
};