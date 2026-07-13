import React, { useState } from "react";
import { Header } from "../partials/Header";
import "../styles/Header.css";
import Button from "@mui/material/Button";
import { NavLink, useNavigate } from "react-router-dom";
import { Box, Grid, TextField, Typography } from "@mui/material";
import "../styles/Header.css";
import { useAuth } from "../context/AuthContext";
import {CustomNavBarContent} from "../components/CustomNavBarContent";
import {CustomOffCanvasContent} from "../components/CustomOffCanvasContent";

function TellUsAboutYouScreen() {
  const [option, setOption] = useState("keywords");
  const [urls, setUrls] = useState([""]);
  const [query_text, setQuery_Text] = useState("");
  const navigate = useNavigate();
  

  const handleOptionChange = (newOption) => {
    setOption(newOption);
  };

  const handleUrlChange = (index, value) => {
    const newUrls = [...urls];
    newUrls[index] = value;
    setUrls(newUrls);
  };

  const addUrlField = () => {
    setUrls([...urls, ""]);
  };

  const handleQueryTextChange = (e) => {
    setQuery_Text(e.target.value);
  };

  //Funcion para navegar a la pantalla de reportes
  const analyzeInput = ()=> {
    if(option === "keywords"){
      navigate("/reports", { state: { query_text } });
    } else if(option === "urls") {
      navigate("/reports", { state: { urls } });
    }
  }


  return (
    <>
      <Header
        customNavBarContent={<CustomNavBarContent />}
        customOffCanvasContent={<CustomOffCanvasContent />}
      />
      <Box
        sx={{
          backgroundColor: "#fff",
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Grid
          container
          direction="column"
          justifyContent="center"
          alignItems="center"
          sx={{ width: "100%", maxWidth: "600px", textAlign: "center" }}
        >
          <Typography
            variant="h3"
            gutterBottom
            sx={{ color: "#000", fontWeight: "bold" }}
          >
            Herramienta SEO
          </Typography>
          <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
            <Button
              variant={option === "keywords" ? "contained" : "outlined"}
              onClick={() => handleOptionChange("keywords")}
              sx={{ mx: 1 }}
            >
              Ingresar por palabras clave
            </Button>
            <Button
              variant={option === "urls" ? "contained" : "outlined"}
              onClick={() => handleOptionChange("urls")}
              sx={{ mx: 1 }}
            >
              Ingresar por URL
            </Button>
          </Box> 
          {/* Esta parte es para el query */}
          {option === "keywords" && (
            <>
              <Typography variant="body1" gutterBottom>
                Ingrese las palabras clave que desea analizar
              </Typography>
              <TextField
                fullWidth
                placeholder="Palabras clave"
                variant="outlined"
                sx={{ mb: 2 }}
                value={query_text}
                onChange={handleQueryTextChange}
              />
                <Button variant="contained" sx={{ backgroundColor: "#F44ECF" }} onClick={analyzeInput}>
                  Analizar
                </Button>
            </>
          )}
          {/* Esta parte es para el scrapping de urls */}
          {option === "urls" && (
            <>
              <Typography variant="body1" gutterBottom>
                Ingrese las URLs que desea analizar
              </Typography>
              {urls.map((url, index) => (
                <TextField
                  key={index}
                  fullWidth
                  placeholder="Ingresar URL"
                  variant="outlined"
                  sx={{ mb: 2 }}
                  value={url}
                  onChange={(e) => handleUrlChange(index, e.target.value)}
                />
              ))}
              <Button variant="contained" onClick={addUrlField} sx={{ mb: 2 }}>
                Agregar URL
              </Button>
              <Button variant="contained" sx={{ backgroundColor: "#F44ECF" }} onClick={analyzeInput}>
                Analizar
              </Button>
            </>
          )}
        </Grid>
      </Box>
    </>
  );
}

export default TellUsAboutYouScreen;