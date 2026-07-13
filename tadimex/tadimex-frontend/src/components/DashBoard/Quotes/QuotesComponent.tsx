import {
  Box,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  TablePagination,
} from "@mui/material";
import React, { useState, useMemo } from "react";
import { toast, ToastContainer } from "react-toastify";
import SearchBar from "../../SearchBar";
import {
  Edit,
  RemoveRedEye,
  MoreVert,
  PictureAsPdf,
  MenuBook,
} from "@mui/icons-material";
import DeleteIcon from "@mui/icons-material/Delete";
import { DeleteDialogConfirmComponent } from "../DeleteDialogConfirmComponent";
import Loader from "../../Loader";
import { useQuotes } from "../../../hooks/Quotes/useQuotes";
import { AddQuotesComponent } from "./AddQuotesComponent";
import { QuotesDetailComponent } from "./QuotesDetailComponent";
import { createConceptsCatalogPDF, createQuotePDF } from "./quotes";
import { useProducts } from "../../../hooks/Products/useProducts";
import { useEnterprise } from "../../../context/EnterpriseContext";
import dayjs from "dayjs";
import { RenamePDFDialog } from "./RenamePDFDialog";

export const QuotesComponent = () => {
  const { selectedEnterprise } = useEnterprise();

  // Hook de Cotizaciones con paginación
  const {
    quotes,
    allQuotes,
    filteredQuotes,
    setQuotes,
    selectedQuote,
    setSelectedQuote,
    handleGetQuote,
    handleDeleteQuote: deleteQuoteAPI,
    handleCreateQuote,
    handleUpdateQuote,
    loading,
    // Estados y funciones para paginación
    page,
    rowsPerPage,
    totalQuotes,
    handleChangePage,
    handleChangeRowsPerPage,
    // Estados y funciones para búsqueda
    searchTerm,
    setSearchTerm,
  } = useQuotes(selectedEnterprise);

  // Hook de productos
  const { handleGetProduct } = useProducts();

  // Estados
  const [open, setOpen] = useState(false);
  const [openDetails, setOpenDetails] = useState(false);
  const [openRenameDialog, setOpenRenameDialog] = useState(false);
  const [openConceptsRenameDialog, setOpenConceptsRenameDialog] = useState(false);
  const [pdfName, setPdfName] = useState("");
  const [quoteToExport, setQuoteToExport] = useState(null);
  const [conceptsToExport, setConceptsToExport] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [quoteToDelete, setQuoteToDelete] = useState(null);
  const [editingQuote, setEditingQuote] = useState(null);
  const [folioOrder, setFolioOrder] = useState("asc");
  const [registerDate, setRegisterDate] = useState("asc");
  const [expirationDate, setExpirationDate] = useState("asc");
  const [emitterOrder, setEmitterOrder] = useState("asc");
  const [clientOrder, setClientOrder] = useState("asc");
  const [productOrder, setProductOrder] = useState("asc");
  const [subtotalOrder, setSubtotalOrder] = useState("asc");
  const [ivaOrder, setIvaOrder] = useState("asc");
  const [isrRet, setIsrRet] = useState("asc");
  const [totalOrder, setTotalOrder] = useState("asc");
  const [anchorEl, setAnchorEl] = useState(null);

  // Función inteligente para manejar la búsqueda
  const handleSearchChange = (newSearchTerm) => {
    setSearchTerm(newSearchTerm);
    
    if (newSearchTerm) {
      const searchResults = filteredQuotes.filter(
        (quote) =>
          quote.folio?.toLowerCase().includes(newSearchTerm.toLowerCase()) ||
          quote.cliente_nombre?.toLowerCase().includes(newSearchTerm.toLowerCase()) ||
          quote.emisor_nombre?.toLowerCase().includes(newSearchTerm.toLowerCase())
      );
      
      if (searchResults.length > 0) {
        // Encontramos la primera cotización que coincide
        const firstMatchingQuote = searchResults[0];
        // Encontramos su índice en la lista completa
        const indexInAllFiltered = filteredQuotes.findIndex(q => q.id === firstMatchingQuote.id);
        // Calculamos en qué página está
        if (indexInAllFiltered !== -1) {
          const pageOfFirstResult = Math.floor(indexInAllFiltered / rowsPerPage);
          setPage(pageOfFirstResult);
        }
      }
    }
  };

  // Función para abrir el diálogo de agregar cotización
  const handleClickDialogQuote = () => {
    setEditingQuote(null);
    setOpen(true);
  };

  // Función para agregar una nueva cotización
  const handleAddQuote = async (newQuote) => {
    try {
      await handleCreateQuote(newQuote);
      toast.success("Cotización agregada correctamente");
    } catch (error) {
      toast.error("Error al agregar la cotización");
    }
  };

  // Función para abrir el diálogo de eliminación de cotizaciones
  const handleDeleteDialog = (quote) => {
    setQuoteToDelete(quote);
    setDeleteDialogOpen(true);
  };

  // Función para eliminar una cotización
  const handleDeleteQuote = async () => {
    try {
      await deleteQuoteAPI(quoteToDelete.id);
      setQuotes((prevQuotes) =>
        prevQuotes.filter((quote) => quote.id !== quoteToDelete.id)
      );
      setDeleteDialogOpen(false);
      setQuoteToDelete(null);
      toast.success("Cotización eliminada correctamente");
    } catch (error) {
      toast.error("Error al eliminar la cotización");
    }
  };

  // Función para cerrar el diálogo de eliminación de cotizaciones
  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setQuoteToDelete(null);
  };

  // Función para abrir el diálogo de editar cotizaciones
  const handleEditQuote = (quote) => {
    setEditingQuote(quote);
    setOpen(true);
  };

  // Función para editar una cotización
  const handleUpdate = async (quoteData) => {
    try {
      const quoteId = editingQuote.id;

      // Asegurarnos que tenemos el ID
      if (!quoteId) {
        throw new Error("No se encontró el ID de la cotización");
      }
      await handleUpdateQuote(quoteId, quoteData);
      toast.success("Cotización editada correctamente");
    } catch (error) {
      console.error("Error completo:", error);
      toast.error(error.message);
    }
  };

  // Función para abrir el diálogo de detalles de cotizaciones
  const handleClickDetails = async (quote) => {
    await handleGetQuote(quote.id);
    setOpenDetails(true);
  };

  const handleClickExport = async (quote) => {
    try {
      const enrichedQuote = await handleGetQuote(quote.id);
      setQuoteToExport(enrichedQuote);
      setOpenRenameDialog(true);
      handleMenuClose();
    } catch (error) {
      toast.error("Error al preparar la cotización a exportar");
    }
  };

  const handleDownloadPDF = async (filename) => {
    try {
      const pdf = await createQuotePDF(quoteToExport, handleGetProduct);
      pdf.save(`${filename}.pdf`);
      setOpenRenameDialog(false);
      setQuoteToExport(null);
      setPdfName("");
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleClickConcepts = (quote) => {
    try {
      setConceptsToExport(quote);
      setOpenConceptsRenameDialog(true);
      handleMenuClose();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleDownloadConcepts = async (filename) => {
    try {
      const pdf = await createConceptsCatalogPDF(conceptsToExport, handleGetProduct);
      pdf.save(`${filename}.pdf`);
      setOpenConceptsRenameDialog(false);
      setConceptsToExport(null);
      setPdfName("");
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Función para ordenar las cotizaciones por folio
  const handleSortFolio = () => {
    const sorted = [...allQuotes].sort((a, b) => {
      const folioA = a.folio || "";
      const folioB = b.folio || "";

      if (folioOrder === "asc") {
        return folioA.localeCompare(folioB);
      } else {
        return folioB.localeCompare(folioA);
      }
    });
    setQuotes(sorted);
    setFolioOrder(folioOrder === "asc" ? "desc" : "asc");
  };

  // Función para ordenar las cotizaciones por fecha de registro
  const handleSortRegisterDate = () => {
    const sorted = [...allQuotes].sort((a, b) => {
      const dateA = a.created_at || "";
      const dateB = b.created_at || "";

      if (registerDate === "asc") {
        return dateA.localeCompare(dateB);
      } else {
        return dateB.localeCompare(dateA);
      }
    });
    setQuotes(sorted);
    setRegisterDate(registerDate === "asc" ? "desc" : "asc");
  };

  // Función para ordenar las cotizaciones por fecha de vencimiento
  const handleSortExpirationDate = () => {
    const sorted = [...allQuotes].sort((a, b) => {
      const dateA = a.fecha_vencimiento || "";
      const dateB = b.fecha_vencimiento || "";

      if (expirationDate === "asc") {
        return dateA.localeCompare(dateB);
      } else {
        return dateB.localeCompare(dateA);
      }
    });
    setQuotes(sorted);
    setExpirationDate(expirationDate === "asc" ? "desc" : "asc");
  };

  // Función para ordenar las cotizaciones por cliente
  const handleSortClient = () => {
    const sorted = [...allQuotes].sort((a, b) => {
      const clientA = a.cliente_nombre || "";
      const clientB = b.cliente_nombre || "";

      if (clientOrder === "asc") {
        return clientA.localeCompare(clientB);
      } else {
        return clientB.localeCompare(clientA);
      }
    });
    setQuotes(sorted);
    setClientOrder(clientOrder === "asc" ? "desc" : "asc");
  };

  // Función para ordenar las cotizaciones por emisor
  const handleSortEmitter = () => {
    const sorted = [...allQuotes].sort((a, b) => {
      const emitterA = a.emisor_nombre || "";
      const emitterB = b.emisor_nombre || "";

      if (emitterOrder === "asc") {
        return emitterA.localeCompare(emitterB);
      } else {
        return emitterB.localeCompare(emitterA);
      }
    });
    setQuotes(sorted);
    setEmitterOrder(emitterOrder === "asc" ? "desc" : "asc");
  };

  // Función para ordenar por productos
  const handleSortProducts = () => {
    const sorted = [...allQuotes].sort((a, b) => {
      const productsA = a.totalProductos || 0;
      const productsB = b.totalProductos || 0;

      if (productOrder === "asc") {
        return productsA - productsB;
      } else {
        return productsB - productsA;
      }
    });
    setQuotes(sorted);
    setProductOrder(productOrder === "asc" ? "desc" : "asc");
  };

  // Función para ordenar por subtotal
  const handleSortSubtotal = () => {
    const sorted = [...allQuotes].sort((a, b) => {
      const subtotalA = parseFloat(a.subtotal) || 0;
      const subtotalB = parseFloat(b.subtotal) || 0;

      if (subtotalOrder === "asc") {
        return subtotalA - subtotalB;
      } else {
        return subtotalB - subtotalA;
      }
    });
    setQuotes(sorted);
    setSubtotalOrder(subtotalOrder === "asc" ? "desc" : "asc");
  };

  // Función para ordenar por iva
  const handleSortIva = () => {
    const sorted = [...allQuotes].sort((a, b) => {
      const ivaA = parseFloat(a.iva) || 0;
      const ivaB = parseFloat(b.iva) || 0;

      if (ivaOrder === "asc") {
        return ivaA - ivaB;
      } else {
        return ivaB - ivaA;
      }
    });
    setQuotes(sorted);
    setIvaOrder(ivaOrder === "asc" ? "desc" : "asc");
  };

  // Función para ordenar por isrRet
  const handleSortIsrRet = () => {
    const sorted = [...allQuotes].sort((a, b) => {
      const isrRetA = parseFloat(a.isr_ret) || 0;
      const isrRetB = parseFloat(b.isr_ret) || 0;

      if (isrRet === "asc") {
        return isrRetA - isrRetB;
      } else {
        return isrRetB - isrRetA;
      }
    });
    setQuotes(sorted);
    setIsrRet(isrRet === "asc" ? "desc" : "asc");
  };

  // Función para ordenar por total
  const handleSortTotal = () => {
    const sorted = [...allQuotes].sort((a, b) => {
      const totalA = parseFloat(a.total) || 0;
      const totalB = parseFloat(b.total) || 0;

      if (totalOrder === "asc") {
        return totalA - totalB;
      } else {
        return totalB - totalA;
      }
    });
    setQuotes(sorted);
    setTotalOrder(totalOrder === "asc" ? "desc" : "asc");
  };

  // Menu de acciones
  const handleMenuOpen = (event, quote) => {
    setAnchorEl(event.currentTarget);
    setSelectedQuote(quote);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedQuote(null);
  };

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

  const tableCellStyles = {
    backgroundColor: "#f1f1f1",
    cursor: "pointer",
    fontSize: "0.8rem",
    fontWeight: "bold",
  };

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          flexWrap: "wrap",
          justifyContent: "space-between",
          alignItems: { xs: "stretch", sm: "center" },
          gap: { xs: 2, sm: 1 },
          margin: 2,
          "& > *": {
            width: { xs: "100%", sm: "auto" },
          },
        }}
      >
        <Typography
          variant="h5"
          component="h2"
          sx={{
            textAlign: { xs: "center", sm: "left" },
            marginBottom: { xs: 1, sm: 0 },
          }}
        >
          Cotizaciones
        </Typography>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            width: { xs: "100%", sm: "auto" },
            justifyContent: { xs: "center", sm: "flex-end" },
          }}
        >
          <SearchBar
            searchTerm={searchTerm}
            setSearchTerm={handleSearchChange}
            onAddContent={handleClickDialogQuote}
          />
          <AddQuotesComponent
            open={open}
            setOpen={setOpen}
            onAddQuotes={handleAddQuote}
            onEditQuotes={handleUpdate}
            initialData={editingQuote}
            onClose={() => setEditingQuote(null)}
          />
        </Box>
      </Box>
      <TableContainer
        sx={{
          height: "auto",
          maxHeight: "calc(100vh - 250px)", // Reducimos para dar espacio a la paginación
          overflow: "auto",
          "@media (max-width: 600px)": {
            maxHeight: "calc(100vh - 300px)",
          },
        }}
      >
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell
                sx={tableCellStyles}
                align="justify"
                onClick={handleSortFolio}
              >
                Folio
              </TableCell>
              <TableCell
                sx={tableCellStyles}
                align="justify"
                onClick={handleSortRegisterDate}
              >
                Fecha Registro
              </TableCell>
              <TableCell
                sx={tableCellStyles}
                align="justify"
                onClick={handleSortExpirationDate}
              >
                Fecha Vencimiento
              </TableCell>
              <TableCell
                sx={tableCellStyles}
                align="justify"
                onClick={handleSortEmitter}
              >
                Emisor
              </TableCell>
              <TableCell
                sx={tableCellStyles}
                align="justify"
                onClick={handleSortClient}
              >
                Cliente
              </TableCell>
              <TableCell
                sx={tableCellStyles}
                align="justify"
                onClick={handleSortProducts}
              >
                Prod.
              </TableCell>
              <TableCell
                sx={tableCellStyles}
                align="justify"
                onClick={handleSortSubtotal}
              >
                Subtotal
              </TableCell>
              <TableCell
                sx={tableCellStyles}
                align="justify"
                onClick={handleSortIva}
              >
                IVA
              </TableCell>
              <TableCell
                sx={tableCellStyles}
                align="justify"
                onClick={handleSortIsrRet}
              >
                Ret. Isr
              </TableCell>
              <TableCell
                sx={tableCellStyles}
                align="justify"
                onClick={handleSortTotal}
              >
                Total
              </TableCell>
              <TableCell sx={tableCellStyles} align="justify">
                Acciones
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={11} align="center">
                  <Loader />
                </TableCell>
              </TableRow>
            ) : filteredQuotes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={11} align="center">
                  No hay cotizaciones
                </TableCell>
              </TableRow>
            ) : (
              filteredQuotes.map((quote) => (
                <TableRow key={quote.id}>
                  <TableCell align="justify">{quote.folio}</TableCell>
                  <TableCell align="justify">
                    {formatDateTime(quote.created_at)}
                  </TableCell>
                  <TableCell align="justify">
                    {formatDate(quote.fecha_vencimiento)}
                  </TableCell>
                  <TableCell align="justify">{quote.emisor_nombre}</TableCell>
                  <TableCell align="justify">{quote.cliente_nombre}</TableCell>
                  <TableCell align="justify">{quote.totalProductos}</TableCell>
                  <TableCell align="justify">{`$${quote.subtotal}`}</TableCell>
                  <TableCell align="justify">{`$${quote.iva}`}</TableCell>
                  <TableCell align="justify">{`$${quote?.isr_ret}`}</TableCell>
                  <TableCell align="justify">{`$${quote.total}`}</TableCell>
                  <TableCell align="justify">
                    <IconButton
                      size="small"
                      onClick={(event) => handleMenuOpen(event, quote)}
                    >
                      <MoreVert />
                    </IconButton>
                    <Menu
                      anchorEl={anchorEl}
                      open={Boolean(anchorEl) && selectedQuote?.id === quote.id}
                      onClose={handleMenuClose}
                    >
                      <MenuItem
                        onClick={() => {
                          handleClickDetails(quote);
                          handleMenuClose();
                        }}
                      >
                        <ListItemIcon>
                          <RemoveRedEye fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>Ver detalles</ListItemText>
                      </MenuItem>
                      <MenuItem
                        onClick={() => {
                          handleEditQuote(selectedQuote);
                          handleMenuClose();
                        }}
                      >
                        <ListItemIcon>
                          <Edit fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>Editar cotización</ListItemText>
                      </MenuItem>
                      <MenuItem
                        onClick={() => {
                          handleClickExport(selectedQuote);
                        }}
                      >
                        <ListItemIcon>
                          <PictureAsPdf fontSize="small" color="error" />
                        </ListItemIcon>
                        <ListItemText>Exportar cotización</ListItemText>
                      </MenuItem>
                      <MenuItem
                        onClick={() => {
                          handleClickConcepts(selectedQuote);
                          handleMenuClose();
                        }}
                      >
                        <ListItemIcon>
                          <MenuBook fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>Cátalogo de Conceptos</ListItemText>
                      </MenuItem>
                      <MenuItem
                        onClick={() => {
                          handleDeleteDialog(selectedQuote);
                          handleMenuClose();
                        }}
                      >
                        <ListItemIcon>
                          <DeleteIcon fontSize="small" color="error" />
                        </ListItemIcon>
                        <ListItemText sx={{ color: "error.main" }}>
                          Borrar
                        </ListItemText>
                      </MenuItem>
                    </Menu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      
      {/* Componente de paginación */}
      <TablePagination
        component="div"
        count={totalQuotes}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[5, 10, 25, 50]}
        labelRowsPerPage="Filas por página:"
        labelDisplayedRows={({ from, to, count }) =>
          `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`
        }
        sx={{
          ".MuiTablePagination-toolbar": {
            flexWrap: "wrap",
            paddingLeft: 2,
          },
          ".MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows": {
            margin: 1,
          },
          ".MuiTablePagination-actions": { marginLeft: 2 }
        }}
      />

      {/* Detalles de una cotización */}
      <QuotesDetailComponent
        open={openDetails}
        setOpen={setOpenDetails}
        quote={selectedQuote}
      />

      {/* Borrar Cotización */}
      <DeleteDialogConfirmComponent
        title="Eliminar Cotización"
        message="¿Estás seguro de que deseas eliminar esta cotización?"
        deleteDialogOpen={deleteDialogOpen}
        handleCloseDeleteDialog={handleCloseDeleteDialog}
        handleDelete={handleDeleteQuote}
      />

      {/* Exportar cotización */}
      <RenamePDFDialog
        open={openRenameDialog}
        onClose={() => setOpenRenameDialog(false)}
        onDownload={handleDownloadPDF}
        defaultFileName={
          quoteToExport ? `Cotización-${quoteToExport.folio}` : ""
        }
      />
      {/* Exportar catálogo de conceptos */}
      <RenamePDFDialog
        open={openConceptsRenameDialog}
        onClose={() => setOpenConceptsRenameDialog(false)}
        onDownload={handleDownloadConcepts}
        defaultFileName={
          conceptsToExport ? `Catálogo-Conceptos-${conceptsToExport.folio}` : ""
        }
      />
    </>
  );
};