from fastapi import APIRouter, Depends, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.db.mariadb import get_db
from app.schemas.entrada_compra import CompraInventarioCreateSchema, CompraReadSchema, ProductoCompradoCreateSchema, CompraInventarioUpdateSchema
from app.services.compra_inventario import create_compra_inventario, get_compras, get_compra, update_compra
from app.services.inventario import get_movimientos_compras_recientes

router = APIRouter()

@router.post("/compra", response_model=CompraReadSchema, status_code=status.HTTP_201_CREATED)
async def crear_compra(
    compra_data: CompraInventarioCreateSchema,
    db: Session = Depends(get_db)
):
    return await create_compra_inventario(db, compra_data)

@router.get("/compras", response_model=List[CompraReadSchema])
def obtener_compras(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1),
    empresa_id: Optional[int] = Query(None),
    sucursal_id: Optional[int] = Query(None),
    db: Session = Depends(get_db)
):
    return get_compras(db, skip=skip, limit=limit, empresa_id=empresa_id, sucursal_id=sucursal_id)



@router.get("/compra/{compra_id}", response_model=CompraReadSchema)
def obtener_compra(
    compra_id: int,
    empresa_id: Optional[int] = Query(None),
    sucursal_id: Optional[int] = Query(None),
    db: Session = Depends(get_db)
):
    return get_compra(db, compra_id, empresa_id=empresa_id, sucursal_id=sucursal_id)



@router.put("/compra/{compra_id}", response_model=CompraReadSchema)
async def actualizar_compra(
    compra_id: int,
    compra_data: CompraInventarioUpdateSchema,
    productos_comprados: Optional[List[ProductoCompradoCreateSchema]] = None,
    db: Session = Depends(get_db)
):
    return await update_compra(db, compra_id, compra_data, productos_comprados)