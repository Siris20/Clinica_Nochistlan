import { Box, Button, Chip, TextField } from "@mui/material";
import React, { useState } from "react";

export const ScrappingByUrls = () => {
  const [links, setLinks] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState<string>("");

  const handleAddLink = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" && inputValue.trim()) {
      setLinks((prevLinks) => [...prevLinks, inputValue.trim()]);
      setInputValue("");
    }
  };

  const handleDeleteLink = (linkToDelete: string) => {
    setLinks((prevLinks) => prevLinks.filter((link) => link !== linkToDelete));
  };

  const truncateText = (text: string, maxLength: number) => {
    return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
  };

  return (
    <Box sx={{ padding: 4 }}>
      <TextField
        variant="outlined"
        fullWidth
        placeholder="Pega el link del sitio web aquí y presiona Enter para agregar a la lista"
        value={inputValue}
        onChange={(event) => setInputValue(event.target.value)}
        onKeyDown={handleAddLink}
        sx={{
          marginTop: 6,
          "& .MuiOutlinedInput-root": {
            borderRadius: 16,
          },
        }}
      />

      <p
        style={{
          marginTop: 16,
          fontFamily: "Inter, sans-serif",
          fontWeight: 300,
          fontStyle: "italic",
          fontSize: 12,
        }}
      >
        Haz click en el link de tu empresa para darle nombre a la consulta, o
        por default el nombre de la consulta será el primer link en la lista.
      </p>

      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          marginTop: 2,
          gap: 1,
        }}
      >
        {links.map((link, index) => (
          <Chip
            key={index}
            label={truncateText(link, 30)}
            onDelete={() => handleDeleteLink(link)}
            sx={{
              borderRadius: 16,
              fontWeight: 400,
              backgroundColor: "#ECECEC",
              color: "#000",
              "&:hover": {
                backgroundColor: "#e0e0e0",
              },
            }}
          />
        ))}
      </Box>

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
        Scrapear
      </Button>
    </Box>
  );
};
