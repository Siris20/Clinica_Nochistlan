from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from datetime import datetime
from fastapi import UploadFile, Form, File
from app.models.sql.enums import TipoPersona, RegimenFiscal

class EmisorBase(BaseModel):
    rfc: str = Field(..., max_length=13, description="RFC del emisor")
    tipo_persona: Optional[TipoPersona] = Field(None, description="Tipo de persona (Física o Moral)")
    regimen_fiscal: Optional[RegimenFiscal] = Field(None, description="Régimen fiscal del emisor")
    razon_social: str = Field(..., max_length=255, description="Razón social del emisor")
    
    # Dirección
    calle: Optional[str] = Field(None, max_length=255, description="Calle del domicilio fiscal")
    numero_exterior: Optional[str] = Field(None, max_length=50, description="Número exterior del domicilio fiscal")
    numero_interior: Optional[str] = Field(None, max_length=50, description="Número interior del domicilio fiscal")
    colonia: Optional[str] = Field(None, max_length=255, description="Colonia del domicilio fiscal")
    localidad: Optional[str] = Field(None, max_length=255, description="Localidad del domicilio fiscal")
    municipio: Optional[str] = Field(None, max_length=255, description="Municipio del domicilio fiscal")
    estado: Optional[str] = Field(None, max_length=100, description="Estado del domicilio fiscal")
    codigo_postal: Optional[str] = Field(None, max_length=5, description="Código postal del domicilio fiscal")
    
    # Información bancaria
    banco: Optional[str] = Field(None, max_length=100, description="Nombre del banco")
    numero_cuenta: Optional[str] = Field(None, max_length=20, description="Número de cuenta bancaria")
    numero_tarjeta: Optional[str] = Field(None, max_length=16, description="Número de tarjeta bancaria")
    clabe: Optional[str] = Field(None, max_length=18, description="CLABE interbancaria")
    
    # Información CSD
    numero_certificado: Optional[str] = Field(None, max_length=100, description="Número de certificado")
    contrasena_clave: Optional[str] = Field(None, max_length=255, description="Contraseña de la clave privada")
    es_pruebas: bool = Field(False, description="Indica si el emisor está en modo de pruebas")
    
    # Relaciones
    empresa_id: int = Field(..., description="ID de la empresa a la que pertenece el emisor")

    model_config = ConfigDict(from_attributes=True)

class EmisorCreateSchema(EmisorBase):
    certificado_path: Optional[UploadFile] = Field(None, description="Archivo del certificado")
    clave_privada_path: Optional[UploadFile] = Field(None, description="Archivo de la clave privada")

    @classmethod
    def as_form(
        cls,
        rfc: str = Form(...),
        razon_social: str = Form(...),
        empresa_id: int = Form(...),
        tipo_persona: Optional[TipoPersona] = Form(None),
        regimen_fiscal: Optional[RegimenFiscal] = Form(None),
        calle: Optional[str] = Form(None),
        numero_exterior: Optional[str] = Form(None),
        numero_interior: Optional[str] = Form(None),
        colonia: Optional[str] = Form(None),
        localidad: Optional[str] = Form(None),
        municipio: Optional[str] = Form(None),
        estado: Optional[str] = Form(None),
        codigo_postal: Optional[str] = Form(None),
        banco: Optional[str] = Form(None),
        numero_cuenta: Optional[str] = Form(None),
        numero_tarjeta: Optional[str] = Form(None),
        clabe: Optional[str] = Form(None),
        numero_certificado: Optional[str] = Form(None),
        contrasena_clave: Optional[str] = Form(None),
        es_pruebas: bool = Form(False),
        certificado_path: Optional[UploadFile] = File(None),
        clave_privada_path: Optional[UploadFile] = File(None),
    ):
        return cls(
            rfc=rfc,
            razon_social=razon_social,
            empresa_id=empresa_id,
            tipo_persona=tipo_persona,
            regimen_fiscal=regimen_fiscal,
            calle=calle,
            numero_exterior=numero_exterior,
            numero_interior=numero_interior,
            colonia=colonia,
            localidad=localidad,
            municipio=municipio,
            estado=estado,
            codigo_postal=codigo_postal,
            banco=banco,
            numero_cuenta=numero_cuenta,
            numero_tarjeta=numero_tarjeta,
            clabe=clabe,
            numero_certificado=numero_certificado,
            contrasena_clave=contrasena_clave,
            es_pruebas=es_pruebas,
            certificado_path=certificado_path,
            clave_privada_path=clave_privada_path,
        )

