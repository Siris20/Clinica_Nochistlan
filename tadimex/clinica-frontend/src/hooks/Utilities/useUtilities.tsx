import React, { useEffect, useState } from 'react'

export interface ResumenTotalVentas {
  resumen:           Resumen;
  productos:         Producto[];
  filtros_aplicados: FiltrosAplicados;
}

export interface FiltrosAplicados {
  fecha_inicio: null;
  fecha_fin:    null;
  almacen_id:   null;
}

export interface Producto {
  producto_id:            number;
  producto_nombre:        string;
  cantidad_vendida_total: number;
  precio_compra_promedio: string;
  precio_venta_promedio:  string;
  utilidad_total:         string;
  margen_promedio:        string;
  numero_ventas:          number;
}

export interface Resumen {
  total_ventas:              string;
  total_utilidades:          string;
  margen_promedio_general:   string;
  numero_ventas_total:       number;
  numero_productos_vendidos: number;
  producto_mas_rentable:     string;
  producto_menos_rentable:   string;
  periodo_inicio:            null;
  periodo_fin:               null;
}


export const useUtilities = (selectedBranchId=null) => {

  const [utilities, setUtilities] = useState([])
  const [topProductos, setTopProductos] = useState(null)
  const [loading, setLoading] = useState(false)
  const [loadingTop, setLoadingTop] = useState(false)
  const [error, setError] = useState(null)

  //Obtener las utilidades generales
const handleGetUtilities = async(fecha_inicio= null, fecha_fin = null, almacen_id = null, cliente_id = null) => {
  setLoading(true)
  setError(null)
  
  try {
    // Construir la URL con parámetros opcionales
    let url = `${import.meta.env.VITE_API_SERVER}/api/v1/utilidades/`
    
    // Construir query parameters
    const params = new URLSearchParams()
    
    // Agregar sucursal_id si está disponible
    if (selectedBranchId) {
      params.append('sucursal_id', selectedBranchId.toString())
    }
    
    if (fecha_inicio) {
      params.append('fecha_inicio', fecha_inicio)
    }
    if (fecha_fin) {
      params.append('fecha_fin', fecha_fin)
    }
    if (almacen_id) {
      params.append('almacen_id', almacen_id.toString())
    }
    if (cliente_id) {
      params.append('cliente_id', cliente_id.toString())
    }
    
    // Agregar parámetros a la URL si existen
    if (params.toString()) {
      url += `?${params.toString()}`
    }
    
    const response = await fetch(url)
    
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`)
    }
    
    const data: ResumenTotalVentas = await response.json()
    setUtilities(data)
    return data
    
  } catch (err) {
    console.error('Error al obtener utilidades:', err)
    setError(err.message)
    return null
  } finally {
    setLoading(false)
  }
}

//Obtener top productos (más o menos rentables)
const handleGetTopProductos = async(tipo='mas_rentables', cantidad=5, fecha_inicio=null, fecha_fin=null, almacen_id=null, cliente_id=null) => {
  setLoadingTop(true)
  setError(null)
  
  try {
    // Construir la URL con parámetros
    let url = `${import.meta.env.VITE_API_SERVER}/api/v1/utilidades/top-productos`
    
    // Construir query parameters
    const params = new URLSearchParams()
    params.append('tipo', tipo)
    params.append('cantidad', cantidad.toString())
    
    // Agregar sucursal_id si está disponible
    if (selectedBranchId) {
      params.append('sucursal_id', selectedBranchId.toString())
    }
    
    if (fecha_inicio) {
      params.append('fecha_inicio', fecha_inicio)
    }
    if (fecha_fin) {
      params.append('fecha_fin', fecha_fin)
    }
    if (almacen_id) {
      params.append('almacen_id', almacen_id.toString())
    }
    if (cliente_id) {
      params.append('cliente_id', cliente_id.toString())
    }
    
    url += `?${params.toString()}`
    
    const response = await fetch(url)
    
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`)
    }
    
    const data = await response.json()
    setTopProductos(data.productos || [])
    return data
    
  } catch (err) {
    console.error('Error al obtener top productos:', err)
    setError(err.message)
    return null
  } finally {
    setLoadingTop(false)
  }
}

  useEffect(()=> {
    if (selectedBranchId) {
      handleGetUtilities();
    }
  }, [selectedBranchId]);

  return {
    utilities,
    topProductos,
    loading,
    loadingTop,
    error,
    handleGetUtilities,
    handleGetTopProductos
  }
}
