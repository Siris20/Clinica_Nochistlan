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
import { Edit, RemoveRedEye, MoreVert } from "@mui/icons-material";
import DeleteIcon from "@mui/icons-material/Delete";
import { DeleteDialogConfirmComponent } from "../DeleteDialogConfirmComponent";
import { AddAreasComponent } from "./AddAreasComponent";
import { AreasDetailComponent} from "./AreasDetailComponent";
import Loader from "../../Loader";
import { useAreas } from '../../../hooks/Areas/useAreas';
import { useEnterprise } from "../../../context/EnterpriseContext";

export const AreasManagementComponent = () => {

  const {selectedEnterprise} = useEnterprise();
 
  // Hook de areas
 const {
  filteredAreas,
  allFilteredAreas,
  setAreas,
  selectedArea,
  setSelectedArea,
  handleGetArea,
  handleDeleteArea: deleteAreaAPI,
  handleCreateArea,
  handleUpdateArea,
  loading, 
  page,
  setPage,
  rowsPerPage,
  totalAreas,
  handleChangePage,
  handleChangeRowsPerPage,
  searchTerm,
  setSearchTerm,
 } = useAreas(selectedEnterprise);

  // Estados
  const [open, setOpen] = useState(false);
  const [openDetails, setOpenDetails] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [areaToDelete, setAreaToDelete] = useState(null);
  const [editingArea, setEditingArea] = useState(null);
  const [nameOrder, setNameOrder] = useState("asc");
  const [descriptionOrder, setDescriptionOrder] = useState("asc");
  const [enterpriseOrder, setEnterpriseOrder] = useState("asc");
  const [anchorEl, setAnchorEl] = useState(null);

  //Filtrar areas
  const handleSearchChange = (newSearchTerm) => {
    setSearchTerm(newSearchTerm);
    if(newSearchTerm) {
      const filteredResults = allFilteredAreas.filter(
        (area) =>
          area.name.toLowerCase().includes(newSearchTerm.toLowerCase()) ||
          area.description.toLowerCase().includes(newSearchTerm.toLowerCase()) ||
          area.enterprise?.name.toLowerCase().includes(newSearchTerm.toLowerCase())
      );

      if(filteredAreas.length > 0) {
        const firstMatchingArea = filteredResults[0];
        const indexInAllFiltered = allFilteredAreas.findIndex(
          (area) => area.id === firstMatchingArea.id
        );
        if(indexInAllFiltered!== -1) {
          const page = Math.floor(indexInAllFiltered / rowsPerPage);
          setPage(page);
        }
      }
    }
  };

  //Funcion para abrir el dialogo de agregar areas
  const handleClickDialogArea = () => {
    setEditingArea(null);
    setOpen(true);
  };

  //Funcion para agregar una nueva area
  const handleAddArea = async (newArea) => {
    try {
      await handleCreateArea(newArea);
      toast.success("Area agregada correctamente");
    }catch (error) {
      toast.error("Error al agregar area");
    }
  };

  //Funcion para abrir el dialogo de eliminación de areas
  const handleDeleteDialog = (area) => {
    setAreaToDelete(area);
    setDeleteDialogOpen(true);
  };

  //Funcion para eliminar un area
  const handleDeleteArea = async () => {
    try {
      await deleteAreaAPI(areaToDelete.id);
      setAreas((prevAreas) =>
        prevAreas.filter(
          (area) => area.id !== areaToDelete.id
        )
      );
      setDeleteDialogOpen(false);
      setAreaToDelete(null);
      toast.success("Area eliminada correctamente");
    }catch (error) {
      toast.error("Error al eliminar area");
    }
  };

  //Funcion para cerrar el dialogo de eliminación de areas
  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setAreaToDelete(null);
  };

  //Funcion para abrir el dialogo de editar area
  const handleEditArea = (area) => {
    setEditingArea(area);
    setOpen(true);
  };

  //Funcion para editar un area
  const handleUpdate = async(areaData) => {
    try {
      await handleUpdateArea(areaData.id, areaData);
      toast.success("Area actualizada correctamente");
    }catch (error) {
      toast.error("Error al actualizar area");
    }
  };

  //Funcion para abrir el dialogo de detalles de area
  const handleClickDetails = async (area) => {
    await handleGetArea(area.id);
    setOpenDetails(true);
  };

  //Funcion para ordenar las sucursales por nombre
  const handleSortName = () => {
    const sorted = [...filteredAreas].sort((a, b) => {
      const nameA = a.name || "";
      const nameB = b.name || "";

      if (nameOrder === "asc") {
        return nameA.localeCompare(nameB);
      } else {
        return nameB.localeCompare(nameA);
      }
    });
    setAreas(sorted);
    setNameOrder(nameOrder === "asc" ? "desc" : "asc");
  };

  //Funcion para ordenar las sucursales por descripcion
  const handleSortDescription = () => {
    const sorted = [...filteredAreas].sort((a, b) => {
      const descriptionA = a.description || "";
      const descriptionB = b.description || "";

      if (descriptionOrder === "asc") {
        return descriptionA.localeCompare(descriptionB);
      } else {
        return descriptionB.localeCompare(descriptionA);
      }
    });
    setAreas(sorted);
    setDescriptionOrder(descriptionOrder === "asc" ? "desc" : "asc");
  };

  //Funcion para ordenar las sucursales por empresa
  const handleSortEnterprise = () => {
    const sorted = [...filteredAreas].sort((a, b) => {
      const enterpriseA = a.empresa.name || "";
      const enterpriseB = b.empresa.name || "";

      if (enterpriseOrder === "asc") {
        return enterpriseA.localeCompare(enterpriseB);
      } else {
        return enterpriseB.localeCompare(enterpriseA);
      }
    });
    setAreas(sorted);
    setEnterpriseOrder(enterpriseOrder === "asc" ? "desc" : "asc");
  };


  //Menu de acciones
  const handleMenuOpen = (event, area) => {
    setAnchorEl(event.currentTarget);
    setSelectedArea(area);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedArea(null);
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
          Administración de áreas
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
            onAddContent={handleClickDialogArea}
          />
          <AddAreasComponent
            open={open}
            setOpen={setOpen}
            onAddArea={handleAddArea}
            onEditArea={handleUpdate}
            initialData={editingArea}
            onClose={() => setEditingArea(null)}
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
                onClick={handleSortDescription}
              >
                Descripción
              </TableCell>
              <TableCell
                sx={{ backgroundColor: "#f1f1f1", cursor: "pointer" }}
                align="justify"
                onClick={handleSortEnterprise}
              >
                Empresa
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
                <TableCell colSpan={7} align="center">
                  <Loader />
                </TableCell>
              </TableRow>
            ) : filteredAreas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No hay áreas registradas
                </TableCell>
              </TableRow>
            ) : (
              filteredAreas.map((area) => (
                <TableRow key={area.id}>
                  <TableCell align="justify">{area.name}</TableCell>
                  <TableCell align="justify">{area.description}</TableCell>
                  <TableCell align="justify">{area.empresa?.name}</TableCell>
                  <TableCell align="justify">
                    <IconButton
                      size="small"
                      onClick={(event) => handleMenuOpen(event, area)}
                    >
                      <MoreVert />
                    </IconButton>
                    <Menu
                      anchorEl={anchorEl}
                      open={
                        Boolean(anchorEl) &&
                        selectedArea?.id === area.id
                      }
                      onClose={handleMenuClose}
                    >
                      <MenuItem
                        onClick={() => {
                          handleClickDetails(area);
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
                          handleEditArea(selectedArea);
                          handleMenuClose();
                        }}
                      >
                        <ListItemIcon>
                          <Edit fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>Editar área</ListItemText>
                      </MenuItem>
                      <MenuItem
                        onClick={() => {
                          handleDeleteDialog(selectedArea);
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
        count={totalAreas}
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
          ".MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows":
            {
              margin: 1,
            },
          ".MuiTablePagination-actions": { marginLeft: 2 },
        }}
      />

      {/* Detalles de un Area */}
      <AreasDetailComponent
        open={openDetails}
        setOpen={setOpenDetails}
        area={selectedArea}
      />

      {/* Borrar Area */}
      <DeleteDialogConfirmComponent
        title="Eliminar Empresa"
        message="¿Estás seguro de que deseas eliminar esta empresa?"
        deleteDialogOpen={deleteDialogOpen}
        handleCloseDeleteDialog={handleCloseDeleteDialog}
        handleDelete={handleDeleteArea}
      />
    </>
  );
};
