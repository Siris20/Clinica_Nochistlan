import React, { useEffect, useState } from "react";
import { AppBar, Box, Tabs, Tab, Typography, Paper } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ConstructionIcon from "@mui/icons-material/Construction";

import { DrawerComponent } from "./DrawerComponent";
import { DashboardComponent } from "./DashboardComponent";
import { StorageComponent } from "./Storage/StorageComponent";
import { SystemUserComponent } from "./SystemsUser/SystemUserComponent";
import { EmployeeComponent } from "./Employee/EmployeeComponent";
import { BranchesManagementComponent } from "./BranchesManagement/BranchesManagementComponent";
import { EnterprisesManagementComponent } from "./Enterprises/EnterprisesManagementComponent";
import { ProductsComponent } from "./Products/ProductsComponent";
import { AreasManagementComponent } from "./Areas/AreasManagementComponent";
import { PatientsComponent } from "./Patients/PatientsComponent";
import { QuotesComponent } from "./Quotes/QuotesComponent";
import { StatisticsComponent } from "./Statistics/StatisticsComponent";
import { PurchasesComponent, SalesComponent } from "./Movements";
import { LogosComponent } from "./Logos/LogosComponent";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

interface OpenTab {
  id: string;
  label: string;
  content: React.ReactNode;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography component="div">{children}</Typography>
        </Box>
      )}
    </div>
  );
}

const ModulePlaceholder = ({ title, description }: { title: string; description: string }) => (
  <Paper elevation={0} sx={{ p: 4, textAlign: "center", backgroundColor: "#f8f9fa", borderRadius: 2 }}>
    <ConstructionIcon sx={{ fontSize: 60, color: "text.secondary", mb: 2 }} />
    <Typography variant="h5" gutterBottom sx={{ fontWeight: "bold" }}>
      {title}
    </Typography>
    <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600, mx: "auto", mb: 2 }}>
      {description}
    </Typography>
    <Typography variant="caption" color="primary">
      Módulo registrado correctamente en el sistema.
    </Typography>
  </Paper>
);

