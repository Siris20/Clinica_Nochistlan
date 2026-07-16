# app/services/compra_inventario.py

from typing import List
from decimal import Decimal
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.sql.movimiento_inventario import MovimientoInventario
from app.models.sql.entrada_inventario import EntradaInventario
from app.models.sql.entrada_compra import EntradaCompra
from app.models.sql.producto_comprado import ProductoComprado
from app.models.sql.producto import Producto
from app.schemas.entrada_compra import CompraInventarioCreateSchema, ProductoCompradoCreateSchema, CompraReadSchema, ProductoCompradoReadSchema
from app.models.sql.enums import TipoEntrada
from app.services.inventario import actualizar_stock_producto
from sqlalchemy import desc
from app.models.sql.almacen import Almacen
from app.models.sql.sucursal import Sucursal
from app.models.sql.enums import EstadoMovimiento

def get_model_columns(model):
    return set(model.__table__.columns.keys())

async def create_compra_inventario(db: Session, compra_data: CompraInventarioCreateSchema):
    try:
        # 1. Crear MovimientoInventario solo con campos enviados y no None
        movimiento_dict = {}
        movimiento_fields = get_model_columns(MovimientoInventario)
        for field, value in compra_data.model_dump().items():
            if value is not None and field in movimiento_fields:
                movimiento_dict[field] = value
        movimiento = MovimientoInventario(**movimiento_dict)
        db.add(movimiento)
        db.flush()

        # 2. Crear EntradaInventario solo con campos enviados y no None
        entrada_dict = {
            'movimiento_id': movimiento.id,
            'tipo_entrada': TipoEntrada.COMPRA
        }
        entrada_fields = get_model_columns(EntradaInventario)
        for field, value in compra_data.model_dump().items():
            if value is not None and field in entrada_fields:
                entrada_dict[field] = value
        entrada = EntradaInventario(**entrada_dict)
        db.add(entrada)
        db.flush()

        # 3. Crear EntradaCompra solo con campos enviados y no None
        compra_dict = {'entrada_inventario_id': entrada.id}
        compra_fields = get_model_columns(EntradaCompra)
        for field, value in compra_data.model_dump().items():
            if value is not None and field in compra_fields:
                compra_dict[field] = value
        compra = EntradaCompra(**compra_dict)
        db.add(compra)
        db.flush()

        # 4. Procesar productos comprados
        productos = []
        total_cantidad = sum(p.cantidad for p in compra_data.productos_comprados)
        costo_envio_unitario = (compra_data.costo_envio or Decimal("0.00")) / total_cantidad if total_cantidad else Decimal("0.00")

        for p in compra_data.productos_comprados:
            producto = db.query(Producto).filter(Producto.id == p.producto_id).first()
            if not producto:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Producto con id {p.producto_id} no encontrado"
                )
            # Calcular precio con IVA si corresponde
            precio_unitario = p.precio_unitario
            if not p.incluye_iva:
                precio_unitario = precio_unitario * Decimal("1.16")
            precio_unitario += costo_envio_unitario

            producto_dict = {
                'entrada_compra_id': compra.id, 
                'producto_id': p.producto_id, 
                'cantidad': p.cantidad, 
                'costo_unitario': precio_unitario,
                # Almacenar datos originales
                'precio_unitario_original': p.precio_unitario,
                'incluye_iva_original': p.incluye_iva
            }
            # Si hay más campos en ProductoComprado y vienen en la solicitud, agrégalos
            pc_fields = get_model_columns(ProductoComprado)
            for field, value in p.model_dump().items():
                if value is not None and field in pc_fields and field not in producto_dict:
                    producto_dict[field] = value
            producto_comprado = ProductoComprado(**producto_dict)
            db.add(producto_comprado)
            productos.append(producto_comprado)

        # Si el estado del movimiento es COMPLETADO, actualizar inventario
        from app.models.sql.enums import EstadoMovimiento
        if movimiento.estado == EstadoMovimiento.COMPLETADO:
            for p in productos:
                actualizar_stock_producto(
                    db=db,
                    producto_id=p.producto_id,
                    almacen_id=entrada.almacen_id,
                    cantidad=p.cantidad,
                    costo_unitario=p.costo_unitario,
                    fecha_recepcion=entrada.fecha_recepcion,
                    afectar_costo_promedio=True  # Las compras SÍ deben afectar el costo promedio
                )

        db.commit()

        # Consultar los modelos relacionados para armar la respuesta
        movimiento_db = db.query(MovimientoInventario).get(movimiento.id)
        entrada_db = db.query(EntradaInventario).get(entrada.id)
        compra_db = db.query(EntradaCompra).get(compra.id)
        productos_db = db.query(ProductoComprado).filter(ProductoComprado.entrada_compra_id == compra.id).all()

        productos_response = []
        total = Decimal("0.00")
        for p in productos_db:
            importe = p.costo_unitario * p.cantidad
            total += importe
            productos_response.append(ProductoCompradoReadSchema.model_validate({
                "producto_id": p.producto_id,
                "cantidad": p.cantidad,
                "costo_unitario": p.costo_unitario,
                "importe": importe,
                "precio_unitario_original": p.precio_unitario_original,
                "incluye_iva_original": p.incluye_iva_original
            }))

        data = {
            "id": compra_db.id,
            # Movimiento
            "tipo_movimiento": movimiento_db.tipo_movimiento,
            "fecha_movimiento": movimiento_db.fecha_movimiento,
            "observaciones": movimiento_db.observaciones,
            "estado": movimiento_db.estado,
            "empleado_id": movimiento_db.empleado_id,
            # Entrada
            "tipo_entrada": entrada_db.tipo_entrada,
            "fecha_recepcion": entrada_db.fecha_recepcion,
            "almacen_id": entrada_db.almacen_id,
            # Compra
            "numero_factura": compra_db.numero_factura,
            "fecha_factura": compra_db.fecha_factura,
            "fecha_pago": compra_db.fecha_pago,
            "metodo_pago": compra_db.metodo_pago,
            "costo_envio": compra_db.costo_envio,
            "proveedor_id": compra_db.proveedor_id,
            # Productos
            "productos_comprados": productos_response,
            # Total
            "total": total,
            # Timestamps
            "created_at": getattr(compra_db, "created_at", None),
            "updated_at": getattr(compra_db, "updated_at", None)
        }
        return CompraReadSchema.model_validate(data)

    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al crear la compra: {str(e)}"
        )

