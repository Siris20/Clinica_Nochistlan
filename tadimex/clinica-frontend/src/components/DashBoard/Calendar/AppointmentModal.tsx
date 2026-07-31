import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Box,
  SelectChangeEvent,
  FormHelperText,
  Alert,
} from "@mui/material";
import { Specialist } from "./SpecialistSelector";

export interface FormCitaState {
  id: number | null;
  cliente_id: string;
  area_id: string;
  especialista_id: string;
  fecha_inicio: Date | null;
  fecha_fin: Date | null;
  motivo: string;
  observaciones: string;
  estado: string;
}

interface AppointmentModalProps {
  open: boolean;
  modoEdicion: boolean;
  formCita: FormCitaState;
  setFormCita: React.Dispatch<React.SetStateAction<FormCitaState>>;
  onClose: () => void;
  onSave: () => void;
  onOpenDelete: () => void;
  clients: any[];
  areas: any[];
  especialistas: Specialist[];
  clientsLoading?: boolean;
  areasLoading?: boolean;
  apiError?: string | null; // Propietario del mensaje recibido desde el backend
}

const formatToDatetimeLocal = (date: Date | string | null): string => {
  if (!date) return "";
  const d = new Date(date);
  const pad = (num: number) => String(num).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export const AppointmentModal: React.FC<AppointmentModalProps> = ({
  open,
  modoEdicion,
  formCita,
  setFormCita,
  onClose,
  onSave,
  onOpenDelete,
  clients = [],
  areas = [],
  especialistas = [],
  clientsLoading = false,
  areasLoading = false,
  apiError = null, // 1. Recibes apiError aquí
}) => {
  // Estado para controlar la validación visual
  const [touched, setTouched] = useState<boolean>(false);

  // Reinicia la validación cada vez que se abre/cierra el modal
  useEffect(() => {
    if (!open) {
      setTouched(false);
    }
  }, [open]);

  // Validaciones
  const isClienteInvalid = touched && !formCita.cliente_id;
  const isAreaInvalid = touched && !formCita.area_id;
  const isEspecialistaInvalid = touched && !formCita.especialista_id;
  const isMotivoInvalid = touched && !formCita.motivo?.trim();

  // Función interceptora al presionar Guardar/Agendar
  const handleSaveClick = () => {
    setTouched(true);

    // Si algún campo requerido está vacío, detiene la ejecución
    if (!formCita.cliente_id || !formCita.area_id || !formCita.especialista_id || !formCita.motivo?.trim()) {
      return;
    }

    onSave();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: "bold" }}>
        {modoEdicion ? "Detalles y Reagendación de Cita" : "Registrar Nueva Cita"}
      </DialogTitle>
      <DialogContent dividers>
        
        {/* 2. Si hay un error del backend (como horario ocupado), se despliega esta alerta */}
        {apiError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {apiError}
          </Alert>
        )}

        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          {/* Paciente */}
          <Grid item xs={12}>
            <FormControl fullWidth size="small" disabled={modoEdicion || clientsLoading} error={isClienteInvalid}>
              <InputLabel>Paciente *</InputLabel>
              <Select
                value={formCita.cliente_id}
                label="Paciente *"
                onChange={(e: SelectChangeEvent) =>
                  setFormCita({ ...formCita, cliente_id: e.target.value })
                }
              >
                {clients.map((cli) => (
                  <MenuItem key={cli.id} value={cli.id}>{cli.nombre_fiscal}</MenuItem>
                ))}
              </Select>
              {isClienteInvalid && <FormHelperText>Por favor selecciona un paciente</FormHelperText>}
            </FormControl>
          </Grid>

          {/* Área */}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth size="small" disabled={areasLoading} error={isAreaInvalid}>
              <InputLabel>Área Médica *</InputLabel>
              <Select
                value={formCita.area_id}
                label="Área Médica *"
                onChange={(e: SelectChangeEvent) =>
                  setFormCita({ ...formCita, area_id: e.target.value })
                }
              >
                {areas.map((area) => (
                  <MenuItem key={area.id} value={area.id}>{area.name}</MenuItem>
                ))}
              </Select>
              {isAreaInvalid && <FormHelperText>El área médica es requerida</FormHelperText>}
            </FormControl>
          </Grid>

          {/* Especialista */}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth size="small" error={isEspecialistaInvalid}>
              <InputLabel>Especialista *</InputLabel>
              <Select
                value={formCita.especialista_id}
                label="Especialista *"
                onChange={(e: SelectChangeEvent) =>
                  setFormCita({ ...formCita, especialista_id: e.target.value })
                }
              >
                {especialistas.map((esp) => (
                  <MenuItem key={esp.id} value={esp.id}>
                    {esp.nombre ? `Dr. ${esp.nombre}` : `Cédula: ${esp.cedula_profesional}`}
                  </MenuItem>
                ))}
              </Select>
              {isEspecialistaInvalid && <FormHelperText>Selecciona un especialista</FormHelperText>}
            </FormControl>
          </Grid>

          {/* Fechas */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              size="small"
              label="Inicio de la Cita"
              type="datetime-local"
              value={formatToDatetimeLocal(formCita.fecha_inicio)}
              InputLabelProps={{ shrink: true }}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
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
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                if (!e.target.value) return;
                setFormCita({ ...formCita, fecha_fin: new Date(e.target.value) });
              }}
            />
          </Grid>

          {/* Estado */}
          {modoEdicion && (
            <Grid item xs={12}>
              <FormControl fullWidth size="small">
                <InputLabel>Estado de la Cita</InputLabel>
                <Select
                  value={formCita.estado}
                  label="Estado de la Cita"
                  onChange={(e: SelectChangeEvent) =>
                    setFormCita({ ...formCita, estado: e.target.value })
                  }
                >
                  <MenuItem value="PROGRAMADA">Programada</MenuItem>
                  <MenuItem value="CONFIRMADA">Confirmada</MenuItem>
                  <MenuItem value="PENDIENTE">Pendiente</MenuItem>
                  <MenuItem value="COMPLETADA">Completada</MenuItem>
                  <MenuItem value="CANCELADA">Cancelada</MenuItem>
                  <MenuItem value="NO_ASISTIO">No Asistió</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          )}

          {/* Motivo y Observaciones */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              size="small"
              label="Motivo de la Consulta *"
              value={formCita.motivo}
              error={isMotivoInvalid}
              helperText={isMotivoInvalid ? "El motivo de la consulta es obligatorio" : ""}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFormCita({ ...formCita, motivo: e.target.value })
              }
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              size="small"
              label="Observaciones"
              multiline
              rows={2}
              value={formCita.observaciones}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFormCita({ ...formCita, observaciones: e.target.value })
              }
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ justifyContent: "space-between", px: 3, py: 2 }}>
        <Box>
          {modoEdicion && (
            <Button variant="outlined" color="error" onClick={onOpenDelete}>
              Eliminar Cita
            </Button>
          )}
        </Box>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button onClick={onClose} color="inherit">Cancelar</Button>
          <Button onClick={handleSaveClick} variant="contained" color="primary">
            {modoEdicion ? "Guardar Cambios" : "Agendar Cita"}
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};