from pydantic import BaseModel, Field, ConfigDict
from typing import Optional

class EspecialistaBaseSchema(BaseModel):
    empleado_id: int = Field(..., description="ID del empleado asociado")
    cedula_profesional: str = Field(..., max_length=50, description="Cédula profesional única del especialista")
    especialidad: str = Field(..., max_length=100, description="Área de especialidad médica")
    universidad_egreso: Optional[str] = Field(None, max_length=150, description="Universidad de egreso")

    model_config = ConfigDict(from_attributes=True)

class EspecialistaCreateSchema(EspecialistaBaseSchema):
    pass

class EspecialistaUpdateSchema(BaseModel):
    empleado_id: Optional[int] = Field(None, description="ID del empleado asociado")
    cedula_profesional: Optional[str] = Field(None, max_length=50, description="Cédula profesional")
    especialidad: Optional[str] = Field(None, max_length=100, description="Área de especialidad médica")
    universidad_egreso: Optional[str] = Field(None, max_length=150, description="Universidad de egreso")

    model_config = ConfigDict(from_attributes=True)

class EspecialistaReadSchema(EspecialistaBaseSchema):
    id: int = Field(..., description="ID del especialista")

    model_config = ConfigDict(from_attributes=True)