import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import FacebookIcon from "@mui/icons-material/Facebook";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import Button from "@mui/material/Button";
import "../styles/Header.css";

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
      <div className="offcanvas-header d-flex justify-content-center w-100 py-3">
        <div className="logo-container d-flex align-items-center justify-content-center">
          <a href="/" className="d-flex justify-content-center">
            <img
              src="images/ClinicaNochistlan_logo.png"
              alt="Clinica Logo"
              className="header-logo offcanvas-logo"
            />
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

          {/* <div className="list-group-item d-flex align-items-center">
            <span
              className="header-link"
              onClick={() => navigate("/catalogos")}
            >
              Catálogos 
            </span>
          </div> */}

          {/* Redes Sociales con clase e iconos adaptados */}
          <div className="list-group-item d-flex align-items-center social-links">
            <a
              href="https://www.facebook.com/tadimex.mx"
              target="_blank"
              rel="noopener noreferrer"
              className="social-icon-link"
            >
              <FacebookIcon fontSize="small" />
            </a>
            <a
              href="https://www.linkedin.com/tadimex.mx/"
              target="_blank"
              rel="noopener noreferrer"
              className="social-icon-link"
            >
              <LinkedInIcon fontSize="small" />
            </a>
          </div>

          {/* Botón Iniciar Sesión con estilo idéntico al Navbar */}
          <div className="list-group-item d-flex align-items-center">
            <NavLink to="/login" style={{ textDecoration: "none", width: "100%" }}>
              <Button
                variant="contained"
                disableElevation
                fullWidth
                sx={{
                  backgroundColor: "#00a884",
                  color: "#ffffff",
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: "0.875rem",
                  borderRadius: "8px",
                  padding: "8px 16px",
                  "&:hover": {
                    backgroundColor: "#008f70",
                  },
                }}
              >
                Iniciar sesión
              </Button>
            </NavLink>
          </div>
        </div>
      </div>
    </>
  );
};