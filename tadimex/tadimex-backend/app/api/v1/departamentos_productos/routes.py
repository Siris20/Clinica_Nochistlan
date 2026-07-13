from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.services.departamento_producto import (
    create_departamento_producto,
    get_departamento_producto_by_id,
    get_all_departamentos_productos,
    update_departamento_producto,
    delete_departamento_producto,
    get_total_departamentos_by_empresa,
    get_departamentos_by_empresa,
)
from app.schemas.departamento_producto import (
    DepartamentoProductoCreateSchema,
    DepartamentoProductoReadSchema,
    DepartamentoProductoUpdateSchema,
)
from app.db.mariadb import get_db

router = APIRouter()

@router.post("/departamento/", response_model=DepartamentoProductoReadSchema)
async def crear_departamento(
    departamento: DepartamentoProductoCreateSchema, db: Session = Depends(get_db)
):
    return await create_departamento_producto(db, departamento)

@router.get("/departamento/{departamento_id}", response_model=DepartamentoProductoReadSchema)
async def obtener_departamento(departamento_id: int, db: Session = Depends(get_db)):
    return await get_departamento_producto_by_id(db, departamento_id)

@router.get("/departamentos/", response_model=List[DepartamentoProductoReadSchema])
async def obtener_departamentos(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return await get_all_departamentos_productos(db, skip=skip, limit=limit)

@router.put("/departamentos/{departamento_id}", response_model=DepartamentoProductoReadSchema)
async def actualizar_departamento(
    departamento_id: int,
    departamento: DepartamentoProductoUpdateSchema,
    db: Session = Depends(get_db),
):
    return await update_departamento_producto(db, departamento_id, departamento)

@router.delete("/departamentos/{departamento_id}", status_code=status.HTTP_200_OK)
async def elimiar_departamento(departamento_id: int, db: Session = Depends(get_db)):
    return await delete_departamento_producto(db, departamento_id)
    

@router.get("/departamentos/total/empresa/{empresa_id}", response_model=int)
async def obtener_total_departamentos_por_empresa(
    empresa_id: int, db: Session = Depends(get_db)
):
    """
    Obtiene el total de departamentos de productos por empresa.
    """
    return await  get_total_departamentos_by_empresa(db, empresa_id)
    
    

@router.get("/departamentos/empresa/{empresa_id}", response_model=List[DepartamentoProductoReadSchema])
async def obtener_departamentos_por_empresa(
    empresa_id: int, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)
):
    """
    Obtiene una lista de departamentos de productos por empresa.
    """
    return await get_departamentos_by_empresa(db, empresa_id, skip, limit)
