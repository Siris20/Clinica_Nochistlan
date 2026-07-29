from typing import List, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.sql.especialista import Especialista
from app.models.sql.empleado import Empleado
from app.models.sql.area import Area  
from app.schemas.especialista import (
    EspecialistaCreateSchema,
    EspecialistaUpdateSchema,
    EspecialistaReadSchema,
)

def create_especialista(db: Session, especialista_data: EspecialistaCreateSchema) -> EspecialistaReadSchema:
    try:
        # 1. Verificar si el empleado existe
        empleado = db.query(Empleado).filter(Empleado.id == especialista_data.empleado_id).first()
        if not empleado:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"El empleado con ID {especialista_data.empleado_id} no existe."
            )

        area = db.query(Area).filter(Area.id == especialista_data.area_id).first()
        if not area:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"El área médica con ID {especialista_data.area_id} no existe."
            )

        # 3. Verificar si el empleado ya está registrado como especialista
        existente = db.query(Especialista).filter(Especialista.empleado_id == especialista_data.empleado_id).first()
        if existente:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Este empleado ya está registrado como especialista."
            )

        # 4. Crear el nuevo especialista
        especialista_dict = especialista_data.model_dump(exclude_unset=True)
        nuevo_especialista = Especialista(**especialista_dict)

        db.add(nuevo_especialista)
        db.commit()
        db.refresh(nuevo_especialista)
        return EspecialistaReadSchema.model_validate(nuevo_especialista)

    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error inesperado al crear el especialista: {str(e)}"
        )

def get_especialista(db: Session, especialista_id: int) -> EspecialistaReadSchema:
    try:
        especialista = db.query(Especialista).filter(Especialista.id == especialista_id).first()
        if not especialista:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Especialista con ID {especialista_id} no encontrado."
            )
        return EspecialistaReadSchema.model_validate(especialista)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener el especialista: {str(e)}"
        )

def get_all_especialistas(
    db: Session, area_id: int, skip: int = 0, limit: int = 100
) -> List[EspecialistaReadSchema]:
    try:
        # Filtra estrictamente por el área seleccionada
        especialistas = (
            db.query(Especialista)
            .filter(Especialista.area_id == area_id)
            .offset(skip)
            .limit(limit)
            .all()
        )
        return [EspecialistaReadSchema.model_validate(e) for e in especialistas]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener la lista de especialistas: {str(e)}"
        )

def update_especialista(
    db: Session, especialista_id: int, especialista_data: EspecialistaUpdateSchema
) -> EspecialistaReadSchema:
    try:
        especialista = db.query(Especialista).filter(Especialista.id == especialista_id).first()
        if not especialista:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Especialista con ID {especialista_id} no encontrado."
            )

        if especialista_data.area_id is not None:
            area = db.query(Area).filter(Area.id == especialista_data.area_id).first()
            if not area:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"El área médica con ID {especialista_data.area_id} no existe."
                )

        update_data = especialista_data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            if value is not None:
                setattr(especialista, key, value)

        db.commit()
        db.refresh(especialista)
        return EspecialistaReadSchema.model_validate(especialista)

    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al actualizar el especialista: {str(e)}"
        )

def delete_especialista(db: Session, especialista_id: int) -> dict:
    try:
        especialista = db.query(Especialista).filter(Especialista.id == especialista_id).first()
        if not especialista:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Especialista con ID {especialista_id} no encontrado."
            )

        db.delete(especialista)
        db.commit()

        return {"detail": "Especialista eliminado exitosamente"}
    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al eliminar el especialista: {str(e)}"
        )