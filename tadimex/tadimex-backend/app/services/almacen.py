from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from fastapi import HTTPException, status
from app.models.sql.almacen import Almacen
from app.schemas.almacen import (
    AlmacenCreateSchema,
    AlmacenUpdateSchema,
    AlmacenResponseSchema,
    AlmacenWithRelationsSchema
)

def create_almacen(db: Session, almacen: AlmacenCreateSchema) -> AlmacenResponseSchema:
    
    try:
        
        almacen_data = almacen.model_dump()
        
        
        db_almacen = Almacen(**almacen_data)
        
        
        db.add(db_almacen)
        db.commit()
        db.refresh(db_almacen)
        
        
        return AlmacenResponseSchema.model_validate(db_almacen)
    
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al crear el almacén: {str(e)}"
        )

def get_almacen(db: Session, almacen_id: int) -> AlmacenWithRelationsSchema:
    
    try:
        
        db_almacen = db.query(Almacen).filter(Almacen.id == almacen_id).first()
        
       
        if not db_almacen:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Almacén con ID {almacen_id} no encontrado"
            )
        
        
        return AlmacenWithRelationsSchema.model_validate(db_almacen)
    
    except SQLAlchemyError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener el almacén: {str(e)}"
        )

def get_all_almacenes(db: Session) -> List[AlmacenResponseSchema]:
    
    try:
        
        db_almacenes = db.query(Almacen).all()
        
        
        return [AlmacenResponseSchema.model_validate(almacen) for almacen in db_almacenes]
    
    except SQLAlchemyError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener los almacenes: {str(e)}"
        )

def update_almacen(db: Session, almacen_id: int, almacen: AlmacenUpdateSchema) -> AlmacenResponseSchema:
    
    try:
        
        db_almacen = db.query(Almacen).filter(Almacen.id == almacen_id).first()
        
        
        if not db_almacen:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Almacén con ID {almacen_id} no encontrado"
            )
        
        
        for key, value in almacen.model_dump(exclude_unset=True).items():
            setattr(db_almacen, key, value)
        
       
        db.commit()
        db.refresh(db_almacen)
        
        
        return AlmacenResponseSchema.model_validate(db_almacen)
    
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al actualizar el almacén: {str(e)}"
        )

def delete_almacen(db: Session, almacen_id: int) -> bool:

    try:
        
        db_almacen = db.query(Almacen).filter(Almacen.id == almacen_id).first()
        
       
        if not db_almacen:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Almacén con ID {almacen_id} no encontrado"
            )
        
       
        db.delete(db_almacen)
        db.commit()
        
        return True
    
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al eliminar el almacén: {str(e)}"
        )