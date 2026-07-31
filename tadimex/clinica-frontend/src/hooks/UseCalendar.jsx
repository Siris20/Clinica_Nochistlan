import { useState } from "react";

const parseDateValue = (value) => {
  if (!value) return null;

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const normalizeEvent = (event, index) => {
  const start = parseDateValue(event?.start ?? event?.fecha_inicio ?? event?.fecha ?? event?.date ?? event?.inicio);
  const end = parseDateValue(event?.end ?? event?.fecha_fin ?? event?.fecha_fin ?? event?.finish ?? event?.fin);

  if (!start || !end) {
    return null;
  }

  return {
    ...event,
    id: event?.id ?? `${event?.title ?? "evento"}-${index}`,
    title: event?.title ?? event?.name ?? event?.message ?? event?.motivo ?? "Sin título",
    start,
    end,
    message: event?.message ?? event?.observaciones ?? event?.motivo ?? "",
    image_path: event?.image_path ?? event?.imagen ?? "",
  };
};

export const UseCalendar = () => {

  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [myEvents, setMyEvents] = useState([]);
  const [isSavedEvent , setIsSavedEvent] = useState(false);

  //Almacenar los datos del calendario
  const handleAddEvent = async (eventData) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_SERVER}/add_event`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(eventData),
      });
  
      if (!response.ok) {
        throw new Error("Error enviando los datos");
      }

      const result = await response.json();
      setEvents(result)

      if (result.length > 0) {
        setIsSavedEvent(true);
      }
      if(result.length === 0){
        setIsSavedEvent(false);
      }
      alert("Los eventos se guardaron correctamente");
    } catch (error) {
      alert("Tienes que importar un archivo Excel primero");
    }
  };

    //Obtiene los eventos del calendario
    const handleGetEvents = async () => {
      try {
        setLoadingEvents(true);

        const response = await fetch(`${import.meta.env.VITE_API_SERVER}/get_events`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
    
        if (!response.ok) {
          throw new Error(`Error ${response.status} al cargar los eventos`);
        }

        const payload = await response.json();
        const rawEvents = Array.isArray(payload)
          ? payload
          : payload?.items ?? payload?.data ?? payload?.events ?? [];

        const normalizedEvents = rawEvents
          .map((event, index) => normalizeEvent(event, index))
          .filter(Boolean);

        setMyEvents(normalizedEvents);
      } catch (error) {
        console.error("Error al obtener los eventos del calendario:", error);
        setMyEvents([]);
      } finally {
        setLoadingEvents(false);
      }
    }

    
  return {
    handleAddEvent, 
    handleGetEvents,
    myEvents,
    isSavedEvent,
    setIsSavedEvent, 
    loadingEvents
  }
}
