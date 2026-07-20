import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Fab,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
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
import SearchBar from "../SearchBar";
import { useEmployee } from "../../hooks/Employee/useEmployee";
import { useSystemUser } from "../../hooks/SystemUser/useSystemUser";
import { useAreas } from "../../hooks/Areas/useAreas";
import { useClients } from "../../hooks/Clients/useClients";
import { AdminPanelSettings, Engineering } from "@mui/icons-material";

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

// --- TABLA DE EMPLEADOS ---
const EmployeeTable = ({ onMenuItemClick }: any) => {
  const [searchTerm, setSearchTerm] = useState("");
  const { employees } = useEmployee();

  const filteredData = employees.filter((row: any) =>
    row.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Paper sx={{ padding: 2, boxShadow: 3, height: "100%", position: "relative" }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 2 }}>
        <Typography variant="h6" gutterBottom component="div">Empleados</Typography>
        <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} showIcons={false} />
      </Box>
      <TableContainer sx={{ maxHeight: 200, overflow: "auto" }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ backgroundColor: "#f1f1f1" }}>Nombre</TableCell>
              <TableCell sx={{ backgroundColor: "#f1f1f1" }}>Puesto</TableCell>
              <TableCell sx={{ backgroundColor: "#f1f1f1" }}>Estatus</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredData.map((employee, index) => (
              <TableRow key={index}>
                <TableCell>{employee?.name + " " + employee?.last_name}</TableCell>
                <TableCell>{employee?.position}</TableCell>
                <TableCell>{employee?.status}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Fab
        color="primary"
        sx={{ position: "absolute", bottom: 16, right: 16, width: 40, height: 40 }}
        onClick={() => onMenuItemClick(9)}
      >
        <Engineering />
      </Fab>
    </Paper>
  );
};

// --- TABLA DE USUARIOS ---
const UsersTable = ({ onMenuItemClick }: any) => {
  const [searchTerm, setSearchTerm] = useState("");
  const { systemUsers } = useSystemUser();

  const filteredData = systemUsers.filter((row) =>
    row.employeeData?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Paper sx={{ padding: 2, boxShadow: 3, height: "100%", position: "relative" }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 2 }}>
        <Typography variant="h6" gutterBottom component="div">Usuarios del sistema</Typography>
        <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} showIcons={false} />
      </Box>
      <TableContainer sx={{ maxHeight: 200, overflow: "auto" }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ backgroundColor: "#f1f1f1" }}>Nombre</TableCell>
              <TableCell sx={{ backgroundColor: "#f1f1f1" }}>Privilegio</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredData.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  {user.employeeData?.name + " " + user.employeeData?.last_name || user.name + " " + user.last_name}
                </TableCell>
                <TableCell>{user.rol}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Fab
        color="primary"
        sx={{
          position: "absolute", bottom: 16, right: 16, width: 40, height: 40,
          backgroundColor: "#25D366", "&:hover": { backgroundColor: "#1DA851" },
        }}
        onClick={() => onMenuItemClick(12)}
      >
        <AdminPanelSettings />
      </Fab>
    </Paper>
  );
};

// --- COMPONENTE PRINCIPAL ---
export const DashboardComponent = ({ onMenuItemClick }: any) => {
  const SUCURSAL_ACTIVA_ID = 1;

  const { areas, loading: areasLoading } = useAreas();
  const { clients, loading: clientsLoading } = useClients();

  const [citas, setCitas] = useState<any[]>([]);
  const [citasLoading, setCitasLoading] = useState(false);
  const [citasError, setCitasError] = useState(null);
  const [filtroArea, setFiltroArea] = useState("TODAS");

  const [openModal, setOpenModal] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [openConfirmDelete, setOpenConfirmDelete] = useState(false);

  // Mantenemos las fechas como objetos Date nativos para evitar mutaciones erróneas por husos horarios
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

  const obtenerCitas = async () => {
    setCitasLoading(true);
    setCitasError(null);
    try {
      const baseUrl = (import.meta as any).env.VITE_API_SERVER || "http://localhost:8000";
      
      // MANTENIDO EXACTAMENTE IGUAL A TU CÓDIGO ORIGINAL
      let url = `${baseUrl}/api/v1/?fecha_inicio=2026-01-01T00:00:00&fecha_fin=2026-12-31T23:59:59`;
      
      if (filtroArea && filtroArea !== "TODAS") {
        const areaIdNumerico = Number(filtroArea);
        if (!isNaN(areaIdNumerico)) {
          url += `&area_id=${areaIdNumerico}`;
        }
      }
      
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Error ${res.status}: No se pudieron cargar las citas`);
      const data = await res.json();

      const eventosFormateados = (data as any[]).map((cita: any) => ({
        id: cita.id,
        title: `${cita.cliente?.nombre_fiscal || "Cliente"} - ${cita.area?.name || "Cita"}`,
        start: new Date(cita.fecha_inicio),
        end: new Date(cita.fecha_fin),
        ...cita,
      }));
      setCitas(eventosFormateados);
    } catch (err: any) {
      console.error("Error al obtener las citas:", err);
      setCitasError(err?.message || "Error desconocido al cargar citas");
    } finally {
      setCitasLoading(false);
    }
  };

  useEffect(() => {
    obtenerCitas();
  }, [filtroArea]);

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
      };

      const baseUrl = (import.meta as any).env.VITE_API_SERVER || "http://localhost:8000";
      let url = `${baseUrl}/api/v1/cita`;
      let method = "POST";

      if (modoEdicion) {
        if (!formCita.id) return;
        url = `${baseUrl}/api/v1/cita/${formCita.id}`;
        method = "PUT";
        payload.estado = formCita.estado;
      }

      const response = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        const mensajeError = typeof errorData.detail === 'object' 
          ? JSON.stringify(errorData.detail) 
          : errorData.detail;
          
        alert(mensajeError || "Ocurrió un error al procesar la cita.");
        return;
      }

      setOpenModal(false);
      obtenerCitas();
    } catch (err: any) {
      console.error("Error al guardar:", err);
      alert("Error al guardar la cita: " + (err?.message || "Error desconocido"));
    }
  };

  const handleEliminarCita = async () => {
    try {
      const baseUrl = (import.meta as any).env.VITE_API_SERVER || "http://localhost:8000";
      const response = await fetch(`${baseUrl}/api/v1/cita/${formCita.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setOpenConfirmDelete(false);
        setOpenModal(false);
        obtenerCitas();
      } else {
        alert("No se pudo eliminar la cita.");
      }
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
        <Grid item xs={12} md={6}>
          <EmployeeTable onMenuItemClick={onMenuItemClick} />
        </Grid>
        <Grid item xs={12} md={6}>
          <UsersTable onMenuItemClick={onMenuItemClick} />
        </Grid>

        <Grid item xs={12} sx={{ mt: 2 }}>
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
                    areas.map((area) => (
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
                eventPropGetter={eventStyleGetter} // Aplica los estilos dinámicos de color
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
                    clients.map((cli) => (
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
                <InputLabel>Area Médica</InputLabel>
                <Select
                  value={formCita.area_id}
                  label="Área Médica"
                  onChange={(e) => setFormCita({ ...formCita, area_id: e.target.value })}
                >
                  {areasLoading ? (
                    <MenuItem disabled>Cargando áreas...</MenuItem>
                  ) : areas && areas.length > 0 ? (
                    areas.map((area) => (
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