import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "../styles/Header.css";
import FacebookIcon from "@mui/icons-material/Facebook";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import Button from "@mui/material/Button";

export const OffCanvasContent = () => {
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
    <>
      <div className="offcanvas-header">
        <div className="logo-container d-flex align-items-center">
          <a href="/">
            <img src="images/tadimex.png" alt="Tadimex" className="header-logo" />
          </a>
        </div>
      </div>
      <div className="offcanvas-body">
        <div className="list-group">
          <div className="list-group-item d-flex align-items-center">
            <span
              className={activeLink === "/" ? "header-link active-link" : "header-link"}
              onClick={scrollToTop}
            >
              Inicio
            </span>
          </div>
          <div className="list-group-item d-flex align-items-center">
            <span
              className={activeLink === "about" ? "header-link active-link" : "header-link"}
              onClick={() => scrollToSection("about")}
            >
              ¿Quiénes somos?
            </span>
          </div>
          <div className="list-group-item d-flex align-items-center">
            <span
              className={activeLink === "services" ? "header-link active-link" : "header-link"}
              onClick={() => scrollToSection("services")}
            >
              Servicios
            </span>
          </div>
          <div className="list-group-item d-flex align-items-center">
            <span
              className={activeLink === "contact" ? "header-link active-link" : "header-link"}
              onClick={() => scrollToSection("contact")}
            >
              Contacto
            </span>
          </div>
          <div className="list-group-item d-flex align-items-center">
            <span
              className="header-link"
              onClick={() => navigate("/catalogos")}
            >
              Catálogos
            </span>
          </div>
          <div className="list-group-item d-flex align-items-center social-links">
            <NavLink to="https://www.facebook.com/tadimex.mx">
              <FacebookIcon style={{ color: "blue" }} />
            </NavLink>
            <NavLink to="https://www.linkedin.com/tadimex.mx/">
              <LinkedInIcon style={{ color: "rgb(25, 118, 210)" }} />
            </NavLink>
          </div>
          <div className="list-group-item d-flex align-items-center">
            <NavLink to="/login">
              <Button variant="contained" sx={{ backgroundColor: "#f44ecf" }}>
                Iniciar sesión
              </Button>
            </NavLink>
          </div>
        </div>
      </div>
    </>
  );
};
