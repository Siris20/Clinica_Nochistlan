from typing import List, Optional
from sqlalchemy.orm import Session, load_only
from sqlalchemy import select
from app.models.sql.departamento_producto import DepartamentoProducto
from app.models.sql.subcategoria_producto import SubcategoriaProducto
from app.models.sql.producto import Producto
from app.models.sql.categoria_producto import CategoriaProducto
from app.schemas.subcategoria_producto import (
    SubcategoriaProductoCreateSchema,
    SubcategoriaProductoUpdateSchema,
    SubcategoriaProductoReadSchema,
)
from fastapi import HTTPException, status

def create_subcategoria_producto(
    db: Session, subcategoria_data: SubcategoriaProductoCreateSchema
) -> SubcategoriaProductoReadSchema:
    """Crea una nueva subcategoría con verificación de existencia de categoría."""
    try:
        # Verificación más eficiente usando exists()
        categoria_exists = db.query(
            db.query(CategoriaProducto)
            .filter(CategoriaProducto.id == subcategoria_data.categoria_id)
            .exists()
        ).scalar()
        
        if not categoria_exists:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Categoría con ID {subcategoria_data.categoria_id} no encontrada"
            )

        nueva_subcategoria = SubcategoriaProducto(
            name=subcategoria_data.name,
            description=subcategoria_data.description,
            categoria_id=subcategoria_data.categoria_id,
        )
        
        db.add(nueva_subcategoria)
        db.commit()
        db.refresh(nueva_subcategoria)
        return SubcategoriaProductoReadSchema.from_orm(nueva_subcategoria)
    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al crear subcategoría: {str(e)}",
        )

def get_subcategoria_producto(
    db: Session, subcategoria_id: int
) -> SubcategoriaProductoReadSchema:
    """Obtiene una subcategoría por ID usando SQLAlchemy Core para mejor performance."""
    try:
        # Usando SQLAlchemy Core para consultas más rápidas
        stmt = select(SubcategoriaProducto).where(SubcategoriaProducto.id == subcategoria_id)
        subcategoria = db.execute(stmt).scalar_one_or_none()
        
        if not subcategoria:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Subcategoría no encontrada"
            )
        return SubcategoriaProductoReadSchema.from_orm(subcategoria)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener subcategoría: {str(e)}",
        )

def get_all_subcategorias_productos(
    db: Session, skip: int = 0, limit: int = 100
) -> List[SubcategoriaProductoReadSchema]:
    """Obtiene todas las subcategorías con paginación eficiente."""
    try:
        # Consulta optimizada para paginación
        if limit > 1000:  # Evitar límites demasiado grandes
            limit = 1000
            
        # Versión corregida - usando el ORM de SQLAlchemy correctamente
        subcategorias = db.query(SubcategoriaProducto)\
            .order_by(SubcategoriaProducto.id)\
            .offset(skip)\
            .limit(limit)\
            .all()
            
        return [
            SubcategoriaProductoReadSchema.from_orm(subcategoria)
            for subcategoria in subcategorias
        ]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener subcategorías: {str(e)}",
        )
    

    
def update_subcategoria_producto(
    db: Session, subcategoria_id: int, subcategoria_data: SubcategoriaProductoUpdateSchema
) -> SubcategoriaProductoReadSchema:
    """Actualiza una subcategoría con validación optimizada."""
    try:
        # Obtener solo los campos necesarios para actualizar
        subcategoria = db.query(
            db.query(SubcategoriaProducto)
            .filter(SubcategoriaProducto.id == subcategoria_id)
            .first())
            
        if not subcategoria:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Subcategoría no encontrada"
            )

        update_data = subcategoria_data.dict(exclude_unset=True)
        
        # Validación de categoría solo si se está actualizando
        if "categoria_id" in update_data:
            categoria_exists = db.query(
                db.query(CategoriaProducto)
                .filter(CategoriaProducto.id == update_data["categoria_id"])
                .exists()
            ).scalar()
            
            if not categoria_exists:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Categoría con ID {update_data['categoria_id']} no encontrada"
                )

        # Actualización eficiente de atributos
        for key, value in update_data.items():
            setattr(subcategoria, key, value)

        db.commit()
        db.refresh(subcategoria)
        return SubcategoriaProductoReadSchema.from_orm(subcategoria)
    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al actualizar subcategoría: {str(e)}",
        )

