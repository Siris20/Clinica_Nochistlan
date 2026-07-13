from fastapi import APIRouter, Depends, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.db.mariadb import get_db
from app.schemas.salida_venta import VentaInventarioCreateSchema, VentaReadSchema, ProductoVendidoCreateSchema, VentaInventarioUpdateSchema
from app.services.venta_inventario import create_venta_inventario, get_ventas, get_venta, update_venta

router = APIRouter()

@router.post("/venta", response_model=VentaReadSchema, status_code=status.HTTP_201_CREATED)
async def crear_venta(
    venta_data: VentaInventarioCreateSchema,
    db: Session = Depends(get_db)
):
    """Crear una nueva venta de inventario"""
    return await create_venta_inventario(db, venta_data)

@router.get("/ventas", response_model=List[VentaReadSchema])
def obtener_ventas(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1),
    empresa_id: Optional[int] = Query(None),
    sucursal_id: Optional[int] = Query(None),
    db: Session = Depends(get_db)
):
    """Obtener todas las ventas de inventario"""
    return get_ventas(db, skip=skip, limit=limit, empresa_id=empresa_id, sucursal_id=sucursal_id)

@router.get("/venta/{venta_id}", response_model=VentaReadSchema)
def obtener_venta(
    venta_id: int,
    empresa_id: Optional[int] = Query(None),
    sucursal_id: Optional[int] = Query(None),
    db: Session = Depends(get_db)
):
    """Obtener una venta de inventario por ID"""
    return get_venta(db, venta_id, empresa_id=empresa_id, sucursal_id=sucursal_id)

@router.put("/venta/{venta_id}", response_model=VentaReadSchema)
async def actualizar_venta(
    venta_id: int,
    venta_data: VentaInventarioUpdateSchema,
    productos_vendidos: Optional[List[ProductoVendidoCreateSchema]] = None,
    db: Session = Depends(get_db)
):
    """Actualizar una venta de inventario"""
    return await update_venta(db, venta_id, venta_data, productos_vendidos)
