// hooks/useVisitCounter.ts
import { useEffect, useState } from 'react';

interface VisitStats {
  domain: string;
  site_name: string;
  period: {
    start_date: string;
    end_date: string;
  };
  total_visits: number;
  daily_average: number;
  max_day: {
    date: string;
    visits: number;
  };
  min_day: {
    date: string;
    visits: number;
  };
  daily_visits: Array<{
    date: string;
    visits: number;
  }>;
  weekly_visits: Array<{
    date: string;
    visits: number;
  }>;
  monthly_visits: Array<{
    date: string;
    visits: number;
  }>;
}

interface VisitResponse {
  message: string;
  visit_id: number;
  domain: string;
  page_url: string;
}

export const useVisitCounter = () => {
  const [visits, setVisits] = useState<VisitStats | null>(null);
  const [allWebsites, setAllWebsites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Función para extraer el dominio de una URL
  const extractDomain = (url: string): string => {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname.replace('www.', '');
    } catch (error) {
      return '';
    }
  };

  // Función para obtener la URL actual completa
  const getCurrentUrl = (): string => {
    if (typeof window !== 'undefined') {
      return window.location.href;
    }
    return '';
  };

  // Función para obtener el dominio objetivo (desarrollo vs producción)
  const getTargetDomain = (): string => {
    if (typeof window !== 'undefined') {
      const currentDomain = window.location.hostname.replace('www.', '');
      
      // Si no es localhost, usar el dominio actual (producción)
      if (currentDomain !== 'localhost' && currentDomain !== '127.0.0.1') {
        return currentDomain;
      }
    }
    
    // En desarrollo (localhost), usar el dominio configurado o fallback
    return 'tadimex.mx';

  };

  // Función para registrar una visita
  const handleRegisterVisit = async (): Promise<VisitResponse | null> => {
    try {
      const currentUrl = getCurrentUrl();
      
      if (!currentUrl) {
        return null;
      }

      // Obtener el dominio objetivo (automático según el entorno)
      const targetDomain = getTargetDomain();

      // Verificar si ya se registró una visita en esta sesión para este dominio
      const sessionKey = `visit_registered_${targetDomain}`;
      const visitRegistered = sessionStorage.getItem(sessionKey);
      
      if (visitRegistered) {
        return null;
      }


      const response = await fetch(
        `${import.meta.env.VITE_API_SERVER}/api/v1/visits/url/${targetDomain}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: ''
        }
      );

      if (response.ok) {
        const result: VisitResponse = await response.json();
        
        // Marcar que se registró la visita en esta sesión
        sessionStorage.setItem(sessionKey, 'true');
                
        // Refrescar las estadísticas usando el dominio target
        await handleGetVisits(targetDomain);
        
        return result;
      } else {
        return null;
      }
    } catch (error) {
      return null;
    }
  };

  // Función para obtener todas las visitas
  const handleGetVisits = async (domain: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(
        `${import.meta.env.VITE_API_SERVER}/api/v1/analytics/${domain}/dashboard`, 
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        const result = await response.json();
        setVisits(result);
      } else {
        setError(`Error: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  // Función para inicializar: registra visita y obtiene estadísticas
  const initializeVisitTracking = async () => {
    // Obtener el dominio objetivo automáticamente
    const targetDomain = getTargetDomain();

    // Registrar la visita
    await handleRegisterVisit();
    
    // Obtener las estadísticas
    await handleGetVisits(targetDomain);
  };

  // Función para obtener todos los sitios web
  const handleGetAllWebsites = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(
        `${import.meta.env.VITE_API_SERVER}/api/v1/websites`, 
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        const result = await response.json();
        setAllWebsites(result);
      } else {
        setError(`Error: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  //Función para registrar un sitio web
  const handleRegisterWebsite = async (websiteData) => {
    try {

      const response = await fetch(
        `${import.meta.env.VITE_API_SERVER}/api/v1/website`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(websiteData),
        }
      );

      if (response.ok) {
        await handleGetAllWebsites();
        return true;
      } else {
        const errorData = await response.json();
        if (errorData.detail && Array.isArray(errorData.detail)) {
          const errorMessages = errorData.detail.map((error) => {
            const field = error.loc[error.loc.length - 1];
            return `${field}: ${error.msg}`;
          });
          throw new Error(errorMessages.join("\n"));
        }
        throw new Error(
          errorData.detail || `Error ${response.status}: ${response.statusText}`
        );
      }
    } catch (error) {
      throw error;
    }
  };

  return {
    visits,
    allWebsites,
    handleGetAllWebsites,
    loading,
    error,
    handleGetVisits,
    handleRegisterVisit,
    handleRegisterWebsite,
    initializeVisitTracking,
    extractDomain,
    getCurrentUrl
  };
};