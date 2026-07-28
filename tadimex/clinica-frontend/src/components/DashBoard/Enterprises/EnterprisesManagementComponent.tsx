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
import { AddEnterprisesComponent } from "./AddEnterprisesComponent";
import { EnterprisesDetailComponent } from "./EnterprisesDetailComponent";
import { useEnterprises } from "../../../hooks/Enterprises/useEnterprises";
import Loader from "../../Loader";
import { useEnterprise } from "../../../context/EnterpriseContext";
import { useBranch } from "../../../context/BranchContext";

export const EnterprisesManagementComponent = () => {
 
  // Hook de empresas
  const {
    enterprises,
    allEnterprises,
    setEnterprises,
    selectedEnterprise,
    setSelectedEnterprise,
    handleGetEnterprise,
    handleDeleteEnterprise: deleteEnterpriseAPI,
    handleCreateEnterprise,
    handleUpdateEnterprise,
    loading,
    page,
    setPage,
    rowsPerPage,
    totalEnterprises,
    searchTerm,
    setSearchTerm,
    handleChangePage,
    handleChangeRowsPerPage,
  } = useEnterprises();

  const {refreshEnterprises} = useEnterprise();
  const {refreshBranches} = useBranch();

  // Estados
  const [open, setOpen] = useState(false);
  const [openDetails, setOpenDetails] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [enterpriseToDelete, setEnterpriseToDelete] = useState(null);
  const [editingEnterprise, setEditingEnterprise] = useState(null);
  const [nameOrder, setNameOrder] = useState("asc");
  const [addressOrder, setAddressOrder] = useState("asc");
  const [phoneOrder, setPhoneOrder] = useState("asc");
  const [certificateOrder, setCertificateOrder] = useState("asc");
  const [stampOrder, setStampOrder] = useState("asc");
  const [regimenOrder, setRegimenOrder] = useState("asc");
  const [anchorEl, setAnchorEl] = useState(null);

  //Filtrar empresas
  const handleSearchChange = (newSearchTerm) => {
    setSearchTerm(newSearchTerm);
    
    if (newSearchTerm) {
      const filteredResults = allEnterprises.filter(
        (enterprise) =>
          enterprise.name?.toLowerCase().includes(newSearchTerm.toLowerCase()) ||
          enterprise.phone_number?.toLowerCase().includes(newSearchTerm.toLowerCase()) ||
          enterprise.SAT_certificate?.toLowerCase().includes(newSearchTerm.toLowerCase()) ||
          enterprise.SAT_stamp?.toLowerCase().includes(newSearchTerm.toLowerCase()) ||
          enterprise.regimen_fiscal?.toLowerCase().includes(newSearchTerm.toLowerCase())
      );
      
      if (filteredResults.length > 0) {
        // Encontramos la primera empresa que coincide
        const firstMatchingEnterprise = filteredResults[0];
        // Encontramos su índice en la lista completa
        const indexInAllFiltered = allEnterprises.findIndex(e => e.id === firstMatchingEnterprise.id);
        // Calculamos en qué página está
        if (indexInAllFiltered !== -1) {
          const pageOfFirstResult = Math.floor(indexInAllFiltered / rowsPerPage);
          setPage(pageOfFirstResult);
        }
      }
    }
  };

  //Funcion para abrir el dialogo de agregar empresa
  const handleClickDialogEnterprise = () => {
    setEditingEnterprise(null);
    setOpen(true);
  };

  //Funcion para agregar una nueva empresa
  const handleAddEnterprise = async (newEnterprise) => {
    try {
      await handleCreateEnterprise(newEnterprise);
      toast.success("Empresa agregada correctamente");
    }catch (error) {
      toast.error("Error al agregar la empresa");
    }
  };

  //Funcion para abrir el dialogo de eliminación de Empresa
  const handleDeleteDialog = (enterprise) => {
    setEnterpriseToDelete(enterprise);
    setDeleteDialogOpen(true);
  };

  //Funcion para eliminar una empresa
  const handleDeleteEnterprise = async () => {
    try {
      await deleteEnterpriseAPI(enterpriseToDelete.id);
      setEnterprises((prevEnterprises) =>
        prevEnterprises.filter(
          (enterprise) => enterprise.id !== enterpriseToDelete.id
        )
      );
      setDeleteDialogOpen(false);
      setEnterpriseToDelete(null);
      refreshEnterprises();
      refreshBranches();
      toast.success("Empresa eliminada correctamente");
    }catch (error) {
      toast.error("Error al eliminar la empresa");
    }
  };

  //Funcion para cerrar el dialogo de eliminación de empresas
  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setEnterpriseToDelete(null);
  };

  //Funcion para abrir el dialogo de editar empresa
  const handleEditEnterprise = (enterprise) => {
    setEditingEnterprise(enterprise);
    setOpen(true);
  };

  //Funcion para editar una empresa
  const handleUpdate = async(enterpriseData) => {
    try {
      await handleUpdateEnterprise(enterpriseData.id, enterpriseData);
      toast.success("Empresa actualizada correctamente");
    }catch (error) {
      toast.error("Error al actualizar la empresa");
    }
  };

  //Funcion para abrir el dialogo de detalles de empresa
  const handleClickDetails = async (enterprise) => {
    await handleGetEnterprise(enterprise.id);
    setOpenDetails(true);
  };

  //Funcion para ordenar las sucursales por nombre
  const handleSortName = () => {
    const sorted = [...enterprises].sort((a, b) => {
      const nameA = a.name || "";
      const nameB = b.name || "";

      if (nameOrder === "asc") {
        return nameA.localeCompare(nameB);
      } else {
        return nameB.localeCompare(nameA);
      }
    });
    setEnterprises(sorted);
    setNameOrder(nameOrder === "asc" ? "desc" : "asc");
  };

  //Funcion para ordenar las sucursales por dirección
  const handleSortAddress = () => {
    const sorted = [...enterprises].sort((a, b) => {
      const addressA = a.calle || "";
      const addressB = b.calle || "";

      if (addressOrder === "asc") {
        return addressA.localeCompare(addressB);
      } else {
        return addressB.localeCompare(addressA);
      }
    });
    setEnterprises(sorted);
    setAddressOrder(addressOrder === "asc" ? "desc" : "asc");
  };

  //Funcion para ordenar las sucursales por telefono
  const handleSortPhone = () => {
    const sorted = [...enterprises].sort((a, b) => {
      const phoneA = a.phone_number || "";
      const phoneB = b.phone_number || "";

      if (phoneOrder === "asc") {
        return phoneA.localeCompare(phoneB);
      } else {
        return phoneB.localeCompare(phoneA);
      }
    });
    setEnterprises(sorted);
    setPhoneOrder(phoneOrder === "asc" ? "desc" : "asc");
  };

  //Funcion para ordenar las sucursales por certificado SAT
  const handleSortCertificate = () => {
    const sorted = [...enterprises].sort((a, b) => {
      const certificateA = a.SAT_certificate || "";
      const certificateB = b.SAT_certificate || "";

      if (certificateOrder === "asc") {
        return certificateA.localeCompare(certificateB);
      } else {
        return certificateB.localeCompare(certificateA);
      }
    });
    setEnterprises(sorted);
    setCertificateOrder(certificateOrder === "asc" ? "desc" : "asc");
  };

  //Funcion para ordenar las sucursales por sello SAT
  const handleSortStamp = () => {
    const sorted = [...enterprises].sort((a, b) => {
      const stampA = a.SAT_stamp || "";
      const stampB = b.SAT_stamp || "";

      if (stampOrder === "asc") {
        return stampA.localeCompare(stampB);
      } else {
        return stampB.localeCompare(stampA);
      }
    });
    setEnterprises(sorted);
    setStampOrder(stampOrder === "asc" ? "desc" : "asc");
  };

  //Funcion para ordenar las sucursales por regimen fiscal
  const handleSortRegimen = () => {
    const sorted = [...enterprises].sort((a, b) => {
      const regimenA = a.regimen_fiscal || "";
      const regimenB = b.regimen_fiscal || "";

      if (regimenOrder === "asc") {
        return regimenA.localeCompare(regimenB);
      } else {
        return regimenB.localeCompare(regimenA);
      }
    });
    setEnterprises(sorted);
    setRegimenOrder(regimenOrder === "asc" ? "desc" : "asc");
  };

  //Menu de acciones
  const handleMenuOpen = (event, enterprise) => {
    setAnchorEl(event.currentTarget);
    setSelectedEnterprise(enterprise);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedEnterprise(null);
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
          Administración de empresas
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
            onAddContent={handleClickDialogEnterprise}
          />
          <AddEnterprisesComponent
            open={open}
            setOpen={setOpen}
            onAddEnterprise={handleAddEnterprise}
            onEditEnterprise={handleUpdate}
            initialData={editingEnterprise}
            onClose={() => setEditingEnterprise(null)}
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
                onClick={handleSortAddress}
              >
                Dirección
              </TableCell>
              <TableCell
                sx={{ backgroundColor: "#f1f1f1", cursor: "pointer" }}
                align="justify"
                onClick={handleSortPhone}
              >
                Télefono
              </TableCell>
              <TableCell
                sx={{ backgroundColor: "#f1f1f1", cursor: "pointer" }}
                align="justify"
                onClick={handleSortCertificate}
              >
                Certificado SAT
              </TableCell>
              <TableCell
                sx={{ backgroundColor: "#f1f1f1", cursor: "pointer" }}
                align="justify"
                onClick={handleSortStamp}
              >
                Sello SAT
              </TableCell>
              <TableCell
                sx={{ backgroundColor: "#f1f1f1", cursor: "pointer" }}
                align="justify"
                onClick={handleSortRegimen}
              >
                Regimen Fiscal
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
            ) : enterprises.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No hay empresas registradas
                </TableCell>
              </TableRow>
            ) : (
              enterprises.map((enterprise) => (
                <TableRow key={enterprise.id}>
                  <TableCell align="justify">{enterprise.name}</TableCell>
                  <TableCell align="justify">{`${enterprise.calle}, ${enterprise.numero_exterior}, ${enterprise.colonia}, ${enterprise.municipio}, ${enterprise.estado}`}</TableCell>
                  <TableCell align="justify">
                    {enterprise.phone_number}
                  </TableCell>
                  <TableCell align="justify">
                    {enterprise.SAT_certificate}
                  </TableCell>
                  <TableCell align="justify">{enterprise.SAT_stamp}</TableCell>
                  <TableCell align="justify">
                    {enterprise.regimen_fiscal}
                  </TableCell>
                  <TableCell align="justify">
                    <IconButton
                      size="small"
                      onClick={(event) => handleMenuOpen(event, enterprise)}
                    >
                      <MoreVert />
                    </IconButton>
                    <Menu
                      anchorEl={anchorEl}
                      open={
                        Boolean(anchorEl) &&
                        selectedEnterprise?.id === enterprise.id
                      }
                      onClose={handleMenuClose}
                    >
                      <MenuItem
                        onClick={() => {
                          handleClickDetails(enterprise);
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
                          handleEditEnterprise(selectedEnterprise);
                          handleMenuClose();
                        }}
                      >
                        <ListItemIcon>
                          <Edit fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>Editar Empresa</ListItemText>
                      </MenuItem>
                      <MenuItem
                        onClick={() => {
                          handleDeleteDialog(selectedEnterprise);
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
        count={totalEnterprises}
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

      {/* Detalles de una Empresa */}
      <EnterprisesDetailComponent
        open={openDetails}
        setOpen={setOpenDetails}
        enterprise={selectedEnterprise}
      />

      {/* Borrar Empresa */}
      <DeleteDialogConfirmComponent
        title="Eliminar Empresa"
        message="¿Estás seguro de que deseas eliminar esta empresa?"
        deleteDialogOpen={deleteDialogOpen}
        handleCloseDeleteDialog={handleCloseDeleteDialog}
        handleDelete={handleDeleteEnterprise}
      />
    </>
  );
};
