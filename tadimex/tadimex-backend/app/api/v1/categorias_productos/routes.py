from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List
from app.db.mariadb import get_db
from app.schemas.categoria_producto import (
    CategoriaProductoCreateSchema,
    CategoriaProductoUpdateSchema,
    CategoriaProductoReadSchema,
)
from app.services.categoria_producto import (
    create_categoria_producto, 
    get_categoria_producto, 
    get_all_categorias_productos, 
    update_categoria_producto, 
    delete_categoria_producto,
    get_total_categorias_by_departamento,
    get_total_categorias_by_empresa,
    get_categorias_by_departamento,
    get_categorias_by_empresa

)
router = APIRouter()

@router.post("/categoria", response_model=CategoriaProductoReadSchema)
async def crear_categoria_de_producto(
    categoria_data: CategoriaProductoCreateSchema,
    db: Session = Depends(get_db)
):
    
    return await create_categoria_producto(db, categoria_data)

@router.get("/categoria/{categoria_id}", response_model=CategoriaProductoReadSchema)
async def obtener_categoria_de_producto(
    categoria_id: int,
    db: Session = Depends(get_db)
):
    
    return await get_categoria_producto(db, categoria_id)

@router.get("/categorias", response_model=List[CategoriaProductoReadSchema])
async def obtener_categorias_de_productos(
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1),
    db: Session = Depends(get_db)
):
    
    return await get_all_categorias_productos(db, skip, limit)

@router.put("/categoria/{categoria_id}", response_model=CategoriaProductoReadSchema)
async def actualizar_categorias_de_producto(
    categoria_id: int,
    categoria_data: CategoriaProductoUpdateSchema,
    db: Session = Depends(get_db)
):
   
    return await update_categoria_producto(
        db, categoria_id, categoria_data
    )

@router.delete("/categoria/{categoria_id}") 
async def eliminar_categoria_producto(
    categoria_id: int,
    db: Session = Depends(get_db)
):

    return await delete_categoria_producto(db, categoria_id)


@router.get("/categorias/total/departamento/{departamento_id}", response_model=int)
async def total_categorias_por_departamento(
    empresa_id: int,
    departamento_id: int,
    db: Session = Depends(get_db)
):
    
    return await get_total_categorias_by_departamento(db, empresa_id, departamento_id)

@router.get("/categorias/total/empresa/{empresa_id}", response_model=int)
async def total_categorias_por_empresa(
    empresa_id: int,
    db: Session = Depends(get_db)
):
    
    return await get_total_categorias_by_empresa(db, empresa_id)

@router.get("/categorias/departamento/{departamento_id}", response_model=List[CategoriaProductoReadSchema])
async def categorias_por_departamento(
    departamento_id: int,
    empresa_id: int,
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1),
    db: Session = Depends(get_db)
):
    
    return await get_categorias_by_departamento(db, departamento_id, empresa_id, skip, limit)

@router.get("/categorias/empresa/{empresa_id}", response_model=List[CategoriaProductoReadSchema])
async def categorias_por_empresa(
    empresa_id: int,
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1),
    db: Session = Depends(get_db)
):
    
    return await get_categorias_by_empresa(db, empresa_id, skip, limit)