import React, { useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Divider,
  IconButton,
  Container,
  Button,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";

interface ProductDetailComponentProps {
  product: any;
  onBack: () => void;
}

export const ProductDetailComponent: React.FC<ProductDetailComponentProps> = ({
  product,
  onBack,
}) => {
  const [selectedImage, setSelectedImage] = useState(0);

  if (!product) {
    return null;
  }
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
  
  const formatPrice = (price) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(price);
  };
  
  // Función para abrir WhatsApp con un mensaje predefinido
  const handleWhatsAppClick = () => {
    const phoneNumber = "5214491388110";
    const message = `Buen día, me interesa este artículo: ${product.name}`;
    
    // Codificar el mensaje para la URL
    const encodedMessage = encodeURIComponent(message);
    
    // Crear la URL de WhatsApp
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    
    // Abrir en una nueva ventana/pestaña
    window.open(whatsappUrl, '_blank');
  };
  
  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 } }}>
      <Box sx={{ mb: 3, display: "flex", alignItems: "center" }}>
        <IconButton
          onClick={onBack}
          sx={{
            mr: 2,
            color: "#f44ecf",
            "&:hover": {
              backgroundColor: "rgba(244, 78, 207, 0.08)",
            },
          }}
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography
          variant="h5"
          component="h1"
          sx={{
            fontWeight: 600,
            color: "#333",
          }}
        >
          Detalle del Producto
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {/* Columna de imágenes (izquierda) */}
        <Grid item xs={12} md={6}>
          {/* Imagen principal */}
          <Box sx={{ mb: 2 }}>
            <Box
              sx={{
                width: "100%",
                height: { xs: 300, md: 400 },
                backgroundColor: "#fff",
                borderRadius: 2,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                overflow: "hidden",
                border: "1px solid #f0f0f0",
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
                    padding: "8px",
                  }}
                />
              ) : (
                <Typography color="text.secondary">Sin imagen</Typography>
              )}
            </Box>
          </Box>

          {/* Miniaturas en horizontal */}
          {product?.images && product.images.length > 1 && (
            <Box
              sx={{
                display: "flex",
                gap: 2,
                justifyContent: "flex-start",
                flexWrap: "wrap",
                mt: 2,
              }}
            >
              {product.images.map((image, index) => (
                <Box
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  sx={{
                    width: 80,
                    height: 80,
                    backgroundColor: "#fff",
                    borderRadius: 1,
                    cursor: "pointer",
                    overflow: "hidden",
                    border:
                      selectedImage === index
                        ? "2px solid #f44ecf"
                        : "1px solid #f0f0f0",
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
                      objectFit: "contain",
                    }}
                  />
                </Box>
              ))}
            </Box>
          )}
        </Grid>{" "}
        {/* Columna de información (derecha) */}
        <Grid item xs={12} md={6}>
          {/* Título */}
          <Box sx={{ mb: 2 }}>
            <Typography
              variant="h5"
              component="h1"
              sx={{
                fontWeight: 700,
                color: "#333",
                mb: 1,
                textAlign: "left",
              }}
            >
              {product.name}
            </Typography>
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Datos técnicos */}
          <Box sx={{ mb: 3 }}>
            <Grid container spacing={1.5}>
              {product.brand && (
                <Grid item xs={12}>
                  <Typography
                    variant="body2"
                    sx={{ color: "#555", fontWeight: 500, textAlign: "left" }}
                  >
                    <strong>Marca:</strong> {product.brand}
                  </Typography>
                </Grid>
              )}
              {product.model && (
                <Grid item xs={12}>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "#555",
                      fontWeight: 500,
                      textAlign: "left",
                    }}
                  >
                    <strong>Modelo:</strong> {product?.model || "No disponible"}
                  </Typography>
                </Grid>
              )}
              {product.SAT_code && (
                <Grid item xs={12}>
                  <Typography
                    variant="body2"
                    sx={{ color: "#555", fontWeight: 500, textAlign: "left" }}
                  >
                    <strong>Código SAT:</strong>{" "}
                    {product?.SAT_code || "No disponible"}
                  </Typography>
                </Grid>
              )}
              {product.unidad_medida && (
                <Grid item xs={12}>
                  <Typography
                    variant="body2"
                    sx={{ color: "#555", fontWeight: 500, textAlign: "left" }}
                  >
                    <strong>Unidad de medida:</strong>{" "}
                    {product?.unidad_medida || "No disponible"}
                  </Typography>
                </Grid>
              )}
              {product.warranty && (
                <Grid item xs={12}>
                  <Typography
                    variant="body2"
                    sx={{ color: "#555", fontWeight: 500, textAlign: "left" }}
                  >
                    <strong>Garantía:</strong> {product?.warranty || 0}{" "}
                    {product?.warranty === 1 ? "año" : "años"}
                  </Typography>
                </Grid>
              )}
            </Grid>
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Descripción */}
          {product.description && (
            <Box sx={{ mb: 3 }}>
              <Typography
                variant="body2"
                sx={{
                  color: "#555",
                  fontWeight: 500,
                  mb: 1,
                  textAlign: "left",
                }}
              >
                <strong>Descripción:</strong>
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: "#666",
                  lineHeight: 1.6,
                  textAlign: "justify",
                }}
              >
                {product?.description || "No hay descripción disponible."}
              </Typography>
            </Box>
          )}

          <Divider sx={{ my: 2 }} />
          
          {/* Precio */}
          <Box sx={{ mb: 2, textAlign: "left" }}>
            <Typography
              variant="h4"
              sx={{
                color: "#f44ecf",
                fontWeight: 700,
                fontSize: "2rem",
              }}
            >
              {formatPrice(product?.sell_price) || "$0.00"}
            </Typography>
          </Box>
          
          {/* Botón de WhatsApp */}
          <Button
            variant="contained"
            startIcon={<WhatsAppIcon />}
            onClick={handleWhatsAppClick}
            fullWidth
            sx={{
              mt: 2,
              py: 1.5,
              backgroundColor: "#25D366", // Color de WhatsApp
              color: "#fff",
              fontWeight: 600,
              boxShadow: "0px 4px 10px rgba(37, 211, 102, 0.3)",
              "&:hover": {
                backgroundColor: "#128C7E", // Color más oscuro para hover
              },
            }}
          >
            Preguntar por WhatsApp
          </Button>
        </Grid>
      </Grid>
    </Container>
  );
};