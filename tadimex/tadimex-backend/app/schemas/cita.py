from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, model_validator
from app.models.sql.cita import EstadoCita

# --- SCHEMAS AUXILIARES PARA RETORNAR INFORMACIÓN DETALLADA ---
# Estos schemas evitan importar los schemas completos de Cliente o Sucursal
# previniendo dependencias circulares y enviando solo lo necesario al Calendario.

class ClienteSencilloSchema(BaseModel):
    id: int
    nombre_fiscal: str
    phone_number: Optional[str] = None

    class Config:
        from_attributes = True


class AreaSencillaSchema(BaseModel):
    id: int
    name: str

    class Config:
        from_attributes = True


class SucursalSencillaSchema(BaseModel):
    id: int
    name: str

    class Config:
        from_attributes = True


# --- SCHEMAS PRINCIPALES DE CITA ---

class CitaBase(BaseModel):
    cliente_id: int
    area_id: int
    sucursal_id: int
    fecha_inicio: datetime = Field(..., description="Fecha y hora de inicio de la cita")
    fecha_fin: datetime = Field(..., description="Fecha y hora de fin de la cita")
    motivo: Optional[str] = None
    observaciones: Optional[str] = None


class CitaCreateSchema(CitaBase):
    pass

    @model_validator(mode="after")
    def verificar_fechas(self) -> "CitaCreateSchema":
        if self.fecha_fin <= self.fecha_inicio:
            raise ValueError("La fecha de fin debe ser posterior a la fecha de inicio.")
        return self


class CitaUpdateSchema(BaseModel):
    cliente_id: Optional[int] = None
    area_id: Optional[int] = None
    sucursal_id: Optional[int] = None
    fecha_inicio: Optional[datetime] = None
    fecha_fin: Optional[datetime] = None
    motivo: Optional[str] = None
    estado: Optional[EstadoCita] = None
    observaciones: Optional[str] = None

    @model_validator(mode="after")
    def verificar_fechas_update(self) -> "CitaUpdateSchema":
        if self.fecha_inicio and self.fecha_fin:
            if self.fecha_fin <= self.fecha_inicio:
                raise ValueError("La fecha de fin debe ser posterior a la fecha de inicio.")
        return self


class CitaReadSchema(BaseModel):
    id: int
    fecha_inicio: datetime
    fecha_fin: datetime
    motivo: Optional[str] = None
    estado: EstadoCita
    observaciones: Optional[str] = None
    
    # Estas relaciones permiten que el Frontend pinte directamente en el calendario 
    # el nombre del cliente y del área sin tener que hacer peticiones extras.
    # NO incluimos cliente_id, area_id, sucursal_id para evitar conflictos de serialización
    cliente: ClienteSencilloSchema
    area: AreaSencillaSchema
    sucursal: SucursalSencillaSchema

    class Config:
        from_attributes = True  # Reemplaza a 'orm_mode = True' en Pydantic v2