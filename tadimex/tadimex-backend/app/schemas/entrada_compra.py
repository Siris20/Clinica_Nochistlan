# app/schemas/entrada_compra.py (añadir o adaptar)

from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from datetime import date
from decimal import Decimal
from app.models.sql.enums import MetodoPago, EstadoMovimiento, TipoMovimiento
from datetime import datetime
from app.models.sql.enums import TipoEntrada

class ProductoCompradoCreateSchema(BaseModel):
    producto_id: int = Field(..., description="ID del producto comprado")
    cantidad: int = Field(..., description="Cantidad comprada", gt=0)
    precio_unitario: Decimal = Field(..., description="Precio unitario reportado por el usuario")
    incluye_iva: bool = Field(..., description="¿El precio ya incluye IVA?")
    # Puedes agregar más campos si lo necesitas

    model_config = ConfigDict(from_attributes=True)

class CompraInventarioCreateSchema(BaseModel):
    # Movimiento
    empleado_id: int = Field(..., description="ID del empleado que registra la compra")
    tipo_movimiento: TipoMovimiento = Field(..., description="Tipo de movimiento")
    observaciones: Optional[str] = Field(None, description="Observaciones del movimiento")
    estado: EstadoMovimiento = Field(..., description="Estado del movimiento")

    # Entrada de inventario
    almacen_id: int = Field(..., description="ID del almacén")
    fecha_recepcion: Optional[date] = Field(None, description="Fecha de recepción")

    # Compra
    numero_factura: Optional[str] = Field(None, description="Número de factura")
    fecha_factura: Optional[date] = Field(None, description="Fecha de factura")
    fecha_pago: Optional[date] = Field(None, description="Fecha de pago")
    metodo_pago: Optional[MetodoPago] = Field(None, description="Método de pago")
    costo_envio: Optional[Decimal] = Field(Decimal("0.00"), description="Costo de envío")
    proveedor_id: Optional[int] = Field(None, description="ID del proveedor")

    # Productos
    productos_comprados: List[ProductoCompradoCreateSchema] = Field(..., description="Lista de productos comprados")

    model_config = ConfigDict(from_attributes=True)

class ProductoCompradoReadSchema(BaseModel):
    producto_id: int
    cantidad: int
    costo_unitario: Decimal
    importe: Decimal
    # Campos originales para reconstruir los datos
    precio_unitario_original: Decimal
    incluye_iva_original: bool
    # Puedes agregar más campos si los tienes en el modelo
    class Config:
        orm_mode = True

class CompraReadSchema(BaseModel):
    id: int
    # Movimiento
    tipo_movimiento: TipoMovimiento
    fecha_movimiento: datetime
    observaciones: Optional[str]
    estado: EstadoMovimiento
    empleado_id: int
    # Entrada
    tipo_entrada: TipoEntrada
    fecha_recepcion: Optional[date]
    almacen_id: int
    # Compra
    numero_factura: Optional[str]
    fecha_factura: Optional[date]
    fecha_pago: Optional[date]
    metodo_pago: Optional[MetodoPago]
    costo_envio: Optional[Decimal]
    proveedor_id: Optional[int]
    # Productos
    productos_comprados: List[ProductoCompradoReadSchema]
    # Total (obligatorio, suma de importes)
    total: Decimal
    # Timestamps
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        orm_mode = True



class CompraInventarioUpdateSchema(BaseModel):
    empleado_id: Optional[int] = None
    tipo_movimiento: Optional[TipoMovimiento] = None
    observaciones: Optional[str] = None
    estado: Optional[EstadoMovimiento] = None
    almacen_id: Optional[int] = None
    fecha_recepcion: Optional[date] = None
    numero_factura: Optional[str] = None
    fecha_factura: Optional[date] = None
    fecha_pago: Optional[date] = None
    metodo_pago: Optional[MetodoPago] = None
    costo_envio: Optional[Decimal] = None
    proveedor_id: Optional[int] = None
    # productos_comprados se maneja como parámetro separado en el endpoint