// useRegisterValidation.js
import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export const UseRegisterValidation = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [errors, setErrors] = useState({ username: '', password: '' });

  const navigate = useNavigate();

  const digit = /[0-9]/;
  const upperCase = /[A-Z]/;
  const lowerCase = /[a-z]/;
  const nonAlphanumeric = /[^A-Za-z0-9]/;

  const isStrongPassword = (password) =>
    [digit, upperCase, lowerCase, nonAlphanumeric].every((re) => re.test(String(password))) &&
    String(password).length >= 8 &&
    String(password).length <= 32;

  const validate = () => {
    let newErrors = {};

    if (!formData.username) {
      newErrors.username = 'El usuario es requerido';
    } else if (formData.username.length < 4) {
      newErrors.username = 'El usuario debe contener al menos 4 caracteres';
    }

    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (!isStrongPassword(formData.password)) {
      newErrors.password = 'La contraseña debe contener al menos 8 caracteres, una mayúscula, una minúscula, un número y un caracter especial';
    }

    setErrors({
      username: newErrors.username || '',
      password: newErrors.password || ''
    });

    return Object.keys(newErrors).length === 0;
  };

  const register = async (username, password) => {
    setFormData({ username, password });
    if (!validate()) {
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_SERVER}/register`, { username, password });
      if (response.status === 201) {
        setSuccess(true);
        alert('Usuario registrado correctamente');
        navigate('/login');
      }
    } catch (err) {
      setError(err.response ? err.response.data : { msg: 'Error de red' });
    } finally {
      setLoading(false);
    }
  };

  return { register, loading, error, success, errors };
};