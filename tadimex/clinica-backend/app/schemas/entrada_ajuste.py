from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from datetime import datetime, date
from decimal import Decimal
from enum import Enum
from app.models.sql.enums import MetodoPago, TipoMovimiento, TipoEntrada, EstadoMovimiento

class ProductoAjustadoBase(BaseModel):
    producto_id: int = Field(..., description="ID del producto ajustado")
    cantidad_ajuste: int = Field(..., description="Cantidad de ajuste (positiva o negativa)")
    motivo_individual: Optional[str] = Field(None, description="Motivo específico del ajuste del producto")

    model_config = ConfigDict(from_attributes=True)

class AjusteCreateSchema(BaseModel):
    # Datos del movimiento
    observaciones: Optional[str] = Field(None, description="Observaciones del movimiento")
    empleado_id: int = Field(..., description="ID del empleado que registra el ajuste")
    
    # Datos de la entrada
    fecha_recepcion: Optional[date] = Field(None, description="Fecha del ajuste")
    numero_documento: Optional[str] = Field(None, description="Número de documento")
    almacen_id: int = Field(..., description="ID del almacén")
    
    # Datos específicos de ajuste
    motivo_ajuste: str = Field(..., description="Motivo general del ajuste")
    numero_acta: Optional[str] = Field(None, description="Número de acta de ajuste")
    empleado_autoriza_id: Optional[int] = Field(None, description="ID del empleado que autoriza")
    
    # Productos ajustados
    productos_ajustados: List[ProductoAjustadoBase] = Field(..., description="Lista de productos ajustados")

    model_config = ConfigDict(from_attributes=True)

class AjusteUpdateSchema(BaseModel):
    # Datos del movimiento
    observaciones: Optional[str] = Field(None, description="Observaciones del movimiento")
    
    # Datos de la entrada
    fecha_recepcion: Optional[date] = Field(None, description="Fecha del ajuste")
    numero_documento: Optional[str] = Field(None, description="Número de documento")
    
    # Datos específicos de ajuste
    motivo_ajuste: Optional[str] = Field(None, description="Motivo general del ajuste")
    numero_acta: Optional[str] = Field(None, description="Número de acta de ajuste")
    empleado_autoriza_id: Optional[int] = Field(None, description="ID del empleado que autoriza")
    
    # Productos ajustados
    productos_ajustados: Optional[List[ProductoAjustadoBase]] = Field(None, description="Lista de productos ajustados")

    model_config = ConfigDict(from_attributes=True)

class AjusteReadSchema(BaseModel):
    id: int = Field(..., description="ID del ajuste")
    
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
    
    # Datos específicos de ajuste
    motivo_ajuste: str = Field(..., description="Motivo general del ajuste")
    numero_acta: Optional[str] = Field(None, description="Número de acta de ajuste")
    empleado_autoriza_id: Optional[int] = Field(None, description="ID del empleado que autoriza")
    
    # Productos ajustados
    productos_ajustados: List[ProductoAjustadoBase] = Field(..., description="Lista de productos ajustados")
    
    created_at: datetime = Field(..., description="Fecha de creación")
    updated_at: datetime = Field(..., description="Fecha de actualización")

    model_config = ConfigDict(from_attributes=True)