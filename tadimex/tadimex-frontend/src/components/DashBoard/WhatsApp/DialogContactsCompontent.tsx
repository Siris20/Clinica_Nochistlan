import React, { useEffect, useRef, useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Tab,
  Tabs,
} from "@mui/material";
import { AddListContactComponent } from "./AddListContactComponent";
import { AddIndividualContactComponent } from "./AddIndividualContactComponent";

export const DialogContactsComponent = ({
  open,
  setOpen,
  onAddContacts,
  onEditMessage,
  initialData,
}) => {
  const [value, setValue] = useState(initialData ? 1 : 0);
  const [listContacts, setListContacts] = useState([]);
  const [individualContact, setIndividualContact] = useState(null);
  const [currentInitialData, setCurrentInitialData] = useState(null);

  //Actualizar currentInitialData cuando se recibe un nuevo initialData
  useEffect(() => {
    setCurrentInitialData(initialData);
  }, [initialData]);

  //Limpiar formulario
  useEffect(() => {
    if (!open) {
      setValue(0);
      setListContacts([]);
      setIndividualContact(null);
      setCurrentInitialData(null);
    }
  }, [open]);


  //Cambiar de pestaña
  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    if(!currentInitialData) {
      setValue(newValue);
    }
  };

  //Cerrar dialogo
  const handleCloseDialog = () => {
    setOpen(false);
  };

  //Agregar contactos
  const handleSave = () => {
    if(currentInitialData) {
      if(individualContact) {
        onEditMessage(individualContact);
      }
    }else {
      if(value==0) {
        onAddContacts(listContacts.map(contact=> ({
          ...contact,
          list: contact.list || "Sin Lista"
        }))); 
      }else {
        if(individualContact) {
          onAddContacts([individualContact]);
        }
      }
    }
    setOpen(false);
  }

  return (
    <>
      <Dialog
        open={open}
        onClose={handleCloseDialog}
        PaperProps={{
          sx: {
            width: "730px",
            height: "90%",
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
          {currentInitialData ? "Editar contactos" : "Agregar contactos"}
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
          {!currentInitialData && (
            <Tabs
            value={value}
            onChange={handleChange}
            textColor="inherit"
            indicatorColor="primary"
            variant="fullWidth"
            TabIndicatorProps={{
              style: {
                backgroundColor: "#0A89FF",
                display: "none",
              },
            }}
            sx={{
              "& .MuiTab-root": {
                flexGrow: 1,
                mx: 1,
                border: "3px solid #ECECEC",
                borderRadius: "4px",
              },
              "& .MuiTab-root.Mui-selected": {
                backgroundColor: "#ECECEC",
                color: "#000",
              },
              "& .MuiTab-root:not(.Mui-selected)": {
                backgroundColor: "#fff",
                color: "#000",
              },
            }}
          >
            <Tab
              label="Agregar lista de contactos"
              sx={{
                flexGrow: 1,
                mx: 1,
                backgroundColor: value === 0 ? "#ECECEC" : "#fff",
                textTransform: "none",
              }}
            />
            <Tab
              label="Agregar contactos individuales"
              sx={{
                flexGrow: 1,
                mx: 1,
                backgroundColor: value === 1 ? "#ECECEC" : "#fff",
                textTransform: "none",
              }}
            />
          </Tabs>
          )}
          
          {/* Renderizar dependiendo de la tab activa */}
          {value === 0 && !currentInitialData? (
            <AddListContactComponent
              listContacts={listContacts}
              setListContacts={setListContacts}
             />
          ) : (
            <AddIndividualContactComponent
              individualContact={individualContact}
              setIndividualContact={setIndividualContact}
              initialData={currentInitialData}
             />
          )}
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
            {currentInitialData ? "Actualizar Contacto" : "Guardar contactos"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
