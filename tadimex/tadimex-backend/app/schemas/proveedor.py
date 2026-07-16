from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List

# Esquema base para Proveedor
class ProveedorBase(BaseModel):
    nombre: str = Field(..., max_length=255, description="Nombre del proveedor")
    telefono: Optional[str] = Field(None, max_length=15, description="Número de teléfono del proveedor")
    email: Optional[str] = Field(None, max_length=255, description="Correo electrónico del proveedor")
    active: bool = Field(True, description="Estado activo del proveedor")
    calle: Optional[str] = Field(None, max_length=255, description="Calle del domicilio")
    numero_exterior: Optional[str] = Field(None, max_length=50, description="Número exterior del domicilio")
    numero_interior: Optional[str] = Field(None, max_length=50, description="Número interior del domicilio")
    colonia: Optional[str] = Field(None, max_length=255, description="Colonia del domicilio")
    localidad: Optional[str] = Field(None, max_length=255, description="Localidad del domicilio")
    municipio: Optional[str] = Field(None, max_length=255, description="Municipio del domicilio")
    estado: Optional[str] = Field(None, max_length=100, description="Estado del domicilio")
    codigo_postal: Optional[str] = Field(None, max_length=5, description="Código postal del domicilio")
    observaciones: Optional[str] = Field(None, max_length=200, description="Observaciones del proveedor")
    empresa_id: int = Field(..., description="ID de la empresa a la que pertenece el proveedor")

    model_config = ConfigDict(from_attributes=True)

# Esquema para crear un proveedor
class ProveedorCreateSchema(ProveedorBase):
    pass

# Esquema para actualizar un proveedor
class ProveedorUpdateSchema(BaseModel):
    nombre: Optional[str] = Field(None, max_length=255, description="Nombre del proveedor")
    telefono: Optional[str] = Field(None, max_length=15, description="Número de teléfono del proveedor")
    email: Optional[str] = Field(None, max_length=255, description="Correo electrónico del proveedor")
    active: Optional[bool] = Field(None, description="Estado activo del proveedor")
    calle: Optional[str] = Field(None, max_length=255, description="Calle del domicilio")
    numero_exterior: Optional[str] = Field(None, max_length=50, description="Número exterior del domicilio")
    numero_interior: Optional[str] = Field(None, max_length=50, description="Número interior del domicilio")
    colonia: Optional[str] = Field(None, max_length=255, description="Colonia del domicilio")
    localidad: Optional[str] = Field(None, max_length=255, description="Localidad del domicilio")
    municipio: Optional[str] = Field(None, max_length=255, description="Municipio del domicilio")
    estado: Optional[str] = Field(None, max_length=100, description="Estado del domicilio")
    codigo_postal: Optional[str] = Field(None, max_length=5, description="Código postal del domicilio")
    observaciones: Optional[str] = Field(None, max_length=200, description="Observaciones del proveedor")
    empresa_id: Optional[int] = Field(None, description="ID de la empresa a la que pertenece el proveedor")

    model_config = ConfigDict(from_attributes=True)

# Esquema simplificado para listas de proveedores
class ProveedorListSchema(BaseModel):
    id: int = Field(..., description="ID del proveedor")
    nombre: str = Field(..., description="Nombre del proveedor")
    telefono: Optional[str] = Field(None, description="Número de teléfono del proveedor")
    email: Optional[str] = Field(None, description="Correo electrónico del proveedor")
    active: bool = Field(..., description="Estado activo del proveedor")
    empresa_id: int = Field(..., description="ID de la empresa")

    model_config = ConfigDict(from_attributes=True)

# Esquema para leer un proveedor
class ProveedorReadSchema(ProveedorBase):
    id: int = Field(..., description="ID del proveedor")
    empresa_id: int = Field(..., description="ID de la empresa a la que pertenece el proveedor")

    # Relaciones
    empresa: Optional["EmpresaRead"] = Field(None, description="Datos de la empresa")
    entradas_compra: Optional[List["EntradaCompraRead"]] = Field(None, description="Lista de entradas de compra del proveedor")

    model_config = ConfigDict(from_attributes=True)

# Esquemas para relaciones
class EmpresaRead(BaseModel):
    id: int = Field(..., description="ID de la empresa")
    name: str = Field(..., description="Nombre de la empresa")

    model_config = ConfigDict(from_attributes=True)

class EntradaCompraRead(BaseModel):
    id: int = Field(..., description="ID de la entrada de compra")

    model_config = ConfigDict(from_attributes=True) 