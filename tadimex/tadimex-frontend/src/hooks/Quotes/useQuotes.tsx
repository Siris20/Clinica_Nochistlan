import React, { useEffect, useMemo, useState } from 'react';
import { useEmitters } from '../Emitters/useEmitters';
import { useClients } from '../Clients/useClients';
import { useLogos } from '../Logos/useLogos';

export const useQuotes = (selectedEnterpriseId = null) => {

  //Estados originales
  const [quotes, setQuotes] = useState([]);
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Estados para paginación
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalQuotes, setTotalQuotes] = useState(0);

  // Obtener emisores, clientes y logos
  const { emitters } = useEmitters();
  const { clients } = useClients();
  const { logos } = useLogos();

  // Filtrar cotizaciones por empresa seleccionada
  const filteredByEnterprise = useMemo(() => {
    if (!selectedEnterpriseId) return quotes;
    
    // Obtener IDs de logos que pertenecen a la empresa seleccionada
    const enterpriseLogoIds = logos
      .filter(logo => logo.empresa_id === selectedEnterpriseId)
      .map(logo => logo.id);

    return quotes.filter(quote => 
      quote.logo_id === null || enterpriseLogoIds.includes(quote.logo_id)
    );
  }, [quotes, logos, selectedEnterpriseId]);

  // Enriquecer las cotizaciones con información adicional
  const enrichedQuotes = useMemo(() => {
    return filteredByEnterprise.map(quote => {
      const emisor = emitters.find(e => e.id === quote.emisor_id);
      const cliente = clients.find(c => c.id === quote.cliente_id);
      const logo = logos.find(l => l.id === quote.logo_id);

      // Calcular el total de productos
      const totalProductos = quote.productos_cotizados?.reduce((sum, producto) => {
        return sum + (producto.cantidad || 0);
      }, 0) || 0;
      
      return {
        ...quote,
        emisor_nombre: emisor ? emisor.razon_social : 'Emisor no encontrado',
        cliente_nombre: cliente ? cliente.nombre_fiscal : 'Cliente no encontrado', 
        logo_nombre: logo ? logo.image_url : '',
        totalProductos,
      };
    });
  }, [filteredByEnterprise, emitters, clients, logos]);

  // Aplicar filtro de búsqueda
  const filteredQuotes = useMemo(() => {
    if (!searchTerm) return enrichedQuotes;
    
    return enrichedQuotes.filter(
      (quote) =>
        quote.folio?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quote.cliente_nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quote.emisor_nombre?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [enrichedQuotes, searchTerm]);

  // Aplicar paginación a las cotizaciones filtradas
  const paginatedQuotes = useMemo(() => {
    const startIndex = page * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    
    // Actualizar el total de cotizaciones para la paginación
    setTotalQuotes(filteredQuotes.length);
    
    // Devolver solo la porción que corresponde a la página actual
    return filteredQuotes.slice(startIndex, endIndex);
  }, [filteredQuotes, page, rowsPerPage]);

  // Función para manejar el cambio de página
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  
  // Función para manejar el cambio de filas por página
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // Resetear a la primera página cuando cambia el número de filas
  };

  // Función para obtener todas las cotizaciones
  const handleGetQuotes = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_SERVER}/api/v1/cotizaciones`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
  
      if (response.ok) {
        const result = await response.json();
        
        // Ordenar las cotizaciones por fecha de creación (descendente)
        const sortedQuotes = result.sort((a, b) => 
          new Date(b.created_at) - new Date(a.created_at)
        );
        
        setQuotes(sortedQuotes);
        setLoading(false);
      }
    } catch (error) {
      setLoading(true);
    }
  };

  const handleGetQuote = async (id) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_SERVER}/api/v1/cotizacion/${id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
  
      if (response.ok) {
        const result = await response.json();
        
        const emisor = emitters.find(e => e.id === result.emisor_id);
        const cliente = clients.find(c => c.id === result.cliente_id);
        const logo = logos.find(l => l.id === result.logo_id);
        
        const clienteAddress = cliente ? 
          `${cliente.calle} ${cliente.numero_exterior}${
            cliente.numero_interior ? `, Int. ${cliente.numero_interior}` : ""
          }, ${cliente.colonia}, ${cliente.municipio}, ${cliente.estado}, CP ${cliente.codigo_postal}`
          : 'Dirección no encontrada';
  
        const enrichedQuote = {
          ...result,
          emisor_nombre: emisor ? emisor.razon_social : 'Emisor no encontrado',
          emisor_rfc: emisor ? emisor.rfc : 'RFC no encontrado',
          emisor_datos_completos: emisor,
          cliente_nombre: cliente ? cliente.nombre_fiscal : 'Cliente no encontrado',
          cliente_domicilio: clienteAddress,
          cliente_datos_completos: cliente,
          logo_nombre: logo ? logo.image_url : null,
          totalProductos: result.productos_cotizados?.reduce((sum, producto) => {
            return sum + (producto.cantidad || 0);
          }, 0) || 0
        };
        setSelectedQuote(enrichedQuote);
        return enrichedQuote; 
      }
    } catch (error) {
      console.error('Error en handleGetQuote:', error);
      throw new Error("Error al obtener la cotización");
    }
  };
  
  // Función para borrar una cotización
  const handleDeleteQuote = async (id) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_SERVER}/api/v1/cotizacion/${id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        handleGetQuotes();
      }
    } catch (error) {
      throw new Error("Error al eliminar la cotización");
    }
  };

  // Función para crear una cotización
  const handleCreateQuote = async (quoteData) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_SERVER}/api/v1/cotizacion`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(quoteData),
        }
      );

      if(response.ok){
        await handleGetQuotes();
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

  // Función para editar una cotización
  const handleUpdateQuote = async (id, quoteData) => {
    if (!id) {
      throw new Error('ID de cotización no proporcionado');
    }
  
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_SERVER}/api/v1/cotizacion/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            cotizacion_data: quoteData.cotizacion_data,
            productos_cotizados: quoteData.productos_cotizados
          }),
        }
      );
        
      if(!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.detail || `Error ${response.status}: ${response.statusText}`
        );
      }

      await handleGetQuotes();
      return true;
    } catch (error) {
      console.error('Error en handleUpdateQuote:', error);
      throw error;
    }
  };

  // Efecto para cargar todas las cotizaciones al inicio
  useEffect(() => {
    handleGetQuotes();
  }, []);

  // Efecto para reiniciar a la primera página cuando cambia la empresa seleccionada
  useEffect(() => {
    setPage(0);
  }, [selectedEnterpriseId]);

  // Efecto para manejar la búsqueda
  useEffect(() => {
    if (searchTerm) {
      setPage(0);
    }
  }, [searchTerm]);

  return {
    quotes,
    filteredQuotes: paginatedQuotes,
    allFilteredQuotes: filteredQuotes,
    setQuotes,
    selectedQuote,
    setSelectedQuote,
    loading,
    // Exportamos las funciones y estados de paginación
    page,
    setPage,
    rowsPerPage,
    setRowsPerPage,
    totalQuotes,
    handleChangePage,
    handleChangeRowsPerPage,
    // Exportamos el estado y funciones de búsqueda
    searchTerm,
    setSearchTerm,
    // Resto de funciones
    handleGetQuotes,
    handleGetQuote,
    handleDeleteQuote, 
    handleCreateQuote, 
    handleUpdateQuote,
  };
};