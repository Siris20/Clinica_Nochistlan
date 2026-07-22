from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from decimal import Decimal
from datetime import datetime, date, timedelta
from app.models.sql.inventario import Inventarios
from app.models.sql.almacen import Almacen
from app.models.sql.sucursal import Sucursal
from app.models.sql.movimiento_inventario import MovimientoInventario
from app.models.sql.entrada_inventario import EntradaInventario
from sqlalchemy import and_
from app.models.sql.enums import EstadoMovimiento, TipoMovimiento
from app.models.sql.entrada_compra import EntradaCompra
from app.models.sql.producto_comprado import ProductoComprado

def actualizar_stock_producto(
    db: Session,
    producto_id: int,
    almacen_id: int,
    cantidad: int,
    costo_unitario: Decimal,
    fecha_recepcion: date | None = None,
    afectar_costo_promedio: bool = True  # Nueva bandera para controlar si afecta el costo promedio
):
    inventario = db.query(Inventarios).filter_by(producto_id=producto_id, almacen_id=almacen_id).first()
    if inventario:
        # Actualizar cantidad y costo promedio ponderado SOLO si es una entrada (cantidad positiva) Y se permite afectar el costo
        cantidad_anterior = inventario.cantidad_actual
        costo_anterior = inventario.costo_promedio
        nueva_cantidad = cantidad_anterior + cantidad
        
        # Solo recalcular costo promedio si es una entrada (cantidad positiva), se permite afectarlo y el costo es > 0
        if cantidad > 0 and nueva_cantidad > 0 and afectar_costo_promedio and costo_unitario > 0:
            # Si hay stock positivo y es una entrada, calcular costo promedio ponderado
            inventario.costo_promedio = (
                (costo_anterior * cantidad_anterior + costo_unitario * cantidad) / nueva_cantidad
            )
        # Si es una salida (cantidad negativa), mantener el costo promedio anterior
        # No recalcular el costo promedio en las ventas
        
        inventario.cantidad_actual = nueva_cantidad
        if fecha_recepcion and cantidad > 0:  # Solo actualizar fecha de entrada si es una entrada
            inventario.fecha_ultima_entrada = fecha_recepcion
        inventario.fecha_ultima_actualizacion = datetime.now()
    else:
        # Si no existe inventario y la cantidad es negativa, no crear registro
        if cantidad < 0:
            return None
            
        inventario = Inventarios(
            producto_id=producto_id,
            almacen_id=almacen_id,
            cantidad_actual=cantidad,
            costo_promedio=costo_unitario,
            fecha_ultima_entrada=fecha_recepcion if fecha_recepcion else None,
            fecha_ultima_actualizacion=datetime.now()
        )
        db.add(inventario)
    
    return inventario

def get_stock_producto(db: Session, producto_id: int):
    inventarios = db.query(Inventarios).filter(Inventarios.producto_id == producto_id).all()
    existencias_totales = sum(inv.cantidad_actual for inv in inventarios)
    valor_total = sum(inv.cantidad_actual * inv.costo_promedio for inv in inventarios)
    almacenes = [
        {
            "almacen_id": inv.almacen_id,
            "cantidad": inv.cantidad_actual,
            "valor": inv.cantidad_actual * inv.costo_promedio
        }
        for inv in inventarios
    ]
    return {
        "producto_id": producto_id,
        "existencias_totales": existencias_totales,
        "valor_total": valor_total,
        "almacenes": almacenes
    }

def get_stock_almacen(db: Session, almacen_id: int):
    inventarios = db.query(Inventarios).filter(Inventarios.almacen_id == almacen_id).all()
    existencias_totales = sum(inv.cantidad_actual for inv in inventarios)
    valor_total = sum(inv.cantidad_actual * inv.costo_promedio for inv in inventarios)
    productos = [
        {
            "producto_id": inv.producto_id,
            "cantidad": inv.cantidad_actual,
            "valor": inv.cantidad_actual * inv.costo_promedio
        }
        for inv in inventarios
    ]
    return {
        "almacen_id": almacen_id,
        "existencias_totales": existencias_totales,
        "valor_total": valor_total,
        "productos": productos
    }

