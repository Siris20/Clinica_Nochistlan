import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import FacebookIcon from "@mui/icons-material/Facebook";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import Button from "@mui/material/Button";
import "../styles/Header.css";

export const NavBarContent = () => {
  const [activeLink, setActiveLink] = useState("/");
  const navigate = useNavigate();

  const scrollToSection = (sectionId) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
      setActiveLink(sectionId);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setActiveLink("/");
  };

  return (
    <nav className="header-nav-container">
      {/* Grupo 1: Links de navegación (Se centran en la pantalla) */}
      <div className="header-links-group">
        <span
          className={
            activeLink === "/" ? "header-link active-link" : "header-link"
          }
          onClick={scrollToTop}
        >
          Inicio
        </span>
        <span
          className={
            activeLink === "about" ? "header-link active-link" : "header-link"
          }
          onClick={() => scrollToSection("about")}
        >
          ¿Quiénes somos?
        </span>
        <span
          className={
            activeLink === "services"
              ? "header-link active-link"
              : "header-link"
          }
          onClick={() => scrollToSection("services")}
        >
          Servicios
        </span>
        <span
          className={
            activeLink === "contact"
              ? "header-link active-link"
              : "header-link"
          }
          onClick={() => scrollToSection("contact")}
        >
          Contacto
        </span>
      </div>

      {/* Grupo 2: Inicio de sesion*/}
      <div className="header-actions-group">

        <NavLink to="/login" style={{ textDecoration: "none" }}>
          <Button
            variant="contained"
            disableElevation
            sx={{
              backgroundColor: "#00a884", // Verde esmeralda/turquesa igual al prototipo
              color: "#ffffff",
              textTransform: "none",
              fontWeight: 600,
              fontSize: "0.875rem",
              borderRadius: "8px",
              padding: "6px 16px",
              "&:hover": {
                backgroundColor: "#008f70",
              },
            }}
          >
            Iniciar sesión
          </Button>
        </NavLink>
      </div>
    </nav>
  );
};