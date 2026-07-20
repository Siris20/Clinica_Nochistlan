from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List

class DepartamentoProductoBase(BaseModel):
    name: str = Field(..., max_length=255, description="Nombre del departamento de producto")
    description: Optional[str] = Field(None, max_length=255, description="Descripción del departamento de producto")
    empresa_id: int = Field(..., description="ID de la empresa a la que pertenece el departamento de producto")

    model_config = ConfigDict(from_attributes=True)

class DepartamentoProductoCreateSchema(DepartamentoProductoBase):
    pass

class DepartamentoProductoUpdateSchema(BaseModel):
    name: Optional[str] = Field(None, max_length=255, description="Nombre del departamento de producto")
    description: Optional[str] = Field(None, max_length=255, description="Descripción del departamento de producto")
    empresa_id: Optional[int] = Field(None, description="ID de la empresa a la que pertenece el departamento de producto")

    model_config = ConfigDict(from_attributes=True)

class DepartamentoProductoReadSchema(DepartamentoProductoBase):
    id: int = Field(..., description="ID del departamento de producto")

    model_config = ConfigDict(from_attributes=True)