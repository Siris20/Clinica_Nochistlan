from typing import List, Optional
from sqlalchemy.orm import Session, joinedload
from app.models.sql.producto import Producto
from app.models.sql.subcategoria_producto import SubcategoriaProducto
from app.models.sql.categoria_producto import CategoriaProducto
from app.models.sql.departamento_producto import DepartamentoProducto
from app.models.sql.producto_cotizado import ProductoCotizado
from fastapi import HTTPException, status
from pathlib import Path
import os
import asyncio
from app.schemas.producto import (
    ProductoCreateSchema,
    ProductoUpdateSchema,
    ProductoReadSchema,
)
from app.utils.file_handlers import (
    save_upload_image,
    delete_file
)

UPLOAD_DIR = Path("static/uploads")

async def create_producto(
    db: Session, producto_data: ProductoCreateSchema
) -> ProductoReadSchema:
    try:
      
        subcategoria_exists = db.query(
            db.query(SubcategoriaProducto)
            .filter(SubcategoriaProducto.id == producto_data.subcategoria_id)
            .exists()
        ).scalar()
        
        if not subcategoria_exists:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Subcategoría con ID {producto_data.subcategoria_id} no encontrada"
            )

       
        image_paths = []
        if producto_data.images:
            save_tasks = [
                save_upload_image(image, UPLOAD_DIR)
                for image in producto_data.images
            ]
            image_paths = await asyncio.gather(*save_tasks, return_exceptions=True)
            
            
            for i, result in enumerate(image_paths):
                if isinstance(result, Exception):
                   
                    for path in image_paths[:i]:
                        if not isinstance(path, Exception):
                            await delete_file(path)
                    raise HTTPException(
                        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                        detail=f"Error al guardar imagen {i+1}: {str(result)}"
                    )

        
        producto_dict = producto_data.model_dump(exclude_unset=True, exclude={"images"})
        nuevo_producto = Producto(
            images=image_paths if image_paths else None,
            **producto_dict
        )
        
        db.add(nuevo_producto)
        db.commit()
        
        return ProductoReadSchema.model_validate(nuevo_producto)
        
    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al crear producto: {str(e)}",
        )

def get_producto(db: Session, producto_id: int) -> ProductoReadSchema:
    try:
      
        producto = db.query(Producto).filter(Producto.id == producto_id).first()
        
        if not producto:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Producto no encontrado",
            )
        return ProductoReadSchema.model_validate(producto)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener producto: {str(e)}",
        )

def get_all_productos(
    db: Session, 
    skip: int = 0, 
    limit: int = 100,
    subcategoria_id: Optional[int] = None
) -> List[ProductoReadSchema]:
    try:
        query = db.query(Producto)
        
        if subcategoria_id is not None:
            query = query.filter(Producto.subcategoria_id == subcategoria_id)
            
        productos = query.offset(skip).limit(limit).all()
        
       
        return [ProductoReadSchema.model_validate(p) for p in productos]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener productos: {str(e)}",
        )

async def update_producto(
    db: Session, 
    producto_id: int, 
    producto_data: ProductoUpdateSchema
) -> ProductoReadSchema:
    try:
      
        producto = db.query(Producto).filter(Producto.id == producto_id).first()
        if not producto:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Producto no encontrado",
            )

        
        update_data = {}

        
        if 'images' in producto_data.model_fields_set:
          
            new_images = producto_data.images or []
            update_data['images'] = new_images
            
           
            if producto.images:
                images_to_remove = set(producto.images) - set(new_images)
                for img_path in images_to_remove:
                    try:
                       
                        full_path = os.path.join(os.getcwd(), img_path)
                        await delete_file(full_path)
                    except Exception:
                       
                        continue

       
        if 'new_files' in producto_data.model_fields_set and producto_data.new_files:
            saved_paths = []
            for image in producto_data.new_files:
                try:
                    image_path = await save_upload_image(image, UPLOAD_DIR)
                    saved_paths.append(image_path)
                except HTTPException as e:
                    
                    for path in saved_paths:
                        try:
                            full_path = os.path.join(os.getcwd(), path)
                            await delete_file(full_path)
                        except Exception:
                            continue
                    raise e
                except Exception as e:
                    
                    for path in saved_paths:
                        try:
                            full_path = os.path.join(os.getcwd(), path)
                            await delete_file(full_path)
                        except Exception:
                            continue
                    raise HTTPException(
                        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                        detail=f"Error al guardar imagen: {str(e)}"
                    )
            
            
            current_images = update_data.get('images', producto.images or [])
            update_data['images'] = current_images + saved_paths

        
        for field in producto_data.model_fields_set:
            if field not in ['images', 'new_files']:
                value = getattr(producto_data, field)
                if value is not None:  
                    update_data[field] = value

       
        for key, value in update_data.items():
            setattr(producto, key, value)

        
        db.commit()
        db.refresh(producto)
        return ProductoReadSchema.model_validate(producto)

    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al actualizar producto: {str(e)}",
        )

async def delete_producto(db: Session, producto_id: int) -> dict:
    try:
        producto = db.query(Producto).filter(Producto.id == producto_id).first()
        if not producto:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Producto no encontrado",
            )

       
        if producto.images:
            delete_tasks = [
                delete_file(os.path.join("static/uploads", os.path.basename(path)))
                for path in producto.images
            ]
            await asyncio.gather(*delete_tasks)

        db.delete(producto)
        db.commit()

        return {"detail": "Producto eliminado exitosamente"}
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al eliminar producto: {str(e)}",
        )
    


