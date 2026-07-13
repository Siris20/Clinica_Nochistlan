from typing import List, Optional
from sqlalchemy import select, func
from sqlalchemy.orm import Session
from app.models.sql.departamento_producto import DepartamentoProducto
from app.schemas.departamento_producto import (
    DepartamentoProductoCreateSchema,
    DepartamentoProductoUpdateSchema,
    DepartamentoProductoReadSchema,
)
from fastapi import HTTPException, status
from sqlalchemy.exc import SQLAlchemyError

async def create_departamento_producto(
    db: Session, departamento_data: DepartamentoProductoCreateSchema
) -> DepartamentoProductoReadSchema:
    try:
        nuevo_departamento = DepartamentoProducto(**departamento_data.dict())
        db.add(nuevo_departamento)
        db.commit()
        db.refresh(nuevo_departamento)
        return DepartamentoProductoReadSchema.from_orm(nuevo_departamento)
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error en base de datos: {str(e)}"
        )

async def get_departamento_producto_by_id(
    db: Session, departamento_id: int
) -> DepartamentoProductoReadSchema:
    try:
        # Usar select() en lugar de query() para mejor rendimiento
        stmt = select(DepartamentoProducto).where(
            DepartamentoProducto.id == departamento_id
        )
        departamento = db.scalar(stmt)
        
        if not departamento:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Departamento no encontrado"
            )
        return DepartamentoProductoReadSchema.from_orm(departamento)
    except SQLAlchemyError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error en base de datos: {str(e)}"
        )

async def get_all_departamentos_productos(
    db: Session, skip: int = 0, limit: int = 100
) -> List[DepartamentoProductoReadSchema]:
    try:
        # Consulta optimizada usando select
        stmt = (
            select(DepartamentoProducto)
            .order_by(DepartamentoProducto.id)
            .offset(skip)
            .limit(limit)
        )
        departamentos = db.scalars(stmt).all()
        return [DepartamentoProductoReadSchema.from_orm(d) for d in departamentos]
    except SQLAlchemyError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error en base de datos: {str(e)}"
        )

async def update_departamento_producto(
    db: Session, departamento_id: int, departamento_data: DepartamentoProductoUpdateSchema
) -> DepartamentoProductoReadSchema:
    try:
        stmt = select(DepartamentoProducto).where(
            DepartamentoProducto.id == departamento_id
        ).with_for_update()
        
        departamento = db.scalar(stmt)
        if not departamento:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Departamento de producto no encontrado"
            )

        update_data = departamento_data.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(departamento, key, value)

        db.commit()
        db.refresh(departamento)
        return DepartamentoProductoReadSchema.from_orm(departamento)
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error en base de datos: {str(e)}"
        )

async def delete_departamento_producto(db: Session, departamento_id: int):
    try:
        stmt = select(DepartamentoProducto).where(
            DepartamentoProducto.id == departamento_id
        ).with_for_update()
        
        departamento = db.scalar(stmt)
        if not departamento:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Departamento de producto no encontrado"
            )
            
        db.delete(departamento)
        db.commit()
        
        return {
            "detail": "Departamento eliminado exitosamente"
        }
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error en base de datos: {str(e)}"
        )
    


async def get_total_departamentos_by_empresa(
    db: Session, empresa_id: int
) -> int:
    try:
        
        stmt = select(func.count()).select_from(DepartamentoProducto).where(
            DepartamentoProducto.empresa_id == empresa_id
        )
        return db.scalar(stmt) or 0
    except SQLAlchemyError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error en base de datos: {str(e)}"
        )
    
async def get_departamentos_by_empresa(
    db: Session, empresa_id: int, skip: int = 0, limit: int = 100
) -> List[DepartamentoProductoReadSchema]:
    try:
       
        stmt = (
            select(DepartamentoProducto)
            .where(DepartamentoProducto.empresa_id == empresa_id)
            .order_by(DepartamentoProducto.id)
            .offset(skip)
            .limit(limit)
        )
        departamentos = db.scalars(stmt).all()
        return [DepartamentoProductoReadSchema.from_orm(d) for d in departamentos]
    except SQLAlchemyError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error en base de datos: {str(e)}"
        )