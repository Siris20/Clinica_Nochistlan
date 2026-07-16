from typing import List, Optional
from decimal import Decimal
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.sql.cotizacion import Cotizacion
from app.models.sql.producto_cotizado import ProductoCotizado
from app.models.sql.emisor import Emisor
from app.models.sql.cliente import Cliente
from app.models.sql.logo import Logo
from app.models.sql.producto import Producto
from app.schemas.cotizacion import (
    CotizacionCreateSchema,
    CotizacionUpdateSchema,
    CotizacionReadSchema,
)
from app.schemas.producto_cotizado import (
    ProductoCotizadoCreateSchema,
    ProductoCotizadoUpdateSchema
)

def calcular_totales(
    subtotal: Decimal,
    descuento_general: Decimal,
    gastos_envio: Decimal,
    emisor: Emisor,
    cliente: Cliente
) -> dict:
    descuento_general_amount = subtotal * (descuento_general / Decimal("100.0"))
    subtotal_final = subtotal - descuento_general_amount + gastos_envio
    
    ret_isr = Decimal("0.0")
    if emisor.regimen_fiscal.value == "626 - Régimen Simplificado de Confianza" and cliente.tipo_persona.value == "MORAL":
        ret_isr = Decimal("0.0125")
    
    isr_ret = subtotal_final * ret_isr
    iva = subtotal_final * Decimal("0.16")
    total = subtotal_final + iva - isr_ret

    return {
        "subtotal": subtotal_final,
        "iva": iva,
        "isr_ret": isr_ret,
        "total": total
    }

async def create_cotizacion(
    db: Session,
    cotizacion_data: CotizacionCreateSchema,
    productos_cotizados_data: List[ProductoCotizadoCreateSchema]
) -> CotizacionReadSchema:
    try:
        emisor = db.query(Emisor).filter(Emisor.id == cotizacion_data.emisor_id).first()
        if not emisor:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Error al crear cotización, no se encontró emisor con ID {cotizacion_data.emisor_id}"
            )

        cliente = db.query(Cliente).filter(Cliente.id == cotizacion_data.cliente_id).first()
        if not cliente:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Error al crear cotización, no se encontró cliente con ID {cotizacion_data.cliente_id}"
            )

        if cotizacion_data.logo_id:
            logo = db.query(Logo).filter(Logo.id == cotizacion_data.logo_id).first()
            if not logo:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Error al crear cotización, no se encontró logo con ID {cotizacion_data.logo_id}"
                )

        cotizacion_dict = {}
        for field, value in cotizacion_data.model_dump().items():
            if value is not None:
                cotizacion_dict[field] = Decimal(str(value)) if isinstance(value, (float, int)) else value

        nueva_cotizacion = Cotizacion(**cotizacion_dict)
        db.add(nueva_cotizacion)
        db.flush()  

        fecha_creacion = nueva_cotizacion.created_at.strftime("%y%m%d")
        folio_generado = f"CT{fecha_creacion}{nueva_cotizacion.id}"
        nueva_cotizacion.folio = folio_generado
       
        acumulado_subtotal = Decimal("0.0")
        for producto_data in productos_cotizados_data:
            producto = db.query(Producto).filter(Producto.id == producto_data.producto_id).first()
            if not producto:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Error al crear cotización, no se encontró producto con ID {producto_data.producto_id}"
                )
            
            if not producto_data.precio_unitario:
                precio = Decimal(str(producto.sell_price))
                producto_data.precio_unitario = precio
            else:
                precio = Decimal(str(producto_data.precio_unitario))
            
            if not producto_data.concepto:
                producto_data.concepto = producto.name
            
            cantidad = Decimal(str(producto_data.cantidad))
            descuento = Decimal(str(producto_data.descuento))

            subtotal_producto_cotizado = (precio * cantidad) - (precio * cantidad * descuento) / Decimal("100.0")
            acumulado_subtotal += subtotal_producto_cotizado
            
            producto_dict = producto_data.model_dump()
            producto_dict['cotizacion_id'] = nueva_cotizacion.id
            producto_cotizado = ProductoCotizado(**producto_dict)
            db.add(producto_cotizado)

        totales = calcular_totales(
            acumulado_subtotal,
            Decimal(str(cotizacion_data.descuento_general)),
            Decimal(str(cotizacion_data.gastos_envio)),
            emisor,
            cliente
        )

        nueva_cotizacion.subtotal = totales["subtotal"]
        nueva_cotizacion.iva = totales["iva"]
        nueva_cotizacion.isr_ret = totales["isr_ret"]
        nueva_cotizacion.total = totales["total"]

        db.commit()
        db.refresh(nueva_cotizacion)
        return CotizacionReadSchema.model_validate(nueva_cotizacion)

    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al crear la cotización: {str(e)}"
        )


