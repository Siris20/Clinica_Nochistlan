from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel
from typing import Dict, List, Optional

class InventarioActualSchema(BaseModel):
    id: int
    cantidad_actual: int
    costo_promedio: Optional[Decimal]
    fecha_ultima_entrada: Optional[datetime]
    fecha_ultima_salida: Optional[datetime]
    fecha_ultima_actualizacion: datetime
    producto_id: int
    almacen_id: int
    
    class Config:
        from_attributes = True

class InventarioPorAlmacenSchema(BaseModel):
    almacen_id: int
    almacen_nombre: str
    cantidad: int
    costo_promedio: Optional[Decimal]
    producto_id: int
    producto_nombre: str
    
    @classmethod
    def from_orm(cls, obj):
        return cls(
            almacen_id=obj.almacen_id,
            almacen_nombre=obj.almacen.nombre if obj.almacen else "Desconocido",
            cantidad=obj.cantidad_actual,
            costo_promedio=obj.costo_promedio,
            producto_id=obj.producto_id,
            producto_nombre=obj.producto.nombre if obj.producto else "Desconocido"
        )

class ResumenInventarioSchema(BaseModel):
    total_productos: int
    total_valor: Decimal
    productos_diferentes: int
    almacenes_diferentes: int
    productos_bajo_stock: int

class ValorInventarioSchema(BaseModel):
    valor_total: Decimal
    valor_por_almacen: Dict[str, Decimal]

class InventarioProductoSchema(BaseModel):
    producto_id: int
    producto_nombre: str
    cantidad_actual: int
    costo_promedio: Optional[Decimal]
    almacen_id: int
    almacen_nombre: str
    
    @classmethod
    def from_orm(cls, obj):
        return cls(
            producto_id=obj.producto_id,
            producto_nombre=obj.producto.nombre if obj.producto else "Desconocido",
            cantidad_actual=obj.cantidad_actual,
            costo_promedio=obj.costo_promedio,
            almacen_id=obj.almacen_id,
            almacen_nombre=obj.almacen.nombre if obj.almacen else "Desconocido"
        )