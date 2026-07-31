import React, { useEffect, useMemo, useState } from "react";

export interface PatientData {
  id?: number;
  nombre: string;
  apellido_paterno?: string;
  apellido_materno?: string;
  fecha_nacimiento?: string;
  edad?: number;
  peso?: number | string;
  altura?: number | string;
  genero?: string;
  curp?: string;
  grupo_sanguineo?: string;
  alergias?: string;
  contacto_emergencia_nombre?: string;
  contacto_emergencia_telefono?: string;
  contacto_emergencia_parentesco?: string;
  estatus?: string;
  telefono_celular?: string;
  telefono_fijo?: string;
  email?: string;
  calle?: string;
  numero_exterior?: string;
  numero_interior?: string;
  colonia?: string;
  localidad?: string;
  municipio?: string;
  estado?: string;
  codigo_postal?: string;
  observaciones?: string;
}

export const usePatients = () => {
  const [patients, setPatients] = useState<PatientData[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<PatientData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [estatusFilter, setEstatusFilter] = useState<string>("todos");

  // Estados para paginación
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [totalPatients, setTotalPatients] = useState<number>(0);

  // Filtrar pacientes
  const filteredPatients = useMemo(() => {
    let filtered = patients;

    if (estatusFilter !== "todos") {
      filtered = filtered.filter(
        (p) => p.estatus?.toLowerCase() === estatusFilter.toLowerCase()
      );
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter((p) => {
        const nombreCompleto = `${p.nombre || ""} ${p.apellido_paterno || ""} ${p.apellido_materno || ""}`.toLowerCase();
        return (
          nombreCompleto.includes(term) ||
          p.curp?.toLowerCase().includes(term) ||
          p.telefono_celular?.toLowerCase().includes(term) ||
          p.email?.toLowerCase().includes(term)
        );
      });
    }

    return filtered;
  }, [patients, estatusFilter, searchTerm]);

  const paginatedFilteredPatients = useMemo(() => {
    const startIndex = page * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    setTotalPatients(filteredPatients.length);
    return filteredPatients.slice(startIndex, endIndex);
  }, [filteredPatients, page, rowsPerPage]);

  useEffect(() => {
    if (searchTerm) {
      setPage(0);
    }
  }, [searchTerm]);

  const handleGetPatients = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_SERVER}/api/v1/pacientes`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const result = await response.json();
        setPatients(result);
      }
    } catch (error) {
      console.error("Error al obtener pacientes:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEstatusChange = (newEstatus: string) => {
    setEstatusFilter(newEstatus);
    setPage(0);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleGetPatient = async (id: number) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_SERVER}/api/v1/paciente/${id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const result = await response.json();
        setSelectedPatient(result);
      }
    } catch (error) {
      throw new Error("Error al obtener información del paciente");
    }
  };

  const handleDeletePatient = async (id: number) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_SERVER}/api/v1/paciente/${id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        await handleGetPatients();
        return true;
      } else {
        const errorData = await response.json();
        throw new Error(
          errorData.detail || `Error ${response.status}: ${response.statusText}`
        );
      }
    } catch (error) {
      console.error("Error al eliminar paciente:", error);
      throw error;
    }
  };

  const handleCreatePatient = async (patientData: Record<string, any>) => {
    try {
      const formData = new URLSearchParams();
      Object.keys(patientData).forEach((key) => {
        const val = patientData[key];
        if (val !== null && val !== undefined && val !== "") {
          formData.append(key, val);
        }
      });

      const response = await fetch(
        `${import.meta.env.VITE_API_SERVER}/api/v1/paciente`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            accept: "application/json",
          },
          body: formData,
        }
      );

      if (response.ok) {
        await handleGetPatients();
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

  const handleUpdatePatient = async (id: number, patientData: Record<string, any>) => {
    try {
      const formData = new URLSearchParams();
      Object.keys(patientData).forEach((key) => {
        const val = patientData[key];
        if (val !== null && val !== undefined && val !== "") {
          formData.append(key, val);
        }
      });

      const response = await fetch(
        `${import.meta.env.VITE_API_SERVER}/api/v1/paciente/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            accept: "application/json",
          },
          body: formData,
        }
      );

      if (response.ok) {
        await handleGetPatients();
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

  useEffect(() => {
    handleGetPatients();
  }, []);

  return {
    patients,
    filteredPatients: paginatedFilteredPatients,
    allFilteredPatients: filteredPatients,
    setPatients,
    selectedPatient,
    setSelectedPatient,
    loading,
    page,
    setPage,
    rowsPerPage,
    setRowsPerPage,
    totalPatients,
    handleChangePage,
    handleChangeRowsPerPage,
    searchTerm,
    setSearchTerm,
    estatusFilter,
    setEstatusFilter,
    handleEstatusChange,
    handleGetPatients,
    handleGetPatient,
    handleDeletePatient,
    handleCreatePatient,
    handleUpdatePatient,
  };
};