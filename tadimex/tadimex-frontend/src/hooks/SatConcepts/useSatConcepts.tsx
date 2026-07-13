import { useEffect, useState } from "react";

export const useSatConcepts = () => {
  const [selectedSatConcept, setSelectedSatConcept] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

  // Función para obtener un concepto por su clave
  const handleGetSatConceptByClave = async (clave) => {
    if (!clave) {
      setSelectedSatConcept(null);
      return;
    }
    
    try {
      setLoading(true);
      const response = await fetch(
        `${import.meta.env.VITE_API_SERVER}/api/v1/concepto-sat/clave/${clave}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const result = await response.json();
        setSelectedSatConcept(result);
      } else {
        setSelectedSatConcept(null);
      }
    } catch (error) {
      console.error("Error al obtener concepto SAT:", error);
      setSelectedSatConcept(null);
    } finally {
      setLoading(false);
    }
  };

  // Nueva función para buscar conceptos SAT en tiempo real
  const searchSatConcepts = async (searchTerm, limit = 10) => {
    if (!searchTerm || searchTerm.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      setSearchLoading(true);
      const response = await fetch(
        `${import.meta.env.VITE_API_SERVER}/api/v1/conceptos-sat/search?search_term=${searchTerm}&skip=0&limit=${limit}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const results = await response.json();
        setSearchResults(results);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error("Error al buscar conceptos SAT:", error);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  // Función para limpiar los resultados de búsqueda
  const clearSearchResults = () => {
    setSearchResults([]);
  };

  return {
    selectedSatConcept,
    loading,
    handleGetSatConceptByClave,
    searchSatConcepts,
    searchResults,
    searchLoading,
    clearSearchResults
  };
};