def get_stock_producto_empresa(db: Session, producto_id: int, empresa_id: int):
    # Join Inventarios -> Almacen -> Sucursal -> Empresa
    inventarios = (
        db.query(Inventarios)
        .join(Almacen, Inventarios.almacen_id == Almacen.id)
        .join(Sucursal, Almacen.sucursal_id == Sucursal.id)
        .filter(Sucursal.empresa_id == empresa_id, Inventarios.producto_id == producto_id)
        .all()
    )
    existencias_totales = sum(inv.cantidad_actual for inv in inventarios)
    valor_total = sum(inv.cantidad_actual * inv.costo_promedio for inv in inventarios)
    almacenes = [
        {
            "almacen_id": inv.almacen_id,
            "cantidad": inv.cantidad_actual,
            "valor": inv.cantidad_actual * inv.costo_promedio
        }
        for inv in inventarios
    ]
    return {
        "empresa_id": empresa_id,
        "producto_id": producto_id,
        "existencias_totales": existencias_totales,
        "valor_total": valor_total,
        "almacenes": almacenes
    }

def get_stock_producto_sucursal(db: Session, producto_id: int, sucursal_id: int):
    inventarios = (
        db.query(Inventarios)
        .join(Almacen, Inventarios.almacen_id == Almacen.id)
        .filter(Almacen.sucursal_id == sucursal_id, Inventarios.producto_id == producto_id)
        .all()
    )
    existencias_totales = sum(inv.cantidad_actual for inv in inventarios)
    valor_total = sum(inv.cantidad_actual * inv.costo_promedio for inv in inventarios)
    almacenes = [
        {
            "almacen_id": inv.almacen_id,
            "cantidad": inv.cantidad_actual,
            "valor": inv.cantidad_actual * inv.costo_promedio
        }
        for inv in inventarios
    ]
    return {
        "sucursal_id": sucursal_id,
        "producto_id": producto_id,
        "existencias_totales": existencias_totales,
        "valor_total": valor_total,
        "almacenes": almacenes
    }







def get_movimientos_recientes(
    db: Session,
    tipo_movimiento: str = None,
    estado: str = None,
    empresa_id: int = None,
    sucursal_id: int = None,
    almacen_id: int = None,
    producto_id: int = None,
    dias: int = 30
):
    hace_n_dias = datetime.now() - timedelta(days=dias)
    query = db.query(MovimientoInventario).join(EntradaInventario, MovimientoInventario.id == EntradaInventario.movimiento_id)
    if almacen_id:
        query = query.filter(EntradaInventario.almacen_id == almacen_id)
    if sucursal_id:
        query = query.join(Almacen, EntradaInventario.almacen_id == Almacen.id).filter(Almacen.sucursal_id == sucursal_id)
    if empresa_id:
        query = query.join(Almacen, EntradaInventario.almacen_id == Almacen.id).join(Sucursal, Almacen.sucursal_id == Sucursal.id).filter(Sucursal.empresa_id == empresa_id)
    if tipo_movimiento:
        query = query.filter(MovimientoInventario.tipo_movimiento == tipo_movimiento)
    if estado:
        query = query.filter(MovimientoInventario.estado == estado)
    if producto_id:
        query = query.join(EntradaCompra, EntradaInventario.id == EntradaCompra.entrada_inventario_id)
        query = query.join(ProductoComprado, EntradaCompra.id == ProductoComprado.entrada_compra_id)
        query = query.filter(ProductoComprado.producto_id == producto_id)
        pass
    query = query.filter(MovimientoInventario.fecha_movimiento >= hace_n_dias)
    return query.count()

