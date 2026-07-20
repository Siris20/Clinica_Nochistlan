from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel
from typing import Dict, List, Optional

class UtilidadProductoSchema(BaseModel): 
  producto_id: int
  producto_nombre: str
  cantidad_vendida_total: int
  precio_compra_promedio: Decimal
  precio_venta_promedio: Decimal
  utilidad_total: Decimal
  margen_promedio: Decimal
  numero_ventas: int
  clientes: Optional[List[Dict]] = None #Lista de clientes que compraron este producto

class ResumenUtilidadesSchema(BaseModel):
  total_ventas: Decimal #Suma de todos los totales de las ventas
  total_utilidades: Decimal #Suma de todas las utilidades
  margen_promedio_general: Decimal #Margen promedio de todas las ventas
  numero_ventas_total: int #Total de ventas realizadas
  numero_productos_vendidos: int #Cuantos productos diferentes se vendieron
  producto_mas_rentable: Optional[str] #Nombre del producto con mayor utilidad
  producto_menos_rentable: Optional[str] #Nombre del producto con menor utilidad
  periodo_inicio: Optional[datetime] #Fecha de inicio del periodo consultado
  periodo_fin: Optional[datetime] #Fecha de fin del periodo consultado

class FiltrosUtilidadesSchema(BaseModel):
  fecha_inicio: Optional[datetime] = None #Filtrar desde esta fecha
  fecha_fin: Optional[datetime] = None #Filtrar hasta esta fecha
  almacen_id: Optional[int] = None #Filtrar por almacén específico
  sucursal_id: Optional[int] = None #Filtrar por sucursal específica
  cliente_id: Optional[int] = None #Filtrar por cliente específico

class UtilidadesResponseSchema(BaseModel):
  resumen: ResumenUtilidadesSchema
  productos: List[UtilidadProductoSchema]
  filtros_aplicados: FiltrosUtilidadesSchema
