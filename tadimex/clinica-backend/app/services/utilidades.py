# app/services/utilidades.py

from typing import List, Dict
from decimal import Decimal
from sqlalchemy.orm import Session
from sqlalchemy import and_, func
from app.models.sql.salida_venta import SalidaVenta
from app.models.sql.producto_vendido import ProductoVendido
from app.models.sql.producto import Producto
from app.models.sql.salida_inventario import SalidaInventario
from app.models.sql.movimiento_inventario import MovimientoInventario
from app.models.sql.inventario import Inventarios
from app.models.sql.almacen import Almacen
from app.models.sql.cliente import Cliente
from app.schemas.utilidades import (
  UtilidadProductoSchema,
  ResumenUtilidadesSchema,
  FiltrosUtilidadesSchema,
  UtilidadesResponseSchema
)

def calcular_utilidades(db: Session, filtros: FiltrosUtilidadesSchema) -> UtilidadesResponseSchema:
  """
    Calcula las utilidades basado en los filtros proporcionados.
  """
  # 1. Construir la query base
  query = db.query(ProductoVendido, Inventarios).join(
      SalidaVenta
  ).join(
      SalidaInventario
  ).join(
      MovimientoInventario
  ).join(
      Producto
  ).join(
      Inventarios, 
      and_(
          Inventarios.producto_id == ProductoVendido.producto_id,
          Inventarios.almacen_id == ProductoVendido.almacen_id
      )
  ).join(
      Almacen, Almacen.id == Inventarios.almacen_id
  )

  # 2. Aplicar filtros
  query = query.filter(MovimientoInventario.estado == "completado")

  # Filtro por fechas
  if filtros.fecha_inicio:
    query = query.filter(MovimientoInventario.created_at >= filtros.fecha_inicio)
  if filtros.fecha_fin:
    query = query.filter(MovimientoInventario.created_at <= filtros.fecha_fin)

  # Filtro por almacén
  if filtros.almacen_id:
    query = query.filter(ProductoVendido.almacen_id == filtros.almacen_id)
  
  # Filtro por sucursal
  if filtros.sucursal_id:
    query = query.filter(Almacen.sucursal_id == filtros.sucursal_id)
  
  # Filtro por cliente
  if filtros.cliente_id:
    query = query.filter(SalidaVenta.cliente_id == filtros.cliente_id)

  # 3. Ejecutar la query
  resultados = query.all()

  # Si no hay datos devolver respuesta vacia
  if not resultados:
    return UtilidadesResponseSchema(
      resumen = ResumenUtilidadesSchema(
        total_ventas = Decimal("0"),
        total_utilidades = Decimal("0"),
        margen_promedio_general = Decimal("0"),
        numero_ventas_total=0,
        numero_productos_vendidos=0,
        producto_mas_rentable=None, 
        producto_menos_rentable=None, 
        periodo_inicio=filtros.fecha_inicio,
        periodo_fin=filtros.fecha_fin
      ),
      productos=[],
      filtros_aplicados=filtros
    )

  # 4. Agrupar por productos y calcular utilidades
  productos_agrupados = {}

  for pv, inventario in resultados: 
    producto_id = pv.producto_id
    
    # Calcular utilidad: precio_venta - precio_compra
    precio_compra = inventario.costo_promedio
    precio_venta = pv.costo_unitario
    utilidad_unitaria = precio_venta - precio_compra
    utilidad_total = utilidad_unitaria * pv.cantidad

    if producto_id not in productos_agrupados:
      productos_agrupados[producto_id] = {
        'producto_nombre': pv.producto.name,
        'cantidad_total': 0, 
        'utilidad_total': Decimal('0'), 
        'suma_precios_compra': Decimal('0'),
        'suma_precios_venta': Decimal('0'),
        'numero_ventas': 0,
        'clientes': {}  # Diccionario de clientes que compraron este producto
      }

    #Acumular datos
    productos_agrupados[producto_id]['cantidad_total'] += pv.cantidad
    productos_agrupados[producto_id]['utilidad_total'] += utilidad_total
    productos_agrupados[producto_id]['suma_precios_compra'] += (precio_compra * pv.cantidad)
    productos_agrupados[producto_id]['suma_precios_venta'] += (precio_venta * pv.cantidad)
    productos_agrupados[producto_id]['numero_ventas'] += 1
    
    # Agregar información del cliente si existe
    if hasattr(pv, 'salida_venta') and pv.salida_venta and pv.salida_venta.cliente:
      cliente_id = pv.salida_venta.cliente_id
      cliente_nombre = pv.salida_venta.cliente.nombre_fiscal
      
      if cliente_id not in productos_agrupados[producto_id]['clientes']:
        productos_agrupados[producto_id]['clientes'][cliente_id] = {
          'cliente_id': cliente_id,
          'cliente_nombre': cliente_nombre,
          'cantidad_comprada': 0
        }
      
      productos_agrupados[producto_id]['clientes'][cliente_id]['cantidad_comprada'] += pv.cantidad

  # 5. Calcular promedios y crear lista de productos
  lista_productos = []
  total_ventas = Decimal('0')
  total_utilidades = Decimal('0')

  for producto_id, datos in productos_agrupados.items():
    # Calcular promedios
    precio_compra_promedio = datos['suma_precios_compra']/datos['cantidad_total']
    precio_venta_promedio = datos['suma_precios_venta']/datos['cantidad_total']
    margen_promedio = ((datos['utilidad_total']/datos['suma_precios_compra']) * 100) if datos['suma_precios_compra'] > 0 else Decimal('0')

    #Crear objeto del producto
    producto_utilidad = UtilidadProductoSchema(
      producto_id = producto_id, 
      producto_nombre = datos['producto_nombre'], 
      cantidad_vendida_total= datos['cantidad_total'],
      precio_compra_promedio=precio_compra_promedio,
      precio_venta_promedio=precio_venta_promedio,
      utilidad_total=datos['utilidad_total'],
      margen_promedio=margen_promedio,
      numero_ventas=datos['numero_ventas'],
      clientes=list(datos['clientes'].values()) if datos['clientes'] else []
    )

    lista_productos.append(producto_utilidad)

    # Acumular totales generales
    total_ventas += datos['suma_precios_venta']
    total_utilidades += datos['utilidad_total']

  # 6. Calcular resumen general
  margen_general = ((total_utilidades / (total_ventas - total_utilidades)) * 100) if (total_ventas - total_utilidades) > 0 else Decimal('0')

  # Encontrar productos más y menos rentables
  producto_mas_rentable = max(lista_productos, key=lambda p: p.utilidad_total).producto_nombre if lista_productos else None
  producto_menos_rentable = min(lista_productos, key=lambda p: p.utilidad_total).producto_nombre if lista_productos else None

  # Crear resumen
  resumen = ResumenUtilidadesSchema(
    total_ventas=total_ventas, 
    total_utilidades=total_utilidades, 
    margen_promedio_general=margen_general,
    numero_ventas_total=len(resultados),
    numero_productos_vendidos=len(lista_productos),
    producto_mas_rentable=producto_mas_rentable,
    producto_menos_rentable=producto_menos_rentable,
    periodo_inicio=filtros.fecha_inicio,
    periodo_fin=filtros.fecha_fin
  )

  # Retornar respuesta completa
  return UtilidadesResponseSchema (
    resumen = resumen, 
    productos=lista_productos,
    filtros_aplicados=filtros
  )

