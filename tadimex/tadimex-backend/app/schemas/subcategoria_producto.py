from pydantic import BaseModel, Field, ConfigDict
from typing import Optional


class SubcategoriaProductoBase(BaseModel):
    name: str = Field(..., max_length=255, description="Nombre de la subcategoría de producto")
    description: Optional[str] = Field(None, max_length=255, description="Descripción de la subcategoría de producto")
    categoria_id: int = Field(..., description="ID de la categoría a la que pertenece la subcategoría")

    model_config = ConfigDict(from_attributes=True)


class SubcategoriaProductoCreateSchema(SubcategoriaProductoBase):
    pass


class SubcategoriaProductoUpdateSchema(BaseModel):
    name: Optional[str] = Field(None, max_length=255, description="Nombre de la subcategoría de producto")
    description: Optional[str] = Field(None, max_length=255, description="Descripción de la subcategoría de producto")
    categoria_id: Optional[int] = Field(None, description="ID de la categoría a la que pertenece la subcategoría")

    model_config = ConfigDict(from_attributes=True)


class SubcategoriaProductoReadSchema(SubcategoriaProductoBase):
    id: int = Field(..., description="ID de la subcategoría de producto")    

    model_config = ConfigDict(from_attributes=True)