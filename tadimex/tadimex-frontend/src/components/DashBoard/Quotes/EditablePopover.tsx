import React from "react";
import {
  Popover,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  ClickAwayListener,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";

export const EditablePopover = ({
  open,
  anchorEl,
  onClose,
  value,
  onChange,
  onSave,
  title = "Editar campo",
  placeholder = "",
  saveText = "Guardar",
  cancelText = "Cancelar",
  width = "300px",
  multiline = false,
  rows = 4,
  type = "text",
  step = "1",
  min = "0", 
  max,
  options = [], // Para el tipo select
  optionValue = "id", // Campo para el valor de la opción
  optionLabel = "name", // Campo para el label de la opción
}) => {
  // Validar la entrada según el tipo de campo
  const validateInput = (e) => {
    if (type === "number" || type === "price") {
      // Solo permitir números y punto decimal (para price)
      if (type === "number" && !/[\d]/.test(e.key) && e.key !== "Backspace" && e.key !== "Delete" && e.key !== "ArrowLeft" && e.key !== "ArrowRight") {
        e.preventDefault();
      } else if (type === "price" && !/[\d.]/.test(e.key) && e.key !== "Backspace" && e.key !== "Delete" && e.key !== "ArrowLeft" && e.key !== "ArrowRight") {
        e.preventDefault();
      }
      
      // Evitar múltiples puntos decimales (solo para price)
      if (type === "price" && e.key === "." && value.includes(".")) {
        e.preventDefault();
      }
    }
  };

  // Obtener paso y tipo de entrada correctos según el campo
  const getInputProps = () => {
    switch (type) {
      case "price":
        return {
          step: "0.01",
          min: "0.01",
          max: max,
          inputMode: "decimal"
        };
      case "number":
        // Si es "cantidad", asegurar que el paso sea 1
        if (title.toLowerCase().includes("cantidad")) {
          return {
            step: "1",
            min: "1",
            max: max,
            inputMode: "numeric"
          };
        } 
        // Si es "descuento", permitir decimales
        else if (title.toLowerCase().includes("descuento")) {
          return {
            step: "0.1",
            min: "0",
            max: "100",
            inputMode: "decimal"
          };
        }
        // Para otros campos numéricos genéricos
        return {
          step: step,
          min: min,
          max: max,
          inputMode: "decimal"
        };
      default:
        return {};
    }
  };

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{
        vertical: "top",
        horizontal: "center",
      }}
      transformOrigin={{
        vertical: "bottom",
        horizontal: "center",
      }}
      sx={{
        "& .MuiPopover-paper": {
          boxShadow: "0px 5px 15px rgba(0, 0, 0, 0.2)",
          borderRadius: "8px",
          width: width,
          minWidth: "300px",
          mt: -1,
        },
      }}
    >
      <ClickAwayListener 
        onClickAway={(event) => {
          // No cerrar si el clic fue dentro del Select o sus opciones
          if (type === "select") {
            const target = event.target as Element;
            if (target.closest('.MuiSelect-root') || 
                target.closest('.MuiMenuItem-root') || 
                target.closest('.MuiMenu-root') ||
                target.closest('.MuiPopover-root')) {
              return;
            }
          }
          onClose();
        }}
      >
        <Paper sx={{ p: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
            {title}
          </Typography>
          {type === "select" ? (
            <FormControl fullWidth size="small" sx={{ mb: 1 }}>
              <Select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                autoFocus
                displayEmpty
                MenuProps={{
                  disablePortal: true,
                  PaperProps: {
                    style: {
                      maxHeight: 200,
                      width: 250,
                    },
                  },
                }}
              >
                <MenuItem value="" disabled>
                  {placeholder || "Selecciona una opción"}
                </MenuItem>
                {options.map((option) => (
                  <MenuItem key={option[optionValue]} value={option[optionValue]}>
                    {option[optionLabel]}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          ) : (
            <TextField
              variant="outlined"
              size="small"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onKeyPress={(e) => {
                validateInput(e);
              }}
              placeholder={placeholder}
              fullWidth
              autoFocus
              multiline={multiline}
              rows={multiline ? rows : 1}
              type={type === "text" ? "text" : "number"}
              InputProps={{
                startAdornment: type === "price" ? <Box component="span" sx={{ mr: 0.5 }}>$</Box> : null,
              }}
              sx={{ mb: 1 }}
            />
          )}
          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
            <Button
              size="small"
              onClick={onClose}
              sx={{ textTransform: "none" }}
            >
              {cancelText}
            </Button>
            <Button
              size="small"
              onClick={onSave}
              variant="contained"
              sx={{
                textTransform: "none",
                backgroundColor: "#000",
                "&:hover": {
                  backgroundColor: "#333",
                },
              }}
            >
              {saveText}
            </Button>
          </Box>
        </Paper>
      </ClickAwayListener>
    </Popover>
  );
};