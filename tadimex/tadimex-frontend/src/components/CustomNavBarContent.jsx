import React from 'react'
import "../styles/Header.css";
import Button from "@mui/material/Button";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from 'react-router-dom';

export const CustomNavBarContent = () => {
  const {logout, username} = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  }

  return (
    <nav className="header-nav">
    <span className="header-link">{"Hola " + username}</span>
    <span className="header-link">Historial de busquedas</span>
    <span className="header-link" onClick={()=>navigate("/whatsapp_messages")}>Mensajes WhatsApp</span>
      <Button variant="contained" sx={{ backgroundColor: "red" }} onClick={handleLogout}>
        Cerrar sesión
      </Button>
  </nav>
  )
}
