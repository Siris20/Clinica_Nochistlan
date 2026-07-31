import React, { useState, useEffect } from "react";
import {
  Box,
  Divider,
  List,
  ListItemIcon,
  ListItemText,
  Typography,
  Drawer,
  useTheme,
  useMediaQuery,
  IconButton,
  keyframes,
  ListItemButton,
  FormControl,
  Select,
  MenuItem,
  Collapse,
} from "@mui/material";

// Iconos
import DashboardIcon from "@mui/icons-material/Dashboard";
import FolderSharedIcon from "@mui/icons-material/FolderShared";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import HealingIcon from "@mui/icons-material/Healing";
import SingleBedIcon from "@mui/icons-material/SingleBed";
import MonitorHeartIcon from "@mui/icons-material/MonitorHeart";
import BiotechIcon from "@mui/icons-material/Biotech";
import MedicationIcon from "@mui/icons-material/Medication";
import ContentCutIcon from "@mui/icons-material/ContentCut";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import WarehouseIcon from "@mui/icons-material/Warehouse";
import PeopleIcon from "@mui/icons-material/People";
import DomainIcon from "@mui/icons-material/Domain";
import AssessmentIcon from "@mui/icons-material/Assessment";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";

import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEnterprise } from "../../context/EnterpriseContext";
import { useBranch } from "../../context/BranchContext";
import "../../styles/Dashboard.css";

const menuCategories = [
  {
    title: null, // Ítem principal fuera de categoría colapsable
    items: [{ id: "dashboard", text: "Inicio / Dashboard", icon: <DashboardIcon /> }],
  },
  {
    title: "Atención Clínica",
    items: [
      { id: "pacientes", text: "Pacientes", icon: <FolderSharedIcon /> },
      { id: "citas", text: "Citas y Recepción", icon: <CalendarMonthIcon /> },
      { id: "atencion_medica", text: "Atención médica", icon: <MedicalServicesIcon /> },
      { id: "enfermeria", text: "Enfermería", icon: <HealingIcon /> },
      { id: "hospitalizacion", text: "Hospitalización", icon: <SingleBedIcon /> },
      { id: "urgencias", text: "Urgencias", icon: <MonitorHeartIcon /> },
      { id: "laboratorio", text: "Lab. e Imagenología", icon: <BiotechIcon /> },
      { id: "quirofano", text: "Quirófano", icon: <ContentCutIcon /> },
    ],
  },
  {
    title: "Suministros y Logística",
    items: [
      { id: "farmacia", text: "Farmacia", icon: <MedicationIcon /> },
      { id: "almacen", text: "Almacén y Compras", icon: <WarehouseIcon /> },
    ],
  },
  {
    title: "Administración y Gestión",
    items: [
      { id: "facturacion", text: "Caja y Facturación", icon: <ReceiptLongIcon /> },
      { id: "personal", text: "Personal", icon: <PeopleIcon /> },
      { id: "areas_medicas", text: "Áreas Médicas", icon: <DomainIcon /> },
      { id: "reportes", text: "Reportes", icon: <AssessmentIcon /> },
      { id: "configuracion", text: "Configuración", icon: <SettingsIcon /> },
    ],
  },
];

