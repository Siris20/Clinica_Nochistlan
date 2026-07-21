import "../styles/Header.css";
import { BurguerButton } from "../components/BurguerButton";
import { NavBarContent } from "../components/NavBarContent";
import { OffCanvasContent } from "../components/OffCanvasContent";

export const Header = ({
  showNavBarContent = true,
  customNavBarContent = null,
  customOffCanvasContent = null,
}) => {
  return (
    <>
      <header className="header-container">
        <div className="header-content">
          {/* Lado Izquierdo: Logo y Marca */}
          <div className="logo-container d-flex align-items-center">
            <a href="/" className="brand-link">
              <span className="brand-title">Clínica Nochistlán</span>
              {/* <img
                src="images/ClinicaNochistlan_logo.png"
                alt="Clínica Nochistlán"
                className="header-logo"
              /> */}
              
            </a>
            {showNavBarContent && (
              <div className="d-lg-none ms-auto">
                <BurguerButton id="offcanvasTop" />
              </div>
            )}
          </div>

          {/* Centro y Derecha: Enlaces + Redes/CTA */}
          {showNavBarContent && (customNavBarContent || <NavBarContent />)}
        </div>

        {/* Menú Lateral (Móvil) */}
        {showNavBarContent && (
          <div
            className="offcanvas offcanvas-start"
            tabIndex="-1"
            id="offcanvasTop"
            aria-labelledby="offcanvasTopLabel"
          >
            {customOffCanvasContent || <OffCanvasContent />}
          </div>
        )}
      </header>
    </>
  );
};