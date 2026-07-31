import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
  Grid,
  Box,
  Chip,
  Divider,
} from "@mui/material";
import React from "react";
import CloseIcon from "@mui/icons-material/Close";
import { PatientData } from "../../../hooks/Patients/usePatients";

interface PatientsDetailComponentProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  patient: PatientData | null;
}

export const PatientsDetailComponent: React.FC<PatientsDetailComponentProps> = ({
  open,
  setOpen,
  patient,
}) => {
  const handleCloseDialog = () => {
    setOpen(false);
  };

  if (!patient) return null;

  const fullAddress = [
    patient.calle,
    patient.numero_exterior ? `No. ${patient.numero_exterior}` : null,
    patient.numero_interior ? `Int. ${patient.numero_interior}` : null,
    patient.colonia,
    patient.localidad,
    patient.municipio,
    patient.estado,
    patient.codigo_postal ? `CP ${patient.codigo_postal}` : null,
  ]
    .filter(Boolean)
    .join(", ");

  const nombreCompleto = `${patient.nombre} ${patient.apellido_paterno || ""} ${patient.apellido_materno || ""}`.trim();

  return (
    <Dialog
      open={open}
      onClose={handleCloseDialog}
      PaperProps={{
        sx: {
          width: { xs: "95%", sm: "64rem" },
          maxWidth: "none",
          height: { xs: "auto", sm: "42rem" },
          maxHeight: { xs: "95vh", sm: "none" },
          borderRadius: 5,
        },
      }}
    >
      <DialogTitle
        sx={{
          fontFamily: "Inter, sans-serif",
          fontWeight: "600",
          fontSize: 22,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          pb: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          Expediente Clínico del Paciente
          <Chip
            label={(patient.estatus || "ACTIVO").toUpperCase()}
            color={patient.estatus === "activo" ? "success" : "default"}
            sx={{ fontWeight: "bold", fontSize: "0.75rem" }}
          />
        </Box>
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
      <DialogContent dividers sx={{ fontFamily: "Inter, sans-serif", p: 3 }}>
        <Grid container spacing={3}>
          {/* Datos Personales */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1, color: "primary.main" }}>
              Datos Personales
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary">Nombre Completo</Typography>
                <Typography variant="body2" sx={{ fontWeight: 500, bg: "#f5f5f5", p: 1, borderRadius: 1 }}>
                  {nombreCompleto}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Typography variant="caption" color="text.secondary">CURP</Typography>
                <Typography variant="body2" sx={{ fontWeight: 500, bg: "#f5f5f5", p: 1, borderRadius: 1 }}>
                  {patient.curp || "N/A"}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Typography variant="caption" color="text.secondary">Género</Typography>
                <Typography variant="body2" sx={{ fontWeight: 500, bg: "#f5f5f5", p: 1, borderRadius: 1 }}>
                  {patient.genero || "N/A"}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary">Fecha de Nacimiento</Typography>
                <Typography variant="body2" sx={{ fontWeight: 500, bg: "#f5f5f5", p: 1, borderRadius: 1 }}>
                  {patient.fecha_nacimiento || "N/A"}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary">Edad</Typography>
                <Typography variant="body2" sx={{ fontWeight: 500, bg: "#f5f5f5", p: 1, borderRadius: 1 }}>
                  {patient.edad ? `${patient.edad} años` : "N/A"}
                </Typography>
              </Grid>
            </Grid>
          </Grid>

          <Grid item xs={12}><Divider /></Grid>

          {/* Información Médica */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1, color: "primary.main" }}>
              Información Médica
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <Typography variant="caption" color="text.secondary">Grupo Sanguíneo</Typography>
                <Typography variant="body2" sx={{ fontWeight: 500, bg: "#f5f5f5", p: 1, borderRadius: 1 }}>
                  {patient.grupo_sanguineo || "No especificado"}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography variant="caption" color="text.secondary">Peso</Typography>
                <Typography variant="body2" sx={{ fontWeight: 500, bg: "#f5f5f5", p: 1, borderRadius: 1 }}>
                  {patient.peso ? `${patient.peso} kg` : "N/A"}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography variant="caption" color="text.secondary">Altura</Typography>
                <Typography variant="body2" sx={{ fontWeight: 500, bg: "#f5f5f5", p: 1, borderRadius: 1 }}>
                  {patient.altura ? `${patient.altura} m` : "N/A"}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="caption" color="text.secondary">Alergias o Condiciones</Typography>
                <Typography variant="body2" sx={{ fontWeight: 500, bg: "#f5f5f5", p: 1.5, borderRadius: 1 }}>
                  {patient.alergias || "Ninguna registrada"}
                </Typography>
              </Grid>
            </Grid>
          </Grid>

          <Grid item xs={12}><Divider /></Grid>

          {/* Contacto de Emergencia */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1, color: "primary.main" }}>
              Contacto de Emergencia
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={5}>
                <Typography variant="caption" color="text.secondary">Nombre de Contacto</Typography>
                <Typography variant="body2" sx={{ fontWeight: 500, bg: "#f5f5f5", p: 1, borderRadius: 1 }}>
                  {patient.contacto_emergencia_nombre || "No asignado"}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography variant="caption" color="text.secondary">Teléfono</Typography>
                <Typography variant="body2" sx={{ fontWeight: 500, bg: "#f5f5f5", p: 1, borderRadius: 1 }}>
                  {patient.contacto_emergencia_telefono || "N/A"}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Typography variant="caption" color="text.secondary">Parentesco</Typography>
                <Typography variant="body2" sx={{ fontWeight: 500, bg: "#f5f5f5", p: 1, borderRadius: 1 }}>
                  {patient.contacto_emergencia_parentesco || "N/A"}
                </Typography>
              </Grid>
            </Grid>
          </Grid>

          <Grid item xs={12}><Divider /></Grid>

          {/* Contacto y Ubicación */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1, color: "primary.main" }}>
              Contacto y Domicilio
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <Typography variant="caption" color="text.secondary">Teléfono Celular</Typography>
                <Typography variant="body2" sx={{ fontWeight: 500, bg: "#f5f5f5", p: 1, borderRadius: 1 }}>
                  {patient.telefono_celular || "N/A"}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography variant="caption" color="text.secondary">Teléfono Fijo</Typography>
                <Typography variant="body2" sx={{ fontWeight: 500, bg: "#f5f5f5", p: 1, borderRadius: 1 }}>
                  {patient.telefono_fijo || "N/A"}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography variant="caption" color="text.secondary">Correo Electrónico</Typography>
                <Typography variant="body2" sx={{ fontWeight: 500, bg: "#f5f5f5", p: 1, borderRadius: 1 }}>
                  {patient.email || "N/A"}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="caption" color="text.secondary">Dirección Domiciliaria</Typography>
                <Typography variant="body2" sx={{ fontWeight: 500, bg: "#f5f5f5", p: 1.5, borderRadius: 1 }}>
                  {fullAddress || "Sin dirección registrada"}
                </Typography>
              </Grid>
            </Grid>
          </Grid>

          <Grid item xs={12}><Divider /></Grid>

          {/* Observaciones */}
          <Grid item xs={12}>
            <Typography variant="caption" color="text.secondary">Observaciones</Typography>
            <Typography variant="body2" sx={{ fontWeight: 500, bg: "#f5f5f5", p: 1.5, borderRadius: 1 }}>
              {patient.observaciones || "Sin observaciones registradas"}
            </Typography>
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  );
};