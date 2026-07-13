import * as XLSX from "xlsx";
import { useState, useEffect } from "react";

export const UseSaveMessages = () => {
  const [formData, setFormData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isImported, setIsImported] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [whatsappButtonState, setWhatsappButtonState] = useState("blocked")
  const [timer, setTimer] = useState(30)

  useEffect(() => {
    let interval;
    if (whatsappButtonState === "pending") {
      interval = setInterval(() => {
        setTimer((prevTimer) => {
          if (prevTimer > 0) {
            return prevTimer - 1;
          } else {
            clearInterval(interval);
            setWhatsappButtonState("active");
            return 30;
          }
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [whatsappButtonState]);


  //Guardar datos en mongo
  const handleSendData = async (rows) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_SERVER}/upload_data`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(rows),
      });

      if (!response.ok) {
        throw new Error("Error enviando los datos");
      }

      const result = await response.json();
      setFormData(result);
      setIsSaved(true);
      setWhatsappButtonState("pending")
      setTimer(30); // Reinicia el temporizador


      //Temporizador
      setTimeout(() => {
        setWhatsappButtonState("active");
      }, 30000);

      alert("Los datos se insertaron correctamente");
      handleGetData();
    } catch (error) {
      alert("Tienes que importar un archivo Excel primero");
    }
  };

  //Obtener datos de mongo
  const handleGetData = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_SERVER}/get_messages_data`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Error obteniendo los datos");
      }

      const result = await response.json();
      setFormData(result);

      if (result.length > 0) {
        setIsImported(true); // Si hay datos se bloquea
        setIsSaved(true);
        setLoading(false);
        setWhatsappButtonState("pending");
        setTimer(30); // Reinicia el temporizador

        setTimeout(() => {
          setWhatsappButtonState("active");
        }, 30000);
      }

      if(result.length === 0){
        setIsImported(false); // Si no hay datos se desbloquea
        setIsSaved(false);
        setWhatsappButtonState("blocked");
      }
  
      if(result.length<=0){
        alert("No existen datos, por favor importa un archivo Excel, y después da clic en guardar")
      }
    } catch (error) {
      alert("Error obteniendo los datos");
      setLoading(true);
    }
  };

  // Obtener datos de mongo y descargar como Excel
  const handleGetDataReport = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_SERVER}/get_messages_data_save_excel`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Error obteniendo los datos");
      }

      const result = await response.json();

      // Convertir los datos a una hoja de Excel
      const worksheet = XLSX.utils.json_to_sheet(result);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Messages");

      //Obtener la fecha actual
      const date = new Date();
      const dateFormatted = `${date.getFullYear()}-${
        date.getMonth() + 1
      }-${date.getDate()}`;

      // Crear un archivo Excel y descargarlo
      const filename = `reporte_mensajes_whatsapp_${dateFormatted}.xlsx`;
      XLSX.writeFile(workbook, filename);

      alert("Los datos se obtuvieron y descargaron correctamente");
    } catch (error) {
      alert("Error obteniendo los datos");
    }
  };

  return {
    handleSendData,
    handleGetData,
    handleGetDataReport,
    formData,
    isSaved,
    setIsSaved,
    isImported,
    setIsImported, 
    whatsappButtonState, 
    setWhatsappButtonState,
    timer, 
    setTimer, 
    loading,
  };
};
