from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from datetime import datetime
from fastapi import UploadFile

class LogoBase(BaseModel):
    name: str = Field(..., max_length=30, description="Nombre del logo")
    empresa_id: int = Field(..., description="ID de la empresa a la que pertenece el logo")

    model_config = ConfigDict(from_attributes=True)

class LogoCreateSchema(LogoBase):
    image_file: Optional[UploadFile] = Field(None, description="Archivo de imagen del logo para subir")
    pass

class LogoUpdateSchema(BaseModel):
    name: Optional[str] = Field(None, max_length=30, description="Nombre del logo")
    image_url: Optional[str] = Field(None, max_length=255, description="URL de la imagen del logo")
    empresa_id: Optional[int] = Field(None, description="ID de la empresa a la que pertenece el logo")
    new_image_file: Optional[UploadFile] = Field(None, description="Nuevo archivo de imagen del logo para subir")

    model_config = ConfigDict(from_attributes=True)

class LogoReadSchema(LogoBase):
    id: int = Field(..., description="ID del logo")
    image_url: str = Field(..., max_length=255, description="URL de la imagen del logo")
    created_at: datetime = Field(..., description="Fecha de creación del logo")
    updated_at: datetime = Field(..., description="Fecha de última actualización del logo")
    empresa: Optional["EmpresaReadSchema"] = Field(None, description="Datos de la empresa")
    cotizaciones: Optional[List["CotizacionReadSchema"]] = Field(None, description="Lista de cotizaciones asociadas al logo")

    model_config = ConfigDict(from_attributes=True)

class EmpresaReadSchema(BaseModel):
    id: int = Field(..., description="ID de la empresa")
    name: str = Field(..., description="Nombre de la empresa")

    model_config = ConfigDict(from_attributes=True)

class CotizacionReadSchema(BaseModel):
    id: int = Field(..., description="ID de la cotización")

    model_config = ConfigDict(from_attributes=True)