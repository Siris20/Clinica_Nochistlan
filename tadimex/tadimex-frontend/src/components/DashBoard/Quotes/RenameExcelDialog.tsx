import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
} from "@mui/material";

export const RenameExcelDialog = ({ 
  open, 
  onClose, 
  onDownload, 
  defaultFileName = "" 
}) => {
  const [excelName, setExcelName] = useState(defaultFileName);

  // Actualizar el nombre cuando cambie el defaultFileName
  useEffect(() => {
    setExcelName(defaultFileName);
  }, [defaultFileName]);

  const handleDownload = () => {
    onDownload(excelName);
    setExcelName("");
  };

  const handleClose = () => {
    setExcelName("");
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="xs"
      fullWidth
    >
      <DialogTitle>Descargar como</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Nombre del archivo"
          type="text"
          fullWidth
          value={excelName}
          onChange={(e) => setExcelName(e.target.value)}
          variant="outlined"
          helperText="Se añadirá la extensión .xlsx automáticamente"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="error">
          Cancelar
        </Button>
        <Button 
          onClick={handleDownload}
          color="primary" 
          variant="text"
        >
          Descargar
        </Button>
      </DialogActions>
    </Dialog>
  );
};
