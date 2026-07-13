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
  FormControl,
  InputLabel,
  Select,
} from "@mui/material";
import React, { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import SearchBar from "../../SearchBar";
import { Edit, RemoveRedEye, MoreVert, PersonAdd } from "@mui/icons-material";
import DeleteIcon from "@mui/icons-material/Delete";
import { DeleteDialogConfirmComponent } from "../DeleteDialogConfirmComponent";
import Loader from "../../Loader";
import { useClients } from '../../../hooks/Clients/useClients';
import { AddClientsComponent } from "./AddClientsComponent";
import { ClientsDetailComponent } from "./ClientsDetailComponent";
import { useEnterprise } from "../../../context/EnterpriseContext";

export const ClientsComponent = () => {

  const {selectedEnterprise} = useEnterprise();

  //Hook de clientes
  const {
    filteredClients,
    allFilteredClients,
    setClients,
    selectedClient,
    setSelectedClient,
    handleGetClient,
    handleDeleteClient: deleteClientAPI,
    handleCreateClient,
    handleUpdateClient,
    handleProspectToClient,
    loading,
    page,
    setPage,
    rowsPerPage,
    totalClients,
    handleChangePage,
    handleChangeRowsPerPage,
    searchTerm,
    setSearchTerm,
    clientType,
    handleClientTypeChange,
  } = useClients(selectedEnterprise);


  //Estados
  const [open, setOpen] = useState(false);
  const [openDetails, setOpenDetails] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState(null);
  const [editingClient, setEditingClient] = useState(null);
  const [nameOrder, setNameOrder] = useState("asc");
  const [contactNameOrder, setContactNameOrder] = useState("asc");
  const [phoneNumberOrder, setPhoneNumberOrder] = useState("asc");
  const [emailOrder, setEmailOrder] = useState("asc");
  const [anchorEl, setAnchorEl] = useState(null);

  //Filtrar cliente
  const handleSearchChange = (newSearchTerm) => {
    setSearchTerm(newSearchTerm);
    
    if (newSearchTerm) {
      const filteredResults = allFilteredClients.filter(
        (client) =>
          client.nombre_fiscal?.toLowerCase().includes(newSearchTerm.toLowerCase()) ||
          client.contact_name?.toLowerCase().includes(newSearchTerm.toLowerCase()) ||
          client.phone_number?.toLowerCase().includes(newSearchTerm.toLowerCase()) ||
          client.email?.toLowerCase().includes(newSearchTerm.toLowerCase())
      );
      
      if (filteredResults.length > 0) {
        // Encontramos el primer cliente que coincide
        const firstMatchingClient = filteredResults[0];
        // Encontramos su índice en la lista completa
        const indexInAllFiltered = allFilteredClients.findIndex(c => c.id === firstMatchingClient.id);
        // Calculamos en qué página está
        if (indexInAllFiltered !== -1) {
          const pageOfFirstResult = Math.floor(indexInAllFiltered / rowsPerPage);
          setPage(pageOfFirstResult);
        }
      }
    }
  };

  // Función para manejar el cambio de tipo de cliente
  const handleClientTypeChangeLocal = (event) => {
    const newClientType = event.target.value;
    handleClientTypeChange(newClientType);
  };

  //Funcion para abrir el dialogo de agregar cliente
  const handleClickDialogClient = () => {
    setEditingClient(null);
    setOpen(true);
  };

  //Funcion para agregar un nuevo cliente
  const handleAddProduct = async (newClient) => {
    try {
      await handleCreateClient(newClient);
      toast.success("Cliente agregado correctamente");
    } catch (error) {
      toast.error("Error al agregar el cliente");
    }
  };

  //Funcion para abrir el dialogo de eliminación de clientes
  const handleDeleteDialog = (client) => {
    setClientToDelete(client);
    setDeleteDialogOpen(true);
  };

  //Funcion para eliminar un cliente
  const handleDeleteClient = async () => {
    try {
      await deleteClientAPI(clientToDelete.id);
      setClients((prevClients) =>
        prevClients.filter((client) => client.id !== clientToDelete.id)
      );
      setDeleteDialogOpen(false);
      setClientToDelete(null);
      toast.success("Cliente eliminado correctamente");
    } catch (error) {
      toast.error(`${error.message}: El cliente puede estar asociado a una cotización, por favor verifique`);
    }
  };

  //Funcion para cerrar el dialogo de eliminación de clientes
  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setClientToDelete(null);
  };

  //Funcion para abrir el dialogo de editar cliente
  const handleEditClient = (client) => {
    setEditingClient(client);
    setOpen(true);
  };

  //Funcion para editar un cliente
  const handleUpdate = async (clientData) => {
    try {
      await handleUpdateClient(clientData.id, clientData);
      toast.success("Cliente editado correctamente");
    } catch (error) {
      toast.error(error.message);
    }
  };

  //Funcion para abrir el dialogo de detalles de cliente
  const handleClickDetails = async (client) => {
    await handleGetClient(client.id);
    setOpenDetails(true);
  };

  //Función para convertir un prospecto a cliente
  const handleConvertProspectToClient = async (client) => {
    try {
      await handleProspectToClient(client.id);
      toast.success("Cliente convertido de prospecto a cliente");
    } catch (error) {
      toast.error("Solo se pueden convertir prospectos a clientes");
      return;
    }
  };

  //Funcion para ordenar los clientes por nombre
  const handleSortName = () => {
    const sorted = [...filteredClients].sort((a, b) => {
      const nameA = a.nombre_fiscal || "";
      const nameB = b.nombre_fiscal || "";

      if (nameOrder === "asc") {
        return nameA.localeCompare(nameB);
      } else {
        return nameB.localeCompare(nameA);
      }
    });
    setClients(sorted);
    setNameOrder(nameOrder === "asc" ? "desc" : "asc");
  };

  //Funcion para ordenar los clientes por contactName
  const handleSortContactName = () => {
    const sorted = [...filteredClients].sort((a, b) => {
      const contactNameA = a.contact_name || "";
      const contactNameB = b.contact_name || "";

      if (contactNameOrder === "asc") {
        return contactNameA.localeCompare(contactNameB);
      } else {
        return contactNameB.localeCompare(contactNameA);
      }
    });
    setClients(sorted);
    setContactNameOrder(contactNameOrder === "asc" ? "desc" : "asc");
  };

  //Funcion para ordenar los clientes por phoneNumber
  const handleSortPhoneNumber = () => {
    const sorted = [...filteredClients].sort((a, b) => {
      const phoneNumberA = a.phone_number || "";
      const phoneNumberB = b.phone_number || "";

      if (phoneNumberOrder === "asc") {
        return phoneNumberA.localeCompare(phoneNumberB);
      } else {
        return phoneNumberB.localeCompare(phoneNumberA);
      }
    });
    setClients(sorted);
    setPhoneNumberOrder(phoneNumberOrder === "asc" ? "desc" : "asc");
  };

  //Funcion para ordenar los clientes por email
  const handleSortEmail = () => {
    const sorted = [...filteredClients].sort((a, b) => {
      const emailA = a.email || "";
      const emailB = b.email || "";

      if (emailOrder === "asc") {
        return emailA.localeCompare(emailB);
      } else {
        return emailB.localeCompare(emailA);
      }
    });
    setClients(sorted);
    setEmailOrder(emailOrder === "asc" ? "desc" : "asc");
  };

  //Menu de acciones
  const handleMenuOpen = (event, product) => {
    setAnchorEl(event.currentTarget);
    setSelectedClient(product);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedClient(null);
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
          Listado de Clientes
        </Typography>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            minWidth: { xs: "100%", sm: "300px", md: "500px" },
            justifyContent: { xs: "center", sm: "flex-end" },
          }}
        >
          <SearchBar
            searchTerm={searchTerm}
            setSearchTerm={handleSearchChange}
            onAddContent={handleClickDialogClient}
          />
          <AddClientsComponent
            open={open}
            setOpen={setOpen}
            onAddClients={handleAddProduct}
            onEditClients={handleUpdate}
            initialData={editingClient}
            onClose={() => setEditingClient(null)}
          />
          <FormControl
            sx={{
              minWidth: { xs: "100%", sm: "200px", md: "250px" },
              marginBottom: { xs: 2, sm: 0 },
            }}
          >
            <InputLabel>Tipo de Cliente</InputLabel>
            <Select
              label="Tipo de Cliente"
              name="clientType"
              value={clientType}
              onChange={handleClientTypeChangeLocal}
              MenuProps={{
                  PaperProps: {
                    sx: {
                      "& .MuiMenuItem-root": {
                        position: "relative",
                        "&:hover .website-link-icon": {
                          opacity: 1,
                          visibility: "visible",
                        },
                      },

                    },
                  },
                }}
              >
                <MenuItem value="todos">
                  Todos
                </MenuItem>
                <MenuItem value="activos">
                  Clientes Activos
                </MenuItem>
                <MenuItem value="prospectos">
                  Clientes Prospectos
                </MenuItem>
              </Select>
          </FormControl>
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
                onClick={handleSortContactName}
              >
                Contacto
              </TableCell>
              <TableCell
                sx={{ backgroundColor: "#f1f1f1", cursor: "pointer" }}
                align="justify"
              >
                Observaciones
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
                onClick={handleSortEmail}
              >
                Tipo de Cliente
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
            ) : filteredClients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No hay clientes
                </TableCell>
              </TableRow>
            ) : (
              filteredClients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell align="justify">{client?.nombre_fiscal}</TableCell>
                  <TableCell align="justify">{client.contact_name}</TableCell>
                  <TableCell align="justify">{client?.observaciones || ""}</TableCell>
                  <TableCell align="justify">{client?.phone_number}</TableCell>
                  <TableCell align="justify">{client?.email}</TableCell>
                  <TableCell align="justify">
                    {client?.estado_cliente === "prospecto" ? "Prospecto" : "Cliente"}
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
                        Boolean(anchorEl) && selectedClient?.id === client.id
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
                          handleEditClient(selectedClient);
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
                          handleConvertProspectToClient(selectedClient);
                          handleMenuClose();
                        }}
                      >
                        <ListItemIcon>
                          <PersonAdd fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>Convertir a Cliente</ListItemText>
                      </MenuItem>
                      <MenuItem
                        onClick={() => {
                          handleDeleteDialog(selectedClient);
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
        count={totalClients}
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

      {/* Detalles de un cliente */}
      <ClientsDetailComponent
        open={openDetails}
        setOpen={setOpenDetails}
        client={selectedClient}
      />

      {/* Borrar Cliente */}
      <DeleteDialogConfirmComponent
        title="Eliminar Cliente"
        message="¿Estás seguro de que deseas eliminar este cliente?"
        deleteDialogOpen={deleteDialogOpen}
        handleCloseDeleteDialog={handleCloseDeleteDialog}
        handleDelete={handleDeleteClient}
      />
    </>
  );
};
