from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from datetime import datetime, date
from decimal import Decimal
from enum import Enum
from app.models.sql.enums import MetodoPago

class ProductoCompradoBase(BaseModel):
    producto_id: int = Field(..., description="ID del producto comprado")
    cantidad: int = Field(..., description="Cantidad comprada", gt=0)
    costo_unitario: Decimal = Field(..., description="Costo unitario del producto")
    descuento: Optional[Decimal] = Field(Decimal("0.00"), description="Descuento unitario aplicado")
    impuesto_unitario: Optional[Decimal] = Field(Decimal("0.00"), description="Impuesto unitario aplicado")

    model_config = ConfigDict(from_attributes=True)