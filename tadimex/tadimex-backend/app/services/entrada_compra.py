from typing import List, Optional
from decimal import Decimal
from datetime import datetime
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.sql.entrada_compra import EntradaCompra
from app.models.sql.producto_comprado import ProductoComprado
from app.models.sql.proveedor import Proveedor
from app.schemas.entrada_compra import (
    CompraCreateSchema,
    CompraReadSchema
)


def calcular_totales_compra(productos: List[ProductoComprado], costo_envio: Decimal) -> dict:
    subtotal = sum(p.cantidad * p.costo_unitario for p in productos)
    descuentos = sum(p.cantidad * p.costo_unitario * (p.descuento/100) for p in productos)
    impuestos = sum(p.cantidad * p.costo_unitario * (p.impuesto/100) for p in productos)
    total = subtotal - descuentos + impuestos + costo_envio
    return {
        "subtotal": subtotal,
        "descuentos": descuentos,
        "impuestos": impuestos,
        "total": total
    }

async def create_compra(db: Session, compra_data: CompraCreateSchema) -> CompraReadSchema:
    try:
        # Validación de proveedor
        if compra_data.proveedor_id:
            proveedor = db.query(Proveedor).get(compra_data.proveedor_id)
            if not proveedor:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Proveedor no encontrado"
                )

        # Crear la entrada de compra
        compra_dict = compra_data.model_dump(exclude={"productos"})
        compra = EntradaCompra(**compra_dict)
        db.add(compra)
        db.flush()

        # Procesar productos
        productos_comprados = []
        for producto in compra_data.productos:
            producto_dict = producto.model_dump()
            producto_dict["entrada_compra_id"] = compra.id
            pc = ProductoComprado(**producto_dict)
            db.add(pc)
            productos_comprados.append(pc)

        # Calcular totales
        totales = calcular_totales_compra(productos_comprados, compra.costo_envio or Decimal(0))
        
        # Actualizar compra con totales
        compra.subtotal = totales["subtotal"]
        compra.total_descuentos = totales["descuentos"]
        compra.total_impuestos = totales["impuestos"]
        compra.total = totales["total"]

        db.commit()
        return CompraReadSchema.model_validate(compra)
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al crear compra: {str(e)}"
        )

def get_compra(db: Session, compra_id: int) -> CompraReadSchema:
    compra = db.query(EntradaCompra).get(compra_id)
    if not compra:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Compra no encontrada"
        )
    return CompraReadSchema.model_validate(compra)

async def update_compra(db: Session, compra_id: int, compra_data: CompraCreateSchema) -> CompraReadSchema:
    try:
        # Verificar si la compra existe
        compra = db.query(EntradaCompra).get(compra_id)
        if not compra:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Compra no encontrada"
            )

        # Validación de proveedor
        if compra_data.proveedor_id:
            proveedor = db.query(Proveedor).get(compra_data.proveedor_id)
            if not proveedor:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Proveedor no encontrado"
                )

        # Eliminar productos comprados existentes
        db.query(ProductoComprado).filter(ProductoComprado.entrada_compra_id == compra_id).delete()

        # Actualizar datos básicos de la compra
        for key, value in compra_data.model_dump(exclude={"productos"}).items():
            setattr(compra, key, value)

        # Procesar nuevos productos
        productos_comprados = []
        for producto in compra_data.productos:
            producto_dict = producto.model_dump()
            producto_dict["entrada_compra_id"] = compra_id
            pc = ProductoComprado(**producto_dict)
            db.add(pc)
            productos_comprados.append(pc)

        # Calcular nuevos totales
        totales = calcular_totales_compra(productos_comprados, compra.costo_envio or Decimal(0))
        
        # Actualizar totales de la compra
        compra.subtotal = totales["subtotal"]
        compra.total_descuentos = totales["descuentos"]
        compra.total_impuestos = totales["impuestos"]
        compra.total = totales["total"]
        compra.fecha_actualizacion = datetime.utcnow()

        db.commit()
        return CompraReadSchema.model_validate(compra)
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al actualizar compra: {str(e)}"
        )

async def delete_compra(db: Session, compra_id: int) -> bool:
    try:
        compra = db.query(EntradaCompra).get(compra_id)
        if not compra:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Compra no encontrada"
            )

        # Eliminar productos comprados asociados
        db.query(ProductoComprado).filter(ProductoComprado.entrada_compra_id == compra_id).delete()
        
        # Eliminar la compra
        db.delete(compra)
        db.commit()
        return True
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al eliminar compra: {str(e)}"
        )

def get_compras(
    db: Session, 
    skip: int = 0, 
    limit: int = 100,
    proveedor_id: Optional[int] = None,
    fecha_inicio: Optional[datetime] = None,
    fecha_fin: Optional[datetime] = None
) -> List[CompraReadSchema]:
    try:
        query = db.query(EntradaCompra)
        
        if proveedor_id:
            query = query.filter(EntradaCompra.proveedor_id == proveedor_id)
            
        if fecha_inicio:
            query = query.filter(EntradaCompra.fecha_compra >= fecha_inicio)
            
        if fecha_fin:
            query = query.filter(EntradaCompra.fecha_compra <= fecha_fin)
            
        compras = query.offset(skip).limit(limit).all()
        return [CompraReadSchema.model_validate(c) for c in compras]
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener compras: {str(e)}"
        )