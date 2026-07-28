import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Button,
  Box,
  Typography,
  Grid,
  TextField,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from 'dayjs';

export const IndividualChipModal = ({ open, onClose, onAdd, accountNumber }) => {
  const [chipData, setChipData] = useState({
    telefono: "",
    iccid: "",
    montoplan: "",
    fechaRecepcion: dayjs(),
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setChipData({
      ...chipData,
      [name]: value,
    });
  };

  const handleDateChange = (date) => {
    setChipData({
      ...chipData,
      fechaRecepcion: date,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Crear el objeto de datos del nuevo chip
    const newChip = {
      telefono: chipData.telefono,
      iccid: chipData.iccid,
      status: "DISPONIBLE", // Status establecido como DISPONIBLE
      montoplan: chipData.montoplan,
      fechaRecepcion: chipData.fechaRecepcion.format("DD/MM/YYYY"),
    };
    
    // Llamar a la función onAdd con los datos del nuevo chip
    onAdd(newChip);
    
    // Limpiar el formulario
    setChipData({
      telefono: "",
      iccid: "",
      montoplan: "",
      fechaRecepcion: dayjs(),
    });
    
    // Cerrar el modal
    onClose();
  };

  const titleStyle = {
    fontFamily: "Inter, sans-serif",
    fontWeight: "bold",
    fontSize: "14px",
    marginBottom: 2,
  };

  const subtitleStyle = {
    fontSize: 16,
    fontWeight: 500,
    marginY: 1,
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        component: "form",
        onSubmit: handleSubmit,
        sx: {
          width: { xs: "95%", sm: "54rem" },
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
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        Registrar nuevo chip
        <IconButton
          onClick={onClose}
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
            <Grid item xs={12}>
              <Typography variant="h6" sx={subtitleStyle}>
                Cuenta Padre
              </Typography>
              <TextField
                name="parentAccount"
                label="Cuenta Padre"
                variant="outlined"
                fullWidth
                value={accountNumber}
                disabled
                sx={{
                  "& .Mui-disabled": {
                    backgroundColor: "#f5f5f5",
                    "-webkit-text-fill-color": "#666",
                  }
                }}
              />
            </Grid>
          </Grid>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="h6" sx={subtitleStyle}>
                Télefono
              </Typography>
              <TextField
                name="telefono"
                label="Télefono"
                variant="outlined"
                fullWidth
                value={chipData.telefono}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="h6" sx={subtitleStyle}>
                ICCID
              </Typography>
              <TextField
                name="iccid"
                label="ICCID"
                variant="outlined"
                fullWidth
                value={chipData.iccid}
                onChange={handleInputChange}
                required
              />
            </Grid>
          </Grid>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="h6" sx={subtitleStyle}>
                Monto Plan
              </Typography>
              <TextField
                type="number"
                name="montoplan"
                label="Monto Plan"
                variant="outlined"
                fullWidth
                value={chipData.montoplan}
                onChange={handleInputChange}
                inputProps={{
                  step: ".01",
                  min: "0",
                  onKeyPress: (e) => {
                    if (!/[\d.]/.test(e.key)) {
                      e.preventDefault();
                    }
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="h6" sx={subtitleStyle}>
                Fecha Recepción
              </Typography>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    format="DD/MM/YYYY"
                    views={["day", "month", "year"]}
                    openTo="day"
                    minDate={dayjs()}
                    value={chipData.fechaRecepcion}
                    onChange={handleDateChange}
                    slotProps={{
                      textField: {
                        size: "medium",
                        fullWidth: true,
                        sx: {
                          "& .MuiOutlinedInput-root": {
                            fontSize: "14px",
                          },
                        },
                      },
                    }}
                  />
                </LocalizationProvider>
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button
          type="submit"
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
          Guardar
        </Button>
      </DialogActions>
    </Dialog>
  );
};