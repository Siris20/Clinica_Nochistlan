import {
  Box,
  FormControl,
  Grid,
  MenuItem,
  Select,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import "../styles/Header.css";
import SearchBar from "../components/SearchBar";
import { useEnterprise } from "../context/EnterpriseContext";
import { ProductsCards } from "../components/Catalogues/ProductsCards";
import { CataloguesCards } from "../components/Catalogues/CataloguesCards";
import { ProductDetailComponent } from "../components/Catalogues/ProductDetailComponent";
import { useProducts } from "../hooks/Products/useProducts";

export const CataloguesScreen = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"all" | "byEnterprise">(
    "all"
  );
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const { handleGetProduct, selectedProduct, setSelectedProduct } = useProducts();

  const handleSearchChange = (newSearchTerm) => {
    setSearchTerm(newSearchTerm);
    // Limpiar selección de producto cuando se busca
    setSelectedProductId(null);
  };
  
  const handleProductSelect = async (productId: number) => {
    try {
      await handleGetProduct(productId);
      setSelectedProductId(productId);
    } catch (error) {
      console.error("Error al cargar el producto:", error);
    }
  };
  
  const handleBackFromDetail = () => {
    setSelectedProductId(null);
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        minHeight: "100vh",
        overflowX: "hidden",
        position: "relative",
      }}
    >
        {" "}
        <header
          className="header-catalogues"
          style={{
            padding: isMobile ? "0.5rem" : "1rem",
            backgroundColor: "#fff",
            borderBottom: "1px solid #e0e0e0",
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            zIndex: 1100,
            width: "100%",
          }}
        >
          {" "}
          {isMobile ? ( // Diseño para móviles (3 filas)
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                width: "100%",
                gap: 1,
                p: 0.5,
                backgroundColor: "#fff",
              }}
            >
              {/* Primera fila: Logo y Volver */}
              <Grid
                container
                spacing={2}
                sx={{
                  alignItems: "center",
                  width: "100%",
                }}
              >
                <Grid item xs={6}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      height: "30px",
                    }}
                  >
                    <img
                      src="/images/tadimex.png"
                      alt="Tadimex Logo"
                      title="Tadimex Logo"
                      className="logo"
                      style={{
                        height: "100%",
                        maxWidth: "100%",
                        objectFit: "contain",
                      }}
                    />
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                    <Link
                      to="/"
                      className="header-link-catalogues"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        color: "#666",
                        textDecoration: "none",
                        gap: "8px",
                        fontSize: "0.875rem",
                      }}
                    >
                      <ArrowBackIcon fontSize="small" /> Volver
                    </Link>
                  </Box>
                </Grid>
              </Grid>{" "}
              {/* Segunda fila: Selector de modo */}
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <FormControl size="small" fullWidth>
                    <Select
                      value={viewMode}
                      onChange={(e) =>
                        setViewMode(e.target.value as "all" | "byEnterprise")
                      }
                      sx={{
                        height: "2rem",
                        backgroundColor: "#fff",
                        "& .MuiSelect-select": {
                          py: 0.25,
                          fontSize: "12px",
                        },
                        "& .MuiOutlinedInput-notchedOutline": {
                          borderColor: "#e0e0e0",
                        },
                      }}
                    >
                      <MenuItem value="all">Todos los productos</MenuItem>
                      <MenuItem value="byEnterprise">Por departamentos</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
              {/* Tercera fila: Barra de búsqueda */}
              <Box sx={{ width: "100%" }}>
                <SearchBar
                  searchTerm={searchTerm}
                  setSearchTerm={handleSearchChange}
                />
              </Box>
            </Box>
          ) : (
            // Diseño para escritorio con elementos distribuidos específicamente
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                width: "100%",
                px: 4,
              }}
            >
              {/* Sección izquierda con logo y selector */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  width: "320px",
                }}
              >
                {/* Logo */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    width: "120px",
                  }}
                >
                  <img
                    src="/images/tadimex.png"
                    alt="Tadimex Logo"
                    title="Tadimex Logo"
                    className="logo"
                    style={{ height: "30px", width: "auto" }}
                  />
                </Box>{" "}
                {/* Selectores */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    width: "200px",
                  }}
                >
                  <FormControl size="small" sx={{ width: "200px" }}>
                    <Select
                      value={viewMode}
                      onChange={(e) =>
                        setViewMode(e.target.value as "all" | "byEnterprise")
                      }
                      sx={{
                        height: "2.5rem",
                        backgroundColor: "#fff",
                        "& .MuiSelect-select": {
                          py: 0.5,
                          fontSize: "12px",
                        },
                        "& .MuiOutlinedInput-notchedOutline": {
                          borderColor: "#e0e0e0",
                        },
                      }}
                    >
                      <MenuItem value="all">Todos los productos</MenuItem>
                      <MenuItem value="byEnterprise">Por departamentos</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              </Box>

              {/* Barra de búsqueda centrada */}
              <Box
                sx={{
                  flex: "1 1 auto",
                  display: "flex",
                  justifyContent: "center",
                  px: 8,
                }}
              >
                <Box sx={{ width: "100%", maxWidth: "600px" }}>
                  <SearchBar
                    searchTerm={searchTerm}
                    setSearchTerm={handleSearchChange}
                  />
                </Box>
              </Box>

              {/* Botón Volver */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "flex-end",
                  width: "120px",
                }}
              >
                <Link
                  to="/"
                  className="header-link-catalogues"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  <ArrowBackIcon /> Volver
                </Link>
              </Box>
            </Box>
          )}
        </header>{" "}        
        {/* Contenido principal de la pantalla */}
        <Box sx={{ 
          marginTop: { xs: "140px", md: "80px" }, 
          paddingTop: "1rem",
          flex: 1,
          width: "100%"
        }}>
          {selectedProductId ? (
            <ProductDetailComponent 
              product={selectedProduct} 
              onBack={handleBackFromDetail} 
            />
          ) : (
            viewMode === "all" ? (
              <ProductsCards
                searchTerm={searchTerm}
                viewMode={viewMode}
                hideSelector
                onProductClick={handleProductSelect}
              />
            ) : (
              <CataloguesCards 
                searchTerm={searchTerm}
                onProductClick={handleProductSelect}
                // En modo byEnterprise, mantenemos el selectedEnterprise
                // pero modificamos CataloguesCards para mostrar TODOS los departamentos
                // independientemente de la empresa
                showAllDepartments={true}
              />
            )
          )}
        </Box>
      </Box>
  );
};