from datetime import date
from decimal import Decimal
from typing import Optional, List
from fastapi import Form
from pydantic import BaseModel, Field, ConfigDict


class PacienteBase(BaseModel):
    nombre: str = Form(..., max_length=100, description="Nombre del paciente")
    apellido_paterno: Optional[str] = Form(None, max_length=100, description="Apellido paterno")
    apellido_materno: Optional[str] = Form(None, max_length=100, description="Apellido materno")
    fecha_nacimiento: Optional[date] = Form(None, description="Fecha de nacimiento")
    edad: Optional[int] = Form(None, description="Edad del paciente en años")
    peso: Optional[Decimal] = Form(None, description="Peso en kg (ej. 70.50)")
    altura: Optional[Decimal] = Form(None, description="Altura en metros (ej. 1.75)")
    genero: Optional[str] = Form(None, max_length=20, description="Género del paciente")
    curp: Optional[str] = Form(None, max_length=18, description="CURP")
    grupo_sanguineo: Optional[str] = Form(None, max_length=5, description="Grupo sanguíneo (ej. O+)")
    alergias: Optional[str] = Form(None, description="Alergias o condiciones médicas")

    # Contacto de emergencia
    contacto_emergencia_nombre: Optional[str] = Form(None, max_length=150, description="Nombre del contacto de emergencia")
    contacto_emergencia_telefono: Optional[str] = Form(None, max_length=20, description="Teléfono del contacto de emergencia")
    contacto_emergencia_parentesco: Optional[str] = Form(None, max_length=50, description="Parentesco con el contacto")
    estatus: Optional[str] = Form("activo", max_length=20, description="Estatus (activo/inactivo)")

    # Datos de contacto y ubicación
    telefono_celular: Optional[str] = Form(None, max_length=15, description="Teléfono celular")
    telefono_fijo: Optional[str] = Form(None, max_length=15, description="Teléfono fijo")
    email: Optional[str] = Form(None, max_length=255, description="Correo electrónico")
    calle: Optional[str] = Form(None, max_length=255, description="Calle")
    numero_exterior: Optional[str] = Form(None, max_length=50, description="Número exterior")
    numero_interior: Optional[str] = Form(None, max_length=50, description="Número interior")
    colonia: Optional[str] = Form(None, max_length=255, description="Colonia")
    localidad: Optional[str] = Form(None, max_length=255, description="Localidad")
    municipio: Optional[str] = Form(None, max_length=255, description="Municipio")
    estado: Optional[str] = Form(None, max_length=100, description="Estado")
    codigo_postal: Optional[str] = Form(None, max_length=5, description="Código postal")
    observaciones: Optional[str] = Form(None, max_length=255, description="Observaciones adicionales")

    model_config = ConfigDict(from_attributes=True)


class PacienteCreateSchema(PacienteBase):
    pass


class PacienteUpdateSchema(BaseModel):
    nombre: Optional[str] = Form(None, max_length=100, description="Nombre del paciente")
    apellido_paterno: Optional[str] = Form(None, max_length=100, description="Apellido paterno")
    apellido_materno: Optional[str] = Form(None, max_length=100, description="Apellido materno")
    fecha_nacimiento: Optional[date] = Form(None, description="Fecha de nacimiento")
    edad: Optional[int] = Form(None, description="Edad del paciente en años")
    peso: Optional[Decimal] = Form(None, description="Peso en kg")
    altura: Optional[Decimal] = Form(None, description="Altura en metros")
    genero: Optional[str] = Form(None, max_length=20, description="Género")
    curp: Optional[str] = Form(None, max_length=18, description="CURP")
    grupo_sanguineo: Optional[str] = Form(None, max_length=5, description="Grupo sanguíneo")
    alergias: Optional[str] = Form(None, description="Alergias")
    contacto_emergencia_nombre: Optional[str] = Form(None, max_length=150, description="Nombre de contacto de emergencia")
    contacto_emergencia_telefono: Optional[str] = Form(None, max_length=20, description="Teléfono de contacto de emergencia")
    contacto_emergencia_parentesco: Optional[str] = Form(None, max_length=50, description="Parentesco")
    estatus: Optional[str] = Form(None, max_length=20, description="Estatus")
    telefono_celular: Optional[str] = Form(None, max_length=15, description="Teléfono celular")
    telefono_fijo: Optional[str] = Form(None, max_length=15, description="Teléfono fijo")
    email: Optional[str] = Form(None, max_length=255, description="Correo electrónico")
    calle: Optional[str] = Form(None, max_length=255, description="Calle")
    numero_exterior: Optional[str] = Form(None, max_length=50, description="Número exterior")
    numero_interior: Optional[str] = Form(None, max_length=50, description="Número interior")
    colonia: Optional[str] = Form(None, max_length=255, description="Colonia")
    localidad: Optional[str] = Form(None, max_length=255, description="Localidad")
    municipio: Optional[str] = Form(None, max_length=255, description="Municipio")
    estado: Optional[str] = Form(None, max_length=100, description="Estado")
    codigo_postal: Optional[str] = Form(None, max_length=5, description="Código postal")
    observaciones: Optional[str] = Form(None, max_length=255, description="Observaciones")

    model_config = ConfigDict(from_attributes=True)


class PacienteReadSchema(PacienteBase):
    id: int = Field(..., description="ID del paciente")
    cotizaciones: Optional[List["CotizacionRead"]] = Field(None, description="Lista de cotizaciones asociadas")

    model_config = ConfigDict(from_attributes=True)


class CotizacionRead(BaseModel):
    id: int = Field(..., description="ID de la cotización")

    model_config = ConfigDict(from_attributes=True)