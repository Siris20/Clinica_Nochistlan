import {
  Paper,
  Grid,
  Tabs,
  Tab,
  Button,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from "@mui/material";
import React, { useState } from "react";
import { ScrappingByKeywords } from "./ScrappingByKeywords";
import { ScrappingByUrls } from "./ScrappingByUrls";
import { ScrappingComponent } from "./ScrappingComponent";
import { BotsComponent } from "./BotsComponent";

export const SeoComponent = () => {
  const [value, setValue] = useState(0);
  const [selectedButton, setSelectedButton] = useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const handleButtonClick = (buttonIndex: number) => {
    setSelectedButton(buttonIndex);
  };

  const rows = [
    { consulta: "Consulta 1", fecha: "01/01/2021", reporte: "Descargar" },
    { consulta: "Consulta 2", fecha: "02/01/2021", reporte: "Descargar" },
    { consulta: "Consulta 3", fecha: "03/01/2021", reporte: "Descargar" },
    { consulta: "Consulta 4", fecha: "04/01/2021", reporte: "Descargar" },
    { consulta: "Consulta 5", fecha: "05/01/2021", reporte: "Descargar" },
    { consulta: "Consulta 6", fecha: "06/01/2021", reporte: "Descargar" },
    { consulta: "Consulta 7", fecha: "07/01/2021", reporte: "Descargar" },
    { consulta: "Consulta 8", fecha: "08/01/2021", reporte: "Descargar" },
    { consulta: "Consulta 9", fecha: "09/01/2021", reporte: "Descargar" },
    { consulta: "Consulta 10", fecha: "10/01/2021", reporte: "Descargar" },
    { consulta: "Consulta 11", fecha: "11/01/2021", reporte: "Descargar" },
    { consulta: "Consulta 12", fecha: "12/01/2021", reporte: "Descargar" },
    { consulta: "Consulta 13", fecha: "13/01/2021", reporte: "Descargar" },
    { consulta: "Consulta 14", fecha: "14/01/2021", reporte: "Descargar" },
    { consulta: "Consulta 15", fecha: "15/01/2021", reporte: "Descargar" },
    { consulta: "Consulta 16", fecha: "16/01/2021", reporte: "Descargar" },
  ];

  return (
    <>
      <Grid container spacing={2} sx={{ height: "100vh" }}>
        {/* Sección de scrapping */}
        <Grid item xs={12} md={8} sx={{ height: "100%" }}>
          <Paper
            sx={{
              padding: 2,
              boxShadow: 3,
              height: "100%",
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
                label="Scraping"
                sx={{
                  flexGrow: 1,
                  mx: 1,
                  backgroundColor: value === 0 ? "#ECECEC" : "#fff",
                }}
              />
              <Tab
                label="Bots"
                sx={{
                  flexGrow: 1,
                  mx: 1,
                  backgroundColor: value === 1 ? "#ECECEC" : "#fff",
                }}
              />
            </Tabs>

            {/* Renderizar Scrapping o Bots */}
            {value === 0 ? <ScrappingComponent /> : <BotsComponent />}
          </Paper>
        </Grid>

        {/* Sección Derecha */}
        <Grid item xs={12} md={4} sx={{ height: "100%" }}>
          <Paper
            sx={{
              padding: 2,
              boxShadow: 3,
              height: "100%",
              position: "relative",
              borderRadius: "none",
            }}
          >
            <TableContainer sx={{ maxHeight: "100%", overflow: "auto" }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>Consulta</TableCell>
                    <TableCell align="right">Fecha</TableCell>
                    <TableCell align="right">Reporte</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((row) => (
                    <TableRow key={row.consulta}>
                      <TableCell component="th" scope="row">
                        {row.consulta}
                      </TableCell>
                      <TableCell align="right">{row.fecha}</TableCell>
                      <TableCell align="right">{row.reporte}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </>
  );
};
