from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from app.db.mariadb import get_db

# Importamos los Schemas que creamos en el paso anterior
from app.schemas.cita import (
    CitaCreateSchema,
    CitaUpdateSchema,
    CitaReadSchema
)

# Importamos las funciones lógicas del Servicio
from app.services.cita import (
    create_cita,
    get_cita,
    get_citas_rango,
    update_cita,
    delete_cita
)

router = APIRouter()

@router.post("/cita", response_model=CitaReadSchema, status_code=status.HTTP_201_CREATED)
def crear_nueva_cita(
    cita_data: CitaCreateSchema,  # El frontend enviará un JSON con la estructura del Schema
    db: Session = Depends(get_db)
):
    """
    Registra una nueva cita médica en el sistema.
    Realiza validaciones para asegurar que el horario esté libre.
    """
    return create_cita(db, cita_data)


@router.get("/cita/{cita_id}", response_model=CitaReadSchema)
def obtener_una_cita(
    cita_id: int,
    db: Session = Depends(get_db)
):
    """Obtiene los detalles completos de una cita específica."""
    return get_cita(db, cita_id)


@router.get("/citas", response_model=List[CitaReadSchema])
def obtener_citas_calendario(
    fecha_inicio: datetime = Query(..., description="Fecha de inicio del rango (ej. inicio de mes o semana)"),
    fecha_fin: datetime = Query(..., description="Fecha de fin del rango (ej. fin de mes o semana)"),
    sucursal_id: Optional[int] = Query(None, description="Filtrar citas por sucursal"),
    area_id: Optional[int] = Query(None, description="Filtrar citas por área médica (Psiquiatría, Pediatría, etc.)"),
    db: Session = Depends(get_db)
):
    """
    Obtiene las citas dentro de un rango de tiempo para el calendario del Dashboard.
    Se pueden aplicar filtros dinámicos por sucursal y área médica en tiempo real.
    """
    return get_citas_rango(
        db=db,
        fecha_desde=fecha_inicio,
        fecha_hasta=fecha_fin,
        sucursal_id=sucursal_id,
        area_id=area_id
    )


@router.put("/cita/{cita_id}", response_model=CitaReadSchema)
def actualizar_datos_cita(
    cita_id: int,
    cita_data: CitaUpdateSchema,
    db: Session = Depends(get_db)
):
    """
    Actualiza cualquier campo de la cita (estado, observaciones, fecha, etc.).
    Si cambias la fecha o el área, el sistema validará de nuevo si hay disponibilidad de horario.
    """
    return update_cita(db, cita_id, cita_data)


@router.delete("/cita/{cita_id}")
def cancelar_o_eliminar_cita(
    cita_id: int,
    db: Session = Depends(get_db)
):
    """Elimina permanentemente una cita médica de la base de datos."""
    return delete_cita(db, cita_id)