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
import React, { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import SearchBar from "../../SearchBar";
import { Edit, RemoveRedEye, MoreVert, ToggleOff, ToggleOn } from "@mui/icons-material";
import DeleteIcon from "@mui/icons-material/Delete";
import { DeleteDialogConfirmComponent } from "../DeleteDialogConfirmComponent";
import Loader from "../../Loader";
import { useEnterprise } from "../../../context/EnterpriseContext";
import { AddSuppliersComponent } from './AddSuppliersComponent';
import { SuppliersDetailComponent } from './SuppliersDetailComponent';
import { useSuppliers } from "../../../hooks/Suppliers/useSuppliers";

export const SuppliersComponent = () => {

  const {selectedEnterprise} = useEnterprise();

  //Hook de proveedores CAMBIAR
  const {
    filteredSuppliers,
    allFilteredSuppliers,
    setSuppliers,
    selectedSupplier,
    setSelectedSupplier,
    handleGetSupplier,
    handleDeleteSupplier: deleteSupplierAPI,
    handleCreateSupplier,
    handleUpdateSupplier,
    handleToggleSupplierStatus,
    loading,
    page,
    setPage,
    rowsPerPage,
    totalSuppliers,
    handleChangePage,
    handleChangeRowsPerPage,
    searchTerm,
    setSearchTerm,
  } = useSuppliers(selectedEnterprise);


  //Estados
  const [open, setOpen] = useState(false);
  const [openDetails, setOpenDetails] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [supplierToDelete, setSupplierToDelete] = useState(null);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [nameOrder, setNameOrder] = useState("asc");
  const [emailOrder, setEmailOrder] = useState("asc");
  const [phoneNumberOrder, setPhoneNumberOrder] = useState("asc");
  const [observationsOrder, setObservationsOrder] = useState("asc");
  const [anchorEl, setAnchorEl] = useState(null);

  //Filtrar proveedor
  const handleSearchChange = (newSearchTerm) => {
    setSearchTerm(newSearchTerm);
    
    if (newSearchTerm) {
      const filteredResults = allFilteredSuppliers.filter(
        (supplier) =>
          supplier.nombre?.toLowerCase().includes(newSearchTerm.toLowerCase()) ||
          supplier.telefono?.toLowerCase().includes(newSearchTerm.toLowerCase()) ||
          supplier.email?.toLowerCase().includes(newSearchTerm.toLowerCase()) ||
          supplier.observaciones?.toLowerCase().includes(newSearchTerm.toLowerCase())
      );
      
      if (filteredResults.length > 0) {
        // Encontramos el primer proveedor que coincide
        const firstMatchingSupplier = filteredResults[0];
        // Encontramos su índice en la lista completa
        const indexInAllFiltered = allFilteredSuppliers.findIndex(c => c.id === firstMatchingSupplier.id);
        // Calculamos en qué página está
        if (indexInAllFiltered !== -1) {
          const pageOfFirstResult = Math.floor(indexInAllFiltered / rowsPerPage);
          setPage(pageOfFirstResult);
        }
      }
    }
  };

  //Funcion para abrir el dialogo de agregar proveedor
  const handleClickDialogSupplier = () => {
    setEditingSupplier(null);
    setOpen(true);
  };

  //Funcion para agregar un nuevo proveedor
  const handleAddSupplier = async (newSupplier) => {
    try {
      await handleCreateSupplier(newSupplier);
      toast.success("Proveedor agregado correctamente");
    } catch (error) {
      toast.error("Error al agregar el proveedor");
    }
  };

  //Funcion para abrir el dialogo de eliminación de proveedores
  const handleDeleteDialog = (supplier) => {
    setSupplierToDelete(supplier);
    setDeleteDialogOpen(true);
  };

  //Funcion para eliminar un proveedor
  const handleDeleteSupplier = async () => {
    try {
      await deleteSupplierAPI(supplierToDelete.id);
      setSuppliers((prevSuppliers) =>
        prevSuppliers.filter((supplier) => supplier.id !== supplierToDelete.id)
      );
      setDeleteDialogOpen(false);
      setSupplierToDelete(null);
      toast.success("Proveedor eliminado correctamente");
    } catch (error) {
      toast.error(`${error.message}: El proveedor puede estar asociado a una compra, por favor verifique.`);
    }
  };

  //Funcion para cerrar el dialogo de eliminación de proveedores
  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setSupplierToDelete(null);
  };

  //Funcion para abrir el dialogo de editar proveedor
  const handleEditSupplier = (supplier) => {
    setEditingSupplier(supplier);
    setOpen(true);
  };

  //Funcion para editar un proveedor
  const handleUpdate = async (supplierData) => {
    try {
      await handleUpdateSupplier(supplierData.id, supplierData);
      toast.success("Proveedor editado correctamente");
    } catch (error) {
      toast.error(error.message);
    }
  };

  //Funcion para abrir el dialogo de detalles de proveedor
  const handleClickDetails = async (supplier) => {
    await handleGetSupplier(supplier.id);
    setOpenDetails(true);
  };

  //Función para cambiar el estado de un proveedor (activo/inactivo)
  const handleToggleStatus = async (supplier)=> {
    try {
      await handleToggleSupplierStatus(supplier.id);
      toast.success(`Proveedor ${supplier.estado ? "desactivado" : "activado"} correctamente`);
    } catch (error) {
      toast.error(error.message);
    }
  }

  //Funcion para ordenar los clientes por nombre
  const handleSortName = () => {
    const sorted = [...filteredSuppliers].sort((a, b) => {
      const nameA = a.nombre || "";
      const nameB = b.nombre || "";

      if (nameOrder === "asc") {
        return nameA.localeCompare(nameB);
      } else {
        return nameB.localeCompare(nameA);
      }
    });
    setSuppliers(sorted);
    setNameOrder(nameOrder === "asc" ? "desc" : "asc");
  };

  //Funcion para ordenar los clientes por phoneNumber
  const handleSortPhoneNumber = () => {
    const sorted = [...filteredSuppliers].sort((a, b) => {
      const phoneNumberA = a.telefono || "";
      const phoneNumberB = b.telefono || "";

      if (phoneNumberOrder === "asc") {
        return phoneNumberA.localeCompare(phoneNumberB);
      } else {
        return phoneNumberB.localeCompare(phoneNumberA);
      }
    });
    setSuppliers(sorted);
    setPhoneNumberOrder(phoneNumberOrder === "asc" ? "desc" : "asc");
  };

  //Funcion para ordenar los clientes por email
  const handleSortEmail = () => {
    const sorted = [...filteredSuppliers].sort((a, b) => {
      const emailA = a.email || "";
      const emailB = b.email || "";

      if (emailOrder === "asc") {
        return emailA.localeCompare(emailB);
      } else {
        return emailB.localeCompare(emailA);
      }
    });
    setSuppliers(sorted);
    setEmailOrder(emailOrder === "asc" ? "desc" : "asc");
  };

  //Funcion para ordenar los clientes por observaciones
  const handleSortObservations = () => {
    const sorted = [...filteredSuppliers].sort((a, b) => {
      const observationsA = a.observaciones || "";
      const observationsB = b.observaciones || "";

      if (observationsOrder === "asc") {
        return observationsA.localeCompare(observationsB);
      } else {
        return observationsB.localeCompare(observationsA);
      }
    });
    setSuppliers(sorted);
    setObservationsOrder(observationsOrder === "asc" ? "desc" : "asc");
  };

  //Menu de acciones
  const handleMenuOpen = (event, product) => {
    setAnchorEl(event.currentTarget);
    setSelectedSupplier(product);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedSupplier(null);
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
          Listado de Proveedores
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
            onAddContent={handleClickDialogSupplier}
          />
          <AddSuppliersComponent
            open={open}
            setOpen={setOpen}
            onAddSuppliers={handleAddSupplier}
            onEditSuppliers={handleUpdate}
            initialData={editingSupplier}
            onClose={() => setEditingSupplier(null)}
          />
        </Box>
      </Box>
      <TableContainer
        sx={{
          height: "auto",
          maxHeight: "calc(100vh - 250px)",
          overflow: "auto",
          "@media (max-width: 600px)": {
            maxHeight: "calc(100vh - 250px)",
          },
        }}
      >
        {" "}
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell
                sx={{ backgroundColor: "#f1f1f1", cursor: "pointer" }}
                align="justify"
                onClick={handleSortName}
              >
                Nombre
              </TableCell>
              <TableCell
                sx={{ backgroundColor: "#f1f1f1", cursor: "pointer" }}
                align="justify"
                onClick={handleSortPhoneNumber}
              >
                Telefonos
              </TableCell>
              <TableCell
                sx={{ backgroundColor: "#f1f1f1", cursor: "pointer" }}
                align="justify"
                onClick={handleSortEmail}
              >
                Email
              </TableCell>
              <TableCell
                sx={{ backgroundColor: "#f1f1f1", cursor: "pointer" }}
                align="justify"
                onClick={handleSortObservations}
              >
                Observaciones
              </TableCell>
              <TableCell
                sx={{ backgroundColor: "#f1f1f1", cursor: "pointer" }}
                align="justify"
                onClick={handleSortObservations}
              >
                Estado del Proveedor
              </TableCell>
              <TableCell
                sx={{ backgroundColor: "#f1f1f1", cursor: "pointer" }}
                align="justify"
              >
                Acciones
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Loader />
                </TableCell>
              </TableRow>
            ) : filteredSuppliers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No hay proveedores
                </TableCell>
              </TableRow>
            ) : (
              filteredSuppliers.map((client) => (
                <TableRow key={client.id}>
                  <TableCell align="justify">{client.nombre}</TableCell>
                  <TableCell align="justify">{client.telefono}</TableCell>
                  <TableCell align="justify">{client.email}</TableCell>
                  <TableCell align="justify">{client?.observaciones || ""}</TableCell>
                  <TableCell align="justify">
                    {client.active ? "Activo" : "Inactivo"}
                  </TableCell>
                  <TableCell align="justify">
                    <IconButton
                      size="small"
                      onClick={(event) => handleMenuOpen(event, client)}
                    >
                      <MoreVert />
                    </IconButton>
                    <Menu
                      anchorEl={anchorEl}
                      open={
                        Boolean(anchorEl) && selectedSupplier?.id === client.id
                      }
                      onClose={handleMenuClose}
                    >
                      <MenuItem
                        onClick={() => {
                          handleClickDetails(client);
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
                          handleEditSupplier(selectedSupplier);
                          handleMenuClose();
                        }}
                      >
                        <ListItemIcon>
                          <Edit fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>Editar Cliente</ListItemText>
                      </MenuItem>
                      <MenuItem
                        onClick={() => {
                          handleToggleStatus(selectedSupplier);
                          handleMenuClose();
                        }}
                        >
                        <ListItemIcon>
                          {selectedSupplier?.active ? (
                            <ToggleOn fontSize="small" color="error" />
                          ) : (
                            <ToggleOff fontSize="small" color="success" />
                          )}
                        </ListItemIcon>
                        <ListItemText>
                          {selectedSupplier?.active === true ? "Desactivar Proveedor" : "Activar Proveedor"}
                        </ListItemText>
                        </MenuItem>
                      <MenuItem
                        onClick={() => {
                          handleDeleteDialog(selectedSupplier);
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
        count={totalSuppliers}
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

      {/* Detalles de un proveedor */}
      <SuppliersDetailComponent
        open={openDetails}
        setOpen={setOpenDetails}
        supplier={selectedSupplier}
      />

      {/* Borrar Proveedor */}
      <DeleteDialogConfirmComponent
        title="Eliminar Proveedor"
        message="¿Estás seguro de que deseas eliminar este proveedor?"
        deleteDialogOpen={deleteDialogOpen}
        handleCloseDeleteDialog={handleCloseDeleteDialog}
        handleDelete={handleDeleteSupplier}
      />
    </>
  );
};
