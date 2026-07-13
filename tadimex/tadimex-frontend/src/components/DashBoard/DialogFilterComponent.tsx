import React, { useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import {
  Grid,
  TextField,
  Autocomplete,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
} from "@mui/material";

export const DialogFilterComponent = ({ open, setOpen, onFilter }) => {

  const [selectedLists, setSelectedLists] = useState([]);



  //Listas de contactos que se debe obtener del endpoint
  const contactos = [
    "Clientes Potenciales",
    "Clientes de CentralGPS",
    "Proveedores",
  ];

  //Cerrar dialogo
  const handleCloseDialog = () => {
    setOpen(false);
  };

  //Guardar cambios
  const handleSave = () => {
    onFilter(selectedLists);
    setOpen(false);
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={handleCloseDialog}
        PaperProps={{
          sx: {
            width: "830px",
            maxWidth: "none",
            height: "300px",
            borderRadius: 5,
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
          Filtrar por ...
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
        <DialogContent>
          <div style={{ fontWeight: "bold", marginBottom: "8px" }}>
            Lista de contactos
          </div>
          <Autocomplete
            multiple
            value={selectedLists}
            onChange={(event, newValue) => {
              setSelectedLists(newValue);
            }}
            options={contactos}
            renderInput={(params) => (
              <TextField
                {...params}
                placeholder="Selecciona un contacto"
                variant="outlined"
                size="small"
                sx={{
                  fontFamily: "Inter, sans-serif",
                }}
              />
            )}
          />
        </DialogContent>

        <DialogActions>
          <Button
            variant="contained"
            sx={{
              borderRadius: 100,
              backgroundColor: "#000",
              color: "#fff",
              fontFamily: "Inter, sans-serif",
              fontSize: 12,
            }}
            onClick={handleSave}
          >
            Filtrar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
