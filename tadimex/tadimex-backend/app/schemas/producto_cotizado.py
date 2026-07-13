from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from datetime import datetime

class ProductoCotizadoBase(BaseModel):
    producto_id: int = Field(..., description="ID del producto asociado")
    cantidad: int = Field(1, description="Cantidad del producto cotizado")
    descuento: float = Field(0.0, description="Descuento aplicado al producto cotizado")
    concepto: str = Field(None, description="Concepto del producto cotizado")
    precio_unitario: float = Field(None, description="Precio unitario del producto cotizado")

    model_config = ConfigDict(from_attributes=True)

class ProductoCotizadoCreateSchema(ProductoCotizadoBase):
    pass

class ProductoCotizadoUpdateSchema(BaseModel):
    producto_id: Optional[int] = Field(None, description="ID del producto asociado")
    cantidad: Optional[int] = Field(None, description="Cantidad del producto cotizado")
    descuento: Optional[float] = Field(None, description="Descuento aplicado al producto cotizado")
    concepto: Optional[str] = Field(None, description="Concepto del producto cotizado")
    precio_unitario: Optional[float] = Field(None, description="Precio unitario del producto cotizado")

    model_config = ConfigDict(from_attributes=True)



class ProductoCotizadoReadSchema(ProductoCotizadoBase):
    created_at: datetime = Field(..., description="Fecha de creación del producto cotizado")
    updated_at: datetime = Field(..., description="Fecha de última actualización del producto cotizado")
    cotizacion: Optional["CotizacionReadSchema"] = Field(None, description="Datos de la cotización asociada")
    producto: Optional["ProductoReadSchema"] = Field(None, description="Datos del producto asociado")

    model_config = ConfigDict(from_attributes=True)

class CotizacionReadSchema(BaseModel):
    id: int = Field(..., description="ID de la cotización")
    emisor_id: int = Field(..., description="ID del emisor de la cotización")
    cliente_id: int = Field(..., description="ID del cliente de la cotización")
    logo_id: Optional[int] = Field(None, description="ID del logo asociado a la cotización")
    subtotal: float = Field(..., description="Subtotal de la cotización")
    iva: float = Field(..., description="IVA de la cotización")
    productos_cotizados: List[ProductoCotizadoReadSchema] = Field(..., description="Lista de productos cotizados con sus cantidades y descuentos")
    descuento_general: float = Field(..., description="Descuento general aplicado a la cotización")
    gastos_envio: float = Field(..., description="Gastos de envío de la cotización")
    total: float = Field(..., description="Total de la cotización")
    observaciones: Optional[str] = Field(None, description="Observaciones de la cotización")
    condiciones_venta: Optional[str] = Field(None, description="Condiciones de venta de la cotización")
    created_at: datetime = Field(..., description="Fecha de creación de la cotización")
    updated_at: datetime = Field(..., description="Fecha de última actualización de la cotización")

    model_config = ConfigDict(from_attributes=True)

class ProductoReadSchema(BaseModel):
    id: int = Field(..., description="ID del producto")
    name: str = Field(..., description="Nombre del producto")
    model: Optional[str] = Field(None, description="Modelo del producto")
    brand: Optional[str] = Field(None, description="Marca del producto")
    SAT_code: Optional[str] = Field(None, description="Código SAT del producto")
    warranty: Optional[int] = Field(None, description="Garantía del producto en meses")
    description: Optional[str] = Field(None, description="Descripción del producto")
    sell_price: Optional[float] = Field(None, description="Precio de venta del producto")
    rent_price: Optional[float] = Field(None, description="Precio de renta del producto")
    created_at: datetime = Field(..., description="Fecha de creación del producto")
    updated_at: datetime = Field(..., description="Fecha de última actualización del producto")

    model_config = ConfigDict(from_attributes=True)