def get_cotizacion(
    db: Session,
    cotizacion_id: int
) -> CotizacionReadSchema:
    try:
        cotizacion = (
            db.query(Cotizacion)
            .filter(Cotizacion.id == cotizacion_id)
            .first()
        )
        if not cotizacion:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Cotización no encontrada"
            )
        return CotizacionReadSchema.model_validate(cotizacion)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener la cotización: {str(e)}"
        )

def get_all_cotizaciones(
    db: Session,
    skip: int = 0,
    limit: int = 5000
) -> List[CotizacionReadSchema]:
    try:
        cotizaciones = db.query(Cotizacion).offset(skip).limit(limit).all()
        return [
            CotizacionReadSchema.model_validate(cotizacion)
            for cotizacion in cotizaciones
        ]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener la lista de cotizaciones: {str(e)}"
        )


async def update_cotizacion(
    db: Session,
    cotizacion_id: int,
    cotizacion_data: CotizacionUpdateSchema,
    productos_cotizados_data: Optional[List[ProductoCotizadoUpdateSchema]] = None
) -> CotizacionReadSchema:
    try:
        cotizacion = db.query(Cotizacion).filter(Cotizacion.id == cotizacion_id).first()
        if not cotizacion:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Error al actualizar cotización, no se encontró cotización con ID {cotizacion_id}"
            )

        if cotizacion_data.emisor_id is not None:
            emisor = db.query(Emisor).filter(Emisor.id == cotizacion_data.emisor_id).first()
            if not emisor:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Error al actualizar cotización, no se encontró emisor con ID {cotizacion_data.emisor_id}"
                )
        else:
            emisor = db.query(Emisor).filter(Emisor.id == cotizacion.emisor_id).first()

        if cotizacion_data.cliente_id is not None:
            cliente = db.query(Cliente).filter(Cliente.id == cotizacion_data.cliente_id).first()
            if not cliente:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Error al actualizar cotización, no se encontró cliente con ID {cotizacion_data.cliente_id}"
                )
        else:
            cliente = db.query(Cliente).filter(Cliente.id == cotizacion.cliente_id).first()

        if cotizacion_data.logo_id is not None:
            logo = db.query(Logo).filter(Logo.id == cotizacion_data.logo_id).first()
            if not logo:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Error al actualizar cotización, no se encontró logo con ID {cotizacion_data.logo_id}"
                )

        for field, value in cotizacion_data.model_dump(exclude_unset=True).items():
            if value is not None:
                setattr(cotizacion, field, Decimal(str(value)) if isinstance(value, (float, int)) else value)

        if productos_cotizados_data is not None:
            db.query(ProductoCotizado).filter(ProductoCotizado.cotizacion_id == cotizacion_id).delete()

            acumulado_subtotal = Decimal("0.0")
            for producto_data in productos_cotizados_data:
                producto = db.query(Producto).filter(Producto.id == producto_data.producto_id).first()
                if not producto:
                    raise HTTPException(
                        status_code=status.HTTP_404_NOT_FOUND,
                        detail=f"Error al actualizar cotización, no se encontró producto con ID {producto_data.producto_id}"
                    )

                if not producto_data.precio_unitario:
                    precio = Decimal(str(producto.sell_price))
                    producto_data.precio_unitario = precio
                else:
                    precio = Decimal(str(producto_data.precio_unitario))
            
                if not producto_data.concepto:
                    producto_data.concepto = producto.name
                    
                cantidad = Decimal(str(producto_data.cantidad))
                descuento = Decimal(str(producto_data.descuento))

                subtotal_producto_cotizado = (precio * cantidad) - (precio * cantidad * descuento) / Decimal("100.0")
                acumulado_subtotal += subtotal_producto_cotizado
                
                producto_dict = producto_data.model_dump()
                producto_dict['cotizacion_id'] = cotizacion_id
                producto_cotizado = ProductoCotizado(**producto_dict)
                db.add(producto_cotizado)

            totales = calcular_totales(
                acumulado_subtotal,
                Decimal(str(cotizacion.descuento_general)),
                Decimal(str(cotizacion.gastos_envio)),
                emisor,
                cliente
            )

            cotizacion.subtotal = totales["subtotal"]
            cotizacion.iva = totales["iva"]
            cotizacion.isr_ret = totales["isr_ret"]
            cotizacion.total = totales["total"]

        db.commit()
        db.refresh(cotizacion)

        return CotizacionReadSchema.model_validate(cotizacion)

    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al actualizar la cotización: {str(e)}"
        )

async def delete_cotizacion(db: Session, cotizacion_id: int) -> dict:
    try:
        cotizacion = (
            db.query(Cotizacion)
            .filter(Cotizacion.id == cotizacion_id)
            .first()
        )
        if not cotizacion:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Cotización no encontrada"
            )

        db.delete(cotizacion)
        db.commit()

        return {"detail": "Cotización eliminada exitosamente"}
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al eliminar la cotización: {str(e)}"
        )