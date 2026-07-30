from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List

class SucursalBase(BaseModel):
    name: str = Field(..., max_length=255, description="Nombre de la sucursal")
    calle: Optional[str] = Field(None, max_length=255, description="Calle de la sucursal")
    numero_exterior: Optional[str] = Field(None, max_length=50, description="Número exterior de la sucursal")
    numero_interior: Optional[str] = Field(None, max_length=50, description="Número interior de la sucursal")
    colonia: Optional[str] = Field(None, max_length=255, description="Colonia de la sucursal")
    localidad: Optional[str] = Field(None, max_length=255, description="Localidad de la sucursal")
    municipio: Optional[str] = Field(None, max_length=255, description="Municipio de la sucursal")
    estado: Optional[str] = Field(None, max_length=100, description="Estado de la sucursal")
    codigo_postal: Optional[str] = Field(None, max_length=5, description="Código postal de la sucursal")
    phone_number: Optional[str] = Field(None, max_length=10, description="Número de teléfono de la sucursal")
    empresa_id: int = Field(..., description="ID de la empresa a la que pertenece la sucursal")
    gerente_id: Optional[int] = Field(None, description="ID del gerente de la sucursal")

    model_config = ConfigDict(from_attributes=True)



class SucursalCreateSchema(SucursalBase):
    pass



class SucursalUpdateSchema(BaseModel):
    name: Optional[str] = Field(None, max_length=255, description="Nombre de la sucursal")
    calle: Optional[str] = Field(None, max_length=255, description="Calle de la sucursal")
    numero_exterior: Optional[str] = Field(None, max_length=50, description="Número exterior de la sucursal")
    numero_interior: Optional[str] = Field(None, max_length=50, description="Número interior de la sucursal")
    colonia: Optional[str] = Field(None, max_length=255, description="Colonia de la sucursal")
    localidad: Optional[str] = Field(None, max_length=255, description="Localidad de la sucursal")
    municipio: Optional[str] = Field(None, max_length=255, description="Municipio de la sucursal")
    estado: Optional[str] = Field(None, max_length=100, description="Estado de la sucursal")
    codigo_postal: Optional[str] = Field(None, max_length=5, description="Código postal de la sucursal")
    phone_number: Optional[int] = Field(None, description="Número de teléfono de la sucursal")
    empresa_id: Optional[int] = Field(None, description="ID de la empresa a la que pertenece la sucursal")
    gerente_id: Optional[int] = Field(None, description="ID del gerente de la sucursal")

    model_config = ConfigDict(from_attributes=True)



class SucursalReadSchema(SucursalBase):
    id: int = Field(..., description="ID de la sucursal")
    empresa_id: int = Field(..., description="ID de la empresa a la que pertenece la sucursal")
    gerente_id: Optional[int] = Field(None, description="ID del gerente de la sucursal")

    
    empresa: Optional["EmpresaRead"] = Field(None, description="Datos de la empresa")
    gerente: Optional["EmpleadoRead"] = Field(None, description="Datos del gerente")
    almacenes: Optional[List["AlmacenRead"]] = Field(None, description="Lista de almacenes de la sucursal")
    empleados: Optional[List["EmpleadoRead"]] = Field(None, description="Lista de empleados de la sucursal")

    model_config = ConfigDict(from_attributes=True)



class EmpresaRead(BaseModel):
    id: int
    name: str

    model_config = ConfigDict(from_attributes=True)


class EmpleadoRead(BaseModel):
    id: int
    name: str

    model_config = ConfigDict(from_attributes=True)


class AlmacenRead(BaseModel):
    id: int
    name: str

    model_config = ConfigDict(from_attributes=True)