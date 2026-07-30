import React, { useState } from "react";
import "../styles/Dashboard.css";
import {
  Box,
  CssBaseline,
  Typography,
} from "@mui/material";
import { DrawerComponent } from "../components/DashBoard/DrawerComponent";
import Contact from "../components/Contact";
import { MainContent } from "../components/DashBoard/MainContent";



export const DashboardScreen = () => {
  return (
    <>
      <Box sx={{ display: "flex" }}>
        <CssBaseline />
        {/* Main Content */}
        <MainContent />
      </Box>
    </>
  );
};
