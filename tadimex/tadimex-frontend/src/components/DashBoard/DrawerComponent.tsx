import DashboardIcon from "@mui/icons-material/Dashboard";
import PersonIcon from "@mui/icons-material/Person";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import HotelIcon from "@mui/icons-material/Hotel";
import EmergencyIcon from "@mui/icons-material/Emergency";
import BiotechIcon from "@mui/icons-material/Biotech";
import MedicationIcon from "@mui/icons-material/Medication";
import ContentCutIcon from "@mui/icons-material/ContentCut";
import PointOfSaleIcon from "@mui/icons-material/PointOfSale";
import InventoryIcon from "@mui/icons-material/Inventory";
import BadgeIcon from "@mui/icons-material/Badge";
import AssessmentIcon from "@mui/icons-material/Assessment";
import SettingsIcon from "@mui/icons-material/Settings";

export const menuItems = [
  { text: "Inicio / Dashboard", icon: <DashboardIcon />, tabIndex: 0 },
  { text: "Pacientes", icon: <PersonIcon />, tabIndex: 1 },
  { text: "Citas y recepción", icon: <CalendarMonthIcon />, tabIndex: 2 },
  { text: "Atención médica", icon: <MedicalServicesIcon />, tabIndex: 3 },
  { text: "Enfermería", icon: <LocalHospitalIcon />, tabIndex: 4 },
  { text: "Hospitalización", icon: <HotelIcon />, tabIndex: 5 },
  { text: "Urgencias", icon: <EmergencyIcon />, tabIndex: 6 },
  { text: "Laboratorio e imagenología", icon: <BiotechIcon />, tabIndex: 7 },
  { text: "Farmacia", icon: <MedicationIcon />, tabIndex: 8 },
  { text: "Quirófano", icon: <ContentCutIcon />, tabIndex: 9 },
  { text: "Caja y facturación", icon: <PointOfSaleIcon />, tabIndex: 10 },
  { text: "Almacén y compras", icon: <InventoryIcon />, tabIndex: 11 },
  { text: "Personal", icon: <BadgeIcon />, tabIndex: 12 },
  { text: "Reportes", icon: <AssessmentIcon />, tabIndex: 13 },
  { text: "Configuración", icon: <SettingsIcon />, tabIndex: 14 },
];