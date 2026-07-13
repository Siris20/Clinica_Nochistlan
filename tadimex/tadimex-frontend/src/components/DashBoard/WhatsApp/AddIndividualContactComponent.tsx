import { Autocomplete, TextField } from "@mui/material";
import React, { useEffect, useState } from "react";
import { v4 as uuidv4 } from 'uuid';

export const AddIndividualContactComponent = ({setIndividualContact, individualContact, initialData}) => {
  
  // Estado para el formulario
  const [formData, setFormData] = useState({
    name: "",
    phone_number: "",
    list: ""
  });

  //Limpiar formulario
  const clearForm = () => {
    setFormData({
      name: "",
      phone_number: "",
      list: ""
    });
    setIndividualContact(null);
  };

  //Cargar datos iniciales si existen
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        phone_number: initialData.phone_number,
        list: initialData.list
      });
      setIndividualContact(initialData);
    }else {
      clearForm();
    }
  }, [initialData]);

  
  //Funcion para manejar los cambios
  const handleChange = (field, value) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    
    if (newData.name && newData.phone_number) {
      setIndividualContact({
        id: initialData? initialData.id : uuidv4(),
        ...newData,
        list: newData.list || "Sin lista"
      });
    }
  };

  //Lista de opciones (Aqui se obtendran del endpoint)
  const listOptions = [
    "Clientes de CentralGPS",
    "Clientes Potenciales",
    "Proveedores",
  ];


  return (
    <>
      <h5 style={{ margin: 16 }}>Nombre de contacto</h5>
      <TextField
        variant="outlined"
        label="Nombre del Contacto"
        fullWidth
        value={formData.name}
        onChange={(e) => handleChange('name', e.target.value)}
      />
      <h5 style={{ margin: 16 }}>Número de contacto</h5>
      <TextField
        variant="outlined"
        label="Número del contacto"
        fullWidth
        value={formData.phone_number}
        onChange={(e) => handleChange('phone_number', e.target.value)}
      />
      <h5 style={{ margin: 16 }}>Añadir a la lista</h5>
      <Autocomplete
        freeSolo={false}
        options={listOptions}
        value={formData.list}
        onChange={(_, newValue) => handleChange('list', newValue || "")}
        renderInput={(params) => (
          <TextField {...params} variant="outlined" label="Lista" />
        )}
      />
    </>
  );
};
