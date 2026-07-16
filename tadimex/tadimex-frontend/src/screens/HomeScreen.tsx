import { Header } from "../partials/Header";
import "../App.css";
import "../styles/HomeScreen.css";
import Footer from "../partials/Footer";
import { useVisitCounter } from "../hooks/useVisitCounter";
import { useEffect } from "react";
import About from "../components/About";
import Services from "../components/Services";
import Contact from "../components/Contact";
import { Mision_Vision } from "../components/Mision_Vision";
import { PricePlans } from "../components/PricePlans";

function HomeScreen() {

  const {initializeVisitTracking } = useVisitCounter();
  
    useEffect(() => {
      initializeVisitTracking();
    }, []);


  return (
    <>
      <Header />
      <div className="background-container" style={{ position: 'relative' }}>
        <img
          src="images/tadimex-portada.png"
          alt="Tadimex"
          className="banner d-block w-100"
        />
        
        {/* Logo y texto de Fenmex en la esquina inferior derecha */}
        <div 
          style={{
            position: 'absolute',
            bottom: '20px',
            right: '20px',
            display: 'flex',
            alignItems: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            padding: '8px 12px',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
            zIndex: 10
          }}
        >
          <span 
            style={{
              fontSize: '12px',
              fontWeight: '600',
              color: '#333',
              marginRight: '8px',
              whiteSpace: 'nowrap'
            }}
          >
            Desarrollada por
          </span>
          <img
            src="images/fenmex_hr.webp"
            alt="Fenmex"
            style={{
              height: '24px',
              width: 'auto',
              objectFit: 'contain'
            }}
          />
        </div>
      </div>

      {/* ¿Quiénes somos? */}
      <About />

      {/* Misión, Visión y Valores */}
      <Mision_Vision />

      {/* Servicios */}
      <Services />

      {/* Planes de Precios */}
      <PricePlans />

      {/* Contacto */}
      <Contact />



      <Footer />
    </>
  );
}

export default HomeScreen;