import React, { useEffect, useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  DialogActions,
  Button,
  Box,
  Typography,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Fade,
  ToggleButtonGroup,
  ToggleButton,
} from "@mui/material";
import { v4 as uuidv4 } from "uuid";
import { toast } from "react-toastify";
import { useEnterprise } from "../../../../context/EnterpriseContext";
import {
  Memory,
  Add,
  Remove,
  MoreVert,
  SettingsSuggest,
} from "@mui/icons-material";
import { ChipSearchBar } from "./ChipsSearchBarComponent";
import { IndividualChipModal } from "./IndividualChipModal";
import { MassiveChipModal } from "./MassiveChipModal";

// Componente personalizado para mostrar el estado con colores
const StatusCell = ({ status }) => {
  let color = "inherit"; // Color por defecto

  // Asignar color según el estado
  if (status === "INSTALADO") {
    color = "#2196F3"; // Azul
  } else if (status === "BAJA") {
    color = "#F44336"; // Rojo
  } else if (status === "DISPONIBLE") {
    color = "#4CAF50"; // Verde
  }

  return (
    <Typography
      variant="body2"
      sx={{
        fontSize: "0.75rem",
        fontWeight:
          status === "INSTALADO" || status === "BAJA" ? "bold" : "normal",
        color,
      }}
    >
      {status}
    </Typography>
  );
};