# Servicio para obtener el historial de compras

def get_compras(db: Session, skip: int = 0, limit: int = 100, empresa_id: int = None, sucursal_id: int = None):
    query = (
        db.query(EntradaCompra)
        .join(EntradaInventario, EntradaCompra.entrada_inventario_id == EntradaInventario.id)
        .join(Almacen, EntradaInventario.almacen_id == Almacen.id)
        .join(Sucursal, Almacen.sucursal_id == Sucursal.id)
        .join(MovimientoInventario, EntradaInventario.movimiento_id == MovimientoInventario.id)
    )
    if empresa_id:
        query = query.filter(Sucursal.empresa_id == empresa_id)
    if sucursal_id:
        query = query.filter(Almacen.sucursal_id == sucursal_id)
    compras = (
        query
        .order_by(desc(MovimientoInventario.fecha_movimiento))
        .offset(skip)
        .limit(limit)
        .all()
    )
    result = []
    for compra_db in compras:
        entrada_db = db.query(EntradaInventario).get(compra_db.entrada_inventario_id)
        movimiento_db = db.query(MovimientoInventario).get(entrada_db.movimiento_id)
        productos_db = db.query(ProductoComprado).filter(ProductoComprado.entrada_compra_id == compra_db.id).all()
        productos_response = []
        total = Decimal("0.00")
        for p in productos_db:
            importe = p.costo_unitario * p.cantidad
            total += importe
            productos_response.append(ProductoCompradoReadSchema.model_validate({
                "producto_id": p.producto_id,
                "cantidad": p.cantidad,
                "costo_unitario": p.costo_unitario,
                "importe": importe,
                "precio_unitario_original": p.precio_unitario_original,
                "incluye_iva_original": p.incluye_iva_original
            }))
        data = {
            "id": compra_db.id,
            "tipo_movimiento": movimiento_db.tipo_movimiento,
            "fecha_movimiento": movimiento_db.fecha_movimiento,
            "observaciones": movimiento_db.observaciones,
            "estado": movimiento_db.estado,
            "empleado_id": movimiento_db.empleado_id,
            "tipo_entrada": entrada_db.tipo_entrada,
            "fecha_recepcion": entrada_db.fecha_recepcion,
            "almacen_id": entrada_db.almacen_id,
            "numero_factura": compra_db.numero_factura,
            "fecha_factura": compra_db.fecha_factura,
            "fecha_pago": compra_db.fecha_pago,
            "metodo_pago": compra_db.metodo_pago,
            "costo_envio": compra_db.costo_envio,
            "proveedor_id": compra_db.proveedor_id,
            "productos_comprados": productos_response,
            "total": total,
            "created_at": getattr(compra_db, "created_at", None),
            "updated_at": getattr(compra_db, "updated_at", None)
        }
        result.append(CompraReadSchema.model_validate(data))
    return result

