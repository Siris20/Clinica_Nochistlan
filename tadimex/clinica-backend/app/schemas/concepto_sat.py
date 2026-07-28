from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from fastapi import Form

# Esquema base para ConceptoSAT
class ConceptoSATBase(BaseModel):
    clave: str = Form(..., max_length=10, description="Clave del concepto SAT")
    segmento: Optional[str] = Form(None, max_length=2, description="Segmento del concepto SAT")
    familia: Optional[str] = Form(None, max_length=2, description="Familia del concepto SAT")
    clase: Optional[str] = Form(None, max_length=2, description="Clase del concepto SAT")
    mercancia: Optional[str] = Form(None, max_length=2, description="Mercancía del concepto SAT")
    descripcion: Optional[str] = Form(None, max_length=200, description="Descripción del concepto SAT")

    model_config = ConfigDict(from_attributes=True)

# Esquema para leer un concepto SAT
class ConceptoSATReadSchema(BaseModel):
    id: int = Field(..., description="ID del concepto SAT")
    clave: str = Field(..., max_length=10, description="Clave del concepto SAT")
    segmento: Optional[str] = Field(None, max_length=2, description="Segmento del concepto SAT")
    familia: Optional[str] = Field(None, max_length=2, description="Familia del concepto SAT")
    clase: Optional[str] = Field(None, max_length=2, description="Clase del concepto SAT")
    mercancia: Optional[str] = Field(None, max_length=2, description="Mercancía del concepto SAT")
    descripcion: Optional[str] = Field(None, max_length=200, description="Descripción del concepto SAT")

    model_config = ConfigDict(from_attributes=True)

# Esquema para búsqueda por clave
class ConceptoSATByClaveSchema(BaseModel):
    clave: str = Field(..., max_length=10, description="Clave del concepto SAT a buscar")
    descripcion: Optional[str] = Field(None, max_length=200, description="Descripción del concepto SAT encontrado")

    model_config = ConfigDict(from_attributes=True)

class ConceptoSATSearchSchema(BaseModel):
    id: int
    clave: str
    descripcion: str
    
    model_config = ConfigDict(from_attributes=True)