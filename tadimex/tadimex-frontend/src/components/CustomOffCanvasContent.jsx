import React from 'react'
import "../styles/Header.css";
import Button from "@mui/material/Button";
import { useAuth } from "../context/AuthContext";
import { NavLink, useNavigate } from 'react-router-dom';

export const CustomOffCanvasContent = () => {

  const { username } = useAuth();
  const navigate = useNavigate();

  return (
    <>
      <nav className="offcanvas-header">
        <div className="logo-container d-flex align-items-center">
          <a href="/">
            <img src="images/tadimex.png" alt="Tadimex" className="header-logo" />
          </a>
        </div>
      </nav>
      <div className="offcanvas-body">
        <div className="list-group">
          <div className="list-group-item d-flex align-items-center">
            <span className="header-link">
            Hola {username}
            </span>
          </div>
        </div>
        <div className="list-group">
          <div className="list-group-item d-flex align-items-center">
            <span className="header-link">
              Historial de busquedas
            </span>
          </div>
          <div className="list-group-item d-flex align-items-center">
          <span className="header-link" onClick={()=>navigate("/whatsapp_messages")}>Mensajes WhatsApp</span>

          </div>
          <div className="list-group-item d-flex align-items-center">
              <NavLink to="/">
                <Button variant="contained" sx={{ backgroundColor: "red" }}>
                  Cerrar sesión
                </Button>
              </NavLink>
          </div>
        </div>
      </div>
    </>

  )
}
