import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
} from "@mui/material";

export const RenamePDFDialog = ({ 
  open, 
  onClose, 
  onDownload, 
  defaultFileName = "" 
}) => {
  const [pdfName, setPdfName] = useState(defaultFileName);

  // Actualizar el nombre cuando cambie el defaultFileName
  useEffect(() => {
    setPdfName(defaultFileName);
  }, [defaultFileName]);

  const handleDownload = () => {
    onDownload(pdfName);
    setPdfName("");
  };

  const handleClose = () => {
    setPdfName("");
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
          value={pdfName}
          onChange={(e) => setPdfName(e.target.value)}
          variant="outlined"
          helperText="Se añadirá la extensión .pdf automáticamente"
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