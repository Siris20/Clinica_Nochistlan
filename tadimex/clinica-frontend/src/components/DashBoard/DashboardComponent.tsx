import React, { useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  CircularProgress,
  Alert,
} from "@mui/material";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "moment/locale/es"; // Configura las fechas en español
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useAreas } from "../../hooks/Areas/useAreas";
import { useClients } from "../../hooks/Clients/useClients";
import { useCitas } from "../../hooks/Citas/useCitas";

moment.locale("es");
const localizer = momentLocalizer(moment);

// --- MAPA DE COLORES POR ESTADO ---
const COLORES_ESTADO: Record<string, { bg: string; text: string }> = {
  Pendiente: { bg: "#FFF3E0", text: "#E65100" },   // Naranja claro
  Confirmada: { bg: "#E3F2FD", text: "#0D47A1" },  // Azul claro
  Completada: { bg: "#E8F5E9", text: "#1B5E20" },  // Verde claro
  Cancelada: { bg: "#FFEBEE", text: "#C62828" },   // Rojo claro
};

// Auxiliar para formatear fechas al formato requerido por <input type="datetime-local"> sin desfases
const formatToDatetimeLocal = (date: Date | string | null): string => {
  if (!date) return "";
  const d = new Date(date);
  const pad = (num: number) => String(num).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

// Toolbar del Calendario personalizado
const CustomToolbar = (toolbar: any) => {
  const goToBack = () => toolbar.onNavigate("PREV");
  const goToNext = () => toolbar.onNavigate("NEXT");
  const goToCurrent = () => toolbar.onNavigate("TODAY");

  return (
    <div className="rbc-toolbar" style={{ marginBottom: "15px" }}>
      <span className="rbc-btn-group">
        <button type="button" onClick={goToBack}>Atrás</button>
        <button type="button" onClick={goToCurrent}>Hoy</button>
        <button type="button" onClick={goToNext}>Siguiente</button>
      </span>
      <span className="rbc-toolbar-label" style={{ fontWeight: "bold", fontSize: "1.1rem" }}>
        {toolbar.label}
      </span>
      <span className="rbc-btn-group">
        <button type="button" onClick={() => toolbar.onView("month")}>Mes</button>
        <button type="button" onClick={() => toolbar.onView("day")}>Día</button>
        <button type="button" onClick={() => toolbar.onView("agenda")}>Agenda</button>
      </span>
    </div>
  );
};

// --- COMPONENTE PRINCIPAL ---
export const DashboardComponent = () => {
  const SUCURSAL_ACTIVA_ID = 1;

  // Custom Hooks
  const { areas, loading: areasLoading } = useAreas();
  const { clients, loading: clientsLoading } = useClients();

  const [filtroArea, setFiltroArea] = useState("TODAS");

  // Integración de useCitas
  const {
    citas,
    loading: citasLoading,
    error: citasError,
    handleSaveCita,
    handleDeleteCita,
  } = useCitas(filtroArea);

  const [openModal, setOpenModal] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [openConfirmDelete, setOpenConfirmDelete] = useState(false);

  // Estado del formulario
  const [formCita, setFormCita] = useState<{
    id: null | number;
    cliente_id: string;
    area_id: string;
    fecha_inicio: Date | null;
    fecha_fin: Date | null;
    motivo: string;
    observaciones: string;
    estado: string;
  }>({
    id: null,
    cliente_id: "",
    area_id: "",
    fecha_inicio: null,
    fecha_fin: null,
    motivo: "",
    observaciones: "",
    estado: "Pendiente",
  });

  const handleSelectSlot = ({ start }: any) => {
    const dateInicio = new Date(start);
    const dateFin = new Date(start);
    dateFin.setHours(dateFin.getHours() + 1);

    setFormCita({
      id: null,
      cliente_id: "",
      area_id: filtroArea !== "TODAS" ? String(filtroArea) : "",
      fecha_inicio: dateInicio,
      fecha_fin: dateFin,
      motivo: "",
      observaciones: "",
      estado: "Pendiente",
    });
    setModoEdicion(false);
    setOpenModal(true);
  };

  const handleSelectEvent = (evento: any) => {
    setFormCita({
      id: evento.id,
      cliente_id: evento.cliente_id ? String(evento.cliente_id) : (evento.cliente?.id ? String(evento.cliente.id) : ""),
      area_id: evento.area_id ? String(evento.area_id) : (evento.area?.id ? String(evento.area.id) : ""),
      fecha_inicio: new Date(evento.start),
      fecha_fin: new Date(evento.end),
      motivo: evento.motivo || "",
      observaciones: evento.observaciones || "",
      estado: evento.estado || "Pendiente",
    });
    setModoEdicion(true);
    setOpenModal(true);
  };

  const handleGuardarCita = async () => {
    try {
      if (!formCita.fecha_inicio || !formCita.fecha_fin) return;

      const payload: any = {
        cliente_id: parseInt(formCita.cliente_id, 10),
        area_id: parseInt(formCita.area_id, 10),
        sucursal_id: SUCURSAL_ACTIVA_ID,
        fecha_inicio: moment(formCita.fecha_inicio).format(),
        fecha_fin: moment(formCita.fecha_fin).format(),
        motivo: formCita.motivo,
        observaciones: formCita.observaciones,
        ...(modoEdicion && { estado: formCita.estado }),
      };

      await handleSaveCita(payload, modoEdicion, formCita.id);
      setOpenModal(false);
    } catch (err: any) {
      console.error("Error al guardar:", err);
      alert("Error al guardar la cita: " + (err?.message || "Error desconocido"));
    }
  };

  const handleEliminarCita = async () => {
    try {
      if (!formCita.id) return;
      await handleDeleteCita(formCita.id);
      setOpenConfirmDelete(false);
      setOpenModal(false);
    } catch (err: any) {
      console.error("Error al eliminar:", err);
      alert("Error al eliminar la cita: " + (err?.message || "Error desconocido"));
    }
  };

  // --- CONTROLADOR DE COLORES DINÁMICOS POR ESTADO ---
  const eventStyleGetter = (event: any) => {
    const estado = event.estado || "Pendiente";
    const colores = COLORES_ESTADO[estado] || { bg: "#3174ad", text: "#ffffff" };

    return {
      style: {
        backgroundColor: colores.bg,
        color: colores.text,
        borderRadius: "5px",
        opacity: 0.9,
        border: `1px solid ${colores.text}`,
        display: "block",
        fontWeight: "500"
      },
    };
  };

  return (
    <Box sx={{ flexGrow: 1, minHeight: "100vh", padding: 2 }}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Paper sx={{ padding: 3, boxShadow: 3 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
              <Typography variant="h5" sx={{ fontWeight: "bold" }}>Agenda de Citas</Typography>
              
              <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel>Filtrar por Área Médica</InputLabel>
                <Select
                  value={filtroArea}
                  label="Filtrar por Área Médica"
                  onChange={(e) => setFiltroArea(e.target.value)}
                  disabled={areasLoading}
                >
                  <MenuItem value="TODAS">Mostrar Todas</MenuItem>
                  {areasLoading ? (
                    <MenuItem disabled>Cargando áreas...</MenuItem>
                  ) : areas && areas.length > 0 ? (
                    areas.map((area: any) => (
                      <MenuItem key={area.id} value={area.id}>{area.name}</MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled>No hay áreas disponibles</MenuItem>
                  )}
                </Select>
              </FormControl>
            </Box>

            {citasError && <Alert severity="error" sx={{ mb: 2 }}>{citasError}</Alert>}

            {citasLoading ? (
              <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: 600 }}>
                <CircularProgress />
              </Box>
            ) : (
              <Calendar
                localizer={localizer}
                events={citas}
                startAccessor="start"
                endAccessor="end"
                style={{ height: 600 }}
                selectable
                onSelectSlot={handleSelectSlot}
                onSelectEvent={handleSelectEvent}
                components={{ toolbar: CustomToolbar }}
                eventPropGetter={eventStyleGetter}
                messages={{
                  next: "Sig.",
                  previous: "Ant.",
                  today: "Hoy",
                  month: "Mes",
                  week: "Semana",
                  day: "Día",
                  agenda: "Agenda",
                }}
              />
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* --- MODAL UNIFICADO --- */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: "bold" }}>
          {modoEdicion ? "Detalles y Reagendación de Cita" : "Registrar Nueva Cita"}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12}>
              <FormControl fullWidth size="small" disabled={modoEdicion || clientsLoading}>
                <InputLabel>Paciente</InputLabel>
                <Select
                  value={formCita.cliente_id}
                  label="Paciente"
                  onChange={(e) => setFormCita({ ...formCita, cliente_id: e.target.value })}
                >
                  {clientsLoading ? (
                    <MenuItem disabled>Cargando clientes...</MenuItem>
                  ) : clients && clients.length > 0 ? (
                    clients.map((cli: any) => (
                      <MenuItem key={cli.id} value={cli.id}>{cli.nombre_fiscal}</MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled>No hay clientes disponibles</MenuItem>
                  )}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth size="small" disabled={areasLoading}>
                <InputLabel>Área Médica</InputLabel>
                <Select
                  value={formCita.area_id}
                  label="Área Médica"
                  onChange={(e) => setFormCita({ ...formCita, area_id: e.target.value })}
                >
                  {areasLoading ? (
                    <MenuItem disabled>Cargando áreas...</MenuItem>
                  ) : areas && areas.length > 0 ? (
                    areas.map((area: any) => (
                      <MenuItem key={area.id} value={area.id}>{area.name}</MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled>No hay áreas disponibles</MenuItem>
                  )}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                label="Inicio de la Cita"
                type="datetime-local"
                value={formatToDatetimeLocal(formCita.fecha_inicio)}
                InputLabelProps={{ shrink: true }}
                onChange={(e) => {
                  if (!e.target.value) return;
                  const nuevoInicio = new Date(e.target.value);
                  const nuevoFin = new Date(nuevoInicio);
                  nuevoFin.setHours(nuevoFin.getHours() + 1);
                  setFormCita({ ...formCita, fecha_inicio: nuevoInicio, fecha_fin: nuevoFin });
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                label="Fin de la Cita"
                type="datetime-local"
                value={formatToDatetimeLocal(formCita.fecha_fin)}
                InputLabelProps={{ shrink: true }}
                onChange={(e) => {
                  if (!e.target.value) return;
                  setFormCita({ ...formCita, fecha_fin: new Date(e.target.value) });
                }}
              />
            </Grid>

            {modoEdicion && (
              <Grid item xs={12}>
                <FormControl fullWidth size="small">
                  <InputLabel>Estado de la Cita</InputLabel>
                  <Select
                    value={formCita.estado}
                    label="Estado de la Cita"
                    onChange={(e) => setFormCita({ ...formCita, estado: e.target.value })}
                  >
                    <MenuItem value="Pendiente">Pendiente</MenuItem>
                    <MenuItem value="Confirmada">Confirmada</MenuItem>
                    <MenuItem value="Completada">Completada</MenuItem>
                    <MenuItem value="Cancelada">Cancelada</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            )}

            <Grid item xs={12}>
              <TextField
                fullWidth
                size="small"
                label="Motivo de la Consulta"
                value={formCita.motivo}
                onChange={(e) => setFormCita({ ...formCita, motivo: e.target.value })}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                size="small"
                label="Observaciones adicionales"
                multiline
                rows={3}
                value={formCita.observaciones}
                onChange={(e) => setFormCita({ ...formCita, observaciones: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "space-between", px: 3, py: 2 }}>
          <Box>
            {modoEdicion && (
              <Button variant="outlined" color="error" onClick={() => setOpenConfirmDelete(true)}>
                Eliminar Cita
              </Button>
            )}
          </Box>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button onClick={() => setOpenModal(false)} color="inherit">Cancelar</Button>
            <Button onClick={handleGuardarCita} variant="contained" color="primary">
              {modoEdicion ? "Guardar Cambios" : "Agendar Cita"}
            </Button>
          </Box>
        </DialogActions>
      </Dialog>

      {/* --- DIÁLOGO DE CONFIRMACIÓN DE ELIMINACIÓN --- */}
      <Dialog open={openConfirmDelete} onClose={() => setOpenConfirmDelete(false)}>
        <DialogTitle sx={{ fontWeight: "bold" }}>¿Eliminar esta cita?</DialogTitle>
        <DialogContent>
          <Typography>
            Esta acción borrará la cita de forma permanente de la base de datos. Si solo el paciente no asistirá, considera cambiar su estado a "Cancelada". ¿Deseas continuar?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenConfirmDelete(false)} color="inherit">Mantener Cita</Button>
          <Button onClick={handleEliminarCita} variant="contained" color="error">Eliminar Permanentemente</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};