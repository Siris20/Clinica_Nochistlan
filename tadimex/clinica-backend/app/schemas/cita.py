from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, model_validator, ConfigDict
from app.models.sql.cita import EstadoCita

# --- SCHEMAS AUXILIARES PARA LECTURA (GET) ---

class ClienteSencilloSchema(BaseModel):
    id: int
    nombre_fiscal: str
    phone_number: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class AreaSencillaSchema(BaseModel):
    id: int
    name: str

    model_config = ConfigDict(from_attributes=True)


class SucursalSencillaSchema(BaseModel):
    id: int
    name: str

    model_config = ConfigDict(from_attributes=True)


class EspecialistaSencilloSchema(BaseModel):
    id: int
    cedula_profesional: str
    especialidad: str

    model_config = ConfigDict(from_attributes=True)


# --- SCHEMAS PRINCIPALES DE CITA ---

class CitaBase(BaseModel):
    """Schema de Entrada para POST/PUT (solo recibe IDs planos)"""
    cliente_id: int
    area_id: int
    sucursal_id: int
    especialista_id: int = Field(..., description="ID del especialista asociado")
    fecha_inicio: datetime = Field(..., description="Fecha y hora de inicio")
    fecha_fin: datetime = Field(..., description="Fecha y hora de fin")
    motivo: Optional[str] = None
    observaciones: Optional[str] = None

    @model_validator(mode="before")
    @classmethod
    def normalizar_fechas_sin_tz(cls, data):
        """Remueve la información de zona horaria (UTC/Zulu) para evitar corrimientos de hora."""
        if isinstance(data, dict):
            for field in ["fecha_inicio", "fecha_fin"]:
                if field in data and isinstance(data[field], str):
                    val = data[field].replace("Z", "")
                    try:
                        dt = datetime.fromisoformat(val)
                        data[field] = dt.replace(tzinfo=None)
                    except ValueError:
                        pass
        return data


class CitaCreateSchema(CitaBase):
    @model_validator(mode="after")
    def verificar_fechas(self) -> "CitaCreateSchema":
        if self.fecha_fin <= self.fecha_inicio:
            raise ValueError("La fecha de fin debe ser posterior a la fecha de inicio.")
        return self


class CitaUpdateSchema(BaseModel):
    cliente_id: Optional[int] = None
    area_id: Optional[int] = None
    sucursal_id: Optional[int] = None
    especialista_id: Optional[int] = None  
    fecha_inicio: Optional[datetime] = None
    fecha_fin: Optional[datetime] = None
    motivo: Optional[str] = None
    estado: Optional[EstadoCita] = None
    observaciones: Optional[str] = None

    @model_validator(mode="before")
    @classmethod
    def normalizar_fechas_update_sin_tz(cls, data):
        if isinstance(data, dict):
            for field in ["fecha_inicio", "fecha_fin"]:
                if field in data and isinstance(data[field], str):
                    val = data[field].replace("Z", "")
                    try:
                        dt = datetime.fromisoformat(val)
                        data[field] = dt.replace(tzinfo=None)
                    except ValueError:
                        pass
        return data

    @model_validator(mode="after")
    def verificar_fechas_update(self) -> "CitaUpdateSchema":
        if self.fecha_inicio and self.fecha_fin:
            if self.fecha_fin <= self.fecha_inicio:
                raise ValueError("La fecha de fin debe ser posterior a la fecha de inicio.")
        return self


class CitaReadSchema(BaseModel):
    """Schema de Salida (Respuesta API con entidades anidadas)"""
    id: int
    fecha_inicio: datetime
    fecha_fin: datetime
    motivo: Optional[str] = None
    estado: EstadoCita
    observaciones: Optional[str] = None
    
    cliente: ClienteSencilloSchema
    area: AreaSencillaSchema
    sucursal: SucursalSencillaSchema
    especialista: EspecialistaSencilloSchema  

    model_config = ConfigDict(from_attributes=True)