from typing import List, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.sql.cliente import Cliente
from app.schemas.cliente import (
    ClienteCreateSchema,
    ClienteUpdateSchema,
    ClienteReadSchema,
)
from app.models.sql.empresa import Empresa
from app.models.sql.enums import EstadoCliente

def create_cliente(
    db: Session, cliente_data: ClienteCreateSchema
) -> ClienteReadSchema:
    
    try:
        # Verificar si existe la empresa
        empresa = (
            db.query(Empresa)
            .filter(Empresa.id == cliente_data.empresa_id)
            .first()
        )
        
        if not empresa:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Error al crear cliente, no se encontró empresa con el ID {cliente_data.empresa_id}"
            )

        
        nuevo_cliente = Cliente()
        for key, value in cliente_data.model_dump().items():
            setattr(nuevo_cliente, key, value)
        
        # Por defecto, todos los nuevos registros son prospectos
        nuevo_cliente.estado_cliente = EstadoCliente.PROSPECTO
        
        db.add(nuevo_cliente)
        db.commit()
        db.refresh(nuevo_cliente)
        return ClienteReadSchema.from_orm(nuevo_cliente)
    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al crear el cliente: {str(e)}",
        )

def get_cliente(
    db: Session, cliente_id: int
) -> ClienteReadSchema:
    
    try:
        cliente = (
            db.query(Cliente)
            .filter(Cliente.id == cliente_id)
            .first()
        )
        if not cliente:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Cliente no encontrado",
            )
        return ClienteReadSchema.from_orm(cliente)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener el cliente: {str(e)}",
        )

def get_all_clientes(
    db: Session, skip: int = 0, limit: int = 100
) -> List[ClienteReadSchema]:
    
    try:
        clientes = db.query(Cliente).offset(skip).limit(limit).all()
        return [
            ClienteReadSchema.from_orm(cliente)
            for cliente in clientes
        ]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener la lista de clientes: {str(e)}",
        )

def get_prospectos(
    db: Session, skip: int = 0, limit: int = 100
) -> List[ClienteReadSchema]:
    """Obtener solo los prospectos"""
    try:
        prospectos = (
            db.query(Cliente)
            .filter(Cliente.estado_cliente == EstadoCliente.PROSPECTO)
            .offset(skip)
            .limit(limit)
            .all()
        )
        return [
            ClienteReadSchema.from_orm(prospecto)
            for prospecto in prospectos
        ]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener la lista de prospectos: {str(e)}",
        )

def get_clientes_activos(
    db: Session, skip: int = 0, limit: int = 100
) -> List[ClienteReadSchema]:
    """Obtener solo los clientes activos (no prospectos)"""
    try:
        clientes = (
            db.query(Cliente)
            .filter(Cliente.estado_cliente == EstadoCliente.CLIENTE)
            .offset(skip)
            .limit(limit)
            .all()
        )
        return [
            ClienteReadSchema.from_orm(cliente)
            for cliente in clientes
        ]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener la lista de clientes activos: {str(e)}",
        )

def convertir_prospecto_a_cliente(
    db: Session, cliente_id: int
) -> ClienteReadSchema:
    """Convertir un prospecto en cliente (simulación de primera venta)"""
    try:
        cliente = (
            db.query(Cliente)
            .filter(Cliente.id == cliente_id)
            .first()
        )
        if not cliente:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Cliente no encontrado",
            )
        
        if cliente.estado_cliente != EstadoCliente.PROSPECTO:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Solo se pueden convertir prospectos a clientes",
            )
        
        cliente.estado_cliente = EstadoCliente.CLIENTE
        db.commit()
        db.refresh(cliente)
        return ClienteReadSchema.from_orm(cliente)
    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al convertir prospecto a cliente: {str(e)}",
        )

def update_cliente(
    db: Session, cliente_id: int, cliente_data: ClienteUpdateSchema
) -> ClienteReadSchema:
    
    try:
        cliente = (
            db.query(Cliente)
            .filter(Cliente.id == cliente_id)
            .first()
        )
        if not cliente:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Cliente no encontrado",
            )

        
        update_data = cliente_data.model_dump(exclude_unset=True)
        if "empresa_id" in update_data and update_data["empresa_id"] is not None:
            empresa = (
                db.query(Empresa)
                .filter(Empresa.id == update_data["empresa_id"])
                .first()
            )
            if not empresa:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Error al actualizar cliente, no se encontró empresa con ID {update_data['empresa_id']}"
                )

        
        for key, value in update_data.items():
            if hasattr(cliente, key) and value is not None:
                setattr(cliente, key, value)

        db.commit()
        db.refresh(cliente)
        return ClienteReadSchema.from_orm(cliente)
    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al actualizar el cliente: {str(e)}",
        )

def delete_cliente(db: Session, cliente_id: int) -> None:
   
    try:
        cliente = (
            db.query(Cliente)
            .filter(Cliente.id == cliente_id)
            .first()
        )
        if not cliente:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Cliente no encontrado",
            )
        db.delete(cliente)
        db.commit()
        return {"detail":"Cliente eliminado exitosamente"}
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al eliminar el cliente: {str(e)}",
        )