from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List


class CategoriaProductoBase(BaseModel):
    name: str = Field(..., max_length=255, description="Nombre de la categoría de producto")
    description: Optional[str] = Field(None, max_length=255, description="Descripción de la categoría de producto")
    departamento_id: int = Field(..., description="ID del departamento al que pertenece la categoría")

    model_config = ConfigDict(from_attributes=True)


class CategoriaProductoCreateSchema(CategoriaProductoBase):
    pass


class CategoriaProductoUpdateSchema(BaseModel):
    name: Optional[str] = Field(None, max_length=255, description="Nombre de la categoría de producto")
    description: Optional[str] = Field(None, max_length=255, description="Descripción de la categoría de producto")
    departamento_id: Optional[int] = Field(None, description="ID del departamento al que pertenece la categoría")

    model_config = ConfigDict(from_attributes=True)


class CategoriaProductoReadSchema(CategoriaProductoBase):
    id: int = Field(..., description="ID de la categoría de producto")
    departamento_id: int = Field(..., description="ID del departamento al que pertenece la categoría")

    model_config = ConfigDict(from_attributes=True)