# Servicio para obtener el detalle de una compra

def get_compra(db: Session, compra_id: int, empresa_id: int = None, sucursal_id: int = None):
    compra_db = db.query(EntradaCompra).get(compra_id)
    if not compra_db:
        return None
    entrada_db = db.query(EntradaInventario).get(compra_db.entrada_inventario_id)
    almacen_db = db.query(Almacen).get(entrada_db.almacen_id)
    sucursal_db = db.query(Sucursal).get(almacen_db.sucursal_id)
    if empresa_id and sucursal_db.empresa_id != empresa_id:
        return None
    if sucursal_id and almacen_db.sucursal_id != sucursal_id:
        return None
    movimiento_db = db.query(MovimientoInventario).get(entrada_db.movimiento_id)
    productos_db = db.query(ProductoComprado).filter(ProductoComprado.entrada_compra_id == compra_id).all()
    productos_response = []
    total = Decimal("0.00")
    for p in productos_db:
        importe = p.costo_unitario * p.cantidad
        total += importe
        productos_response.append(ProductoCompradoReadSchema.model_validate({
            "producto_id": p.producto_id,
            "cantidad": p.cantidad,
            "costo_unitario": p.costo_unitario,
            "importe": importe,
            "precio_unitario_original": p.precio_unitario_original,
            "incluye_iva_original": p.incluye_iva_original
        }))
    data = {
        "id": compra_db.id,
        "tipo_movimiento": movimiento_db.tipo_movimiento,
        "fecha_movimiento": movimiento_db.fecha_movimiento,
        "observaciones": movimiento_db.observaciones,
        "estado": movimiento_db.estado,
        "empleado_id": movimiento_db.empleado_id,
        "tipo_entrada": entrada_db.tipo_entrada,
        "fecha_recepcion": entrada_db.fecha_recepcion,
        "almacen_id": entrada_db.almacen_id,
        "numero_factura": compra_db.numero_factura,
        "fecha_factura": compra_db.fecha_factura,
        "fecha_pago": compra_db.fecha_pago,
        "metodo_pago": compra_db.metodo_pago,
        "costo_envio": compra_db.costo_envio,
        "proveedor_id": compra_db.proveedor_id,
        "productos_comprados": productos_response,
        "total": total,
        "created_at": getattr(compra_db, "created_at", None),
        "updated_at": getattr(compra_db, "updated_at", None)
    }
    return CompraReadSchema.model_validate(data)

