from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from datetime import datetime, date
from decimal import Decimal
from enum import Enum
from app.models.sql.enums import TipoMovimiento

class MovimientoInventarioBase(BaseModel):
    tipo_movimiento: TipoMovimiento = Field(..., description="Tipo de movimiento de inventario")
    observaciones: Optional[str] = Field(None, description="Observaciones del movimiento")
    empleado_id: int = Field(..., description="ID del empleado que registra el movimiento")

    model_config = ConfigDict(from_attributes=True)