def get_total_productos_by_subcategoria(
    db: Session, 
    empresa_id: int,
    subcategoria_id: int
) -> int:
   
    return (
        db.query(Producto)
        .join(SubcategoriaProducto)
        .join(CategoriaProducto)
        .join(DepartamentoProducto)
        .filter(
            DepartamentoProducto.empresa_id == empresa_id,
            Producto.subcategoria_id == subcategoria_id
        )
        .count()
    )

def get_total_productos_by_categoria(
    db: Session, 
    empresa_id: int,
    categoria_id: int
) -> int:
    
    return (
        db.query(Producto)
        .join(SubcategoriaProducto)
        .join(CategoriaProducto)
        .join(DepartamentoProducto)
        .filter(
            DepartamentoProducto.empresa_id == empresa_id,
            CategoriaProducto.id == categoria_id
        )
        .count()
    )

def get_total_productos_by_departamento(
    db: Session, 
    empresa_id: int,
    departamento_id: int
) -> int:
    
    return (
        db.query(Producto)
        .join(SubcategoriaProducto)
        .join(CategoriaProducto)
        .join(DepartamentoProducto) 
        .filter(
            DepartamentoProducto.empresa_id == empresa_id,
            DepartamentoProducto.id == departamento_id  
        )
        .count()
    )

def get_total_productos_by_empresa(
    db: Session,
    empresa_id: int
) -> int:
    return (
        db.query(Producto)
        .join(SubcategoriaProducto)
        .join(CategoriaProducto)
        .join(DepartamentoProducto)
        .filter(DepartamentoProducto.empresa_id == empresa_id)
        .count()
    )


def get_productos_by_subcategoria(
    db: Session,
    empresa_id: int,
    subcategoria_id: int,
    skip: int = 0,
    limit: int = 100,
    order_by: Optional[str] = None,
    order_direction: str = "asc"
) -> List[ProductoReadSchema]:
    
    query = (
        db.query(Producto)
        .join(SubcategoriaProducto)
        .join(CategoriaProducto)
        .join(DepartamentoProducto)
        .filter(
            DepartamentoProducto.empresa_id == empresa_id,
            Producto.subcategoria_id == subcategoria_id
        )
    )
    
   
    if order_by:
        order_column = getattr(Producto, order_by, None)
        if order_column is not None:
            if order_direction.lower() == "desc":
                order_column = order_column.desc()
            query = query.order_by(order_column)
    
    productos = query.offset(skip).limit(limit).all()
    return [ProductoReadSchema.model_validate(p) for p in productos]

def get_productos_by_categoria(
    db: Session,
    empresa_id: int,
    categoria_id: int,
    skip: int = 0,
    limit: int = 100,
    order_by: Optional[str] = None,
    order_direction: str = "asc"
) -> List[ProductoReadSchema]:
   
    query = (
        db.query(Producto)
        .join(SubcategoriaProducto)
        .join(CategoriaProducto)
        .join(DepartamentoProducto)
        .filter(
            DepartamentoProducto.empresa_id == empresa_id,
            CategoriaProducto.id == categoria_id
        )
    )
    
    # Ordenamiento
    if order_by:
        order_column = getattr(Producto, order_by, None)
        if order_column is not None:
            if order_direction.lower() == "desc":
                order_column = order_column.desc()
            query = query.order_by(order_column)
    
    productos = query.offset(skip).limit(limit).all()
    return [ProductoReadSchema.model_validate(p) for p in productos]

def get_productos_by_departamento(
    db: Session,
    empresa_id: int,
    departamento_id: int,
    skip: int = 0,
    limit: int = 100,
    order_by: Optional[str] = None,
    order_direction: str = "asc"
) -> List[ProductoReadSchema]:
   
    query = (
        db.query(Producto)
        .join(SubcategoriaProducto)
        .join(CategoriaProducto)
        .filter(
            DepartamentoProducto.empresa_id == empresa_id,
            CategoriaProducto.departamento_id == departamento_id
        )
    )
    
 
    if order_by:
        order_column = getattr(Producto, order_by, None)
        if order_column is not None:
            if order_direction.lower() == "desc":
                order_column = order_column.desc()
            query = query.order_by(order_column)
    
    productos = query.offset(skip).limit(limit).all()
    return [ProductoReadSchema.model_validate(p) for p in productos]


def get_productos_by_empresa(
    db: Session,
    empresa_id: int,
    skip: int = 0,
    limit: int = 100,
    order_by: Optional[str] = None,
    order_direction: str = "asc"
) -> List[ProductoReadSchema]:
    
    query = (
        db.query(Producto)
        .join(SubcategoriaProducto)
        .join(CategoriaProducto)
        .join(DepartamentoProducto)
        .filter(DepartamentoProducto.empresa_id == empresa_id)
    )
    
    
    if order_by:
        order_column = getattr(Producto, order_by, None)
        if order_column is not None:
            if order_direction.lower() == "desc":
                order_column = order_column.desc()
            query = query.order_by(order_column)
    
    productos = query.offset(skip).limit(limit).all()
    return [ProductoReadSchema.model_validate(p) for p in productos]

