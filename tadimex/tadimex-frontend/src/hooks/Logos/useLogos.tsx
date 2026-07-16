import { useEffect, useMemo, useState } from "react";

export const useLogos = (selectedEnterpriseId = null) => {
  const [logos, setLogos] = useState([]);
  const [selectedLogo, setSelectedLogo] = useState(null);
  const [loading, setLoading] = useState(true);


  //Filtrar logos segun la empresa seleccionada
  const filteredLogos = useMemo(()=> {
    if (!selectedEnterpriseId) return logos;
    return logos.filter(logo => logo.empresa_id === selectedEnterpriseId);
  }, [logos, selectedEnterpriseId]);

  //Funcion para obtener todas los logos 
  const handleGetLogos = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_SERVER}/api/v1/logos`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const result = await response.json();
        setLogos(result);
        setLoading(false);
      }
    } catch (error) {
      setLoading(true);
    }
  };

  //Funcion para borrar un logo
  const handleDeleteLogo = async (id: number) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_SERVER}/api/v1/logo/${id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        handleGetLogos();
      }
    } catch (error) {
      throw new Error("Error al borrar el logo");
    }
  };


  //Funcion para crear un logo
  const handleCreateLogo = async (logoData) => {
    try {
      const formData = new FormData();
      formData.append('name', logoData.name);
      formData.append('empresa_id', logoData.empresa_id);
      if (logoData.image_file instanceof File) {
        formData.append('image_file', logoData.image_file);
      }
  
      const response = await fetch(
        `${import.meta.env.VITE_API_SERVER}/api/v1/logo`,
        {
          method: "POST",
          body: formData,
        }
      );
  
      if (response.ok) {
        await handleGetLogos();
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

  //Funcion para actualizar un logo 
  const handleUpdateLogo = async (id: number, logoData) => {
    try {
      const formData = new FormData();
      formData.append('name', logoData.name);
      formData.append('empresa_id', logoData.empresa_id);
      if (logoData.image_file instanceof File) {
        formData.append('new_image_file', logoData.image_file);
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_SERVER}/api/v1/logo/${id}`,
        {
          method: "PUT",
          body: formData,
        }
      );

      if (response.ok) {
        await handleGetLogos();
        return true;
      }else {
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

  useEffect(() => {
    handleGetLogos();
  }, []);

  return {
    logos,
    setLogos,
    filteredLogos, 
    selectedLogo,
    setSelectedLogo,
    loading,
    handleGetLogos,
    handleDeleteLogo,
    handleCreateLogo,
    handleUpdateLogo,
  }
}
