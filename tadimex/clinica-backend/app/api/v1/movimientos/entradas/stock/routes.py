from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional
from app.db.mariadb import get_db
from app.services.inventario import (
    get_stock_producto,
    get_stock_almacen,
    get_stock_producto_empresa,
    get_stock_producto_sucursal,
    get_stock_productos_sucursal,
    get_stock_productos_almacen,
    get_stock_productos_sucursal,
    get_stock_productos,
)

router = APIRouter()

@router.get("/stock/producto/{producto_id}")
def stock_producto(
    producto_id: int,
    empresa_id: Optional[int] = Query(None),
    sucursal_id: Optional[int] = Query(None),
    db: Session = Depends(get_db)
):
    if empresa_id:
        return get_stock_producto_empresa(db, producto_id, empresa_id)
    elif sucursal_id:
        return get_stock_producto_sucursal(db, producto_id, sucursal_id)
    else:
        return get_stock_producto(db, producto_id)

@router.get("/stock/almacen/{almacen_id}")
def stock_almacen(
    almacen_id: int,
    db: Session = Depends(get_db)
):
    return get_stock_almacen(db, almacen_id)


@router.get("/stock/sucursal/{sucursal_id}/productos")
def stock_productos_sucursal(
    sucursal_id: int,
    db: Session = Depends(get_db)
):
    return get_stock_productos_sucursal(db, sucursal_id)


@router.get("/stock/almacen/{almacen_id}/productos")
def stock_productos_almacen(
    almacen_id: int,
    db: Session = Depends(get_db)
):
    return get_stock_productos_almacen(db, almacen_id)

@router.get("/stock/sucursal/{sucursal_id}/productos/detalle")
def stock_productos_sucursal(
    sucursal_id: int,
    db: Session = Depends(get_db)
):
    return get_stock_productos_sucursal(db, sucursal_id)

@router.get("/stock/empresa/{empresa_id}/productos/detalle")
def stock_productos_empresarial(
    empresa_id: int,
    db: Session = Depends(get_db)
):
    return get_stock_productos(db, empresa_id)