export const MainContent = () => {
  const [openTabs, setOpenTabs] = useState<OpenTab[]>([]);
  const [value, setValue] = useState(0);

  const ALL_MODULES: Record<string, { label: string; content: React.ReactNode }> = {
    dashboard: {
      label: "Inicio / Dashboard",
      content: <DashboardComponent onMenuItemClick={(id: string) => handleMenuItemClick(id)} />,
    },
    pacientes: {
      label: "Pacientes",
      content: <PatientsComponent />,
    },
    citas: {
      label: "Citas y Recepción",
      content: <QuotesComponent />,
    },
    atencion_medica: {
      label: "Atención médica",
      content: (
        <ModulePlaceholder
          title="Atención Médica"
          description="Consultas, notas médicas, signos vitales y recetas electrónicas."
        />
      ),
    },
    enfermeria: {
      label: "Enfermería",
      content: (
        <ModulePlaceholder
          title="Enfermería"
          description="Hoja de enfermería, administración de medicamentos y control de signos vitales."
        />
      ),
    },
    hospitalizacion: {
      label: "Hospitalización",
      content: (
        <ModulePlaceholder
          title="Hospitalización"
          description="Control de camas, ingresos, traslados y censo hospitalario."
        />
      ),
    },
    urgencias: {
      label: "Urgencias",
      content: (
        <ModulePlaceholder
          title="Urgencias"
          description="Triage, nivel de prioridad y atención inmediata."
        />
      ),
    },
    laboratorio: {
      label: "Lab. e Imagenología",
      content: (
        <ModulePlaceholder
          title="Laboratorio e Imagenología"
          description="Solicitudes de estudios, captura de resultados e integración de imágenes médicas."
        />
      ),
    },
    farmacia: {
      label: "Farmacia",
      content: <ProductsComponent />,
    },
    quirofano: {
      label: "Quirófano",
      content: (
        <ModulePlaceholder
          title="Quirófano"
          description="Agenda de cirugías, médicos participantes y listas de verificación."
        />
      ),
    },
    facturacion: {
      label: "Caja y Facturación",
      content: <SalesComponent />,
    },
    almacen: {
      label: "Almacén y Compras",
      content: <StorageComponent />,
    },
    personal: {
      label: "Personal",
      content: <EmployeeComponent />,
    },
    areas_medicas: {
      label: "Áreas Médicas",
      content: <AreasManagementComponent />, // Módulo dedicado exclusivamente a Áreas
    },
    reportes: {
      label: "Reportes",
      content: <StatisticsComponent />,
    },
    configuracion: {
      label: "Configuración",
      content: <LogosComponent />,
    },
    usuarios: {
      label: "Usuarios del Sistema",
      content: <SystemUserComponent />,
    },
  };

  const handleMenuItemClick = (moduleId: string) => {
    const targetModule = ALL_MODULES[moduleId];
    if (!targetModule) return;

    const existingIndex = openTabs.findIndex((tab) => tab.id === moduleId);

    if (existingIndex !== -1) {
      setValue(existingIndex);
    } else {
      const newTab: OpenTab = {
        id: moduleId,
        label: targetModule.label,
        content: targetModule.content,
      };
      setOpenTabs((prev) => [...prev, newTab]);
      setValue(openTabs.length);
    }
  };

  useEffect(() => {
    if (openTabs.length === 0) {
      const defaultModule = ALL_MODULES["dashboard"];
      setOpenTabs([{ id: "dashboard", ...defaultModule }]);
    }
  }, []);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const handleCloseTab = (indexToClose: number) => {
    const newTabs = openTabs.filter((_, i) => i !== indexToClose);
    setOpenTabs(newTabs);

    if (value >= newTabs.length) {
      setValue(Math.max(0, newTabs.length - 1));
    } else if (value === indexToClose) {
      setValue(Math.max(0, indexToClose - 1));
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "row", width: "100%" }}>
      <DrawerComponent onMenuItemClick={handleMenuItemClick} />
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          overflow: "hidden",
        }}
      >
        <AppBar position="static" color="inherit" elevation={0}>
          <Tabs
            value={value}
            onChange={handleChange}
            variant="scrollable"
            scrollButtons="auto"
            textColor="inherit"
            TabIndicatorProps={{ style: { display: "none" } }}
            sx={{
              maxWidth: "100%",
              "& .MuiTab-root": {
                fontSize: "13px",
                fontWeight: 500,
                color: "#444",
                textTransform: "none",
                borderRight: "1px solid #e0e0e0",
                borderBottom: "1px solid #e0e0e0",
                minHeight: "42px",
              },
              "& .Mui-selected": {
                fontWeight: "bold",
                color: "#1976d2",
                backgroundColor: "#f5f5f5",
              },
            }}
          >
            {openTabs.map((tab, index) => (
              <Tab
                key={tab.id}
                sx={{
                  "& .close-icon": { visibility: "hidden" },
                  "&:hover .close-icon": { visibility: "visible" },
                }}
                label={
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <span>{tab.label}</span>
                    <Box
                      className="close-icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCloseTab(index);
                      }}
                      style={{ cursor: "pointer", marginLeft: 8, display: "flex" }}
                    >
                      <CloseIcon sx={{ fontSize: 15 }} />
                    </Box>
                  </Box>
                }
              />
            ))}
          </Tabs>
        </AppBar>

        {openTabs.length > 0 ? (
          openTabs.map((tab, index) => (
            <TabPanel key={tab.id} value={value} index={index}>
              {tab.content}
            </TabPanel>
          ))
        ) : (
          <Box sx={{ padding: 4, textAlign: "center" }}>
            <Typography variant="h6" color="text.secondary">
              No hay ventanas abiertas
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};