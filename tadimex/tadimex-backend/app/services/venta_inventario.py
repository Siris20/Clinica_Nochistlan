# app/services/venta_inventario.py

from typing import List
from decimal import Decimal
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.sql.movimiento_inventario import MovimientoInventario
from app.models.sql.salida_inventario import SalidaInventario
from app.models.sql.salida_venta import SalidaVenta
from app.models.sql.producto_vendido import ProductoVendido
from app.models.sql.producto import Producto
from app.models.sql.inventario import Inventarios
from app.schemas.salida_venta import VentaInventarioCreateSchema, ProductoVendidoCreateSchema, VentaReadSchema, ProductoVendidoReadSchema, VentaInventarioUpdateSchema
from app.models.sql.enums import TipoSalida
from app.services.inventario import actualizar_stock_producto
from sqlalchemy import desc
from app.models.sql.almacen import Almacen
from app.models.sql.sucursal import Sucursal
from app.models.sql.cliente import Cliente
from app.models.sql.enums import EstadoCliente
from app.models.sql.enums import EstadoMovimiento, TipoMovimiento

def get_model_columns(model):
    return set(model.__table__.columns.keys())

async def create_venta_inventario(db: Session, venta_data: VentaInventarioCreateSchema):
    try:
        # Validar que el empleado existe
        from app.models.sql.empleado import Empleado
        empleado = db.query(Empleado).filter(Empleado.id == venta_data.empleado_id).first()
        if not empleado:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Empleado con id {venta_data.empleado_id} no encontrado"
            )

        # Validar stock disponible para cada producto antes de crear la venta
        stock_insuficiente = []
        for p in venta_data.productos_vendidos:
            # Verificar stock en el almacén específico
            inventario = db.query(Inventarios).filter_by(
                producto_id=p.producto_id, 
                almacen_id=p.almacen_id
            ).first()
            
            stock_actual = inventario.cantidad_actual if inventario else 0
            if stock_actual < p.cantidad:
                # Obtener información del producto para el mensaje de error
                producto = db.query(Producto).filter(Producto.id == p.producto_id).first()
                nombre_producto = producto.name if producto else f"ID {p.producto_id}"
                stock_insuficiente.append({
                    "producto": nombre_producto,
                    "producto_id": p.producto_id,
                    "almacen_id": p.almacen_id,
                    "stock_actual": stock_actual,
                    "cantidad_solicitada": p.cantidad
                })
        
        if stock_insuficiente:
            error_details = []
            for item in stock_insuficiente:
                error_details.append(
                    f"Producto '{item['producto']}' (ID: {item['producto_id']}) en almacén {item['almacen_id']}: "
                    f"Stock actual: {item['stock_actual']}, Cantidad solicitada: {item['cantidad_solicitada']}"
                )
            
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Stock insuficiente para los siguientes productos: {'; '.join(error_details)}"
            )

        # 1. Crear MovimientoInventario solo con campos enviados y no None
        movimiento_dict = {}
        movimiento_fields = get_model_columns(MovimientoInventario)
        for field, value in venta_data.model_dump().items():
            if value is not None and field in movimiento_fields:
                movimiento_dict[field] = value
        
        # Forzar tipo_movimiento a SALIDA y estado a COMPLETADO por defecto para ventas
        movimiento_dict['tipo_movimiento'] = TipoMovimiento.SALIDA
        if 'estado' not in movimiento_dict or movimiento_dict['estado'] is None:
            movimiento_dict['estado'] = EstadoMovimiento.COMPLETADO
        
        movimiento = MovimientoInventario(**movimiento_dict)
        db.add(movimiento)
        db.flush()

        # 2. Crear SalidaInventario solo con campos enviados y no None
        salida_dict = {
            'movimiento_id': movimiento.id,
            'tipo_salida': TipoSalida.VENTA
        }
        salida_fields = get_model_columns(SalidaInventario)
        for field, value in venta_data.model_dump().items():
            if value is not None and field in salida_fields:
                salida_dict[field] = value
        salida = SalidaInventario(**salida_dict)
        db.add(salida)
        db.flush()

        # 3. Crear SalidaVenta solo con campos enviados y no None
        venta_dict = {'salida_inventario_id': salida.id}
        venta_fields = get_model_columns(SalidaVenta)
        for field, value in venta_data.model_dump().items():
            if value is not None and field in venta_fields:
                venta_dict[field] = value
        venta = SalidaVenta(**venta_dict)
        db.add(venta)
        db.flush()

        # 4. Procesar productos vendidos
        productos = []
        total_cantidad = sum(p.cantidad for p in venta_data.productos_vendidos)
        costo_envio_unitario = (venta_data.costo_envio or Decimal("0.00")) / total_cantidad if total_cantidad else Decimal("0.00")

        for p in venta_data.productos_vendidos:
            producto = db.query(Producto).filter(Producto.id == p.producto_id).first()
            if not producto:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Producto con id {p.producto_id} no encontrado"
                )
            
            # El costo unitario ya viene calculado del frontend
            costo_unitario = p.costo_unitario + costo_envio_unitario
            
            # Aplicar IVA del 16% al precio de venta final
            # El frontend envía el precio sin IVA, aquí lo calculamos con IVA
            IVA_RATE = Decimal("0.16")
            costo_unitario_con_iva = costo_unitario * (1 + IVA_RATE)

            producto_dict = {
                'salida_venta_id': venta.id, 
                'producto_id': p.producto_id, 
                'cantidad': p.cantidad, 
                'costo_unitario': costo_unitario_con_iva,  # Guardamos el precio con IVA
                'precio_unitario_original': p.precio_unitario_original,  # Precio base sin IVA
                'incluye_iva_original': p.incluye_iva_original,  # Indica si incluye IVA
                'almacen_id': p.almacen_id
            }
            # Si hay más campos en ProductoVendido y vienen en la solicitud, agrégalos
            pv_fields = get_model_columns(ProductoVendido)
            for field, value in p.model_dump().items():
                if value is not None and field in pv_fields and field not in producto_dict:
                    producto_dict[field] = value
            producto_vendido = ProductoVendido(**producto_dict)
            db.add(producto_vendido)
            productos.append(producto_vendido)

        # Si el estado del movimiento es COMPLETADO, actualizar inventario (restar stock)
        if movimiento.estado == EstadoMovimiento.COMPLETADO:
            for p in productos:
                actualizar_stock_producto(
                    db=db,
                    producto_id=p.producto_id,
                    almacen_id=p.almacen_id,
                    cantidad=-p.cantidad,  # Cantidad negativa para restar del inventario
                    costo_unitario=p.costo_unitario,
                    fecha_recepcion=salida.fecha_salida,
                    afectar_costo_promedio=False  # Las ventas no deben afectar el costo promedio
                )
            if venta_data.cliente_id:
                cliente = db.query(Cliente).filter(Cliente.id == venta_data.cliente_id).first()
                if cliente and cliente.estado_cliente == EstadoCliente.PROSPECTO:
                    cliente.estado_cliente = EstadoCliente.CLIENTE
                    db.add(cliente)

        db.commit()

        # Consultar los modelos relacionados para armar la respuesta
        movimiento_db = db.query(MovimientoInventario).get(movimiento.id)
        salida_db = db.query(SalidaInventario).get(salida.id)
        venta_db = db.query(SalidaVenta).get(venta.id)
        productos_db = db.query(ProductoVendido).filter(ProductoVendido.salida_venta_id == venta.id).all()

        productos_response = []
        total = Decimal("0.00")
        for p in productos_db:
            importe = p.costo_unitario * p.cantidad
            total += importe
            
            # Obtener el precio de compra desde el producto (sell_price)
            producto = db.query(Producto).filter_by(id=p.producto_id).first()
            
            precio_compra_unitario = Decimal(str(producto.sell_price)) if producto and producto.sell_price else Decimal("0.00")
            utilidad_unitaria = p.costo_unitario - precio_compra_unitario
            utilidad_total = utilidad_unitaria * p.cantidad
            margen_porcentaje = (utilidad_unitaria / precio_compra_unitario * 100) if precio_compra_unitario > 0 else Decimal("0.00")
            
            productos_response.append(ProductoVendidoReadSchema.model_validate({
                "producto_id": p.producto_id,
                "cantidad": p.cantidad,
                "costo_unitario": p.costo_unitario,
                "precio_unitario_original": getattr(p, "precio_unitario_original", p.costo_unitario),
                "include_tax": getattr(p, "incluye_iva_original", True),
                "almacen_id": p.almacen_id,
                "importe": importe,
                "precio_compra_unitario": precio_compra_unitario,
                "utilidad_unitaria": utilidad_unitaria,
                "utilidad_total": utilidad_total,
                "margen_porcentaje": margen_porcentaje
            }))

        data = {
            "id": venta_db.id,
            # Movimiento
            "tipo_movimiento": movimiento_db.tipo_movimiento,
            "fecha_movimiento": movimiento_db.fecha_movimiento,
            "observaciones": movimiento_db.observaciones,
            "estado": movimiento_db.estado,
            "empleado_id": movimiento_db.empleado_id,
            # Salida
            "tipo_salida": salida_db.tipo_salida,
            "fecha_salida": salida_db.fecha_salida,
            # Venta
            "numero_factura": venta_db.numero_factura,
            "fecha_factura": venta_db.fecha_factura,
            "fecha_pago": venta_db.fecha_pago,
            "metodo_pago": venta_db.metodo_pago,
            "costo_envio": venta_db.costo_envio,
            "cliente_id": venta_db.cliente_id,
            "cotizacion_id": venta_db.cotizacion_id,
            # Productos
            "productos_vendidos": productos_response,
            # Total
            "total": total,
            # Timestamps
            "created_at": getattr(venta_db, "created_at", None),
            "updated_at": getattr(venta_db, "updated_at", None)
        }
        return VentaReadSchema.model_validate(data)

    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al crear la venta: {str(e)}"
        )

