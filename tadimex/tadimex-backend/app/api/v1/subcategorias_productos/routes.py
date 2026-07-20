from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List
from app.db.mariadb import get_db
from app.schemas.subcategoria_producto import (
    SubcategoriaProductoCreateSchema,
    SubcategoriaProductoUpdateSchema,
    SubcategoriaProductoReadSchema,
)
from app.services.subcategoria_producto import (
    create_subcategoria_producto,get_subcategoria_producto,
    get_all_subcategorias_productos,
    update_subcategoria_producto,
    delete_subcategoria_producto,
    get_total_subcategorias_by_categoria,
    get_total_subcategorias_by_departamento,
    get_total_subcategorias_by_empresa,
    get_subcategorias_by_categoria,
    get_subcategorias_by_departamento,
    get_subcategorias_by_empresa
)
router = APIRouter()

@router.post("/subcategoria", response_model=SubcategoriaProductoReadSchema)
def crear_subcategoria_producto(
    subcategoria_data: SubcategoriaProductoCreateSchema,
    db: Session = Depends(get_db)
):
   
    return create_subcategoria_producto(db, subcategoria_data)

@router.get("/subcategoria/{subcategoria_id}", response_model=SubcategoriaProductoReadSchema)
def obtener_subcategoria_producto(
    subcategoria_id: int,
    db: Session = Depends(get_db)
):
    
    return get_subcategoria_producto(db, subcategoria_id)

@router.get("/subcategorias", response_model=List[SubcategoriaProductoReadSchema])
def obtener_subcategorias_productos(
    skip: int = Query(default=0, ge=0, description="Número de registros a saltar"),
    limit: int = Query(default=100, ge=1, description="Número máximo de registros a retornar"),
    db: Session = Depends(get_db)
):
    
    return get_all_subcategorias_productos(db, skip, limit)

@router.put("/subcategoria/{subcategoria_id}", response_model=SubcategoriaProductoReadSchema)
def actualizar_subcategoria_producto(
    subcategoria_id: int,
    subcategoria_data: SubcategoriaProductoUpdateSchema,
    db: Session = Depends(get_db)
):
   
    return update_subcategoria_producto(
        db, subcategoria_id, subcategoria_data
    )

@router.delete("/subcategoria/{subcategoria_id}")
def eliminar_subcategoria_producto(
    subcategoria_id: int,
    db: Session = Depends(get_db)
):
   
    delete_subcategoria_producto(db, subcategoria_id)
    return {"message": "Subcategoría de producto eliminada exitosamente"}

#endpoints para obtener totales por categoria, departamento y empresa
@router.get("/subcategorias/total/categoria/{categoria_id}", response_model=int)
def total_subcategorias_por_categoria(
    empresa_id: int,
    categoria_id: int,
    db: Session = Depends(get_db)
):
    return get_total_subcategorias_by_categoria(db, empresa_id, categoria_id)

@router.get("/subcategorias/total/departamento/{departamento_id}", response_model=int)
def total_subcategorias_por_departamento(
    empresa_id: int,
    departamento_id: int,
    db: Session = Depends(get_db)
):
    return get_total_subcategorias_by_departamento(db, empresa_id, departamento_id)

@router.get("/subcategorias/total/empresa/{empresa_id}", response_model=int)
def total_subcategorias_por_empresa(
    empresa_id: int,
    db: Session = Depends(get_db)
):
    return get_total_subcategorias_by_empresa(db, empresa_id)

@router.get("/subcategorias/categoria/{categoria_id}", response_model=List[SubcategoriaProductoReadSchema])
def subcategorias_por_categoria(
    empresa_id: int,
    categoria_id: int,
    skip: int = Query(default=0, ge=0, description="Número de registros a saltar"),
    limit: int = Query(default=100, ge=1, description="Número máximo de registros a retornar"),
    db: Session = Depends(get_db)
):
    return get_subcategorias_by_categoria(db, empresa_id, categoria_id, skip, limit)

@router.get("/subcategorias/departamento/{departamento_id}", response_model=List[SubcategoriaProductoReadSchema])
def subcategorias_por_departamento(
    empresa_id: int,
    departamento_id: int,
    skip: int = Query(default=0, ge=0, description="Número de registros a saltar"),
    limit: int = Query(default=100, ge=1, description="Número máximo de registros a retornar"),
    db: Session = Depends(get_db)
):
    return get_subcategorias_by_departamento(db, empresa_id, departamento_id, skip, limit)

@router.get("/subcategorias/empresa/{empresa_id}", response_model=List[SubcategoriaProductoReadSchema])
def subcategorias_por_empresa(
    empresa_id: int,
    skip: int = Query(default=0, ge=0, description="Número de registros a saltar"),
    limit: int = Query(default=100, ge=1, description="Número máximo de registros a retornar"),
    db: Session = Depends(get_db)
):
    return get_subcategorias_by_empresa(db, empresa_id, skip, limit)