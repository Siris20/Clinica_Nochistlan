import React, { useEffect, useState } from "react";
import {
  Autocomplete,
  TextField,
  CircularProgress,
  Typography,
  Box,
  Popper,
  Grid
} from "@mui/material";
import { useSatConcepts } from "../../../hooks/SatConcepts/useSatConcepts";

// Componente personalizado para el campo de código SAT con autocompletado
export const SatCodeField = ({ 
  formData, 
  setFormData, 
  errors, 
  titleStyle 
}) => {
  // Usar el hook personalizado para conceptos SAT
  const { 
    searchSatConcepts, 
    searchResults, 
    searchLoading, 
    clearSearchResults 
  } = useSatConcepts();
  
  // Estado para el input de búsqueda
  const [inputValue, setInputValue] = useState("");
  
  // Estado para la opción seleccionada
  const [selectedOption, setSelectedOption] = useState(null);

  // Efecto para buscar cuando cambia el inputValue
  useEffect(() => {
    // Evitar búsquedas con menos de 2 caracteres
    if (inputValue.length < 2) {
      clearSearchResults();
      return;
    }
    
    // Establecer un pequeño retraso para evitar demasiadas solicitudes
    const timeoutId = setTimeout(() => {
      searchSatConcepts(inputValue);
    }, 300);
    
    // Limpiar el timeout si el componente se desmonta o el input cambia
    return () => clearTimeout(timeoutId);
  }, [inputValue]);

  // Efecto para establecer el valor inicial si existe en formData
  useEffect(() => {
    if (formData.SAT_code && formData.SAT_concept) {
      setSelectedOption({
        clave: formData.SAT_code,
        descripcion: formData.SAT_concept
      });
    }
  }, [formData.SAT_code, formData.SAT_concept]);

  // Función para manejar cambios en el valor seleccionado
  const handleChange = (event, newValue) => {
    if (newValue) {
      setSelectedOption(newValue);
      setFormData((prev) => ({
        ...prev,
        SAT_code: newValue.clave,
        SAT_concept: newValue.descripcion
      }));
    } else {
      setSelectedOption(null);
      setFormData((prev) => ({
        ...prev,
        SAT_code: "",
        SAT_concept: ""
      }));
    }
  };

  // Componente personalizado para el Popper para mejorar el rendimiento
  const CustomPopper = function (props) {
    return <Popper {...props} placement="bottom-start" />;
  };

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} md={6}>
        <Typography sx={titleStyle}>Código SAT:</Typography>
        <Autocomplete
          id="sat-code-autocomplete"
          value={selectedOption}
          onChange={handleChange}
          inputValue={inputValue}
          onInputChange={(event, newInputValue) => {
            setInputValue(newInputValue);
          }}
          options={searchResults}
          getOptionLabel={(option) => `${option.clave} - ${option.descripcion}`}
          isOptionEqualToValue={(option, value) => option.clave === value.clave}
          loading={searchLoading}
          noOptionsText="No se encontraron conceptos"
          loadingText="Buscando..."
          PopperComponent={CustomPopper}
          renderInput={(params) => (
            <TextField
              {...params}
              variant="outlined"
              label="Código SAT"
              size="small"
              fullWidth
              required
              error={!!errors.SAT_code}
              helperText={errors.SAT_code}
              InputProps={{
                ...params.InputProps,
                endAdornment: (
                  <>
                    {searchLoading ? <CircularProgress color="inherit" size={20} /> : null}
                    {params.InputProps.endAdornment}
                  </>
                ),
              }}
            />
          )}
          renderOption={(props, option) => (
            <Box component="li" {...props} sx={{ fontSize: '0.875rem' }}>
              <strong>{option.clave}</strong> - {option.descripcion}
            </Box>
          )}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <Typography sx={titleStyle}>Concepto SAT:</Typography>
        <TextField
          variant="outlined"
          label="Concepto SAT"
          size="small"
          fullWidth
          required
          name="SAT_concept"
          value={formData.SAT_concept || ""}
          disabled={true}
          InputProps={{
            readOnly: true,
          }}
        />
      </Grid>
    </Grid>
  );
};