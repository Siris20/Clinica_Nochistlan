import React, { useEffect, useState } from "react";

export const useSystemUser = () => {
  const [systemUsers, setSystemUsers] = useState([]);
  const [selectedSystemUser, setSelectedSystemUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Función para obtener los datos del empleado
  const getEmployeeData = async (empleado_id) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_SERVER}/api/v1/empleado/${empleado_id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        return await response.json();
      }
      return null;
    } catch (error) {
      return null;
    }
  };

  //Función para obtener todos los usuarios del sistema
  const handleGetSystemUsers = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_SERVER}/api/v1/usuarios`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const result = await response.json();
        // Para cada usuario, obtener los datos del empleado si tiene empleado_id
        const usersWithEmployeeData = await Promise.all(
          result.map(async (user) => {
            if (user.empleado_id) {
              const employeeData = await getEmployeeData(user.empleado_id);
              return {
                ...user,
                employeeData,
              };
            }
            return user;
          })
        );
        setSystemUsers(usersWithEmployeeData);
        setLoading(false);
      }
    } catch (error) {
      setLoading(true);
    }
  };

  //Función para obtener un usuario por su id

  const handleGetSystemUser = async (id: number) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_SERVER}/api/v1/usuario/${id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const result = await response.json();
        // Si el usuario tiene empleado_id, obtener los datos del empleado
        if (result.empleado_id) {
          const employeeData = await getEmployeeData(result.empleado_id);
          setSelectedSystemUser({
            ...result,
            employeeData,
          });
        } else {
          setSelectedSystemUser(result);
        }
      }
    } catch (error) {
    }
  };

  //Función para borrar un usuario
  const handleDeleteSystemUser = async (id: number) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_SERVER}/api/v1/usuario/${id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        handleGetSystemUsers();
      }
    } catch (error) {
    }
  };

  //Función para crear un usuario
  const handleCreateSystemUser = async (userData: any) => {
    try {
      const formattedData = {
        ...userData,
        activo: true,
      };

      const response = await fetch(
        `${import.meta.env.VITE_API_SERVER}/api/v1/usuario`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formattedData),
        }
      );

      if (response.ok) {
        await handleGetSystemUsers();
        return true;
      } else {
        const errorData = await response.json();
        if (errorData.detail && Array.isArray(errorData.detail)) {
          const errorMessages = errorData.detail.map((error: any) => {
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

  //Función para editar un usuario
  const handleUpdateSystemUser = async (id:number, userData: any) => {
    try {
      const formattedData = {
        ...userData,
        activo: true,
      };

      const response = await fetch(
        `${import.meta.env.VITE_API_SERVER}/api/v1/usuario/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formattedData),
        }
      );

      if (response.ok) {
        await handleGetSystemUsers();
        return true;
      } else {
        const errorData = await response.json();
        if (errorData.detail && Array.isArray(errorData.detail)) {
          const errorMessages = errorData.detail.map((error: any) => {
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

//Funcion para actualizar la contraseña de un usuario
const handleUpdatePassword = async (id: number, passwordData: { current_password: string, new_password: string }) => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_SERVER}/api/v1/usuarios/${id}/password`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(passwordData),
      }
    );

    const data = await response.json();

    if (response.ok) {
      return true;
    } else {
      throw data;
    }
  } catch (error) {
    throw error; 
  }
};

  useEffect(() => {
    handleGetSystemUsers();
  }, []);

  return {
    systemUsers,
    setSystemUsers,
    selectedSystemUser,
    setSelectedSystemUser,
    loading,
    handleGetSystemUsers,
    handleGetSystemUser,
    handleDeleteSystemUser,
    handleCreateSystemUser,
    handleUpdateSystemUser,
    handleUpdatePassword,
  };
};