async def update_compra(db: Session, compra_id: int, compra_data, productos_comprados_data=None):
    try:
        compra = db.query(EntradaCompra).get(compra_id)
        if not compra:
            return None
        entrada = db.query(EntradaInventario).get(compra.entrada_inventario_id)
        movimiento = db.query(MovimientoInventario).get(entrada.movimiento_id)

        # Guardar productos comprados originales para comparación
        productos_originales = db.query(ProductoComprado).filter(ProductoComprado.entrada_compra_id == compra_id).all()
        productos_originales_dict = {
            (p.producto_id, p.cantidad, p.precio_unitario_original, p.incluye_iva_original): p 
            for p in productos_originales
        }

        # Actualizar campos de compra
        compra_fields = set(EntradaCompra.__table__.columns.keys())
        for k, v in compra_data.model_dump(exclude_unset=True).items():
            if v is not None and k in compra_fields:
                setattr(compra, k, v)

        # Actualizar campos de entrada
        entrada_fields = set(EntradaInventario.__table__.columns.keys())
        for k, v in compra_data.model_dump(exclude_unset=True).items():
            if v is not None and k in entrada_fields:
                setattr(entrada, k, v)

        # Actualizar campos de movimiento
        movimiento_fields = set(MovimientoInventario.__table__.columns.keys())
        for k, v in compra_data.model_dump(exclude_unset=True).items():
            if v is not None and k in movimiento_fields:
                setattr(movimiento, k, v)

        # Actualizar productos comprados si se envía la lista
        productos_cambiaron = False
        if productos_comprados_data is not None:
            # Crear diccionario de nuevos productos para comparación usando datos originales
            productos_nuevos_dict = {}
            for p in productos_comprados_data:
                key = (p.producto_id, p.cantidad, p.precio_unitario, p.incluye_iva)
                productos_nuevos_dict[key] = p

            # Verificar si los productos realmente cambiaron
            if len(productos_originales_dict) != len(productos_nuevos_dict):
                productos_cambiaron = True
            else:
                for key in productos_originales_dict:
                    if key not in productos_nuevos_dict:
                        productos_cambiaron = True
                        break
                if not productos_cambiaron:
                    for key in productos_nuevos_dict:
                        if key not in productos_originales_dict:
                            productos_cambiaron = True
                            break

            # Si los productos cambiaron, revertir inventario anterior
            if productos_cambiaron and movimiento.estado == EstadoMovimiento.COMPLETADO:
                for p in productos_originales:
                    # Revertir el inventario restando las cantidades originales
                    actualizar_stock_producto(
                        db=db,
                        producto_id=p.producto_id,
                        almacen_id=entrada.almacen_id,
                        cantidad=-p.cantidad,  # Cantidad negativa para revertir
                        costo_unitario=p.costo_unitario,
                        fecha_recepcion=entrada.fecha_recepcion,
                        afectar_costo_promedio=False  # Al revertir compras, no recalcular costo promedio
                    )

            # Eliminar productos comprados existentes
            db.query(ProductoComprado).filter(ProductoComprado.entrada_compra_id == compra_id).delete()
            db.flush()
            
            # Calcular costo de envío unitario para nuevos productos
            total_cantidad = sum(p.cantidad for p in productos_comprados_data)
            costo_envio_unitario = (compra.costo_envio or Decimal("0.00")) / total_cantidad if total_cantidad else Decimal("0.00")
            
            # Insertar nuevos productos
            for p in productos_comprados_data:
                producto = db.query(Producto).filter(Producto.id == p.producto_id).first()
                if not producto:
                    raise HTTPException(
                        status_code=status.HTTP_404_NOT_FOUND,
                        detail=f"Producto con id {p.producto_id} no encontrado"
                    )
                
                # Calcular costo unitario final
                precio_unitario = p.precio_unitario
                if not p.incluye_iva:
                    precio_unitario = precio_unitario * Decimal("1.16")
                precio_unitario += costo_envio_unitario
                
                producto_dict = {
                    'entrada_compra_id': compra.id,
                    'producto_id': p.producto_id,
                    'cantidad': p.cantidad,
                    'costo_unitario': precio_unitario,
                    # Almacenar datos originales
                    'precio_unitario_original': p.precio_unitario,
                    'incluye_iva_original': p.incluye_iva
                }
                pc_fields = set(ProductoComprado.__table__.columns.keys())
                for field, value in p.model_dump().items():
                    if value is not None and field in pc_fields and field not in producto_dict:
                        producto_dict[field] = value
                producto_comprado = ProductoComprado(**producto_dict)
                db.add(producto_comprado)

        db.flush()

        # Si el estado del movimiento es COMPLETADO y los productos cambiaron, actualizar inventario
        if movimiento.estado == EstadoMovimiento.COMPLETADO and productos_cambiaron:
            productos = db.query(ProductoComprado).filter(ProductoComprado.entrada_compra_id == compra_id).all()
            for p in productos:
                actualizar_stock_producto(
                    db=db,
                    producto_id=p.producto_id,
                    almacen_id=entrada.almacen_id,
                    cantidad=p.cantidad,
                    costo_unitario=p.costo_unitario,
                    fecha_recepcion=entrada.fecha_recepcion,
                    afectar_costo_promedio=True  # Las compras SÍ deben afectar el costo promedio
                )

        db.commit()

        # Devuelve el detalle actualizado
        return get_compra(db, compra_id)

    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al actualizar la compra: {str(e)}"
        )