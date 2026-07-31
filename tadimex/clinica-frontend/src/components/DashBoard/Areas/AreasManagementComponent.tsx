import React, { useState } from "react";
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
  Collapse,
  Button,
} from "@mui/material";
import { toast, ToastContainer } from "react-toastify";
import SearchBar from "../../SearchBar";
import {
  Edit,
  RemoveRedEye,
  MoreVert,
  KeyboardArrowDown,
  KeyboardArrowUp,
  PersonAdd,
} from "@mui/icons-material";
import DeleteIcon from "@mui/icons-material/Delete";
import { DeleteDialogConfirmComponent } from "../DeleteDialogConfirmComponent";
import { AddAreasComponent } from "./AddAreasComponent";
import { AreasDetailComponent } from "./AreasDetailComponent";
import Loader from "../../Loader";
import { useAreas } from "../../../hooks/Areas/useAreas";
import { useEnterprise } from "../../../context/EnterpriseContext";
import { useEmployee } from "../../../hooks/Employee/useEmployee";

// Importaciones del módulo de Especialistas
import { SpecialistsListTable } from "../Specialists/SpecialistsListTable";
import { AddSpecialistDialog } from "../Specialists/AddSpecialistDialog";
import { Especialista, useEspecialistas } from "../../../hooks/Especialistas/useEspecialistas";

