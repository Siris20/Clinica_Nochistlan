from fastapi import APIRouter, Depends, Query, Form
from sqlalchemy.orm import Session
from typing import List, Optional
from app.db.mariadb import get_db
from app.schemas.cliente import (
    ClienteCreateSchema,
    ClienteUpdateSchema,
    ClienteReadSchema,
)
from app.services.cliente import (
    create_cliente,
    get_cliente,
    get_all_clientes,
    get_prospectos,
    get_clientes_activos,
    convertir_prospecto_a_cliente,
    update_cliente,
    delete_cliente,
)
from app.models.sql.enums import (
    TipoPersona,
    RegimenFiscal,
    EstadoCliente
)

router = APIRouter()

@router.post("/cliente", response_model=ClienteReadSchema)
def crear_cliente(
    nombre_fiscal: str = Form(...),
    tipo_persona: TipoPersona = Form(...),
    regimen_fiscal: RegimenFiscal = Form(...),
    rfc: str = Form(...),
    contact_name: Optional[str] = Form(None),
    alias: Optional[str] = Form(None),
    land_line: Optional[str] = Form(None),
    phone_number: Optional[str] = Form(None),
    email: Optional[str] = Form(None),
    calle: Optional[str] = Form(None),
    numero_exterior: Optional[str] = Form(None),
    numero_interior: Optional[str] = Form(None),
    colonia: Optional[str] = Form(None),
    localidad: Optional[str] = Form(None),
    municipio: Optional[str] = Form(None),
    estado: Optional[str] = Form(None),
    codigo_postal: Optional[str] = Form(None),
    observaciones: Optional[str] = Form(None),
    empresa_id: int = Form(...),
    db: Session = Depends(get_db)
):
    
    cliente_data = ClienteCreateSchema(
        nombre_fiscal=nombre_fiscal,
        tipo_persona=tipo_persona,
        regimen_fiscal=regimen_fiscal,
        rfc=rfc,
        contact_name=contact_name,
        alias=alias,
        land_line=land_line,
        phone_number=phone_number,
        email=email,
        calle=calle,
        numero_exterior=numero_exterior,
        numero_interior=numero_interior,
        colonia=colonia,
        localidad=localidad,
        municipio=municipio,
        estado=estado,
        codigo_postal=codigo_postal,
        observaciones=observaciones,
        empresa_id=empresa_id,
    )
    return create_cliente(db, cliente_data)

@router.get("/cliente/{cliente_id}", response_model=ClienteReadSchema)
def obtener_cliente(
    cliente_id: int,
    db: Session = Depends(get_db)
):
    
    return get_cliente(db, cliente_id)

@router.get("/clientes", response_model=List[ClienteReadSchema])
def obtener_clientes(
    skip: int = Query(default=0, ge=0, description="Número de registros a saltar"),
    limit: int = Query(default=100, ge=1, description="Número máximo de registros a retornar"),
    db: Session = Depends(get_db)
):
    
    return get_all_clientes(db, skip, limit)

@router.get("/prospectos", response_model=List[ClienteReadSchema])
def obtener_prospectos(
    skip: int = Query(default=0, ge=0, description="Número de registros a saltar"),
    limit: int = Query(default=100, ge=1, description="Número máximo de registros a retornar"),
    db: Session = Depends(get_db)
):
    """Obtener solo los prospectos (clientes en estado prospecto)"""
    return get_prospectos(db, skip, limit)

@router.get("/clientes-activos", response_model=List[ClienteReadSchema])
def obtener_clientes_activos(
    skip: int = Query(default=0, ge=0, description="Número de registros a saltar"),
    limit: int = Query(default=100, ge=1, description="Número máximo de registros a retornar"),
    db: Session = Depends(get_db)
):
    """Obtener solo los clientes activos (no prospectos)"""
    return get_clientes_activos(db, skip, limit)

@router.post("/prospecto/{cliente_id}/convertir-a-cliente", response_model=ClienteReadSchema)
def convertir_prospecto_a_cliente_endpoint(
    cliente_id: int,
    db: Session = Depends(get_db)
):
    """Convertir un prospecto en cliente (simulación de primera venta)"""
    return convertir_prospecto_a_cliente(db, cliente_id)

@router.put("/cliente/{cliente_id}", response_model=ClienteReadSchema)
def actualizar_cliente(
    cliente_id: int,
    nombre_fiscal: Optional[str] = Form(None),
    tipo_persona: Optional[TipoPersona] = Form(None),
    regimen_fiscal: Optional[RegimenFiscal] = Form(None),
    rfc: Optional[str] = Form(None),
    contact_name: Optional[str] = Form(None),
    alias: Optional[str] = Form(None),
    land_line: Optional[str] = Form(None),
    phone_number: Optional[str] = Form(None),
    email: Optional[str] = Form(None),
    calle: Optional[str] = Form(None),
    numero_exterior: Optional[str] = Form(None),
    numero_interior: Optional[str] = Form(None),
    colonia: Optional[str] = Form(None),
    localidad: Optional[str] = Form(None),
    municipio: Optional[str] = Form(None),
    estado: Optional[str] = Form(None),
    codigo_postal: Optional[str] = Form(None),
    observaciones: Optional[str] = Form(None),
    empresa_id: Optional[int] = Form(None),
    estado_cliente: Optional[EstadoCliente] = Form(None),
    db: Session = Depends(get_db)
):
    cliente_data = ClienteUpdateSchema(
        nombre_fiscal=nombre_fiscal,
        tipo_persona=tipo_persona,
        regimen_fiscal=regimen_fiscal,
        rfc=rfc,
        contact_name=contact_name,
        alias=alias,
        land_line=land_line,
        phone_number=phone_number,
        email=email,
        calle=calle,
        numero_exterior=numero_exterior,
        numero_interior=numero_interior,
        colonia=colonia,
        localidad=localidad,
        municipio=municipio,
        estado=estado,
        codigo_postal=codigo_postal,
        observaciones=observaciones,
        empresa_id=empresa_id,
        estado_cliente=estado_cliente,
    )
    return update_cliente(db, cliente_id, cliente_data)

@router.delete("/cliente/{cliente_id}")
def eliminar_cliente(
    cliente_id: int,
    db: Session = Depends(get_db)
):
    
    return delete_cliente(db, cliente_id)
    