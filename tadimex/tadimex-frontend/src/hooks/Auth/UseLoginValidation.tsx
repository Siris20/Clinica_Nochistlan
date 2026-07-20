import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export const UseLoginValidation = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    credential: "",
    password: "",
  });

  const [errors, setErrors] = useState({
    credential: "",
    password: "",
  });

  const validate = () => {
    let newErrors = {};

    if (!formData.credential) {
      newErrors.credential = "Credencial es requerida";
    } 
    
    if(formData.credential.length < 3){
      newErrors.credential = "Credencial debe tener al menos 3 caracteres";
    }

    if (!formData.password) {
      newErrors.password = "La contraseña es requerida";
    }

    if(formData.password.length < 8){
      newErrors.password = "La contraseña debe tener al menos 8 caracteres"
    }

    setErrors({
      credential: newErrors.credential || "",
      password: newErrors.password || "",
    });
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (text, field) => {
    setFormData({
      ...formData,
      [field]: text,
    });
  };

  const onSubmit = async () => {
    try {
      if (validate()) {
        const form = new FormData();
        form.append("credential", formData.credential);
        form.append("password", formData.password);
        const response = await fetch(
          `${import.meta.env.VITE_API_SERVER}/api/v1/auth/login`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              credential: formData.credential,
              password: formData.password,
            }),
          }
        );

        if (response.ok) {
          const data = await response.json();
          login(data.access_token, formData.credential);
          navigate("/dashboard");
        } else {
          setErrors({
            ...errors,
            credential: "Credenciales incorrectas",
            password: "Credenciales incorrectas",
          });
        }
      }
    } catch (error) {
      throw error;
    }
  };

  return {
    formData,
    errors,
    handleChange,
    onSubmit,
    navigate,
  };
};
