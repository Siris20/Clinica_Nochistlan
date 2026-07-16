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
import {
  Edit,
  RemoveRedEye,
  MoreVert,
  Warehouse,
} from "@mui/icons-material";
import DeleteIcon from "@mui/icons-material/Delete";
import { AddBranchesComponent } from "./AddBranchesComponent";
import PeopleIcon from "@mui/icons-material/People";
import { DeleteDialogConfirmComponent } from "../DeleteDialogConfirmComponent";
import { BranchesDetailComponent } from "./BranchesDetailComponent";
import { useBranches } from "../../../hooks/Branches/useBranches";
import Loader from "../../Loader";
import { useEnterprise } from "../../../context/EnterpriseContext";
import { useBranch } from "../../../context/BranchContext";

export const BranchesManagementComponent = ({ onMenuItemClick }) => {
  const{selectedEnterprise} = useEnterprise();
  //Hook de sucursales
  const {
    filteredBranches,
    allFilteredBranches,
    setBranches,
    selectedBranch,
    setSelectedBranch,
    handleGetBranch,
    handleDeleteBranch: deleteBranchAPI,
    handleCreateBranch,
    handleUpdateBranch,
    loading,
    page,
    setPage,
    rowsPerPage,
    totalBranches,
    handleChangePage,
    handleChangeRowsPerPage,
    searchTerm,
    setSearchTerm,
  } = useBranches(selectedEnterprise);

  const {refreshBranches} = useBranch();
  

  //Estados
  const [open, setOpen] = useState(false);
  const [openDetails, setOpenDetails] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [branchToDelete, setBranchToDelete] = useState(null);
  const [editingBranch, setEditingBranch] = useState(null);
  const [nameOrder, setNameOrder] = useState("asc");
  const [addressOrder, setAddressOrder] = useState("asc");
  const [phoneOrder, setPhoneOrder] = useState("asc");
  const [managerOrder, setManagerOrder] = useState("asc");
  const [employeesOrder, setEmployeesOrder] = useState("asc");
  const [warehousesOrder, setWarehousesOrder] = useState("asc");
  const [anchorEl, setAnchorEl] = useState(null);

  //Filtrar sucursales
  const handleSearchChange = (newSearchTerm) => {
    setSearchTerm(newSearchTerm);

    if(newSearchTerm) {
      const filteredResults = allFilteredBranches.filter(
        (branch) =>
          branch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          branch.phone_number.toLowerCase().includes(searchTerm.toLowerCase())
      );
      if(filteredBranches.length>0) {
        const firstMatchingBranch = filteredResults[0];
        const indexInAllFiltered = allFilteredBranches.findIndex(
          (b) => b.id === firstMatchingBranch.id
        );
        if(indexInAllFiltered!==-1) {
          const pageOffFirstResult = Math.floor(indexInAllFiltered / rowsPerPage);
          setPage(pageOffFirstResult);
        }
      }
    }
  };

  //Funcion para abrir el dialogo de agregar sucursal
  const handleClickDialogBranch = () => {
    setEditingBranch(null);
    setOpen(true);
  };

  //Funcion para agregar una nueva sucursal
  const handleAddBranch = async (newBranch) => {
    try {
      await handleCreateBranch(newBranch);
      toast.success("Sucursal agregada correctamente");
    }catch(error) {
      toast.error("Error al agregar la sucursal");
    }
  };

  //Funcion para abrir el dialogo de eliminación de sucursal
  const handleDeleteDialog = (branch) => {
    setBranchToDelete(branch);
    setDeleteDialogOpen(true);
  };

  //Funcion para eliminar una sucursal
  const handleDeleteBranch = async () => {
    try {
      await deleteBranchAPI(branchToDelete.id);
      setBranches((prevBranches) =>
        prevBranches.filter((branch) => branch.id !== branchToDelete.id)
      );
      setDeleteDialogOpen(false);
      setBranchToDelete(null);
      refreshBranches();
      toast.success("Sucursal eliminada correctamente");
    }catch(error) {
      toast.error("Error al eliminar la sucursal");
    }
  };

  //Funcion para cerrar el dialogo de eliminación de sucursal
  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setBranchToDelete(null);
  };

  //Funcion para abrir el dialogo de editar sucursal
  const handleEditBranch = (branch) => {
    setEditingBranch(branch);
    setOpen(true);
  };

  //Funcion para editar una sucursal
  const handleUpdate = async (branchData) => {
    try {
      await handleUpdateBranch(branchData.id, branchData);
      toast.success("Sucursal editada correctamente");
    }catch(error) {
      toast.error(error.message);
    }
  };

  //Funcion para abrir el dialogo de detalles de sucursal
  const handleClickDetails = async (branch) => {
    await handleGetBranch(branch.id);
    setOpenDetails(true);
  };

  //Funcion para ordenar las sucursales por nombre
  const handleSortName = () => {
    const sorted = [...filteredBranches].sort((a, b) => {
      const nameA = a.name || "";
      const nameB = b.name || "";

      if (nameOrder === "asc") {
        return nameA.localeCompare(nameB);
      } else {
        return nameB.localeCompare(nameA);
      }
    });
    setBranches(sorted);
    setNameOrder(nameOrder === "asc" ? "desc" : "asc");
  };

  //Funcion para ordenar las sucursales por dirección
  const handleSortAddress = () => {
    const sorted = [...filteredBranches].sort((a, b) => {
      const addressA = a.address || "";
      const addressB = b.address || "";

      if (addressOrder === "asc") {
        return addressA.localeCompare(addressB);
      } else {
        return addressB.localeCompare(addressA);
      }
    });
    setBranches(sorted);
    setAddressOrder(addressOrder === "asc" ? "desc" : "asc");
  };

  //Funcion para ordenar las sucursales por gerente
  const handleSortManager = () => {
    const sorted = [...filteredBranches].sort((a, b) => {
      const managerA = a.manager || "";
      const managerB = b.manager || "";

      if (managerOrder === "asc") {
        return managerA.localeCompare(managerB);
      } else {
        return managerB.localeCompare(managerA);
      }
    });
    setBranches(sorted);
    setManagerOrder(managerOrder === "asc" ? "desc" : "asc");
  };

  //Funcion para ordenar las sucursales por telefono
  const handleSortPhone = () => {
    const sorted = [...filteredBranches].sort((a, b) => {
      const phoneA = a.phone_number || "";
      const phoneB = b.phone_number || "";

      if (phoneOrder === "asc") {
        return phoneA.localeCompare(phoneB);
      } else {
        return phoneB.localeCompare(phoneA);
      }
    });
    setBranches(sorted);
    setPhoneOrder(phoneOrder === "asc" ? "desc" : "asc");
  };

  //Funcion para ordenar las sucursales por cantidad de personal
  const handleSortEmployees = () => {
    const sorted = [...filteredBranches].sort((a, b) => {
      const employeesA = a.employees || "";
      const employeesB = b.employees || "";

      if (employeesOrder === "asc") {
        return employeesA.localeCompare(employeesB);
      } else {
        return employeesB.localeCompare(employeesA);
      }
    });
    setBranches(sorted);
    setEmployeesOrder(employeesOrder === "asc" ? "desc" : "asc");
  };

  //Funcion para ordenar las sucursales por cantidad de almacenes
  const handleSortWarehouses = () => {
    const sorted = [...filteredBranches].sort((a, b) => {
      const warehousesA = a.warehouses || "";
      const warehousesB = b.warehouses || "";

      if (warehousesOrder === "asc") {
        return warehousesA.localeCompare(warehousesB);
      } else {
        return warehousesB.localeCompare(warehousesA);
      }
    });
    setBranches(sorted);
    setWarehousesOrder(warehousesOrder === "asc" ? "desc" : "asc");
  };

  //Menu de acciones
  const handleMenuOpen = (event, branch) => {
    setAnchorEl(event.currentTarget);
    setSelectedBranch(branch);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedBranch(null);
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
          Administración de sucursales
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
            setSearchTerm={setSearchTerm}
            onAddContent={handleClickDialogBranch}
          />
          <AddBranchesComponent
            open={open}
            setOpen={setOpen}
            onAddBranch={handleAddBranch}
            onEditBranch={handleUpdate}
            initialData={editingBranch}
            onClose={() => setEditingBranch(null)}
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
                onClick={handleSortManager}
              >
                Gerente
              </TableCell>
              <TableCell
                sx={{ backgroundColor: "#f1f1f1", cursor: "pointer" }}
                align="justify"
                onClick={handleSortPhone}
              >
                Teléfono
              </TableCell>
              <TableCell
                sx={{ backgroundColor: "#f1f1f1", cursor: "pointer" }}
                align="justify"
                onClick={handleSortEmployees}
              >
                Personal
              </TableCell>
              <TableCell
                sx={{ backgroundColor: "#f1f1f1", cursor: "pointer" }}
                align="justify"
                onClick={handleSortWarehouses}
              >
                Almacenes
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
            ): filteredBranches.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No se encontraron sucursales
                </TableCell>
              </TableRow>
            ): (

            filteredBranches.map((branch) => (
              <TableRow key={branch.id}>
                <TableCell align="justify">{branch.name}</TableCell>
                <TableCell align="justify">
                  {`${branch.calle || ''}, ${branch.numero_exterior || ''}, ${branch.colonia || ''}, ${branch.municipio || ''}, ${branch.estado || ''}`}
                </TableCell>
                <TableCell align="justify">{branch.gerente?.name || 'Sin gerente asignado'}</TableCell>
                <TableCell align="justify">{branch.phone_number || ""}</TableCell>
                <TableCell align="justify">{branch.empleados || 0}</TableCell>
                <TableCell align="justify">{branch.almacenes?.name}</TableCell>
                <TableCell align="justify">
                  <IconButton
                    size="small"
                    onClick={(event) => handleMenuOpen(event, branch)}
                  >
                    <MoreVert />
                  </IconButton>
                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl) && selectedBranch?.id === branch.id}
                    onClose={handleMenuClose}
                  >
                    <MenuItem
                      onClick={() => {
                        handleClickDetails(branch);
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
                        handleEditBranch(selectedBranch);
                        handleMenuClose();
                      }}
                    >
                      <ListItemIcon>
                        <Edit fontSize="small" />
                      </ListItemIcon>
                      <ListItemText>Editar Sucursal</ListItemText>
                    </MenuItem>
                    <MenuItem
                      onClick={() => {
                        onMenuItemClick(6);
                        handleMenuClose();
                      }}
                    >
                      <ListItemIcon>
                        <PeopleIcon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText>Editar Personal</ListItemText>
                    </MenuItem>
                    <MenuItem
                      onClick={() => {
                        onMenuItemClick(3);
                        handleMenuClose();
                      }}
                    >
                      <ListItemIcon>
                        <Warehouse fontSize="small" />
                      </ListItemIcon>
                      <ListItemText>Editar Almacenes</ListItemText>
                    </MenuItem>
                    <MenuItem
                      onClick={() => {
                        handleDeleteDialog(selectedBranch);
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
        count={totalBranches}
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

      {/* Detalles de una sucursal */}
      <BranchesDetailComponent 
        open={openDetails} 
        setOpen={setOpenDetails}
        branch={selectedBranch}
      />

      {/* Borrar sucursal */}
      <DeleteDialogConfirmComponent
        title="Eliminar sucursal"
        message="¿Estás seguro de que deseas eliminar esta sucursal?"
        deleteDialogOpen={deleteDialogOpen}
        handleCloseDeleteDialog={handleCloseDeleteDialog}
        handleDelete={handleDeleteBranch}
      />
    </>
  );
};
