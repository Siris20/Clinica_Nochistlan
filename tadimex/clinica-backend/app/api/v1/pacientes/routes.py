from datetime import date
from decimal import Decimal
from typing import List, Optional
from fastapi import APIRouter, Depends, Query, Form
from sqlalchemy.orm import Session

from app.db.mariadb import get_db
from app.schemas.paciente import (
    PacienteCreateSchema,
    PacienteUpdateSchema,
    PacienteReadSchema,
)
from app.services.paciente import (
    crear_paciente,
    obtener_paciente,
    obtener_todos_los_pacientes,
    actualizar_paciente,
    eliminar_paciente,
)

router = APIRouter()


@router.post("/paciente", response_model=PacienteReadSchema)
def crear_paciente_endpoint(
    nombre: str = Form(...),
    apellido_paterno: Optional[str] = Form(None),
    apellido_materno: Optional[str] = Form(None),
    fecha_nacimiento: Optional[date] = Form(None),
    edad: Optional[int] = Form(None),
    peso: Optional[Decimal] = Form(None),
    altura: Optional[Decimal] = Form(None),
    genero: Optional[str] = Form(None),
    curp: Optional[str] = Form(None),
    grupo_sanguineo: Optional[str] = Form(None),
    alergias: Optional[str] = Form(None),
    contacto_emergencia_nombre: Optional[str] = Form(None),
    contacto_emergencia_telefono: Optional[str] = Form(None),
    contacto_emergencia_parentesco: Optional[str] = Form(None),
    estatus: Optional[str] = Form("activo"),
    telefono_celular: Optional[str] = Form(None),
    telefono_fijo: Optional[str] = Form(None),
    email: Optional[str] = Form(None),
    calle: Optional[str] = Form(None),
    numero_exterior: Optional[str] = Form(None),
    numero_interior: Optional[str] = Form(None),
    colonia: Optional[str] = Form(None),
    localidad: Optional[str] = Form(None),
    municipio: Optional[str] = Form(None),
    estado: Optional[str] = Form(None),
    codigo_postal: Optional[str] = Form(None),
    observaciones: Optional[str] = Form(None),
    db: Session = Depends(get_db)
):
    paciente_data = PacienteCreateSchema(
        nombre=nombre,
        apellido_paterno=apellido_paterno,
        apellido_materno=apellido_materno,
        fecha_nacimiento=fecha_nacimiento,
        edad=edad,
        peso=peso,
        altura=altura,
        genero=genero,
        curp=curp,
        grupo_sanguineo=grupo_sanguineo,
        alergias=alergias,
        contacto_emergencia_nombre=contacto_emergencia_nombre,
        contacto_emergencia_telefono=contacto_emergencia_telefono,
        contacto_emergencia_parentesco=contacto_emergencia_parentesco,
        estatus=estatus,
        telefono_celular=telefono_celular,
        telefono_fijo=telefono_fijo,
        email=email,
        calle=calle,
        numero_exterior=numero_exterior,
        numero_interior=numero_interior,
        colonia=colonia,
        localidad=localidad,
        municipio=municipio,
        estado=estado,
        codigo_postal=codigo_postal,
        observaciones=observaciones,
    )
    return crear_paciente(db, paciente_data)


@router.get("/paciente/{paciente_id}", response_model=PacienteReadSchema)
def obtener_paciente_endpoint(
    paciente_id: int,
    db: Session = Depends(get_db)
):
    return obtener_paciente(db, paciente_id)


@router.get("/pacientes", response_model=List[PacienteReadSchema])
def obtener_pacientes_endpoint(
    skip: int = Query(default=0, ge=0, description="Número de registros a saltar"),
    limit: int = Query(default=100, ge=1, description="Número máximo de registros a retornar"),
    db: Session = Depends(get_db)
):
    return obtener_todos_los_pacientes(db, skip, limit)


@router.put("/paciente/{paciente_id}", response_model=PacienteReadSchema)
def actualizar_paciente_endpoint(
    paciente_id: int,
    nombre: Optional[str] = Form(None),
    apellido_paterno: Optional[str] = Form(None),
    apellido_materno: Optional[str] = Form(None),
    fecha_nacimiento: Optional[date] = Form(None),
    edad: Optional[int] = Form(None),
    peso: Optional[Decimal] = Form(None),
    altura: Optional[Decimal] = Form(None),
    genero: Optional[str] = Form(None),
    curp: Optional[str] = Form(None),
    grupo_sanguineo: Optional[str] = Form(None),
    alergias: Optional[str] = Form(None),
    contacto_emergencia_nombre: Optional[str] = Form(None),
    contacto_emergencia_telefono: Optional[str] = Form(None),
    contacto_emergencia_parentesco: Optional[str] = Form(None),
    estatus: Optional[str] = Form(None),
    telefono_celular: Optional[str] = Form(None),
    telefono_fijo: Optional[str] = Form(None),
    email: Optional[str] = Form(None),
    calle: Optional[str] = Form(None),
    numero_exterior: Optional[str] = Form(None),
    numero_interior: Optional[str] = Form(None),
    colonia: Optional[str] = Form(None),
    localidad: Optional[str] = Form(None),
    municipio: Optional[str] = Form(None),
    estado: Optional[str] = Form(None),
    codigo_postal: Optional[str] = Form(None),
    observaciones: Optional[str] = Form(None),
    db: Session = Depends(get_db)
):
    paciente_data = PacienteUpdateSchema(
        nombre=nombre,
        apellido_paterno=apellido_paterno,
        apellido_materno=apellido_materno,
        fecha_nacimiento=fecha_nacimiento,
        edad=edad,
        peso=peso,
        altura=altura,
        genero=genero,
        curp=curp,
        grupo_sanguineo=grupo_sanguineo,
        alergias=alergias,
        contacto_emergencia_nombre=contacto_emergencia_nombre,
        contacto_emergencia_telefono=contacto_emergencia_telefono,
        contacto_emergencia_parentesco=contacto_emergencia_parentesco,
        estatus=estatus,
        telefono_celular=telefono_celular,
        telefono_fijo=telefono_fijo,
        email=email,
        calle=calle,
        numero_exterior=numero_exterior,
        numero_interior=numero_interior,
        colonia=colonia,
        localidad=localidad,
        municipio=municipio,
        estado=estado,
        codigo_postal=codigo_postal,
        observaciones=observaciones,
    )
    return actualizar_paciente(db, paciente_id, paciente_data)


@router.delete("/paciente/{paciente_id}")
def eliminar_paciente_endpoint(
    paciente_id: int,
    db: Session = Depends(get_db)
):
    return eliminar_paciente(db, paciente_id)