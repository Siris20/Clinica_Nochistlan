import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
  Grid,
  Box,
  useTheme,
  useMediaQuery,
  CircularProgress,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import InventoryIcon from "@mui/icons-material/Inventory";
import { useSatConcepts } from "../../../hooks/SatConcepts/useSatConcepts";
import { UM_SAT_OPTIONS } from "../um_sat_sections";


export const ProductsDetailComponent = ({ open, setOpen, product }) => {
  const [selectedImage, setSelectedImage] = useState(0);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const {selectedSatConcept, loading,handleGetSatConceptByClave} = useSatConcepts();

  //Estado para almacenar el concepto SAT obtenido
  const [satConcept, setSatConcept] = useState("");

  //Estado para almacenar la información de la unidad de medida
  const [unitInfo, setUnitInfo] = useState({label:"", type:""});

  const handleCloseDialog = () => {
    setOpen(false);
    setSelectedImage(0);
    setSatConcept("");
    setUnitInfo({label:"", type:""});
  };

  // Efecto para obtener el concepto SAT cuando se abre el modal o cambia el producto
  useEffect(() => {
    if (open && product && product.SAT_code) {
      // Llamamos a la función para obtener el concepto SAT por la clave
      handleGetSatConceptByClave(product.SAT_code);
    }
  }, [open, product]);

  // Efecto para actualizar el concepto SAT cuando se recibe la respuesta
  useEffect(() => {
    if (selectedSatConcept && selectedSatConcept.descripcion) {
      setSatConcept(selectedSatConcept.descripcion);
    }
  }, [selectedSatConcept]);

  // Efecto para buscar la información de la unidad de medida
  useEffect(() => {
    if (product && product.unidad_medida) {
      // Buscar la unidad de medida en nuestro array
      const unit = UM_SAT_OPTIONS.find(unit => unit.value === product.unidad_medida);
      if (unit) {
        setUnitInfo({
          label: unit.label,
          type: unit.type
        });
      } else {
        // Si no se encuentra, mostrar el código como está
        setUnitInfo({
          label: product.unidad_medida,
          type: "No especificado"
        });
      }
    } else {
      setUnitInfo({ label: "", type: "" });
    }
  }, [product]);

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

  if (!product) return null;

  const formatPrice = (price) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(price);
  };

  const ProductImages = () => (
    <Box
      sx={{ height: "100%", display: "flex", flexDirection: "column", gap: 2 }}
    >
      {/* Imagen principal */}
      <Box
        sx={{
          width: "100%",
          height: { xs: "250px", sm: "300px" },
          backgroundColor: "#f5f5f5",
          borderRadius: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          overflow: "hidden",
        }}
      >
        {product?.images && product.images[selectedImage] ? (
          <img
            src={getImageUrl(product.images[selectedImage])}
            alt={`${product.name} - ${selectedImage + 1}`}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
            }}
          />
        ) : (
          <InventoryIcon sx={{ fontSize: 60, color: "text.secondary" }} />
        )}
      </Box>

      {/* Miniaturas */}
      {product?.images && product.images.length > 1 && (
        <Box sx={{ display: "flex", gap: 1, justifyContent: "center" }}>
          {product.images.slice(0, 3).map((image, index) => (
            <Box
              key={index}
              onClick={() => setSelectedImage(index)}
              sx={{
                width: { xs: "60px", sm: "80px" },
                height: { xs: "60px", sm: "80px" },
                backgroundColor: "#f5f5f5",
                borderRadius: 1,
                cursor: "pointer",
                overflow: "hidden",
                border: selectedImage === index ? "2px solid #1976d2" : "none",
                "&:hover": {
                  opacity: 0.8,
                },
              }}
            >
              <img
                src={getImageUrl(image)}
                alt={`${product.name} - ${index + 1}`}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            </Box>
          ))}
        </Box>
      )}

      {/* Campo de Garantía (solo visible en pantallas grandes) */}
      {!isMobile && (
        <Box>
          <Typography
            sx={{
              fontFamily: "Inter, sans-serif",
              fontWeight: "bold",
              fontSize: "14px",
              marginBottom: 2.5,
            }}
          >
            Garantía
          </Typography>
          <Typography
            sx={{
              fontWeight: 500,
              fontSize: 14,
              backgroundColor: "#f5f5f5",
              p: 1.5,
              borderRadius: 1,
            }}
          >
            {product?.warranty || "No especificada"}
          </Typography>
        </Box>
      )}
    </Box>
  );

  const ProductInfo = () => (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <Box>
        <Typography
          sx={{
            fontFamily: "Inter, sans-serif",
            fontWeight: "bold",
            fontSize: "14px",
            marginBottom: 2,
          }}
        >
          Nombre del producto
        </Typography>
        <Typography
          sx={{
            fontWeight: 500,
            fontSize: 16,
            backgroundColor: "#f5f5f5",
            p: 1.5,
            borderRadius: 1,
          }}
        >
          {product?.name || "Sin nombre"}
        </Typography>
      </Box>

      <Box>
        <Typography
          sx={{
            fontFamily: "Inter, sans-serif",
            fontWeight: "bold",
            fontSize: "14px",
            marginBottom: 2,
          }}
        >
          Descripción
        </Typography>
        <Typography
          sx={{
            fontWeight: 500,
            fontSize: 14,
            backgroundColor: "#f5f5f5",
            p: 1.5,
            borderRadius: 1,
          }}
        >
          {product?.description || "Sin descripción"}
        </Typography>
      </Box>

      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <Typography
            sx={{
              fontFamily: "Inter, sans-serif",
              fontWeight: "bold",
              fontSize: "14px",
              marginBottom: 2,
            }}
          >
            Modelo
          </Typography>
          <Typography
            sx={{
              fontWeight: 500,
              fontSize: 14,
              backgroundColor: "#f5f5f5",
              p: 1.5,
              borderRadius: 1,
            }}
          >
            {product?.model || "No especificado"}
          </Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography
            sx={{
              fontFamily: "Inter, sans-serif",
              fontWeight: "bold",
              fontSize: "14px",
              marginBottom: 2,
            }}
          >
            Marca
          </Typography>
          <Typography
            sx={{
              fontWeight: 500,
              fontSize: 14,
              backgroundColor: "#f5f5f5",
              p: 1.5,
              borderRadius: 1,
            }}
          >
            {product?.brand || "No especificada"}
          </Typography>
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Typography
            sx={{
              fontFamily: "Inter, sans-serif",
              fontWeight: "bold",
              fontSize: "14px",
              marginBottom: 2,
            }}
          >
            Precio de venta
          </Typography>
          <Typography
            sx={{
              fontWeight: 500,
              fontSize: 14,
              backgroundColor: "#f5f5f5",
              p: 1.5,
              borderRadius: 1,
            }}
          >
            {product?.sell_price
              ? formatPrice(product.sell_price)
              : "No disponible"}
          </Typography>
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <Typography
            sx={{
              fontFamily: "Inter, sans-serif",
              fontWeight: "bold",
              fontSize: "14px",
              marginBottom: 2,
            }}
          >
            Unidad de Medida (UM)
          </Typography>
          <Typography
            sx={{
              fontWeight: 500,
              fontSize: 14,
              backgroundColor: "#f5f5f5",
              p: 1.5,
              borderRadius: 1,
            }}
          >
            {product?.unidad_medida || "No especificada"}
          </Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography
            sx={{
              fontFamily: "Inter, sans-serif",
              fontWeight: "bold",
              fontSize: "14px",
              marginBottom: 2,
            }}
          >
            Información de la unidad
          </Typography>
          <Typography
            sx={{
              fontWeight: 500,
              fontSize: 14,
              backgroundColor: "#f5f5f5",
              p: 1.5,
              borderRadius: 1,
            }}
          >
            {unitInfo.label ? `${unitInfo.label}` : "No especificado"}
            </Typography>
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <Typography
            sx={{
              fontFamily: "Inter, sans-serif",
              fontWeight: "bold",
              fontSize: "14px",
              marginBottom: 2,
            }}
          >
            Código SAT
          </Typography>
          <Typography
            sx={{
              fontWeight: 500,
              fontSize: 14,
              backgroundColor: "#f5f5f5",
              p: 1.5,
              borderRadius: 1,
            }}
          >
            {product?.SAT_code || "No especificada"}
          </Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography
            sx={{
              fontFamily: "Inter, sans-serif",
              fontWeight: "bold",
              fontSize: "14px",
              marginBottom: 2,
            }}
          >
            Concepto SAT
          </Typography>
          <Typography
            sx={{
              fontWeight: 500,
              fontSize: 14,
              backgroundColor: "#f5f5f5",
              p: 1.5,
              borderRadius: 1,
            }}
          >
            {loading ? (
              <CircularProgress size={20} sx={{ mr: 1 }} />
            ) : (
              satConcept || product?.SAT_concept || "No especificado"
            )}          
            </Typography>
        </Grid>
      </Grid>

      {/* Campo de Garantía (solo visible en pantallas pequeñas) */}
      {isMobile && (
        <Box>
          <Typography
            sx={{
              fontFamily: "Inter, sans-serif",
              fontWeight: "bold",
              fontSize: "14px",
              marginBottom: 2,
            }}
          >
            Garantía
          </Typography>
          <Typography
            sx={{
              fontWeight: 500,
              fontSize: 14,
              backgroundColor: "#f5f5f5",
              p: 1.5,
              borderRadius: 1,
            }}
          >
            {product?.warranty ? `${product.warranty} año(s)` : "No especificada"}
            </Typography>
        </Box>
      )}
    </Box>
  );

  return (
    <Dialog
      open={open}
      onClose={handleCloseDialog}
      PaperProps={{
        sx: {
          width: { xs: "90%", sm: "80%", md: "900px" },
          maxWidth: "none",
          height: "auto",
          maxHeight: "90vh",
          borderRadius: { xs: 5, sm: 5 },
          margin: { xs: 0, sm: 2 },
        },
      }}
    >
      <DialogTitle
        sx={{
          fontFamily: "Inter, sans-serif",
          fontWeight: "600",
          fontSize: { xs: 20, sm: 24 },
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          pb: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          Detalles del producto
        </Box>
        <IconButton
          onClick={handleCloseDialog}
          sx={{
            borderRadius: "100%",
            position: "absolute",
            right: 10,
            top: 10,
            backgroundColor: "#D01313",
            width: { xs: 20, sm: 24 },
            height: { xs: 20, sm: 24 },
            color: "#fff",
            "&:hover": {
              backgroundColor: "#D01319",
            },
          }}
        >
          <CloseIcon sx={{ fontSize: { xs: "16px", sm: "20px" } }} />
        </IconButton>
      </DialogTitle>
      <DialogContent
        sx={{ fontFamily: "Open Sans, sans-serif", p: { xs: 2, sm: 3 } }}
      >
        <Grid container spacing={3} direction={isMobile ? "column" : "row"}>
          {/* En móvil, las imágenes aparecen primero */}
          {isMobile ? (
            <>
              <Grid item xs={12}>
                <ProductImages />
              </Grid>
              <Grid item xs={12}>
                <ProductInfo />
              </Grid>
            </>
          ) : (
            <>
              <Grid item xs={7}>
                <ProductInfo />
              </Grid>
              <Grid item xs={5}>
                <ProductImages />
              </Grid>
            </>
          )}
        </Grid>
      </DialogContent>
    </Dialog>
  );
};