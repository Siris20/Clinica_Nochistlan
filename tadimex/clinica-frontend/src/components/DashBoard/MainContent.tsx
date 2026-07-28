import { AppBar, Box, Tabs, Tab, Toolbar, Typography } from "@mui/material";
import React, { useEffect, useMemo, useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import { DashboardComponent } from "./DashboardComponent";
import { DrawerComponent } from "./DrawerComponent";
import { StorageComponent } from "./Storage/StorageComponent";
import { SeoComponent } from "./SEO/SeoComponent";
import { WhatsAppComponent } from "./WhatsApp/WhatsAppComponent";
import { SystemUserComponent } from "./SystemsUser/SystemUserComponent";
import { EmployeeComponent } from "./Employee/EmployeeComponent";
import { BranchesManagementComponent } from "./BranchesManagement/BranchesManagementComponent";
import { EnterprisesManagementComponent } from "./Enterprises/EnterprisesManagementComponent";
import { ClasificationsComponent } from "./Clasifications/ClasificationsComponent";
import { ProductsComponent } from "./Products/ProductsComponent";
import { AreasManagementComponent } from "./Areas/AreasManagementComponent";
import { ClientsComponent } from "./Clients/ClientsComponent";
import { EmittersComponent } from "./Emitters/EmittersComponent";
import { QuotesComponent } from "./Quotes/QuotesComponent";
import { LogosComponent } from "./Logos/LogosComponent";
import { StockComponent } from "./Stock/StockComponent";
import { SuppliersComponent } from "./Suppliers/SuppliersComponent";
import { StatisticsComponent } from "./Statistics/StatisticsComponent";
import { PurchasesComponent, SalesComponent } from "./Movements";
import { UtilitiesComponent } from "./Utilities/UtilitiesComponent";


interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
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
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

export const MainContent = () => {
  const [openTabs, setOpenTabs] = useState<any[]>([]);
  const [value, setValue] = useState(0);

  const handleMenuItemClick = (tabIndex: number) => {
    const tabExists =
      openTabs.findIndex((tab) => tab.label === allTabs[tabIndex].label) !== -1;
    if (!tabExists) {
      setOpenTabs([...openTabs, allTabs[tabIndex]]);
    }
    setValue(
      openTabs.findIndex((tab) => tab.label === allTabs[tabIndex].label) !== -1
        ? openTabs.findIndex((tab) => tab.label === allTabs[tabIndex].label)
        : openTabs.length
    );
  };

  const allTabs = useMemo(
    () => [
      {
        label: "Dashboard",
        content: <DashboardComponent onMenuItemClick={handleMenuItemClick} />,
      },
      {
        label: "Áreas",
        content: <AreasManagementComponent />,
      },
      {
        label: "Logos", 
        content: <LogosComponent />
      },
      {
        label: "Clasificaciones",
        content: <ClasificationsComponent />,
      },
      {
        label: "Productos",
        content: <ProductsComponent />,
      },
      {
        label: "Almacenes",
        content: <StorageComponent />,
      },
      {
        label: "Stock", 
        content: <StockComponent />,
      },
      {
        label: "Utilidades", 
        content: <UtilitiesComponent />,
      },
      {
        label: "Compras", 
        content: <PurchasesComponent />,
      }, 
      {
        label: "Ventas",
        content: <SalesComponent />,
      },
      {
        label: "Personal",
        content: <EmployeeComponent />,
      },
      {
        label: "Clientes",
        content: <ClientsComponent />,
      },
      {
        label: "Proveedores", 
        content: <SuppliersComponent />,
      },
      {
        label: "Emisores",
        content: <EmittersComponent />,
      },
      {
        label: "Usuarios del sistema",
        content: <SystemUserComponent />,
      },
      {
        label: "SEO",
        content: <SeoComponent />,
      },
      {
        label: "WhatsApp",
        content: <WhatsAppComponent />,
      },
      {
        label: "Estadísticas", 
        content: <StatisticsComponent />,
      },
      {
        label: "Cotizaciones",
        content: <QuotesComponent />,
      },
      {
        label: "Administrar empresas",
        content: <EnterprisesManagementComponent />,
      },
      {
        label: "Administrar sucursales",
        content: (
          <BranchesManagementComponent onMenuItemClick={handleMenuItemClick} />
        ),
      },
    ],
    [handleMenuItemClick]
  );

  // Inicializar la primera tab
  useEffect(() => {
    if (openTabs.length === 0) {
      setOpenTabs([allTabs[0]]);
    }
  }, [allTabs]);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const handleCloseTab = (index: number) => {
    const newTabs = openTabs.filter((_, i) => i !== index);
    setOpenTabs(newTabs);
    setValue(Math.max(0, index - 1));
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "row", width: "100%" }}>
      <DrawerComponent onMenuItemClick={handleMenuItemClick} />
      <Box sx={{ 
        display: "flex", 
        flexDirection: "column", 
        width: "100%",
        overflow: "hidden", 
      }}>
        <AppBar position="static" color="inherit" elevation={0}>
          <Tabs
            value={value}
            onChange={handleChange}
            variant="scrollable"
            scrollButtons="auto"
            textColor="inherit"
            TabIndicatorProps={{
              style: { 
                display: "none",
              },
            }}
            sx={{
              maxWidth: "100%",
              "& .MuiTab-root": {
                fontSize: "14px",
                fontWeight: 400,
                color: "#444",
                textTransform: "none",
                position: "relative",
                border: "1px solid #e0e0e0",
              },
              "& .Mui-selected": {
                fontWeight: "bold",
                color: "#FF5A5A",
                backgroundColor: "#f1f1f1",
              },
            }}
          >
            {openTabs.map((tab, index) => (
              <Tab
                key={index}
                sx={{
                  "& .close-icon": {
                    visibility: "hidden"
                  },
                  "&:hover": {
                    backgroundColor: "#f0f0f0",
                    "& .close-icon": {
                      visibility: "visible"
                    }
                  }
                }}
                label={
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <span>{tab.label}</span>
                    <div
                      className="close-icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCloseTab(index);
                      }}
                      style={{ cursor: "pointer", marginLeft: 8 }}
                    >
                      <CloseIcon sx={{ fontSize: 16 }} />
                    </div>
                  </Box>
                }
              />
            ))}
          </Tabs>
        </AppBar>
        {openTabs.length > 0 ? (
          openTabs.map((tab, index) => (
            <TabPanel key={index} value={value} index={index}>
              {tab.content}
            </TabPanel>
          ))
        ) : (
          <Box sx={{ padding: 3 }}>
            <Typography>No hay ventanas abiertas</Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};
