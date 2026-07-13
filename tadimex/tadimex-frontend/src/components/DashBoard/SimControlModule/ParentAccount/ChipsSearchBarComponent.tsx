import React from "react";
import { Box, IconButton, TextField, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";

export const ChipSearchBar = ({
  title,
  count,
  searchTerm,
  setSearchTerm,
  onAddChip,
  onRemoveChip,
  isOutside = true,
}) => {
  return (
    <Box sx={{ width: "100%" }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 1,
        }}
      >
        <Typography
          sx={{
            fontFamily: "Inter, sans-serif",
            fontWeight: "bold",
            fontSize: "14px",
          }}
        >
          [ {count} ] {title}
        </Typography>
      </Box>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          border: "1px solid #D4D4D4",
          borderRadius: "8px",
          overflow: "hidden",
          width: "100%",
          height: 36,
        }}
      >
        <TextField
          placeholder="Buscar chip..."
          variant="standard"
          InputProps={{ disableUnderline: true }}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{
            flexGrow: 1,
            padding: "4px 8px",
          }}
        />
        <IconButton
          sx={{
            borderLeft: "1px solid #D4D4D4",
            borderRadius: 0,
            color: "inherit",
            "&:hover": {
              color: isOutside ? "success.main" : "error.main",
              backgroundColor: "transparent",
            },
          }}
          onClick={isOutside ? onAddChip : onRemoveChip}
        >
          {isOutside ? (
            <Typography
              sx={{
                fontFamily: "Inter, sans-serif",
                fontWeight: "bold",
                fontSize: "12px",
              }}
            >
              Agregar todos
            </Typography>
          ) : (
            <Typography
              sx={{
                fontFamily: "Inter, sans-serif",
                fontWeight: "bold",
                fontSize: "12px",
              }}
            >
              Quitar todos
            </Typography>
          )}
        </IconButton>
      </Box>
    </Box>
  );
};
