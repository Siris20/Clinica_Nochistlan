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
  Collapse,
  FormControl,
  Select,
  MenuItem,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import BusinessIcon from "@mui/icons-material/Business";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import DescriptionIcon from "@mui/icons-material/Description";
import "../../styles/Dashboard.css";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  AdminPanelSettings,
  Badge,
  Engineering,
  ExpandLess,
  ExpandMore,
  PersonOutline,
  Warehouse,
  Inventory,
  Assessment,
  Apartment,
  BusinessCenter,
  BrandingWatermark,
  SettingsCell,
  SimCard,
  ViewList,
  ShowChart,
  CallReceived,
  CallMade,
  SwapHoriz,
  CompareArrows,
  MonetizationOn,
  Balance,
  KeyboardReturn,
  PriceCheck,
} from "@mui/icons-material";
import LogoutIcon from "@mui/icons-material/Logout";
import { useEnterprises } from "../../hooks/Enterprises/useEnterprises";
import { useBranches } from "../../hooks/Branches/useBranches";
import { useEnterprise } from "../../context/EnterpriseContext";
import { useBranch } from "../../context/BranchContext";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";

//Opciones del menu lateral
const menuItems = [{ text: "Dashboard", icon: <DashboardIcon />, tabIndex: 0 }];

//Items de la empresa
const enterpriseItems = [
  { text: "Áreas", icon: <BusinessCenter />, tabIndex: 1 },
  { text: "Logos", icon: <BrandingWatermark />, tabIndex: 2 },
];

//Items del apartado productos
const productsSubItems = [
  { text: "Clasificaciones", icon: <Apartment />, tabIndex: 3 },
  { text: "Lista de Productos", icon: <ViewList />, tabIndex: 4 },
];

//Items del apartado Almacenes
const subMenuItemsInventory = [
  { text: "Almacenes", icon: <Warehouse />, tabIndex: 5 },
];

//Items del apartado Stock
const stockItems = [{ text: "Stock", icon: <ShowChart />, tabIndex: 6 }];

//Items del apartado Utilidades
const utilitiesItems = [{ text: "Utilidades", icon: <PriceCheck />, tabIndex: 7}];

//Items del apartado Compras
const entryItems = [
  { text: "Compras", icon: <MonetizationOn />, tabIndex: 8 },
];

//Items del apartado salidas
const exitItems = [
  { text: "Ventas", icon: <MonetizationOn />, tabIndex: 9 },
];

const peopleSubItems = [
  { text: "Personal", icon: <Engineering />, tabIndex: 10 },
  { text: "Clientes", icon: <PersonOutline />, tabIndex: 11 },
  { text: "Proveedores", icon: <SettingsCell />, tabIndex: 12 },
  { text: "Emisores", icon: <Badge />, tabIndex: 13 },
  { text: "Usuarios del sistema", icon: <AdminPanelSettings />, tabIndex: 14 },
];

const toolItems = [
  { text: "SEO", icon: <RocketLaunchIcon />, tabIndex: 15 },
  { text: "WhatsApp", icon: <WhatsAppIcon />, tabIndex: 16 },
  { text: "Estadísticas", icon: <AccountBalanceIcon />, tabIndex: 17 },
  { text: "Cotizaciones", icon: <DescriptionIcon />, tabIndex: 18 },
];

const bounce = keyframes`
  0%, 100% {
    transform: translateY(0);
    }
  50% {
    transform: translateY(-5px);
    }
`;