const bounce = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
`;

export const DrawerComponent = ({ onMenuItemClick }) => {
  const { selectedEnterprise, setSelectedEnterprise, enterprises } = useEnterprise();
  const { selectedBranch, setSelectedBranch, branches } = useBranch();

  const theme = useTheme();
  const navigate = useNavigate();
  const { employeeData, logout } = useAuth();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const [mobileOpen, setMobileOpen] = useState(false);

  // Estado para controlar qué grupos están abiertos
  const [openCategories, setOpenCategories] = useState({
    "Atención Clínica": false,
    "Suministros y Logística": false,
    "Administración y Gestión": false,
  });

  useEffect(() => {
    if (enterprises.length > 0 && !selectedEnterprise) {
      setSelectedEnterprise(enterprises[0].id);
    }
  }, [enterprises, selectedEnterprise]);

  useEffect(() => {
    if (branches.length > 0 && !selectedBranch) {
      setSelectedBranch(branches[0].id);
    }
  }, [branches, selectedBranch]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleEnterpriseChange = (event) => {
    const value = event.target.value;
    if (value === "admin") {
      onMenuItemClick("empresas");
      return;
    }
    setSelectedEnterprise(value);
    setSelectedBranch(null);
  };

  const handleBranchChange = (event) => {
    const value = event.target.value;
    if (value === "admin") {
      onMenuItemClick("sucursales");
      return;
    }
    setSelectedBranch(value);
  };

  // Alternar apertura/cierre de la categoría
  const handleToggleCategory = (title) => {
    setOpenCategories((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  const handleItemClick = (id) => {
    onMenuItemClick(id);
    if (isSmallScreen) setMobileOpen(false);
  };

  const drawerContent = (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* Logotipo */}
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "20px 0", height: "70px" }}>
        <img
          src="/images/ClinicaNochistlan_logo.png"
          alt="Clínica Logo"
          style={{ width: "200px", maxHeight: "70px", objectFit: "contain" }}
        />
      </Box>

      {/* Información del Usuario */}
      <Box className="avatar-section" sx={{ flexShrink: 0, px: 2, py: 1, textAlign: "center" }}>
        <Typography variant="body2" sx={{ fontWeight: "bold" }}>
          {employeeData?.name} {employeeData?.last_name}
        </Typography>
        <Typography variant="caption" sx={{ color: "text.secondary" }}>
          {employeeData?.position || "Personal Hospitalario"}
        </Typography>
      </Box>

      <Divider sx={{ flexShrink: 0 }} />

      {/* Menú Desplegable con Categorías Colapsables */}
      <Box sx={{ flex: 1, overflow: "auto", px: 1, py: 1 }}>
        {menuCategories.map((category, catIndex) => {
          if (!category.title) {
            return (
              <List key={catIndex} disablePadding sx={{ mb: 1 }}>
                {category.items.map((item) => (
                  <ListItemButton
                    key={item.id}
                    onClick={() => handleItemClick(item.id)}
                    sx={{
                      borderRadius: "6px",
                      mb: "2px",
                      py: 0.8,
                      "&:hover": { backgroundColor: "action.hover" },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 34, color: "action.active" }}>
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.text}
                      primaryTypographyProps={{ fontSize: "0.83rem", fontWeight: 500 }}
                    />
                  </ListItemButton>
                ))}
              </List>
            );
          }

          const isOpen = !!openCategories[category.title];

          return (
            <Box key={catIndex} sx={{ mb: 0.5 }}>
              {/* Encabezado Desplegable */}
              <ListItemButton
                onClick={() => handleToggleCategory(category.title)}
                sx={{
                  borderRadius: "6px",
                  py: 0.6,
                  px: 1.5,
                  backgroundColor: isOpen ? "rgba(0, 0, 0, 0.02)" : "transparent",
                  "&:hover": { backgroundColor: "action.hover" },
                }}
              >
                <ListItemText
                  primary={category.title}
                  primaryTypographyProps={{
                    fontSize: "0.72rem",
                    fontWeight: "bold",
                    color: "text.secondary",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                />
                {isOpen ? (
                  <ExpandLess sx={{ fontSize: 18, color: "text.secondary" }} />
                ) : (
                  <ExpandMore sx={{ fontSize: 18, color: "text.secondary" }} />
                )}
              </ListItemButton>

              {/* Items dentro del Menú Desplegable */}
              <Collapse in={isOpen} timeout="auto" unmountOnExit={false}>
                <List disablePadding sx={{ pl: 1 }}>
                  {category.items.map((item) => (
                    <ListItemButton
                      key={item.id}
                      onClick={() => handleItemClick(item.id)}
                      sx={{
                        borderRadius: "6px",
                        mb: "2px",
                        py: 0.6,
                        "&:hover": { backgroundColor: "action.hover" },
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 32, color: "action.active" }}>
                        {item.icon}
                      </ListItemIcon>
                      <ListItemText
                        primary={item.text}
                        primaryTypographyProps={{ fontSize: "0.82rem" }}
                      />
                    </ListItemButton>
                  ))}
                </List>
              </Collapse>
            </Box>
          );
        })}
      </Box>

      <Divider sx={{ flexShrink: 0 }} />

      {/* Cierre de Sesión */}
      <Box sx={{ flexShrink: 0, p: 1 }}>
        <ListItemButton onClick={handleLogout} sx={{ borderRadius: "6px", "&:hover svg": { color: "red" } }}>
          <ListItemIcon sx={{ minWidth: 34 }}>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText primary="Cerrar Sesión" primaryTypographyProps={{ fontSize: "0.83rem" }} />
        </ListItemButton>
      </Box>
    </Box>
  );

  return (
    <>
      {isSmallScreen && (
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={handleDrawerToggle}
          sx={{
            mr: 2,
            display: { sm: "none" },
            backgroundColor: "#F1F1F1",
            animation: `${bounce} 1s infinite`,
          }}
        >
          <ChevronRightIcon
            sx={{
              transform: mobileOpen ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.3s",
            }}
          />
        </IconButton>
      )}
      <Drawer
        variant={isSmallScreen ? "temporary" : "permanent"}
        open={isSmallScreen ? mobileOpen : true}
        onClose={handleDrawerToggle}
        sx={{
          width: 256,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: 256,
            boxSizing: "border-box",
            backgroundColor: "#FFFFFF",
            height: "100%",
          },
        }}
      >
        {drawerContent}
      </Drawer>
    </>
  );
};