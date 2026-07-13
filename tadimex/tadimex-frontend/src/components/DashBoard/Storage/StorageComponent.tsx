import React, { useState, useMemo } from "react";
import {
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Typography,
  Box,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  TablePagination,
} from "@mui/material";
import SearchBar from "../../SearchBar";
import { toast, ToastContainer } from "react-toastify";
import {
  Edit,
  MoreVert,
  RemoveRedEye,
} from "@mui/icons-material";
import DeleteIcon from "@mui/icons-material/Delete";
import { AddStorageComponent } from "./AddStorageComponent";
import { useStorage } from "../../../hooks/Storage/useStorage";
import { DeleteDialogConfirmComponent } from "../DeleteDialogConfirmComponent";
import Loader from "../../Loader";
import { StoragesDetailComponent } from "./StoragesDetailComponent";
import { useBranch } from "../../../context/BranchContext";
import { useEmployee } from "../../../hooks/Employee/useEmployee";

export const StorageComponent = () => {
  const [open, setOpen] = useState(false);
  const [openDetails, setOpenDetails] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [storageToDelete, setStorageToDelete] = useState(null);
  const [editingStorage, setEditingStorage] = useState(null);
  const [typeOrder, setTypeOrder] = useState("asc");
  const [nameOrder, setNameOrder] = useState("asc");
  const [managerOrder, setManagerOrder] = useState("asc");
  const [anchorEl, setAnchorEl] = useState(null);

  // Contexto de sucursal seleccionada
  const { selectedBranch } = useBranch();
  
  const { employees } = useEmployee();

  // Hook de almacenes con paginación
  const {
    filteredStorage,
    allFilteredStorage,
    setStorage,
    selectedStorage,
    setSelectedStorage,
    handleCreateStorage,
    handleDeleteStorage: deleteStorageAPI,
    handleGetStorage,
    handleUpdateStorage,
    loadingStorage,
    page,
    setPage,
    rowsPerPage,
    totalStorage,
    handleChangePage,
    handleChangeRowsPerPage,
    searchTerm,
    setSearchTerm,
  } = useStorage(selectedBranch);

  // Función para filtrar los almacenes según el término de búsqueda
  const filteredData = useMemo(() => {
    if (!searchTerm) {
      // Si no hay término de búsqueda, mostramos todos los almacenes filtrados por sucursal
      return filteredStorage.map(store => {
        const manager = employees.find(emp => emp.id === store.encargado_id);
        return {
          ...store,
          managerName: manager ? `${manager.name} ${manager.last_name}` : 'No asignado'
        };
      });
    }
    
    // Si hay un término de búsqueda, filtramos por nombre, tipo o encargado
    return filteredStorage
      .map(store => {
        const manager = employees.find(emp => emp.id === store.encargado_id);
        return {
          ...store,
          managerName: manager ? `${manager.name} ${manager.last_name}` : 'No asignado'
        };
      })
      .filter(store => 
        store.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        store.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        store.managerName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
  }, [filteredStorage, employees, searchTerm]);

  // Función inteligente para manejar la búsqueda que encuentra la página correcta
  const handleSearchChange = (newSearchTerm) => {
    setSearchTerm(newSearchTerm);
    
    if (newSearchTerm) {
      const allProcessedData = allFilteredStorage.map(store => {
        const manager = employees.find(emp => emp.id === store.encargado_id);
        return {
          ...store,
          managerName: manager ? `${manager.name} ${manager.last_name}` : 'No asignado'
        };
      });
      
      const searchResults = allProcessedData.filter(store => 
        store.type?.toLowerCase().includes(newSearchTerm.toLowerCase()) ||
        store.name?.toLowerCase().includes(newSearchTerm.toLowerCase()) ||
        store.managerName?.toLowerCase().includes(newSearchTerm.toLowerCase())
      );
      
      if (searchResults.length > 0) {
        // Encontramos el primer almacén que coincide
        const firstMatchingStorage = searchResults[0];
        // Encontramos su índice en la lista completa
        const indexInAllFiltered = allProcessedData.findIndex(s => s.id === firstMatchingStorage.id);
        // Calculamos en qué página está
        if (indexInAllFiltered !== -1) {
          const pageOfFirstResult = Math.floor(indexInAllFiltered / rowsPerPage);
          setPage(pageOfFirstResult);
        }
      }
    }
  };

  // Función para abrir el dialogo de crear almacen
  const handleClickDialogStorage = () => {
    setEditingStorage(null);
    setOpen(true);
  };

  // Función para agregar un nuevo almacen
  const handleAddStorage = async (newStorage) => {
    try {
      await handleCreateStorage(newStorage);
      toast.success("Almacen agregado exitosamente");
    } catch (error) {
      toast.error("Error al agregar el almacen");
    }
  };

  // Función para abrir el dialogo de eliminar almacen
  const handleDeleteDialog = (storage) => {
    setStorageToDelete(storage);
    setDeleteDialogOpen(true);
  };

  // Función para eliminar un almacen
  const handleDeleteStorage = async () => {
    try {
      await deleteStorageAPI(storageToDelete.id);
      setStorage((prevStorages) =>
        prevStorages.filter((storage) => storage.id !== storageToDelete.id)
      );
      setDeleteDialogOpen(false);
      setStorageToDelete(null);
      toast.success("Almacen eliminado exitosamente");
    } catch (error) {
      toast.error("Error al eliminar el almacen");
    }
  };

  // Función para cerrar el dialogo de eliminar almacen
  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setStorageToDelete(null);
  };

  // Función para abrir el dialogo de editar almacen
  const handleEditStorage = (storage) => {
    setEditingStorage(storage);
    setOpen(true);
  };

  // Función para editar un almacen
  const handleUpdate = async (storageData) => {
    try {
      await handleUpdateStorage(storageData.id, storageData);
      toast.success("Almacen actualizado exitosamente");
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleClickDetails = async (storage) => {
    await handleGetStorage(storage.id);
    setOpenDetails(true);
  };

  // Función para ordenar los almacenes por tipo
  const handleSortType = () => {
    const sorted = [...allFilteredStorage].sort((a, b) => {
      const typeA = a.type || "";
      const typeB = b.type || "";

      if (typeOrder === "asc") {
        return typeA.localeCompare(typeB);
      } else {
        return typeB.localeCompare(typeA);
      }
    });
    setStorage(sorted);
    setTypeOrder(typeOrder === "asc" ? "desc" : "asc");
  };

  // Función para ordenar los almacenes por nombre
  const handleSortName = () => {
    const sorted = [...allFilteredStorage].sort((a, b) => {
      const nameA = a.name || "";
      const nameB = b.name || "";

      if (nameOrder === "asc") {
        return nameA.localeCompare(nameB);
      } else {
        return nameB.localeCompare(nameA);
      }
    });
    setStorage(sorted);
    setNameOrder(nameOrder === "asc" ? "desc" : "asc");
  };

  // Función para ordenar los almacenes por encargado
  const handleSortManager = () => {
    const sorted = [...allFilteredStorage].sort((a, b) => {
      const managerA = employees.find(emp => emp.id === a.encargado_id)?.name || '';
      const managerB = employees.find(emp => emp.id === b.encargado_id)?.name || '';
   
      if (managerOrder === "asc") {
        return managerA.localeCompare(managerB);
      } else {
        return managerB.localeCompare(managerA);
      }
    });
    setStorage(sorted);
    setManagerOrder(managerOrder === "asc" ? "desc" : "asc");
  };

  // Menu de acciones
  const handleMenuOpen = (event, storage) => {
    setAnchorEl(event.currentTarget);
    setSelectedStorage(storage);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedStorage(null);
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
          Almacenes
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
            onAddContent={handleClickDialogStorage}
          />
          <AddStorageComponent
            open={open}
            setOpen={setOpen}
            onAddStorage={handleAddStorage}
            onEditStorage={handleUpdate}
            initialData={editingStorage}
            onClose={()=>setEditingStorage(null)}
          />
        </Box>
      </Box>
      <TableContainer
        sx={{
          height: "auto",
          maxHeight: "calc(100vh - 250px)", // Reducimos un poco para la paginación
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
                sx={{ backgroundColor: "#f1f1f1", cursor: "pointer" }}
                align="justify"
                onClick={handleSortType}
              >
                Tipo
              </TableCell>
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
                onClick={handleSortManager}
              >
                Encargado
              </TableCell>
              <TableCell sx={{ backgroundColor: "#f1f1f1" }} align="justify">
                Elementos
              </TableCell>
              <TableCell sx={{ backgroundColor: "#f1f1f1" }} align="justify">
                Entradas
              </TableCell>
              <TableCell sx={{ backgroundColor: "#f1f1f1" }} align="justify">
                Salidas
              </TableCell>
              <TableCell sx={{ backgroundColor: "#f1f1f1" }} align="justify">
                Inventario
              </TableCell>
              <TableCell sx={{ backgroundColor: "#f1f1f1" }} align="justify">
                Acciones
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loadingStorage ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <Loader />
                </TableCell>
              </TableRow>
            ) : filteredData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  No hay almacenes registrados
                </TableCell>
              </TableRow>
            ) : (
              filteredData.map((storage, index) => (
                <TableRow key={index}>
                  <TableCell align="justify">{storage.type}</TableCell>
                  <TableCell align="justify">{storage.name}</TableCell>
                  <TableCell align="justify">{storage.managerName}</TableCell>
                  <TableCell align="justify">{storage.elementos}</TableCell>
                  <TableCell align="justify">{storage.entradas}</TableCell>
                  <TableCell align="justify">{storage.salidas}</TableCell>
                  <TableCell align="justify">{storage.inventario}</TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      onClick={(event) => handleMenuOpen(event, storage)}
                    >
                      <MoreVert />
                    </IconButton>
                    <Menu
                      anchorEl={anchorEl}
                      open={
                        Boolean(anchorEl) && selectedStorage?.id === storage.id
                      }
                      onClose={handleMenuClose}
                    >
                      <MenuItem
                        onClick={() => {
                          handleClickDetails(storage);
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
                          handleEditStorage(selectedStorage);
                          handleMenuClose();
                        }}
                      >
                        <ListItemIcon>
                          <Edit fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>Editar Almacen</ListItemText>
                      </MenuItem>
                      <MenuItem
                        onClick={() => {
                          handleDeleteDialog(selectedStorage);
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
        count={totalStorage}
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

      {/* Detalles de almacen */}
      <StoragesDetailComponent
        open={openDetails}
        setOpen={setOpenDetails}
        storage={selectedStorage}
      />

      {/* Borrar almacen */}
      <DeleteDialogConfirmComponent
        title="Eliminar almacen"
        message="¿Estás seguro de que deseas eliminar el almacen"
        deleteDialogOpen={deleteDialogOpen}
        handleCloseDeleteDialog={handleCloseDeleteDialog}
        handleDelete={handleDeleteStorage}
      />
    </>
  );
};