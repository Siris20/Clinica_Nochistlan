import { useState, useRef, useEffect } from "react";
import { FORM_SECTIONS } from "../../components/DashBoard/Employee/formSections";
import { toast } from "react-toastify";
import { v4 as uuidv4 } from "uuid";
import dayjs from "dayjs";

export const useEmployeeForm = (
  initialData,
  setOpen,
  onAddEmployee,
  onEditEmployee
) => {
  const [currentInitialData, setCurrentInitialData] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  //Actualizar currentInitialData cuando se recibe un nuevo initialData
  useEffect(() => {
    setCurrentInitialData(initialData);
  }, [initialData]);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "https://avatar.iran.liara.run/public/28";
    
    if (imagePath.startsWith('data:')) {
      return imagePath;
    }
    
    // Si es una ruta relativa, construir la URL completa
    return `${import.meta.env.VITE_API_SERVER}${imagePath}`;
  };
  

  //Actualizar el formulario con los datos iniciales si es que existen
  useEffect(() => {
    if (initialData) {

      //Si hay una imagen inicial, convertirla a un objeto de imagen
      if (initialData.image && initialData.image.startsWith('data:')) {
        fetch(initialData.image)
          .then(res => res.blob())
          .then(blob => {
            const file = new File([blob], 'profile.jpg', { type: 'image/jpeg' });
            setImageFile(file);
          })
          .catch(err => console.error('Error'));
      }

      setFormData({
        [FORM_SECTIONS.PERSONAL]: [
          { title: "Nombre", value: initialData.name },
          { title: "Apellidos", value: initialData.last_name },
          {
            title: "Fecha de Nacimiento",
            value: dayjs(initialData.birth_date),
          },
          { title: "Curp", value: initialData.curp  },
          { title: "Género", value: initialData.gender },
          { title: "Estatus", value: initialData.status },
        ],
        [FORM_SECTIONS.CONTACT]: [
          { title: "Teléfono Celular", value: initialData.phone_number },
          { title: "Email", value: initialData.email },
          { title: "Calle", value: initialData.calle },
          { title: "Número Exterior", value: initialData.numero_exterior },
          { title: "Número Interior", value: initialData.numero_interior },
          { title: "Colonia", value: initialData.colonia },
          { title: "Localidad", value: initialData.localidad },
          { title: "Municipio", value: initialData.municipio },
          { title: "Estado", value: initialData.estado },
          { title: "Código Postal", value: initialData.codigo_postal },
          {
            title: "Télefono de Emergencia",
            value: initialData.emergency_phone,
          },
          {
            title: "Nombre de Emergencia",
            value: initialData.emergency_phone_name,
          },
          {
            title: "Relación",
            value: initialData.emergency_phone_relationship,
          },
        ],
        [FORM_SECTIONS.ADDITIONAL]: [
          { title: "Tipo de Sangre", value: initialData.blood_type },
          { title: "Alergias", value: initialData.allergies },
          { title: "Talla de Calzado", value: initialData.shoe_size },
          { title: "Talla de Uniforme", value: initialData.uniform_size },
        ],
        [FORM_SECTIONS.JOB]: [
          { title: "Tipo de contrato", value: initialData.contract_term },
          { title: "Fecha de Ingreso", value: dayjs(initialData.entry_date) },
          { title: "Fecha de Término", value: initialData.contract_end_date ? dayjs(initialData.contract_end_date) : null, show: initialData.contract_term === "DETERMINADO" },
          { title: "Nivel de Estudios", value: initialData.education_level },
          { title: "Licencia de Conducir", value: initialData.drivers_license },
          { title: "Sueldo", value: initialData.salary },
          {
            title: "Salario base de cotización",
            value: initialData.base_salary,
          },
          { title: "Periodo de Pago", value: initialData.payment_period },
          { title: "NSS", value: initialData.nss },
          { title: "RFC", value: initialData.rfc },
          {
            title: "Número de crédito Infonavit",
            value: initialData.infonavit_credit,
          },
          { title: "Puesto", value: initialData.position },
          { title: "Código de empleado", value: initialData.employee_code },
          { title: "Departamento", value: initialData.department },
          { title: "Jefe inmediato", value: initialData.immediate_boss_id , show: true},
        ],
        imageUrl: getImageUrl(initialData.image),
      });
    }
  }, [initialData]);

  //Inicializar el formulario
  const initialFormState = {
    [FORM_SECTIONS.PERSONAL]: [
      { title: "Nombre", value: "" },
      { title: "Apellidos", value: "" },
      { title: "Fecha de Nacimiento", value: null },
      { title: "Curp", value: "" },
      { title: "Género", value: "" },
      { title: "Estatus", value: "" },
    ],
    [FORM_SECTIONS.CONTACT]: [
      { title: "Teléfono Celular", value: "" },
      { title: "Email", value: "" },
      { title: "Calle", value: "" },
      { title: "Número Exterior", value: "" },
      { title: "Número Interior", value: "" },
      { title: "Colonia", value: "" },
      { title: "Localidad", value: "" },
      { title: "Municipio", value: "" },
      { title: "Estado", value: "" },
      { title: "Código Postal", value: "" },
      { title: "Télefono de Emergencia", value: "" },
      { title: "Nombre de Emergencia", value: "" },
      { title: "Relación", value: "" },
    ],
    [FORM_SECTIONS.ADDITIONAL]: [
      { title: "Tipo de Sangre", value: "" },
      { title: "Alergias", value: "" },
      { title: "Talla de Calzado", value: "" },
      { title: "Talla de Uniforme", value: "" },
    ],
    [FORM_SECTIONS.JOB]: [
      { title: "Tipo de contrato", value: "" },
      { title: "Fecha de Ingreso", value: null },
      { title: "Fecha de Término", value: null, show: false },
      { title: "Nivel de Estudios", value: "" },
      { title: "Licencia de Conducir", value: "" },
      { title: "Sueldo", value: "" },
      { title: "Salario base de cotización", value: "" },
      { title: "Periodo de Pago", value: "" },
      { title: "NSS", value: "" },
      { title: "RFC", value: "" },
      { title: "Número de crédito Infonavit", value: "" },
      { title: "Puesto", value: "" },
      { title: "Código de empleado", value: "" },
      { title: "Departamento", value: "" },
      { title: "Jefe inmediato", value: null, show: false },
    ],
    imageUrl: "https://avatar.iran.liara.run/public/28",
  };

  const [formData, setFormData] = useState(initialFormState);
  const fileInputRef = useRef(null);
  const [selectedImage, setSelectedImage] = useState(null);

  //Campos requeridos
  const requiredFields = {
    [FORM_SECTIONS.PERSONAL]: [
      "Nombre",
      "Apellidos",
      "Fecha de Nacimiento",
      "Curp",
      "Género",
      "Estatus",
    ], 
    [FORM_SECTIONS.CONTACT]: (formData) => {
      const phoneValue = formData[FORM_SECTIONS.CONTACT].find(f => f.title === "Teléfono Celular")?.value;
      const emailValue = formData[FORM_SECTIONS.CONTACT].find(f => f.title === "Email")?.value;
      return phoneValue || emailValue ? [] : ["Teléfono Celular", "Email"];
    },
    [FORM_SECTIONS.JOB]: (formData)=> {
      const contractType = formData[FORM_SECTIONS.JOB].find((f) => f.title === "Tipo de contrato")?.value;
      return [...(contractType === "DETERMINADO" ? ["Fecha de Término"] : []), "Fecha de Ingreso"];
    }
  };

  const [showErrors, setShowErrors] = useState(false);

  //Funcion para resetear el formulario
  const resetForm = () => {
    setFormData(initialFormState);
    setSelectedImage(null);
    setImageFile(null);
    setShowErrors(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  //Función para validar los campos requeridos
  const validate = () => {
    setShowErrors(true);
    let isValid = true;
    const errors = [];

    Object.entries(requiredFields).forEach(([section, fields]) => {
      const sectionData = formData[section];

      //Si fields es una función, ejecutarla para obtener los campos requeridos
      const requiredFieldsList = typeof fields === "function" ? fields(formData) : fields;

      requiredFieldsList.forEach((fieldTitle) => {
        const field = sectionData.find((item) => item.title === fieldTitle);
        if (!field || !field.value || field.value === "") {
          isValid = false;
          errors.push(`El campo "${fieldTitle}" es requerido`);
        }
      });
    });

    //Validar formato de telefonos y CURP
    const phoneFields = ["Teléfono Celular", "Télefono de Emergencia"];

    // Validar teléfonos
  phoneFields.forEach(fieldTitle => {
    const phoneValue = formData[FORM_SECTIONS.CONTACT].find(
      f => f.title === fieldTitle
    )?.value;

    if (phoneValue) {
      const numericValue = phoneValue.replace(/\D/g, '');
      if (numericValue.length !== 10) {
        isValid = false;
        errors.push(`${fieldTitle} debe tener 10 dígitos`);
      }
    }
  });

  // Validar CURP
  const curpValue = formData[FORM_SECTIONS.PERSONAL].find(
    f => f.title === "Curp"
  )?.value;

  if (curpValue && curpValue.length !== 18) {
    isValid = false;
    errors.push("La CURP debe tener 18 caracteres");
  }

  //Validar Email
  const emailValue = formData[FORM_SECTIONS.CONTACT].find(
    f => f.title === "Email"
  )?.value;

  if (emailValue && !validateEmail(emailValue)) {
    isValid = false;
    errors.push("El formato del email no es válido");
  }

    

    if (!isValid) {
      toast.error("Por favor llena los campos requeridos");
    }

    return isValid;
  };

  // Función para manejar el cambio de los campos
  const handleChange = (section, index, value) => {
    setFormData((prevData) => {
      const sectionData = [...prevData[section]];

      if(section === FORM_SECTIONS.JOB && sectionData[index].title === "Tipo de contrato") {
        const endDateIndex = sectionData.findIndex((item) => item.title === "Fecha de Término");
        if(endDateIndex !== -1) {
          sectionData[endDateIndex] = {
            ...sectionData[endDateIndex],
            show: value === "DETERMINADO",
          };
        }
      }
      sectionData[index] = {
        ...sectionData[index],
        value: value,
      };
      return {
        ...prevData,
        [section]: sectionData,
      };
    });
  };

// Función para verificar si un campo específico tiene error
const hasError = (section, fieldTitle) => {
  if (!showErrors) return false;
  
  // Verificar si la sección tiene campos requeridos
  const sectionRequiredFields = requiredFields[section];
  if (!sectionRequiredFields) return false;

  //Obtener los campos requeridos de la sección
  const requiredFieldsList = typeof sectionRequiredFields === "function" ? sectionRequiredFields(formData) : sectionRequiredFields;
  
  // Verificar si el campo específico es requerido
  const isFieldRequired = requiredFieldsList.includes(fieldTitle);
  if (!isFieldRequired) return false;
  
  // Si el campo es requerido, verificar si tiene valor
  const field = formData[section].find((item) => item.title === fieldTitle);
  return !field?.value || field.value === "";
};

  // Función para manejar el cambio de la imagen
  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImageFile(file);
      const imageUrl = URL.createObjectURL(file);
      setSelectedImage(imageUrl);
      setFormData((prev) => ({
        ...prev,
        imageUrl: imageUrl,
      }));
    }
  };

  //Función para calcular la antiguedad en años y meses
  const calculateSeniority = (entryDate) => {
    if (!entryDate) return "";
  
    const now = dayjs();
    const entry = dayjs(entryDate);
  
    const years = now.diff(entry, "year");
    const months = now.diff(entry, "month") % 12;
    
    // Calculamos los días restantes después de contar años y meses completos
    const withoutYears = entry.add(years, "year");
    const withoutMonths = withoutYears.add(months, "month");
    const days = now.diff(withoutMonths, "day");
  
    // Construimos el string de resultado
    if (years === 0) {
      if (months === 0) {
        return `${days} días`;
      }
      return `${months} meses${days > 0 ? ` y ${days} días` : ''}`;
    } else if (months === 0) {
      if (days === 0) {
        return `${years} años`;
      }
      return `${years} años${days > 0 ? ` y ${days} días` : ''}`;
    } else {
      return `${years} años, ${months} meses${days > 0 ? ` y ${days} días` : ''}`;
    }
  }

  // Función para manejar el envío del formulario
  const handleSubmit = () => {
    if (validate()) {
      //Obtener la fecha de ingreso
      const entryDate = formData[FORM_SECTIONS.JOB]
        .find((f) => f.title === "Fecha de Ingreso")
        ?.value?.format("YYYY-MM-DD") || dayjs().format("YYYY-MM-DD");
  
      //Obtener el tipo de contrato
      const contractType = formData[FORM_SECTIONS.JOB]
        .find((f) => f.title === "Tipo de contrato")?.value;
  
      // Crear objeto para enviar
      const employeeData = {
        name: formData[FORM_SECTIONS.PERSONAL].find((f) => f.title === "Nombre")?.value || "",
        last_name: formData[FORM_SECTIONS.PERSONAL].find((f) => f.title === "Apellidos")?.value || "",
        birth_date: formData[FORM_SECTIONS.PERSONAL].find((f) => f.title === "Fecha de Nacimiento")?.value?.format("YYYY-MM-DD") || null,
        curp: formData[FORM_SECTIONS.PERSONAL].find((f) => f.title === "Curp")?.value || "",
        gender: formData[FORM_SECTIONS.PERSONAL].find((f) => f.title === "Género")?.value || "",
        phone_number: formData[FORM_SECTIONS.CONTACT].find((f) => f.title === "Teléfono Celular")?.value || "",
        emergency_phone: formData[FORM_SECTIONS.CONTACT].find((f) => f.title === "Télefono de Emergencia")?.value || "",
        emergency_phone_name: formData[FORM_SECTIONS.CONTACT].find((f) => f.title === "Nombre de Emergencia")?.value || "",
        emergency_phone_relationship: formData[FORM_SECTIONS.CONTACT].find((f) => f.title === "Relación")?.value || "",
        email: formData[FORM_SECTIONS.CONTACT].find((f) => f.title === "Email")?.value || "",
        calle: formData[FORM_SECTIONS.CONTACT].find((f) => f.title === "Calle")?.value || "",
        numero_exterior: formData[FORM_SECTIONS.CONTACT].find((f) => f.title === "Número Exterior")?.value || "",
        numero_interior: formData[FORM_SECTIONS.CONTACT].find((f) => f.title === "Número Interior")?.value || "",
        colonia: formData[FORM_SECTIONS.CONTACT].find((f) => f.title === "Colonia")?.value || "",
        localidad: formData[FORM_SECTIONS.CONTACT].find((f) => f.title === "Localidad")?.value || "",
        municipio: formData[FORM_SECTIONS.CONTACT].find((f) => f.title === "Municipio")?.value || "",
        estado: formData[FORM_SECTIONS.CONTACT].find((f) => f.title === "Estado")?.value || "",
        codigo_postal: formData[FORM_SECTIONS.CONTACT].find((f) => f.title === "Código Postal")?.value || "",
        education_level: formData[FORM_SECTIONS.JOB].find((f) => f.title === "Nivel de Estudios")?.value || "",
        drivers_license: formData[FORM_SECTIONS.JOB].find((f) => f.title === "Licencia de Conducir")?.value || "",
        contract_term: contractType || "",
        salary: Number(formData[FORM_SECTIONS.JOB].find((f) => f.title === "Sueldo")?.value) || 0,
        base_salary: Number(formData[FORM_SECTIONS.JOB].find((f) => f.title === "Salario base de cotización")?.value) || 0,
        payment_period: formData[FORM_SECTIONS.JOB].find((f) => f.title === "Periodo de Pago")?.value || "",
        nss: formData[FORM_SECTIONS.JOB].find((f) => f.title === "NSS")?.value || "",
        rfc: formData[FORM_SECTIONS.JOB].find((f) => f.title === "RFC")?.value || "",
        infonavit_credit: formData[FORM_SECTIONS.JOB].find((f) => f.title === "Número de crédito Infonavit")?.value || "",
        department: formData[FORM_SECTIONS.JOB].find((f) => f.title === "Departamento")?.value || "",
        employee_code: formData[FORM_SECTIONS.JOB].find((f) => f.title === "Código de empleado")?.value || "",
        entry_date: entryDate,
        status: formData[FORM_SECTIONS.PERSONAL].find((f) => f.title === "Estatus")?.value || "",
        position: formData[FORM_SECTIONS.JOB].find((f) => f.title === "Puesto")?.value || "",
        blood_type: formData[FORM_SECTIONS.ADDITIONAL].find((f) => f.title === "Tipo de Sangre")?.value || "",
        shoe_size: formData[FORM_SECTIONS.ADDITIONAL].find((f) => f.title === "Talla de Calzado")?.value || "",
        allergies: formData[FORM_SECTIONS.ADDITIONAL].find((f) => f.title === "Alergias")?.value || "",
        uniform_size: formData[FORM_SECTIONS.ADDITIONAL].find((f) => f.title === "Talla de Uniforme")?.value || "",
        immediate_boss_id: formData[FORM_SECTIONS.JOB].find((f) => f.title === "Jefe inmediato")?.value || null,
        contract_end_date: contractType === "DETERMINADO" 
          ? formData[FORM_SECTIONS.JOB].find((f) => f.title === "Fecha de Término")?.value?.format("YYYY-MM-DD") || null
          : null,
        image: imageFile
      };
  
      if (currentInitialData && currentInitialData.id) {
        try {
          const employeeId = Number(currentInitialData.id);
          if (Number.isInteger(employeeId)) {
            onEditEmployee(employeeId, employeeData);
          } else {
            toast.error("ID de empleado no es válido");
            return false;
          }
        } catch (error) {
          toast.error("Error al procesar el ID del empleado");
          return false;
        }
      } else {
        onAddEmployee(employeeData);
      }
      
      setOpen(false);
      resetForm();
      return true;
    }
    return false; 
  };

  return {
    formData,
    fileInputRef,
    selectedImage,
    handleChange,
    handleImageChange,
    handleSubmit,
    resetForm,
    hasError,
    showErrors,
    imageFile,
  };
};
