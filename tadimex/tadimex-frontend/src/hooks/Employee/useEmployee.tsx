import { useEffect, useState } from "react";
import dayjs from "dayjs";

export const useEmployee = () => {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [loading, setLoading] = useState(true);

  //Función para obtener todos los empleados
  const handleGetEmployees = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_SERVER}/api/v1/empleados/`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const result = await response.json();
        setEmployees(result);
        setLoading(false);
      }
    } catch (error) {
      setLoading(true);
    }
  };

  //Funcion para obtener un empleado por su id
  const handleGetEmployee = async (id: number) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_SERVER}/api/v1/empleado/${id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const result = await response.json();
        setSelectedEmployee(result);
      }
    } catch (error) {
      throw new Error("Error al obtener el empleado");
    }
  };

  //Funcion para borrar un empleado
  const handleDeleteEmployee = async (id: number) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_SERVER}/api/v1/empleado/${id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        handleGetEmployees();
      }
    } catch (error) {
      throw new Error("Error al eliminar el empleado");
    }
  };

  //Funcion para crear un empleado
  const handleCreateEmployee = async (employeeData) => {
    try {
      const formData = new FormData();

      // Agregar la imagen si existe
      if (employeeData.image instanceof File) {
        formData.append("image", employeeData.image);
      }

      // Agregar todos los campos individualmente
      formData.append("name", employeeData.name || "");
      formData.append("last_name", employeeData.last_name || "");
      formData.append("birth_date", employeeData.birth_date || "");
      formData.append("curp", employeeData.curp || "");
      formData.append("gender", employeeData.gender || "MASCULINO");
      formData.append("phone_number", employeeData.phone_number || "");
      formData.append("emergency_phone", employeeData.emergency_phone || "");
      formData.append(
        "emergency_phone_name",
        employeeData.emergency_phone_name || ""
      );
      formData.append(
        "emergency_phone_relationship",
        employeeData.emergency_phone_relationship || ""
      );
      formData.append("email", employeeData.email || "");
      formData.append("calle", employeeData.calle || "");
      formData.append("numero_exterior", employeeData.numero_exterior || "");
      formData.append("numero_interior", employeeData.numero_interior || "");
      formData.append("colonia", employeeData.colonia || "");
      formData.append("localidad", employeeData.localidad || "");
      formData.append("municipio", employeeData.municipio || "");
      formData.append("estado", employeeData.estado || "");
      formData.append("codigo_postal", employeeData.codigo_postal || "");
      formData.append("education_level", employeeData.education_level || "");
      formData.append("drivers_license", employeeData.drivers_license || "");
      formData.append(
        "contract_term",
        employeeData.contract_term || "INDETERMINADO"
      );

      if (employeeData.contract_end_date) {
        formData.append("contract_end_date", employeeData.contract_end_date);
      }

      formData.append("salary", employeeData.salary?.toString() || "0");
      formData.append(
        "base_salary",
        employeeData.base_salary?.toString() || "0"
      );
      formData.append(
        "payment_period",
        employeeData.payment_period || "SEMANAL"
      );
      formData.append("nss", employeeData.nss || "");
      formData.append("rfc", employeeData.rfc || "");
      formData.append("infonavit_credit", employeeData.infonavit_credit || "");
      formData.append("department", employeeData.department || "");
      formData.append("employee_code", employeeData.employee_code || "");
      formData.append("entry_date", employeeData.entry_date || "");
      formData.append("status", employeeData.status || "ACTIVO");
      formData.append("position", employeeData.position || "");
      formData.append("blood_type", employeeData.blood_type || "O+");
      formData.append("shoe_size", employeeData.shoe_size || "22");
      formData.append("allergies", employeeData.allergies || "");
      formData.append("uniform_size", employeeData.uniform_size || "XS");

      if (employeeData.immediate_boss_id) {
        formData.append(
          "immediate_boss_id",
          employeeData.immediate_boss_id.toString()
        );
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_SERVER}/api/v1/empleado`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (response.ok) {
        await handleGetEmployees();
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

  //Funcion para actualizar un empleado
  const handleUpdateEmployee = async (id: number, employeeData: any) => {
    try {

      if (!id || !Number.isInteger(id)) {
        throw new Error("ID de empleado inválido");
      }

      const formData = new FormData();

      // Agregar la imagen si existe
      if (employeeData.image instanceof File) {
        formData.append("image", employeeData.image);
      }

      const formattedData = {
        ...employeeData,
        birth_date: employeeData.birth_date
          ? dayjs(employeeData.birth_date).format("YYYY-MM-DD")
          : undefined,
        entry_date: employeeData.entry_date
          ? dayjs(employeeData.entry_date).format("YYYY-MM-DD")
          : undefined,
        contract_end_date: employeeData.contract_end_date
          ? dayjs(employeeData.contract_end_date).format("YYYY-MM-DD")
          : undefined,
      };

      // Agregar solo los campos que tienen valor
      Object.keys(formattedData).forEach((key) => {
        if (
          formattedData[key] !== undefined &&
          formattedData[key] !== null &&
          formattedData[key] !== ""
        ) {
          if (typeof formattedData[key] === "number") {
            formData.append(key, formattedData[key].toString());
          } else {
            formData.append(key, formattedData[key]);
          }
        }
      });

      const response = await fetch(
        `${import.meta.env.VITE_API_SERVER}/api/v1/empleado/${id}`,
        {
          method: "PUT",
          body: formData,
        }
      );

      if (response.ok) {
        await handleGetEmployees();
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

  useEffect(() => {
    handleGetEmployees();
  }, []);

  return {
    employees,
    setEmployees,
    selectedEmployee,
    setSelectedEmployee,
    loading,
    handleGetEmployees,
    handleGetEmployee,
    handleDeleteEmployee,
    handleCreateEmployee,
    handleUpdateEmployee,
  };
};
