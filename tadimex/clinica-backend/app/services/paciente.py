from typing import List
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException, status

from app.models.sql.paciente import Paciente
from app.schemas.paciente import PacienteCreateSchema, PacienteUpdateSchema


def crear_paciente(db: Session, paciente_data: PacienteCreateSchema) -> Paciente:
    datos = paciente_data.model_dump(exclude_unset=True)
    datos.pop("alias", None)  # Limpieza preventiva
    nuevo_paciente = Paciente(**datos)
    db.add(nuevo_paciente)
    db.commit()
    db.refresh(nuevo_paciente)
    return nuevo_paciente


def obtener_paciente(db: Session, paciente_id: int) -> Paciente:
    paciente = db.query(Paciente).filter(Paciente.id == paciente_id).first()
    if not paciente:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Paciente no encontrado"
        )
    return paciente


def obtener_todos_los_pacientes(db: Session, skip: int = 0, limit: int = 100) -> List[Paciente]:
    return db.query(Paciente).offset(skip).limit(limit).all()


def actualizar_paciente(
    db: Session, paciente_id: int, paciente_data: PacienteUpdateSchema
) -> Paciente:
    paciente = obtener_paciente(db, paciente_id)
    datos_actualizacion = paciente_data.model_dump(exclude_unset=True)
    datos_actualizacion.pop("alias", None)

    for clave, valor in datos_actualizacion.items():
        setattr(paciente, clave, valor)

    db.commit()
    db.refresh(paciente)
    return paciente


def eliminar_paciente(db: Session, paciente_id: int) -> dict:
    paciente = obtener_paciente(db, paciente_id)
    try:
        db.delete(paciente)
        db.commit()
        return {"mensaje": "Paciente eliminado correctamente"}
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No se puede eliminar el paciente porque tiene registros asociados (cotizaciones, citas, etc.)."
        )