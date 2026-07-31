import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  IconButton,
  Typography,
  Box,
  Tooltip,
} from "@mui/material";
import { Edit, Delete } from "@mui/icons-material";
import { Especialista, useEspecialistas } from "../../../hooks/Especialistas/useEspecialistas";
import Loader from "../../Loader";

interface SpecialistsListTableProps {
  areaId: number;
  onEdit: (especialista: Especialista) => void;
  onDelete: (especialista: Especialista) => void;
}

export const SpecialistsListTable: React.FC<SpecialistsListTableProps> = ({
  areaId,
  onEdit,
  onDelete,
}) => {
  const { especialistas, loading, error } = useEspecialistas(areaId);

  if (loading) {
    return (
      <Box sx={{ p: 2, display: "flex", justifyContent: "center" }}>
        <Loader />
      </Box>
    );
  }

  if (error) {
    return (
      <Typography color="error" variant="body2" sx={{ p: 2 }}>
        {error}
      </Typography>
    );
  }

  if (especialistas.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ p: 2, fontStyle: "italic" }}>
        No hay especialistas registrados en esta área.
      </Typography>
    );
  }

  return (
    <Table size="small" aria-label="especialistas">
      <TableHead>
        <TableRow sx={{ backgroundColor: "#eaeaea" }}>
          <TableCell><strong>Cédula Prof.</strong></TableCell>
          <TableCell><strong>Especialidad</strong></TableCell>
          <TableCell><strong>Universidad</strong></TableCell>
          <TableCell><strong>ID Empleado</strong></TableCell>
          <TableCell align="right"><strong>Acciones</strong></TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {especialistas.map((esp) => (
          <TableRow key={esp.id}>
            <TableCell>{esp.cedula_profesional}</TableCell>
            <TableCell>{esp.especialidad}</TableCell>
            <TableCell>{esp.universidad_egreso || "-"}</TableCell>
            <TableCell>{esp.empleado_id}</TableCell>
            <TableCell align="right">
              <Tooltip title="Editar especialista">
                <IconButton size="small" color="primary" onClick={() => onEdit(esp)}>
                  <Edit fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Eliminar del área">
                <IconButton size="small" color="error" onClick={() => onDelete(esp)}>
                  <Delete fontSize="small" />
                </IconButton>
              </Tooltip>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};