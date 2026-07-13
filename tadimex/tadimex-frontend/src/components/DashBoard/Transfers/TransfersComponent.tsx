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
  Chip,
  Card,
  CardContent,
  Grid,
} from "@mui/material";
import React, { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import SearchBar from "../../SearchBar";
import { Edit, RemoveRedEye, MoreVert } from "@mui/icons-material";
import DeleteIcon from "@mui/icons-material/Delete";
import { DeleteDialogConfirmComponent } from "../DeleteDialogConfirmComponent";
import Loader from "../../Loader";

export const TransfersComponent = () => {
  // ============= DATOS MOCKUP =============
  
  // Historial de Transferencias (datos completos)
  const [historialTransferencias, setHistorialTransferencias] = useState([
    {
      id: 1,
      product: "Product A",
      cantidad: 100,
      origenAlmacen: "Almacén Central",
      destinoAlmacen: "Almacén Norte",
      fechaTransferencia: "2024-01-15",
      estado: "Completada",
      responsable: "Juan Pérez",
      numeroTransferencia: "TRF-001"
    },
    {
      id: 2,
      product: "Product B", 
      cantidad: 75,
      origenAlmacen: "Almacén Sur",
      destinoAlmacen: "Almacén Este",
      fechaTransferencia: "2024-01-14",
      estado: "Completada",
      responsable: "María García",
      numeroTransferencia: "TRF-002"
    },
    {
      id: 3,
      product: "Product C",
      cantidad: 200,
      origenAlmacen: "Almacén Norte",
      destinoAlmacen: "Almacén Central",
      fechaTransferencia: "2024-01-13",
      estado: "Completada",
      responsable: "Carlos López",
      numeroTransferencia: "TRF-003"
    },
    {
      id: 4,
      product: "Product D",
      cantidad: 50,
      origenAlmacen: "Almacén Este",
      destinoAlmacen: "Almacén Sur",
      fechaTransferencia: "2024-01-12",
      estado: "Completada",
      responsable: "Ana Martínez",
      numeroTransferencia: "TRF-004"
    }
  ]);

  // Transferencias Pendientes
  const [transferenciasPendientes, setTransferenciasPendientes] = useState([
    {
      id: 1,
      product: "Product E",
      cantidad: 120,
      origenAlmacen: "Almacén Central",
      destinoAlmacen: "Almacén Norte",
      fechaSolicitud: "2024-01-16",
      numeroTransferencia: "TRF-005"
    },
    {
      id: 2,
      product: "Product F",
      cantidad: 80,
      origenAlmacen: "Almacén Sur",
      destinoAlmacen: "Almacén Este",
      fechaSolicitud: "2024-01-15",
      numeroTransferencia: "TRF-006"
    },
    {
      id: 3,
      product: "Product G",
      cantidad: 150,
      origenAlmacen: "Almacén Norte",
      destinoAlmacen: "Almacén Central",
      fechaSolicitud: "2024-01-14",
      numeroTransferencia: "TRF-007"
    }
  ]);

  // Transferencias en Tránsito
  const [transferenciasTransito, setTransferenciasTransito] = useState([
    {
      id: 1,
      product: "Product H",
      cantidad: 90,
      origenAlmacen: "Almacén Central",
      destinoAlmacen: "Almacén Sur",
      fechaEnvio: "2024-01-17",
      fechaEstimadaLlegada: "2024-01-19",
      numeroTransferencia: "TRF-008",
      transportista: "LogiTrans S.A."
    },
    {
      id: 2,
      product: "Product I",
      cantidad: 60,
      origenAlmacen: "Almacén Este",
      destinoAlmacen: "Almacén Norte",
      fechaEnvio: "2024-01-16",
      fechaEstimadaLlegada: "2024-01-18",
      numeroTransferencia: "TRF-009",
      transportista: "RápidoCargo Ltda."
    }
  ]);

  // ============= ESTADOS GENERALES =============
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleteType, setDeleteType] = useState("");
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [filteredTransferencias, setFilteredTransferencias] = useState(historialTransferencias);

  // Estados solo para la tabla grande (historial)
  const [historialAnchorEl, setHistorialAnchorEl] = useState(null);
  const [historialSelectedItem, setHistorialSelectedItem] = useState(null);

  // ============= FUNCIONES UTILITARIAS =============
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const getEstadoColor = (estado) => {
    switch (estado) {
      case "Completada":
        return "#4caf50";
      case "Pendiente":
        return "#ff9800";
      case "En Tránsito":
        return "#2196f3";
      case "Cancelada":
        return "#f44336";
      default:
        return "#4caf50";
    }
  };

  // ============= FUNCIONES DE TRANSFERENCIAS =============
  const handleSearchChange = (newSearchTerm) => {
    setSearchTerm(newSearchTerm);
    if(newSearchTerm) {
      const filteredResults = historialTransferencias.filter(
        (transferencia) =>
          transferencia.product.toLowerCase().includes(newSearchTerm.toLowerCase()) ||
          transferencia.numeroTransferencia.toLowerCase().includes(newSearchTerm.toLowerCase()) ||
          transferencia.origenAlmacen.toLowerCase().includes(newSearchTerm.toLowerCase()) ||
          transferencia.destinoAlmacen.toLowerCase().includes(newSearchTerm.toLowerCase()) ||
          transferencia.responsable.toLowerCase().includes(newSearchTerm.toLowerCase()) ||
          transferencia.estado.toLowerCase().includes(newSearchTerm.toLowerCase())
      );
      setFilteredTransferencias(filteredResults);
      
      if(filteredResults.length > 0) {
        const firstMatchingTransferencia = filteredResults[0];
        const indexInAllFiltered = historialTransferencias.findIndex(
          (transferencia) => transferencia.id === firstMatchingTransferencia.id
        );
        if(indexInAllFiltered !== -1) {
          const newPage = Math.floor(indexInAllFiltered / rowsPerPage);
          setPage(newPage);
        }
      }
    } else {
      setFilteredTransferencias(historialTransferencias);
    }
  };

  const handleClickDialogTransferencia = () => {
    setOpen(true);
  };

  const handleDeleteDialog = (item, type) => {
    setItemToDelete(item);
    setDeleteType(type);
    setDeleteDialogOpen(true);
  };

  const handleDeleteItem = async () => {
    try {
      if (deleteType === "historial") {
        setHistorialTransferencias(prev => prev.filter(item => item.id !== itemToDelete.id));
        setFilteredTransferencias(prev => prev.filter(item => item.id !== itemToDelete.id));
        toast.success("Transferencia eliminada correctamente");
      } else if (deleteType === "pendientes") {
        setTransferenciasPendientes(prev => prev.filter(item => item.id !== itemToDelete.id));
        toast.success("Transferencia pendiente eliminada correctamente");
      } else if (deleteType === "transito") {
        setTransferenciasTransito(prev => prev.filter(item => item.id !== itemToDelete.id));
        toast.success("Transferencia en tránsito eliminada correctamente");
      }
      setDeleteDialogOpen(false);
      setItemToDelete(null);
      setDeleteType("");
    } catch (error) {
      toast.error("Error al eliminar transferencia");
    }
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setItemToDelete(null);
    setDeleteType("");
  };

  // Menu de acciones para tabla grande
  const handleHistorialMenuOpen = (event, item) => {
    setHistorialAnchorEl(event.currentTarget);
    setHistorialSelectedItem(item);
  };

  const handleHistorialMenuClose = () => {
    setHistorialAnchorEl(null);
    setHistorialSelectedItem(null);
  };

  // Paginación
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Calcular transferencias de la página actual
  const currentTransferencias = filteredTransferencias.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // ============= COMPONENTE TABLA SIMPLE =============
  const SimpleTable = ({ title, data, columns, tableType }) => {
    const [localAnchorEl, setLocalAnchorEl] = useState(null);
    const [localSelectedItem, setLocalSelectedItem] = useState(null);

    const handleLocalMenuOpen = (event, item) => {
      setLocalAnchorEl(event.currentTarget);
      setLocalSelectedItem(item);
    };

    const handleLocalMenuClose = () => {
      setLocalAnchorEl(null);
      setLocalSelectedItem(null);
    };

    return (
      <Card sx={{ borderRadius: 2, border: "1px solid #e0e0e0", height: "100%" }}>
        <CardContent sx={{ p: 2.5 }}>
          <Typography variant="h6" component="h3" sx={{ mb: 2, textAlign: "left" }}>
            {title}
          </Typography>
          <TableContainer sx={{ maxHeight: 300, overflow: "auto" }}>
            <Table sx={{ minWidth: 400 }} size="small">
              <TableHead>
                <TableRow>
                  {columns.map((column, index) => (
                    <TableCell
                      key={index}
                      sx={{
                        fontWeight: 600,
                        color: "text.secondary",
                        fontSize: "0.775rem",
                        borderBottom: "2px solid #f1f1f1",
                      }}
                      align={column.align || "left"}
                    >
                      {column.label}
                    </TableCell>
                  ))}
                  <TableCell
                    sx={{
                      fontWeight: 600,
                      color: "text.secondary",
                      fontSize: "0.775rem",
                      borderBottom: "2px solid #f1f1f1",
                    }}
                    align="center"
                  >
                    Acciones
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={columns.length + 1} align="center">
                      No hay datos registrados
                    </TableCell>
                  </TableRow>
                ) : (
                  data.map((row) => (
                    <TableRow key={row.id} sx={{ borderBottom: "1px solid #f1f1f1" }}>
                      {columns.map((column, index) => (
                        <TableCell
                          key={index}
                          sx={{
                            fontWeight: column.key === 'product' || column.key === 'numeroTransferencia' ? 500 : 400,
                            color: column.key === 'product' || column.key === 'numeroTransferencia' ? "text.primary" : "text.secondary",
                            fontSize: "0.775rem"
                          }}
                          align={column.align || "left"}
                        >
                          {column.render ? column.render(row[column.key], row) : row[column.key]}
                        </TableCell>
                      ))}
                      <TableCell align="center">
                        <IconButton size="small" onClick={(event) => handleLocalMenuOpen(event, row)}>
                          <MoreVert fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          
          {/* Menu específico para esta tabla con estado local */}
          <Menu
            anchorEl={localAnchorEl}
            open={Boolean(localAnchorEl)}
            onClose={handleLocalMenuClose}
          >
            <MenuItem onClick={() => { handleLocalMenuClose(); }}>
              <ListItemIcon>
                <RemoveRedEye fontSize="small" />
              </ListItemIcon>
              <ListItemText>Ver detalles</ListItemText>
            </MenuItem>
            <MenuItem onClick={() => { handleLocalMenuClose(); }}>
              <ListItemIcon>
                <Edit fontSize="small" />
              </ListItemIcon>
              <ListItemText>Editar</ListItemText>
            </MenuItem>
            <MenuItem onClick={() => { 
              handleDeleteDialog(localSelectedItem, tableType); 
              handleLocalMenuClose(); 
            }}>
              <ListItemIcon>
                <DeleteIcon fontSize="small" color="error" />
              </ListItemIcon>
              <ListItemText sx={{ color: "error.main" }}>Borrar</ListItemText>
            </MenuItem>
          </Menu>
        </CardContent>
      </Card>
    );
  };

  // ============= DEFINICIÓN DE COLUMNAS =============
  const historialColumns = [
    { key: 'numeroTransferencia', label: 'N° Transferencia', align: 'left' },
    { key: 'product', label: 'Producto', align: 'left' },
    { key: 'cantidad', label: 'Cantidad', align: 'center', render: (value) => value.toLocaleString() },
    { key: 'origenAlmacen', label: 'Origen', align: 'center' },
    { key: 'destinoAlmacen', label: 'Destino', align: 'center' },
    { key: 'fechaTransferencia', label: 'Fecha', align: 'center', render: (value) => formatDate(value) },
    { key: 'responsable', label: 'Responsable', align: 'center' },
    { 
      key: 'estado', 
      label: 'Estado', 
      align: 'center', 
      render: (value) => (
        <Chip
          label={value}
          size="small"
          sx={{
            backgroundColor: `${getEstadoColor(value)}15`,
            color: getEstadoColor(value),
            fontWeight: 500,
            fontSize: "0.65rem"
          }}
        />
      )
    }
  ];

  const pendientesColumns = [
    { key: 'numeroTransferencia', label: 'N° Transferencia', align: 'left' },
    { key: 'product', label: 'Producto', align: 'left' },
    { key: 'cantidad', label: 'Cantidad', align: 'center', render: (value) => value.toLocaleString() },
    { key: 'origenAlmacen', label: 'Origen', align: 'center' },
    { key: 'destinoAlmacen', label: 'Destino', align: 'center' },
    { key: 'fechaSolicitud', label: 'Fecha Solicitud', align: 'center', render: (value) => formatDate(value) }
  ];

  const transitoColumns = [
    { key: 'numeroTransferencia', label: 'N° Transferencia', align: 'left' },
    { key: 'product', label: 'Producto', align: 'left' },
    { key: 'cantidad', label: 'Cantidad', align: 'center', render: (value) => value.toLocaleString() },
    { key: 'origenAlmacen', label: 'Origen', align: 'center' },
    { key: 'destinoAlmacen', label: 'Destino', align: 'center' },
    { key: 'transportista', label: 'Transportista', align: 'center' },
    { key: 'fechaEstimadaLlegada', label: 'Llegada Estimada', align: 'center', render: (value) => formatDate(value) }
  ];

  return (
    <Box sx={{ p: 3 }}>
      <ToastContainer position="top-right" autoClose={3000} />

      {/* FILA 1: HISTORIAL COMPLETO DE TRANSFERENCIAS CON SEARCHBAR */}
      <Box sx={{ mb: 3 }}>
        <Card sx={{ borderRadius: 2, border: "1px solid #e0e0e0" }}>
          <CardContent sx={{ p: 2.5 }}>
            {/* Header con SearchBar */}
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                justifyContent: "space-between",
                alignItems: { xs: "stretch", sm: "center" },
                gap: { xs: 2, sm: 1 },
                mb: 3,
              }}
            >
              <Typography variant="h5" component="h2" sx={{ textAlign:"left" }}>
                Historial de Transferencias
              </Typography>
              <Box sx={{ width: { xs: "100%", sm: "auto" } }}>
                <SearchBar
                  searchTerm={searchTerm}
                  setSearchTerm={handleSearchChange}
                  onAddContent={handleClickDialogTransferencia}
                />
              </Box>
            </Box>

            {/* Tabla de Historial */}
            <TableContainer sx={{ maxHeight: "calc(40vh)", overflow: "auto" }}>
              <Table sx={{ minWidth: 900 }}>
                <TableHead>
                  <TableRow>
                    {historialColumns.map((column, index) => (
                      <TableCell
                        key={index}
                        sx={{
                          fontWeight: 600,
                          color: "text.secondary",
                          fontSize: "0.875rem",
                          borderBottom: "2px solid #f1f1f1",
                        }}
                        align={column.align || "left"}
                      >
                        {column.label}
                      </TableCell>
                    ))}
                    <TableCell
                      sx={{
                        fontWeight: 600,
                        color: "text.secondary",
                        fontSize: "0.875rem",
                        borderBottom: "2px solid #f1f1f1",
                      }}
                      align="center"
                    >
                      Acciones
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={9} align="center">
                        <Loader />
                      </TableCell>
                    </TableRow>
                  ) : currentTransferencias.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} align="center">
                        {searchTerm ? "No se encontraron transferencias" : "No hay transferencias registradas"}
                      </TableCell>
                    </TableRow>
                  ) : (
                    currentTransferencias.map((transferencia) => (
                      <TableRow key={transferencia.id} sx={{ borderBottom: "1px solid #f1f1f1" }}>
                        {historialColumns.map((column, index) => (
                          <TableCell
                            key={index}
                            sx={{
                              fontWeight: column.key === 'product' || column.key === 'numeroTransferencia' ? 500 : 400,
                              color: column.key === 'product' || column.key === 'numeroTransferencia' ? "text.primary" : "text.secondary",
                            }}
                            align={column.align || "left"}
                          >
                            {column.render ? column.render(transferencia[column.key], transferencia) : transferencia[column.key]}
                          </TableCell>
                        ))}
                        <TableCell align="center">
                          <IconButton size="small" onClick={(event) => handleHistorialMenuOpen(event, transferencia)}>
                            <MoreVert />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Paginación */}
            <TablePagination
              component="div"
              count={filteredTransferencias.length}
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
                borderTop: "1px solid #f1f1f1",
                mt: 2,
                pt: 2,
                ".MuiTablePagination-toolbar": {
                  flexWrap: "wrap",
                  paddingLeft: 0,
                },
                ".MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows":
                  {
                    margin: 1,
                    color: "text.secondary",
                    fontWeight: 500,
                  },
                ".MuiTablePagination-actions": { marginLeft: 2 },
              }}
            />
          </CardContent>
        </Card>
      </Box>

      {/* FILA 2: PENDIENTES Y EN TRÁNSITO */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <SimpleTable
            title="Transferencias Pendientes"
            data={transferenciasPendientes}
            columns={pendientesColumns}
            tableType="pendientes"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <SimpleTable
            title="Transferencias en Tránsito"
            data={transferenciasTransito}
            columns={transitoColumns}
            tableType="transito"
          />
        </Grid>
      </Grid>

      {/* Menu de Acciones para Historial */}
      <Menu
        anchorEl={historialAnchorEl}
        open={Boolean(historialAnchorEl)}
        onClose={handleHistorialMenuClose}
      >
        <MenuItem onClick={() => { handleHistorialMenuClose(); }}>
          <ListItemIcon>
            <RemoveRedEye fontSize="small" />
          </ListItemIcon>
          <ListItemText>Ver detalles</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { handleHistorialMenuClose(); }}>
          <ListItemIcon>
            <Edit fontSize="small" />
          </ListItemIcon>
          <ListItemText>Editar</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { handleDeleteDialog(historialSelectedItem, "historial"); handleHistorialMenuClose(); }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText sx={{ color: "error.main" }}>Borrar</ListItemText>
        </MenuItem>
      </Menu>

      {/* Dialog de Eliminación */}
      <DeleteDialogConfirmComponent
        title="Eliminar Transferencia"
        message="¿Estás seguro de que deseas eliminar esta transferencia?"
        deleteDialogOpen={deleteDialogOpen}
        handleCloseDeleteDialog={handleCloseDeleteDialog}
        handleDelete={handleDeleteItem}
      />
    </Box>
  );
};