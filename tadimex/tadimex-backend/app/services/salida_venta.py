from typing import List, Optional
from decimal import Decimal
from datetime import datetime
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.sql.salida_venta import SalidaVenta
from app.models.sql.producto_vendido import ProductoVendido
from app.models.sql.cliente import Cliente
from app.models.sql.cotizacion import Cotizacion
from app.schemas.salida_venta import (
    SalidaVentaCreateSchema,
    SalidaVentaReadSchema
)


def calcular_totales_venta(productos: List[ProductoVendido], costo_envio: Decimal) -> dict:
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

async def create_venta(db: Session, venta_data: SalidaVentaCreateSchema) -> SalidaVentaReadSchema:
    try:
        # Validación de cliente
        if venta_data.cliente_id:
            cliente = db.query(Cliente).get(venta_data.cliente_id)
            if not cliente:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Cliente no encontrado"
                )

        # Crear la salida de venta
        venta_dict = venta_data.model_dump(exclude={"productos"})
        venta = SalidaVenta(**venta_dict)
        db.add(venta)
        db.flush()

        # Procesar productos
        productos_vendidos = []
        for producto in venta_data.productos:
            producto_dict = producto.model_dump()
            producto_dict["salida_venta_id"] = venta.id
            pv = ProductoVendido(**producto_dict)
            db.add(pv)
            productos_vendidos.append(pv)

        # Calcular totales
        totales = calcular_totales_venta(productos_vendidos, venta.costo_envio or Decimal(0))

        # Actualizar venta con totales
        venta.subtotal = totales["subtotal"]
        venta.total_descuentos = totales["descuentos"]
        venta.total_impuestos = totales["impuestos"]
        venta.total = totales["total"]

        db.commit()
        return SalidaVentaReadSchema.model_validate(venta)

    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al crear venta: {str(e)}"
        )

def get_venta(db: Session, venta_id: int) -> SalidaVentaReadSchema:
    venta = db.query(SalidaVenta).get(venta_id)
    if not venta:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Venta no encontrada"
        )
    return SalidaVentaReadSchema.model_validate(venta)

async def update_venta(db: Session, venta_id: int, venta_data: SalidaVentaCreateSchema) -> SalidaVentaReadSchema:
    try:
        # Verificar si la venta existe
        venta = db.query(SalidaVenta).get(venta_id)
        if not venta:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Venta no encontrada"
            )

        # Validación de cliente
        if venta_data.cliente_id:
            cliente = db.query(Cliente).get(venta_data.cliente_id)
            if not cliente:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Cliente no encontrado"
                )

        # Eliminar productos vendidos existentes
        db.query(ProductoVendido).filter(ProductoVendido.salida_venta_id == venta_id).delete()

        # Actualizar datos básicos de la venta
        for key, value in venta_data.model_dump(exclude={"productos"}).items():
            setattr(venta, key, value)

        # Procesar nuevos productos
        productos_vendidos = []
        for producto in venta_data.productos:
            producto_dict = producto.model_dump()
            producto_dict["salida_venta_id"] = venta_id
            pv = ProductoVendido(**producto_dict)
            db.add(pv)
            productos_vendidos.append(pv)

        # Calcular nuevos totales
        totales = calcular_totales_venta(productos_vendidos, venta.costo_envio or Decimal(0))

        # Actualizar totales de la venta
        venta.subtotal = totales["subtotal"]
        venta.total_descuentos = totales["descuentos"]
        venta.total_impuestos = totales["impuestos"]
        venta.total = totales["total"]
        venta.fecha_actualizacion = datetime.utcnow()

        db.commit()
        return SalidaVentaReadSchema.model_validate(venta)

    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al actualizar venta: {str(e)}"
        )

async def delete_venta(db: Session, venta_id: int) -> bool:
    try:
        venta = db.query(SalidaVenta).get(venta_id)
        if not venta:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Venta no encontrada"
            )

        # Eliminar productos vendidos asociados
        db.query(ProductoVendido).filter(ProductoVendido.salida_venta_id == venta_id).delete()

        # Eliminar la venta
        db.delete(venta)
        db.commit()
        return True
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al eliminar venta: {str(e)}"
        )

def get_ventas(
    db: Session, 
    skip: int = 0, 
    limit: int = 100,
    cliente_id: Optional[int] = None,
    cotizacion_id: Optional[int] = None,
    fecha_inicio: Optional[datetime] = None,
    fecha_fin: Optional[datetime] = None
) -> List[SalidaVentaReadSchema]:
    try:
        query = db.query(SalidaVenta)

        if cliente_id:
            query = query.filter(SalidaVenta.cliente_id == cliente_id)

        if cotizacion_id:
            query = query.filter(SalidaVenta.cotizacion_id == cotizacion_id)

        if fecha_inicio:
            query = query.filter(SalidaVenta.fecha_venta >= fecha_inicio)

        if fecha_fin:
            query = query.filter(SalidaVenta.fecha_venta <= fecha_fin)

        ventas = query.offset(skip).limit(limit).all()
        return [SalidaVentaReadSchema.model_validate(v) for v in ventas]
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener ventas: {str(e)}"
        )