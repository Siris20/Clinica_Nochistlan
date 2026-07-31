import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Autocomplete,
  FormControl,
  FormHelperText,
  Alert,
} from "@mui/material";
import { Especialista } from "../../../hooks/Especialistas/useEspecialistas";

// Interfaz extensible para los Empleados recibidos
export interface Empleado {
  id: number;
  nombre?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
}

interface AddSpecialistDialogProps {
  open: boolean;
  onClose: () => void;
  areaId: number;
  initialData?: Especialista | null;
  employees?: Empleado[]; // Lista de empleados recibida del backend
  employeesLoading?: boolean;
  apiError?: string | null;
  onSave: (data: Omit<Especialista, "id"> | Especialista) => Promise<void>;
}

export const AddSpecialistDialog: React.FC<AddSpecialistDialogProps> = ({
  open,
  onClose,
  areaId,
  initialData,
  employees = [],
  employeesLoading = false,
  apiError = null,
  onSave,
}) => {
  const [formData, setFormData] = useState({
    empleado_id: null as number | null,
    cedula_profesional: "",
    especialidad: "",
    universidad_egreso: "",
  });

  const [touched, setTouched] = useState<boolean>(false);

  // Inicializar el formulario según si es edición o nuevo registro
  useEffect(() => {
    if (!open) {
      setTouched(false);
      return;
    }

    if (initialData) {
      setFormData({
        empleado_id: initialData.empleado_id,
        cedula_profesional: initialData.cedula_profesional || "",
        especialidad: initialData.especialidad || "",
        universidad_egreso: initialData.universidad_egreso || "",
      });
    } else {
      setFormData({
        empleado_id: null,
        cedula_profesional: "",
        especialidad: "",
        universidad_egreso: "",
      });
    }
  }, [initialData, open]);

  // Validaciones
  const isEmpleadoInvalid = touched && !formData.empleado_id;
  const isCedulaInvalid = touched && !formData.cedula_profesional.trim();
  const isEspecialidadInvalid = touched && !formData.especialidad.trim();

  // Helper para obtener el nombre completo del empleado
  const getEmpleadoNombre = (emp: Empleado) => {
    if (emp.nombre) return emp.nombre;
    const fullName = `${emp.first_name || ""} ${emp.last_name || ""}`.trim();
    return fullName || `Empleado #${emp.id}`;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);

    // Validación de campos requeridos
    if (!formData.empleado_id || !formData.cedula_profesional.trim() || !formData.especialidad.trim()) {
      return;
    }

    const payload = {
      ...(initialData ? { id: initialData.id } : {}),
      empleado_id: Number(formData.empleado_id),
      area_id: areaId,
      cedula_profesional: formData.cedula_profesional,
      especialidad: formData.especialidad,
      universidad_egreso: formData.universidad_egreso,
    };

    try {
      await onSave(payload as Especialista);
      onClose();
    } catch (err) {
      // El error es capturado y manejado a través de las props/toasts del padre
    }
  };

  // Buscar el objeto del empleado actualmente seleccionado
  const selectedEmpleadoObj = employees.find((e) => e.id === formData.empleado_id) || null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle sx={{ fontWeight: "bold" }}>
          {initialData ? "Editar Especialista" : "Agregar Especialista al Área"}
        </DialogTitle>
        
        <DialogContent dividers>
          {apiError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {apiError}
            </Alert>
          )}

          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            
            {/* Buscador de Empleado (Filtra por Nombre) */}
            <Grid item xs={12}>
              <FormControl fullWidth size="small" error={isEmpleadoInvalid}>
                <Autocomplete
                  options={employees}
                  loading={employeesLoading}
                  disabled={!!initialData} // No permitir cambiar el empleado si estamos editando
                  value={selectedEmpleadoObj}
                  getOptionLabel={(option) => getEmpleadoNombre(option)}
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                  onChange={(_, newValue) => {
                    setFormData({ ...formData, empleado_id: newValue ? newValue.id : null });
                  }}
                  filterOptions={(options, state) => {
                    const query = state.inputValue.toLowerCase().trim();
                    return options.filter((emp) =>
                      getEmpleadoNombre(emp).toLowerCase().includes(query)
                    );
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      size="small"
                      label="Seleccionar Empleado *"
                      placeholder="Escribe el nombre del empleado..."
                      error={isEmpleadoInvalid}
                    />
                  )}
                />
                {isEmpleadoInvalid && (
                  <FormHelperText error>Selecciona un empleado para asignarlo</FormHelperText>
                )}
              </FormControl>
            </Grid>

            {/* Cédula Profesional */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                label="Cédula Profesional *"
                name="cedula_profesional"
                value={formData.cedula_profesional}
                onChange={handleChange}
                error={isCedulaInvalid}
                helperText={isCedulaInvalid ? "La cédula es requerida" : ""}
              />
            </Grid>

            {/* Especialidad */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                label="Especialidad *"
                name="especialidad"
                value={formData.especialidad}
                onChange={handleChange}
                error={isEspecialidadInvalid}
                helperText={isEspecialidadInvalid ? "La especialidad es requerida" : ""}
              />
            </Grid>

            {/* Universidad de Egreso */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                size="small"
                label="Universidad de Egreso"
                name="universidad_egreso"
                value={formData.universidad_egreso}
                onChange={handleChange}
              />
            </Grid>

          </Grid>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={onClose} color="inherit">
            Cancelar
          </Button>
          <Button type="submit" variant="contained" color="primary">
            {initialData ? "Guardar Cambios" : "Agregar Especialista"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};