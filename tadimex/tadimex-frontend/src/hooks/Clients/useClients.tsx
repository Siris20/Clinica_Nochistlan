import React, { useEffect, useMemo, useState } from "react";

export const useClients = (selectedEnterpriseId = null) => {
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [clientType, setClientType] = useState("todos");

  // Estados para paginación
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalClients, setTotalClients] = useState(0);

  // Filtrar Clientes según la empresa seleccionada y el término de búsqueda
  const filteredClients = useMemo(() => {
    // Primero filtramos por empresa
    let filtered = [];
    if (!selectedEnterpriseId) {
      filtered = clients;
    } else {
      filtered = clients.filter(
        (client) => client.empresa_id === selectedEnterpriseId
      );
    }

    // Luego filtramos por término de búsqueda si existe
    if (searchTerm) {
      return filtered.filter(
        (client) =>
          client.nombre_fiscal
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          client.contact_name
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          client.phone_number
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          client.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  }, [clients, selectedEnterpriseId, searchTerm]);

  // Aplicamos la paginación a los clientes filtrados por empresa
  const paginatedFilteredClients = useMemo(() => {
    const startIndex = page * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;

    // Actualizamos el total de clientes para la paginación
    setTotalClients(filteredClients.length);

    // Devolvemos solo la porción que corresponde a la página actual
    return filteredClients.slice(startIndex, endIndex);
  }, [filteredClients, page, rowsPerPage, totalClients]);

  // Efecto para manejar la búsqueda
  useEffect(() => {
    if (searchTerm) {
      // Si hay resultados de búsqueda, calculamos en qué página debería estar el primer resultado
      if (filteredClients.length > 0) {
        // Calculamos en qué página está el primer resultado (siempre será la primera página en este caso)
        setPage(0);
      }
    }
  }, [searchTerm, filteredClients]);

  //Funcion para obtener todos los clientes
  const handleGetClients = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_SERVER}/api/v1/clientes`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const result = await response.json();
        setClients(result);
        setLoading(false);
      }
    } catch (error) {
      setLoading(true);
    }
  };

  //Función para obtener los clientes prospectos
  const handleGetProspectClients = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_SERVER}/api/v1/prospectos`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const result = await response.json();
        setClients(result);
        setLoading(false);
      }
    } catch (error) {
      setLoading(true);
    }
  };

  //Función para obtener los clientes activos
  const handleGetActiveClients = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_SERVER}/api/v1/clientes-activos`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const result = await response.json();
        setClients(result);
        setLoading(false);
      }
    } catch (error) {
      setLoading(true);
    }
  };

  // Función para manejar el cambio de tipo de cliente
  const handleClientTypeChange = async (newClientType) => {
    setLoading(true);
    setClientType(newClientType);
    setPage(0); // Reset página al cambiar tipo

    try {
      switch (newClientType) {
        case "todos":
          await handleGetClients();
          break;
        case "activos":
          await handleGetActiveClients();
          break;
        case "prospectos":
          await handleGetProspectClients();
          break;
        default:
          await handleGetClients();
      }
    } catch (error) {
      console.error("Error al cambiar tipo de cliente:", error);
      setLoading(false);
    }
  };

  // Función para manejar el cambio de página
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Función para manejar el cambio de filas por página
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // Resetear a la primera página cuando cambia el número de filas
  };

  //Funcion para obtener un cliente por su id
  const handleGetClient = async (id) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_SERVER}/api/v1/cliente/${id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const result = await response.json();
        setSelectedClient(result);
      }
    } catch (error) {
      throw new Error("Error al obtener el cliente");
    }
  };

  //Funcion para borrar un cliente
  const handleDeleteClient = async (id) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_SERVER}/api/v1/cliente/${id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        handleGetClients();
      } else {
        const errorData = await response.json();

        // Verifica si el error está relacionado con cotizaciones
        if (
          errorData.detail &&
          (errorData.detail.includes("cliente_id") ||
            errorData.detail.includes("cotizaciones"))
        ) {
          throw new Error(
            "No se puede eliminar el cliente porque está asociado a una o más cotizaciones"
          );
        }

        throw new Error(
          errorData.detail || `Error ${response.status}: ${response.statusText}`
        );
      }
    } catch (error) {
      throw new Error("Error al eliminar el cliente");
    }
  };

  //Funcion para crear un cliente
  const handleCreateClient = async (clientData) => {
    try {
      //Convertir los datos a fotmato URLSearchParams
      const formData = new URLSearchParams();

      //Agregar cada campo al formData
      formData.append("nombre_fiscal", clientData.nombre_fiscal);
      formData.append("tipo_persona", clientData.tipo_persona);
      formData.append("regimen_fiscal", clientData.regimen_fiscal);
      formData.append("rfc", clientData.rfc);
      formData.append("contact_name", clientData.contact_name);
      formData.append("alias", clientData.alias);
      formData.append("land_line", clientData.land_line);
      formData.append("phone_number", clientData.phone_number);
      formData.append("email", clientData.email);
      formData.append("calle", clientData.calle);
      formData.append("numero_exterior", clientData.numero_exterior);
      formData.append("numero_interior", clientData.numero_interior || "");
      formData.append("colonia", clientData.colonia);
      formData.append("localidad", clientData.localidad);
      formData.append("municipio", clientData.municipio);
      formData.append("estado", clientData.estado);
      formData.append("codigo_postal", clientData.codigo_postal);
      formData.append("observaciones", clientData.observaciones);
      formData.append("empresa_id", clientData.empresa_id);

      const response = await fetch(
        `${import.meta.env.VITE_API_SERVER}/api/v1/cliente`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            accept: "application/json",
          },
          body: formData,
        }
      );

      if (response.ok) {
        await handleGetClients();
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

  //Funcion para editar un cliente
  const handleUpdateClient = async (id, clientData) => {
    try {
      //Convertir los datos a fotmato URLSearchParams
      const formData = new URLSearchParams();

      //Agregar cada campo al formData
      formData.append("nombre_fiscal", clientData.nombre_fiscal);
      formData.append("tipo_persona", clientData.tipo_persona);
      formData.append("regimen_fiscal", clientData.regimen_fiscal);
      formData.append("rfc", clientData.rfc);
      formData.append("contact_name", clientData.contact_name);
      formData.append("alias", clientData.alias);
      formData.append("land_line", clientData.land_line);
      formData.append("phone_number", clientData.phone_number);
      formData.append("email", clientData.email);
      formData.append("calle", clientData.calle);
      formData.append("numero_exterior", clientData.numero_exterior);
      formData.append("numero_interior", clientData.numero_interior || "");
      formData.append("colonia", clientData.colonia);
      formData.append("localidad", clientData.localidad);
      formData.append("municipio", clientData.municipio);
      formData.append("estado", clientData.estado);
      formData.append("codigo_postal", clientData.codigo_postal);
      formData.append("observaciones", clientData.observaciones);
      formData.append("empresa_id", clientData.empresa_id);

      const response = await fetch(
        `${import.meta.env.VITE_API_SERVER}/api/v1/cliente/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            accept: "application/json",
          },
          body: formData,
        }
      );

      if (response.ok) {
        await handleGetClients();
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

  //Convertir prospecto a cliente.
  const handleProspectToClient = async (id)=> {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_SERVER}/api/v1/prospecto/${id}/convertir-a-cliente`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            accept: "application/json",
          },
        }
      );

      if (response.ok) {
        await handleGetProspectClients();
        return true;
      } else {
        const errorData = await response.json();
        throw new Error(
          errorData.detail || `Error ${response.status}: ${response.statusText}`
        );
      }
    } catch (error) {
      throw error;
    }
  };

  // Efecto para cargar todos los clientes una sola vez
  useEffect(() => {
    handleGetClients();
  }, []);

  // Efecto para reiniciar a la primera página cuando cambia la empresa seleccionada
  useEffect(() => {
    setPage(0); // Reset a la primera página al cambiar de empresa
  }, [selectedEnterpriseId]);

  return {
    clients,
    filteredClients: paginatedFilteredClients,
    allFilteredClients: filteredClients,
    setClients,
    selectedClient,
    setSelectedClient,
    loading,
    page,
    setPage,
    rowsPerPage,
    setRowsPerPage,
    totalClients,
    handleChangePage,
    handleChangeRowsPerPage,
    searchTerm,
    setSearchTerm,
    clientType,
    setClientType,
    handleGetClients,
    handleGetProspectClients,
    handleGetActiveClients,
    handleClientTypeChange,
    handleGetClient,
    handleDeleteClient,
    handleCreateClient,
    handleUpdateClient,
    handleProspectToClient
  };
};
