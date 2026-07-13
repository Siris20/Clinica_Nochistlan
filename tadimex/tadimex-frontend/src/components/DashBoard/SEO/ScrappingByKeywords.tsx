import { Button, TextField } from "@mui/material";
import React from "react";

export const ScrappingByKeywords = () => {
  return (
    <>
      <TextField
        variant="outlined"
        fullWidth
        placeholder="Texto de la búsqueda en Google"
        sx={{
          marginTop: 6,
          "& .MuiOutlinedInput-root": {
            borderRadius: 16,
          },
        }}
      />

      <Button
        variant="contained"
        sx={{
          marginTop: 2,
          height: 40,
          width: 176,
          borderRadius: 16,
          backgroundColor: "#ECECEC",
          color: "#000",
          "&:hover": {
            backgroundColor: "#e0e0e0",
          },
          textTransform: "none",
        }}
      >
        Buscar y scrapear
      </Button>
    </>
  );
};