def get_stock_productos_almacen(db: Session, almacen_id: int):
    inventarios = db.query(Inventarios).filter(Inventarios.almacen_id == almacen_id).all()
    productos = []
    valor_total = Decimal("0.00")
    stock_total = 0
    ultima_actualizacion = None
    for inv in inventarios:
        importe = inv.cantidad_actual * inv.costo_promedio
        valor_total += importe
        stock_total += inv.cantidad_actual
        if not ultima_actualizacion or (inv.fecha_ultima_actualizacion and inv.fecha_ultima_actualizacion > ultima_actualizacion):
            ultima_actualizacion = inv.fecha_ultima_actualizacion
        productos.append({
            "producto_id": inv.producto_id,
            "cantidad": inv.cantidad_actual,
            "costo_promedio": inv.costo_promedio,
            "importe": importe,
            "ultima_actualizacion": inv.fecha_ultima_actualizacion
        })
    movimientos_recientes = get_movimientos_recientes(db, almacen_id=almacen_id)
    return {
        "almacen_id": almacen_id,
        "productos": productos,
        "valor_total": valor_total,
        "stock_total": stock_total,
        "ultima_actualizacion": ultima_actualizacion,
        "movimientos_recientes": movimientos_recientes
    }

def get_stock_productos_sucursal(db: Session, sucursal_id: int):
    almacenes = db.query(Almacen).filter(Almacen.sucursal_id == sucursal_id).all()
    resultado = []
    valor_total = Decimal("0.00")
    stock_total = 0
    ultima_actualizacion = None
    movimientos_recientes = get_movimientos_recientes(db, sucursal_id=sucursal_id)
    for almacen in almacenes:
        datos = get_stock_productos_almacen(db, almacen.id)
        resultado.append({
            "almacen_id": almacen.id,
            **datos
        })
        valor_total += datos["valor_total"]
        stock_total += datos["stock_total"]
        if not ultima_actualizacion or (datos["ultima_actualizacion"] and datos["ultima_actualizacion"] > ultima_actualizacion):
            ultima_actualizacion = datos["ultima_actualizacion"]
    return {
        "sucursal_id": sucursal_id,
        "almacenes": resultado,
        "valor_total": valor_total,
        "stock_total": stock_total,
        "ultima_actualizacion": ultima_actualizacion,
        "movimientos_recientes": movimientos_recientes
    }

def get_stock_productos(db: Session, empresa_id: int):
    sucursales = db.query(Sucursal).filter(Sucursal.empresa_id == empresa_id).all()
    valor_total = Decimal("0.00")
    stock_total = 0
    ultima_actualizacion = None
    almacenes_resultado = []
    movimientos_recientes = get_movimientos_recientes(db, empresa_id=empresa_id)
    for sucursal in sucursales:
        datos = get_stock_productos_sucursal(db, sucursal.id)
        almacenes_resultado.extend(datos["almacenes"])
        valor_total += datos["valor_total"]
        stock_total += datos["stock_total"]
        if not ultima_actualizacion or (datos["ultima_actualizacion"] and datos["ultima_actualizacion"] > ultima_actualizacion):
            ultima_actualizacion = datos["ultima_actualizacion"]
    return {
        "empresa_id": empresa_id,
        "almacenes": almacenes_resultado,
        "valor_total": valor_total,
        "stock_total": stock_total,
        "ultima_actualizacion": ultima_actualizacion,
        "movimientos_recientes": movimientos_recientes
    }

def get_movimientos_compras_recientes(db: Session, empresa_id: int = None, sucursal_id: int = None, almacen_id: int = None):
    hace_30_dias = datetime.now() - timedelta(days=30)
    query = db.query(MovimientoInventario).join(EntradaInventario, MovimientoInventario.id == EntradaInventario.movimiento_id)
    if almacen_id:
        query = query.filter(EntradaInventario.almacen_id == almacen_id)
    if sucursal_id:
        query = query.join(Almacen, EntradaInventario.almacen_id == Almacen.id).filter(Almacen.sucursal_id == sucursal_id)
    if empresa_id:
        query = query.join(Almacen, EntradaInventario.almacen_id == Almacen.id).join(Sucursal, Almacen.sucursal_id == Sucursal.id).filter(Sucursal.empresa_id == empresa_id)
    query = query.filter(
        MovimientoInventario.estado == EstadoMovimiento.COMPLETADO,
        MovimientoInventario.tipo_movimiento == TipoMovimiento.ENTRADA,
        MovimientoInventario.fecha_movimiento >= hace_30_dias
    )
    count = query.count()
    return {
        "movimientos_compras_recientes": count
    }
