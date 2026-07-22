// index.js

// React and hooks
export { useEffect, useState } from "react";
export { default as React } from "react";

// Material-UI icons
export { default as RefreshIcon } from "@mui/icons-material/Refresh";
export { default as DownloadIcon } from "@mui/icons-material/Download";
export { default as EditIcon } from "@mui/icons-material/Edit";
export { default as DeleteIcon } from "@mui/icons-material/Delete";
export { default as CheckCircleIcon } from "@mui/icons-material/CheckCircle";
export { default as DeleteForeverIcon } from "@mui/icons-material/DeleteForever";
export { default as CancelIcon } from "@mui/icons-material/Cancel";
export { default as SaveIcon } from "@mui/icons-material/Save";
export { default as WhatsAppIcon } from "@mui/icons-material/WhatsApp";

// React Big Calendar
export { Calendar, momentLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";

// Moment.js
export { default as moment } from "moment";

// Custom components and styles
export { Header } from "../partials/Header";
export { CustomNavBarContent } from "../components/CustomNavBarContent";
export { CustomOffCanvasContent } from "../components/CustomOffCanvasContent";
import "../styles/Header.css";

// React Icons
export { FaFileExcel } from "react-icons/fa";

// Material-UI components
export {
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
} from "@mui/material";

// XLSX
export * as XLSX from "xlsx";

// Custom hooks
export { UseSaveMessages } from "../hooks/UseSaveMessages";
export { UseSendMessages } from "../hooks/UseSendMessages";