import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  IconButton,
  Box,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider,
  Chip,
} from "@mui/material";
import {
  Close as CloseIcon,
  Receipt as ReceiptIcon,
  Assignment as AssignmentIcon,
  Store as StoreIcon,
  Person as PersonIcon,
} from "@mui/icons-material";
import dayjs from "dayjs";
import { useProducts } from "../../../../../hooks/Products/useProducts";

export const PurchasesDetailComponent = ({ open, setOpen, purchase }) => {
  const { handleGetProduct } = useProducts();
  const [purchasedProducts, setPurchasedProducts] = useState([]);

  useEffect(() => {
    const fetchProductDetails = async () => {
      if (purchase?.productos_comprados) {
        const productsDetails = await Promise.all(
          purchase.productos_comprados.map(async (producto) => {
            const details = await handleGetProduct(producto.producto_id);
            return {
              ...details,
              cantidad: producto.cantidad,
              costo_unitario: Number(producto.costo_unitario),
              importe: Number(producto.importe),
            };
          })
        );
        setPurchasedProducts(productsDetails);
      }
    };

    fetchProductDetails();
  }, [purchase]);

  const handleCloseDialog = () => {
    setOpen(false);
  };

  if (!purchase) return null;

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = dayjs(dateString).startOf("day");
    return date.format("DD/MM/YYYY");
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "";
    const date = dayjs(dateString);
    return date.format("DD/MM/YYYY HH:mm");
  };

  const formatPrice = (price) => {
    return price.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  const getEstadoColor = (estado) => {
    switch (estado?.toLowerCase()) {
      case "pendiente":
        return { color: "#ff9800", bg: "#fff3e0" };
      case "completado":
        return { color: "#4caf50", bg: "#e8f5e8" };
      case "cancelado":
        return { color: "#f44336", bg: "#ffebee" };
      default:
        return { color: "#757575", bg: "#f5f5f5" };
    }
  };

  const estadoColors = getEstadoColor(purchase.estado);

  const tableCellStyles = {
    backgroundColor: "#f1f1f1",
    fontWeight: "bold",
    fontSize: "0.875rem",
  };

  return (
    <Dialog
      open={open}
      onClose={handleCloseDialog}
      PaperProps={{
        sx: {
          width: { xs: "95%", sm: "70rem" },
          maxWidth: "none",
          height: { xs: "auto", sm: "45rem" },
          maxHeight: { xs: "95vh", sm: "none" },
          borderRadius: 5,
        },
      }}
    >
      <DialogTitle
        sx={{
          fontFamily: "Inter, sans-serif",
          fontWeight: "600",
          fontSize: 24,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          pb: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          Detalles de Compra 
          <Chip
            label={purchase.estado?.toUpperCase()}
            sx={{
              backgroundColor: estadoColors.bg,
              color: estadoColors.color,
              fontWeight: "bold",
              fontSize: "0.75rem",
            }}
          />
        </Box>
        <IconButton
          onClick={handleCloseDialog}
          sx={{
            borderRadius: "100%",
            position: "absolute",
            right: 10,
            top: 10,
            backgroundColor: "#D01313",
            width: 32,
            height: 32,
            color: "#fff",
            "&:hover": {
              backgroundColor: "#D01319",
            },
          }}
        >
          <CloseIcon sx={{ fontSize: "20px" }} />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ fontFamily: "Open Sans, sans-serif", p: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            {/* Información General */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "1fr 1fr 1fr" },
                gap: 3,
                mb: 3,
              }}
            >
              <Box>
                <Typography
                  sx={{
                    fontFamily: "Inter, sans-serif",
                    fontWeight: "bold",
                    fontSize: "14px",
                    marginBottom: 1,
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <PersonIcon fontSize="small" />
                  Empleado
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
                  {purchase.empleado_nombre || "No asignado"}
                </Typography>
              </Box>

              <Box>
                <Typography
                  sx={{
                    fontFamily: "Inter, sans-serif",
                    fontWeight: "bold",
                    fontSize: "14px",
                    marginBottom: 1,
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <StoreIcon fontSize="small" />
                  Almacén
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
                  {purchase.almacen_nombre || "No asignado"}
                </Typography>
              </Box>

              <Box>
                <Typography
                  sx={{
                    fontFamily: "Inter, sans-serif",
                    fontWeight: "bold",
                    fontSize: "14px",
                    marginBottom: 1,
                  }}
                >
                  Proveedor
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
                  {purchase.proveedor_nombre || "Sin proveedor"}
                </Typography>
              </Box>

              <Box>
                <Typography
                  sx={{
                    fontFamily: "Inter, sans-serif",
                    fontWeight: "bold",
                    fontSize: "14px",
                    marginBottom: 1,
                  }}
                >
                  Fecha de Movimiento
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
                  {formatDateTime(purchase.fecha_movimiento) || "No disponible"}
                </Typography>
              </Box>

              <Box>
                <Typography
                  sx={{
                    fontFamily: "Inter, sans-serif",
                    fontWeight: "bold",
                    fontSize: "14px",
                    marginBottom: 1,
                  }}
                >
                  Fecha de Recepción
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
                  {formatDate(purchase.fecha_recepcion) || "No disponible"}
                </Typography>
              </Box>

              <Box>
                <Typography
                  sx={{
                    fontFamily: "Inter, sans-serif",
                    fontWeight: "bold",
                    fontSize: "14px",
                    marginBottom: 1,
                  }}
                >
                  Tipo de Entrada
                </Typography>
                <Typography
                  sx={{
                    fontWeight: 500,
                    fontSize: 14,
                    backgroundColor: "#f5f5f5",
                    p: 1.5,
                    borderRadius: 1,
                    textTransform: "capitalize",
                  }}
                >
                  {purchase.tipo_entrada}
                </Typography>
              </Box>
            </Box>

            <hr />
            {/* Información de Facturación */}
            <Typography
              variant="h6"
              sx={{
                fontSize: 16,
                fontWeight: 600,
                mb: 2,
                mt: 3,
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              Información de Facturación
            </Typography>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "1fr 1fr 1fr" },
                gap: 3,
                mb: 3,
              }}
            >
              <Box>
                <Typography
                  sx={{
                    fontFamily: "Inter, sans-serif",
                    fontWeight: "bold",
                    fontSize: "14px",
                    marginBottom: 1,
                  }}
                >
                  Número de Factura
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
                  {purchase.numero_factura || "No asignado"}
                </Typography>
              </Box>

              <Box>
                <Typography
                  sx={{
                    fontFamily: "Inter, sans-serif",
                    fontWeight: "bold",
                    fontSize: "14px",
                    marginBottom: 1,
                  }}
                >
                  Fecha de Factura
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
                  {formatDate(purchase.fecha_factura) || "No disponible"}
                </Typography>
              </Box>

              <Box>
                <Typography
                  sx={{
                    fontFamily: "Inter, sans-serif",
                    fontWeight: "bold",
                    fontSize: "14px",
                    marginBottom: 1,
                  }}
                >
                  Fecha de Pago
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
                  {formatDate(purchase.fecha_pago) || "No disponible"}
                </Typography>
              </Box>

              <Box>
                <Typography
                  sx={{
                    fontFamily: "Inter, sans-serif",
                    fontWeight: "bold",
                    fontSize: "14px",
                    marginBottom: 1,
                  }}
                >
                  Método de Pago
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
                  {purchase.metodo_pago || "No disponible"}
                </Typography>
              </Box>

              <Box>
                <Typography
                  sx={{
                    fontFamily: "Inter, sans-serif",
                    fontWeight: "bold",
                    fontSize: "14px",
                    marginBottom: 1,
                  }}
                >
                  Costo de Envío
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
                  ${formatPrice(parseFloat(purchase.costo_envio || 0))}
                </Typography>
              </Box>

              <Box>
                <Typography
                  sx={{
                    fontFamily: "Inter, sans-serif",
                    fontWeight: "bold",
                    fontSize: "14px",
                    marginBottom: 1,
                  }}
                >
                  Total
                </Typography>
                <Typography
                  sx={{
                    fontWeight: 600,
                    fontSize: 16,
                    backgroundColor: "#e3f2fd",
                    color: "#1976d2",
                    p: 1.5,
                    borderRadius: 1,
                  }}
                >
                  ${formatPrice(parseFloat(purchase.total || 0))}
                </Typography>
              </Box>
            </Box>

            <hr />
            {/* Productos Comprados */}
            <Box sx={{ mb: 4 }}>
              <Typography
                variant="h6"
                sx={{
                  fontSize: 16,
                  fontWeight: 600,
                  mb: 2,
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                Productos Comprados
              </Typography>

              <TableContainer
                sx={{
                  height: "auto",
                  maxHeight: "calc(100vh - 400px)",
                  overflow: "auto",
                  border: "1px solid #e0e0e0",
                  borderRadius: 1,
                }}
              >
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={tableCellStyles}>Producto</TableCell>
                      <TableCell sx={tableCellStyles}>Modelo</TableCell>
                      <TableCell sx={tableCellStyles}>Marca</TableCell>
                      <TableCell align="right" sx={tableCellStyles}>
                        Cantidad
                      </TableCell>
                      <TableCell align="right" sx={tableCellStyles}>
                        Costo Unitario
                      </TableCell>
                      <TableCell align="right" sx={tableCellStyles}>
                        Importe
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {purchasedProducts.map((product, index) => (
                      <TableRow key={product.id || index}>
                        <TableCell>
                          <Typography sx={{ fontWeight: 500 }}>
                            {product.name || "Producto no encontrado"}
                          </Typography>
                        </TableCell>
                        <TableCell>{product.model || "N/A"}</TableCell>
                        <TableCell>{product.brand || "N/A"}</TableCell>
                        <TableCell align="right">
                          <Typography sx={{ fontWeight: 500 }}>
                            {product.cantidad || 0}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography sx={{ fontWeight: 500 }}>
                            ${formatPrice(parseFloat(product.costo_unitario) || "0.00")}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography sx={{ fontWeight: 600}}>
                            ${formatPrice(parseFloat(product.importe) || "0.00")}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>

            <hr />

            {/* Observaciones */}
            <Box>
              <Typography
                variant="h6"
                sx={{
                  fontSize: 16,
                  fontWeight: 600,
                  mb: 2,
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                Observaciones
              </Typography>

              <Box
                sx={{
                  p: 2,
                  borderRadius: 1,
                  border: "1px solid #e0e0e0",
                  bgcolor: "#fafafa",
                  minHeight: "60px",
                }}
              >
                <Typography
                  sx={{
                    fontSize: 14,
                    lineHeight: 1.6,
                    fontStyle: purchase.observaciones ? "normal" : "italic",
                    color: purchase.observaciones ? "#000" : "#757575",
                  }}
                >
                  {purchase.observaciones || "Sin observaciones"}
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  );
};
       