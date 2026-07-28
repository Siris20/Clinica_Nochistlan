from fastapi import APIRouter, Depends, Query, Form, UploadFile, File, Path
from sqlalchemy.orm import Session
from typing import List, Optional
from app.db.mariadb import get_db
from app.schemas.producto import (
    ProductoCreateSchema,
    ProductoUpdateSchema,
    ProductoReadSchema,
)
from app.services.producto import (
    create_producto,
    get_producto,
    get_all_productos,
    update_producto,
    delete_producto,
    get_productos_by_subcategoria,
    get_total_productos_by_subcategoria,
    get_productos_by_categoria,
    get_total_productos_by_categoria,
    get_productos_by_departamento,
    get_total_productos_by_departamento,
    get_productos_by_empresa,
    get_total_productos_by_empresa,
)

router = APIRouter()

@router.post("/producto", response_model=ProductoReadSchema)
async def crear_producto(
    producto_data: ProductoCreateSchema = Depends(),
    images: Optional[List[UploadFile]] = File(None),
    db: Session = Depends(get_db)
):
    producto_data.images = images 
    return await create_producto(db, producto_data)

@router.get("/producto/{producto_id}", response_model=ProductoReadSchema)
def obtener_producto(
    producto_id: int,
    db: Session = Depends(get_db)
):
    return get_producto(db, producto_id)

@router.get("/productos", response_model=List[ProductoReadSchema])
def obtener_productos(
    skip: int = Query(default=0, ge=0, description="Número de registros a saltar"),
    limit: int = Query(default=100, ge=1, description="Número máximo de registros a retornar"),
    db: Session = Depends(get_db)
):
    return get_all_productos(db, skip, limit)

@router.put("/producto/{producto_id}", response_model=ProductoReadSchema)
async def actualizar_producto(
    producto_id: int,
    producto_data: ProductoUpdateSchema = Depends(),
    db: Session = Depends(get_db)
):   
    return await update_producto(db, producto_id, producto_data)

@router.delete("/producto/{producto_id}")
async def eliminar_producto(
    producto_id: int,
    db: Session = Depends(get_db)
):
    result = await delete_producto(db, producto_id) 
    return result





@router.get("/producto/subcategoria/{subcategoria_id}/total")
def obtener_total_productos_por_subcategoria(
    empresa_id: int = Query(..., description="ID de la empresa"),
    subcategoria_id: int = Path(..., description="ID de la subcategoría"),
    db: Session = Depends(get_db)
):
    return {
        "total": get_total_productos_by_subcategoria(db, empresa_id, subcategoria_id)
    }

@router.get("/producto/subcategoria/{subcategoria_id}/list")
def obtener_productos_por_subcategoria(
    subcategoria_id: int = Path(..., description="ID de la subcategoría"),
    empresa_id: int = Query(..., description="ID de la empresa"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    order_by: Optional[str] = Query(None),
    order_direction: str = Query("asc", regex="^(asc|desc)$"),
    db: Session = Depends(get_db)
):
    return get_productos_by_subcategoria(
        db,
        empresa_id,
        subcategoria_id,
        skip,
        limit,
        order_by,
        order_direction
    )


@router.get("/producto/categoria/{categoria_id}/total")
def obtener_total_productos_por_categoria(
    categoria_id: int = Path(..., description="ID de la categoría"),
    empresa_id: int = Query(..., description="ID de la empresa"),
    db: Session = Depends(get_db)
):
    return {
        "total": get_total_productos_by_categoria(db, empresa_id, categoria_id)
    }

@router.get("/producto/categoria/{categoria_id}/list")
def obtener_productos_por_categoria(
    categoria_id: int = Path(..., description="ID de la categoría"),
    empresa_id: int = Query(..., description="ID de la empresa"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    order_by: Optional[str] = Query(None),
    order_direction: str = Query("asc", regex="^(asc|desc)$"),
    db: Session = Depends(get_db)
):
    return get_productos_by_categoria(
        db,
        empresa_id,
        categoria_id,
        skip,
        limit,
        order_by,
        order_direction
    )


@router.get("/producto/departamento/{departamento_id}/total")
def obtener_total_productos_por_departamento(
    departamento_id: int = Path(..., description="ID del departamento"),
    empresa_id: int = Query(..., description="ID de la empresa"),
    db: Session = Depends(get_db)
):
    return {
        "total": get_total_productos_by_departamento(db, empresa_id, departamento_id)
    }

@router.get("/producto/departamento/{departamento_id}/list")
def obtener_productos_por_departamento(
    departamento_id: int = Path(..., description="ID del departamento"),
    empresa_id: int = Query(..., description="ID de la empresa"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    order_by: Optional[str] = Query(None),
    order_direction: str = Query("asc", regex="^(asc|desc)$"),
    db: Session = Depends(get_db)
):
    return get_productos_by_departamento(
        db,
        empresa_id,
        departamento_id,
        skip,
        limit,
        order_by,
        order_direction
    )

@router.get("/producto/empresa/{empresa_id}/total")
def obtener_total_productos_por_empresa(
    empresa_id: int = Path(..., description="ID de la empresa"),
    db: Session = Depends(get_db)
):
    return {
        "total": get_total_productos_by_empresa(db, empresa_id)
    }

@router.get("/producto/empresa/{empresa_id}/list")
def obtener_productos_por_empresa(
    empresa_id: int = Path(..., description="ID de la empresa"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    order_by: Optional[str] = Query(None),
    order_direction: str = Query("asc", regex="^(asc|desc)$"),
    db: Session = Depends(get_db)
):
    return get_productos_by_empresa(
        db,
        empresa_id,
        skip,
        limit,
        order_by,
        order_direction
    )