export const ManageChipsComponent = ({
  open,
  setOpen,
  onManageChips,
  initialData,
  onClose,
}) => {
  //Contexto de la empresa
  const { selectedEnterprise } = useEnterprise();

  // Estados para la búsqueda
  const [searchTermOutside, setSearchTermOutside] = useState("");
  const [searchTermInside, setSearchTermInside] = useState("");

  // Estado para los highlights de animación
  const [recentlyMovedInside, setRecentlyMovedInside] = useState([]);
  const [recentlyMovedOutside, setRecentlyMovedOutside] = useState([]);

  //Estados para abrir los modales de carga de chips
  const [openIndividual, setOpenIndividual] = useState(false);
  const [openMassive, setOpenMassive] = useState(false);

  // Datos de prueba para los chips - reemplazar con datos reales
  const [chipsOutside, setChipsOutside] = useState([
    {
      id: 1,
      telefono: "123456789",
      iccid: "8952140061700312345",
      status: "INSTALADO",
    },
    {
      id: 2,
      telefono: "987654321",
      iccid: "8952140061700398765",
      status: "BAJA",
    },
    {
      id: 3,
      telefono: "123456789",
      iccid: "8952140061700312345",
      status: "INSTALADO",
    },
    {
      id: 4,
      telefono: "987654321",
      iccid: "8952140061700398765",
      status: "BAJA",
    },
    {
      id: 5,
      telefono: "123456789",
      iccid: "8952140061700312345",
      status: "INSTALADO",
    },
    {
      id: 6,
      telefono: "987654321",
      iccid: "8952140061700398765",
      status: "BAJA",
    },
    {
      id: 7,
      telefono: "987654321",
      iccid: "8952140061700398765",
      status: "BAJA",
    },
    {
      id: 8,
      telefono: "987654321",
      iccid: "8952140061700398765",
      status: "BAJA",
    },
    {
      id: 9,
      telefono: "987654321",
      iccid: "8952140061700398765",
      status: "BAJA",
    },
  ]);

  const [chipsInside, setChipsInside] = useState([
    {
      id: 30,
      telefono: "555555555",
      iccid: "8952140061700355555",
      status: "INSTALADO",
    },
    {
      id: 40,
      telefono: "444444444",
      iccid: "8952140061700344444",
      status: "BAJA",
    },
    {
      id: 50,
      telefono: "666666666",
      iccid: "8952140061700366666",
      status: "INSTALADO",
    },
  ]);

  const [formData, setFormData] = useState({
    accountNumber: "",
    cliente_ids: [],
    description: "",
  });

  // UseEffect para cargar los datos iniciales cuando se está editando
  useEffect(() => {
    if (initialData) {
      setFormData({
        accountNumber: initialData.accountNumber || "",
        cliente_ids:
          initialData.cliente_ids ||
          (initialData.cliente_id ? [initialData.cliente_id] : []),
        description: initialData.description || "",
      });
    }
  }, [initialData]);

  // Función para mover un chip individual de fuera a dentro
  const handleMoveChipInside = (chipId) => {
    const chipToMove = chipsOutside.find((chip) => chip.id === chipId);
    if (chipToMove) {
      setChipsOutside((prev) => prev.filter((chip) => chip.id !== chipId));
      setChipsInside((prev) => [...prev, chipToMove]);
      setRecentlyMovedInside([chipToMove.id]);
      toast.success("Chip movido a dentro correctamente");
    }
  };

  // Función para mover un chip individual de dentro a fuera
  const handleMoveChipOutside = (chipId) => {
    const chipToMove = chipsInside.find((chip) => chip.id === chipId);
    if (chipToMove) {
      setChipsInside((prev) => prev.filter((chip) => chip.id !== chipId));
      setChipsOutside((prev) => [...prev, chipToMove]);
      setRecentlyMovedOutside([chipToMove.id]);
      toast.success("Chip movido a fuera correctamente");
    }
  };

  // Función para mover todos los chips de dentro a fuera
  const handleMoveAllOutside = () => {
    if (chipsInside.length > 0) {
      const chipsToMove = [...chipsInside];
      setChipsOutside((prev) => [...prev, ...chipsInside]);
      setChipsInside([]);
      setRecentlyMovedOutside(chipsToMove.map((chip) => chip.id));
      toast.success("Todos los chips movidos a fuera correctamente");
    } else {
      toast.error("No hay chips disponibles para mover");
    }
  };

  // Función para mover todos los chips de fuera a dentro
  const handleMoveAllInside = () => {
    if (chipsOutside.length > 0) {
      const chipsToMove = [...chipsOutside];
      setChipsInside((prev) => [...prev, ...chipsOutside]);
      setChipsOutside([]);
      setRecentlyMovedInside(chipsToMove.map((chip) => chip.id));
      toast.success("Todos los chips movidos a dentro correctamente");
    } else {
      toast.error("No hay chips fuera para mover");
    }
  };

  // Filtrar chips según términos de búsqueda
  const filteredChipsOutside = chipsOutside.filter(
    (chip) =>
      chip.telefono.includes(searchTermOutside) ||
      chip.iccid.includes(searchTermOutside)
  );

  const filteredChipsInside = chipsInside.filter(
    (chip) =>
      chip.telefono.includes(searchTermInside) ||
      chip.iccid.includes(searchTermInside)
  );

  const handleSubmit = (e) => {
    e.preventDefault();

    const chipsData = {
      id: initialData ? initialData.id : uuidv4(),
      ...formData,
      chipsOutside,
      chipsInside,
      empresa_id: selectedEnterprise,
    };

    onManageChips(chipsData);
    handleCloseDialog();
    toast.success("Gestión de chips actualizada correctamente");
  };

  // Función para cerrar el diálogo
  const handleCloseDialog = () => {
    setSearchTermOutside("");
    setSearchTermInside("");
    setRecentlyMovedInside([]);
    setRecentlyMovedOutside([]);
    setOpen(false);
    onClose && onClose();
  };

  //Funcion para abrir el modal de carga de chips individuales
  const handleOpenIndividualModal = () => {
    setOpenIndividual(true);
  };
  
  // Función para cerrar el modal de carga de chips individuales
  const handleCloseIndividualModal = () => {
    setOpenIndividual(false);
  };
  
  // Función para abrir el modal de carga de chips masivos
  const handleOpenMassiveModal = () => {
    setOpenMassive(true);
  };
  
  // Función para cerrar el modal de carga de chips masivos
  const handleCloseMassiveModal = () => {
    setOpenMassive(false);
  };
  
  // Función para manejar la adición de un chip individual
  const handleAddIndividualChip = (chipData) => {
    const newChip = {
      id: uuidv4(),
      telefono: chipData.telefono,
      iccid: chipData.iccid,
      status: "DISPONIBLE", // Aseguramos que el status sea DISPONIBLE
      montoplan: chipData.montoplan,
      fechaRecepcion: chipData.fechaRecepcion,
    };
    
    setChipsOutside(prev => [...prev, newChip]);
    toast.success("Chip agregado correctamente");
  };

  const titleStyle = {
    fontFamily: "Inter, sans-serif",
    fontWeight: "bold",
    fontSize: "14px",
    marginBottom: 2,
  };

  const subtitleStyle = {
    fontSize: 14,
    fontWeight: 500,
    marginY: 1,
  };

  // Estilo común para las celdas de la tabla
  const cellStyle = {
    fontSize: "0.75rem",
    padding: "6px 8px",
  };

  // Estilo para encabezados de tabla
  const headerCellStyle = {
    backgroundColor: "#f1f1f1",
    cursor: "pointer",
    fontSize: "0.75rem",
    fontWeight: "bold",
    padding: "8px",
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={handleCloseDialog}
        PaperProps={{
          component: "form",
          sx: {
            width: { xs: "95%", sm: "64rem" },
            maxWidth: "none",
            height: { xs: "auto", sm: "auto" },
            maxHeight: { xs: "95vh", sm: "95vh" },
            borderRadius: 5,
            m: { xs: 1, sm: 2 },
          },
        }}
      >
        <DialogTitle
          sx={{
            fontFamily: "Inter, sans-serif",
            fontWeight: "600",
            fontSize: 24,
            display: "flex",
            justifyContent: "flex-start",
            alignItems: "center",
            gap: 1,
            flexWrap: "wrap",
            pr: 4,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", mr: "auto" }}>
            Administración de Chips de la Cuenta Padre
          </Box>

          <ToggleButtonGroup
            exclusive
            aria-label="add-type"
            sx={{
              height: 40,
              borderRadius: 5,
              mr: 2,
            }}
          >
            <ToggleButton
              value="individual"
              aria-label="individual"
              sx={{
                textTransform: "none",
              }}
              onClick={handleOpenIndividualModal}
            >
              + Individual
            </ToggleButton>
            <ToggleButton
              value="massive"
              aria-label="massive"
              sx={{
                textTransform: "none"
              }}
              onClick={handleOpenMassiveModal}
            >
              + Masivo
            </ToggleButton>
          </ToggleButtonGroup>

          <IconButton
            onClick={handleCloseDialog}
            sx={{
              borderRadius: "100%",
              position: "absolute",
              right: 10,
              top: 10,
              backgroundColor: "#D01313",
              width: 24,
              height: 24,
              color: "#fff",
              "&:hover": {
                backgroundColor: "#D01319",
              },
            }}
          >
            <CloseIcon sx={{ fontSize: "20px" }} />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography sx={titleStyle}>Cuenta Padre</Typography>
                <Typography sx={subtitleStyle}>
                  {initialData?.accountNumber || ""} -{" "}
                  {initialData?.description || ""}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="h6" sx={titleStyle}>
                  Cliente Asignado
                </Typography>
                <Typography sx={subtitleStyle}>
                  {initialData?.cliente_ids?.length > 0
                    ? "HIDROBUS"
                    : "HIDROBUS"}
                </Typography>
              </Grid>
            </Grid>
          </Box>
          <Box sx={{ mb: 2 }}>
            <Grid container spacing={3}>
              {/* CHIPS FUERA */}
              <Grid item xs={12} sm={6}>
                <ChipSearchBar
                  title="CHIPS FUERA"
                  count={chipsOutside.length}
                  searchTerm={searchTermOutside}
                  setSearchTerm={setSearchTermOutside}
                  onAddChip={handleMoveAllInside}
                  onRemoveChip={() => {}}
                  isOutside={true}
                />
                <TableContainer
                  sx={{
                    height: "auto",
                    mt: 2,
                    maxHeight: "calc(100vh - 320px)",
                    overflow: "auto",
                    "@media (max-width: 600px)": {
                      maxHeight: "calc(100vh - 320px)",
                    },
                  }}
                >
                  <Table stickyHeader size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={headerCellStyle}>Teléfono</TableCell>
                        <TableCell sx={headerCellStyle}>ICCID</TableCell>
                        <TableCell sx={headerCellStyle}>Status</TableCell>
                        <TableCell sx={headerCellStyle}>
                          <SettingsSuggest fontSize="small" />
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredChipsOutside.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} align="center" sx={cellStyle}>
                            No hay chips fuera
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredChipsOutside.map((chip) => (
                          <Fade key={chip.id} in={true}>
                            <TableRow
                              hover
                              sx={{
                                backgroundColor: recentlyMovedOutside.includes(
                                  chip.id
                                )
                                  ? "rgba(244, 67, 54, 0.1)" // Rojo con opacidad
                                  : "inherit",
                              }}
                            >
                              <TableCell sx={cellStyle}>
                                <Typography
                                  variant="body2"
                                  sx={{ fontSize: "0.75rem" }}
                                >
                                  {chip.telefono}
                                </Typography>
                              </TableCell>
                              <TableCell sx={cellStyle}>
                                <Typography
                                  variant="body2"
                                  sx={{ fontSize: "0.75rem" }}
                                >
                                  {chip.iccid}
                                </Typography>
                              </TableCell>
                              <TableCell sx={cellStyle}>
                                <StatusCell status={chip.status} />
                              </TableCell>
                              <TableCell align="center" sx={cellStyle}>
                                <IconButton
                                  size="small"
                                  onClick={() => handleMoveChipInside(chip.id)}
                                  sx={{
                                    padding: "4px",
                                    "&:hover": {
                                      color: "success.main",
                                    },
                                  }}
                                >
                                  <Add fontSize="small" />
                                </IconButton>
                              </TableCell>
                            </TableRow>
                          </Fade>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>

              {/* CHIPS DENTRO */}
              <Grid item xs={12} sm={6}>
                <ChipSearchBar
                  title="CHIPS DENTRO"
                  count={chipsInside.length}
                  searchTerm={searchTermInside}
                  setSearchTerm={setSearchTermInside}
                  onAddChip={() => {}}
                  onRemoveChip={handleMoveAllOutside}
                  isOutside={false}
                />
                <TableContainer
                  sx={{
                    height: "auto",
                    mt: 2,
                    maxHeight: "calc(100vh - 320px)",
                    overflow: "auto",
                    "@media (max-width: 600px)": {
                      maxHeight: "calc(100vh - 320px)",
                    },
                  }}
                >
                  <Table stickyHeader size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={headerCellStyle}>Teléfono</TableCell>
                        <TableCell sx={headerCellStyle}>ICCID</TableCell>
                        <TableCell sx={headerCellStyle}>Status</TableCell>
                        <TableCell sx={headerCellStyle}>Acciones</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredChipsInside.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} align="center" sx={cellStyle}>
                            No hay chips dentro
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredChipsInside.map((chip) => (
                          <Fade key={chip.id} in={true}>
                            <TableRow
                              hover
                              sx={{
                                backgroundColor: recentlyMovedInside.includes(
                                  chip.id
                                )
                                  ? "rgba(76, 175, 80, 0.1)" // Verde con opacidad
                                  : "inherit",
                              }}
                            >
                              <TableCell sx={cellStyle}>
                                <Typography
                                  variant="body2"
                                  sx={{ fontSize: "0.75rem" }}
                                >
                                  {chip.telefono}
                                </Typography>
                              </TableCell>
                              <TableCell sx={cellStyle}>
                                <Typography
                                  variant="body2"
                                  sx={{ fontSize: "0.75rem" }}
                                >
                                  {chip.iccid}
                                </Typography>
                              </TableCell>
                              <TableCell sx={cellStyle}>
                                <StatusCell status={chip.status} />
                              </TableCell>
                              <TableCell align="center" sx={cellStyle}>
                                <IconButton
                                  size="small"
                                  onClick={() => handleMoveChipOutside(chip.id)}
                                  sx={{
                                    padding: "4px",
                                    "&:hover": {
                                      color: "error.main",
                                    },
                                  }}
                                >
                                  <Remove fontSize="small" />
                                </IconButton>
                              </TableCell>
                            </TableRow>
                          </Fade>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleSubmit}
            variant="contained"
            sx={{
              borderRadius: 100,
              backgroundColor: "#000",
              color: "#fff",
              fontFamily: "Inter, sans-serif",
              fontSize: 12,
              textTransform: "none",
            }}
          >
            Guardar cambios
          </Button>
        </DialogActions>
      </Dialog>

      {/* Agregar chips de manera Individual */}
      <IndividualChipModal
        open={openIndividual}
        onClose={handleCloseIndividualModal}
        onAdd={handleAddIndividualChip}
        accountNumber={initialData?.accountNumber || ""}
      />

      {/* Agregar chips de manera Masiva */}
      <MassiveChipModal
        open={openMassive}
        onClose={handleCloseMassiveModal}
        onAdd={handleAddIndividualChip}
      />

    </>
  );
};
