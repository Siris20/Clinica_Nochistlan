from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from fastapi import Form
from app.models.sql.enums import TipoPersona, RegimenFiscal, EstadoCliente

# Esquema base para Cliente
class ClienteBase(BaseModel):
    nombre_fiscal: str = Form(..., description="Nombre fiscal del cliente")
    tipo_persona: TipoPersona = Form(..., description="Tipo de persona (Física o Moral)")
    regimen_fiscal: RegimenFiscal = Form(..., description="Régimen fiscal del cliente")
    rfc: str = Form(..., max_length=13, description="RFC del cliente")
    contact_name: Optional[str] = Form(None, max_length=255, description="Nombre del contacto")
    alias: Optional[str] = Form(None, max_length=100, description="Alias del cliente")
    land_line: Optional[str] = Form(None, max_length=15, description="Número de teléfono fijo")
    phone_number: Optional[str] = Form(None, max_length=15, description="Número de teléfono móvil")
    email: Optional[str] = Form(None, max_length=255, description="Correo electrónico del cliente")
    calle: Optional[str] = Form(None, max_length=255, description="Calle del domicilio")
    numero_exterior: Optional[str] = Form(None, max_length=50, description="Número exterior del domicilio")
    numero_interior: Optional[str] = Form(None, max_length=50, description="Número interior del domicilio")
    colonia: Optional[str] = Form(None, max_length=255, description="Colonia del domicilio")
    localidad: Optional[str] = Form(None, max_length=255, description="Localidad del domicilio")
    municipio: Optional[str] = Form(None, max_length=255, description="Municipio del domicilio")
    estado: Optional[str] = Form(None, max_length=100, description="Estado del domicilio")
    codigo_postal: Optional[str] = Form(None, max_length=5, description="Código postal del domicilio")
    observaciones: Optional[str] = Form(None, max_length=255, description="Obervaciones del cliente")
    empresa_id: int = Form(..., description="ID de la empresa a la que pertenece el cliente")
    estado_cliente: EstadoCliente = Form(default=EstadoCliente.PROSPECTO, description="Estado del cliente (prospecto/cliente/inactivo)")

    model_config = ConfigDict(from_attributes=True)

# Esquema para crear un cliente
class ClienteCreateSchema(ClienteBase):
    pass

# Esquema para actualizar un cliente
class ClienteUpdateSchema(BaseModel):
    nombre_fiscal: Optional[str] = Form(None, max_length=255, description="Nombre fiscal del cliente")
    tipo_persona: Optional[TipoPersona] = Form(None, description="Tipo de persona (Física o Moral)")
    regimen_fiscal: Optional[RegimenFiscal] = Form(None, description="Régimen fiscal del cliente")
    rfc: Optional[str] = Form(None, max_length=13, description="RFC del cliente")
    contact_name: Optional[str] = Form(None, max_length=255, description="Nombre del contacto")
    alias: Optional[str] = Form(None, max_length=100, description="Alias del cliente")
    land_line: Optional[str] = Form(None, max_length=15, description="Número de teléfono fijo")
    phone_number: Optional[str] = Form(None, max_length=15, description="Número de teléfono móvil")
    email: Optional[str] = Form(None, max_length=255, description="Correo electrónico del cliente")
    calle: Optional[str] = Form(None, max_length=255, description="Calle del domicilio")
    numero_exterior: Optional[str] = Form(None, max_length=50, description="Número exterior del domicilio")
    numero_interior: Optional[str] = Form(None, max_length=50, description="Número interior del domicilio")
    colonia: Optional[str] = Form(None, max_length=255, description="Colonia del domicilio")
    localidad: Optional[str] = Form(None, max_length=255, description="Localidad del domicilio")
    municipio: Optional[str] = Form(None, max_length=255, description="Municipio del domicilio")
    estado: Optional[str] = Form(None, max_length=100, description="Estado del domicilio")
    codigo_postal: Optional[str] = Form(None, max_length=5, description="Código postal del domicilio")
    observaciones: Optional[str] = Form(None, max_length=255, description="Obervaciones del cliente")
    empresa_id: Optional[int] = Form(None, description="ID de la empresa a la que pertenece el cliente")
    estado_cliente: Optional[EstadoCliente] = Form(None, description="Estado del cliente (prospecto/cliente/inactivo)")

    model_config = ConfigDict(from_attributes=True)

# Esquema para leer un cliente
class ClienteReadSchema(ClienteBase):
    id: int = Field(..., description="ID del cliente")
    empresa_id: int = Field(..., description="ID de la empresa a la que pertenece el cliente")
    estado_cliente: EstadoCliente = Field(..., description="Estado del cliente")

    # Relaciones
    empresa: Optional["EmpresaRead"] = Field(None, description="Datos de la empresa")
    cotizaciones: Optional[List["CotizacionRead"]] = Field(None, description="Lista de cotizaciones del cliente")

    model_config = ConfigDict(from_attributes=True)

# Esquemas para relaciones
class EmpresaRead(BaseModel):
    id: int = Field(..., description="ID de la empresa")
    name: str = Field(..., description="Nombre de la empresa")

    model_config = ConfigDict(from_attributes=True)

class CotizacionRead(BaseModel):
    id: int = Field(..., description="ID de la cotización")

    model_config = ConfigDict(from_attributes=True)