def obtener_top_productos(db: Session, filtros: FiltrosUtilidadesSchema, tipo: str, cantidad: int) -> Dict:
  """
  Obtiene el top de productos más o menos rentables
  
  Args:
    db: Sesión de base de datos
    filtros: Filtros aplicados
    tipo: 'mas_rentables' o 'menos_rentables'  
    cantidad: Número de productos a mostrar
  """
  
  # Reutilizar la lógica base de calcular_utilidades pero solo devolver productos ordenados
  query = db.query(ProductoVendido, Inventarios).join(
      SalidaVenta
  ).join(
      SalidaInventario
  ).join(
      MovimientoInventario
  ).join(
      Producto
  ).join(
      Inventarios, 
      and_(
          Inventarios.producto_id == ProductoVendido.producto_id,
          Inventarios.almacen_id == ProductoVendido.almacen_id
      )
  ).join(
      Almacen, Almacen.id == Inventarios.almacen_id
  )

  # Aplicar filtros
  query = query.filter(MovimientoInventario.estado == "completado")

  if filtros.fecha_inicio:
    query = query.filter(MovimientoInventario.created_at >= filtros.fecha_inicio)
  if filtros.fecha_fin:
    query = query.filter(MovimientoInventario.created_at <= filtros.fecha_fin)
  if filtros.almacen_id:
    query = query.filter(ProductoVendido.almacen_id == filtros.almacen_id)
  if filtros.sucursal_id:
    query = query.filter(Almacen.sucursal_id == filtros.sucursal_id)
  if filtros.cliente_id:
    query = query.filter(SalidaVenta.cliente_id == filtros.cliente_id)

  resultados = query.all()

  # Procesar resultados (igual que en calcular_utilidades)
  productos_agrupados = {}
  
  for producto_vendido, inventario in resultados:
    key = f"{producto_vendido.producto_id}_{producto_vendido.almacen_id}"
    
    if key not in productos_agrupados:
      productos_agrupados[key] = {
        'producto_id': producto_vendido.producto_id,
        'producto_nombre': producto_vendido.producto.name,
        'cantidad_vendida_total': 0,
        'precio_venta_total': Decimal('0'),
        'precio_compra_total': Decimal('0'),
        'cantidad_ventas': 0
      }
    
    productos_agrupados[key]['cantidad_vendida_total'] += producto_vendido.cantidad
    productos_agrupados[key]['precio_venta_total'] += producto_vendido.costo_unitario * producto_vendido.cantidad
    productos_agrupados[key]['precio_compra_total'] += inventario.costo_promedio * producto_vendido.cantidad
    productos_agrupados[key]['cantidad_ventas'] += 1

  # Calcular utilidades
  lista_productos = []
  for data in productos_agrupados.values():
    precio_venta_promedio = data['precio_venta_total'] / data['cantidad_vendida_total'] if data['cantidad_vendida_total'] > 0 else Decimal('0')
    precio_compra_promedio = data['precio_compra_total'] / data['cantidad_vendida_total'] if data['cantidad_vendida_total'] > 0 else Decimal('0')
    utilidad_total = data['precio_venta_total'] - data['precio_compra_total']
    margen_promedio = (utilidad_total / data['precio_venta_total'] * 100) if data['precio_venta_total'] > 0 else Decimal('0')

    producto = UtilidadProductoSchema(
      producto_id=data['producto_id'],
      producto_nombre=data['producto_nombre'],
      cantidad_vendida_total=data['cantidad_vendida_total'],
      precio_compra_promedio=str(precio_compra_promedio),
      precio_venta_promedio=str(precio_venta_promedio),
      utilidad_total=str(utilidad_total),
      margen_promedio=str(margen_promedio),
      numero_ventas=data['cantidad_ventas']
    )
    lista_productos.append(producto)

  # Ordenar según el tipo solicitado
  if tipo == "mas_rentables":
    lista_productos.sort(key=lambda x: float(x.utilidad_total), reverse=True)
  else:  # menos_rentables
    lista_productos.sort(key=lambda x: float(x.utilidad_total))

  # Limitar cantidad
  lista_productos = lista_productos[:cantidad]

  return {
    "tipo": tipo,
    "cantidad_solicitada": cantidad,
    "productos": lista_productos,
    "filtros_aplicados": filtros
  }


