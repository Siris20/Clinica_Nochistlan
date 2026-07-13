from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import select
from sqlalchemy.exc import SQLAlchemyError
from app.models.sql.categoria_producto import CategoriaProducto
from app.models.sql.departamento_producto import DepartamentoProducto
from app.schemas.categoria_producto import (
    CategoriaProductoCreateSchema,
    CategoriaProductoUpdateSchema,
    CategoriaProductoReadSchema,
)
from fastapi import HTTPException, status

async def create_categoria_producto(
    db: Session, categoria_data: CategoriaProductoCreateSchema
) -> CategoriaProductoReadSchema:
    try:
        # Verificar departamento usando select más eficiente
        stmt = select(DepartamentoProducto.id).where(
            DepartamentoProducto.id == categoria_data.departamento_id
        )
        departamento = db.scalar(stmt)
        
        if not departamento:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Departamento no encontrado con ID {categoria_data.departamento_id}"
            )

        nueva_categoria = CategoriaProducto(**categoria_data.dict())
        db.add(nueva_categoria)
        db.commit()
        db.refresh(nueva_categoria)
        return CategoriaProductoReadSchema.from_orm(nueva_categoria)
        
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error en base de datos: {str(e)}"
        )

async def get_categoria_producto(
    db: Session, categoria_id: int
) -> CategoriaProductoReadSchema:
    try:
        # Consulta optimizada usando select
        stmt = select(CategoriaProducto).where(
            CategoriaProducto.id == categoria_id
        )
        categoria = db.scalar(stmt)
        
        if not categoria:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Categoría no encontrada"
            )
        return CategoriaProductoReadSchema.from_orm(categoria)
        
    except SQLAlchemyError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error en base de datos: {str(e)}"
        )

async def get_all_categorias_productos(
    db: Session, skip: int = 0, limit: int = 100
) -> List[CategoriaProductoReadSchema]:
    try:
        # Consulta paginada optimizada
        stmt = (
            select(CategoriaProducto)
            .order_by(CategoriaProducto.id)
            .offset(skip)
            .limit(limit)
        )
        categorias = db.scalars(stmt).all()
        return [CategoriaProductoReadSchema.from_orm(cat) for cat in categorias]
        
    except SQLAlchemyError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error en base de datos: {str(e)}"
        )

async def update_categoria_producto(
    db: Session, categoria_id: int, categoria_data: CategoriaProductoUpdateSchema
) -> CategoriaProductoReadSchema:
    try:
        update_data = categoria_data.dict(exclude_unset=True)
        
        if "departamento_id" in update_data:
            stmt = select(DepartamentoProducto.id).where(
                DepartamentoProducto.id == update_data["departamento_id"]
            )
            if not db.scalar(stmt):
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Departamento no encontrado con ID {update_data['departamento_id']}"
                )

        stmt = select(CategoriaProducto).where(
            CategoriaProducto.id == categoria_id
        )
        
        categoria = db.scalar(stmt)
        if not categoria:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Categoría no encontrada"
            )

        for key, value in update_data.items():
            setattr(categoria, key, value)
            
        db.commit()
        db.refresh(categoria)
        return CategoriaProductoReadSchema.from_orm(categoria)
        
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error en base de datos: {str(e)}"
        )

async def delete_categoria_producto(db: Session, categoria_id: int) -> None:
    try:
        stmt = select(CategoriaProducto).where(
            CategoriaProducto.id == categoria_id
        ).with_for_update()
            
        categoria = db.scalar(stmt)
        if not categoria:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Categoría no encontrada"
            )
                
        db.delete(categoria)
        db.commit()
        
        return {
            "detail": "Categoría eliminada exitosamente"
        }
            
    except SQLAlchemyError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error en base de datos: {str(e)}"
        )
    


#filtrar total de categorias por departamento y empresa
from sqlalchemy import func  # Añade esta importación al inicio del archivo

async def get_total_categorias_by_departamento(
    db: Session, empresa_id: int, departamento_id: int
) -> int:
    try:
        stmt = (
            select(func.count(CategoriaProducto.id))
            .join(DepartamentoProducto, CategoriaProducto.departamento_id == DepartamentoProducto.id)
            .where(
                CategoriaProducto.departamento_id == departamento_id,
                DepartamentoProducto.empresa_id == empresa_id
            )
        )
        total = db.scalar(stmt)
        return total if total is not None else 0
        
    except SQLAlchemyError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error en base de datos: {str(e)}"
        )

async def get_total_categorias_by_empresa(
    db: Session, empresa_id: int
) -> int:
    try:
        stmt = (
            select(func.count(CategoriaProducto.id))
            .join(DepartamentoProducto, CategoriaProducto.departamento_id == DepartamentoProducto.id)
            .where(DepartamentoProducto.empresa_id == empresa_id)
        )
        
        total = db.scalar(stmt)
        return total if total is not None else 0
        
    except SQLAlchemyError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error en base de datos: {str(e)}"
        )
    
async def get_categorias_by_departamento(
    db: Session,  departamento_id: int, empresa_id: int, skip: int = 0, limit: int = 100
) -> List[CategoriaProductoReadSchema]:
    try:
        stmt = (
            select(CategoriaProducto)
            .join(DepartamentoProducto, CategoriaProducto.departamento_id == DepartamentoProducto.id)
            .where(
                DepartamentoProducto.id == departamento_id,
                DepartamentoProducto.empresa_id == empresa_id
            )
            .offset(skip)
            .limit(limit)
        )
        
        categorias = db.scalars(stmt).all()
        return [CategoriaProductoReadSchema.from_orm(cat) for cat in categorias]
        
    except SQLAlchemyError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error en base de datos: {str(e)}"
        )
    
async def get_categorias_by_empresa(
    db: Session, empresa_id: int, skip: int = 0, limit: int = 100
) -> List[CategoriaProductoReadSchema]:
    try:
        stmt = (
            select(CategoriaProducto)
            .join(DepartamentoProducto, CategoriaProducto.departamento_id == DepartamentoProducto.id)
            .where(DepartamentoProducto.empresa_id == empresa_id)
            .offset(skip)
            .limit(limit)
        )
        
        categorias = db.scalars(stmt).all()
        return [CategoriaProductoReadSchema.from_orm(cat) for cat in categorias]
        
    except SQLAlchemyError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error en base de datos: {str(e)}"
        )