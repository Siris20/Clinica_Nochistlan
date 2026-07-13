import React, { useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Grid,
  Typography,
} from "@mui/material";
import { CataloguesCards } from "./CataloguesCards";
import { useProducts } from "../../hooks/Products/useProducts";
import { CataloguesSkeletonLoader } from "./CataloguesSkeletonLoader";

interface ProductsCardsProps {
  searchTerm: string;
  viewMode: "all" | "byEnterprise";
  hideSelector?: boolean;
  onProductClick?: (productId: number) => void;
}

export const ProductsCards: React.FC<ProductsCardsProps> = ({
  searchTerm,
  viewMode = "byEnterprise",
  hideSelector = false,
  onProductClick,
}) => {
  // Para modo "all" - todos los productos sin filtro de empresa (con infinite scroll)
  const {
    filteredCatalogProducts: allProducts,
    loadingProducts: loadingAllProducts,
    isFetchingMoreCatalog: isFetchingMoreAll,
    hasMoreCatalog: hasMoreAll,
    lastProductElementRef: lastAllProductElementRef,
    handleGetCatalogProducts,
  } = useProducts(null, null, false);

  // Inicializar la carga de productos del catálogo cuando se selecciona modo "all"
  useEffect(() => {
    if (viewMode === "all") {
      handleGetCatalogProducts();
    }
  }, [viewMode]);

  // Si los productos están cargando inicialmente, mostrar el skeleton loader
  if (loadingAllProducts && allProducts.length === 0 && viewMode === "all") {
    return (
      <Container>
        <CataloguesSkeletonLoader />
      </Container>
    );
  }

  const truncateText = (text: string, maxLength: number) => {
    if (!text) return "";
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  const getImageUrl = (imagePath: string) => {
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

  // Filtrar productos por término de búsqueda
  const filterProductsBySearch = (products) => {
    if (!searchTerm) return products;
    
    const searchLower = searchTerm.toLowerCase();
    return products.filter(
      (product) =>
        (product.name && product.name.toLowerCase().includes(searchLower)) ||
        (product.description && product.description.toLowerCase().includes(searchLower)) ||
        (product.brand && product.brand.toLowerCase().includes(searchLower)) ||
        (product.model && product.model.toLowerCase().includes(searchLower))
    );
  };

  const renderContent = () => {
    if (viewMode === "byEnterprise") {
      return (
        <CataloguesCards
          searchTerm={searchTerm}
          onProductClick={onProductClick}
        />
      );
    }

    // Modo "all" - mostrar todos los productos
    const searchFilteredProducts = filterProductsBySearch(allProducts);

    if (searchFilteredProducts.length === 0) {
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
              : "No hay productos disponibles"}
          </Typography>
        </Box>
      );
    }

    return (
      <Container>
        <Grid container spacing={3}>
          {searchFilteredProducts.map((product, index) => {
            // Determinar si este es el último elemento para aplicar el ref
            const isLastElement = index === searchFilteredProducts.length - 1;

            return (
              <Grid
                item
                xs={12}
                md={6}
                lg={3}
                key={product.id}
                ref={isLastElement ? lastAllProductElementRef : null}
              >
                <Card
                  sx={{
                    height: 400,
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
                  onClick={() => onProductClick && onProductClick(product.id)}
                >
                  {product.images && product.images.length > 0 ? (
                    <Box
                      component="img"
                      src={getImageUrl(product.images[0])}
                      alt={product.name}
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
                      <Typography color="text.secondary">Sin imagen</Typography>
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
                        {truncateText(product.name, 50)}
                      </Typography>
                      {product.description && (
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
                          {truncateText(product.description, 150)}
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
                      ${(product.sell_price || 0).toLocaleString("es-MX")}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>

        {/* Loader para mostrar al final cuando estamos cargando más productos */}
        {isFetchingMoreAll && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              width: "100%",
              py: 4,
            }}
          >
            <CircularProgress color="secondary" />
            <Typography
              variant="body2"
              sx={{ ml: 2, color: "#666", alignSelf: "center" }}
            >
              Cargando más productos...
            </Typography>
          </Box>
        )}

        {/* Mensaje cuando no hay más productos */}
        {!hasMoreAll && searchFilteredProducts.length > 0 && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              width: "100%",
              py: 4,
            }}
          >
            <Typography variant="body2" sx={{ color: "#666" }}>
              No hay más productos disponibles
            </Typography>
          </Box>
        )}
      </Container>
    );
  };

  return renderContent();
};