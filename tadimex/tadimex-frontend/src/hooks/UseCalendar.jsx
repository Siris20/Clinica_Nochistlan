import { useState } from "react";

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
        const response = await fetch(`${import.meta.env.VITE_API_SERVER}/get_events`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
    
        if (response.ok) {
          const result = await response.json();
          setMyEvents(result)
          setLoadingEvents(false);
        }
      } catch (error) {
        setLoadingEvents(true);
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