# Servicio para obtener el historial de ventas
def get_ventas(db: Session, skip: int = 0, limit: int = 100, empresa_id: int = None, sucursal_id: int = None):
    query = (
        db.query(SalidaVenta)
        .join(SalidaInventario, SalidaVenta.salida_inventario_id == SalidaInventario.id)
        .join(MovimientoInventario, SalidaInventario.movimiento_id == MovimientoInventario.id)
    )
    
    if empresa_id or sucursal_id:
        # Para filtrar por empresa/sucursal necesitamos usar los almacenes de los productos vendidos
        query = query.join(ProductoVendido, SalidaVenta.id == ProductoVendido.salida_venta_id)
        query = query.join(Almacen, ProductoVendido.almacen_id == Almacen.id)
        query = query.join(Sucursal, Almacen.sucursal_id == Sucursal.id)
        
        if empresa_id:
            query = query.filter(Sucursal.empresa_id == empresa_id)
        if sucursal_id:
            query = query.filter(Almacen.sucursal_id == sucursal_id)
    
    ventas = (
        query
        .order_by(desc(MovimientoInventario.fecha_movimiento))
        .offset(skip)
        .limit(limit)
        .all()
    )
    
    result = []
    for venta_db in ventas:
        salida_db = db.query(SalidaInventario).get(venta_db.salida_inventario_id)
        movimiento_db = db.query(MovimientoInventario).get(salida_db.movimiento_id)
        productos_db = db.query(ProductoVendido).filter(ProductoVendido.salida_venta_id == venta_db.id).all()
        
        productos_response = []
        total = Decimal("0.00")
        for p in productos_db:
            importe = p.costo_unitario * p.cantidad
            total += importe
            
            # Obtener el precio de compra desde el producto (sell_price)
            producto = db.query(Producto).filter_by(id=p.producto_id).first()
            
            precio_compra_unitario = Decimal(str(producto.sell_price)) if producto and producto.sell_price else Decimal("0.00")
            utilidad_unitaria = p.costo_unitario - precio_compra_unitario
            utilidad_total = utilidad_unitaria * p.cantidad
            margen_porcentaje = (utilidad_unitaria / precio_compra_unitario * 100) if precio_compra_unitario > 0 else Decimal("0.00")
            
            productos_response.append(ProductoVendidoReadSchema.model_validate({
                "producto_id": p.producto_id,
                "cantidad": p.cantidad,
                "costo_unitario": p.costo_unitario,  # Precio con IVA para la lista
                "precio_unitario_original": getattr(p, "precio_unitario_original", p.costo_unitario / Decimal("1.16")),
                "include_tax": getattr(p, "incluye_iva_original", True),
                "almacen_id": p.almacen_id,
                "importe": importe,
                "precio_compra_unitario": precio_compra_unitario,
                "utilidad_unitaria": utilidad_unitaria,
                "utilidad_total": utilidad_total,
                "margen_porcentaje": margen_porcentaje
            }))
            
        data = {
            "id": venta_db.id,
            "tipo_movimiento": movimiento_db.tipo_movimiento,
            "fecha_movimiento": movimiento_db.fecha_movimiento,
            "observaciones": movimiento_db.observaciones,
            "estado": movimiento_db.estado,
            "empleado_id": movimiento_db.empleado_id,
            "tipo_salida": salida_db.tipo_salida,
            "fecha_salida": salida_db.fecha_salida,
            "numero_factura": venta_db.numero_factura,
            "fecha_factura": venta_db.fecha_factura,
            "fecha_pago": venta_db.fecha_pago,
            "metodo_pago": venta_db.metodo_pago,
            "costo_envio": venta_db.costo_envio,
            "cliente_id": venta_db.cliente_id,
            "cotizacion_id": venta_db.cotizacion_id,
            "productos_vendidos": productos_response,
            "total": total,
            "created_at": getattr(venta_db, "created_at", None),
            "updated_at": getattr(venta_db, "updated_at", None)
        }
        result.append(VentaReadSchema.model_validate(data))
    return result

