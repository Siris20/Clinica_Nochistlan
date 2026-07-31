import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Grid,
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
} from "@mui/material";
import moment from "moment";

import { useAreas } from "../../hooks/Areas/useAreas";
import { useClients } from "../../hooks/Clients/useClients";
import { useEspecialistas } from "../../hooks/Especialistas/useEspecialistas";
import { useCitas } from "../../hooks/Citas/useCitas";

import { SpecialistSelector } from "./Calendar/SpecialistSelector";
import { CustomCalendar } from "./Calendar/CustomCalendar";
import { AppointmentModal } from "./Calendar/AppointmentModal";
import { DeleteDialogConfirmComponent } from "./DeleteDialogConfirmComponent";

export const DashboardComponent = () => {
  const SUCURSAL_ACTIVA_ID = 1;

  // 1. Hooks principales
  const { areas, loading: areasLoading } = useAreas();
  const { clients, loading: clientsLoading } = useClients();

  // Estado para el área seleccionada (Inicializa en cadena vacía hasta cargar las áreas)
  const [filtroArea, setFiltroArea] = useState<string | number>("");
  const [specialistIndex, setSpecialistIndex] = useState<number>(-1); // -1 = Todos los del área

  // 2. Selección automática del primer Área cuando se cargan de la base de datos
  useEffect(() => {
    if (areas && areas.length > 0 && !filtroArea) {
      setFiltroArea(areas[0].id);
    }
  }, [areas, filtroArea]);

  // 3. Hooks dependientes del área seleccionada
  const { especialistas, loading: especialistasLoading } = useEspecialistas(filtroArea);
  const { citas, loading: citasLoading, error: citasError, handleSaveCita, handleDeleteCita } = useCitas(filtroArea);

  // 4. Filtrado de citas según el especialista activo en el Selector Horizontal
  const citasFiltradas = useMemo(() => {
    if (specialistIndex === -1 || !especialistas[specialistIndex]) {
      return citas;
    }
    const espActivoId = especialistas[specialistIndex].id;
    return citas.filter((c: any) => c.especialista_id === espActivoId || c.especialista?.id === espActivoId);
  }, [citas, specialistIndex, especialistas]);

  // Modales
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [modoEdicion, setModoEdicion] = useState<boolean>(false);
  const [openConfirmDelete, setOpenConfirmDelete] = useState<boolean>(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [formCita, setFormCita] = useState<any>({
    id: null,
    cliente_id: "",
    area_id: "",
    especialista_id: "",
    fecha_inicio: null,
    fecha_fin: null,
    motivo: "",
    observaciones: "",
    estado: "PENDIENTE",
  });

  const handleSelectSlot = ({ start }: any) => {
    const dateInicio = new Date(start);
    const dateFin = new Date(start);
    dateFin.setHours(dateFin.getHours() + 1);

    const espSeleccionado = specialistIndex >= 0 ? especialistas[specialistIndex]?.id : "";

    setFormCita({
      id: null,
      cliente_id: "",
      area_id: filtroArea ? String(filtroArea) : "",
      especialista_id: espSeleccionado ? String(espSeleccionado) : "",
      fecha_inicio: dateInicio,
      fecha_fin: dateFin,
      motivo: "",
      observaciones: "",
      estado: "PENDIENTE",
    });
    setModoEdicion(false);
    setOpenModal(true);
  };

  const handleSelectEvent = (evento: any) => {
    setFormCita({
      id: evento.id,
      cliente_id: evento.cliente_id ? String(evento.cliente_id) : String(evento.cliente?.id || ""),
      area_id: evento.area_id ? String(evento.area_id) : String(evento.area?.id || ""),
      especialista_id: evento.especialista_id ? String(evento.especialista_id) : String(evento.especialista?.id || ""),
      fecha_inicio: new Date(evento.start),
      fecha_fin: new Date(evento.end),
      motivo: evento.motivo || "",
      observaciones: evento.observaciones || "",
      estado: evento.estado || "PENDIENTE",
    });
    setModoEdicion(true);
    setOpenModal(true);
  };

  const handleGuardarCita = async () => {
  setModalError(null); 
  try {
    const payload: any = {
      cliente_id: parseInt(formCita.cliente_id, 10),
      area_id: parseInt(formCita.area_id, 10),
      especialista_id: parseInt(formCita.especialista_id, 10),
      sucursal_id: SUCURSAL_ACTIVA_ID,
      fecha_inicio: moment(formCita.fecha_inicio).format("YYYY-MM-DDTHH:mm:ss"),
      fecha_fin: moment(formCita.fecha_fin).format("YYYY-MM-DDTHH:mm:ss"),
      motivo: formCita.motivo,
      observaciones: formCita.observaciones,
      ...(modoEdicion && { estado: formCita.estado }),
    };

    await handleSaveCita(payload, modoEdicion, formCita.id);
    setOpenModal(false);
  } catch (err: any) {
    const apiErrorMessage = 
      err?.response?.data?.detail || 
      err?.message || 
      "Error al procesar la cita.";

    setModalError(apiErrorMessage); 
  }
};

  return (
    <Box sx={{ flexGrow: 1, padding: 2 }}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Paper sx={{ padding: 3, boxShadow: 3 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Typography variant="h5" sx={{ fontWeight: "bold" }}>
                Agenda de Citas
              </Typography>

              {/* Selector de Área Médica */}
              <FormControl size="small" sx={{ minWidth: 220 }}>
                <InputLabel>Área Médica</InputLabel>
                <Select
                  value={filtroArea}
                  label="Área Médica"
                  onChange={(e) => {
                    setFiltroArea(e.target.value);
                    setSpecialistIndex(-1); // Resetea el carrusel de especialistas
                  }}
                  disabled={areasLoading}
                >
                  {/* Se eliminó la opción 'TODAS' para evitar encalpes de citas */}
                  {areas?.map((area: any) => (
                    <MenuItem key={area.id} value={area.id}>
                      {area.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            {/* Selector de Especialistas Horizontal */}
            <SpecialistSelector
              especialistas={especialistas}
              selectedIndex={specialistIndex}
              onChangeIndex={setSpecialistIndex}
              loading={especialistasLoading}
            />

            {citasError && <Alert severity="error" sx={{ mb: 2 }}>{citasError}</Alert>}

            {citasLoading ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
                <CircularProgress />
              </Box>
            ) : (
              <CustomCalendar
                events={citasFiltradas}
                onSelectSlot={handleSelectSlot}
                onSelectEvent={handleSelectEvent}
              />
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Modal de Alta y Edición */}
      <AppointmentModal
        open={openModal}
        modoEdicion={modoEdicion}
        formCita={formCita}
        setFormCita={setFormCita}
        onClose={() => setOpenModal(false)}
        onSave={handleGuardarCita}
        onOpenDelete={() => setOpenConfirmDelete(true)}
        clients={clients || []}
        areas={areas || []}
        especialistas={especialistas || []}
        clientsLoading={clientsLoading}
        areasLoading={areasLoading}
        apiError={modalError}
      />

      {/* Modal de Confirmación para Eliminar */}
      <DeleteDialogConfirmComponent
        open={openConfirmDelete}
        onClose={() => setOpenConfirmDelete(false)}
        onConfirm={async () => {
          if (formCita.id) await handleDeleteCita(formCita.id);
          setOpenConfirmDelete(false);
          setOpenModal(false);
        }}
      />
    </Box>
  );
};