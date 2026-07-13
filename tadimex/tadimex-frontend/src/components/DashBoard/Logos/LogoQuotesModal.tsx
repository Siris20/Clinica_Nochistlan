import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import dayjs from "dayjs";
import { useQuotes } from "../../../hooks/Quotes/useQuotes";

export const LogoQuotesModal = ({ open, handleClose, logo }) => {
  const [loading, setLoading] = useState(true);
  const [logoQuotes, setLogoQuotes] = useState([]);
  
  // Usar el hook existente para tener acceso a todas las cotizaciones
  const { quotes } = useQuotes();

  useEffect(() => {
    if (!logo || !open) return;
    
    // Filtrar las cotizaciones que usan este logo
    const fetchQuotes = async () => {
      setLoading(true);
      try {
        // Filtrar las cotizaciones que tienen este logo_id
        const filteredQuotes = quotes.filter(quote => quote.logo_id === logo.id);
        setLogoQuotes(filteredQuotes);
      } catch (error) {
        console.error("Error al cargar las cotizaciones del logo:", error);
        setLogoQuotes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchQuotes();
  }, [logo, open, quotes]);

  // Función para formatear la fecha
  const formatDateTime = (dateString) => {
    if (!dateString) return "";
    const date = dayjs(dateString);
    return date.format("DD/MM/YYYY HH:mm");
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = dayjs(dateString).startOf("day");
    return date.format("DD/MM/YYYY");
  };

  // Obtener la URL de la imagen del logo
  const getImageUrl = (imagePath) => {
    if (!imagePath) return "https://avatar.iran.liara.run/public/28";
  
    if (imagePath.startsWith("data:")) {
      return imagePath;
    }
  
    // Asegurarse de que las rutas usen forward slashes
    const normalizedPath = imagePath.replace(/\\/g, '/');
    return `${import.meta.env.VITE_API_SERVER}/${normalizedPath}`;
  };

  if (!logo) return null;

  const tableCellHeaderStyles = {
    backgroundColor: "#f1f1f1",
    fontSize: "0.8rem",
    fontWeight: "bold",
    cursor: "pointer",
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="lg"
      fullWidth
      aria-labelledby="quotes-dialog-title"
    >
      <DialogTitle id="quotes-dialog-title">
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box
              sx={{
                width: 50,
                height: 50,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1px solid #e0e0e0",
                borderRadius: 1,
                padding: 1,
                overflow: "hidden"
              }}
            >
              <img
                src={getImageUrl(logo.image_url)}
                alt={logo.name}
                style={{
                  maxWidth: "100%",
                  maxHeight: "100%",
                  objectFit: "contain",
                }}
              />
            </Box>
            <Typography variant="h6">Cotizaciones con logo {logo.name}</Typography>
          </Box>
          <IconButton
            edge="end"
            color="inherit"
            onClick={handleClose}
            aria-label="close"
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
            <CircularProgress />
          </Box>
        ) : logoQuotes.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
            <Typography variant="h6" color="text.secondary">
              No hay cotizaciones que utilicen este logo
            </Typography>
          </Box>
        ) : (
          <TableContainer component={Paper} sx={{ mt: 2 }}>
            <Table aria-label="cotizaciones table">
              <TableHead>
                <TableRow>
                  <TableCell sx={tableCellHeaderStyles} align="justify">Folio</TableCell>
                  <TableCell sx={tableCellHeaderStyles} align="justify">Fecha Registro</TableCell>
                  <TableCell sx={tableCellHeaderStyles} align="justify">Fecha Vencimiento</TableCell>
                  <TableCell sx={tableCellHeaderStyles} align="justify">Emisor</TableCell>
                  <TableCell sx={tableCellHeaderStyles} align="justify">Cliente</TableCell>
                  <TableCell sx={tableCellHeaderStyles} align="justify">Prod.</TableCell>
                  <TableCell sx={tableCellHeaderStyles} align="justify">Subtotal</TableCell>
                  <TableCell sx={tableCellHeaderStyles} align="justify">IVA</TableCell>
                  <TableCell sx={tableCellHeaderStyles} align="justify">Total</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {logoQuotes.map((quote) => (
                  <TableRow key={quote.id} hover>
                    <TableCell align="justify">{quote.folio}</TableCell>
                    <TableCell align="justify">{formatDateTime(quote.created_at)}</TableCell>
                    <TableCell align="justify">{formatDate(quote.fecha_vencimiento)}</TableCell>
                    <TableCell align="justify">{quote.emisor_nombre}</TableCell>
                    <TableCell align="justify">{quote.cliente_nombre}</TableCell>
                    <TableCell align="justify">{quote.totalProductos || '-'}</TableCell>
                    <TableCell align="justify">{quote.subtotal ? `$${quote.subtotal}` : '-'}</TableCell>
                    <TableCell align="justify">{quote.iva ? `$${quote.iva}` : '-'}</TableCell>
                    <TableCell align="justify">{quote.total ? `$${quote.total}` : '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DialogContent>
    </Dialog>
  );
};