# Servicio para obtener el detalle de una venta
def get_venta(db: Session, venta_id: int, empresa_id: int = None, sucursal_id: int = None, for_editing: bool = False):
    venta_db = db.query(SalidaVenta).get(venta_id)
    if not venta_db:
        return None
        
    salida_db = db.query(SalidaInventario).get(venta_db.salida_inventario_id)
    movimiento_db = db.query(MovimientoInventario).get(salida_db.movimiento_id)
    productos_db = db.query(ProductoVendido).filter(ProductoVendido.salida_venta_id == venta_id).all()
    
    # Verificar permisos de empresa/sucursal si se especifican
    if empresa_id or sucursal_id:
        for p in productos_db:
            almacen_db = db.query(Almacen).get(p.almacen_id)
            sucursal_db = db.query(Sucursal).get(almacen_db.sucursal_id)
            if empresa_id and sucursal_db.empresa_id != empresa_id:
                return None
            if sucursal_id and almacen_db.sucursal_id != sucursal_id:
                return None
    
    productos_response = []
    total = Decimal("0.00")
    for p in productos_db:
        importe = p.costo_unitario * p.cantidad
        total += importe
        
        # Obtener el precio de compra desde el producto (sell_price)
        producto = db.query(Producto).filter_by(id=p.producto_id).first()
        
        precio_compra_unitario = Decimal(str(producto.sell_price)) if producto and producto.sell_price else Decimal("0.00")
        utilidad_unitaria = p.costo_unitario - precio_compra_unitario
        utilidad_total = utilidad_unitaria * p.cantidad
        margen_porcentaje = (utilidad_unitaria / precio_compra_unitario * 100) if precio_compra_unitario > 0 else Decimal("0.00")
        
        # Decidir qué precio mostrar según el contexto
        if for_editing:
            # Para edición: devolver precio sin IVA
            IVA_RATE = Decimal("1.16")
            precio_para_mostrar = p.costo_unitario / IVA_RATE
        else:
            # Para visualización: devolver precio con IVA (tal como está guardado)
            precio_para_mostrar = p.costo_unitario
        
        productos_response.append(ProductoVendidoReadSchema.model_validate({
            "producto_id": p.producto_id,
            "cantidad": p.cantidad,
            "costo_unitario": precio_para_mostrar,
            "precio_unitario_original": getattr(p, "precio_unitario_original", precio_para_mostrar / Decimal("1.16") if not for_editing else precio_para_mostrar),
            "include_tax": getattr(p, "incluye_iva_original", True),
            "almacen_id": p.almacen_id,
            "importe": importe,
            "precio_compra_unitario": precio_compra_unitario,
            "utilidad_unitaria": utilidad_unitaria,
            "utilidad_total": utilidad_total,
            "margen_porcentaje": margen_porcentaje
        }))
        
    data = {
        "id": venta_db.id,
        "tipo_movimiento": movimiento_db.tipo_movimiento,
        "fecha_movimiento": movimiento_db.fecha_movimiento,
        "observaciones": movimiento_db.observaciones,
        "estado": movimiento_db.estado,
        "empleado_id": movimiento_db.empleado_id,
        "tipo_salida": salida_db.tipo_salida,
        "fecha_salida": salida_db.fecha_salida,
        "numero_factura": venta_db.numero_factura,
        "fecha_factura": venta_db.fecha_factura,
        "fecha_pago": venta_db.fecha_pago,
        "metodo_pago": venta_db.metodo_pago,
        "costo_envio": venta_db.costo_envio,
        "cliente_id": venta_db.cliente_id,
        "cotizacion_id": venta_db.cotizacion_id,
        "productos_vendidos": productos_response,
        "total": total,
        "created_at": getattr(venta_db, "created_at", None),
        "updated_at": getattr(venta_db, "updated_at", None)
    }
    return VentaReadSchema.model_validate(data)