export const DrawerComponent = ({ onMenuItemClick }) => {
  //Hooks
  const { selectedEnterprise, setSelectedEnterprise, enterprises } =
    useEnterprise();
  const { selectedBranch, setSelectedBranch, branches } = useBranch();

  //Estados
  const theme = useTheme();
  const navigate = useNavigate();
  const { user, employeeData, isLoggedIn, logout } = useAuth();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [enterpriseMenuOpen, setEnterpriseMenuOpen] = useState(false);
  const [subMenuOpen, setSubMenuOpen] = useState(false);
  const [peopleMenuOpen, setPeopleMenuOpen] = useState(false);
  const [productsMenuOpen, setProductsMenuOpen] = useState(false);
  const [movementsMenuOpen, setMovementsMenuOpen] = useState(false);
  const [entryMovementsMenuOpen, setEntryMovementsMenuOpen] = useState(false);
  const [transferMovementsMenuOpen, setTransferMovementsMenuOpen] = useState(false);
  const [exitMovementsMenuOpen, setExitMovementsMenuOpen] = useState(false);

  //Establacer balores iniviales
  useEffect(() => {
    if (enterprises.length > 0 && !selectedEnterprise) {
      const firstEnterprise = enterprises[0];
      setSelectedEnterprise(firstEnterprise.id);
    }
  }, [enterprises, selectedEnterprise]);

  useEffect(() => {
    if (branches.length > 0 && !selectedBranch) {
      const firstBranch = branches[0];
      setSelectedBranch(firstBranch.id);
    }
  }, [branches, selectedBranch]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleEnterpriseMenuOpen = () => {
    setEnterpriseMenuOpen(!enterpriseMenuOpen);
  };

  const handleSubMenuOpen = () => {
    setSubMenuOpen(!subMenuOpen);
  };

  const handleProductsMenuOpen = () => {
    setProductsMenuOpen(!productsMenuOpen);
  };

  const handleMovementsMenuOpen = () => {
    setMovementsMenuOpen(!movementsMenuOpen);
  };

  const handleEntryMovementsMenuOpen = () => {
    setEntryMovementsMenuOpen(!entryMovementsMenuOpen);
  };

  const handleExitMovementsMenuOpen = () => {
    setExitMovementsMenuOpen(!exitMovementsMenuOpen);
  };

  const handlePeopleMenuOpen = () => {
    setPeopleMenuOpen(!peopleMenuOpen);
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleEnterpriseChange = (event) => {
    const value = event.target.value;
    if (value === "admin") {
      onMenuItemClick(19);
      return;
    }
    setSelectedEnterprise(value);
    setSelectedBranch(null); // Resetear la sucursal seleccionada
  };
  const handleBranchChange = (event) => {
    const value = event.target.value;
    if (value === "admin") {
      onMenuItemClick(20);
      return;
    }
    setSelectedBranch(value);
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "https://avatar.iran.liara.run/public/28";

    if (imagePath.startsWith("data:")) {
      return imagePath;
    }

    // Asegúrate de que las rutas usen forward slashes
    const normalizedPath = imagePath.replace(/\\/g, "/");
    return `${import.meta.env.VITE_API_SERVER}/${normalizedPath}`;
  };

  const drawerContent = (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "16px 0",
          height: "70px",
        }}
      >
        <img
          src="/images/tadimex.png"
          alt="Tadimex Logo"
          title="Tadimex Logo"
          className="drawer-logo"
          style={{
            width: "150px",
            maxHeight: "50px",
            objectFit: "contain",
          }}
        />
      </Box>
      {/* Sección fija del avatar */}
      <Box className="avatar-section" sx={{ flexShrink: 0 }}>
        <div>
          <img
            src={getImageUrl(employeeData?.image)}
            alt="Avatar"
            className="avatar-image"
          />
        </div>
        <Typography
          variant="body1"
          sx={{ fontWeight: "bold", textAlign: "center" }}
        >
          {employeeData?.name} {employeeData?.last_name}
        </Typography>
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          {employeeData?.position}
        </Typography>
      </Box>

      <Divider sx={{ flexShrink: 0 }} />

      {/* Seccion de seleccion de empresa */}
      <Box sx={{ p: "0px 16px", flexShrink: 0, mt: 1 }}>
        <Typography
          variant="subtitle2"
          sx={{
            mb: 0.5,
            fontWeight: "bold",
            fontSize: "12px",
            textAlign: "left",
          }}
        >
          Empresa
        </Typography>
        <FormControl fullWidth size="small">
          <Select
            value={selectedEnterprise || ""}
            onChange={handleEnterpriseChange}
            displayEmpty
            renderValue={() => {
              if (enterprises.length === 0) {
                return (
                  <>
                    <Typography variant="body2" sx={{ fontSize: "13px" }}>
                      No existen empresas
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ fontSize: "11px" }}
                    >
                      Crea una empresa
                    </Typography>
                  </>
                );
              }

              if (!selectedEnterprise) return "";

              const enterprise = enterprises.find(
                (e) => e.id === selectedEnterprise
              );
              return (
                <Box>
                  <Typography variant="body2" sx={{ fontSize: "13px" }}>
                    {enterprise?.name || ""}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ fontSize: "11px" }}
                  >
                    {enterprise?.estado || ""}
                  </Typography>
                </Box>
              );
            }}
            sx={{
              height: "2.813rem",
              backgroundColor: "#fff",
              "& .MuiSelect-select": {
                py: 0.5,
                fontSize: "13px",
              },
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: "#e0e0e0",
              },
            }}
          >
            <MenuItem
              value="admin"
              sx={{
                borderBottom: "1px solid #e0e0e0",
                color: "primary.main",
                fontWeight: "bold",
              }}
            >
              <Box sx={{ py: 0.5 }}>
                <Typography variant="body2" sx={{ fontSize: "13px" }}>
                  Administrar Empresas
                </Typography>
              </Box>
            </MenuItem>
            {enterprises.map((enterprise) => (
              <MenuItem key={enterprise.id} value={enterprise.id}>
                <Box sx={{ py: 0.5 }}>
                  <Typography variant="body2" sx={{ fontSize: "13px" }}>
                    {enterprise.name}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ fontSize: "11px" }}
                  >
                    {enterprise.estado}
                  </Typography>
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Seccion de seleccion de sucursal  */}

      <Box sx={{ p: "0px 16px", flexShrink: 0, mt: 1 }}>
        <Typography
          variant="subtitle2"
          sx={{
            mb: 0.5,
            fontWeight: "bold",
            fontSize: "12px",
            textAlign: "left",
          }}
        >
          Sucursal
        </Typography>
        <FormControl fullWidth size="small">
          <Select
            value={selectedBranch || ""}
            onChange={handleBranchChange}
            displayEmpty
            renderValue={() => {
              if (branches.length === 0) {
                return (
                  <>
                    <Typography variant="body2" sx={{ fontSize: "13px" }}>
                      No existen sucursales
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ fontSize: "11px" }}
                    >
                      Crea una sucursal
                    </Typography>
                  </>
                );
              }

              if (!selectedBranch) return "";

              const branch = branches.find((b) => b.id === selectedBranch);
              return (
                <Box>
                  <Typography variant="body2" sx={{ fontSize: "13px" }}>
                    {branch?.name || ""}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ fontSize: "11px" }}
                  >
                    {branch?.estado || ""}
                  </Typography>
                </Box>
              );
            }}
            sx={{
              height: "2.813rem",
              backgroundColor: "#fff",
              "& .MuiSelect-select": {
                py: 0.5,
                fontSize: "13px",
              },
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: "#e0e0e0",
              },
            }}
          >
            <MenuItem
              value="admin"
              sx={{
                borderBottom: "1px solid #e0e0e0",
                color: "primary.main",
                fontWeight: "bold",
              }}
            >
              <Box sx={{ py: 0.5 }}>
                <Typography variant="body2" sx={{ fontSize: "13px" }}>
                  Administrar Sucursales
                </Typography>
              </Box>
            </MenuItem>
            {branches.map((branch) => (
              <MenuItem key={branch.id} value={branch.id}>
                <Box sx={{ py: 0.5 }}>
                  <Typography variant="body2" sx={{ fontSize: "13px" }}>
                    {branch.name}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ fontSize: "11px" }}
                  >
                    {branch.estado}
                  </Typography>
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Box
        sx={{
          flex: 1,
          overflow: "auto",
          "&::-webkit-scrollbar": {
            width: "3px",
          },
          "&::-webkit-scrollbar-track": {
            background: "#f1f1f1",
          },
          "&::-webkit-scrollbar-thumb": {
            background: "#888",
            borderRadius: "3px",
          },
          "&::-webkit-scrollbar-thumb:hover": {
            background: "#555",
          },
        }}
      >
        {/* Menu List */}
        <List>
          {menuItems.map((item, index) => (
            <ListItemButton
              key={index}
              onClick={() => onMenuItemClick(item.tabIndex)}
              sx={{ cursor: "pointer" }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          ))}

          {/* Menu desplegable de Empresas */}
          <ListItemButton onClick={handleEnterpriseMenuOpen}>
            <ListItemIcon>
              <BusinessIcon />
            </ListItemIcon>
            <ListItemText primary="Empresa" />
            {enterpriseMenuOpen ? <ExpandLess /> : <ExpandMore />}
          </ListItemButton>
          <Collapse in={enterpriseMenuOpen} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {enterpriseItems.map((item, index) => (
                <ListItemButton
                  key={index}
                  onClick={() => onMenuItemClick(item.tabIndex)}
                  sx={{ pl: 4 }}
                >
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              ))}
            </List>
          </Collapse>

          {/* Menu desplegable de Inventario */}
          <ListItemButton onClick={handleSubMenuOpen}>
            <ListItemIcon>
              <Assessment />
            </ListItemIcon>
            <ListItemText primary="Inventario" />
            {subMenuOpen ? <ExpandLess /> : <ExpandMore />}
          </ListItemButton>
          <Collapse in={subMenuOpen} timeout="auto" unmountOnExit>
            {/* Menú de Productos dentro de Inventario */}
            <ListItemButton onClick={handleProductsMenuOpen} sx={{ pl: 4 }}>
              <ListItemIcon>
                <Inventory />
              </ListItemIcon>
              <ListItemText primary="Productos" />
              {productsMenuOpen ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
            <Collapse in={productsMenuOpen} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {productsSubItems.map((item, index) => (
                  <ListItemButton
                    key={index}
                    onClick={() => onMenuItemClick(item.tabIndex)}
                    sx={{ pl: 8 }} // Más indentación para submenú anidado
                  >
                    <ListItemIcon>{item.icon}</ListItemIcon>
                    <ListItemText primary={item.text} />
                  </ListItemButton>
                ))}
              </List>
            </Collapse>
            {/* Almacen */}
            <List component="div" disablePadding>
              {subMenuItemsInventory.map((item, index) => (
                <ListItemButton
                  key={index}
                  onClick={() => onMenuItemClick(item.tabIndex)}
                  sx={{ pl: 4 }}
                >
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              ))}
            </List>
            {/* Stock */}
            <List component="div" disablePadding>
              {stockItems.map((item, index) => (
                <ListItemButton
                  key={index}
                  onClick={() => onMenuItemClick(item.tabIndex)}
                  sx={{ pl: 4 }}
                >
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              ))}
            </List>

            {/* Utilidades */}
            <List component="div" disablePadding>
              {utilitiesItems.map((item, index) => (
                <ListItemButton
                  key={index}
                  onClick={() => onMenuItemClick(item.tabIndex)}
                  sx={{ pl: 4 }}
                >
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              ))}
            </List>

            {/* Menú de movimientos dentro de Inventario */}
            <ListItemButton onClick={handleMovementsMenuOpen} sx={{ pl: 4 }}>
              <ListItemIcon>
                <CompareArrows />
              </ListItemIcon>
              <ListItemText primary="Movimientos" />
              {movementsMenuOpen ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
            <Collapse in={movementsMenuOpen} timeout="auto" unmountOnExit>
              {/* Submenú de Entradas dentro de Movimientos */}
              <ListItemButton onClick={handleEntryMovementsMenuOpen} sx={{ pl: 6 }}>
                <ListItemIcon>
                  <CallReceived />
                </ListItemIcon>
                <ListItemText primary="Entradas" />
                {entryMovementsMenuOpen ? <ExpandLess /> : <ExpandMore />}
              </ListItemButton>
              <Collapse in={entryMovementsMenuOpen} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {entryItems.map((item, index) => (
                    <ListItemButton
                      key={index}
                      onClick={() => onMenuItemClick(item.tabIndex)}
                      sx={{ pl: 12 }} // Más indentación para submenú anidado
                    >
                      <ListItemIcon>{item.icon}</ListItemIcon>
                      <ListItemText primary={item.text} />
                    </ListItemButton>
                  ))}
                </List>
              </Collapse>

              {/* Submenú de Salidas dentro de Movimientos */}
              <ListItemButton onClick={handleExitMovementsMenuOpen} sx={{ pl: 6 }}>
                <ListItemIcon>
                  <CallMade />
                </ListItemIcon>
                <ListItemText primary="Salidas" />
                {exitMovementsMenuOpen ? <ExpandLess /> : <ExpandMore />}
              </ListItemButton>
              <Collapse in={exitMovementsMenuOpen} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {exitItems.map((item, index) => (
                    <ListItemButton
                      key={index}
                      onClick={() => onMenuItemClick(item.tabIndex)}
                      sx={{ pl: 12 }} // Más indentación para submenú anidado
                    >
                      <ListItemIcon>{item.icon}</ListItemIcon>
                      <ListItemText primary={item.text} />
                    </ListItemButton>
                  ))}
                </List>
              </Collapse>
            </Collapse>
          </Collapse>

          {/* Menu desplegable de Personas */}
          <ListItemButton onClick={handlePeopleMenuOpen}>
            <ListItemIcon>
              <PeopleIcon />
            </ListItemIcon>
            <ListItemText primary="Personas" />
            {peopleMenuOpen ? <ExpandLess /> : <ExpandMore />}
          </ListItemButton>
          <Collapse in={peopleMenuOpen} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {peopleSubItems.map((item, index) => (
                <ListItemButton
                  key={index}
                  onClick={() => onMenuItemClick(item.tabIndex)}
                  sx={{ pl: 4 }}
                >
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              ))}
            </List>
          </Collapse>
        </List>

        {/* Tools Section */}
        <Typography
          variant="subtitle2"
          sx={{ pl: 2, mt: 2, mb: 1, fontWeight: "bold", textAlign: "left" }}
        >
          Herramientas
        </Typography>
        <List>
          {toolItems.map((item, index) => (
            <ListItemButton
              key={index}
              onClick={() => onMenuItemClick(item.tabIndex)}
              sx={{ cursor: "pointer" }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          ))}
        </List>
      </Box>

      {/* Botón de cerrar sesión (fijo al fondo) */}
      <Box sx={{ flexShrink: 0 }}>
        <ListItemButton
          onClick={handleLogout}
          sx={{
            "&:hover svg": { color: "red" },
          }}
        >
          <ListItemIcon>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText primary="Cerrar Sesion" />
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
            marginTop: 0,
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
