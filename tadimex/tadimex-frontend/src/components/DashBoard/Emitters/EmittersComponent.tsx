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
import Loader from "../../Loader";
import { useEmitters } from "../../../hooks/Emitters/useEmitters";
import { AddEmittersComponent } from "./AddEmittersComponent";
import { EmittersDetailComponent } from "./EmittersDetailComponent";
import { useEnterprise } from "../../../context/EnterpriseContext";

export const EmittersComponent = () => {
  const { selectedEnterprise } = useEnterprise();

  //Hook de Emisores
  const {
    filteredEmitters,
    allFilteredEmitters,
    setEmitters,
    selectedEmitter,
    setSelectedEmitter,
    handleGetEmitter,
    handleDeleteEmitter: deleteEmitterAPI,
    handleCreateEmitter,
    handleUpdateEmitter,
    loading,
    page,
    setPage,
    rowsPerPage,
    totalEmitters,
    handleChangePage,
    handleChangeRowsPerPage,
    searchTerm,
    setSearchTerm,
  } = useEmitters(selectedEnterprise);

  //Estados
  const [open, setOpen] = useState(false);
  const [openDetails, setOpenDetails] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [emitterToDelete, setEmitterToDelete] = useState(null);
  const [editingEmitter, setEditingEmitter] = useState(null);
  const [companyNameOrder, setCompanyNameOrder] = useState("asc");
  const [rfcOrder, setRfcOrder] = useState("asc");
  const [personTypeOrder, setPersonTypeOrder] = useState("asc");
  const [regimenFiscalOrder, setRegimenFiscalOrder] = useState("asc");
  const [certificateOrder, setCertificateOrder] = useState("asc");
  const [bankOrder, setBankOrder] = useState("asc");
  const [bankAccountOrder, setBankAccountOrder] = useState("asc");
  const [clabeOrder, setClabeOrder] = useState("asc");
  const [cardNumberOrder, setCardNumberOrder] = useState("asc");
  const [anchorEl, setAnchorEl] = useState(null);

  //Filtrar emisores
  const handleSearchChange = (newSearchTerm) => {
    setSearchTerm(newSearchTerm);

    if (newSearchTerm) {
      const filteredResults = allFilteredEmitters.filter(
        (emitter) =>
          emitter.razon_social
            .toLowerCase()
            .includes(newSearchTerm.toLowerCase()) ||
          emitter.rfc.toLowerCase().includes(newSearchTerm.toLowerCase()) ||
          emitter.tipo_persona
            .toLowerCase()
            .includes(newSearchTerm.toLowerCase()) ||
          emitter.regimen_fiscal
            .toLowerCase()
            .includes(newSearchTerm.toLowerCase()) ||
          emitter.numero_certificado
            .toLowerCase()
            .includes(newSearchTerm.toLowerCase()) ||
          emitter.banco.toLowerCase().includes(newSearchTerm.toLowerCase()) ||
          emitter.numero_cuenta
            .toLowerCase()
            .includes(newSearchTerm.toLowerCase()) ||
          emitter.clabe.toLowerCase().includes(newSearchTerm.toLowerCase()) ||
          emitter.numero_tarjeta
            .toLowerCase()
            .includes(newSearchTerm.toLowerCase())
      );

      if (filteredEmitters.length > 0) {
        const firstMatchingEmitter = filteredResults[0];
        const indexInAllFiltered = allFilteredEmitters.findIndex(
          (e) => e.id === firstMatchingEmitter.id
        );
        if (indexInAllFiltered !== -1) {
          const pageOffFirstResult = Math.floor(
            indexInAllFiltered / rowsPerPage
          );
          setPage(pageOffFirstResult);
        }
      }
    }
  };

  //Funcion para abrir el dialogo de agregar emisor
  const handleClickDialogEmitter = () => {
    setEditingEmitter(null);
    setOpen(true);
  };

  //Funcion para agregar un nuevo emisor
  const handleAddEmitter = async (newEmitter) => {
    try {
      await handleCreateEmitter(newEmitter);
      toast.success("Emisor agregado correctamente");
    } catch (error) {
      toast.error(error.message);
    }
  };

  //Funcion para abrir el dialogo de eliminación de emisores
  const handleDeleteDialog = (emitter) => {
    setEmitterToDelete(emitter);
    setDeleteDialogOpen(true);
  };

  //Funcion para eliminar un emisor
  const handleDeleteEmitter = async () => {
    try {
      await deleteEmitterAPI(emitterToDelete.id);
      setEmitters((prevEmmiters) =>
        prevEmmiters.filter((emitter) => emitter.id !== emitterToDelete.id)
      );
      setDeleteDialogOpen(false);
      setEmitterToDelete(null);
      toast.success("Emisor eliminado correctamente");
    } catch (error) {
      toast.error(
        `${error.message}: El emisor puede estar asociado a una cotización, por favor verifique`
      );
    }
  };

  //Funcion para cerrar el dialogo de eliminación de emisores
  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setEmitterToDelete(null);
  };

  //Funcion para abrir el dialogo de editar emisores
  const handleEditEmitter = (emitter) => {
    setEditingEmitter(emitter);
    setOpen(true);
  };

  //Funcion para editar un emisor
  const handleUpdate = async (emitterData) => {
    try {
      await handleUpdateEmitter(emitterData.id, emitterData);
      toast.success("Emisor editado correctamente");
    } catch (error) {
      toast.error("Error al editar el emisor");
    }
  };

  //Funcion para abrir el dialogo de detalles de emisores
  const handleClickDetails = async (emitter) => {
    await handleGetEmitter(emitter.id);
    setOpenDetails(true);
  };

  //Funcion para ordenar los emisores por nombre
  const handleCompanyName = () => {
    const sorted = [...filteredEmitters].sort((a, b) => {
      const companyNameA = a.razon_social || "";
      const companyNameB = b.razon_social || "";

      if (companyNameOrder === "asc") {
        return companyNameA.localeCompare(companyNameB);
      } else {
        return companyNameB.localeCompare(companyNameA);
      }
    });
    setEmitters(sorted);
    setCompanyNameOrder(companyNameOrder === "asc" ? "desc" : "asc");
  };

  //Funcion para ordenar los emisores por rfc
  const handleSortRfc = () => {
    const sorted = [...filteredEmitters].sort((a, b) => {
      const rfcA = a.rfc || "";
      const rfcB = b.rfc || "";

      if (rfcOrder === "asc") {
        return rfcA.localeCompare(rfcB);
      } else {
        return rfcB.localeCompare(rfcA);
      }
    });
    setEmitters(sorted);
    setRfcOrder(rfcOrder === "asc" ? "desc" : "asc");
  };

  //Funcion para ordenar los emisores por tipo de persona
  const handleSortPersonType = () => {
    const sorted = [...filteredEmitters].sort((a, b) => {
      const personTypeA = a.tipo_persona || "";
      const personTypeB = b.tipo_persona || "";

      if (personTypeOrder === "asc") {
        return personTypeA.localeCompare(personTypeB);
      } else {
        return personTypeB.localeCompare(personTypeA);
      }
    });
    setEmitters(sorted);
    setPersonTypeOrder(personTypeOrder === "asc" ? "desc" : "asc");
  };

  //Funcion para ordenar los emisores por regimen fiscal
  const handleSortRegimenFiscal = () => {
    const sorted = [...filteredEmitters].sort((a, b) => {
      const regimenFiscalA = a.regimen_fiscal || "";
      const regimenFiscalB = b.regimen_fiscal || "";

      if (regimenFiscalOrder === "asc") {
        return regimenFiscalA.localeCompare(regimenFiscalB);
      } else {
        return regimenFiscalB.localeCompare(regimenFiscalA);
      }
    });
    setEmitters(sorted);
    setRegimenFiscalOrder(regimenFiscalOrder === "asc" ? "desc" : "asc");
  };

  //Funcion para ordenar los emisores por numero de certificado
  const handleSortCertificate = () => {
    const sorted = [...filteredEmitters].sort((a, b) => {
      const certificadoA = a.numero_certificado || "";
      const certificadoB = b.numero_certificado || "";

      if (certificateOrder === "asc") {
        return certificadoA.localeCompare(certificadoB);
      } else {
        return certificadoB.localeCompare(certificadoA);
      }
    });
    setEmitters(sorted);
    setCertificateOrder(certificateOrder === "asc" ? "desc" : "asc");
  };

  //Funcion para ordenar los emisores por banco
  const handleSortBank = () => {
    const sorted = [...filteredEmitters].sort((a, b) => {
      const bankA = a.banco || "";
      const bankB = b.banco || "";

      if (bankOrder === "asc") {
        return bankA.localeCompare(bankB);
      } else {
        return bankB.localeCompare(bankA);
      }
    });
    setEmitters(sorted);
    setBankOrder(bankOrder === "asc" ? "desc" : "asc");
  };

  //Funcion para ordenar los emisores por cuenta bancaria
  const handleSortBankAccount = () => {
    const sorted = [...filteredEmitters].sort((a, b) => {
      const bankAccountA = a.numero_cuenta || "";
      const bankAccountB = b.numero_cuenta || "";

      if (bankAccountOrder === "asc") {
        return bankAccountA.localeCompare(bankAccountB);
      } else {
        return bankAccountB.localeCompare(bankAccountA);
      }
    });
    setEmitters(sorted);
    setBankAccountOrder(bankAccountOrder === "asc" ? "desc" : "asc");
  };

  //Funcion para ordenar los emisores por clabe interbancaria
  const handleSortClabe = () => {
    const sorted = [...filteredEmitters].sort((a, b) => {
      const clabeA = a.clabe || "";
      const clabeB = b.clabe || "";

      if (clabeOrder === "asc") {
        return clabeA.localeCompare(clabeB);
      } else {
        return clabeB.localeCompare(clabeA);
      }
    });
    setEmitters(sorted);
    setClabeOrder(clabeOrder === "asc" ? "desc" : "asc");
  };

  //Funcion para ordenar los emisores por numero de tarjeta
  const handleSortCardNumber = () => {
    const sorted = [...filteredEmitters].sort((a, b) => {
      const cardNumberA = a.numero_tarjeta || "";
      const cardNumberB = b.numero_tarjeta || "";

      if (cardNumberOrder === "asc") {
        return cardNumberA.localeCompare(cardNumberB);
      } else {
        return cardNumberB.localeCompare(cardNumberA);
      }
    });
    setEmitters(sorted);
    setCardNumberOrder(cardNumberOrder === "asc" ? "desc" : "asc");
  };

  //Menu de acciones
  const handleMenuOpen = (event, emitter) => {
    setAnchorEl(event.currentTarget);
    setSelectedEmitter(emitter);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedEmitter(null);
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
          Listado de Emisores
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
            onAddContent={handleClickDialogEmitter}
          />
          <AddEmittersComponent
            open={open}
            setOpen={setOpen}
            onAddEmitters={handleAddEmitter}
            onEditEmitters={handleUpdate}
            initialData={editingEmitter}
            onClose={() => setEditingEmitter(null)}
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
                sx={tableCellStyles}
                align="justify"
                onClick={handleCompanyName}
              >
                Razón Social
              </TableCell>
              <TableCell
                sx={tableCellStyles}
                align="justify"
                onClick={handleSortRfc}
              >
                RFC
              </TableCell>
              <TableCell
                sx={tableCellStyles}
                align="justify"
                onClick={handleSortPersonType}
              >
                Tipo de Persona
              </TableCell>
              <TableCell
                sx={tableCellStyles}
                align="justify"
                onClick={handleSortRegimenFiscal}
              >
                Regimen Fiscal
              </TableCell>
              <TableCell
                sx={tableCellStyles}
                align="justify"
                onClick={handleSortCertificate}
              >
                No. Certificado
              </TableCell>
              <TableCell
                sx={tableCellStyles}
                align="justify"
                onClick={handleSortBank}
              >
                Banco
              </TableCell>
              <TableCell
                sx={tableCellStyles}
                align="justify"
                onClick={handleSortBankAccount}
              >
                No. Cuenta
              </TableCell>
              <TableCell
                sx={tableCellStyles}
                align="justify"
                onClick={handleSortClabe}
              >
                Clabe Interbancaria
              </TableCell>
              <TableCell
                sx={tableCellStyles}
                align="justify"
                onClick={handleSortCardNumber}
              >
                No. Tarjeta de deposito
              </TableCell>
              <TableCell sx={tableCellStyles} align="justify">
                Acciones
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={10} align="center">
                  <Loader />
                </TableCell>
              </TableRow>
            ) : filteredEmitters.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} align="center">
                  No hay emisores
                </TableCell>
              </TableRow>
            ) : (
              filteredEmitters.map((emitter) => (
                <TableRow key={emitter.id}>
                  <TableCell align="justify">{emitter.razon_social}</TableCell>
                  <TableCell align="justify">{emitter.rfc}</TableCell>
                  <TableCell align="justify">{emitter.tipo_persona}</TableCell>
                  <TableCell align="justify">
                    {emitter.regimen_fiscal}
                  </TableCell>
                  <TableCell align="justify">
                    {emitter.numero_certificado}
                  </TableCell>
                  <TableCell align="justify">{emitter.banco}</TableCell>
                  <TableCell align="justify">{emitter.numero_cuenta}</TableCell>
                  <TableCell align="justify">{emitter.clabe}</TableCell>
                  <TableCell align="justify">
                    {emitter.numero_tarjeta}
                  </TableCell>
                  <TableCell align="justify">
                    <IconButton
                      size="small"
                      onClick={(event) => handleMenuOpen(event, emitter)}
                    >
                      <MoreVert />
                    </IconButton>
                    <Menu
                      anchorEl={anchorEl}
                      open={
                        Boolean(anchorEl) && selectedEmitter?.id === emitter.id
                      }
                      onClose={handleMenuClose}
                    >
                      <MenuItem
                        onClick={() => {
                          handleClickDetails(emitter);
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
                          handleEditEmitter(selectedEmitter);
                          handleMenuClose();
                        }}
                      >
                        <ListItemIcon>
                          <Edit fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>Editar Emisor</ListItemText>
                      </MenuItem>
                      <MenuItem
                        onClick={() => {
                          handleDeleteDialog(selectedEmitter);
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
        count={totalEmitters}
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

      {/* Detalles de un emisor */}
      <EmittersDetailComponent
        open={openDetails}
        setOpen={setOpenDetails}
        emitter={selectedEmitter}
      />

      {/* Borrar Emisor */}
      <DeleteDialogConfirmComponent
        title="Eliminar Emisor"
        message="¿Estás seguro de que deseas eliminar este emisor?"
        deleteDialogOpen={deleteDialogOpen}
        handleCloseDeleteDialog={handleCloseDeleteDialog}
        handleDelete={handleDeleteEmitter}
      />
    </>
  );
};
