from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from datetime import datetime, date

class CotizacionBase(BaseModel):
    emisor_id: int = Field(..., description="ID del emisor de la cotización")
    cliente_id: int = Field(..., description="ID del cliente de la cotización")
    logo_id: Optional[int] = Field(None, description="ID del logo asociado a la cotización")
    descuento_general: float = Field(0.0, description="Descuento general aplicado a la cotización")
    gastos_envio: float = Field(0.0, description="Gastos de envío de la cotización")
    observaciones: Optional[str] = Field(None, description="Observaciones de la cotización")
    condiciones_venta: Optional[str] = Field(None, description="Condiciones de venta de la cotización")
    fecha_vencimiento: Optional[date] = Field(None, description="Fecha de vencimiento de la cotización")

    model_config = ConfigDict(from_attributes=True)

class CotizacionCreateSchema(CotizacionBase):
    pass

class CotizacionUpdateSchema(BaseModel):
    emisor_id: Optional[int] = Field(None, description="ID del emisor de la cotización")
    cliente_id: Optional[int] = Field(None, description="ID del cliente de la cotización")
    logo_id: Optional[int] = Field(None, description="ID del logo asociado a la cotización")
    descuento_general: Optional[float] = Field(None, description="Descuento general aplicado a la cotización")
    gastos_envio: Optional[float] = Field(None, description="Gastos de envío de la cotización")
    observaciones: Optional[str] = Field(None, description="Observaciones de la cotización")
    condiciones_venta: Optional[str] = Field(None, description="Condiciones de venta de la cotización")
    fecha_vencimiento: Optional[date] = Field(None, description="Fecha de vencimiento de la cotización")

    model_config = ConfigDict(from_attributes=True)

class ProductoCotizadoBase(BaseModel):
    producto_id: int = Field(..., description="ID del producto")
    cantidad: int = Field(1, description="Cantidad del producto cotizado")
    descuento: float = Field(0.0, description="Descuento aplicado al producto cotizado")
    concepto: str = Field(..., description="Concepto del producto cotizado")
    precio_unitario: float = Field(..., description="Precio unitario del producto cotizado")

    model_config = ConfigDict(from_attributes=True)

class ProductoCotizadoCreateSchema(ProductoCotizadoBase):
    pass

class ProductoCotizadoUpdateSchema(ProductoCotizadoBase):
    pass

class CotizacionReadSchema(CotizacionBase):
    id: int = Field(..., description="ID de la cotización")
    folio: Optional[str] = Field(None, description="Folio de la cotización")
    subtotal: float = Field(..., description="Subtotal, sin tomar en cuenta IVA")
    iva: float = Field(..., description="IVA de la cotización")
    isr_ret: float = Field(..., description="Retencion de ISR de la cotizacion")
    total: float = Field(..., description="Total de la cotización")
    created_at: datetime = Field(..., description="Fecha de creación de la cotización")
    updated_at: datetime = Field(..., description="Fecha de última actualización de la cotización")
    productos_cotizados: List[ProductoCotizadoBase] = Field(..., description="Lista de productos cotizados")
    fecha_vencimiento: Optional[date] = Field(None, description="Fecha de vencimiento de la cotización")

    model_config = ConfigDict(from_attributes=True)