from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from datetime import datetime, date
from decimal import Decimal
from enum import Enum
from app.models.sql.enums import TipoEntrada, TipoMovimiento, EstadoMovimiento

class ProductoDevueltoBase(BaseModel):
    producto_id: int = Field(..., description="ID del producto devuelto")
    cantidad: int = Field(..., description="Cantidad devuelta", gt=0)
    motivo_individual: Optional[str] = Field(None, description="Motivo específico de la devolución del producto")
    precio_unitario: Optional[Decimal] = Field(None, description="Precio unitario del producto devuelto")

    model_config = ConfigDict(from_attributes=True)

class DevolucionCreateSchema(BaseModel):
    # Datos del movimiento
    observaciones: Optional[str] = Field(None, description="Observaciones del movimiento")
    empleado_id: int = Field(..., description="ID del empleado que registra la devolución")
    
    # Datos de la entrada
    fecha_recepcion: Optional[date] = Field(None, description="Fecha de recepción")
    numero_documento: Optional[str] = Field(None, description="Número de documento")
    almacen_id: int = Field(..., description="ID del almacén")
    
    # Datos específicos de devolución
    motivo_devolucion: str = Field(..., description="Motivo general de la devolución")
    numero_nota_credito: Optional[str] = Field(None, description="Número de nota de crédito")
    fecha_devolucion: Optional[date] = Field(None, description="Fecha de la devolución")
    cliente_id: Optional[int] = Field(None, description="ID del cliente que devuelve")
    
    # Productos devueltos
    productos_devueltos: List[ProductoDevueltoBase] = Field(..., description="Lista de productos devueltos")

    model_config = ConfigDict(from_attributes=True)

class DevolucionUpdateSchema(BaseModel):
    # Datos del movimiento
    observaciones: Optional[str] = Field(None, description="Observaciones del movimiento")
    
    # Datos de la entrada
    fecha_recepcion: Optional[date] = Field(None, description="Fecha de recepción")
    numero_documento: Optional[str] = Field(None, description="Número de documento")
    
    # Datos específicos de devolución
    motivo_devolucion: Optional[str] = Field(None, description="Motivo general de la devolución")
    numero_nota_credito: Optional[str] = Field(None, description="Número de nota de crédito")
    fecha_devolucion: Optional[date] = Field(None, description="Fecha de la devolución")
    cliente_id: Optional[int] = Field(None, description="ID del cliente que devuelve")
    
    # Productos devueltos
    productos_devueltos: Optional[List[ProductoDevueltoBase]] = Field(None, description="Lista de productos devueltos")

    model_config = ConfigDict(from_attributes=True)

class DevolucionReadSchema(BaseModel):
    id: int = Field(..., description="ID de la devolución")
    
    # Datos del movimiento
    tipo_movimiento: TipoMovimiento = Field(..., description="Tipo de movimiento")
    fecha_movimiento: datetime = Field(..., description="Fecha del movimiento")
    observaciones: Optional[str] = Field(None, description="Observaciones")
    estado: EstadoMovimiento = Field(..., description="Estado del movimiento")
    empleado_id: int = Field(..., description="ID del empleado")
    
    # Datos de la entrada
    tipo_entrada: TipoEntrada = Field(..., description="Tipo de entrada")
    fecha_recepcion: Optional[date] = Field(None, description="Fecha de recepción")
    numero_documento: Optional[str] = Field(None, description="Número de documento")
    almacen_id: int = Field(..., description="ID del almacén")
    
    # Datos específicos de devolución
    motivo_devolucion: str = Field(..., description="Motivo general de la devolución")
    numero_nota_credito: Optional[str] = Field(None, description="Número de nota de crédito")
    fecha_devolucion: date = Field(..., description="Fecha de la devolución")
    cliente_id: Optional[int] = Field(None, description="ID del cliente que devuelve")
    
    # Productos devueltos
    productos_devueltos: List[ProductoDevueltoBase] = Field(..., description="Lista de productos devueltos")
    
    created_at: datetime = Field(..., description="Fecha de creación")
    updated_at: datetime = Field(..., description="Fecha de actualización")

    model_config = ConfigDict(from_attributes=True)