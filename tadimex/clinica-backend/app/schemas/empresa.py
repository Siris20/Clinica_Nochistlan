from pydantic import BaseModel, Field
from typing import Optional

# Schema para la creación de una empresa
class EmpresaCreateSchema(BaseModel):
    name: str = Field(..., max_length=255)
    calle: Optional[str] = Field(None, max_length=255)
    numero_exterior: Optional[str] = Field(None, max_length=50)
    numero_interior: Optional[str] = Field(None, max_length=50)
    colonia: Optional[str] = Field(None, max_length=255)
    localidad: Optional[str] = Field(None, max_length=255)
    municipio: Optional[str] = Field(None, max_length=255)
    estado: Optional[str] = Field(None, max_length=100)
    codigo_postal: Optional[str] = Field(None, max_length=5)
    phone_number: Optional[str] = Field(None, max_length=15)
    SAT_certificate: Optional[str] = Field(None, max_length=255)
    SAT_stamp: Optional[str] = Field(None, max_length=255)
    regimen_fiscal: Optional[str] = Field(None, max_length=100)

# Schema para la respuesta de una empresa
class EmpresaResponseSchema(BaseModel):
    id: int
    name: str
    calle: Optional[str] = None
    numero_exterior: Optional[str] = None
    numero_interior: Optional[str] = None
    colonia: Optional[str] = None
    localidad: Optional[str] = None
    municipio: Optional[str] = None
    estado: Optional[str] = None
    codigo_postal: Optional[str] = None
    phone_number: Optional[str] = None
    SAT_certificate: Optional[str] = None
    SAT_stamp: Optional[str] = None
    regimen_fiscal: Optional[str] = None

    class Config:
        from_attributes = True  