def delete_subcategoria_producto(db: Session, subcategoria_id: int) -> None:
    """Elimina una subcategoría y todos sus productos asociados."""
    try:
        # Verificar si existe la subcategoría
        subcategoria = db.query(SubcategoriaProducto)\
                        .filter(SubcategoriaProducto.id == subcategoria_id)\
                        .first()
        
        if not subcategoria:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Subcategoría no encontrada"
            )

        # Eliminar todos los productos asociados a la subcategoría
        db.query(Producto)\
          .filter(Producto.subcategoria_id == subcategoria_id)\
          .delete(synchronize_session=False)

        # Eliminar la subcategoría
        db.delete(subcategoria)
        db.commit()
        
    except HTTPException:
        raise  # Re-lanzamos las excepciones HTTP que ya habíamos capturado
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al eliminar subcategoría y sus productos: {str(e)}",
        )
    


def get_total_subcategorias_by_empresa(
    db: Session,
    empresa_id: int
) -> int:
    return (
        db.query(SubcategoriaProducto)
        .join(CategoriaProducto)
        .join(DepartamentoProducto)
        .filter(DepartamentoProducto.empresa_id == empresa_id)
        .count()
    )


def get_total_subcategorias_by_categoria(
    db: Session, 
    empresa_id: int,
    categoria_id: int
) -> int:
    """Obtiene el conteo total de subcategorías por categoría, filtrando por empresa"""
    return (
        db.query(SubcategoriaProducto)
        .join(CategoriaProducto)
        .join(DepartamentoProducto)
        .filter(
            DepartamentoProducto.empresa_id == empresa_id,
            CategoriaProducto.id == categoria_id
        )
        .count()
    )

def get_total_subcategorias_by_departamento(
    db: Session, 
    empresa_id: int,
    departamento_id: int
) -> int:
    """Obtiene el conteo total de subcategorías por departamento, filtrando por empresa"""
    return (
        db.query(SubcategoriaProducto)
        .join(CategoriaProducto)
        .join(DepartamentoProducto)
        .filter(
            DepartamentoProducto.empresa_id == empresa_id,
            DepartamentoProducto.id == departamento_id
        )
        .count()
    )

#obtiene subcategorias por categoria y empresa optimizado
def get_subcategorias_by_categoria(
    db: Session,
    empresa_id: int,
    categoria_id: int,
    skip: int = 0,
    limit: int = 100
) -> List[SubcategoriaProductoReadSchema]:
    """Obtiene subcategorías paginadas por categoría, filtrando por empresa"""
    try:
        query = (
            db.query(SubcategoriaProducto)
            .join(CategoriaProducto)
            .join(DepartamentoProducto)
            .filter(
                DepartamentoProducto.empresa_id == empresa_id,
                CategoriaProducto.id == categoria_id
            )
            .order_by(SubcategoriaProducto.id)
            .offset(skip)
            .limit(limit)
        )
        
        subcategorias = query.all()
        return [SubcategoriaProductoReadSchema.from_orm(s) for s in subcategorias]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener subcategorías: {str(e)}",
        )


#Obtiene subcategorias por departamento y empresa optimizado
def get_subcategorias_by_departamento(
    db: Session,
    empresa_id: int,
    departamento_id: int,
    skip: int = 0,
    limit: int = 100
) -> List[SubcategoriaProductoReadSchema]:
    """Obtiene subcategorías paginadas por departamento, filtrando por empresa"""
    try:
        query = (
            db.query(SubcategoriaProducto)
            .join(CategoriaProducto)
            .join(DepartamentoProducto)
            .filter(
                DepartamentoProducto.empresa_id == empresa_id,
                DepartamentoProducto.id == departamento_id
            )
            .order_by(SubcategoriaProducto.id)
            .offset(skip)
            .limit(limit)
        )
        
        subcategorias = query.all()
        return [SubcategoriaProductoReadSchema.from_orm(s) for s in subcategorias]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener subcategorías: {str(e)}",
        )


def get_subcategorias_by_empresa(
    db: Session,
    empresa_id: int,
    skip: int = 0,
    limit: int = 100
) -> List[SubcategoriaProductoReadSchema]:
    """Obtiene subcategorías paginadas por empresa con optimización de consulta"""
    try:
        query = (
            db.query(SubcategoriaProducto)
            .join(CategoriaProducto)
            .join(DepartamentoProducto)
            .filter(DepartamentoProducto.empresa_id == empresa_id)
            .order_by(SubcategoriaProducto.id)
            .offset(skip)
            .limit(limit)
        )
        
        subcategorias = query.all()
        return [SubcategoriaProductoReadSchema.from_orm(s) for s in subcategorias]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener subcategorías: {str(e)}",
        )