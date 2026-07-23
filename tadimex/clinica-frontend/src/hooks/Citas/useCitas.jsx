import { useState, useEffect } from "react";

export const useCitas = (filtroArea = "TODAS") => {
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleGetCitas = async () => {
    setLoading(true);
    setError(null);
    try {
      let url = `${import.meta.env.VITE_API_SERVER}/api/v1/?fecha_inicio=2026-01-01T00:00:00&fecha_fin=2026-12-31T23:59:59`;

      if (filtroArea && filtroArea !== "TODAS") {
        const areaIdNumerico = Number(filtroArea);
        if (!isNaN(areaIdNumerico)) {
          url += `&area_id=${areaIdNumerico}`;
        }
      }

      const res = await fetch(url);
      if (!res.ok) throw new Error(`Error ${res.status}: No se pudieron cargar las citas`);
      
      const data = await res.json();

      const eventosFormateados = data.map((cita) => ({
        id: cita.id,
        title: `${cita.cliente?.nombre_fiscal || "Cliente"} - ${cita.area?.name || "Cita"}`,
        start: new Date(cita.fecha_inicio),
        end: new Date(cita.fecha_fin),
        ...cita,
      }));

      setCitas(eventosFormateados);
    } catch (err) {
      console.error("Error al obtener las citas:", err);
      setError(err?.message || "Error al cargar las citas");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCita = async (payload, modoEdicion, citaId) => {
    let url = `${import.meta.env.VITE_API_SERVER}/api/v1/cita`;
    let method = "POST";

    if (modoEdicion && citaId) {
      url = `${import.meta.env.VITE_API_SERVER}/api/v1/cita/${citaId}`;
      method = "PUT";
    }

    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      const mensajeError = typeof errorData.detail === "object"
        ? JSON.stringify(errorData.detail)
        : errorData.detail;
      throw new Error(mensajeError || "Ocurrió un error al procesar la cita.");
    }

    await handleGetCitas();
    return true;
  };

  const handleDeleteCita = async (id) => {
    const response = await fetch(`${import.meta.env.VITE_API_SERVER}/api/v1/cita/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("No se pudo eliminar la cita.");
    }

    await handleGetCitas();
    return true;
  };

  useEffect(() => {
    handleGetCitas();
  }, [filtroArea]);

  return {
    citas,
    loading,
    error,
    handleGetCitas,
    handleSaveCita,
    handleDeleteCita,
  };
};