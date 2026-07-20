import {
  Box,
  IconButton,
  ListItem,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import React, { useState } from "react";
import SearchBar from "../../SearchBar";
import {
  ArrowDropDown,
  ArrowDropUp,
  Edit,
  MoreVert,
  RemoveRedEye,
} from "@mui/icons-material";
import DeleteIcon from "@mui/icons-material/Delete";
import { toast, ToastContainer } from "react-toastify";
import { DialogSystemUserComponent } from "./DialogSystemUserComponent";
import { DeleteDialogComponent } from "../DeleteDialogComponent";
import { DialogSystemUserDetails } from "./DialogSystemUserDetails";
import { useSystemUser } from "../../../hooks/SystemUser/useSystemUser";
import Loader from "../../Loader";

export const SystemUserComponent = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [open, setOpen] = useState(false);
  const [openDetails, setOpenDetails] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [nameOrder, setNameOrder] = useState("asc");
  const [lastNameOrder, setLastNameOrder] = useState("asc");
  const [emailOrder, setEmailOrder] = useState("asc");
  const [privilegeOrder, setPrivilegeOrder] = useState("asc");
  const [statusOrder, setStatusOrder] = useState("asc");
  const [anchorEl, setAnchorEl] = useState(null);

  //Hook CRUD de usuarios del sistema
  const {
    systemUsers,
    setSystemUsers,
    selectedSystemUser,
    setSelectedSystemUser, 
    handleGetSystemUser,
    loading,
    handleDeleteSystemUser: deleteSystemUserAPI,
    handleCreateSystemUser,
    handleUpdateSystemUser,
    handleUpdatePassword,
  } = useSystemUser();

  //Función para abrir el dialogo de creacion de usuarios del sistema
  const handleClickDialogSystemUser = () => {
    setEditingUser(null);
    setOpen(true);
  };

  //Funcion para agregar un nuevo usuario del sistema
  const handleAddSystemUser = async (newSystemUser) => {
    try {
      await handleCreateSystemUser(newSystemUser);
      toast.success("Usuario agregado correctamente");
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else if (error.detail) {
        if (Array.isArray(error.detail)) {
          error.detail.forEach((err) => {
            const field = err.loc[err.loc.length - 1];
            toast.error(`${field}: ${err.msg}`);
          });
        } else {
          toast.error(error.detail);
        }
      } else {
        toast.error("Error al agregar el usuario");
      }
    }
  };

  //Funcion para abrir el dialogo de eliminacion de usuarios del sistema.
  const handleDeleteDialog = (user) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  //Funcion para eliminar un usuario del sistema
  const handleDeleteSystemUser = async () => {
    try {
      await deleteSystemUserAPI(userToDelete.id);
      setSystemUsers((prevSystemUsers) =>
        prevSystemUsers.filter((sys) => sys.id !== userToDelete.id)
      );
      setDeleteDialogOpen(false);
      setUserToDelete(null);
      toast.success(`Usuario eliminado correctamente`);
    } catch (error) {
      toast.error("Error al eliminar el usuario");
    }
  };

  //Funcion para cerrar el dialogo de eliminacion de contactos
  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setUserToDelete(null);
  };

  //Funcion para abrir el dialogo de detalles de un usuario del sistema
  const handleClickDetails = async (user) => {
    await handleGetSystemUser(user.id);
    setOpenDetails(true);
  };

  // Funcion para filtrar los usuarios del sistema
  const filteredData = systemUsers.filter(
    (row) =>
      row.employeeData?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.employeeData?.last_name
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      row.employeeData?.email
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      row.rol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.employeeData?.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  //Funcion para abrir el dialogo de edicion de un usuario del sistema
  const handleEditSystemUser = (user) => {
    setEditingUser(user);
    setOpen(true);
  };

  //Funcion para actualizar un usuario del sistema
  const handleUpdate = async (updatedUser) => {
    try {
      await handleUpdateSystemUser(updatedUser.id, updatedUser);

      setSystemUsers((prevSystemUsers) =>
        prevSystemUsers.map((sys) =>
          sys.id === updatedUser.id
            ? {
                ...sys, // Mantener todos los datos originales
                rol: updatedUser.rol, // Solo actualizar el rol
              }
            : sys
        )
      );

      toast.success("Usuario actualizado correctamente");
    } catch (error) {
      toast.error("Error al actualizar el usuario");
    }
  };

  //Funcion para ordenar los usuarios del sistema por nombre
  const handleSortName = () => {
    const sorted = [...systemUsers].sort((a, b) => {
      const nameA = a.employeeData?.name || "";
      const nameB = b.employeeData?.name || "";

      if (nameOrder === "asc") {
        return nameA.localeCompare(nameB);
      } else {
        return nameB.localeCompare(nameA);
      }
    });
    setSystemUsers(sorted);
    setNameOrder(nameOrder === "asc" ? "desc" : "asc");
  };

  //Funcion para ordenar los usuarios del sistema por apellido
  const handleSortLastName = () => {
    const sorted = [...systemUsers].sort((a, b) => {
      const lastNameA = a.employeeData?.last_name || "";
      const lastNameB = b.employeeData?.last_name || "";

      if (lastNameOrder === "asc") {
        return lastNameA.localeCompare(lastNameB);
      } else {
        return lastNameB.localeCompare(lastNameA);
      }
    });
    setSystemUsers(sorted);
    setLastNameOrder(lastNameOrder === "asc" ? "desc" : "asc");
  };

  //Funcion para ordenar los usuarios del sistema por privilegio
  const handleSortPrivilege = () => {
    const sorted = [...systemUsers].sort((a, b) => {
      const rolA = a.rol || "";
      const rolB = b.rol || "";

      if (privilegeOrder === "asc") {
        return rolA.localeCompare(rolB);
      } else {
        return rolB.localeCompare(rolA);
      }
    });
    setSystemUsers(sorted);
    setPrivilegeOrder(privilegeOrder === "asc" ? "desc" : "asc");
  };

  //Funcion para ordenar los usuarios del sistema por email
  const handleSortEmail = () => {
    const sorted = [...systemUsers].sort((a, b) => {
      const emailA = a.employeeData?.email || "";
      const emailB = b.employeeData?.email || "";

      if (emailOrder === "asc") {
        return emailA.localeCompare(emailB);
      } else {
        return emailB.localeCompare(emailA);
      }
    });
    setSystemUsers(sorted);
    setEmailOrder(emailOrder === "asc" ? "desc" : "asc");
  };

  //Funcion para ordenar los usuarios del sistema por estatus
  const handleSortStatus = () => {
    const sorted = [...systemUsers].sort((a, b) => {
      const statusA = a.employeeData?.status || "";
      const statusB = b.employeeData?.status || "";

      if (statusOrder === "asc") {
        return statusA.localeCompare(statusB);
      } else {
        return statusB.localeCompare(statusA);
      }
    });
    setSystemUsers(sorted);
    setStatusOrder(statusOrder === "asc" ? "desc" : "asc");
  };

    //Menu de acciones
    const handleMenuOpen = (event, systemUser) => {
      setAnchorEl(event.currentTarget);
      setSelectedSystemUser(systemUser);
    };
  
    const handleMenuClose = () => {
      setAnchorEl(null);
      setSelectedSystemUser(null);
    }

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
          Usuarios del sistema
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
            onAddContent={handleClickDialogSystemUser}
          />
          <DialogSystemUserComponent
            open={open}
            setOpen={setOpen}
            onAddSystemUser={handleAddSystemUser}
            onEditSystemUser={handleUpdate}
            onUpdatePassword={handleUpdatePassword}
            initialData={editingUser}
          />
        </Box>
      </Box>
      <TableContainer
        sx={{
          height: "auto",
          maxHeight: "calc(100vh - 200px)",
          overflow: "auto",
          "@media (max-width: 600px)": {
            maxHeight: "calc(100vh - 250px)",
          },
        }}
      >        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={{ backgroundColor: "#f1f1f1", cursor:"pointer" }} align="justify" onClick={handleSortName}>
                Nombre
              </TableCell>
              <TableCell sx={{ backgroundColor: "#f1f1f1", cursor:"pointer" }} align="justify" onClick={handleSortLastName}>
                Apellidos
              </TableCell>
              <TableCell sx={{ backgroundColor: "#f1f1f1", cursor:"pointer" }} align="justify" onClick={handleSortEmail}>
                Email
              </TableCell>
              <TableCell sx={{ backgroundColor: "#f1f1f1", cursor:"pointer" }} align="justify" onClick={handleSortPrivilege}>
                Privilegio
              </TableCell>
              <TableCell sx={{ backgroundColor: "#f1f1f1", cursor:"pointer" }} align="justify" onClick={handleSortStatus}>
                Estatus
              </TableCell>
              <TableCell sx={{ backgroundColor: "#f1f1f1", cursor:"pointer" }} align="justify">
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
            ) : systemUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No hay usuarios registrados
                </TableCell>
              </TableRow>
            ) : (
              filteredData.map((user) => (
                <TableRow key={user.id}>
                  <TableCell align="justify">
                    {user.employeeData?.name || user.name}
                  </TableCell>
                  <TableCell align="justify">
                    {user.employeeData?.last_name || user.last_name}
                  </TableCell>
                  <TableCell align="justify">
                    {user.employeeData?.email}
                  </TableCell>
                  <TableCell align="justify">{user.rol}</TableCell>
                  <TableCell align="justify">
                    {user.employeeData?.status}
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      onClick={(event) => handleMenuOpen(event, user)}
                    >
                      <MoreVert />
                    </IconButton>
                    <Menu
                      anchorEl={anchorEl}
                      open={
                        Boolean(anchorEl) && selectedSystemUser?.id === user.id
                      }
                      onClose={handleMenuClose}
                    >
                      <MenuItem
                        onClick={()=> {
                          handleClickDetails(user);
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
                          handleEditSystemUser(user);
                          handleMenuClose();
                        }}
                      >
                        <ListItemIcon>
                          <Edit fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>Editar usuario</ListItemText>
                      </MenuItem>
                      <MenuItem
                        onClick={() => {
                          handleDeleteDialog(user);
                          handleMenuClose();
                        }}
                      >
                        <ListItemIcon>
                          <DeleteIcon fontSize="small" color="error" />
                        </ListItemIcon>
                        <ListItemText sx={{ color: "error.main" }}>
                          Eliminar usuario
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

      {/* Detalles del usuario */}
      <DialogSystemUserDetails
        open={openDetails}
        setOpen={setOpenDetails}
        user={selectedSystemUser}
        systemsUser={systemUsers}
      />

      {/* Borrar usuario */}
      <DeleteDialogComponent
        title="Eliminar usuario"
        message="¿Estás seguro de que deseas eliminar este usuario?"
        deleteDialogOpen={deleteDialogOpen}
        handleCloseDeleteDialog={handleCloseDeleteDialog}
        handleDelete={handleDeleteSystemUser}
      />
    </>
  );
};