export const AreasManagementComponent = () => {
  const { selectedEnterprise } = useEnterprise();

  // Hook de áreas
  const {
    filteredAreas,
    setAreas,
    selectedArea,
    setSelectedArea,
    handleGetArea,
    handleDeleteArea: deleteAreaAPI,
    handleCreateArea,
    handleUpdateArea,
    loading,
    page,
    rowsPerPage,
    totalAreas,
    handleChangePage,
    handleChangeRowsPerPage,
    searchTerm,
    setSearchTerm,
  } = useAreas(selectedEnterprise);

  // Estados de control de Áreas
  const [open, setOpen] = useState(false);
  const [openDetails, setOpenDetails] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [areaToDelete, setAreaToDelete] = useState<any>(null);
  const [editingArea, setEditingArea] = useState<any>(null);

  // Estado para Filas Expandibles
  const [expandedAreaId, setExpandedAreaId] = useState<number | null>(null);

  // Estados para Especialistas
  const [openSpecialistDialog, setOpenSpecialistDialog] = useState(false);
  const [editingSpecialist, setEditingSpecialist] = useState<Especialista | null>(null);
  const [specialistToDelete, setSpecialistToDelete] = useState<Especialista | null>(null);
  const [deleteSpecialistOpen, setDeleteSpecialistOpen] = useState(false);
  const [targetAreaId, setTargetAreaId] = useState<number | null>(null);

  // Hook de CRUD para especialistas vinculado al área seleccionada
  const { createEspecialista, updateEspecialista, deleteEspecialista } = useEspecialistas(targetAreaId);

  // Cargar empleados para el selector del modal de especialistas
  const { employees, loading: employeesLoading } = useEmployee();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  // Alternar expansión de filas
  const handleToggleRow = (areaId: number) => {
    setExpandedAreaId(expandedAreaId === areaId ? null : areaId);
  };

  // --- Handlers de Áreas ---
  const handleDeleteArea = async () => {
    if (!areaToDelete) return;
    try {
      await deleteAreaAPI(areaToDelete.id);
      setAreas((prevAreas) => prevAreas.filter((area) => area.id !== areaToDelete.id));
      setDeleteDialogOpen(false);
      setAreaToDelete(null);
      toast.success("Área eliminada correctamente");
    } catch (error) {
      toast.error("Error al eliminar área");
    }
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setAreaToDelete(null);
  };

  // --- Handlers de Especialistas ---
  const handleOpenAddSpecialist = (areaId: number) => {
    setTargetAreaId(areaId);
    setEditingSpecialist(null);
    setOpenSpecialistDialog(true);
  };

  const handleOpenEditSpecialist = (esp: Especialista) => {
    setTargetAreaId(esp.area_id);
    setEditingSpecialist(esp);
    setOpenSpecialistDialog(true);
  };

  const handleSaveSpecialist = async (data: any) => {
    try {
      if (editingSpecialist) {
        await updateEspecialista(editingSpecialist.id, data);
        toast.success("Especialista actualizado correctamente");
      } else {
        await createEspecialista(data);
        toast.success("Especialista agregado al área");
      }
      
      // Cerrar modal y limpiar selección al guardar con éxito
      setOpenSpecialistDialog(false);
      setEditingSpecialist(null);
    } catch (error: any) {
      toast.error(error.message || "Error al procesar el especialista");
    }
  };

  const handleDeleteSpecialistConfirm = async () => {
    if (!specialistToDelete) return;

    try {
      await deleteEspecialista(specialistToDelete.id);
      toast.success("Especialista eliminado correctamente");
      
      // Cerrar modal y limpiar selección
      setDeleteSpecialistOpen(false);
      setSpecialistToDelete(null);
    } catch (error: any) {
      toast.error(error.message || "No se pudo eliminar el especialista");
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, area: any) => {
    setAnchorEl(event.currentTarget);
    setSelectedArea(area);
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
          justifyContent: "space-between",
          alignItems: "center",
          gap: 2,
          margin: 2,
        }}
      >
        <Typography variant="h5" component="h2">
          Administración de Áreas y Especialistas
        </Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          <SearchBar
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            onAddContent={() => {
              setEditingArea(null);
              setOpen(true);
            }}
          />
        </Box>
      </Box>

      <TableContainer sx={{ maxHeight: "calc(100vh - 250px)" }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell width="50px" sx={{ backgroundColor: "#f1f1f1" }} />
              <TableCell sx={{ backgroundColor: "#f1f1f1" }}><strong>Nombre</strong></TableCell>
              <TableCell sx={{ backgroundColor: "#f1f1f1" }}><strong>Descripción</strong></TableCell>
              <TableCell sx={{ backgroundColor: "#f1f1f1" }}><strong>Empresa</strong></TableCell>
              <TableCell sx={{ backgroundColor: "#f1f1f1" }} align="center"><strong>Acciones</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} align="center"><Loader /></TableCell>
              </TableRow>
            ) : filteredAreas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">No hay áreas registradas</TableCell>
              </TableRow>
            ) : (
              filteredAreas.map((area) => (
                <React.Fragment key={area.id}>
                  {/* Fila Principal del Área */}
                  <TableRow hover>
                    <TableCell>
                      <IconButton size="small" onClick={() => handleToggleRow(area.id)}>
                        {expandedAreaId === area.id ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                      </IconButton>
                    </TableCell>
                    <TableCell>{area.name}</TableCell>
                    <TableCell>{area.description}</TableCell>
                    <TableCell>{area.empresa?.name || "-"}</TableCell>
                    <TableCell align="center">
                      <IconButton size="small" onClick={(e) => handleMenuOpen(e, area)}>
                        <MoreVert />
                      </IconButton>
                    </TableCell>
                  </TableRow>

                  {/* Sub-fila Desplegable con Especialistas */}
                  <TableRow>
                    <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={5}>
                      <Collapse in={expandedAreaId === area.id} timeout="auto" unmountOnExit>
                        <Box sx={{ margin: 2, padding: 2, backgroundColor: "#f9f9f9", borderRadius: 1 }}>
                          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                            <Typography variant="h6" component="div">
                              Especialistas de {area.name}
                            </Typography>
                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={<PersonAdd />}
                              onClick={() => handleOpenAddSpecialist(area.id)}
                            >
                              Agregar Especialista
                            </Button>
                          </Box>
                          <SpecialistsListTable
                            areaId={area.id}
                            onEdit={handleOpenEditSpecialist}
                            onDelete={(esp) => {
                              setSpecialistToDelete(esp);
                              setTargetAreaId(area.id);
                              setDeleteSpecialistOpen(true);
                            }}
                          />
                        </Box>
                      </Collapse>
                    </TableCell>
                  </TableRow>
                </React.Fragment>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={totalAreas}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[5, 10, 25, 50]}
        labelRowsPerPage="Filas por página:"
      />

      {/* Menú Contextual de Áreas */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem onClick={() => { handleGetArea(selectedArea?.id); setOpenDetails(true); handleMenuClose(); }}>
          <ListItemIcon><RemoveRedEye fontSize="small" /></ListItemIcon>
          <ListItemText>Ver detalles</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { setEditingArea(selectedArea); setOpen(true); handleMenuClose(); }}>
          <ListItemIcon><Edit fontSize="small" /></ListItemIcon>
          <ListItemText>Editar área</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { handleOpenAddSpecialist(selectedArea?.id); handleMenuClose(); }}>
          <ListItemIcon><PersonAdd fontSize="small" /></ListItemIcon>
          <ListItemText>Agregar Especialista</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { setAreaToDelete(selectedArea); setDeleteDialogOpen(true); handleMenuClose(); }}>
          <ListItemIcon><DeleteIcon fontSize="small" color="error" /></ListItemIcon>
          <ListItemText sx={{ color: "error.main" }}>Borrar área</ListItemText>
        </MenuItem>
      </Menu>

      {/* Componentes Diálogo */}
      <AddAreasComponent
        open={open}
        setOpen={setOpen}
        onAddArea={handleCreateArea}
        onEditArea={handleUpdateArea}
        initialData={editingArea}
        onClose={() => setEditingArea(null)}
      />

      <AreasDetailComponent
        open={openDetails}
        setOpen={setOpenDetails}
        area={selectedArea}
      />

      {targetAreaId && (
        <AddSpecialistDialog
          open={openSpecialistDialog}
          onClose={() => {
            setOpenSpecialistDialog(false);
            setEditingSpecialist(null);
          }}
          areaId={targetAreaId}
          initialData={editingSpecialist}
          employees={employees}
          employeesLoading={employeesLoading}
          onSave={handleSaveSpecialist}
        />
      )}

      {/* Confirmar Eliminación de Área */}
      <DeleteDialogConfirmComponent
        title="Eliminar Área"
        message="¿Estás seguro de que deseas eliminar esta área de la clínica?"
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleDeleteArea}
      />

      {/* Confirmar Eliminación de Especialista */}
      <DeleteDialogConfirmComponent
        title="Eliminar Especialista"
        message="¿Estás seguro de que deseas eliminar este especialista del área?"
        open={deleteSpecialistOpen}
        onClose={() => {
          setDeleteSpecialistOpen(false);
          setSpecialistToDelete(null);
        }}
        onConfirm={handleDeleteSpecialistConfirm}
      />
    </>
  );
};