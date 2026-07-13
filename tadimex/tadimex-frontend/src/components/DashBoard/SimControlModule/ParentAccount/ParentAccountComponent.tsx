import React, { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import { useParentAccount } from "../../../../hooks/SimControlModule/ParentAccount/useParentAccount";
import {
  Box,
  IconButton,
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
import SearchBar from "../../../SearchBar";
import { AddClientsComponent } from "../../Clients/AddClientsComponent";
import Loader from "../../../Loader";
import {
  Edit,
  MoreVert,
  RemoveRedEye,
  SettingsCell,
} from "@mui/icons-material";
import { ClientsDetailComponent } from "../../Clients/ClientsDetailComponent";
import { AddParentAccountComponent } from "./AddParentAccountComponent";
import { ManageChipsComponent } from "./ManageChipsComponent";

export const ParentAccountComponent = () => {
  //Hooks
  const {
    // parentAccounts,
    // setParentAccounts,
    selectedParentAccount,
    setSelectedParentAccount,
    handleCreateParentAccount,
    handleUpdateParentAccount,
    loading,
  } = useParentAccount();

  //Mock de datos
  const [parentAccounts, setParentAccounts] = useState([
    {
      id: 1,
      accountNumber: "123456789",
      description: "Cuenta padre 1",
      client: "Cliente 1",
      chips: 5,
    },
    {
      id: 2,
      accountNumber: "987654321",
      description: "Cuenta padre 2",
      client: "Cliente 2",
      chips: 10,
    },
    {
      id: 3,
      accountNumber: "456123789",
      description: "Cuenta padre 3",
      client: "Cliente 3",
      chips: 15,
    },
  ]);

  //Estados
  const [open, setOpen] = useState(false);
  const [openManage, setOpenManage] = useState(false);
  const [editingParentAccount, setEditingParentAccount] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [accountNumberOrder, setAccountNumberOrder] = useState("asc");
  const [descriptionOrder, setDescriptionOrder] = useState("asc");
  const [clientOrder, setClientOrder] = useState("asc");
  const [chipsOrder, setChipsOrder] = useState("asc");
  const [searchTerm, setSearchTerm] = useState("");

  //Función para abrir el dialogo de agregar cuenta padre
  const handleClickDialogParentAccount = () => {
    setEditingParentAccount(null);
    setOpen(true);
  };

  //Función para agregar una nueva cuenta padre
  const handleAddParentAccount = async (newParentAccount) => {
    try {
      await handleCreateParentAccount(newParentAccount);
      toast.success("Cuenta padre agregada correctamente");
    } catch (error) {
      toast.error("Error al agregar la cuenta padre");
    }
  };

  //Función para abrir el dialogo de editar cuenta padre
  const handleEditParentAccount = (parentAccount) => {
    setEditingParentAccount(parentAccount);
    setOpen(true);
  };

  //Función para editar una cuenta padre
  const handleUpdate = async (parentAccountData) => {
    try {
      await handleUpdateParentAccount(parentAccountData.id, parentAccountData);
      toast.success("Cuenta padre editada correctamente");
    } catch (error) {
      toast.error("Error al editar la cuenta padre");
    }
  };

  //Función para abrir el dialogo de administrar chips
  const handleClickDialogManageChips = (parentAccount) => {
    setEditingParentAccount(parentAccount);
    setOpenManage(true);
  };

  // Filtrar cuentas padre por término de búsqueda
  const filteredParentAccounts = parentAccounts.filter(
    (account) =>
      account.accountNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.client?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  //Funcion para ordenar las cuentas padre por número de cuenta
  const handleSortAccountNumber = () => {
    const sorted = [...parentAccounts].sort((a, b) => {
      const accountNumberA = a.accountNumber || "";
      const accountNumberB = b.accountNumber || "";

      if (accountNumberOrder === "asc") {
        return accountNumberA.localeCompare(accountNumberB);
      } else {
        return accountNumberB.localeCompare(accountNumberA);
      }
    });
    setParentAccounts(sorted);
    setAccountNumberOrder(accountNumberOrder === "asc" ? "desc" : "asc");
  };

  //Funcion para ordenar las cuentas padre por descripción
  const handleSortDescription = () => {
    const sorted = [...parentAccounts].sort((a, b) => {
      const descriptionA = a.description || "";
      const descriptionB = b.description || "";

      if (descriptionOrder === "asc") {
        return descriptionA.localeCompare(descriptionB);
      } else {
        return descriptionB.localeCompare(descriptionA);
      }
    });
    setParentAccounts(sorted);
    setDescriptionOrder(descriptionOrder === "asc" ? "desc" : "asc");
  };

  //Funcion para ordenar las cuentas padre por cliente
  const handleSortClient = () => {
    const sorted = [...parentAccounts].sort((a, b) => {
      const clientA = a.client || "";
      const clientB = b.client || "";

      if (clientOrder === "asc") {
        return clientA.localeCompare(clientB);
      } else {
        return clientB.localeCompare(clientA);
      }
    });
    setParentAccounts(sorted);
    setClientOrder(clientOrder === "asc" ? "desc" : "asc");
  };

  //Funcion para ordenar las cuentas padre por chips
  const handleSortChips = () => {
    const sorted = [...parentAccounts].sort((a, b) => {
      const chipsA = a.chips || 0;
      const chipsB = b.chips || 0;

      if (chipsOrder === "asc") {
        return chipsA - chipsB;
      } else {
        return chipsB - chipsA;
      }
    });
    setParentAccounts(sorted);
    setChipsOrder(chipsOrder === "asc" ? "desc" : "asc");
  };

  //Menu de acciones
  const handleMenuOpen = (event, parentAccount) => {
    setAnchorEl(event.currentTarget);
    setSelectedParentAccount(parentAccount);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedParentAccount(null);
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
          Listado de Cuentas Padre (En desarrollo)
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
            onAddContent={handleClickDialogParentAccount}
          />
          <AddParentAccountComponent
            open={open}
            setOpen={setOpen}
            onAddParentAccount={handleAddParentAccount}
            onEditParentAccount={handleUpdate}
            initialData={editingParentAccount}
            onClose={() => setEditingParentAccount(null)}
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
                onClick={handleSortAccountNumber}
              >
                #
              </TableCell>
              <TableCell
                sx={{ backgroundColor: "#f1f1f1", cursor: "pointer" }}
                align="justify"
                onClick={handleSortAccountNumber}
              >
                Num. De Cuenta
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
                onClick={handleSortClient}
              >
                Cliente (s)
              </TableCell>
              <TableCell
                sx={{ backgroundColor: "#f1f1f1", cursor: "pointer" }}
                align="justify"
                onClick={handleSortChips}
              >
                Chips
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
            {
              /* {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Loader />
                </TableCell>
              </TableRow>
            ) :  */
              filteredParentAccounts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No hay cuentas padre
                  </TableCell>
                </TableRow>
              ) : (
                filteredParentAccounts.map((parentAccount) => (
                  <TableRow key={parentAccount.id}>
                    <TableCell align="justify">
                      {parentAccount?.id || ""}
                    </TableCell>
                    <TableCell align="justify">
                      {parentAccount?.accountNumber || ""}
                    </TableCell>
                    <TableCell align="justify">
                      {parentAccount?.description || ""}
                    </TableCell>
                    <TableCell align="justify">
                      {parentAccount?.client || ""}
                    </TableCell>
                    <TableCell align="justify">
                      {parentAccount?.chips || ""}
                    </TableCell>
                    <TableCell align="justify">
                      <IconButton
                        size="small"
                        onClick={(event) =>
                          handleMenuOpen(event, parentAccount)
                        }
                      >
                        <MoreVert />
                      </IconButton>
                      <Menu
                        anchorEl={anchorEl}
                        open={
                          Boolean(anchorEl) &&
                          selectedParentAccount?.id === parentAccount.id
                        }
                        onClose={handleMenuClose}
                      >
                        <MenuItem
                          onClick={() => {
                            handleClickDialogManageChips(parentAccount);
                            handleMenuClose();
                          }}
                        >
                          <ListItemIcon>
                            <SettingsCell fontSize="small" />
                          </ListItemIcon>
                          <ListItemText>Administrar Chips</ListItemText>
                        </MenuItem>
                        <MenuItem
                          onClick={() => {
                            handleEditParentAccount(selectedParentAccount);
                            handleMenuClose();
                          }}
                        >
                          <ListItemIcon>
                            <Edit fontSize="small" />
                          </ListItemIcon>
                          <ListItemText>Editar Cuenta Padre</ListItemText>
                        </MenuItem>
                      </Menu>
                    </TableCell>
                  </TableRow>
                ))
              )
            }
          </TableBody>
        </Table>
      </TableContainer>

      {/* Administrar chips*/}
      <ManageChipsComponent
        open={openManage}
        setOpen={setOpenManage}
        onManageChips={handleAddParentAccount}
        initialData={editingParentAccount}
        onClose={() => setEditingParentAccount(null)}
      />
    </>
  );
};