async def update_venta(db: Session, venta_id: int, venta_data, productos_vendidos_data=None):
    try:
        venta = db.query(SalidaVenta).get(venta_id)
        if not venta:
            return None
        salida = db.query(SalidaInventario).get(venta.salida_inventario_id)
        movimiento = db.query(MovimientoInventario).get(salida.movimiento_id)

        # Guardar productos vendidos originales para comparación
        productos_originales = db.query(ProductoVendido).filter(ProductoVendido.salida_venta_id == venta_id).all()
        productos_originales_dict = {
            (p.producto_id, p.cantidad, p.costo_unitario, p.almacen_id): p 
            for p in productos_originales
        }

        # Actualizar campos de venta
        venta_fields = set(SalidaVenta.__table__.columns.keys())
        for k, v in venta_data.model_dump(exclude_unset=True).items():
            if v is not None and k in venta_fields:
                setattr(venta, k, v)

        # Actualizar campos de salida
        salida_fields = set(SalidaInventario.__table__.columns.keys())
        for k, v in venta_data.model_dump(exclude_unset=True).items():
            if v is not None and k in salida_fields:
                setattr(salida, k, v)

        # Actualizar campos de movimiento
        movimiento_fields = set(MovimientoInventario.__table__.columns.keys())
        for k, v in venta_data.model_dump(exclude_unset=True).items():
            if v is not None and k in movimiento_fields:
                setattr(movimiento, k, v)

        # Actualizar productos vendidos si se envía la lista
        productos_cambiaron = False
        if productos_vendidos_data is not None:
            # Crear diccionario de nuevos productos para comparación
            productos_nuevos_dict = {}
            for p in productos_vendidos_data:
                key = (p.producto_id, p.cantidad, p.costo_unitario, p.almacen_id)
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
                    # Revertir el inventario sumando las cantidades originales (venta -> devolver stock)
                    # NO pasar costo_unitario para que no afecte el costo promedio
                    actualizar_stock_producto(
                        db=db,
                        producto_id=p.producto_id,
                        almacen_id=p.almacen_id,
                        cantidad=p.cantidad,  # Cantidad positiva para devolver al inventario
                        costo_unitario=Decimal("0"),  # No afectar costo promedio en reversos de ventas
                        fecha_recepcion=None,  # No cambiar fecha de entrada
                        afectar_costo_promedio=False  # Explícitamente no afectar el costo promedio
                    )

            # Eliminar productos vendidos existentes
            db.query(ProductoVendido).filter(ProductoVendido.salida_venta_id == venta_id).delete()
            db.flush()
            
            # Calcular costo de envío unitario para nuevos productos
            total_cantidad = sum(p.cantidad for p in productos_vendidos_data)
            costo_envio_unitario = (venta.costo_envio or Decimal("0.00")) / total_cantidad if total_cantidad else Decimal("0.00")
            
            # Insertar nuevos productos
            for p in productos_vendidos_data:
                producto = db.query(Producto).filter(Producto.id == p.producto_id).first()
                if not producto:
                    raise HTTPException(
                        status_code=status.HTTP_404_NOT_FOUND,
                        detail=f"Producto con id {p.producto_id} no encontrado"
                    )
                
                # Calcular costo unitario final
                costo_unitario = p.costo_unitario + costo_envio_unitario
                
                # Aplicar IVA del 16% al precio de venta final
                # El frontend envía el precio sin IVA, aquí lo calculamos con IVA
                IVA_RATE = Decimal("0.16")
                costo_unitario_con_iva = costo_unitario * (1 + IVA_RATE)
                
                producto_dict = {
                    'salida_venta_id': venta.id,
                    'producto_id': p.producto_id,
                    'cantidad': p.cantidad,
                    'costo_unitario': costo_unitario_con_iva,  # Guardamos el precio con IVA
                    'almacen_id': p.almacen_id
                }
                pv_fields = set(ProductoVendido.__table__.columns.keys())
                for field, value in p.model_dump().items():
                    if value is not None and field in pv_fields and field not in producto_dict:
                        producto_dict[field] = value
                producto_vendido = ProductoVendido(**producto_dict)
                db.add(producto_vendido)

        db.flush()

        # Si el estado del movimiento es COMPLETADO y los productos cambiaron, actualizar inventario
        if movimiento.estado == EstadoMovimiento.COMPLETADO and productos_cambiaron:
            productos = db.query(ProductoVendido).filter(ProductoVendido.salida_venta_id == venta_id).all()
            for p in productos:
                actualizar_stock_producto(
                    db=db,
                    producto_id=p.producto_id,
                    almacen_id=p.almacen_id,
                    cantidad=-p.cantidad,  # Cantidad negativa para restar del inventario
                    costo_unitario=p.costo_unitario,
                    fecha_recepcion=salida.fecha_salida,
                    afectar_costo_promedio=False  # Las ventas no deben afectar el costo promedio
                )
            if venta.cliente_id:
                cliente = db.query(Cliente).filter(Cliente.id == venta.cliente_id).first()
                if cliente and cliente.estado_cliente == EstadoCliente.PROSPECTO:
                    cliente.estado_cliente = EstadoCliente.CLIENTE
                    db.add(cliente)

        db.commit()

        # Devuelve el detalle actualizado (para edición)
        return get_venta(db, venta_id, for_editing=True)

    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al actualizar la venta: {str(e)}"
        )