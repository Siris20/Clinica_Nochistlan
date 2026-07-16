from pydantic import BaseModel, Field, ConfigDict, field_validator
from typing import Optional, List
from datetime import datetime
from fastapi import UploadFile
from app.models.sql.enums import UnidadMedida

class ProductoBase(BaseModel):
    name: str = Field(..., max_length=255, description="Nombre del producto")
    model: Optional[str] = Field(None, max_length=100, description="Modelo del producto")
    brand: Optional[str] = Field(None, max_length=100, description="Marca del producto")
    SAT_code: Optional[str] = Field(None, max_length=50, description="Código SAT del producto")
    warranty: Optional[int] = Field(None, description="Garantía del producto en meses")
    description: Optional[str] = Field(None, description="Descripción del producto")
    images: Optional[List[str]] = Field(None, description="Lista de URLs de las imágenes del producto")
    sell_price: Optional[float] = Field(None, description="Precio de venta del producto")
    unidad_medida: Optional[UnidadMedida] = Field(None, description="Unidad de medida del producto")
    @field_validator('unidad_medida', mode='before')
    def handle_empty_unidad_medida(cls, value):
        if value == '' or value is None:
            return None
        return value
    subcategoria_id: Optional[int] = Field(None, description="ID de la subcategoría a la que pertenece el producto")

    model_config = ConfigDict(from_attributes=True)

class ProductoCreateSchema(ProductoBase):
    images: Optional[List[UploadFile]] = Field(None, description="Imágenes del producto para subir")
    pass

class ProductoUpdateSchema(BaseModel):
    name: Optional[str] = Field(None, max_length=255, description="Nombre del producto")
    model: Optional[str] = Field(None, max_length=100, description="Modelo del producto")
    brand: Optional[str] = Field(None, max_length=100, description="Marca del producto")
    SAT_code: Optional[str] = Field(None, max_length=50, description="Código SAT del producto")
    warranty: Optional[int] = Field(None, description="Garantía del producto en meses")
    description: Optional[str] = Field(None, description="Descripción del producto")
    images: Optional[List[str]] = Field(None, description="Lista de URLs de las imágenes del producto")
    sell_price: Optional[float] = Field(None, description="Precio de venta del producto")
    unidad_medida: Optional[UnidadMedida] = Field(None, description="Unidad de medida del producto")
    subcategoria_id: Optional[int] = Field(None, description="ID de la subcategoría a la que pertenece el producto")
    new_files: Optional[List[UploadFile]] = Field(None, description="Nuevas imagenes para el producto")

    model_config = ConfigDict(from_attributes=True)

class ProductoReadSchema(ProductoBase):
    id: int = Field(..., description="ID del producto")
    created_at: datetime = Field(..., description="Fecha de creación del producto")
    updated_at: datetime = Field(..., description="Fecha de última actualización del producto")
    subcategoria: Optional["SubcategoriaProductoReadSchema"] = Field(None, description="Datos de la subcategoría")
    

    model_config = ConfigDict(from_attributes=True)

class SubcategoriaProductoReadSchema(BaseModel):
    id: int = Field(..., description="ID de la subcategoría de producto")
    name: str = Field(..., description="Nombre de la subcategoría de producto")
    description: Optional[str] = Field(None, description="Descripción de la subcategoría de producto")
    categoria_id: int = Field(..., description="ID de la categoría a la que pertenece la subcategoría")

    model_config = ConfigDict(from_attributes=True)

class InventarioReadSchema(BaseModel):
    id: int = Field(..., description="ID del inventario")
    cantidad: int = Field(..., description="Cantidad de productos en inventario")
    producto_id: int = Field(..., description="ID del producto en inventario")

    model_config = ConfigDict(from_attributes=True)
