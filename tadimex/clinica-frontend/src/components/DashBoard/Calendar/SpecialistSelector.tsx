import React from "react";
import { Box, IconButton, Typography, Paper, Tooltip } from "@mui/material";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import PersonIcon from "@mui/icons-material/Person";

export interface Specialist {
  id: number;
  cedula_profesional: string;
  especialidad: string;
  area_id?: number;
  nombre?: string;
}

interface SpecialistSelectorProps {
  especialistas: Specialist[];
  selectedIndex: number; // -1 representa "Todos los especialistas"
  onChangeIndex: (newIndex: number) => void;
  loading?: boolean;
}

export const SpecialistSelector: React.FC<SpecialistSelectorProps> = ({
  especialistas = [],
  selectedIndex = -1,
  onChangeIndex,
  loading = false,
}) => {
  if (!especialistas || especialistas.length === 0) return null;

  const handlePrev = () => {
    if (selectedIndex <= -1) {
      onChangeIndex(especialistas.length - 1);
    } else {
      onChangeIndex(selectedIndex - 1);
    }
  };

  const handleNext = () => {
    if (selectedIndex >= especialistas.length - 1) {
      onChangeIndex(-1); // Regresa a "Todos"
    } else {
      onChangeIndex(selectedIndex + 1);
    }
  };

  const currentSpecialist = selectedIndex >= 0 ? especialistas[selectedIndex] : null;

  return (
    <Paper
      elevation={1}
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        px: 2,
        py: 1,
        borderRadius: 2,
        bgcolor: "#f8f9fa",
        border: "1px solid #e0e0e0",
        my: 2,
      }}
    >
      <Tooltip title="Especialista anterior">
        <IconButton onClick={handlePrev} size="small" disabled={loading}>
          <ArrowBackIosNewIcon fontSize="small" />
        </IconButton>
      </Tooltip>

      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <PersonIcon color="primary" />
        <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#333" }}>
          {currentSpecialist
            ? `Dr. / Dra. ${currentSpecialist.nombre || `Cédula: ${currentSpecialist.cedula_profesional}`}`
            : "Todos los especialistas del área"}
        </Typography>
        {currentSpecialist?.especialidad && (
          <Typography variant="caption" sx={{ color: "gray", ml: 1 }}>
            ({currentSpecialist.especialidad})
          </Typography>
        )}
      </Box>

      <Tooltip title="Siguiente especialista">
        <IconButton onClick={handleNext} size="small" disabled={loading}>
          <ArrowForwardIosIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </Paper>
  );
};