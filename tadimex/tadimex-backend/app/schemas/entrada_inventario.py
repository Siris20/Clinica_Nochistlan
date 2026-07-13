from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from datetime import datetime, date
from decimal import Decimal
from enum import Enum
from app.models.sql.enums import TipoEntrada

class EntradaInventarioBase(BaseModel):
    tipo_entrada: TipoEntrada = Field(..., description="Tipo de entrada de inventario")
    fecha_recepcion: Optional[date] = Field(None, description="Fecha de recepción de la entrada")
    numero_documento: Optional[str] = Field(None, description="Número de documento general")
    almacen_id: int = Field(..., description="ID del almacén donde se registra la entrada")

    model_config = ConfigDict(from_attributes=True)