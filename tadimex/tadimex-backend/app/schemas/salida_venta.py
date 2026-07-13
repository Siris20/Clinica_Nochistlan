
from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from datetime import date
from decimal import Decimal
from app.models.sql.enums import MetodoPago, EstadoMovimiento, TipoMovimiento
from datetime import datetime
from app.models.sql.enums import TipoSalida

class ProductoVendidoCreateSchema(BaseModel):
    producto_id: int = Field(..., description="ID del producto vendido")
    cantidad: int = Field(..., description="Cantidad vendida", gt=0)
    costo_unitario: Decimal = Field(..., description="Precio total (con IVA si aplica)")
    precio_unitario_original: Decimal = Field(..., description="Precio base sin IVA")
    incluye_iva_original: bool = Field(..., description="Indica si el precio incluye IVA")
    almacen_id: int = Field(..., description="ID del almacén de donde se vendió el producto")

    model_config = ConfigDict(from_attributes=True)

class VentaInventarioCreateSchema(BaseModel):
    # Movimiento
    empleado_id: int = Field(..., description="ID del empleado que registra la venta")
    tipo_movimiento: TipoMovimiento = Field(..., description="Tipo de movimiento")
    observaciones: Optional[str] = Field(None, description="Observaciones del movimiento")
    estado: EstadoMovimiento = Field(..., description="Estado del movimiento")

    # Salida de inventario
    fecha_salida: Optional[date] = Field(None, description="Fecha de salida")

    # Venta
    numero_factura: Optional[str] = Field(None, description="Número de factura")
    fecha_factura: Optional[date] = Field(None, description="Fecha de factura")
    fecha_pago: Optional[date] = Field(None, description="Fecha de pago")
    metodo_pago: Optional[MetodoPago] = Field(None, description="Método de pago")
    costo_envio: Optional[Decimal] = Field(Decimal("0.00"), description="Costo de envío")
    cliente_id: Optional[int] = Field(None, description="ID del cliente")
    cotizacion_id: Optional[int] = Field(None, description="ID de la cotización")

    # Productos
    productos_vendidos: List[ProductoVendidoCreateSchema] = Field(..., description="Lista de productos vendidos")

    model_config = ConfigDict(from_attributes=True)

class ProductoVendidoReadSchema(BaseModel):
    producto_id: int
    cantidad: int
    costo_unitario: Decimal  # Precio total (con IVA si aplica)
    precio_unitario_original: Decimal  # Precio base sin IVA
    include_tax: bool  # Indica si el precio incluye IVA
    almacen_id: int
    importe: Decimal  # cantidad * costo_unitario
    # Nuevos campos para utilidad
    precio_compra_unitario: Optional[Decimal] = None  # Precio promedio de compra del inventario
    utilidad_unitaria: Optional[Decimal] = None  # costo_unitario - precio_compra_unitario
    utilidad_total: Optional[Decimal] = None  # utilidad_unitaria * cantidad
    margen_porcentaje: Optional[Decimal] = None  # (utilidad_unitaria / precio_compra_unitario) * 100
    
    model_config = ConfigDict(from_attributes=True)

class VentaReadSchema(BaseModel):
    id: int
    # Movimiento
    tipo_movimiento: TipoMovimiento
    fecha_movimiento: datetime
    observaciones: Optional[str]
    estado: EstadoMovimiento
    empleado_id: int
    # Salida
    tipo_salida: TipoSalida
    fecha_salida: Optional[date]
    # Venta
    numero_factura: Optional[str]
    fecha_factura: Optional[date]
    fecha_pago: Optional[date]
    metodo_pago: Optional[MetodoPago]
    costo_envio: Optional[Decimal]
    cliente_id: Optional[int]
    cotizacion_id: Optional[int]
    # Productos
    productos_vendidos: List[ProductoVendidoReadSchema]
    # Total (obligatorio, suma de importes)
    total: Decimal
    # Timestamps
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        orm_mode = True



class VentaInventarioUpdateSchema(BaseModel):
    empleado_id: Optional[int] = None
    tipo_movimiento: Optional[TipoMovimiento] = None
    observaciones: Optional[str] = None
    estado: Optional[EstadoMovimiento] = None
    fecha_salida: Optional[date] = None
    numero_factura: Optional[str] = None
    fecha_factura: Optional[date] = None
    fecha_pago: Optional[date] = None
    metodo_pago: Optional[MetodoPago] = None
    costo_envio: Optional[Decimal] = None
    cliente_id: Optional[int] = None
    cotizacion_id: Optional[int] = None
    # productos_vendidos se maneja como parámetro separado en el endpoint