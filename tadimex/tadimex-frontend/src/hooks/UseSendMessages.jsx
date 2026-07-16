import { useState } from "react";

export const UseSendMessages = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSendMessages = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60000)

    try {
      const response = await fetch(`${import.meta.env.VITE_API_SERVER}/send_whatsapp_messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error("Surgio un problema al enviar los mensajes, intenta de nuevo en 10 segundos");
      }

      const result = await response.json();
      setSuccess(true);
      alert("Mensajes enviados correctamente");
      clearTimeout(timeout);
    } catch (error) {
      setError(error.message);
      alert("Surgio un problema al enviar los mensajes, intenta de nuevo");
    } finally {
      setLoading(false);
    }
  };

  return { handleSendMessages, loading, error, success };
};