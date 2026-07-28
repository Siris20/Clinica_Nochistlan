import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
  Grid,
  Box,
  Divider,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import AssignmentIcon from "@mui/icons-material/Assignment";
import ReceiptIcon from "@mui/icons-material/Receipt";
import { useProducts } from "../../../hooks/Products/useProducts";
import dayjs from "dayjs";

export const QuotesDetailComponent = ({ open, setOpen, quote }) => {
  const { handleGetProduct } = useProducts();
  const [quotedProducts, setQuotedProducts] = useState([]);

  useEffect(() => {
    const fetchProductDetails = async () => {
      if (quote?.productos_cotizados) {
        const productsDetails = await Promise.all(
          quote.productos_cotizados.map(async (producto) => {
            const details = await handleGetProduct(producto.producto_id);
            //Usar el precio personalizado si existe, o el original si no
            const precioUnitario = producto.precio_unitario !== undefined ?
              producto.precio_unitario : details.sell_price;
            const precioConDescuento = precioUnitario * (1 - producto.descuento / 100);
            const subtotalProduct = precioConDescuento * producto.cantidad;
            return {
              ...details,
              cantidad: producto.cantidad,
              descuento: producto.descuento,
              precio_original: details.sell_price,
              precio_cotizado: precioUnitario,
              nombre_original: details.name,
              concepto: producto.concepto || details.name,
              subtotal: subtotalProduct,
            };
          })
        );
        setQuotedProducts(productsDetails);
      }
    };

    fetchProductDetails();
  }, [quote]);

  const handleCloseDialog = () => {
    setOpen(false);
  };

  if (!quote) return null;

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = dayjs(dateString).startOf("day");
    return date.format("DD/MM/YYYY");
  };

  const tableCellStyles = {
    backgroundColor: "#f1f1f1",
  };

  // Agregar el logo si existe
  const logoUrl = `${import.meta.env.VITE_API_SERVER}/${quote.logo_nombre}`;

  // Calcular totales correctos para mostrar
  const calculateDisplayTotals = () => {
    const subtotalProductos = quotedProducts.reduce(
      (sum, product) =>
        sum +
        product.precio_cotizado *
          product.cantidad *
          (1 - product.descuento / 100),
      0
    );
    const descuentoGeneral =
      subtotalProductos * (Number(quote.descuento_general || 0) / 100);
    const gastosEnvio = Number(quote.gastos_envio || 0);
    const subtotalConEnvio = subtotalProductos - descuentoGeneral + gastosEnvio;

    // IVA y total del endpoint
    const iva = Number(quote.iva || 0);
    const total = Number(quote.total || 0);

    return {
      subtotalProductos,
      descuentoGeneral,
      gastosEnvio,
      subtotalConEnvio,
      iva,
      total,
    };
  };

  const totales = calculateDisplayTotals();

  return (
    <Dialog
      open={open}
      onClose={handleCloseDialog}
      PaperProps={{
        sx: {
          width: { xs: "95%", sm: "64rem" },
          maxWidth: "none",
          height: { xs: "auto", sm: "41rem" },
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
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          Detalles de cotización: {quote.folio}
        </Box>
        <IconButton
          onClick={handleCloseDialog}
          sx={{
            borderRadius: "100%",
            position: "absolute",
            right: 10,
            top: 10,
            backgroundColor: "#D01313",
            width: 24,
            height: 24,
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
            {quote.logo_nombre && (
              <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
                <img
                  src={logoUrl}
                  alt="Logo"
                  style={{
                    height: "100px",
                    width: "auto",
                    objectFit: "contain",
                  }}
                />
              </Box>
            )}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
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
                    marginBottom: 2,
                  }}
                >
                  Emisor
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
                  {`${quote.emisor_nombre}`}
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
                  Cliente
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
                  {`${quote.cliente_nombre} `}
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
                  Fecha de Vencimiento
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
                  {formatDate(quote.fecha_vencimiento)}
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
                  Descuento General
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
                  {quote.descuento_general}%
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
                  Gastos de Envío
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
                  ${quote.gastos_envio}
                </Typography>
              </Box>
            </Box>

            <Divider sx={{ my: 3 }} />

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
                <ReceiptIcon /> Productos
              </Typography>

              <TableContainer
                sx={{
                  height: "auto",
                  maxHeight: "calc(100vh - 200px)",
                  overflow: "auto",
                  "@media (max-width: 600px)": {
                    maxHeight: "calc(100vh - 250px)",
                  },
                }}
              >
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={tableCellStyles}>Nombre</TableCell>
                      <TableCell sx={tableCellStyles}>Modelo</TableCell>
                      <TableCell sx={tableCellStyles}>Marca</TableCell>
                      <TableCell align="right" sx={tableCellStyles}>
                        Precio
                      </TableCell>
                      <TableCell align="right" sx={tableCellStyles}>
                        Cantidad
                      </TableCell>
                      <TableCell align="right" sx={tableCellStyles}>
                        Descuento
                      </TableCell>
                      <TableCell align="right" sx={tableCellStyles}>
                        Subtotal
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {quotedProducts.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell>
                          {product.concepto || product.name}
                        </TableCell>
                        <TableCell>{product.model}</TableCell>
                        <TableCell>{product.brand}</TableCell>
                        <TableCell align="right">
                          ${(product.precio_cotizado || product.precio_original).toFixed(2)}
                        </TableCell>
                        <TableCell align="right">{product.cantidad}</TableCell>
                        <TableCell align="right">
                          {product.descuento}%
                        </TableCell>
                        <TableCell align="right">${product.subtotal}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
              <Grid container spacing={2} justifyContent="flex-end">
                <Grid item xs={12} md={4}>
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 1,
                      "& .MuiTypography-root": {
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: "14px",
                        py: 0.5,
                      },
                    }}
                  >
                    {(() => {
                      const subtotal = Number(quote.subtotal || 0);
                      const descuentoGeneral =
                        (subtotal * Number(quote.descuento_general || 0)) / 100;
                      const gastosEnvio = Number(quote.gastos_envio || 0);
                      const subtotalConEnvio =
                        subtotal + gastosEnvio - descuentoGeneral;

                      return (
                        <>
                          <Typography
                            sx={{ borderBottom: "1px solid #e0e0e0" }}
                          >
                            <span>Subtotal:</span>
                            <span>${totales.subtotalProductos.toFixed(2)}</span>
                          </Typography>
                          <Typography
                            sx={{ borderBottom: "1px solid #e0e0e0" }}
                          >
                            <span>Descuento general:</span>
                            <span>${totales.descuentoGeneral.toFixed(2)}</span>
                          </Typography>
                          <Typography
                            sx={{ borderBottom: "1px solid #e0e0e0" }}
                          >
                            <span>Gastos de envío:</span>
                            <span>${totales.gastosEnvio.toFixed(2)}</span>
                          </Typography>
                          <Typography
                            sx={{ borderBottom: "1px solid #e0e0e0" }}
                          >
                            <span>Subtotal con envío:</span>
                            <span>${totales.subtotalConEnvio.toFixed(2)}</span>
                          </Typography>
                          <Typography
                            sx={{ borderBottom: "1px solid #e0e0e0" }}
                          >
                            <span>IVA:</span>
                            <span>${totales.iva.toFixed(2)}</span>
                          </Typography>
                          <Typography>
                            <span>Ret.Ist:</span>
                            <span>${quote?.isr_ret.toFixed(2)}</span>
                          </Typography>
                          <Typography
                            sx={{
                              fontWeight: "bold !important",
                              borderTop: "1px solid #e0e0e0",
                              pt: 1,
                              backgroundColor: "#f1f1f1",
                            }}
                          >
                            <span>Total:</span>
                            <span>${totales.total.toFixed(2)}</span>
                          </Typography>
                        </>
                      );
                    })()}
                  </Box>
                </Grid>
              </Grid>
            </Box>

            <Box>
              <Typography
                variant="h6"
                sx={{
                  fontSize: 16,
                  fontWeight: 600,
                  mb: 3,
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <AssignmentIcon /> Información Adicional
              </Typography>

              <Box
                sx={{
                  p: 2,
                  borderRadius: 1,
                  border: "1px solid #e0e0e0",
                  bgcolor: "#fafafa",
                }}
              >
                <Typography
                  sx={{
                    fontSize: 14,
                    fontWeight: 600,
                    mb: 1,
                    color: "#000",
                  }}
                >
                  Observaciones:
                </Typography>
                <Typography
                  sx={{
                    fontSize: 14,
                    mb: 3,
                    color: "#000",
                    lineHeight: 1.6,
                  }}
                >
                  {quote.observaciones}
                </Typography>

                <Typography
                  sx={{
                    fontSize: 14,
                    fontWeight: 600,
                    mb: 1,
                    color: "#000",
                  }}
                >
                  Condiciones de Venta:
                </Typography>
                <Typography
                  sx={{
                    fontSize: 14,
                    color: "#000",
                    lineHeight: 1.6,
                  }}
                >
                  {quote.condiciones_venta}
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  );
};
