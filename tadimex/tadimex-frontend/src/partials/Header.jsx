import "../styles/Header.css";
import { BurguerButton } from "../components/BurguerButton";
import { NavBarContent } from "../components/NavBarContent";
import { OffCanvasContent } from "../components/OffCanvasContent";



export const Header = ({showNavBarContent=true, customNavBarContent=null, customOffCanvasContent=null}) => {
  return (
    <>
      <header className="header-container">
        <div className="header-content">
          <div className="logo-container d-flex align-items-center">
            <a href="/">
              <img
                src="images/tadimex.png"
                alt="Tadimex"
                className="header-logo"
              />
            </a>
            {showNavBarContent && (
              <div className="d-lg-none ms-auto">
                <BurguerButton id="offcanvasTop" />
              </div>
            )}
          </div>
          {showNavBarContent && (customNavBarContent || <NavBarContent />)}
        </div>
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
