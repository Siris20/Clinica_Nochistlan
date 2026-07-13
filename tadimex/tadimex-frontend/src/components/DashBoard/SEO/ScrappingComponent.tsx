import React, { useState } from "react";
import { Button, Grid } from "@mui/material";
import { ScrappingByKeywords } from "./ScrappingByKeywords";
import { ScrappingByUrls } from "./ScrappingByUrls";

export const ScrappingComponent = () => {
  const [selectedButton, setSelectedButton] = useState(0);
  const handleButtonClick = (buttonIndex: number) => {
    setSelectedButton(buttonIndex);
  };

  return (
    <>
      {/* Botones */}
      <Grid
        container
        spacing={2}
        sx={{ marginTop: 6 }}
        alignContent={"center"}
        justifyContent={"center"}
      >
        <Grid item>
          <Button
            onClick={() => handleButtonClick(0)}
            sx={{
              flexGrow: 1,
              border: "3px solid #ECECEC",
              borderRadius: "4px",
              backgroundColor: selectedButton === 0 ? "#0A89FF" : "#fff",
              color: selectedButton === 0 ? "#fff" : "#0A89FF",
            }}
          >
            Scraping por búsqueda en Google
          </Button>
        </Grid>
        <Grid item>
          <Button
            onClick={() => handleButtonClick(1)}
            sx={{
              flexGrow: 1,
              mx: 1,
              border: "3px solid #ECECEC",
              backgroundColor: selectedButton === 1 ? "#0A89FF" : "#fff",
              color: selectedButton === 1 ? "#fff" : "#0A89FF",
            }}
          >
            Scraping por URLS
          </Button>
        </Grid>
      </Grid>

      {/* Renderizar scrapping por palabras clave o urls */}

      {selectedButton === 0 ? <ScrappingByKeywords /> : <ScrappingByUrls />}
    </>
  );
};
