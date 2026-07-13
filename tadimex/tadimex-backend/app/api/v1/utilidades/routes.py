# app/api/v1/utilidades/routes.py

from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session
from app.db.mariadb import get_db
from app.schemas.utilidades import (
  FiltrosUtilidadesSchema,
  UtilidadesResponseSchema
)
from app.services.utilidades import calcular_utilidades

router = APIRouter(prefix="/utilidades",tags=["utilidades"])

@router.get("/", response_model=UtilidadesResponseSchema)
def get_utilidades(
  fecha_inicio: Optional[datetime] = None, 
  fecha_fin: Optional[datetime] = None, 
  almacen_id: Optional[int] = None,
  sucursal_id: Optional[int] = None,
  cliente_id: Optional[int] = None,
  db: Session = Depends(get_db)
):
  
  """
  Obtiene el reporte de utilidades con filtros opcionales

  --- fecha_inicio: Filtrar ventas desde esta fecha
  --- fecha_fin: Filtrar ventas hasta esta fecha
  --- almacen_id: Filtrar por almacén específico
  --- sucursal_id: Filtrar por sucursal específica
  --- cliente_id: Filtrar por cliente específico

  """

  try:
    # Crear objeto de filtros
    filtros = FiltrosUtilidadesSchema(
      fecha_inicio=fecha_inicio,
      fecha_fin=fecha_fin,
      almacen_id=almacen_id,
      sucursal_id=sucursal_id,
      cliente_id=cliente_id
    )

    # Llamar al service para calcular utilidades
    return calcular_utilidades(db, filtros)
  
  except Exception as e:
    raise HTTPException(
      status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
      detail=f"Error al obtener el reporte de utilidades: {str(e)}"
    )

@router.get("/top-productos")
def get_top_productos(
  tipo: str = Query(..., description="'mas_rentables' o 'menos_rentables'"),
  cantidad: int = Query(5, description="Cantidad de productos a mostrar", ge=1, le=50),
  fecha_inicio: Optional[datetime] = None, 
  fecha_fin: Optional[datetime] = None, 
  almacen_id: Optional[int] = None,
  sucursal_id: Optional[int] = None,
  cliente_id: Optional[int] = None,
  db: Session = Depends(get_db)
):
  """
  Obtiene el top de productos más o menos rentables
  
  Args:
    tipo: 'mas_rentables' o 'menos_rentables'
    cantidad: Número de productos a mostrar (1-50)
    fecha_inicio: Filtrar ventas desde esta fecha
    fecha_fin: Filtrar ventas hasta esta fecha  
    almacen_id: Filtrar por almacén específico
    sucursal_id: Filtrar por sucursal específica
    cliente_id: Filtrar por cliente específico
  """
  
  if tipo not in ["mas_rentables", "menos_rentables"]:
    raise HTTPException(
      status_code=status.HTTP_400_BAD_REQUEST,
      detail="El parámetro 'tipo' debe ser 'mas_rentables' o 'menos_rentables'"
    )
  
  try:
    # Crear objeto de filtros
    filtros = FiltrosUtilidadesSchema(
      fecha_inicio=fecha_inicio,
      fecha_fin=fecha_fin,
      almacen_id=almacen_id,
      sucursal_id=sucursal_id,
      cliente_id=cliente_id
    )

    # Llamar al service para obtener top productos
    from app.services.utilidades import obtener_top_productos
    return obtener_top_productos(db, filtros, tipo, cantidad)
  
  except Exception as e:
    raise HTTPException(
      status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
      detail=f"Error al obtener top productos: {str(e)}"
    )

