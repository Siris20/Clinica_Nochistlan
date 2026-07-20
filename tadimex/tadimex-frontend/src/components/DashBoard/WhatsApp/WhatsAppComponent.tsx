import React, { useState } from "react";
import {
  Paper,
  Tabs,
  Tab,
} from "@mui/material";
import { MessagesComponent } from "./MessagesComponent";
import { ContactsComponent } from "./ContactsComponent";

export const WhatsAppComponent = () => {
  const [value, setValue] = useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Paper
      sx={{
        padding: 2,
        boxShadow: 3,
        height: "100vh",
        position: "relative",
        borderRadius: "none",
      }}
    >
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
          label="Mensajes"
          sx={{
            flexGrow: 1,
            mx: 1,
            backgroundColor: value === 0 ? "#ECECEC" : "#fff",
          }}
        />
        <Tab
          label="Contactos"
          sx={{
            flexGrow: 1,
            mx: 1,
            backgroundColor: value === 1 ? "#ECECEC" : "#fff",
          }}
        />
      </Tabs>

      {/* Renderizar Mensajes o Contactos */}
      {value === 0 ? <MessagesComponent /> : <ContactsComponent />}
    </Paper>
  );
};
