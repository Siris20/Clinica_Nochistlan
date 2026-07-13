import React, { useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
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
} from "@mui/material";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import { useNavigate } from "react-router-dom";
import SearchBar from "../SearchBar";
import { useEmployee } from "../../hooks/Employee/useEmployee";
import { useSystemUser } from "../../hooks/SystemUser/useSystemUser";
import { AdminPanelSettings, Engineering } from "@mui/icons-material";

const localizer = momentLocalizer(moment);

//Toolbar del Calendario personalizado

const CustomToolbar = (toolbar) => {
  const goToBack = () => {
    toolbar.onNavigate("PREV");
  };

  const goToNext = () => {
    toolbar.onNavigate("NEXT");
  };

  const goToCurrent = () => {
    toolbar.onNavigate("TODAY");
  };

  return (
    <div className="rbc-toolbar">
      <span className="rbc-btn-group">
        <button type="button" onClick={goToBack}>
          Atras
        </button>
        <button type="button" onClick={goToCurrent}>
          Hoy
        </button>
        <button type="button" onClick={goToNext}>
          Siguiente
        </button>
      </span>
      <span className="rbc-toolbar-label">{toolbar.label}</span>
      <span className="rbc-btn-group">
        <button type="button" onClick={() => toolbar.onView("month")}>
          Mes
        </button>
        <button type="button" onClick={() => toolbar.onView("day")}>
          Dia
        </button>
        <button type="button" onClick={() => toolbar.onView("agenda")}>
          Agenda
        </button>
      </span>
    </div>
  );
};

// Tabla 1 - Tabla de Empleados
const EmployeeTable = ({onMenuItemClick}) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  const { employees } = useEmployee();

  const filteredData = employees.filter((row) =>
    row.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Paper
      sx={{ padding: 2, boxShadow: 3, height: "100%", position: "relative" }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 2,
        }}
      >
        <Typography variant="h6" gutterBottom component="div">
          Empleados
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <SearchBar
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            showIcons={false}
          />
        </Box>
      </Box>
      <TableContainer sx={{ maxHeight: 200, overflow: "auto" }}>
        <Table stickyHeader>
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
                <TableCell>
                  {employee?.name + " " + employee?.last_name}
                </TableCell>
                <TableCell>{employee?.position}</TableCell>
                <TableCell>{employee?.status}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {/* //Aqui debe dirigirme a la tab de empleados */}
      <Fab
        color="primary"
        sx={{
          position: "absolute",
          bottom: 16,
          right: 16,
          width: 40,
          height: 40,
        }}
        onClick={() => onMenuItemClick(9)}
        >
        <Engineering />
      </Fab>
    </Paper>
  );
};

// Tabla 2 - Usuarios del Sistema
const UsersTable = ({onMenuItemClick}) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  const { systemUsers } = useSystemUser();

  const filteredData = systemUsers.filter((row) =>
    row.employeeData?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Paper
      sx={{ padding: 2, boxShadow: 3, height: "100%", position: "relative" }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 2,
        }}
      >
        <Typography variant="h6" gutterBottom component="div">
          Usuarios del sistema
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <SearchBar
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            showIcons={false}
          />
        </Box>
      </Box>

      <TableContainer sx={{ maxHeight: 200, overflow: "auto" }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={{ backgroundColor: "#f1f1f1" }}>Nombre</TableCell>
              <TableCell sx={{ backgroundColor: "#f1f1f1" }}>
                Privilegio
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredData.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  {user.employeeData?.name +
                    " " +
                    user.employeeData?.last_name ||
                    user.name + " " + user.last_name}
                </TableCell>
                <TableCell>{user.rol}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {/* //Aqui debe dirigirme a la tab de usuarios */}
      <Fab
        color="primary"
        sx={{
          position: "absolute",
          bottom: 16,
          right: 16,
          width: 40,
          height: 40,
          backgroundColor: "#25D366",
          "&:hover": {
            backgroundColor: "#1DA851",
          },
        }}
        onClick={() => onMenuItemClick(12)}
      >
        <AdminPanelSettings />
      </Fab>
    </Paper>
  );
};

export const DashboardComponent =  ({ onMenuItemClick }) => {
  // const { handleGetEvents, myEvents, loadingEvents } = UseCalendar();

  const [open, setOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<{
    title: string;
    message: string;
    image_path: string;
  } | null>(null);

  const myEvents = [
    {
      title: "Prueba",
      start: new Date(),
      end: new Date(),
      message: "Mensaje de prueba",
      image_path: "https://www.google.com",
    },
  ];

  // useEffect(() => {
  //   handleGetEvents();
  // }, []);

  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedEvent(null);
  };

  return (
    <Box sx={{ flexGrow: 1, height: "100vh", padding: 2 }}>
      <Grid container spacing={2} sx={{ height: "100%" }}>
        {/* Primera Fila */}
        <Grid container item spacing={2}>
          {/* Primera Columna */}
          <Grid item xs={12} md={6}>
            <EmployeeTable onMenuItemClick={onMenuItemClick} />
          </Grid>
          {/* Segunda Columna */}
          <Grid item xs={12} md={6}>
            <UsersTable onMenuItemClick={onMenuItemClick}  />
          </Grid>
        </Grid>

        {/* Segunda Fila */}
        <Grid
          item
          xs={12}
          sx={{ display: "flex", justifyContent: "center", mt: 2 }}
        >
          <Paper
            sx={{ padding: 2, boxShadow: 3, height: "100%", width: "100%" }}
          >
            <Typography variant="h6" gutterBottom component="div" align="left">
              Calendario
            </Typography>
            <Calendar
              localizer={localizer}
              events={myEvents}
              startAccessor="start"
              endAccessor="end"
              style={{ height: 500 }}
              components={{
                toolbar: CustomToolbar,
              }}
              onSelectEvent={handleSelectEvent}
            />
          </Paper>
        </Grid>
      </Grid>

      {/* Modal */}
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Detalles del Evento</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {selectedEvent && (
              <>
                <strong>Título:</strong> {selectedEvent.title}
                <br />
                <strong>Mensaje:</strong> {selectedEvent.message}
                <br />
                <strong>Imagen:</strong> {selectedEvent.image_path}
                <br />
              </>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
