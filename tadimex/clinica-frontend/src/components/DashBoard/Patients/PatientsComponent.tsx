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
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from "@mui/material";
import React, { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import SearchBar from "../../SearchBar";
import { Edit, RemoveRedEye, MoreVert } from "@mui/icons-material";
import DeleteIcon from "@mui/icons-material/Delete";
import { DeleteDialogConfirmComponent } from "../DeleteDialogConfirmComponent";
import Loader from "../../Loader";
import { usePatients, PatientData } from "../../../hooks/Patients/usePatients";
import { AddPatientsComponent } from "./AddPatientsComponent";
import { PatientsDetailComponent } from "./PatientsDetailComponent";

export const PatientsComponent = () => {
  const {
    filteredPatients,
    setSelectedPatient,
    handleGetPatient,
    handleDeletePatient: deletePatientAPI,
    handleCreatePatient,
    handleUpdatePatient,
    loading,
    page,
    rowsPerPage,
    totalPatients,
    handleChangePage,
    handleChangeRowsPerPage,
    searchTerm,
    setSearchTerm,
    estatusFilter,
    handleEstatusChange,
  } = usePatients();

  const [open, setOpen] = useState(false);
  const [openDetails, setOpenDetails] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [patientToDelete, setPatientToDelete] = useState<PatientData | null>(null);
  const [editingPatient, setEditingPatient] = useState<PatientData | null>(null);
  const [selectedPatientLocal, setSelectedPatientLocal] = useState<PatientData | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleSearchChange = (newSearchTerm: string) => {
    setSearchTerm(newSearchTerm);
  };

  const handleEstatusFilterChangeLocal = (event: any) => {
    handleEstatusChange(event.target.value);
  };

  const handleClickDialogPatient = () => {
    setEditingPatient(null);
    setOpen(true);
  };

  const handleAddPatientSubmit = async (newPatient: any) => {
    try {
      await handleCreatePatient(newPatient);
      toast.success("Paciente registrado correctamente");
    } catch (error: any) {
      toast.error(error.message || "Error al agregar el paciente");
    }
  };

  const handleDeleteDialog = (patient: PatientData) => {
    setPatientToDelete(patient);
    setDeleteDialogOpen(true);
  };

  const handleDeletePatientConfirm = async () => {
    if (!patientToDelete?.id) return;
    try {
      await deletePatientAPI(patientToDelete.id);
      setDeleteDialogOpen(false);
      setPatientToDelete(null);
      toast.success("Paciente eliminado correctamente");
    } catch (error: any) {
      toast.error(error.message || "No se pudo eliminar el paciente");
    }
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setPatientToDelete(null);
  };

  const handleEditPatient = (patient: PatientData) => {
    setEditingPatient(patient);
    setOpen(true);
  };

  const handleUpdateSubmit = async (patientData: any) => {
    try {
      await handleUpdatePatient(patientData.id, patientData);
      toast.success("Paciente actualizado correctamente");
    } catch (error: any) {
      toast.error(error.message || "Error al actualizar paciente");
    }
  };

  const handleClickDetails = async (patient: PatientData) => {
    if (patient.id) {
      await handleGetPatient(patient.id);
      setOpenDetails(true);
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, patient: PatientData) => {
    setAnchorEl(event.currentTarget);
    setSelectedPatientLocal(patient);
    setSelectedPatient(patient);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
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
        }}
      >
        <Typography
          variant="h5"
          component="h2"
          sx={{
            textAlign: { xs: "center", sm: "left" },
            fontWeight: "600",
          }}
        >
          Expedientes de Pacientes
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
            onAddContent={handleClickDialogPatient}
          />
          <AddPatientsComponent
            open={open}
            setOpen={setOpen}
            onAddPatient={handleAddPatientSubmit}
            onEditPatient={handleUpdateSubmit}
            initialData={editingPatient}
            onClose={() => setEditingPatient(null)}
          />
          <FormControl sx={{ minWidth: 160 }}>
            <InputLabel>Estatus</InputLabel>
            <Select
              label="Estatus"
              value={estatusFilter}
              onChange={handleEstatusFilterChangeLocal}
            >
              <MenuItem value="todos">Todos</MenuItem>
              <MenuItem value="activo">Activos</MenuItem>
              <MenuItem value="inactivo">Inactivos</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>

      <TableContainer
        sx={{
          height: "auto",
          maxHeight: "calc(100vh - 250px)",
          overflow: "auto",
        }}
      >
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={{ backgroundColor: "#f1f1f1" }}>Paciente</TableCell>
              <TableCell sx={{ backgroundColor: "#f1f1f1" }}>CURP</TableCell>
              <TableCell sx={{ backgroundColor: "#f1f1f1" }}>Celular</TableCell>
              <TableCell sx={{ backgroundColor: "#f1f1f1" }}>Grupo Sang.</TableCell>
              <TableCell sx={{ backgroundColor: "#f1f1f1" }}>Alergias</TableCell>
              <TableCell sx={{ backgroundColor: "#f1f1f1" }}>Estatus</TableCell>
              <TableCell sx={{ backgroundColor: "#f1f1f1" }}>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Loader />
                </TableCell>
              </TableRow>
            ) : filteredPatients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No hay pacientes registrados
                </TableCell>
              </TableRow>
            ) : (
              filteredPatients.map((patient) => {
                const nombreCompleto = `${patient.nombre} ${patient.apellido_paterno || ""} ${patient.apellido_materno || ""}`.trim();
                return (
                  <TableRow key={patient.id}>
                    <TableCell sx={{ fontWeight: 500 }}>{nombreCompleto}</TableCell>
                    <TableCell>{patient.curp || "N/A"}</TableCell>
                    <TableCell>{patient.telefono_celular || "N/A"}</TableCell>
                    <TableCell>{patient.grupo_sanguineo || "N/A"}</TableCell>
                    <TableCell>{patient.alergias || "Ninguna"}</TableCell>
                    <TableCell>
                      <Chip
                        label={(patient.estatus || "activo").toUpperCase()}
                        color={patient.estatus === "activo" ? "success" : "default"}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuOpen(e, patient)}
                      >
                        <MoreVert />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Menú de Acciones */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem
          onClick={() => {
            if (selectedPatientLocal) handleClickDetails(selectedPatientLocal);
            handleMenuClose();
          }}
        >
          <ListItemIcon>
            <RemoveRedEye fontSize="small" />
          </ListItemIcon>
          <ListItemText>Ver Expediente</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (selectedPatientLocal) handleEditPatient(selectedPatientLocal);
            handleMenuClose();
          }}
        >
          <ListItemIcon>
            <Edit fontSize="small" />
          </ListItemIcon>
          <ListItemText>Editar Paciente</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (selectedPatientLocal) handleDeleteDialog(selectedPatientLocal);
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

      <TablePagination
        component="div"
        count={totalPatients}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[5, 10, 25, 50]}
        labelRowsPerPage="Filas por página:"
      />

      <PatientsDetailComponent
        open={openDetails}
        setOpen={setOpenDetails}
        patient={selectedPatientLocal}
      />

      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          Eliminar Paciente
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            ¿Estás seguro de que deseas eliminar este expediente de paciente? Esta acción no se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseDeleteDialog} color="inherit">
            Cancelar
          </Button>
          <Button
            onClick={handleDeletePatientConfirm}
            color="error"
            variant="contained"
            autoFocus
          >
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};