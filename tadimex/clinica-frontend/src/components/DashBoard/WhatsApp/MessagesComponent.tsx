import {
  Box,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import React, { useState } from "react";
import { CalendarMonth, Edit, Message } from "@mui/icons-material";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import { MessagesTableComponent } from "./MessagesTableComponent";
import { CalendarComponent } from "./CalendarComponent";

export const MessagesComponent = () => {
  const [alignment, setAlignment] = useState("whatsapp");

  const handleChange = (
    event: React.MouseEvent<HTMLElement>,
    newAlignment: string
  ) => {
    setAlignment(newAlignment);
  };

  return (
    <>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 2,
          marginTop: 5,
        }}
      >
        <Typography variant="h6" gutterBottom component="div">
          Mensajería de WhatsApp
        </Typography>
        <ToggleButtonGroup
          value={alignment}
          exclusive
          onChange={handleChange}
          aria-label="text alignment"
          sx={{ marginLeft: 2 }}
        >
          <ToggleButton
            value="whatsapp"
            aria-label="left aligned"
            sx={{
              borderRadius: 16,
              backgroundColor:
                alignment === "whatsapp" ? "#25D366" : "transparent",
              "&.Mui-selected": {
                backgroundColor: "#25D366",
                color: "white",
                "&:hover": {
                  backgroundColor: "#25D366",
                },
              },
              "&:hover": {
                backgroundColor:
                  alignment === "whatsapp" ? "#25D366" : "lightgrey",
              },
            }}
          >
            <WhatsAppIcon />
          </ToggleButton>
          <ToggleButton
            value="calendar"
            aria-label="right aligned"
            sx={{
              borderRadius: 16,
              backgroundColor:
                alignment === "calendar" ? "#333C87" : "transparent",
              "&.Mui-selected": {
                backgroundColor: "#333C87",
                color: "white",
                "&:hover": {
                  backgroundColor: "#333C87",
                },
              },
              "&:hover": {
                backgroundColor:
                  alignment === "calendar" ? "#333C87" : "lightgrey",
              },
            }}
          >
            <CalendarMonth />
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Renderizar tabla de mensajes y calendario */}
      {alignment === "whatsapp" ? (
        <MessagesTableComponent />
      ) : (
        <CalendarComponent />
      )}
    </>
  );
};
