from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List

# Esquema base para Area
class AreaBase(BaseModel):
    name: str = Field(..., max_length=255, description="Nombre del área")
    description: Optional[str] = Field(None, max_length=255, description="Descripción del área")
    empresa_id: int = Field(..., description="ID de la empresa a la que pertenece el área")

    model_config = ConfigDict(from_attributes=True)


# Esquema para crear un área
class AreaCreateSchema(AreaBase):
    pass


# Esquema para actualizar un área
class AreaUpdateSchema(BaseModel):
    name: Optional[str] = Field(None, max_length=255, description="Nombre del área")
    description: Optional[str] = Field(None, max_length=255, description="Descripción del área")
    empresa_id: Optional[int] = Field(None, description="ID de la empresa a la que pertenece el área")

    model_config = ConfigDict(from_attributes=True)


# Esquema para leer un área (incluye relaciones)
class AreaReadSchema(AreaBase):
    id: int = Field(..., description="ID del área")

    # Relaciones
    empresa: Optional["EmpresaRead"] = Field(None, description="Datos de la empresa a la que pertenece el área")
    empleados: Optional[List["EmpleadoRead"]] = Field(None, description="Lista de empleados en el área")

    model_config = ConfigDict(from_attributes=True)


# Esquemas para las relaciones
class EmpresaRead(BaseModel):
    id: int
    name: str

    model_config = ConfigDict(from_attributes=True)


class EmpleadoRead(BaseModel):
    id: int
    name: str

    model_config = ConfigDict(from_attributes=True)


# Resolver referencias circulares (si es necesario)
AreaReadSchema.model_rebuild()