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
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Alert,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import * as XLSX from 'xlsx';
import { CloudUpload } from "@mui/icons-material";

export const MassiveChipModal = ({ open, onClose, onAdd }) => {
  
  //Estados
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [loadedChips, setLoadedChips] = useState([]);
  const [parentAccount, setParentAccount] = useState("");
  const [receptionDate, setReceptionDate] = useState(dayjs());

  //Función para manejar el cambio de archivo
  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      // Verificar que sea un archivo Excel
      if (
        selectedFile.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
        selectedFile.type === "application/vnd.ms-excel" ||
        selectedFile.name.endsWith('.xlsx') ||
        selectedFile.name.endsWith('.xls')
      ) {
        setFile(selectedFile);
        setError("");
        processExcelFile(selectedFile);
      } else {
        setFile(null);
        setError("Por favor selecciona un archivo Excel válido (.xlsx, .xls)");
      }
    }
  };

  const processExcelFile = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Asumimos que los datos están en la primera hoja
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Convertir a JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        // Mapear a nuestro formato esperado (ajustar según la estructura real del Excel)
        const chips = jsonData.map((row, index) => ({
          id: index + 1,
          telefono: row.Telefono || row.telefono || "",
          iccid: row.ICCID || row.iccid || "",
          montoPlan: row.MontoPlan || row["Monto Plan"] || row.montoPlan || 0,
        }));
        
        setLoadedChips(chips);
      } catch (error) {
        console.error("Error al procesar el archivo Excel:", error);
        setError("Error al procesar el archivo. Verifica que tenga el formato correcto.");
      }
    };
    reader.onerror = () => {
      setError("Error al leer el archivo.");
    };
    reader.readAsArrayBuffer(file);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const droppedFile = event.dataTransfer.files[0];
    if (droppedFile) {
      // Verificar que sea un archivo Excel
      if (
        droppedFile.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
        droppedFile.type === "application/vnd.ms-excel" ||
        droppedFile.name.endsWith('.xlsx') ||
        droppedFile.name.endsWith('.xls')
      ) {
        setFile(droppedFile);
        setError("");
        processExcelFile(droppedFile);
      } else {
        setFile(null);
        setError("Por favor selecciona un archivo Excel válido (.xlsx, .xls)");
      }
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleSave = () => {
    if (loadedChips.length > 0) {
      onAdd({
        parentAccount,
        receptionDate,
        chips: loadedChips
      });
      onClose();
    } else {
      setError("No hay chips para guardar. Por favor carga un archivo Excel válido.");
    }
  };

  // Función para generar y descargar el Excel de ejemplo
  const downloadSampleExcel = () => {
    // Crear datos de ejemplo
    const sampleData = [
      { Telefono: "1234567890", ICCID: "8952140061700312345", "Monto Plan": 350.00 },
      { Telefono: "9876543210", ICCID: "8952140061700398765", "Monto Plan": 450.00 },
      { Telefono: "5555555555", ICCID: "8952140061700355555", "Monto Plan": 250.00 },
    ];
    
    // Crear nuevo workbook
    const workbook = XLSX.utils.book_new();
    
    // Convertir los datos a una hoja
    const worksheet = XLSX.utils.json_to_sheet(sampleData);
    
    // Ajustar el ancho de las columnas
    const wscols = [
      { wch: 15 }, // Telefono
      { wch: 25 }, // ICCID
      { wch: 15 }, // Monto Plan
    ];
    worksheet['!cols'] = wscols;
    
    // Añadir la hoja al workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, "Chips");
    
    // Generar el archivo y descargarlo
    XLSX.writeFile(workbook, "formato_chips_ejemplo.xlsx");
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

  // Estilo para encabezados de tabla
  const headerCellStyle = {
    backgroundColor: "#f1f1f1",
    fontWeight: "bold",
    fontSize: "0.875rem",
  };

  // Estilo para celdas de tabla
  const cellStyle = {
    fontSize: "0.875rem",
  };


  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        component: "form",
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
        Registrar chips de forma masiva
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
            <Grid item xs={12} sm={6}>
              <Typography variant="h6" sx={subtitleStyle}>
                Cuenta Padre
              </Typography>
              <TextField
                name="parentAccount"
                label="Cuenta Padre"
                variant="outlined"
                fullWidth
                value={parentAccount}
                onChange={(e) => setParentAccount(e.target.value)}
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
                  value={receptionDate}
                  onChange={(newValue) => setReceptionDate(newValue)}
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
            <Grid item xs={12}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography variant="h6" sx={subtitleStyle}>
                  Subir Archivo Excel
                </Typography>
                <Typography variant="body2" color="primary" sx={{ cursor: "pointer" }} onClick={downloadSampleExcel}>
                  Descargar formato de ejemplo
                </Typography>
              </Box>
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}
              <Paper
                variant="outlined"
                sx={{
                  p: 3,
                  textAlign: "center",
                  borderStyle: "dashed",
                  borderColor: "#ccc",
                  bgcolor: "#f9f9f9",
                  borderRadius: 2,
                  cursor: "pointer",
                  mb: 2,
                }}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={() => document.getElementById("file-upload").click()}
              >
                <input
                  id="file-upload"
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileChange}
                  style={{ display: "none" }}
                />
                <CloudUpload sx={{ fontSize: 48, color: "#666", mb: 1 }} />
                <Typography variant="body1" sx={{ fontWeight: "medium", mb: 1 }}>
                  {file ? file.name : "Arrastra aquí tu archivo Excel o haz clic para seleccionar"}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Solo archivos Excel (.xlsx, .xls)
                </Typography>
              </Paper>
              {file && (
                <Box sx={{ mt: 1, display: "flex", alignItems: "center" }}>
                  <Typography variant="body2">
                    Archivo cargado: <strong>{file.name}</strong>
                  </Typography>
                </Box>
              )}
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h6" sx={subtitleStyle}>
                Chips cargados: {loadedChips.length}
              </Typography>
              <TableContainer sx={{ maxHeight: 350, mt: 1 }}>
                <Table stickyHeader size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={headerCellStyle}>#</TableCell>
                      <TableCell sx={headerCellStyle}>Teléfono</TableCell>
                      <TableCell sx={headerCellStyle}>ICCID</TableCell>
                      <TableCell sx={headerCellStyle}>Monto Plan</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {loadedChips.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} align="center">
                          No hay chips cargados. Sube un archivo Excel para visualizarlos.
                        </TableCell>
                      </TableRow>
                    ) : (
                      loadedChips.map((chip, index) => (
                        <TableRow key={chip.id || index}>
                          <TableCell sx={cellStyle}>{index + 1}</TableCell>
                          <TableCell sx={cellStyle}>{chip.telefono}</TableCell>
                          <TableCell sx={cellStyle}>{chip.iccid}</TableCell>
                          <TableCell sx={cellStyle}>
                            ${typeof chip.montoPlan === 'number' ? chip.montoPlan.toFixed(2) : chip.montoPlan}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={loadedChips.length === 0}
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
