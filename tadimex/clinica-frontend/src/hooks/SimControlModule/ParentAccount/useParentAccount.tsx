import React, { useEffect, useState } from "react";

export const useParentAccount = () => {
  const [parentAccounts, setParentAccounts] = useState([]);
  const [selectedParentAccount, setSelectedParentAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  //Función para obtener las cuentas padre
  const handleGetParentAccounts = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_SERVER}/api/v1/cuentas-padre`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const result = await response.json();
        setParentAccounts(result);
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
    }
  };

  //Funcion para obtener una cuenta padre por su id
  const handleGetParentAccount = async (id) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_SERVER}/api/v1/cuenta-padre/${id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const result = await response.json();
        setSelectedParentAccount(result);
      }
    } catch (error) {
      throw new Error("Error al obtener la cuenta padre");
    }
  };

  // Función para crear una cuenta padre
  const handleCreateParentAccount = async (parentAccountData) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_SERVER}/api/v1/cuenta-padre`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(parentAccountData),
        }
      );

      if (response.ok) {
        await handleGetParentAccounts();
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

  // Función para actualizar una cuenta padre
  const handleUpdateParentAccount = async (id, parentAccountData) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_SERVER}/api/v1/cuenta-padre/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(parentAccountData),
        }
      );

      if (response.ok) {
        await handleGetParentAccounts();
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

  //Efecto para obtener todas las cuentas padre
  // useEffect(() => {
  //   handleGetParentAccounts();
  // }, []);

  return {
    parentAccounts,
    setParentAccounts,
    selectedParentAccount,
    setSelectedParentAccount,
    loading,
    searchTerm,
    setSearchTerm,
    handleGetParentAccounts,
    handleGetParentAccount,
    handleCreateParentAccount,
    handleUpdateParentAccount,
  }
};
