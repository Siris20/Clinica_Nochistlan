import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import FacebookIcon from "@mui/icons-material/Facebook";
import LinkedInIcon from '@mui/icons-material/LinkedIn';
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
  }

  return (
    <nav className="header-nav">
      <span
        className={activeLink === "/" ? "header-link active-link" : "header-link"}
        onClick={scrollToTop} 
      >
        Inicio
      </span>
      <span
        className={activeLink === "about" ? "header-link active-link" : "header-link"}
        onClick={() => scrollToSection("about")} 
      >
        ¿Quiénes somos?
      </span>
      <span
        className={activeLink === "services" ? "header-link active-link" : "header-link"}
        onClick={() => scrollToSection("services")} 
      >
        Servicios
      </span>
      <span
        className={activeLink === "contact" ? "header-link active-link" : "header-link"}
        onClick={() => scrollToSection("contact")} 
      >
        Contacto
      </span>
      <span
        className="header-link"
        onClick={() => navigate("/catalogos")}
      >
        Catálogos
      </span>
      <div className="social-links">
        <NavLink to="https://www.facebook.com/tadimex.mx">
          <FacebookIcon style={{ color: "blue" }} />
        </NavLink>
        <NavLink to="https://www.linkedin.com/tadimex.mx/">
          <LinkedInIcon style={{ color: "rgb(25, 118, 210)" }} />
        </NavLink>
      </div>
      <NavLink to="/login">
        <Button variant="contained" sx={{ backgroundColor: "#f44ecf" }}>
          Iniciar sesión
        </Button>
      </NavLink>
    </nav>
  );
}
