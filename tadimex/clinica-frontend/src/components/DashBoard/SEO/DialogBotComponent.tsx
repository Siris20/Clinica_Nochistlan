import React, { useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import { v4 as uuidv4 } from 'uuid';
import {
  Autocomplete,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Slider,
  TextField,
} from "@mui/material";

const marks = [
  { value: 100, label: "100" },
  { value: 500, label: "500" },
  { value: 1000, label: "1000" },
];

export const DialogBotComponent = ({ open, setOpen, onAddBot }) => {
  const [botName, setBotName] = useState("");
  const [website, setWebsite] = useState("");
  const [keywords, setKeywords] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [periodicity, setPeriodicity] = useState(500);

  const handleCloseDialogBot = () => {
    setOpen(false);
  };

  const handlePeriodicityChange = (_, value) => {
    setPeriodicity(value);
  };

  const handleSubmit = () => {
    const newBot = {
      id: uuidv4(),
      name: botName,
      website: website,
      keywords: keywords,
      views: 100,
    };
    onAddBot(newBot);
    handleCloseDialogBot();

    //Limpiar campos
    setBotName("");
    setWebsite("");
    setKeywords([]);
    setPeriodicity(500);
  };

  const handleAddKeyword = (event: React.KeyboardEvent) => {
    if ((event.key === "Enter" || event.key === ",") && inputValue.trim()) {
      const newKeywords = inputValue.split(",").map((keyword) => keyword.trim()).filter((keyword) => keyword);
      setKeywords((prevKeywords) => [...prevKeywords, ...newKeywords]);
      setInputValue("");
      event.preventDefault();
    }
  };

  const handleDeleteKeyword = (keywordToDelete: string) => {
    setKeywords((prevKeywords) =>
      prevKeywords.filter((keyword) => keyword !== keywordToDelete)
    );
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={handleCloseDialogBot}
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
          Crear nuevo Bot
          <IconButton
            onClick={handleCloseDialogBot}
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
          <h5 style={{ margin: 16 }}>Nombre del Bot</h5>
          <TextField
            variant="outlined"
            label="Nombre del Bot"
            fullWidth
            value={botName}
            onChange={(e) => setBotName(e.target.value)}
          />
          <h5 style={{ margin: 16 }}>
            Selecciona una consulta previa o ingresa un sitio manualmente
          </h5>
          <Autocomplete
            freeSolo
            options={[
              "aires acondicionados ags",
              "centralgps.com.mx",
              "gps monitoreo",
              "vuelos a cancun",
            ]}
            value={website}
            onChange={(e, newValue) => setWebsite(newValue)}
            renderInput={(params) => (
              <TextField {...params} variant="outlined" label="Sitio web" />
            )}
          />
          <h5 style={{ margin: 16 }}>Palabras clave</h5>
          <TextField
            variant="outlined"
            label="Palabras Clave"
            fullWidth
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleAddKeyword}
            placeholder="Presiona Enter para agregar"
            sx={{ marginBottom: 2 }}
          />
          <Box
            sx={{ display: "flex", flexWrap: "wrap", gap: 1, marginBottom: 2 }}
          >
            {keywords.map((keyword, index) => (
              <Chip
                key={index}
                label={keyword}
                onDelete={() => handleDeleteKeyword(keyword)}
                sx={{ borderRadius: 16 }}
              />
            ))}
          </Box>
          <h5 style={{ margin: 16 }}>Periodicidad (clicks/día)</h5>
          <Slider
            value={periodicity}
            onChange={handlePeriodicityChange}
            valueLabelDisplay="auto"
            marks={marks}
            step={100}
            min={100}
            max={1000}
            sx={{
              marginTop: 4,
              color: "#000",
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleSubmit}
            variant="contained"
            sx={{
              borderRadius: 100,
              backgroundColor: "#000",
              color: "#fff",
              fontFamily: "Inter, sans-serif",
              fontSize: 12,
            }}
          >
            Generar Bot
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