class EmisorUpdateSchema(BaseModel):
    rfc: Optional[str] = Field(None, max_length=13, description="RFC del emisor")
    tipo_persona: Optional[TipoPersona] = Field(None, description="Tipo de persona (Física o Moral)")
    regimen_fiscal: Optional[RegimenFiscal] = Field(None, description="Régimen fiscal del emisor")
    razon_social: Optional[str] = Field(None, max_length=255, description="Razón social del emisor")
    
    # Dirección
    calle: Optional[str] = Field(None, max_length=255, description="Calle del domicilio fiscal")
    numero_exterior: Optional[str] = Field(None, max_length=50, description="Número exterior del domicilio fiscal")
    numero_interior: Optional[str] = Field(None, max_length=50, description="Número interior del domicilio fiscal")
    colonia: Optional[str] = Field(None, max_length=255, description="Colonia del domicilio fiscal")
    localidad: Optional[str] = Field(None, max_length=255, description="Localidad del domicilio fiscal")
    municipio: Optional[str] = Field(None, max_length=255, description="Municipio del domicilio fiscal")
    estado: Optional[str] = Field(None, max_length=100, description="Estado del domicilio fiscal")
    codigo_postal: Optional[str] = Field(None, max_length=5, description="Código postal del domicilio fiscal")
    
    # Información bancaria
    banco: Optional[str] = Field(None, max_length=100, description="Nombre del banco")
    numero_cuenta: Optional[str] = Field(None, max_length=20, description="Número de cuenta bancaria")
    numero_tarjeta: Optional[str] = Field(None, max_length=16, description="Número de tarjeta bancaria")
    clabe: Optional[str] = Field(None, max_length=18, description="CLABE interbancaria")
    
    # Información CSD
    numero_certificado: Optional[str] = Field(None, max_length=100, description="Número de certificado")
    contrasena_clave: Optional[str] = Field(None, max_length=255, description="Contraseña de la clave privada")
    es_pruebas: Optional[bool] = Field(None, description="Indica si el emisor está en modo de pruebas")
    certificado_path: Optional[UploadFile] = Field(None, description="Nuevo archivo del certificado")
    clave_privada_path: Optional[UploadFile] = Field(None, description="Nuevo archivo de la clave privada")
    
    # Relaciones
    empresa_id: Optional[int] = Field(None, description="ID de la empresa a la que pertenece el emisor")

    model_config = ConfigDict(from_attributes=True)

    @classmethod
    def as_form(
        cls,
        rfc: Optional[str] = Form(None),
        razon_social: Optional[str] = Form(None),
        tipo_persona: Optional[TipoPersona] = Form(None),
        regimen_fiscal: Optional[RegimenFiscal] = Form(None),
        calle: Optional[str] = Form(None),
        numero_exterior: Optional[str] = Form(None),
        numero_interior: Optional[str] = Form(None),
        colonia: Optional[str] = Form(None),
        localidad: Optional[str] = Form(None),
        municipio: Optional[str] = Form(None),
        estado: Optional[str] = Form(None),
        codigo_postal: Optional[str] = Form(None),
        banco: Optional[str] = Form(None),
        numero_cuenta: Optional[str] = Form(None),
        numero_tarjeta: Optional[str] = Form(None),
        clabe: Optional[str] = Form(None),
        numero_certificado: Optional[str] = Form(None),
        contrasena_clave: Optional[str] = Form(None),
        es_pruebas: Optional[bool] = Form(None),
        empresa_id: Optional[int] = Form(None),
        certificado_path: Optional[UploadFile] = File(None),
        clave_privada_path: Optional[UploadFile] = File(None),
    ):
        return cls(
            rfc=rfc,
            razon_social=razon_social,
            tipo_persona=tipo_persona,
            regimen_fiscal=regimen_fiscal,
            calle=calle,
            numero_exterior=numero_exterior,
            numero_interior=numero_interior,
            colonia=colonia,
            localidad=localidad,
            municipio=municipio,
            estado=estado,
            codigo_postal=codigo_postal,
            banco=banco,
            numero_cuenta=numero_cuenta,
            numero_tarjeta=numero_tarjeta,
            clabe=clabe,
            numero_certificado=numero_certificado,
            contrasena_clave=contrasena_clave,
            es_pruebas=es_pruebas,
            empresa_id=empresa_id,
            certificado_path=certificado_path,
            clave_privada_path=clave_privada_path,
        )

class EmisorReadSchema(EmisorBase):
    id: int = Field(..., description="ID del emisor")
    created_at: datetime = Field(..., description="Fecha de creación del emisor")
    updated_at: datetime = Field(..., description="Fecha de última actualización del emisor")
    certificado_path: Optional[str] = Field(None, description="Ruta del archivo del certificado")
    clave_privada_path: Optional[str] = Field(None, description="Ruta del archivo de la clave privada")
    empresa: Optional["EmpresaReadSchema"] = Field(None, description="Datos de la empresa")
    cotizaciones: Optional[List["CotizacionReadSchema"]] = Field(None, description="Lista de cotizaciones del emisor")

    model_config = ConfigDict(from_attributes=True)

class EmpresaReadSchema(BaseModel):
    id: int = Field(..., description="ID de la empresa")
    name: str = Field(..., description="Nombre de la empresa")

    model_config = ConfigDict(from_attributes=True)

class CotizacionReadSchema(BaseModel):
    id: int = Field(..., description="ID de la cotización")

    model_config = ConfigDict(from_attributes=True)