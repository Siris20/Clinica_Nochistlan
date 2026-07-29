import { useState, useEffect, useCallback } from "react";

export interface Especialista {
  id: number;
  empleado_id: number;
  area_id: number;
  cedula_profesional: string;
  especialidad: string;
  universidad_egreso?: string;
  nombre?: string;
}

export const useEspecialistas = (areaId: number | string | null) => {
  const [especialistas, setEspecialistas] = useState<Especialista[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEspecialistas = useCallback(async () => {
    if (!areaId) {
      setEspecialistas([]);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/v1/especialistas?area_id=${areaId}`);
      if (!response.ok) {
        throw new Error("Error al obtener los especialistas del área");
      }
      const data: Especialista[] = await response.json();
      setEspecialistas(data);
    } catch (err: any) {
      console.error("Error en useEspecialistas:", err);
      setError(err.message || "Error al cargar especialistas");
    } finally {
      setLoading(false);
    }
  }, [areaId]);

  useEffect(() => {
    fetchEspecialistas();
  }, [fetchEspecialistas]);

  return { especialistas, loading, error, refetchEspecialistas: fetchEspecialistas };
};