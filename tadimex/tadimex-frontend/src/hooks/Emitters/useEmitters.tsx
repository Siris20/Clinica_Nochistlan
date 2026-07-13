import React, { useEffect, useMemo, useState } from "react";

export const useEmitters = (selectedEnterpriseId = null) => {
  const [emitters, setEmitters] = useState([]);
  const [selectedEmitter, setSelectedEmitter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Estados para paginación
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalEmitters, setTotalEmitters] = useState(0);

  //Filtrar emisores según la empresa seleccionada y el término de búsqueda
  const filteredEmitters = useMemo(() => {
    //Filtramos por empresa
    let filtered = [];
    if (!selectedEnterpriseId) {
      filtered = emitters;
    } else {
      filtered = emitters.filter(
        (emitter) => emitter.empresa_id === selectedEnterpriseId
      );
    }

    //Luego filtramos por término de búsqueda
    if (searchTerm) {
      return filtered.filter(
        (emitter) =>
          emitter.razon_social
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          emitter.rfc.toLowerCase().includes(searchTerm.toLowerCase()) ||
          emitter.tipo_persona
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          emitter.regimen_fiscal
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          emitter.numero_certificado
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          emitter.banco.toLowerCase().includes(searchTerm.toLowerCase()) ||
          emitter.numero_cuenta
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          emitter.clabe.toLowerCase().includes(searchTerm.toLowerCase()) ||
          emitter.numero_tarjeta
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  }, [emitters, selectedEnterpriseId, searchTerm]);

  //Aplicamos la paginacion a los emisores filtrados por empresa
  const paginatedFilteredEmitters = useMemo(() => {
    const startIndex = page * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;

    //Actualizamos el total de emisores para la paginación
    setTotalEmitters(filteredEmitters.length);

    //Retornamos los emisores filtrados y paginados
    return filteredEmitters.slice(startIndex, endIndex);
  }, [filteredEmitters, page, rowsPerPage, totalEmitters]);

  //Efeto para manejar la busqueda
  useEffect(() => {
    if (searchTerm) {
      if (filteredEmitters.length > 0) {
        setPage(0);
      }
    }
  }, [searchTerm, filteredEmitters]);

  //Funcion para obtener todos los emisores
  const handleGetEmitters = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_SERVER}/api/v1/emisores`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const result = await response.json();
        setEmitters(result);
        setLoading(false);
      }
    } catch (error) {
      setLoading(true);
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

  //Funcion para obtener un emisor por su id
  const handleGetEmitter = async (id: number) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_SERVER}/api/v1/emisor/${id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const result = await response.json();
        setSelectedEmitter(result);
      }
    } catch (error) {
      throw new Error("Error al obtener el emisor");
    }
  };

  //Funcion para borrar un emisor
  const handleDeleteEmitter = async (id: number) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_SERVER}/api/v1/emisor/${id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        handleGetEmitters();
      } else {
        const errorData = await response.json();

        if (
          errorData.detail &&
          (errorData.detail.includes("emisor_id") ||
            errorData.detail.includes("cotizaciones"))
        ) {
          throw new Error(
            "No se puede eliminar el emisor porque tiene cotizaciones asociadas"
          );
        }

        throw new Error(
          errorData.detail || `Error ${response.status}: ${response.statusText}`
        );
      }
    } catch (error) {
      throw new Error("Error al eliminar el emisor");
    }
  };

  //Funcion para crear un emisor
  const handleCreateEmitter = async (emitterData) => {
    try {
      // Crear un objeto FormData
      const formData = new FormData();

      // Agregar cada campo al FormData
      formData.append("tipo_persona", emitterData.tipo_persona);
      formData.append("numero_exterior", emitterData.numero_exterior);
      formData.append("razon_social", emitterData.razon_social);
      formData.append("estado", emitterData.estado);
      formData.append("calle", emitterData.calle);
      formData.append("localidad", emitterData.localidad);
      formData.append("numero_tarjeta", emitterData.numero_tarjeta);
      formData.append("numero_cuenta", emitterData.numero_cuenta);
      formData.append("municipio", emitterData.municipio);
      formData.append("numero_certificado", emitterData.numero_certificado);
      formData.append("contrasena_clave", emitterData.contrasena_clave);
      formData.append("rfc", emitterData.rfc);
      formData.append("es_pruebas", emitterData.es_pruebas);
      formData.append("empresa_id", emitterData.empresa_id);
      formData.append("codigo_postal", emitterData.codigo_postal);
      formData.append("colonia", emitterData.colonia);
      formData.append("banco", emitterData.banco);
      formData.append("clabe", emitterData.clabe);
      formData.append("regimen_fiscal", emitterData.regimen_fiscal);

      // Agregar campos opcionales solo si existen
      if (emitterData.numero_interior) {
        formData.append("numero_interior", emitterData.numero_interior);
      }

      // Si hay archivos de certificado y clave privada, agregarlos
      if (
        emitterData.certificado_path &&
        emitterData.certificado_path instanceof File
      ) {
        formData.append("certificado_path", emitterData.certificado_path);
      }
      if (
        emitterData.clave_privada_path &&
        emitterData.clave_privada_path instanceof File
      ) {
        formData.append("clave_privada_path", emitterData.clave_privada_path);
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_SERVER}/api/v1/emisor`,
        {
          method: "POST",
          headers: {
            accept: "application/json",
          },
          body: formData,
        }
      );

      if (response.ok) {
        await handleGetEmitters();
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

  const handleUpdateEmitter = async (id, emitterData) => {
    try {
      // Crear un objeto FormData
      const formData = new FormData();

      // Agregar cada campo al FormData
      formData.append("tipo_persona", emitterData.tipo_persona);
      formData.append("numero_exterior", emitterData.numero_exterior);
      formData.append("razon_social", emitterData.razon_social);
      formData.append("estado", emitterData.estado);
      formData.append("calle", emitterData.calle);
      formData.append("localidad", emitterData.localidad);
      formData.append("numero_tarjeta", emitterData.numero_tarjeta);
      formData.append("numero_cuenta", emitterData.numero_cuenta);
      formData.append("municipio", emitterData.municipio);
      formData.append("numero_certificado", emitterData.numero_certificado);
      formData.append("contrasena_clave", emitterData.contrasena_clave);
      formData.append("rfc", emitterData.rfc);
      formData.append("es_pruebas", emitterData.es_pruebas);
      formData.append("empresa_id", emitterData.empresa_id);
      formData.append("codigo_postal", emitterData.codigo_postal);
      formData.append("colonia", emitterData.colonia);
      formData.append("banco", emitterData.banco);
      formData.append("clabe", emitterData.clabe);
      formData.append("regimen_fiscal", emitterData.regimen_fiscal);

      // Agregar campos opcionales solo si existen
      if (emitterData.numero_interior) {
        formData.append("numero_interior", emitterData.numero_interior);
      }
      // Si hay archivos de certificado y clave privada, agregarlos
      if (
        emitterData.certificado_path &&
        emitterData.certificado_path instanceof File
      ) {
        formData.append("certificado_path", emitterData.certificado_path);
      }
      if (
        emitterData.clave_privada_path &&
        emitterData.clave_privada_path instanceof File
      ) {
        formData.append("clave_privada_path", emitterData.clave_privada_path);
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_SERVER}/api/v1/emisor/${id}`,
        {
          method: "PUT",
          headers: {
            accept: "application/json",
          },
          body: formData,
        }
      );

      if (response.ok) {
        await handleGetEmitters();
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

  //Efecto para obtener los emisores al cargar la página
  useEffect(() => {
    handleGetEmitters();
  }, []);

  //Efecto para resetear la paginación al cambiar de empresa
  useEffect(() => {
    setPage(0); // Reset a la primera página al cambiar de empresa
  }, [selectedEnterpriseId]);

  return {
    emitters,
    filteredEmitters: paginatedFilteredEmitters,
    allFilteredEmitters: filteredEmitters,
    setEmitters,
    selectedEmitter,
    setSelectedEmitter,
    loading,
    page,
    setPage,
    rowsPerPage,
    setRowsPerPage,
    totalEmitters,
    handleChangePage,
    handleChangeRowsPerPage,
    searchTerm,
    setSearchTerm,
    handleGetEmitters,
    handleGetEmitter,
    handleDeleteEmitter,
    handleCreateEmitter,
    handleUpdateEmitter,
  };
};
