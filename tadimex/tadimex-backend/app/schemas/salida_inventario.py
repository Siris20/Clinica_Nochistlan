from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from datetime import datetime, date
from decimal import Decimal
from enum import Enum
from app.models.sql.enums import TipoSalida

class SalidaInventarioBase(BaseModel):
    tipo_salida: TipoSalida = Field(..., description="Tipo de salida de inventario")
    fecha_salida: Optional[date] = Field(None, description="Fecha de salida de la salida")
    numero_documento: Optional[str] = Field(None, description="Número de documento general")

    model_config = ConfigDict(from_attributes=True)