from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List
from app.db.mariadb import get_db
from app.schemas.cotizacion import (
    CotizacionCreateSchema,
    CotizacionUpdateSchema,
    CotizacionReadSchema,
)
from app.schemas.producto_cotizado import (
    ProductoCotizadoCreateSchema,
    ProductoCotizadoUpdateSchema,
)
from app.services.cotizacion import (
    create_cotizacion,
    get_cotizacion,
    get_all_cotizaciones,
    update_cotizacion,
    delete_cotizacion,
)

router = APIRouter()

@router.post("/cotizacion", response_model=CotizacionReadSchema)
async def crear_cotizacion(
    cotizacion_data: CotizacionCreateSchema,
    productos_cotizados: List[ProductoCotizadoCreateSchema],
    db: Session = Depends(get_db)
):
    
    return await create_cotizacion(db, cotizacion_data, productos_cotizados)

@router.get("/cotizacion/{cotizacion_id}", response_model=CotizacionReadSchema)
def obtener_cotizacion(
    cotizacion_id: int,
    db: Session = Depends(get_db)
):
    
    return get_cotizacion(db, cotizacion_id)

@router.get("/cotizaciones", response_model=List[CotizacionReadSchema])
def obtener_cotizaciones(
    skip: int = Query(default=0, ge=0, description="Número de registros a saltar"),
    limit: int = Query(default=5000, ge=1, description="Número máximo de registros a retornar"),
    db: Session = Depends(get_db)
):
    
    return get_all_cotizaciones(db, skip, limit)


@router.put("/cotizacion/{cotizacion_id}", response_model=CotizacionReadSchema)
async def actualizar_cotizacion(
    cotizacion_id: int,
    cotizacion_data: CotizacionUpdateSchema,
    productos_cotizados: List[ProductoCotizadoUpdateSchema] | None = None,
    db: Session = Depends(get_db)
):
    
    return await update_cotizacion(db, cotizacion_id, cotizacion_data, productos_cotizados)


@router.delete("/cotizacion/{cotizacion_id}")
async def eliminar_cotizacion(
    cotizacion_id: int,
    db: Session = Depends(get_db)
):
    
    result = await delete_cotizacion(db, cotizacion_id)
    return result

