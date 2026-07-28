from pydantic import BaseModel
from typing import Optional
from app.models.sql.enums import TipoAlmacen
from datetime import datetime
from app.schemas.empleado import EmpleadoResponseSchema


class AlmacenBaseSchema(BaseModel):
    name: str
    calle: Optional[str] = None
    numero_exterior: Optional[str] = None
    numero_interior: Optional[str] = None
    colonia: Optional[str] = None
    localidad: Optional[str] = None
    municipio: Optional[str] = None
    estado: Optional[str] = None
    codigo_postal: Optional[str] = None
    type: Optional[TipoAlmacen] = None
    sucursal_id: int
    encargado_id: Optional[int] = None

class AlmacenCreateSchema(AlmacenBaseSchema):
    pass

class AlmacenUpdateSchema(BaseModel):
    name: Optional[str] = None
    calle: Optional[str] = None
    numero_exterior: Optional[str] = None
    numero_interior: Optional[str] = None
    colonia: Optional[str] = None
    localidad: Optional[str] = None
    municipio: Optional[str] = None
    estado: Optional[str] = None
    codigo_postal: Optional[str] = None
    type: Optional[TipoAlmacen] = None
    sucursal_id: Optional[int] = None
    encargado_id: Optional[int] = None



class AlmacenResponseSchema(AlmacenBaseSchema):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True  


class AlmacenWithRelationsSchema(AlmacenResponseSchema):
    encargado: Optional[EmpleadoResponseSchema] = None